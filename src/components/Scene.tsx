import { Physics, useSphere } from "@react-three/cannon";
import {
  Environment,
  Html,
  PerformanceMonitor,
  Text,
  useProgress,
  useTexture,
} from "@react-three/drei";
import { Canvas, ThreeElement, extend, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, N8AO, SMAA, TiltShift2 } from "@react-three/postprocessing";
import { easing, geometry } from "maath";
import { Suspense, useState } from "react";
import * as THREE from "three";

import { useIsMobileSize, useIsTouch, usePrefersReducedMotion } from "../utils/helpers";

extend({ RoundedPlaneGeometry: geometry.RoundedPlaneGeometry });

declare module "@react-three/fiber" {
  interface ThreeElements {
    roundedPlaneGeometry: ThreeElement<typeof geometry.RoundedPlaneGeometry>;
  }
}

export default function Scene() {
  const [dpr, setDpr] = useState(1.5);
  const isMobile = useIsMobileSize(1000);
  const reducedMotion = usePrefersReducedMotion();

  return (
    <Canvas
      shadows
      gl={{ antialias: false }}
      dpr={[1, dpr]}
      camera={{ position: [0, 0, 20], fov: 35, near: 1, far: 40 }}
    >
      <color attach="background" args={["#dfdfdf"]} />
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
      <Suspense fallback={<Loader />}>
        <ambientLight intensity={0.5} />
        <spotLight
          intensity={1}
          angle={0.2}
          penumbra={1}
          position={[30, 30, 30]}
          castShadow
          shadow-mapSize={[512, 512]}
        />

        <Physics iterations={5}>
          <BannerText />
          <Pointer />
          <Clump />
        </Physics>

        {!reducedMotion && <Rig />}

        <Environment files="/adamsbridge.hdr" />
        <EffectComposer multisampling={0} stencilBuffer>
          <N8AO
            halfRes
            color="greenyellow"
            aoRadius={2}
            intensity={1}
            aoSamples={6}
            denoiseSamples={4}
          />
          <SMAA />
          {!isMobile && !reducedMotion && <TiltShift2 blur={0.02} />}
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center className="loader">
      <div className="loader-text">{Math.floor(progress)} %</div>
      <div
        className="bar"
        role="progressbar"
        aria-valuenow={Math.floor(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="bar-fill" style={{ width: `${progress}%` }} />
      </div>
    </Html>
  );
}

const BannerText = () => {
  const isMobile = useIsMobileSize(1000);
  const text = isMobile ? "ANDRAS\nLASSU" : "ANDRAS LASSU"; // TODO this shouldn't be necessary but the centering is off if \n is not there
  const { viewport } = useThree();
  const { width } = viewport;

  return (
    <Text
      font={"/fonts/MajorMonoDisplay/MajorMonoDisplay-Regular.woff"}
      fontSize={Math.max(1.2, width / 10)}
      letterSpacing={-0.025}
      color="black"
      maxWidth={width}
    >
      {text}
    </Text>
  );
};

const Rig = () => {
  useFrame((state, delta) => {
    easing.damp3(
      state.camera.position,
      [Math.sin(-state.pointer.x) * 5, state.pointer.y * 1.5, 15 + Math.cos(state.pointer.x) * 10],
      0.2,
      delta,
    );
    state.camera.lookAt(0, 0, 0);
  });
  return <></>;
};

const rfs = THREE.MathUtils.randFloatSpread;
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const baubleMaterial = new THREE.MeshStandardMaterial({
  color: "white",
  roughness: 0,
  envMapIntensity: 1,
});

const Clump = ({ mat = new THREE.Matrix4(), vec = new THREE.Vector3() }) => {
  const isMobile = useIsMobileSize();
  const BALL_COUNT = isMobile ? 5 : 10;
  const force = -40;
  const texture = useTexture("/cross.jpg");
  const [ref, api] = useSphere<THREE.InstancedMesh>(() => ({
    args: [1],
    mass: 1,
    angularDamping: 0.1,
    linearDamping: 0.65,
    position: [rfs(20), rfs(20), rfs(20)],
  }));
  useFrame(() => {
    for (let i = 0; i < BALL_COUNT; i++) {
      // Get current whereabouts of the instanced sphere
      ref.current?.getMatrixAt(i, mat);
      // Normalize the position and multiply by a negative force.
      // This is enough to drive it towards the center-point.
      api
        .at(i)
        .applyForce(
          vec.setFromMatrixPosition(mat).normalize().multiplyScalar(force).toArray(),
          [0, 0, 0],
        );
    }
  });
  return (
    <instancedMesh
      key={BALL_COUNT}
      ref={ref}
      castShadow
      receiveShadow
      args={[sphereGeometry, baubleMaterial, BALL_COUNT]}
      material-map={texture}
    ></instancedMesh>
  );
};

function Pointer() {
  const isTouch = useIsTouch();
  const viewport = useThree((state) => state.viewport);
  const [ref, api] = useSphere<THREE.Mesh>(() => ({
    type: "Kinematic",
    args: [3],
    position: [0, 0, 0],
  }));
  useFrame((state) => {
    if (isTouch) return;
    api.position.set(
      (state.pointer.x * viewport.width) / 2,
      (state.pointer.y * viewport.height) / 2,
      0,
    );
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshBasicMaterial fog={false} depthTest={false} color="black" />
    </mesh>
  );
}
