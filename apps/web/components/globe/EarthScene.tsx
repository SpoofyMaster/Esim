"use client";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Stars, AdaptiveDpr, PerformanceMonitor, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { COUNTRIES, REGIONS, countryByIso2, CITIES } from "@bleusim/geospatial";
import { loadGeo, type GeoBundle } from "./geodata";
import { earthVertex, earthFragment, atmosphereVertex, atmosphereFragment, cloudFragment, arcVertex, arcFragment } from "./shaders";
import { latLngToVec3, vec3ToLatLng } from "@/lib/geo";
import { explorer, useExplorer } from "@/lib/store";

export interface EarthSceneProps {
  coverage: string[]; // ISO2 with sellable plans (from catalog)
  highlight: string[]; // ISO2 to emphasise (selected region/global coverage)
  quality: "high" | "low";
  reducedMotion: boolean;
}

const MIN_D = 1.45, MAX_D = 6.5, HOME_D = 4.4;

export default function EarthScene(props: EarthSceneProps) {
  const [dprMax, setDprMax] = useState(props.quality === "high" ? 2 : 1.25);
  return (
    <Canvas
      dpr={[1, dprMax]}
      camera={{ fov: 32, near: 0.05, far: 100, position: latLngToVec3(22, 10, HOME_D).toArray() }}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      onCreated={({ gl }) => {
        gl.setClearColor("#020B1F");
        gl.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); explorer.set({ webgl: "unavailable" }); });
      }}
      aria-hidden
    >
      <PerformanceMonitor onDecline={() => setDprMax(1)} />
      <AdaptiveDpr pixelated={false} />
      <Stars radius={60} depth={30} count={props.quality === "high" ? 4000 : 1500} factor={2.2} saturation={0} fade speed={props.reducedMotion ? 0 : 0.4} />
      <ViewOffset />
      <Suspense fallback={null}>
        <Globe {...props} />
      </Suspense>
    </Canvas>
  );
}

