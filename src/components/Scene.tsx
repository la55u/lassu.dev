import { Physics, useSphere } from "@react-three/cannon";
import {
  Box,
  Environment,
  Html,
  MeshTransmissionMaterial,
  Scroll,
  ScrollControls,
  Text,
  useGLTF,
  useProgress,
  useScroll,
  useTexture,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, N8AO, SMAA, TiltShift2 } from "@react-three/postprocessing";
import { easing } from "maath";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import { useSceneStore } from "~utils/store";

export const Scene = () => {
  return (
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

        <ScrollControls pages={3} damping={0.5} distance={0.5}>
          <Scroll>
            <TopScene />
          </Scroll>
        </ScrollControls>

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
  );
};

function Loader() {
  const { active, progress } = useProgress();
  return (
    <Html center className="loader">
      {Math.floor(progress)} %
    </Html>
  );
}

const TopScene = () => {
  const scroll = useScroll();

  const setForce = useSceneStore((s) => s.setForce);
  const resetForce = useSceneStore((s) => s.resetForce);
  const setStrongGravity = useSceneStore((s) => s.setStrongGravity);
  const resetGravity = useSceneStore((s) => s.resetGravity);
  const boxRef = useRef<THREE.Mesh>();

  const gravity = useSceneStore((s) => s.gravity);

  useFrame(() => {
    if (scroll.offset > 0.1) {
      setForce(Math.random() * 10);
      setStrongGravity();
    } else {
      resetForce();
      resetGravity();
    }
  });

  useFrame((state, delta) => {
    boxRef.current.rotation.z += delta / 4;
  });

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

  return (
    <>
      <BigText />

      <Box
        ref={boxRef}
        args={[5, 5, 5]}
        rotation={[0.4, 0.1, 1.1]}
        position={[0, -10, 0]}
      >
        <meshStandardMaterial />
      </Box>
      <Connector />

      <Physics gravity={[0, gravity, 0]} iterations={10}>
        <Pointer />
        <Clump />
      </Physics>
    </>
  );
};

const Connector = () => {
  const ref = useRef<THREE.Mesh>();
  const { nodes, materials } = useGLTF("/connector.glb");
  useFrame((state, delta) => {
    //easing.dampE(ref.current.rotation, [], 0.2, delta)
    easing.damp(ref.current.rotation, "z", 0.1, delta);
  });
  return (
    <mesh ref={ref} receiveShadow scale={12} geometry={nodes.connector.geometry}>
      <meshStandardMaterial metalness={0.2} roughness={0} map={materials.base.map} />
      <MeshTransmissionMaterial
        clearcoat={1}
        thickness={0.1}
        anisotropicBlur={0.1}
        chromaticAberration={0.1}
        samples={8}
        resolution={512}
      />
    </mesh>
  );
};

const BigText = () => {
  const scroll = useScroll();
  const isSmallScreen = window.matchMedia("(max-width: 1000px)").matches;
  const text = isSmallScreen ? "ANDRAS\nLASSU" : "ANDRAS LASSU";
  const fontSize = isSmallScreen ? 2 : 2.6;
  const textRef = useRef<THREE.Group>();
  // useFrame(() => {
  //   console.log(scroll.offset);
  //   textRef.current.position.setY(scroll.offset * 10);
  // });
  return (
    <Text
      ref={textRef}
      font={"/MajorMonoDisplay-Regular.woff"}
      fontSize={fontSize}
      letterSpacing={-0.025}
      color="black"
    >
      {text}
    </Text>
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
  const BALL_COUNT = 10;
  const force = useSceneStore((s) => s.force);
  const texture = useTexture("/cross.jpg");
  const [ref, api] = useSphere(() => ({
    args: [1],
    mass: 1,
    angularDamping: 0.1,
    linearDamping: 0.65,
    position: [rfs(20), rfs(20), rfs(20)],
  }));
  useFrame((state) => {
    for (let i = 0; i < BALL_COUNT; i++) {
      // Get current whereabouts of the instanced sphere
      // @ts-expect-error
      ref.current.getMatrixAt(i, mat);
      // Normalize the position and multiply by a negative force.
      // This is enough to drive it towards the center-point.
      api
        .at(i)
        .applyForce(
          vec.setFromMatrixPosition(mat).normalize().multiplyScalar(force).toArray(),
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
      args={[sphereGeometry, baubleMaterial, BALL_COUNT]}
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
