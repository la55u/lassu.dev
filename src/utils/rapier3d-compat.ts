// Shim for @react-three/rapier, which expects the rapier3d-compat API surface
// (module + async `init()`). We alias @dimforge/rapier3d-compat to this module
// and use @dimforge/rapier3d instead, whose WASM integration loads the module
// as a standard ES module (handled by vite-plugin-wasm), so `init` is a no-op.
// This ships the ~2 MB WASM as a separate streamed asset instead of
// base64-inlining it into the JS bundle.
export * from "@dimforge/rapier3d";

export const init = () => Promise.resolve();
