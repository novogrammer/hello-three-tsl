import { getElementSize } from './dom_utils';
import './style.scss'
import * as THREE from "three";
import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js';
import { MeshStandardNodeMaterial, vec4 } from 'three/examples/jsm/nodes/Nodes.js';


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




const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new MeshStandardNodeMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

const colorNode=vec4(1,0,0,1);
material.colorNode=colorNode;

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



