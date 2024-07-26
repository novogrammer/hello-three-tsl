declare module "three/webgpu"{
  export const loop: (params:{start:number,end:number}, method: ({}:{i:number}) => void) => void;

  export const Break: () => void;
  export const Continue: () => void;
}
import * as THREE from 'three/webgpu';

const { timerGlobal, tslFn, float,uv,vec4, positionLocal, texture,loop } =THREE;

export function makeMyColorNode(uvTexture:THREE.Texture){
  const changingColor=tslFn(([base=vec4(1,1,1,1),green=float(0),blue=float(0)])=>{
    const total = float( 0 ).toVar();
    loop({start:0,end:2},()=>{
      total.addAssign(float(.5));
    });
  
  
    return base.mul(vec4(total,green,blue,1));
  });
  
  const base=texture(uvTexture,uv().mul(1.0));
  const blue=timerGlobal(1).mul(Math.PI*2).sin().mul(0.5).add(0.5);
  const green=positionLocal.y;
  // material.positionNode=vec3(positionLocal.x,0,positionLocal.z)
    return changingColor(base,green,blue);
}
