import { getElementSize } from './dom_utils.ts';

import './style.scss'


import "./three-more.d.ts";
import * as THREE from 'three/webgpu';

import GUI from "lil-gui";

const { tslFn, uniform, storage, attribute, float, vec2, vec3, color, instanceIndex } = THREE;


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `<section class="p-section-first"></section>`;


const sectionFirst = document.querySelector<HTMLHtmlElement>(".p-section-first");

if (!sectionFirst) {
  throw new Error("sectionFirst is null");
}

const { width, height } = getElementSize(sectionFirst);




const pointerVector = new THREE.Vector2(- 10.0, - 10.0); // Out of bounds first
const scaleVector = new THREE.Vector2(1, 1);

const camera = new THREE.OrthographicCamera(- 1.0, 1.0, 1.0, - 1.0, 0, 1);
camera.position.z = 1;

const scene = new THREE.Scene();

// initialize particles

const particleNum = 300000;
const particleSize = 2; // vec2

// create buffers

const particleBuffer = new THREE.StorageInstancedBufferAttribute(particleNum, particleSize);
const velocityBuffer = new THREE.StorageInstancedBufferAttribute(particleNum, particleSize);

const particleBufferNode = storage(particleBuffer, 'vec2', particleNum);
const velocityBufferNode = storage(velocityBuffer, 'vec2', particleNum);
// create function
const computeShaderFn = tslFn(() => {

  const particle = particleBufferNode.element(instanceIndex);
  const velocity = velocityBufferNode.element(instanceIndex);

  const pointer = uniform(pointerVector);
  const limit = uniform(scaleVector);

  const position = particle.add(velocity).temp();

  velocity.x = position.x.abs().greaterThanEqual(limit.x).cond(velocity.x.negate(), velocity.x);
  velocity.y = position.y.abs().greaterThanEqual(limit.y).cond(velocity.y.negate(), velocity.y);

  position.assign(position.min(limit).max(limit.negate()));

  const pointerSize = 0.1;
  const distanceFromPointer = pointer.sub(position).length();

  particle.assign(distanceFromPointer.lessThanEqual(pointerSize).cond(vec3(), position));

});

let computeNode = (computeShaderFn() as any).compute(particleNum) as THREE.ComputeNode;
(computeNode as any).onInit = ({ renderer }: { renderer: THREE.Renderer }) => {

  const precomputeShaderNode = tslFn(() => {

    const particleIndex = float(instanceIndex);

    const randomAngle = particleIndex.mul(.005).mul(Math.PI * 2);
    const randomSpeed = particleIndex.mul(0.00000001).add(0.0000001);

    const velX = randomAngle.sin().mul(randomSpeed);
    const velY = randomAngle.cos().mul(randomSpeed);

    const velocity = velocityBufferNode.element(instanceIndex);

    velocity.xy = vec2(velX, velY);

  });

  renderer.compute(precomputeShaderNode().compute(particleNum));

};

// use a compute shader to animate the point cloud's vertex data.

const particleNode = attribute('particle', 'vec2');

const pointsGeometry = new THREE.BufferGeometry();
pointsGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3)); // single vertex ( not triangle )
pointsGeometry.setAttribute('particle', particleBuffer); // dummy the position points as instances
pointsGeometry.drawRange.count = 1; // force render points as instances ( not triangle )

const pointsMaterial = new THREE.PointsNodeMaterial();
pointsMaterial.colorNode = particleNode.add(color(0xFFFFFF));
pointsMaterial.positionNode = particleNode;

const mesh = new THREE.Points(pointsGeometry, pointsMaterial);
(mesh as any).count = particleNum;
scene.add(mesh);

const renderer = new THREE.WebGPURenderer({
  // forceWebGL:true,
  antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);

renderer.setSize(width, height);
renderer.setAnimationLoop(animate);
sectionFirst.appendChild(renderer.domElement);

window.addEventListener('mousemove', onMouseMove);


// gui

const gui = new GUI();

gui.add(scaleVector, 'x', 0, 1, 0.01);
gui.add(scaleVector, 'y', 0, 1, 0.01);


window.addEventListener("resize", () => {
  onResize();
})
onResize();

function onResize() {
  if (!sectionFirst) {
    throw new Error("sectionFirst is null");
  }
  camera.updateProjectionMatrix();
  const { width, height } = getElementSize(sectionFirst);
  renderer.setSize(width, height);
}
function onMouseMove(event: MouseEvent) {
  const x = event.clientX;
  const y = event.clientY;

  const width = window.innerWidth;
  const height = window.innerHeight;

  pointerVector.set(
    (x / width - 0.5) * 2.0,
    (- y / height + 0.5) * 2.0
  );
}

function animate() {

  renderer.compute(computeNode);
  renderer.render(scene, camera);

}



