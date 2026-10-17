import { createWaterSimulation } from "./hero-water-simulation";

// The water is drawn by a fragment shader: a sum of wave trains plus a few expanding rings, lit by a sky reflection and
// caustics, with the pointer's wake from a small height-field simulation added on top. Its colors are the brand blues as
// shader constants. The shader's glass branch (refracting an image) is kept but never switched on here.

const VERTEX_SHADER = `
attribute vec2 position;
void main() {
	gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
uniform sampler2D image;
uniform sampler2D water;
uniform vec2 resolution;
uniform vec2 surfaceSize;
uniform vec2 imageSize;
uniform float time;
uniform float glass;
uniform float halftone;

vec2 waveShape(vec2 point, out vec3 curvature) {
	vec2 warp = vec2(sin(point.y * 0.007 + time * 0.19), cos(point.x * 0.006 - time * 0.16)) * 28.0;
	vec2 p = point + warp;
	vec2 slope = vec2(0.0);
	curvature = vec3(0.0);
	for (int i = 0; i < 12; i++) {
		if (glass > 0.5 && i >= 9) break;
		float index = float(i);
		float angle = index * 2.39996 + 0.4;
		vec2 direction = vec2(cos(angle), sin(angle));
		float frequency = 0.016 * pow(1.28, index);
		float amplitude = 9.0 * pow(0.76, index);
		float speed = glass > 0.5 ? 0.3 + index * 0.09 : 0.25 + fract(sin(index * 17.13 + 1.7) * 437.58) * 0.65;
		float packet = sin(dot(point, vec2(-direction.y, direction.x)) * 0.008 + index * 2.7 - time * 0.21);
		amplitude *= glass > 0.5 ? 1.0 : 1.0 + packet * 0.22;
		if (i >= 9) {
			frequency *= 1.5;
			amplitude *= 0.45;
		}
		float phase = dot(p, direction) * frequency + time * speed + index * 12.7;
		slope += direction * cos(phase) * amplitude * frequency;
		if (i < 9) {
			curvature -= sin(phase) * amplitude * frequency * frequency * vec3(direction.x * direction.x, direction.x * direction.y, direction.y * direction.y);
		}
	}
	if (glass > 0.5) return slope;
	for (int i = 0; i < 3; i++) {
		float index = float(i);
		float lifetime = 7.0 + index * 1.3;
		float cycle = time / lifetime + index * 0.37;
		float generation = floor(cycle);
		float age = fract(cycle) * lifetime;
		vec2 seed = vec2(generation + index * 13.7, generation * 1.3 + index * 8.9);
		vec2 origin = fract(sin(seed + vec2(5.2, 9.1)) * vec2(43758.54, 22578.14));
		origin *= vec2(surfaceSize.x, surfaceSize.y * 0.46);
		vec2 delta = point - origin;
		float radius = length(delta);
		float front = radius - age * (48.0 + index * 9.0);
		float envelope = exp(-front * front / 7200.0) * smoothstep(0.0, 0.8, age) * exp(-age * 0.45) * (1.0 - smoothstep(lifetime - 1.0, lifetime, age));
		vec2 direction = delta / max(radius, 1.0);
		float phase = front * 0.07;
		slope += direction * cos(phase) * envelope * 0.16;
		curvature -= sin(phase) * envelope * 0.008 * vec3(direction.x * direction.x, direction.x * direction.y, direction.y * direction.y);
	}
	return slope;
}

vec2 surfaceSlope(vec2 uv) {
	vec4 encoded = texture2D(water, uv) * 255.0;
	return (vec2(dot(encoded.rg, vec2(256.0, 1.0)), dot(encoded.ba, vec2(256.0, 1.0))) - 32768.0) / 32767.0;
}

void main() {
	vec2 uv = gl_FragCoord.xy / resolution;
	// The opaque hero gradient covers the upper 55% of the surface.
	if (glass < 0.5 && uv.y > 0.45) {
		gl_FragColor = vec4(0.65, 0.8, 0.95, 1.0);
		return;
	}
	vec2 screenPoint = uv * surfaceSize;
	float dotPitch = mix(5.0, 7.0, step(700.0, surfaceSize.x));
	vec2 point = halftone > 0.5 ? (floor(screenPoint / dotPitch) + 0.5) * dotPitch : screenPoint;
	uv = point / surfaceSize;
	vec3 curvature;
	vec2 waves = waveShape(point, curvature);
	vec2 wake = surfaceSlope(uv);
	vec2 slope = waves + wake * 1.1;
	if (glass > 0.5) {
		float cover = max(surfaceSize.x / imageSize.x, surfaceSize.y / imageSize.y) * 1.04;
		vec2 renderedSize = imageSize * cover;
		vec2 imageUv = (point + slope * 25.0 + vec2((renderedSize.x - surfaceSize.x) * 0.5, 12.0)) / renderedSize;
		gl_FragColor = vec4(texture2D(image, imageUv).rgb, 1.0);
		return;
	}
	vec3 normal = normalize(vec3(-slope, 1.0));
	vec3 view = normalize(vec3(0.0, 0.38, 1.0));
	vec3 reflected = reflect(-view, normal);
	float sky = smoothstep(-0.45, 0.65, reflected.y);
	vec3 reflection = mix(vec3(0.18, 0.36, 0.67), vec3(0.85, 0.94, 1.0), sky);
	float ribbon = exp(-pow((reflected.y + 0.1 + sin(reflected.x * 4.0) * 0.06) * 7.0, 2.0));
	reflection += ribbon * vec3(0.28, 0.31, 0.34);
	float fresnel = 0.12 + 0.38 * pow(1.0 - max(dot(normal, view), 0.0), 3.0);
	vec3 bottomCurvature;
	waveShape(point + slope * 65.0 + vec2(32.0, -18.0), bottomCurvature);
	vec2 stepUv = vec2(5.0) / surfaceSize;
	vec2 wakeX = (surfaceSlope(uv + vec2(stepUv.x, 0.0)) - surfaceSlope(uv - vec2(stepUv.x, 0.0))) / 10.0;
	vec2 wakeY = (surfaceSlope(uv + vec2(0.0, stepUv.y)) - surfaceSlope(uv - vec2(0.0, stepUv.y))) / 10.0;
	bottomCurvature += vec3(wakeX.x, (wakeX.y + wakeY.x) * 0.5, wakeY.y);
	vec3 lens = bottomCurvature * 75.0;
	float focusing = (1.0 - lens.x) * (1.0 - lens.z) - lens.y * lens.y;
	float caustic = exp(-abs(focusing) * 4.5);
	vec3 waterColor = mix(vec3(0.13, 0.34, 0.72), vec3(0.38, 0.67, 0.89), smoothstep(0.0, 1.0, uv.y));
	waterColor += caustic * vec3(0.24, 0.34, 0.38);
	waterColor *= 0.94 + dot(normal, normalize(vec3(-0.4, 0.5, 1.0))) * 0.12;
	vec3 color = mix(waterColor, reflection, fresnel + ribbon * 0.2);
	vec3 halfway = normalize(normalize(vec3(-0.35, 0.6, 1.0)) + view);
	float glint = pow(max(dot(normal, halfway), 0.0), 160.0);
	color += glint * vec3(0.2, 0.23, 0.24);
	if (halftone > 0.5) {
		float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
		float darkness = 1.0 - smoothstep(0.3, 0.72, luminance);
		float radius = dotPitch * mix(0.06, 0.46, pow(darkness, 1.4));
		float distanceToCenter = length(screenPoint - point);
		float feather = max(surfaceSize.x / resolution.x, 0.65) * 0.5;
		float dotCoverage = 1.0 - smoothstep(radius - feather, radius + feather, distanceToCenter);
		vec3 paper = mix(color, vec3(0.9, 0.95, 1.0), 0.55);
		vec3 ink = mix(vec3(0.055, 0.18, 0.53), color, 0.6);
		color = mix(paper, ink, dotCoverage);
	}
	gl_FragColor = vec4(color, 1.0);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (vertex && fragment && program) {
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
  }
  if (vertex) gl.deleteShader(vertex);
  if (fragment) gl.deleteShader(fragment);
  if (program && gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  if (program) gl.deleteProgram(program);
  return null;
}

export type HeroWaterAppearance = "water" | "halftone";

/** Starts the water on the canvas, following the pointer over `surface`. Returns a dispose function, or nothing when WebGL is unavailable. */
export function createHeroWater(canvas: HTMLCanvasElement, surface: HTMLElement, onLiveChange?: (live: boolean) => void, appearance: HeroWaterAppearance = "water") {
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, powerPreference: "low-power" });
  if (!gl) return;
  const program = createProgram(gl);
  if (!program) return;
  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  gl.useProgram(program);
  gl.uniform1f(gl.getUniformLocation(program, "glass"), 0);
  gl.uniform1f(gl.getUniformLocation(program, "halftone"), appearance === "halftone" ? 1 : 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const uniforms = {
    resolution: gl.getUniformLocation(program, "resolution"),
    surfaceSize: gl.getUniformLocation(program, "surfaceSize"),
    imageSize: gl.getUniformLocation(program, "imageSize"),
    time: gl.getUniformLocation(program, "time"),
    water: gl.getUniformLocation(program, "water"),
  };
  const waterTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, waterTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(uniforms.water, 1);
  gl.activeTexture(gl.TEXTURE0);
  let simulation = createWaterSimulation(1, 1);
  let pointer: { x: number; y: number } | undefined;
  let previousPointer: { x: number; y: number } | undefined;
  let frame = 0;
  let lastFrame = 0;
  let elapsed = 0;
  let visible = false;
  let ready = false;
  let disposed = false;
  let live = false;
  let bounds = canvas.getBoundingClientRect();

  function resize() {
    bounds = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(900_000 / Math.max(bounds.width * bounds.height, 1)));
    canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
    canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
    simulation = createWaterSimulation(Math.max(1, bounds.width), Math.max(1, bounds.height));
    resetPointer();
    gl!.activeTexture(gl!.TEXTURE1);
    gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, false);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, simulation.columns, simulation.rows, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, simulation.advance(0));
    gl!.activeTexture(gl!.TEXTURE0);
    gl!.viewport(0, 0, canvas.width, canvas.height);
    gl!.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl!.uniform2f(uniforms.surfaceSize, bounds.width, bounds.height);
  }

  function render(now: number) {
    frame = requestAnimationFrame(render);
    if (now - lastFrame < 1000 / 60 - 1) return;
    const seconds = Math.min((now - lastFrame) / 1000, 0.05);
    elapsed += seconds;
    if (pointer) {
      const from = previousPointer ?? pointer;
      const distance = Math.hypot(pointer.x - from.x, pointer.y - from.y);
      if (!previousPointer || distance > 0.1) {
        const strength = previousPointer ? Math.min(1.0, distance * 0.04) : 0.55;
        simulation.disturb(from.x, from.y, pointer.x, pointer.y, strength);
      }
      previousPointer = { ...pointer };
    }
    gl!.activeTexture(gl!.TEXTURE1);
    gl!.texSubImage2D(gl!.TEXTURE_2D, 0, 0, 0, simulation.columns, simulation.rows, gl!.RGBA, gl!.UNSIGNED_BYTE, simulation.advance(seconds));
    gl!.activeTexture(gl!.TEXTURE0);
    lastFrame = now;
    gl!.uniform1f(uniforms.time, elapsed);
    gl!.drawArrays(gl!.TRIANGLES, 0, 6);
    if (!live) {
      canvas.style.opacity = "1";
      live = true;
      onLiveChange?.(true);
    }
  }

  function syncPlayback() {
    cancelAnimationFrame(frame);
    resetPointer();
    if (!disposed && ready && visible && !document.hidden) {
      lastFrame = performance.now();
      frame = requestAnimationFrame(render);
    }
  }

  function resetPointer() {
    pointer = undefined;
    previousPointer = undefined;
  }

  function onPointerMove(event: PointerEvent) {
    if (event.pointerType === "touch" || !ready || !visible || document.hidden) return;
    bounds = canvas.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = bounds.bottom - event.clientY;
    if (x < 0 || x > bounds.width || y < 0 || y > bounds.height) {
      resetPointer();
      return;
    }
    pointer = { x, y };
  }

  function onClick(event: MouseEvent) {
    if (event.button !== 0 || event.detail === 0 || !ready || !visible || document.hidden) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = rect.bottom - event.clientY;
    if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;
    simulation.disturb(x, y, x, y, 2.6, 28);
  }

  function onContextLost(event: Event) {
    event.preventDefault();
    ready = false;
    canvas.style.opacity = "0";
    if (live) {
      live = false;
      onLiveChange?.(false);
    }
    syncPlayback();
  }

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
  resize();
  ready = true;
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncPlayback();
  });
  intersectionObserver.observe(canvas);
  surface.addEventListener("pointermove", onPointerMove, { passive: true });
  surface.addEventListener("click", onClick, { passive: true });
  surface.addEventListener("pointerleave", resetPointer);
  surface.addEventListener("pointercancel", resetPointer);
  document.addEventListener("visibilitychange", syncPlayback);
  canvas.addEventListener("webglcontextlost", onContextLost);

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    surface.removeEventListener("pointermove", onPointerMove);
    surface.removeEventListener("click", onClick);
    surface.removeEventListener("pointerleave", resetPointer);
    surface.removeEventListener("pointercancel", resetPointer);
    document.removeEventListener("visibilitychange", syncPlayback);
    canvas.removeEventListener("webglcontextlost", onContextLost);
    canvas.style.opacity = "0";
    if (live) onLiveChange?.(false);
    gl.deleteTexture(texture);
    gl.deleteTexture(waterTexture);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
  };
}
