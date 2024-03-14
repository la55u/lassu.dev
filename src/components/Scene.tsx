import {
  EnvelopeClosedIcon,
  FileTextIcon,
  GitHubLogoIcon,
  LinkedInLogoIcon,
} from "@radix-ui/react-icons";
import { Physics, useSphere } from "@react-three/cannon";
import {
  Capsule,
  Environment,
  Grid,
  Html,
  Preload,
  RoundedBox,
  Scroll,
  ScrollControls,
  Text,
  Text3D,
  Torus,
  useProgress,
  useScroll,
  useTexture,
} from "@react-three/drei";
import { Canvas, Object3DNode, extend, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, N8AO, SMAA, TiltShift2 } from "@react-three/postprocessing";
import { easing, geometry } from "maath";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import ghStat from "../../github_stats.json"; // generated during deploy
import { isMobileSize, timeAgo } from "../utils/helpers";
import { useGlobalStore } from "../utils/store";

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
      {/** This is a helper that pre-emptively makes threejs aware of all geometries, textures etc
               By default threejs will only process objects if they are "seen" by the camera leading 
               to jank as you scroll down. With <Preload> that's solved.  */}
      <Preload />

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

        <ScrollControls pages={3.4} damping={0.2}>
          <ScrollContents />
          <ScrollableHtml />
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

const ScrollableHtml = () => {
  const scroll = useScroll();
  const nav = useGlobalStore((s) => s.nav);

  useEffect(() => {
    if (!nav) return;
    const el = document.getElementById(nav);
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    console.log("top:", top);
    scroll.el.scrollTo({ top: top, behavior: "smooth" });
  }, [nav]);

  return (
    <Scroll html>
      <section className="about-container">
        <p id="about">
          Hello. I&apos;m Andras, a software developer from Budapest, Hungary. I usually
          build apps for the web and like to work on the frontend. I love a great UX,
          embrace clean code, standards, appreciate unique designs and simple solutions
          while working with modern and effective tools. I take pride in my work.
        </p>
      </section>

      <section className="github-stats">
        <div>
          <h2>I love open-source</h2>
          <ul>
            <li>Issues opened: {ghStat.issuesOpened}</li>
            <li>PRs merged: {ghStat.pullRequestsMerged}</li>
            <li>Comments: {ghStat.commentsOnIssues}</li>
            <li>Commits: {ghStat.totalCommits}</li>
            <li>Public repos: {ghStat.publicRepoCount}</li>
            <li>Stars: {ghStat.totalStars}</li>
            <li>Followers: {ghStat.followers}</li>
            <li>
              Registered: {new Date(ghStat.registeredDate).toLocaleDateString()}
              <span className="ago"> ({timeAgo(ghStat.registeredDate)})</span>
            </li>
            <li>
              First PR: {new Date(ghStat.firstPullRequestDate).toLocaleDateString()}
              <span className="ago"> ({timeAgo(ghStat.firstPullRequestDate)})</span>
            </li>
            <li>Sponsored: {ghStat.sponsoredAccounts} accounts</li>
          </ul>
          <div className="updated">
            Updated: {new Date(ghStat.statUpdated).toLocaleDateString()}
          </div>
        </div>
      </section>

      <section className="contact-container">
        {/* <TextRing text="Open to work ✦ Open to work ✦ " /> */}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://cv-andras-lassu.vercel.app"
        >
          <FileTextIcon width={50} height={50} />
          Open CV
        </a>
        <a
          id="contact"
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.linkedin.com/in/andras-lassu-866209a4/"
        >
          <LinkedInLogoIcon width={50} height={50} />
          LinkedIn
        </a>
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/la55u">
          <GitHubLogoIcon width={50} height={50} />
          GitHub
        </a>
        <a target="_blank" rel="noopener noreferrer" href="mailto:andras.lassu@gmail.com">
          <EnvelopeClosedIcon width={50} height={50} />
          E-mail
        </a>
      </section>
    </Scroll>
  );
};

const ScrollContents = () => {
  return (
    <>
      <Scroll>
        <Physics iterations={10}>
          <TopScene />
        </Physics>
      </Scroll>

      <Scroll>
        <FloatingShapes />
      </Scroll>

      <Scroll>
        <Ground />
      </Scroll>
    </>
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
      <BannerText />
      <Pointer />
      <Clump />
    </>
  );
};

const FloatingShapes = () => {
  const state = useThree();
  const box1Ref = useRef<THREE.Mesh>(null);
  const box2Ref = useRef<THREE.Mesh>(null);
  const box3Ref = useRef<THREE.Mesh>(null);
  const { height } = state.viewport;

  useFrame((state, delta) => {
    box1Ref.current!.rotation.x += delta / 5;
    box2Ref.current!.rotation.z += delta / 7;
    box3Ref.current!.rotation.z -= delta / 7;
  });

  return (
    <group position={[0, -height, 0.5]}>
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
      <Torus
        ref={box1Ref}
        args={[1, 0.5, 16, 30]}
        rotation={[6, 2.8, 0.5]}
        position={[-8, 2, -3]}
      >
        <meshStandardMaterial roughness={0} envMapIntensity={1} />
      </Torus>
      <Capsule
        args={[1, 1.5, 14, 20]}
        ref={box3Ref}
        rotation={[-0.4, 0.2, 2.1]}
        position={[7, -4, -3]}
      >
        <meshStandardMaterial roughness={0} envMapIntensity={1} />
      </Capsule>
    </group>
  );
};

const Ground = () => {
  const { viewport, camera } = useThree();
  const { height } = viewport.getCurrentViewport(camera, [0, 0, 0]);
  const ref = useRef<THREE.Mesh>(null);

  // Log the bounding box dimensions when the component mounts
  useEffect(() => {
    if (ref.current) {
      const boundingBox = new THREE.Box3().setFromObject(ref.current);
      const size = boundingBox.getSize(new THREE.Vector3());
      ref.current.position.setX((-1 * size.x) / 2);
    }
  }, []);

  if (isMobileSize()) return <></>;

  console.log(height);

  return (
    <group position={[0, -height * 2.2, 0]}>
      <Text3D
        ref={ref}
        font="/fonts/MajorMonoDisplay/MajorMonoDisplay-Regular.json"
        castShadow
        //rotation={[-Math.PI / 2, 0, 0]}
        //position={[-7.55, -4.45, 0]}
        position={[0, -4.45, 0]}
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

const BannerText = () => {
  const isMobile = isMobileSize(1000);
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
  const isMobile = isMobileSize();
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
