import { Physics, useSphere } from "@react-three/cannon";
import { Environment, Text, useTexture } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, N8AO, SMAA, TiltShift2 } from "@react-three/postprocessing";
import { easing } from "maath";
import * as THREE from "three";

export const Scene = () => {
  return (
    <Canvas
      shadows
      gl={{ antialias: false }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 20], fov: 35, near: 1, far: 40 }}
    >
      <ambientLight intensity={0.5} />
      <color attach="background" args={["#dfdfdf"]} />
      <spotLight
        intensity={1}
        angle={0.2}
        penumbra={1}
        position={[30, 30, 30]}
        castShadow
        shadow-mapSize={[512, 512]}
      />

      <Text
        font={"/MajorMonoDisplay-Regular.ttf"}
        fontSize={2.6}
        letterSpacing={-0.025}
        color="black"
      >
        Andras Lassu
      </Text>

      <Physics gravity={[0, 2, 0]} iterations={10}>
        <Pointer />
        <Clump />
      </Physics>

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
        <TiltShift2 blur={0.05} />
      </EffectComposer>
    </Canvas>
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
  useFrame((state) =>
    api.position.set(
      (state.pointer.x * viewport.width) / 2,
      (state.pointer.y * viewport.height) / 2,
      0
    )
  );
  return (
    // @ts-expect-error
    <mesh ref={ref}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshBasicMaterial fog={false} depthTest={false} color="black" />
    </mesh>
  );
}