function Globe({ coverage, highlight, quality, reducedMotion }: EarthSceneProps) {
  const res = quality === "high" ? "4k" : "2k";
  const [day, night, water, clouds] = useTexture([`/earth/day-${res}.jpg`, `/earth/night-${res}.jpg`, "/earth/water-mask.jpg", "/earth/clouds-2k.jpg"]) as THREE.Texture[] as [THREE.Texture, THREE.Texture, THREE.Texture, THREE.Texture];
  useMemo(() => {
    day.colorSpace = THREE.SRGBColorSpace; night.colorSpace = THREE.SRGBColorSpace;
    [day, night, water, clouds].forEach((t) => { t.anisotropy = 8; });
  }, [day, night, water, clouds]);

  const [geo, setGeo] = useState<GeoBundle | null>(null);
  useEffect(() => { loadGeo().then(setGeo); }, []);

  const { camera, gl } = useThree();
  const controls = useRef<any>(null);
  const earth = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const sun = useMemo(() => new THREE.Vector3(), []);

  const coverageTex = useMemo(() => {
    const data = new Uint8Array(256 * 4);
    const tex = new THREE.DataTexture(data, 256, 1, THREE.RGBAFormat);
    tex.minFilter = tex.magFilter = THREE.NearestFilter;
    return tex;
  }, []);
  useEffect(() => {
    const data = coverageTex.image.data as Uint8Array;
    data.fill(0);
    const hl = new Set(highlight);
    for (const c of COUNTRIES) {
      if (!c.iso2 || c.index > 255) continue;
      data[c.index * 4] = hl.size ? (hl.has(c.iso2) ? 255 : 0) : coverage.includes(c.iso2) ? 255 : 0;
    }
    coverageTex.needsUpdate = true;
  }, [coverage, highlight, coverageTex]);


  const earthMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: earthVertex,
    fragmentShader: earthFragment,
    uniforms: {
      dayMap: { value: day }, nightMap: { value: night }, waterMap: { value: water },
      idMap: { value: null }, coverageMap: { value: coverageTex },
      sunDir: { value: sun }, hoverId: { value: 0 }, selectedId: { value: 0 }, selectPulse: { value: 0 },
      coverageStrength: { value: 0 }, time: { value: 0 },
    },
  }), [day, night, water, coverageTex, sun]);
  useEffect(() => { if (geo) earthMat.uniforms.idMap!.value = geo.idMap; }, [geo, earthMat]);

  const atmoMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: atmosphereVertex, fragmentShader: atmosphereFragment,
    uniforms: { sunDir: { value: sun }, limb: { value: Math.sqrt(1 - 1 / (1.09 * 1.09)) } }, side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }), [sun]);
  const cloudMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: earthVertex, fragmentShader: cloudFragment,
    uniforms: { cloudMap: { value: clouds }, sunDir: { value: sun }, opacity: { value: 0.55 } }, transparent: true, depthWrite: false,
  }), [clouds, sun]);

  // Selection → uniforms + outline.
  const selection = useExplorer((s) => s.selection);
  const hoverIso = useExplorer((s) => s.hoverIso);
  const flyRequest = useExplorer((s) => s.flyRequest);
  const selCountry = selection?.kind === "country" ? countryByIso2(selection.iso2) : undefined;
  useEffect(() => {
    earthMat.uniforms.selectedId!.value = selCountry?.index ?? 0;
    earthMat.uniforms.hoverId!.value = hoverIso ? countryByIso2(hoverIso)?.index ?? 0 : 0;
  }, [selCountry, hoverIso, earthMat]);
  const outline = useMemo(() => {
    if (!geo || !selCountry) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(geo.outlinePositions(selCountry.index), 3));
    return g;
  }, [geo, selCountry]);
  const borders = useMemo(() => {
    if (!geo) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(geo.borderPositions, 3));
    return g;
  }, [geo]);

  // Camera flights.
  const interacting = useRef(false);
  const idleSince = useRef(0);
  useEffect(() => {
    if (!flyRequest) return;
    let lat = 20, lng = 10, dist = HOME_D;
    if (selection?.kind === "country") {
      const c = countryByIso2(selection.iso2);
      if (!c) return;
      [lng, lat] = c.centroid;
      const span = Math.max(c.bbox[2] - c.bbox[0] < 0 ? c.bbox[2] + 360 - c.bbox[0] : c.bbox[2] - c.bbox[0], c.bbox[3] - c.bbox[1]);
      dist = THREE.MathUtils.clamp(2.45 + span / 26, 2.6, 4.3);
      if (c.iso2 === "US") { lat = 39; lng = -98; dist = 3.4; }
      if (c.iso2 === "RU") { lat = 60; lng = 90; dist = 4.0; }
      if (c.iso2 === "FR") { lat = 46.5; lng = 2.5; dist = 2.3; }
    } else if (selection?.kind === "region") {
      const r = REGIONS.find((x) => x.id === selection.id);
      if (r) { lat = r.focus.lat; lng = r.focus.lng; dist = r.focus.distance * 1.45; }
    } else if (selection?.kind === "global") {
      dist = 3.4;
      const cur = vec3ToLatLng(camera.position); lng = cur.lng; lat = 18;
    }
    // Keep the target slightly left of centre on wide screens so the side panel doesn't cover it.
    const target = latLngToVec3(lat, lng, 1).normalize();
    const from = camera.position.clone().normalize();
    const fromD = camera.position.length();
    const state = { t: 0 };
    const q = new THREE.Quaternion().setFromUnitVectors(from, target);
    const tmp = new THREE.Vector3();
    if (controls.current) controls.current.enabled = false;
    const tween = gsap.to(state, {
      t: 1,
      duration: reducedMotion ? 0 : 1.7,
      ease: "power3.inOut",
      onUpdate: () => {
        const qt = new THREE.Quaternion().slerp(q, state.t);
        tmp.copy(from).applyQuaternion(qt);
        const arc = Math.sin(state.t * Math.PI) * 0.35 * from.angleTo(target);
        camera.position.copy(tmp.multiplyScalar(THREE.MathUtils.lerp(fromD, dist, state.t) + arc));
        camera.lookAt(0, 0, 0);
      },
      onComplete: () => { if (controls.current) { controls.current.enabled = true; controls.current.update(); } idleSince.current = performance.now(); },
    });
    return () => { tween.kill(); if (controls.current) controls.current.enabled = true; };
  }, [flyRequest]); // eslint-disable-line react-hooks/exhaustive-deps

  // Hover / click picking (drag-safe).
  const down = useRef<{ x: number; y: number; t: number } | null>(null);
  const lastHover = useRef(0);
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (!geo || e.pointerType === "touch") return;
    const now = performance.now();
    if (now - lastHover.current < 40) return;
    lastHover.current = now;
    const { lat, lng } = vec3ToLatLng(e.point);
    const c = geo.pick(lat, lng, coverage);
    const iso = c?.iso2 ?? null;
    if (iso !== explorer.get().hoverIso) explorer.set({ hoverIso: iso });
    gl.domElement.style.cursor = iso ? "pointer" : "grab";
  };
  const onDown = (e: ThreeEvent<PointerEvent>) => { down.current = { x: e.clientX, y: e.clientY, t: performance.now() }; };
  const onUp = (e: ThreeEvent<PointerEvent>) => {
    const d = down.current; down.current = null;
    if (!d || !geo) return;
    const moved = Math.hypot(e.clientX - d.x, e.clientY - d.y);
    if (moved > 6 || performance.now() - d.t > 600) return; // it was a drag, not a tap
    const { lat, lng } = vec3ToLatLng(e.point);
    const c = geo.pick(lat, lng, coverage);
    if (c?.iso2) explorer.select({ kind: "country", iso2: c.iso2 });
  };

  useFrame((state, dt) => {
    // Art-directed key light: fixed relative to the camera (upper left), so the visible hemisphere is lit
    // and the right limb shows the terminator with city lights.
    sun.set(-1.1, 0.55, 0.65).normalize().applyQuaternion(camera.quaternion);
    earthMat.uniforms.time!.value = state.clock.elapsedTime;
    const cs = earthMat.uniforms.coverageStrength!;
    cs.value = THREE.MathUtils.damp(cs.value, highlight.length ? 1.6 : 0, 4, dt);
    earthMat.uniforms.selectPulse!.value = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 2.2);
    if (cloudRef.current && !reducedMotion) cloudRef.current.rotation.y += dt * 0.006;
    const c = controls.current;
    if (c) {
      const idle = !interacting.current && performance.now() - idleSince.current > 4000;
      c.autoRotate = !reducedMotion && idle && !explorer.get().selection;
      c.rotateSpeed = 0.35 * (camera.position.length() - 1) / 1.9 + 0.12;
    }
  });

  useEffect(() => { if (geo) explorer.set({ globeReady: true }); }, [geo]);

  return (
    <>
      <OrbitControls
        ref={controls}
        enablePan={false}
        enableDamping
        dampingFactor={0.07}
        minDistance={MIN_D}
        maxDistance={MAX_D}
        zoomSpeed={0.6}
        autoRotateSpeed={-0.35}
        onStart={() => { interacting.current = true; }}
        onEnd={() => { interacting.current = false; idleSince.current = performance.now(); }}
      />
      <mesh ref={earth} material={earthMat} onPointerMove={onMove} onPointerDown={onDown} onPointerUp={onUp}
        onPointerOut={() => { explorer.set({ hoverIso: null }); gl.domElement.style.cursor = "grab"; }}>
        <sphereGeometry args={[1, quality === "high" ? 160 : 96, quality === "high" ? 120 : 64]} />
      </mesh>
      <mesh ref={cloudRef} material={cloudMat} raycast={() => null}>
        <sphereGeometry args={[1.009, 96, 64]} />
      </mesh>
      {borders && (
        <lineSegments geometry={borders} raycast={() => null}>
          <lineBasicMaterial color="#7DDCFF" transparent opacity={0.16} depthWrite={false} />
        </lineSegments>
      )}
      {outline && (
        <lineSegments geometry={outline} raycast={() => null}>
          <lineBasicMaterial color="#BDEEFF" transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} />
        </lineSegments>
      )}
      <mesh material={atmoMat} raycast={() => null} scale={1.09}>
        <sphereGeometry args={[1, 96, 64]} />
      </mesh>
      <Arcs reducedMotion={reducedMotion} />
    </>
  );
}

