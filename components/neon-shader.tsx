"use client";

import { useEffect, useRef } from "react";

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}`;

const FRAG = `precision highp float;
uniform vec2 uRes;
uniform float uTime;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  float horizon=0.44;
  vec3 col=mix(vec3(0.015,0.0,0.07),vec3(0.22,0.02,0.2),smoothstep(0.15,0.7,uv.y));
  float band=exp(-pow((uv.y-horizon)*8.0,2.0));
  col+=vec3(1.0,0.12,0.48)*band*0.9;
  col+=vec3(0.1,0.85,1.0)*band*0.28;
  vec2 sun=(uv-vec2(0.5,horizon+0.015))*vec2(1.05,1.45);
  float sd=length(sun);
  float disk=smoothstep(0.15,0.128,sd);
  float stripes=step(0.5,fract((horizon-uv.y)*26.0));
  vec3 sunCol=mix(vec3(1.0,0.9,0.35),vec3(1.0,0.16,0.58),smoothstep(0.0,0.15,sd));
  sunCol*=mix(0.82,1.0,stripes);
  col=mix(col,sunCol,disk);
  col+=vec3(1.0,0.25,0.65)*exp(-sd*7.5)*0.42;
  if(uv.y>horizon){
    vec2 cell=floor(uv*vec2(uRes.x/uRes.y,1.0)*110.0);
    float n=hash(cell);
    float tw=0.6+0.4*sin(uTime*1.7+n*30.0);
    col+=step(0.992,n)*tw;
  }
  if(uv.y<horizon){
    float py=max(horizon-uv.y,0.001);
    float z=0.18/py;
    float x=(uv.x-0.5)*z*1.35;
    float dx=min(fract(x),1.0-fract(x));
    float dz=min(fract(z*0.42-uTime*0.55),1.0-fract(z*0.42-uTime*0.55));
    float line=max(1.0-smoothstep(0.0,0.035,dx),1.0-smoothstep(0.0,0.03,dz));
    line*=smoothstep(0.0,0.05,py)*smoothstep(0.5,0.08,py);
    vec3 neon=mix(vec3(1.0,0.05,0.62),vec3(0.15,0.95,1.0),uv.x);
    col=mix(vec3(0.04,0.0,0.08),col,0.25);
    col=mix(col,neon,clamp(line,0.0,1.0));
    col+=neon*line*0.35;
  }
  gl_FragColor=vec4(col,1.0);
}`;

export function NeonShader() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertex = compile(gl.VERTEX_SHADER, VERT);
    const fragment = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vertex || !fragment) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "a");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, "uRes");
    const time = gl.getUniformLocation(program, "uTime");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    let running = false;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(window.innerWidth * ratio);
      canvas.height = Math.floor(window.innerHeight * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = (now: number) => {
      if (!running) return;
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform1f(time, motion.matches ? 12 : now * 0.001);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      frame = requestAnimationFrame(draw);
    };

    const sync = () => {
      const on = document.documentElement.classList.contains("neon");
      canvas.hidden = !on;
      if (on && !running) {
        running = true;
        resize();
        frame = requestAnimationFrame(draw);
      } else if (!on && running) {
        running = false;
        cancelAnimationFrame(frame);
      }
    };

    sync();
    window.addEventListener("resize", resize);
    window.addEventListener("theme-change", sync);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("theme-change", sync);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
