import { Physics, useSphere } from "@react-three/cannon";
import {
  Box,
  Center,
  Circle,
  Environment,
  Grid,
  Html,
  Instance,
  Instances,
  Mask,
  MeshTransmissionMaterial,
  RoundedBox,
  Scroll,
  ScrollControls,
  Text,
  Text3D,
  useFBO,
  useGLTF,
  useIntersect,
  useMask,
  useProgress,
  useScroll,
  useTexture,
} from "@react-three/drei";
import {
  Canvas,
  createPortal,
  extend,
  useFrame,
  useThree,
  Object3DNode,
  MeshProps,
} from "@react-three/fiber";
import { EffectComposer, N8AO, SMAA, TiltShift2 } from "@react-three/postprocessing";
import { setMaxListeners } from "events";
import { easing, geometry } from "maath";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { useSceneStore } from "~utils/store";

extend({ RoundedPlaneGeometry: geometry.RoundedPlaneGeometry });

declare module "@react-three/fiber" {
  interface ThreeElements {
    roundedPlaneGeometry: Object3DNode<
      geometry.RoundedPlaneGeometry,
      typeof geometry.RoundedPlaneGeometry
    >;
  }
}

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

        <ScrollControls pages={4} damping={0.2}>
          <Scroll>
            <TopScene />
          </Scroll>

          <Scroll>
            <Text1 />
            <Text2 />
            <Text3 />
          </Scroll>
        </ScrollControls>

        <Rig />

        <Environment files="/adamsbridge.hdr" />
        <EffectComposer disableNormalPass multisampling={0} stencilBuffer>
          <N8AO
            halfRes
            color="greenyellow"
            aoRadius={2}
            intensity={1}
            aoSamples={6}
            denoiseSamples={4}
          />
          <SMAA />
          <TiltShift2 blur={0.02} />
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

      <Physics gravity={[0, gravity, 0]} iterations={10}>
        <Pointer />
        <Clump />
      </Physics>
    </>
  );
};

function Lens({ children, damping = 0.15, ...props }) {
  const ref = useRef<THREE.Mesh>();
  const { nodes } = useGLTF("/lens.glb");
  const buffer = useFBO();
  const viewport = useThree((state) => state.viewport);
  const [scene] = useState(() => new THREE.Scene());
  useFrame((state, delta) => {
    // Tie lens to the pointer
    // getCurrentViewport gives us the width & height that would fill the screen in threejs units
    // By giving it a target coordinate we can offset these bounds, for instance width/height for a plane that
    // sits 15 units from 0/0/0 towards the camera (which is where the lens is)
    const viewport = state.viewport.getCurrentViewport(state.camera, [0, 0, 15]);
    easing.damp3(
      ref.current.position,
      [
        (state.pointer.x * viewport.width) / 2,
        (state.pointer.y * viewport.height) / 2,
        15,
      ],
      damping,
      delta
    );
    // This is entirely optional but spares us one extra render of the scene
    // The createPortal below will mount the children of <Lens> into the new THREE.Scene above
    // The following code will render that scene into a buffer, whose texture will then be fed into
    // a plane spanning the full screen and the lens transmission material
    state.gl.setRenderTarget(buffer);
    state.gl.setClearColor("#d8d7d7");
    state.gl.render(scene, state.camera);
    state.gl.setRenderTarget(null);
  });
  return (
    <>
      {createPortal(children, scene)}
      <mesh scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} />
      </mesh>
      <mesh
        scale={0.25}
        ref={ref}
        rotation-x={Math.PI / 2}
        geometry={nodes.Cylinder.geometry}
        {...props}
      >
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={1.2}
          thickness={1.5}
          anisotropy={0.1}
          chromaticAberration={0.04}
        />
      </mesh>
    </>
  );
}

