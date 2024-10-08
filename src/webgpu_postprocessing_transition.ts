import { getElementSize } from './dom_utils.ts';

import './style.scss'


import "./three-more.d.ts";
import * as THREE from 'three/webgpu';
import TWEEN from "@tweenjs/tween.js";
import GUI from "lil-gui";

const { uniform, transition, pass } = THREE;


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `<section class="p-section-first"></section>`;


const sectionFirst = document.querySelector<HTMLHtmlElement>(".p-section-first");



let renderer:THREE.WebGPURenderer;
let postProcessing:THREE.PostProcessing;
let transitionPass:ReturnType<typeof transition>;

const textures:THREE.Texture[] = [];
const clock = new THREE.Clock();

const effectController = {
  animateScene: true,
  animateTransition: true,
  transition: 0,
  _transition: uniform( 0 ),
  useTexture: true,
  _useTexture: uniform( 1 ),
  texture: 5,
  cycle: true,
  threshold: uniform( 0.1 ),
};

function generateInstancedMesh( geometry:THREE.BufferGeometry, material:THREE.Material, count:number ) {

  const mesh = new THREE.InstancedMesh( geometry, material, count );

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  for ( let i = 0; i < count; i ++ ) {

    dummy.position.x = Math.random() * 100 - 50;
    dummy.position.y = Math.random() * 60 - 30;
    dummy.position.z = Math.random() * 80 - 40;

    dummy.rotation.x = Math.random() * 2 * Math.PI;
    dummy.rotation.y = Math.random() * 2 * Math.PI;
    dummy.rotation.z = Math.random() * 2 * Math.PI;

    dummy.scale.x = Math.random() * 2 + 1;

    if ( geometry.type === 'BoxGeometry' ) {

      dummy.scale.y = Math.random() * 2 + 1;
      dummy.scale.z = Math.random() * 2 + 1;

    } else {

      dummy.scale.y = dummy.scale.x;
      dummy.scale.z = dummy.scale.x;

    }

    dummy.updateMatrix();

    mesh.setMatrixAt( i, dummy.matrix );
    mesh.setColorAt( i, color.setScalar( 0.1 + 0.9 * Math.random() ) );

  }

  return mesh;

}

class FXScene{
  rotationSpeed:THREE.Vector3;
  scene:THREE.Scene;
  camera:THREE.PerspectiveCamera;
  mesh:THREE.Mesh;


  constructor ( geometry:THREE.BufferGeometry, rotationSpeed:THREE.Vector3, backgroundColor:THREE.ColorRepresentation ) {

    if(!sectionFirst){
      throw new Error("sectionFirst is null");
    }
    const { width, height } = getElementSize(sectionFirst);


    const camera = new THREE.PerspectiveCamera( 50, width / height, 0.1, 100 );
    camera.position.z = 20;

    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color( backgroundColor );
    scene.add( new THREE.AmbientLight( 0xaaaaaa, 3 ) );

    const light = new THREE.DirectionalLight( 0xffffff, 3 );
    light.position.set( 0, 1, 4 );
    scene.add( light );

    this.rotationSpeed = rotationSpeed;

    const color = geometry.type === 'BoxGeometry' ? 0x0000ff : 0xff0000;
    const material = new THREE.MeshPhongNodeMaterial( { color: color, flatShading: true } );
    const mesh = generateInstancedMesh( geometry, material, 500 );
    scene.add( mesh );

    this.scene = scene;
    this.camera = camera;
    this.mesh = mesh;



  }
  update( delta:number ) {
    const {mesh}=this;

    if ( effectController.animateScene ) {

      mesh.rotation.x += this.rotationSpeed.x * delta;
      mesh.rotation.y += this.rotationSpeed.y * delta;
      mesh.rotation.z += this.rotationSpeed.z * delta;

    }

  }
  resize () {
    const {camera}=this;
    if(!sectionFirst){
      throw new Error("sectionFirst is null");
    }
    const { width, height } = getElementSize(sectionFirst);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

  };
}

