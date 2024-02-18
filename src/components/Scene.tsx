import { Physics, useSphere } from "@react-three/cannon";
import {
  Environment,
  Grid,
  Html,
  RoundedBox,
  Scroll,
  ScrollControls,
  Text,
  Text3D,
  useProgress,
  useTexture,
} from "@react-three/drei";
import { Canvas, Object3DNode, extend, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, N8AO, SMAA, TiltShift2 } from "@react-three/postprocessing";
import { easing, geometry } from "maath";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { useSceneStore } from "../utils/store";

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
  const gravity = useSceneStore((s) => s.gravity);

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

        <Physics gravity={[0, gravity, 0]} iterations={10}>
          <ScrollControls pages={3} damping={0.2}>
            <Scroll>
              <TopScene />
            </Scroll>

            <Scroll html>
              <section className="about-container">
                <p>
                  Hello. I&apos;m Andras, a software developer from Budapest, Hungary. I
                  usually build apps for the web and like to work on the frontend. I love
                  a great UX, embrace clean code, standards, appreciate unique designs and
                  simple solutions while working with modern and effective tools. I take
                  pride in my work.
                </p>
              </section>

              <section className="contact-container">
                <a
                  target="_blank"
                  href="https://www.linkedin.com/in/andras-lassu-866209a4/"
                >
                  <svg
                    width="50"
                    height="50"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                  >
                    <path
                      d="M2 1C1.44772 1 1 1.44772 1 2V13C1 13.5523 1.44772 14 2 14H13C13.5523 14 14 13.5523 14 13V2C14 1.44772 13.5523 1 13 1H2ZM3.05 6H4.95V12H3.05V6ZM5.075 4.005C5.075 4.59871 4.59371 5.08 4 5.08C3.4063 5.08 2.925 4.59871 2.925 4.005C2.925 3.41129 3.4063 2.93 4 2.93C4.59371 2.93 5.075 3.41129 5.075 4.005ZM12 8.35713C12 6.55208 10.8334 5.85033 9.67449 5.85033C9.29502 5.83163 8.91721 5.91119 8.57874 6.08107C8.32172 6.21007 8.05265 6.50523 7.84516 7.01853H7.79179V6.00044H6V12.0047H7.90616V8.8112C7.8786 8.48413 7.98327 8.06142 8.19741 7.80987C8.41156 7.55832 8.71789 7.49825 8.95015 7.46774H9.02258C9.62874 7.46774 10.0786 7.84301 10.0786 8.78868V12.0047H11.9847L12 8.35713Z"
                      fill="currentColor"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  LinkedIn
                </a>

                <a target="_blank" href="https://github.com/la55u">
                  <svg
                    width="50"
                    height="50"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.49933 0.25C3.49635 0.25 0.25 3.49593 0.25 7.50024C0.25 10.703 2.32715 13.4206 5.2081 14.3797C5.57084 14.446 5.70302 14.2222 5.70302 14.0299C5.70302 13.8576 5.69679 13.4019 5.69323 12.797C3.67661 13.235 3.25112 11.825 3.25112 11.825C2.92132 10.9874 2.44599 10.7644 2.44599 10.7644C1.78773 10.3149 2.49584 10.3238 2.49584 10.3238C3.22353 10.375 3.60629 11.0711 3.60629 11.0711C4.25298 12.1788 5.30335 11.8588 5.71638 11.6732C5.78225 11.205 5.96962 10.8854 6.17658 10.7043C4.56675 10.5209 2.87415 9.89918 2.87415 7.12104C2.87415 6.32925 3.15677 5.68257 3.62053 5.17563C3.54576 4.99226 3.29697 4.25521 3.69174 3.25691C3.69174 3.25691 4.30015 3.06196 5.68522 3.99973C6.26337 3.83906 6.8838 3.75895 7.50022 3.75583C8.1162 3.75895 8.73619 3.83906 9.31523 3.99973C10.6994 3.06196 11.3069 3.25691 11.3069 3.25691C11.7026 4.25521 11.4538 4.99226 11.3795 5.17563C11.8441 5.68257 12.1245 6.32925 12.1245 7.12104C12.1245 9.9063 10.4292 10.5192 8.81452 10.6985C9.07444 10.9224 9.30633 11.3648 9.30633 12.0413C9.30633 13.0102 9.29742 13.7922 9.29742 14.0299C9.29742 14.2239 9.42828 14.4496 9.79591 14.3788C12.6746 13.4179 14.75 10.7025 14.75 7.50024C14.75 3.49593 11.5036 0.25 7.49933 0.25Z"
                      fill="currentColor"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  GitHub
                </a>

                <a target="_blank" href="mailto:andras.lassu@gmail.com">
                  <svg
                    width="50"
                    height="50"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 2C0.447715 2 0 2.44772 0 3V12C0 12.5523 0.447715 13 1 13H14C14.5523 13 15 12.5523 15 12V3C15 2.44772 14.5523 2 14 2H1ZM1 3L14 3V3.92494C13.9174 3.92486 13.8338 3.94751 13.7589 3.99505L7.5 7.96703L1.24112 3.99505C1.16621 3.94751 1.0826 3.92486 1 3.92494V3ZM1 4.90797V12H14V4.90797L7.74112 8.87995C7.59394 8.97335 7.40606 8.97335 7.25888 8.87995L1 4.90797Z"
                      fill="currentColor"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  E-mail
                </a>
              </section>
            </Scroll>

            <Scroll>
              <Boxes />
            </Scroll>

            {/*             <Text2 />           */}

            <Scroll>
              <Ground />
            </Scroll>
          </ScrollControls>
        </Physics>

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
  const { progress } = useProgress();
  return (
    <Html center className="loader">
      {Math.floor(progress)} %
    </Html>
  );
}

