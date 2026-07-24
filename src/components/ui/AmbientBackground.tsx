"use client";

import React, { useEffect, useRef, useState } from "react";
import { AMBIENT_TOKENS, type AmbientTier } from "@lib/theme/tokens";
import { CssAmbientBackground } from "./CssAmbientBackground";

export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tier, setTier] = useState<AmbientTier | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // 1. Accessibility Check: prefers-reduced-motion
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener("change", handleMotionChange);

    // 2. Hardware Capability & Tier Detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768;

    const hasWebGL = (() => {
      try {
        const testCanvas = document.createElement("canvas");
        return !!(
          window.WebGLRenderingContext &&
          (testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl"))
        );
      } catch {
        return false;
      }
    })();

    if (!hasWebGL || isMobile) {
      setTier("tier3");
    } else {
      // High-performance desktop tier vs medium tier
      const cores = navigator.hardwareConcurrency || 4;
      setTier(cores >= 4 ? "tier1" : "tier2");
    }

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  useEffect(() => {
    if (tier === "tier3" || tier === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;

    if (!gl) {
      setTier("tier3");
      return;
    }

    const tierConfig =
      tier === "tier1"
        ? AMBIENT_TOKENS.performanceTiers.tier1
        : AMBIENT_TOKENS.performanceTiers.tier2;

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Centralized Design Token Colors injected into GLSL
    const { glslRgb } = AMBIENT_TOKENS;
    const fs = `
      precision highp float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_resolution;

      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = v_texCoord;
        float t = u_time * 0.12;

        float n1 = snoise(uv * 1.8 + t);
        float n2 = snoise(uv * 3.5 - t * 0.7);
        float n3 = snoise(uv * 1.2 + vec2(t * 0.4, -t * 0.2));

        vec3 cDeepNavy  = vec3(${glslRgb.deepNavy.join(",")});
        vec3 cViolet    = vec3(${glslRgb.violet.join(",")});
        vec3 cMagenta   = vec3(${glslRgb.magenta.join(",")});
        vec3 cCyan      = vec3(${glslRgb.subtleCyan.join(",")});

        vec3 color = cDeepNavy;
        color = mix(color, cViolet, smoothstep(-0.5, 0.8, n1) * 0.35);
        color = mix(color, cMagenta, smoothstep(-0.4, 0.9, n2) * 0.25);
        color = mix(color, cCyan, smoothstep(0.1, 1.0, n3) * 0.20);

        gl_FragColor = vec4(color, 0.85);
      }
    `;

    function compileShader(type: number, source: string) {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vert = compileShader(gl.VERTEX_SHADER, vs);
    const frag = compileShader(gl.FRAGMENT_SHADER, fs);
    if (!vert || !frag) {
      setTier("tier3");
      return;
    }

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setTier("tier3");
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, "u_time");
    const resLocation = gl.getUniformLocation(program, "u_resolution");

    let animationFrameId: number | null = null;
    let isPaused = false;
    const startTime = performance.now();

    function resize() {
      if (!canvas) return;
      // Scale internal drawing buffer down to reduce GPU fragment shader overhead by up to 75%
      const width = Math.floor(window.innerWidth * tierConfig.resolutionScale);
      const height = Math.floor(window.innerHeight * tierConfig.resolutionScale);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl!.viewport(0, 0, width, height);
      }
    }

    window.addEventListener("resize", resize);
    resize();

    function render(time: number) {
      if (isPaused) return;

      const elapsed = reducedMotion ? 10.0 : (time - startTime) / 1000;

      if (timeLocation) gl!.uniform1f(timeLocation, elapsed);
      if (resLocation && canvas) gl!.uniform2f(resLocation, canvas.width, canvas.height);

      gl!.drawArrays(gl!.TRIANGLES, 0, 6);

      // If reduced motion is requested, render 1 static frame and stop loop
      if (!reducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    }

    // 3. Visibility API: Pause render loop completely when tab is hidden
    function handleVisibilityChange() {
      if (document.hidden) {
        isPaused = true;
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      } else {
        if (isPaused) {
          isPaused = false;
          if (!reducedMotion) {
            animationFrameId = requestAnimationFrame(render);
          }
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial trigger
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [tier, reducedMotion]);

  // Fallback to CSS Tier 3 if mobile, low power, or WebGL unavailable
  if (tier === "tier3" || tier === null) {
    return <CssAmbientBackground staticMode={reducedMotion} />;
  }

  return (
    <div
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none opacity-80 mix-blend-screen overflow-hidden"
      style={{
        backdropFilter:
          tier === "tier1"
            ? AMBIENT_TOKENS.performanceTiers.tier1.blurAmount
            : AMBIENT_TOKENS.performanceTiers.tier2.blurAmount,
      }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
