"use client";

import { useEffect, useRef } from "react";

type Entry = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  src: string;
};

const VERT = `attribute vec2 a;varying vec2 vUv;void main(){vUv=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}`;

const FRAG = `precision highp float;
uniform sampler2D uTex;
uniform vec2 uTexSize;
uniform vec2 uView;
uniform vec2 uMouse;
uniform vec2 uScreen;
uniform float uTime;
varying vec2 vUv;
vec2 cover(vec2 uv){
  float viewAspect=uView.x/max(uView.y,1.0);
  float texAspect=uTexSize.x/max(uTexSize.y,1.0);
  if(viewAspect>texAspect){
    float scale=viewAspect/texAspect;
    uv.y=(uv.y-0.5)/scale+0.5;
  }else{
    float scale=texAspect/max(viewAspect,0.001);
    uv.x=(uv.x-0.5)/scale+0.5;
  }
  return uv;
}
void main(){
  vec2 screen=uScreen-vec2(0.5);
  vec2 aim=uMouse-vUv;
  float dist=length(aim);
  float px=dist*min(uView.x,uView.y);
  vec2 dir=aim/max(dist,0.001);
  float near=exp(-pow(px/120.0,2.0));
  float wave=sin(px*0.11-uTime*3.2)*near;
  vec2 pull=screen*0.035+dir*(near*0.028+wave*0.012);
  vec2 uv=cover(vUv-pull);
  float split=near*0.012;
  float r=texture2D(uTex,uv+vec2(split,0.0)).r;
  float g=texture2D(uTex,uv).g;
  float b=texture2D(uTex,uv-vec2(split,0.0)).b;
  vec3 color=vec3(r,g,b);
  color+=vec3(1.0,0.25,0.7)*near*0.18;
  color+=vec3(0.2,0.85,1.0)*near*0.08;
  gl_FragColor=vec4(clamp(color,0.0,1.0),1.0);
}`;

const entries = new Set<Entry>();
const textures = new Map<string, { texture: WebGLTexture; width: number; height: number }>();
const loading = new Map<string, Promise<void>>();
let mouseX = 0;
let mouseY = 0;
let hasPointer = false;
let listening = false;
let frame = 0;
let gl: WebGLRenderingContext | null = null;
let glCanvas: HTMLCanvasElement | null = null;
let position = -1;
let resolutionLoc: WebGLUniformLocation | null = null;
let texSizeLoc: WebGLUniformLocation | null = null;
let mouseLoc: WebGLUniformLocation | null = null;
let screenLoc: WebGLUniformLocation | null = null;
let timeLoc: WebGLUniformLocation | null = null;
let quad: WebGLBuffer | null = null;

function compile(context: WebGLRenderingContext, type: number, source: string) {
  const shader = context.createShader(type);
  if (!shader) return null;
  context.shaderSource(shader, source);
  context.compileShader(shader);
  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
    context.deleteShader(shader);
    return null;
  }
  return shader;
}

function ensureGl() {
  if (gl && glCanvas) return true;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    preserveDrawingBuffer: true,
  });
  if (!context) return false;
  const vertex = compile(context, context.VERTEX_SHADER, VERT);
  const fragment = compile(context, context.FRAGMENT_SHADER, FRAG);
  if (!vertex || !fragment) return false;
  const program = context.createProgram();
  if (!program) return false;
  context.attachShader(program, vertex);
  context.attachShader(program, fragment);
  context.linkProgram(program);
  if (!context.getProgramParameter(program, context.LINK_STATUS)) return false;
  context.useProgram(program);
  const buffer = context.createBuffer();
  context.bindBuffer(context.ARRAY_BUFFER, buffer);
  context.bufferData(
    context.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    context.STATIC_DRAW,
  );
  position = context.getAttribLocation(program, "a");
  context.enableVertexAttribArray(position);
  context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0);
  resolutionLoc = context.getUniformLocation(program, "uView");
  texSizeLoc = context.getUniformLocation(program, "uTexSize");
  mouseLoc = context.getUniformLocation(program, "uMouse");
  screenLoc = context.getUniformLocation(program, "uScreen");
  timeLoc = context.getUniformLocation(program, "uTime");
  quad = buffer;
  gl = context;
  glCanvas = canvas;
  return true;
}

function loadTexture(src: string) {
  if (!gl || textures.has(src) || loading.has(src)) return;
  const pending = new Promise<void>((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (!gl) {
        resolve();
        return;
      }
      const texture = gl.createTexture();
      if (!texture) {
        resolve();
        return;
      }
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      textures.set(src, { texture, width: image.naturalWidth, height: image.naturalHeight });
      resolve();
    };
    image.onerror = () => resolve();
    image.src = src;
  });
  loading.set(src, pending);
}

function draw(entry: Entry, rect: DOMRect, now: number) {
  if (!gl || !glCanvas) return;
  const bitmap = textures.get(entry.src);
  if (!bitmap) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(2, Math.floor(rect.width * ratio));
  const height = Math.max(2, Math.floor(rect.height * ratio));
  if (glCanvas.width !== width || glCanvas.height !== height) {
    glCanvas.width = width;
    glCanvas.height = height;
  }
  if (entry.canvas.width !== width || entry.canvas.height !== height) {
    entry.canvas.width = width;
    entry.canvas.height = height;
  }
  gl.viewport(0, 0, width, height);
  const pointerX = hasPointer ? mouseX : window.innerWidth * 0.5;
  const pointerY = hasPointer ? mouseY : window.innerHeight * 0.5;
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.enableVertexAttribArray(position);
  gl.bindTexture(gl.TEXTURE_2D, bitmap.texture);
  gl.uniform2f(resolutionLoc, width, height);
  gl.uniform2f(texSizeLoc, bitmap.width, bitmap.height);
  gl.uniform2f(
    mouseLoc,
    (pointerX - rect.left) / rect.width,
    1 - (pointerY - rect.top) / rect.height,
  );
  gl.uniform2f(
    screenLoc,
    pointerX / Math.max(window.innerWidth, 1),
    1 - pointerY / Math.max(window.innerHeight, 1),
  );
  gl.uniform1f(timeLoc, now * 0.001);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  entry.ctx.drawImage(glCanvas, 0, 0, width, height);
}

function tick(now: number) {
  if (!gl) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  for (const entry of entries) {
    const rect = entry.canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.bottom < -40 || rect.top > window.innerHeight + 40) continue;
    draw(entry, rect, reduce ? 0 : now);
  }
  frame = requestAnimationFrame(tick);
}

function onPointer(event: PointerEvent) {
  hasPointer = true;
  mouseX = event.clientX;
  mouseY = event.clientY;
}

function start() {
  if (listening) return;
  if (!ensureGl()) return;
  listening = true;
  window.addEventListener("pointermove", onPointer, { passive: true });
  frame = requestAnimationFrame(tick);
}

function stop() {
  if (entries.size > 0) return;
  listening = false;
  window.removeEventListener("pointermove", onPointer);
  cancelAnimationFrame(frame);
}

function register(entry: Entry) {
  entries.add(entry);
  start();
  loadTexture(entry.src);
}

function unregister(entry: Entry) {
  entries.delete(entry);
  stop();
}

export function ShaderThumbnail({ src }: { src: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const entry = { canvas, ctx, src };
    register(entry);
    return () => unregister(entry);
  }, [src]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}