const TopScene = () => {
  return (
    <>
      <BigText />
      <Pointer />
      <Clump />
    </>
  );
};

// function Lens({ children, damping = 0.15, ...props }) {
//   const ref = useRef<THREE.Mesh>();
//   const { nodes } = useGLTF("/lens.glb");
//   const buffer = useFBO();
//   const viewport = useThree((state) => state.viewport);
//   const [scene] = useState(() => new THREE.Scene());
//   useFrame((state, delta) => {
//     // Tie lens to the pointer
//     // getCurrentViewport gives us the width & height that would fill the screen in threejs units
//     // By giving it a target coordinate we can offset these bounds, for instance width/height for a plane that
//     // sits 15 units from 0/0/0 towards the camera (which is where the lens is)
//     const viewport = state.viewport.getCurrentViewport(state.camera, [0, 0, 15]);
//     easing.damp3(
//       ref.current.position,
//       [
//         (state.pointer.x * viewport.width) / 2,
//         (state.pointer.y * viewport.height) / 2,
//         15,
//       ],
//       damping,
//       delta
//     );
//     // This is entirely optional but spares us one extra render of the scene
//     // The createPortal below will mount the children of <Lens> into the new THREE.Scene above
//     // The following code will render that scene into a buffer, whose texture will then be fed into
//     // a plane spanning the full screen and the lens transmission material
//     state.gl.setRenderTarget(buffer);
//     state.gl.setClearColor("#d8d7d7");
//     state.gl.render(scene, state.camera);
//     state.gl.setRenderTarget(null);
//   });
//   return (
//     <>
//       {createPortal(children, scene)}
//       <mesh scale={[viewport.width, viewport.height, 1]}>
//         <planeGeometry />
//         <meshBasicMaterial map={buffer.texture} />
//       </mesh>
//       <mesh
//         scale={0.25}
//         ref={ref}
//         rotation-x={Math.PI / 2}
//         // @ts-expect-error
//         geometry={nodes.Cylinder.geometry}
//         {...props}
//       >
//         <MeshTransmissionMaterial
//           buffer={buffer.texture}
//           ior={1.2}
//           thickness={1.5}
//           anisotropy={0.1}
//           chromaticAberration={0.04}
//         />
//       </mesh>
//     </>
//   );
// }