const fxSceneA = new FXScene( new THREE.BoxGeometry( 2, 2, 2 ), new THREE.Vector3( 0, - 0.4, 0 ), 0xffffff );
const fxSceneB = new FXScene( new THREE.IcosahedronGeometry( 1, 1 ), new THREE.Vector3( 0, 0.2, 0.1 ), 0x000000 );

function init() {
  if(!sectionFirst){
    throw new Error("sectionFirst is null");
  }
  const { width, height } = getElementSize(sectionFirst);

  // Initialize textures

  const loader = new THREE.TextureLoader();

  for ( let i = 0; i < 6; i ++ ) {

    textures[ i ] = loader.load( 'textures/transition/transition' + ( i + 1 ) + '.png' );

  }

  renderer = new THREE.WebGPURenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( width, height );
  renderer.setAnimationLoop( animate );
  sectionFirst.appendChild( renderer.domElement );

  postProcessing = new THREE.PostProcessing( renderer );

  const scenePassA = pass( fxSceneA.scene, fxSceneA.camera );
  const scenePassB = pass( fxSceneB.scene, fxSceneB.camera );

  transitionPass = transition( scenePassA, scenePassB, new THREE.TextureNode( textures[ effectController.texture ] ), effectController._transition, effectController.threshold, effectController._useTexture );

  postProcessing.outputNode = transitionPass;

  const gui = new GUI();

  gui.add( effectController, 'animateScene' ).name( 'Animate Scene' );
  gui.add( effectController, 'animateTransition' ).name( 'Animate Transition' );
  gui.add( effectController, 'transition', 0, 1, 0.01 ).name( 'transition' ).onChange( () => {
    effectController._transition.value = effectController.transition;

  } ).listen();
  gui.add( effectController, 'useTexture' ).onChange( () => {

    const value = effectController.useTexture ? 1 : 0;
    effectController._useTexture.value = value;

  } );
  gui.add( effectController, 'texture', { Perlin: 0, Squares: 1, Cells: 2, Distort: 3, Gradient: 4, Radial: 5 } );
  gui.add( effectController, 'cycle' );
  gui.add( effectController.threshold, 'value', 0, 1, 0.01 ).name( 'threshold' );

}

window.addEventListener( 'resize', onWindowResize );

function onWindowResize() {
  if(!renderer){
    throw new Error("renderer is null");
  }
  if(!sectionFirst){
    throw new Error("sectionFirst is null");
  }
  const { width, height } = getElementSize(sectionFirst);

  fxSceneA.resize();
  fxSceneB.resize();
  renderer.setSize( width, height );

}

const tween=new TWEEN.Tween( effectController )
  .to( { transition: 1 }, 1500 )
  .onUpdate( function ( ) {

    // transitionController.setValue( effectController.transition );
    effectController._transition.value = effectController.transition

    // Change the current alpha texture after each transition
    if ( effectController.cycle ) {

      if ( effectController.transition == 0 || effectController.transition == 1 ) {

        effectController.texture = ( effectController.texture + 1 ) % textures.length;

      }

    }

  } )
  .repeat( Infinity )
  .delay( 2000 )
  .yoyo( true )
  .start();

function animate() {

  if ( effectController.animateTransition ) tween.update();

  if ( textures[ effectController.texture ] ) {

    const mixTexture = textures[ effectController.texture ];
    transitionPass.mixTextureNode.value = mixTexture;

  }

  const delta = clock.getDelta();
  fxSceneA.update( delta );
  fxSceneB.update( delta );

  render();

}

function render() {

  // Prevent render both scenes when it's not necessary
  if ( effectController.transition === 0 ) {

    renderer.render( fxSceneB.scene, fxSceneB.camera );

  } else if ( effectController.transition === 1 ) {

    renderer.render( fxSceneA.scene, fxSceneA.camera );

  } else {

    postProcessing.render();

  }

}

init();

