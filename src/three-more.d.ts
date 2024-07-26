import "three/webgpu";

declare module "three/webgpu"{
  export const loop: (params:{start:number|THREE.ShaderNodeObject<THREE.Node>,end:number|THREE.ShaderNodeObject<THREE.Node>}, method: ({}:{i:THREE.ShaderNodeObject<THREE.Node>}) => void) => void;

  export const Break: () => void;
  export const Continue: () => void;

  // overwrite
  export const If: (boolNode: THREE.Node, method: () => void) => THREE.ShaderNodeObject<THREE.Node>;
}