const Boxes = () => {
  const state = useThree();
  const box1Ref = useRef<THREE.Mesh>(null);
  const box2Ref = useRef<THREE.Mesh>(null);
  const box3Ref = useRef<THREE.Mesh>(null);
  const { height } = state.viewport;

  useFrame((state, delta) => {
    box1Ref.current!.rotation.z += delta / 5;
    box2Ref.current!.rotation.z += delta / 7;
    box3Ref.current!.rotation.z -= delta / 6;
  });

  return (
    <group position={[0, -height, 0.5]}>
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

// const Text2 = () => {
//   const scroll = useScroll();
//   const { viewport, gl, camera } = useThree();
//   const { width, height } = viewport.getCurrentViewport(camera, [0, 0, 10]);
//   const connectorRef = useRef<THREE.Mesh>();
//   const { nodes, materials } = useGLTF("/connector.glb");
//   const stencil = useMask(1);
//   const maskRef = useRef<THREE.Mesh>();

//   useFrame((state, delta) => {
//     //easing.dampE(ref.current.rotation, [], 0.2, delta)
//     connectorRef.current.rotation.z += delta / 6;
//     connectorRef.current.rotation.y += delta / 6;

//     // console.log(scroll.delta);
//     const scale = Math.pow(1 + scroll.offset, 2); //* (1 + scroll.offset);
//     //console.log(scale);
//     //maskRef.current.scale.set(scale, scale, scale);
//   });

//   const clampedFontSize = THREE.MathUtils.clamp(width / 8, 0.6, 0.8);
//   //console.log("clamped:", clampedFontSize);

//   return (
//     <group position={[0, -height * 4, 0]}>
//       <Mask id={1} ref={maskRef} position={[0, 0, 0.95]}>
//         <circleGeometry args={[100, 64]} />
//       </Mask>

//       <Circle args={[THREE.MathUtils.clamp(width / 2, 5, 10), 64]} position={[0, 0, -1]}>
//         <meshBasicMaterial color="black" {...stencil} />
//       </Circle>

//       <Text
//         font="/GeistMono-Regular.woff"
//         anchorX="center"
//         maxWidth={width / 1.5}
//         fontSize={clampedFontSize}
//       >
//         I like creating stunning visuals and great user experiences.
//         <meshBasicMaterial color="white" {...stencil} />
//       </Text>

//       <mesh
//         ref={connectorRef}
//         receiveShadow
//         scale={12}
//         //@ts-expect-error
//         geometry={nodes.connector.geometry}
//         position={[width / 2.5, -3, 1]}
//       >
//         <meshStandardMaterial
//           envMapIntensity={1}
//           color="springgreen"
//           roughness={0} /* map={materials.base.map}  */
//         />
//         {/* <MeshTransmissionMaterial
//           clearcoat={1}
//           thickness={0.1}
//           anisotropicBlur={0.1}
//           chromaticAberration={0.1}
//           samples={8}
//           resolution={512}
//         /> */}
//       </mesh>
//     </group>
//   );
// };

// // function Geometry({ r, position, ...props }) {
// //   const ref = useRef<THREE.Group>();
// //   useFrame((state) => {
// //     ref.current.rotation.x = ref.current.rotation.y = ref.current.rotation.z += 0.004 * r;
// //     ref.current.position.y =
// //       position[1] + Math[r > 0.5 ? "cos" : "sin"](state.clock.getElapsedTime() * r) * r;
// //   });
// //   return (
// //     <group position={position} ref={ref}>
// //       <mesh {...props} />
// //     </group>
// //   );
// // }

// // function Geometries() {
// //   const { items, material } = useStore();
// //   const transition = useTransition(items, {
// //     from: { scale: [0, 0, 0], rotation: [0, 0, 0] },
// //     enter: ({ r }) => ({ scale: [1, 1, 1], rotation: [r * 3, r * 3, r * 3] }),
// //     leave: { scale: [0.1, 0.1, 0.1], rotation: [0, 0, 0] },
// //     config: { mass: 5, tension: 1000, friction: 100 },
// //     trail: 100,
// //   });
// //   return transition((props, { position: [x, y, z], r, geometry }) => (
// //     <Geometry
// //       position={[x * 3, y * 3, z]}
// //       material={material}
// //       geometry={geometry}
// //       r={r}
// //       {...props}
// //     />
// //   ));
// // }

// // prettier-ignore
// const items = [
//     { position: [0.25, 1.8, -6], r: 0.5, geometry: new THREE.SphereGeometry(1, 32, 32) },
//     { position: [-1.5, 0, 2], r: 0.2, geometry: new THREE.TetrahedronGeometry(2) },
//     { position: [1, -0.75, 4], r: 0.3, geometry: new THREE.CylinderGeometry(0.8, 0.8, 2, 32) },
//     { position: [-0.7, 0.5, 6], r: 0.4, geometry: new THREE.ConeGeometry(1.1, 1.7, 32) },
//     { position: [0.5, -1.2, -6], r: 0.9, geometry: new THREE.SphereGeometry(1.5, 32, 32) },
//     { position: [-0.5, 2.5, -2], r: 0.6, geometry: new THREE.IcosahedronGeometry(2) },
//     { position: [-0.8, -0.75, 3], r: 0.35, geometry: new THREE.TorusGeometry(1.1, 0.35, 16, 32) },
//     { position: [1.5, 0.5, -2], r: 0.8, geometry: new THREE.OctahedronGeometry(2) },
//     { position: [-1, -0.5, -6], r: 0.5, geometry: new THREE.SphereGeometry(1.5, 32, 32) },
//     { position: [1, 1.9, -1], r: 0.2, geometry: new THREE.BoxGeometry(2.5, 2.5, 2.5) },
//   ];

// const CustomGrid = ({ number = 23, lineWidth = 0.026 }) => {
//   const { viewport, gl, camera } = useThree();
//   const { width, height } = viewport.getCurrentViewport(camera, [0, 0, 10]);
//   return (
//     // Renders a grid and crosses as instances
//     <Instances position={[0, -height * 5, 0]}>
//       <planeGeometry args={[lineWidth, height]} />
//       <meshBasicMaterial color="#999" />
//       {Array.from({ length: number }, (_, y) =>
//         Array.from({ length: number }, (_, x) => (
//           <group
//             key={x + ":" + y}
//             position={[
//               x * 2 - Math.floor(number / 2) * 2,
//               -0.01,
//               y * 2 - Math.floor(number / 2) * 2,
//             ]}
//           >
//             <Instance rotation={[-Math.PI / 2, 0, 0]} />
//             <Instance rotation={[-Math.PI / 2, 0, Math.PI / 2]} />
//           </group>
//         ))
//       )}
//       <gridHelper args={[100, 100, "#bbb", "#bbb"]} position={[0, -0.01, 0]} />
//     </Instances>
//   );
// };

const Ground = () => {
  const { viewport, camera } = useThree();
  const { width, height } = viewport.getCurrentViewport(camera, [0, 0, 10]);
  const ref = useRef(null);

  // Log the bounding box dimensions when the component mounts
  useEffect(() => {
    if (ref.current) {
      const boundingBox = new THREE.Box3().setFromObject(ref.current);
      const size = boundingBox.getSize(new THREE.Vector3());
      console.log("Bounding box size:", size);
    }
  }, []);

  console.log("width:", width);

  return (
    <group position={[0, -height * 3.4, 0]}>
      <Text3D
        ref={ref}
        font="/MajorMonoDisplay-Regular.json"
        castShadow
        //rotation={[-Math.PI / 2, 0, 0]}
        position={[-7.55, -4.45, 0]}
        height={0.5}
        letterSpacing={0.2}
        size={1.2}
      >
        {"let's talk"}
        <meshStandardMaterial roughness={0} envMapIntensity={1} color="black" />
      </Text3D>

      <Grid
        args={[40, 40]}
        position={[0, -4.5, 0]}
        fadeDistance={30}
        cellThickness={0.5}
        sectionColor="gray"
        cellColor="dimgray"
      />
    </group>
  );
};

const BigText = () => {
  const isSmallScreen = window.matchMedia("(max-width: 1000px)").matches;
  const text = isSmallScreen ? "ANDRAS\nLASSU" : "ANDRAS LASSU";
  const textRef = useRef<THREE.Group>();
  const { viewport } = useThree();
  const { width } = viewport;

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
        state.pointer.y * 1.5,
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

const Clump = ({ mat = new THREE.Matrix4(), vec = new THREE.Vector3() }) => {
  const BALL_COUNT = 10;
  const force = useSceneStore((s) => s.force);
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
          [0, 0, 0]
        );
    }
  });
  return (
    <instancedMesh
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
  const [ref, api] = useSphere<THREE.Mesh>(() => ({
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
    <mesh ref={ref}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshBasicMaterial fog={false} depthTest={false} color="black" />
    </mesh>
  );
}