const Text1 = () => {
  const state = useThree();
  const box1Ref = useRef<THREE.Mesh>();
  const box2Ref = useRef<THREE.Mesh>();
  const box3Ref = useRef<THREE.Mesh>();
  const { width, height } = state.viewport;

  useFrame((state, delta) => {
    box1Ref.current.rotation.z += delta / 5;
    box2Ref.current.rotation.z += delta / 7;
    box3Ref.current.rotation.z -= delta / 6;
  });

  console.log("width:", width);

  return (
    <group position={[0, -height, 0.5]}>
      <Text
        font="/GeistMono-Regular.woff"
        maxWidth={Math.min(width - 2, 15)}
        anchorX="center"
        color="black"
        letterSpacing={-0.05}
        lineHeight={1.1}
      >
        Hi. I&apos;m Andras, a software developer from Budapest, Hungary. I work primarily
        on the frontend.
      </Text>

      <instancedMesh>
        <RoundedBox
          radius={0.4}
          smoothness={8}
          ref={box1Ref}
          args={[2, 2, 2]}
          rotation={[0.6, 1.1, 0.5]}
          position={[-8, 2, -3]}
        >
          <meshStandardMaterial roughness={0} envMapIntensity={1} />
        </RoundedBox>
        <RoundedBox
          radius={0.5}
          smoothness={8}
          ref={box2Ref}
          args={[5, 5, 5]}
          rotation={[0.4, 0.1, 1.1]}
          position={[0, 0, -5]}
        >
          <meshStandardMaterial roughness={0} envMapIntensity={1} />
        </RoundedBox>
        <RoundedBox
          radius={0.4}
          smoothness={8}
          ref={box3Ref}
          args={[2, 2, 2]}
          rotation={[-0.4, 0.2, 2.1]}
          position={[7, -4, -3]}
        >
          <meshStandardMaterial roughness={0} envMapIntensity={1} />
        </RoundedBox>
      </instancedMesh>
    </group>
  );
};

const Text2 = () => {
  const scroll = useScroll();
  const { viewport, gl, camera } = useThree();
  const { width, height } = viewport.getCurrentViewport(camera, [0, 0, 10]);
  const connectorRef = useRef<THREE.Mesh>();
  const { nodes, materials } = useGLTF("/connector.glb");
  const stencil = useMask(1);
  const maskRef = useRef<THREE.Mesh>();

  useFrame((state, delta) => {
    //easing.dampE(ref.current.rotation, [], 0.2, delta)
    connectorRef.current.rotation.z += delta / 6;
    connectorRef.current.rotation.y += delta / 6;

    // console.log(scroll.delta);
    const scale = Math.pow(1 + scroll.offset, 2); //* (1 + scroll.offset);
    //console.log(scale);
    //maskRef.current.scale.set(scale, scale, scale);
  });

  const clampedFontSize = THREE.MathUtils.clamp(width / 8, 0.6, 0.8);
  //console.log("clamped:", clampedFontSize);

  return (
    <group position={[0, -height * 4, 0]}>
      <Mask id={1} ref={maskRef} position={[0, 0, 0.95]}>
        <circleGeometry args={[100, 64]} />
      </Mask>

      <Circle args={[THREE.MathUtils.clamp(width / 2, 5, 10), 64]} position={[0, 0, -1]}>
        <meshBasicMaterial color="black" {...stencil} />
      </Circle>

      <Text
        font="/GeistMono-Regular.woff"
        anchorX="center"
        maxWidth={width / 1.5}
        fontSize={clampedFontSize}
      >
        I like creating stunning visuals and great user experiences.
        <meshBasicMaterial color="white" {...stencil} />
      </Text>

      <mesh
        ref={connectorRef}
        receiveShadow
        scale={12}
        //@ts-expect-error
        geometry={nodes.connector.geometry}
        position={[width / 2.5, -3, 1]}
      >
        <meshStandardMaterial
          envMapIntensity={1}
          color="springgreen"
          roughness={0} /* map={materials.base.map}  */
        />
        {/* <MeshTransmissionMaterial
          clearcoat={1}
          thickness={0.1}
          anisotropicBlur={0.1}
          chromaticAberration={0.1}
          samples={8}
          resolution={512}
        /> */}
      </mesh>
    </group>
  );
};

const Text3 = () => {
  const { viewport, gl, camera } = useThree();
  const { width, height } = viewport.getCurrentViewport(camera, [0, 0, 10]);

  return (
    <group position={[0, -height * 5, 0]}>
      <Grid
        args={[40, 40]}
        position={[0, -4.5, 0]}
        fadeDistance={30}
        cellThickness={1}
        sectionColor="black"
      />
    </group>
  );
};

const BigText = () => {
  const isSmallScreen = window.matchMedia("(max-width: 1000px)").matches;
  const text = isSmallScreen ? "ANDRAS\nLASSU" : "ANDRAS LASSU";
  const fontSize = isSmallScreen ? 2 : 2.6;
  const textRef = useRef<THREE.Group>();
  const { viewport, gl, camera } = useThree();
  const { width } = viewport;

  //console.log("viewport width:", width);

  return (
    <Text
      ref={textRef}
      font={"/MajorMonoDisplay-Regular.woff"}
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
