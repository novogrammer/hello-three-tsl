import { getElementSize } from './dom_utils.ts';

import './style.scss'


import "./three-more.d.ts";
import * as THREE from 'three/webgpu';

import GUI from "lil-gui";

const { tslFn, uniform, storage, storageObject, instanceIndex, float, texture, viewportTopLeft, color } = THREE;


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `<section class="p-section-first"></section><div id="overlay"><button id="startButton">Play</button></div>`;


const sectionFirst = document.querySelector<HTMLHtmlElement>(".p-section-first");

let camera:THREE.PerspectiveCamera;
let scene:THREE.Scene;
let renderer:THREE.WebGPURenderer;
let computeNode:any;
let waveBuffer:Float32Array;
let sampleRate:number;
let waveGPUBuffer:THREE.StorageInstancedBufferAttribute;
let currentAudio:AudioBufferSourceNode;
let currentAnalyser:AnalyserNode;
const analyserBuffer = new Uint8Array( 1024 );
let analyserTexture:THREE.DataTexture;


init();

async function playAudioBuffer() {

  if ( currentAudio ) currentAudio.stop();

  // compute audio

  await renderer.computeAsync( computeNode );

  const waveArray = new Float32Array( await renderer.getArrayBufferAsync( waveGPUBuffer ) );

  // play result

  const audioOutputContext = new AudioContext( { sampleRate } );
  const audioOutputBuffer = audioOutputContext.createBuffer( 1, waveArray.length, sampleRate );

  audioOutputBuffer.copyToChannel( waveArray, 0 );

  const source = audioOutputContext.createBufferSource();
  source.connect( audioOutputContext.destination );
  source.buffer = audioOutputBuffer;
  source.start();

  currentAudio = source;

  // visual feedback

  currentAnalyser = audioOutputContext.createAnalyser();
  currentAnalyser.fftSize = 2048;

  source.connect( currentAnalyser );

}

async function init() {

  // audio buffer

  const soundBuffer = await fetch( 'sounds/webgpu-audio-processing.mp3' ).then( res => res.arrayBuffer() );
  const audioContext = new AudioContext();

  const audioBuffer = await audioContext.decodeAudioData( soundBuffer );

  waveBuffer = audioBuffer.getChannelData( 0 );

  // adding extra silence to delay and pitch
  waveBuffer = new Float32Array( [ ...waveBuffer, ...new Float32Array( 200000 ) ] );

  sampleRate = audioBuffer.sampleRate / audioBuffer.numberOfChannels;


  // create webgpu buffers

  waveGPUBuffer = new THREE.StorageInstancedBufferAttribute( waveBuffer, 1 );

  const waveStorageNode = storage( waveGPUBuffer, 'float', waveBuffer.length );

  // read-only buffer

  const waveNode = storageObject( new THREE.StorageInstancedBufferAttribute( waveBuffer, 1 ), 'float', waveBuffer.length ).toReadOnly();

  // params

  const pitch = uniform( 1.5 );
  const delayVolume = uniform( .2 );
  const delayOffset = uniform( .55 );


  // compute (shader-node)

  const computeShaderFn = tslFn( () => {

    const index = float( instanceIndex );

    // pitch

    const time = index.mul( pitch );

    let wave:THREE.ShaderNodeObject<THREE.Node> = waveNode.element( time );


    // delay

    for ( let i = 1; i < 7; i ++ ) {

      const waveOffset = waveNode.element( index.sub( delayOffset.mul( sampleRate ).mul( i ) ).mul( pitch ) );
      const waveOffsetVolume = waveOffset.mul( delayVolume.div( i * i ) );

      wave = wave.add( waveOffsetVolume );

    }


    // store

    const waveStorageElementNode = waveStorageNode.element( instanceIndex );

    waveStorageElementNode.assign( wave );

  } );


  // compute

  computeNode = computeShaderFn().compute( waveBuffer.length );


  // gui

  const gui = new GUI();

  gui.add( pitch, 'value', .5, 2, 0.01 ).name( 'pitch' );
  gui.add( delayVolume, 'value', 0, 1, .01 ).name( 'delayVolume' );
  gui.add( delayOffset, 'value', .1, 1, .01 ).name( 'delayOffset' );


  // renderer

  if (!sectionFirst) {
    throw new Error("sectionFirst is null");
  }
  
  const { width, height } = getElementSize(sectionFirst);
  camera = new THREE.PerspectiveCamera( 45, width / height, 0.01, 30 );


  // nodes

  analyserTexture = new THREE.DataTexture( analyserBuffer, analyserBuffer.length, 1, THREE.RedFormat );

  const spectrum = texture( analyserTexture, viewportTopLeft.x ).x.mul( viewportTopLeft.y );
  const backgroundNode = color( 0x0000FF ).mul( spectrum );


  // scene

  scene = new THREE.Scene();
  (scene as any).backgroundNode = backgroundNode;

  // renderer

  renderer = new THREE.WebGPURenderer( {
    // forceWebGL: true,
    antialias: true,
  } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( width, height );
  renderer.setAnimationLoop( render );
  sectionFirst.appendChild( renderer.domElement );

  window.addEventListener( 'resize', onWindowResize );


  document.onclick = () => {

    const overlay = document.getElementById( 'overlay' );
    if ( overlay !== null ) overlay.remove();

    playAudioBuffer();

  };

}

function onWindowResize() {
  if (!sectionFirst) {
    throw new Error("sectionFirst is null");
  }
  
  const { width, height } = getElementSize(sectionFirst);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize( width, height );

}

function render() {

  if ( currentAnalyser ) {

    currentAnalyser.getByteFrequencyData( analyserBuffer );

    analyserTexture.needsUpdate = true;

  }

  renderer.render( scene, camera );

}