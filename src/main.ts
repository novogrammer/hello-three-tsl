import { getElementSize } from './dom_utils';
// import { makeMyColorNode } from './makeMyColorNode';
import { makeKaleidoscopeColorNode } from './makeKaleidoscopeColorNode.ts';

import './style.scss'


import "./three-more.d.ts";
import * as THREE from 'three/webgpu';
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `<section class="p-section-first"></section>`;


const sectionFirst=document.querySelector<HTMLHtmlElement>(".p-section-first");

if(!sectionFirst){
  throw new Error("sectionFirst is null");
}

const {width,height}=getElementSize(sectionFirst);


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );

const renderer = new THREE.WebGPURenderer({
  forceWebGL:true,
});
renderer.setSize( width, height );
renderer.setAnimationLoop( animate );
sectionFirst.appendChild( renderer.domElement );


const textureLoader = new THREE.TextureLoader();

const uvTexture = textureLoader.load( './uv_grid_opengl.jpg' );
uvTexture.wrapS = THREE.RepeatWrapping;
uvTexture.wrapT = THREE.RepeatWrapping;


const geometry = new THREE.BoxGeometry( 4, 4, 4 );
const material = new THREE.MeshStandardNodeMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );




// material.colorNode=makeMyColorNode(uvTexture);
material.colorNode=makeKaleidoscopeColorNode(uvTexture);

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

  cube.rotation.x += 0.003;
  cube.rotation.y += 0.003;

  renderer.render( scene, camera );

}



