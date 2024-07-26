import "./three-more.d.ts";
import * as THREE from 'three/webgpu';

const { tslFn, float, vec2, vec3, mat3, dot, texture, sin, cos, atan2, uv, timerGlobal, radians, mod, length, sqrt, If } = THREE;

// from my shadertoy https://www.shadertoy.com/view/ltGGRW

const len2 = tslFn(([v_immutable]: [THREE.Node]): THREE.ShaderNodeObject<THREE.Node> => {
  const v = vec2(v_immutable).toVar();
  return dot(v, v);
});


// Get the rotation matrix from an axis and an angle (in radians)

const rotationAxisAngle = tslFn(([v_immutable, a_immutable]: [THREE.Node, THREE.Node]): THREE.ShaderNodeObject<THREE.Node> => {
  const v = vec3(v_immutable).toVar();
  const a = float(a_immutable).toVar();
  const si = sin(a).toVar();
  const co = cos(a).toVar();
  const ic = float(1.0).sub(co).toVar();
  return mat3(
    v.x.mul(v.x).mul(ic).add(co),
    v.y.mul(v.x).mul(ic).sub(si.mul(v.z)),
    v.z.mul(v.x).mul(ic).add(si.mul(v.y)),

    v.x.mul(v.y).mul(ic).add(si.mul(v.z)),
    v.y.mul(v.y).mul(ic).add(co),
    v.z.mul(v.y).mul(ic).sub(si.mul(v.x)),

    v.x.mul(v.z).mul(ic).sub(si.mul(v.y)),
    v.y.mul(v.z).mul(ic).add(si.mul(v.x)),
    v.z.mul(v.z).mul(ic).add(co)
  );
});



const rotateCoord = tslFn(([coord, rotation]: [THREE.Node, THREE.Node]): THREE.ShaderNodeObject<THREE.Node> => {
  return rotationAxisAngle(vec3(0, 0, 1), rotation).toVar().mul(vec3(coord, 1)).xy;
});


const repeatCoordHex = tslFn(([coord_immutable, unitLength_immutable]: [THREE.Node, THREE.Node]): THREE.ShaderNodeObject<THREE.VarNode> => {

  const unitLength = float(unitLength_immutable).toVar();
  const coord = vec2(coord_immutable).toVar();
  const rect = vec2(unitLength.mul(float(3.0)), sin(radians(60.0)).mul(unitLength).mul(2.0)).toVar();
  const rep = vec2(mod(coord, rect)).toVar();

  const p0 = rep.toVar();
  const p1 = vec2(rep.x.sub(rect.x), rep.y).toVar();
  const p2 = vec2(rep.x, rep.y.sub(rect.y)).toVar();
  const p3 = rep.sub(rect).toVar();
  const p4 = rep.sub(rect.mul(float(0.5))).toVar();
  const shortestLength = len2(p0).toVar();
  const result = p0.toVar();
  {
    const p=p1;
    const l = float(len2(p)).toVar();
    If(l.lessThan(shortestLength), () => {
      shortestLength.assign(l);
      result.assign(p);
    });
  }
  {
    const p=p2;
    const l = float(len2(p)).toVar();
    If(l.lessThan(shortestLength), () => {
      shortestLength.assign(l);
      result.assign(p);
    });
  }
  {
    const p=p3;
    const l = float(len2(p)).toVar();
    If(l.lessThan(shortestLength), () => {
      shortestLength.assign(l);
      result.assign(p);
    });
  }
  {
    const p=p4;
    const l = float(len2(p)).toVar();
    If(l.lessThan(shortestLength), () => {
      shortestLength.assign(l);
      result.assign(p);
    });
  }

  return result;

});

const calcCoord = tslFn(([coord_immutable]: [THREE.Node]): THREE.ShaderNodeObject<THREE.Node> => {
  const coord = vec2(coord_immutable).toVar();

  const l = length(coord);
  const angle = atan2(coord.y, coord.x).toVar();
  const rad60 = radians(60.0);
  angle.assign(mod(angle, rad60.mul(2.0)));

  If(rad60.lessThan(angle), () => {
    angle.assign(rad60.mul(2.0).sub(angle));
  });

  return vec2(cos(angle), sin(angle)).mul(l);
});


export function makeKaleidoscopeColorNode(colorTexture: THREE.Texture): THREE.Node {

  const center = vec2(0.5, 0.5);
  const rotation = timerGlobal(0.1);
  const unitLength = float(0.25).toVar();
  const scopeCenter = vec2(unitLength.mul(float(0.5)), unitLength.mul(float(0.5)).div(sqrt(float(3.0))));
  const rotatedKaleidoUv = rotateCoord(
    calcCoord(
      repeatCoordHex(
        rotateCoord(
          uv().sub(center),
          rotation
        ).add(scopeCenter),
        unitLength
      )
    ).sub(scopeCenter),
    rotation.negate()
  ).add(center);

  return texture(colorTexture, rotatedKaleidoUv.mul(4));

}