const HUBS: [string, string][] = [["Paris", "New York"], ["London", "Dubai"], ["Dubai", "Singapore"], ["Singapore", "Tokyo"], ["Tokyo", "Los Angeles"], ["New York", "Rio de Janeiro"], ["Casablanca", "Paris"], ["Cape Town", "Dubai"], ["Sydney", "Singapore"], ["Istanbul", "Bangkok"], ["Mexico City", "Madrid"], ["Seoul", "Honolulu"]];

function Arcs({ reducedMotion }: { reducedMotion: boolean }) {
  const items = useMemo(() => HUBS.map(([a, b], i) => {
    const A = CITIES.find((c) => c.name === a)!, B = CITIES.find((c) => c.name === b)!;
    const va = latLngToVec3(A.lat, A.lng, 1.003), vb = latLngToVec3(B.lat, B.lng, 1.003);
    const ang = va.angleTo(vb);
    const mid = va.clone().add(vb).normalize().multiplyScalar(1.003 + ang * 0.22);
    const curve = new THREE.QuadraticBezierCurve3(va, mid, vb);
    const pts = curve.getPoints(96);
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    g.setAttribute("t", new THREE.BufferAttribute(new Float32Array(pts.map((_, k) => k / (pts.length - 1))), 1));
    const m = new THREE.ShaderMaterial({ vertexShader: arcVertex, fragmentShader: arcFragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { time: { value: 0 }, offset: { value: (i * 0.37) % 1 }, speed: { value: 0.12 + (i % 4) * 0.025 } } });
    const line = new THREE.Line(g, m); line.raycast = () => {};
    return { m, line };
  }), []);
  useFrame((s) => { if (!reducedMotion) items.forEach(({ m }) => { m.uniforms.time!.value = s.clock.elapsedTime; }); });
  return <>{items.map(({ line }, i) => <primitive key={i} object={line} />)}</>;
}

/** Shifts the rendered globe so it never sits under the hero copy or the destination panel. */
function ViewOffset() {
  const { camera, size } = useThree();
  const cur = useRef({ x: 0, y: 0 });
  useFrame((_, dt) => {
    const sel = !!explorer.get().selection;
    const desktop = size.width >= 1024;
    const tx = desktop ? (sel ? -size.width * 0.12 : size.width * 0.2) : 0;
    const ty = desktop ? 0 : sel ? -size.height * 0.26 : size.height * 0.24;
    cur.current.x = THREE.MathUtils.damp(cur.current.x, tx, 3.5, dt);
    cur.current.y = THREE.MathUtils.damp(cur.current.y, ty, 3.5, dt);
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    // Keep a ~34° horizontal field on portrait screens so the planet fits the width.
    const fov = aspect < 1 ? THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(17)) / aspect)) : 32;
    if (Math.abs(cam.fov - fov) > 0.01) { cam.fov = fov; cam.updateProjectionMatrix(); }
    (camera as THREE.PerspectiveCamera).setViewOffset(size.width, size.height, -cur.current.x, -cur.current.y, size.width, size.height);
  });
  return null;
}
