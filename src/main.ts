import { getElementSize } from './dom_utils';
import './style.scss'
import * as THREE from "three";
import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js';
import { MeshStandardNodeMaterial, timerGlobal, tslFn, float,uv,vec4, positionLocal, texture } from 'three/examples/jsm/nodes/Nodes.js';

/// <reference path="./three-more.d.ts" />
import { loop/*,Break,Continue*/ } from 'three/examples/jsm/nodes/utils/LoopNode.js';




document.querySelector<HTMLDivElement>('#app')!.innerHTML = `<section class="p-section-first"></section>`;


const sectionFirst=document.querySelector<HTMLHtmlElement>(".p-section-first");

if(!sectionFirst){
  throw new Error("sectionFirst is null");
}

const {width,height}=getElementSize(sectionFirst);


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );

const renderer = new WebGPURenderer();
renderer.setSize( width, height );
renderer.setAnimationLoop( animate );
sectionFirst.appendChild( renderer.domElement );


const textureLoader = new THREE.TextureLoader();

const uvTexture = textureLoader.load( './uv_grid_opengl.jpg' );
uvTexture.wrapS = THREE.RepeatWrapping;
uvTexture.wrapT = THREE.RepeatWrapping;


const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new MeshStandardNodeMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

function makeMyColorNode(){
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


material.colorNode=makeMyColorNode();

camera.position.z = 5;


{
  const ambientLight=new THREE.AmbientLight(0xffffff,0.6);
  scene.add(ambientLight);
}
{
  const directionalLight=new THREE.DirectionalLight(0xffffff,2);
  directionalLight.position.set(10,10,10);
  scene.add(directionalLight);
}


window.addEventListener("resize",()=>{
  onResize();
})
onResize();

function onResize(){
  if(!sectionFirst){
    throw new Error("sectionFirst is null");
  }
  const {width,height}=getElementSize(sectionFirst);
  renderer.setSize(width,height);
  camera.aspect=width/height;
  camera.updateProjectionMatrix();
}

function animate() {

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render( scene, camera );

}



