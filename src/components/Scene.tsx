import { Physics, useSphere } from "@react-three/cannon";
import {
  Environment,
  Html,
  Scroll,
  ScrollControls,
  Text,
  useProgress,
  useScroll,
  useTexture,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, N8AO, SMAA, TiltShift2 } from "@react-three/postprocessing";
import { group } from "console";
import { easing } from "maath";
import { Suspense, useRef } from "react";
import * as THREE from "three";

export const Scene = () => {
  return (
    <>
      <nav>
        <a className="logo" href="#">
          {"/home/la # "}
          <span className="blink">_</span>
        </a>

        <a id="home-reel-cta" href="#about">
          <span id="home-reel-cta-dot"></span>
          <span id="home-reel-cta-text">About</span>
          <span id="home-reel-cta-arrow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 16 16"
            >
              <path
                stroke="#fff"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.343 8h11.314m0 0L8.673 3.016M13.657 8l-4.984 4.984"
              ></path>
            </svg>
          </span>
        </a>
      </nav>

      <Canvas
        shadows
        gl={{ antialias: false }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 20], fov: 35, near: 1, far: 40 }}
      >
        <color attach="background" args={["#dfdfdf"]} />
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

          <TopScene />

          <Rig />

          <Environment files="/adamsbridge.hdr" />
          <EffectComposer disableNormalPass multisampling={0}>
            <N8AO
              halfRes
              color="greenyellow"
              aoRadius={2}
              intensity={1}
              aoSamples={6}
              denoiseSamples={4}
            />
            <SMAA />
            <TiltShift2 blur={0.06} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </>
  );
};

function Loader() {
  const { active, progress, errors, item, loaded, total } = useProgress();
  return <Html center>{progress} % loaded</Html>;
}

const TopScene = () => {
  const scrollData = useScroll();
  const groupRef = useRef<THREE.Group>();

  //   useFrame(() => {
  //     // console.log(scrollData);
  //     const scale = scrollData.range(0, 1 / 3);
  //     console.log(scale);
  //     groupRef.current.position.set(
  //       groupRef.current.position.x + scale,
  //       groupRef.current.position.y,
  //       groupRef.current.position.z
  //     );
  //   });

  const isSmallScreen = window.matchMedia("(max-width: 1000px)").matches;
  const text = isSmallScreen ? "ANDRAS\nLASSU" : "ANDRAS LASSU";
  const fontSize = isSmallScreen ? 2 : 2.6;

  return (
    <group>
      <Text
        ref={groupRef}
        font={"/MajorMonoDisplay-Regular.woff"}
        fontSize={fontSize}
        letterSpacing={-0.025}
        color="black"
      >
        {text}
      </Text>

      <Physics gravity={[0, 2, 0]} iterations={10}>
        <Pointer />

        <Clump />
      </Physics>
    </group>
  );
};

const Rig = () => {
  useFrame((state, delta) => {
    easing.damp3(
      state.camera.position,
      [
        Math.sin(-state.pointer.x) * 5,
        state.pointer.y * 3.5,
        15 + Math.cos(state.pointer.x) * 10,
      ],
      0.2,
      delta
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

const Clump = ({ mat = new THREE.Matrix4(), vec = new THREE.Vector3(), ...props }) => {
  const texture = useTexture("/cross.jpg");
  const [ref, api] = useSphere(() => ({
    args: [1],
    mass: 1,
    angularDamping: 0.1,
    linearDamping: 0.65,
    position: [rfs(20), rfs(20), rfs(20)],
  }));
  useFrame((state) => {
    for (let i = 0; i < 40; i++) {
      // Get current whereabouts of the instanced sphere
      // @ts-expect-error
      ref.current.getMatrixAt(i, mat);
      // Normalize the position and multiply by a negative force.
      // This is enough to drive it towards the center-point.
      api
        .at(i)
        .applyForce(
          vec.setFromMatrixPosition(mat).normalize().multiplyScalar(-40).toArray(),
          [0, 0, 0]
        );
    }
  });
  return (
    <instancedMesh
      // @ts-expect-error
      ref={ref}
      castShadow
      receiveShadow
      args={[sphereGeometry, baubleMaterial, 20]}
      material-map={texture}
    ></instancedMesh>
  );
};

function Pointer() {
  const viewport = useThree((state) => state.viewport);
  const [ref, api] = useSphere(() => ({
    type: "Kinematic",
    args: [3],
    position: [0, 0, 0],
  }));
  useFrame((state) => {
    api.position.set(
      (state.pointer.x * viewport.width) / 2,
      (state.pointer.y * viewport.height) / 2,
      0
    );
  });
  return (
    // @ts-expect-error
    <mesh ref={ref}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshBasicMaterial fog={false} depthTest={false} color="black" />
    </mesh>
  );
}
