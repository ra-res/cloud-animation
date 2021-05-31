import "./style.css";
import * as POSTPROCESSING from "postprocessing";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
/**
 * Constants
 */
// Texture Loader
const loader = new THREE.TextureLoader();
// Debug
const gui = new dat.GUI();
// Canvas
const canvas = document.querySelector("canvas.webgl");
// Scene
const scene = new THREE.Scene();

// Objects
// Material
// MESH
// Lights

const pointLight = new THREE.PointLight(0xffffff, 0.1);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  60,
  sizes.width / sizes.height,
  1,
  1000
);
// Camera looking up at sky
camera.position.z = 1;
camera.rotation.x = 1.16;
camera.rotation.y = -0.12;
camera.rotation.z = 0.27;
scene.add(camera);
// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const clock = new THREE.Clock();

var typeOfAnimation = "night";
/**
 * Ambient Clouds Code
 */
function ambientClouds() {
  const smokeTexture = loader.load("smoke.png"),
    starsTexture = loader.load("stars.jpg");

  // Objects
  const cloudGeometry = new THREE.PlaneBufferGeometry(500, 500);

  // Materials
  const cloudMaterial = new THREE.MeshLambertMaterial({
    map: smokeTexture,
    transparent: true,
  });

  // Mesh
  var cloudParticles = [],
    i;
  for (i = 0; i < 50; i++) {
    let cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloud.position.set(
      Math.random() * 800 - 400,
      500,
      Math.random() * 500 - 500
    );
    cloud.rotation.x = 1.16;
    cloud.rotation.y = -0.12;
    cloud.rotation.z = Math.random() * 2 * Math.PI;
    cloud.material.opacity = 0.55;
    cloudParticles.push(cloud);
    scene.add(cloud);
  }
  // Light
  const ambient = new THREE.AmbientLight(
    typeOfAnimation === "night" ? 0xffeedd : 0x555555
  );
  scene.add(ambient);

  const directionalLight = new THREE.DirectionalLight(
    typeOfAnimation === "night" ? 0xffeedd : 0xff8c19
  );
  directionalLight.position.set(0, 0, 1);
  scene.add(directionalLight);

  const orangeLight = new THREE.PointLight(0xcc6600, 50, 450, 1.7);
  orangeLight.position.set(200, 300, 100);
  scene.add(orangeLight);
  const redLight = new THREE.PointLight(0xd8547e, 50, 450, 1.7);
  redLight.position.set(100, 300, 100);
  scene.add(redLight);
  const blueLight = new THREE.PointLight(0x3677ac, 50, 450, 1.7);
  blueLight.position.set(300, 300, 200);
  scene.add(blueLight);

  const flash = new THREE.PointLight(0x062d89, 30, 500, 1.7);
  flash.position.set(200, 300, 100);
  scene.add(flash);

  scene.fog = new THREE.FogExp2(
    typeOfAnimation === "night" ? 0x11111f : 0x035443,
    typeOfAnimation === "night" ? 0.002 : 0.001
  );
  renderer.setClearColor(scene.fog.color);

  // Bloom Effect
  const bloomEffect = new POSTPROCESSING.BloomEffect({
    blendFunction: POSTPROCESSING.BlendFunction.COLOR_DODGE,
    kernelSize: POSTPROCESSING.KernelSize.SMALL,
    useLuminanceFilter: true,
    luminanceThreshold: 0.3,
    luminanceSmoothing: 0.75,
  });
  bloomEffect.blendMode.opacity.value = typeOfAnimation === "night" ? 0 : 9.5;
  const composer = new POSTPROCESSING.EffectComposer(renderer);
  composer.addPass(new POSTPROCESSING.RenderPass(scene, camera));
  composer.addPass(new POSTPROCESSING.EffectPass(camera, bloomEffect));

  const starsEffect = new POSTPROCESSING.TextureEffect({
    blendFunction: POSTPROCESSING.BlendFunction.COLOR_DODGE,
    texture: starsTexture,
  });
  starsEffect.blendMode.opacity.value = 0.5;
  composer.addPass(new POSTPROCESSING.EffectPass(camera, starsEffect));

  // Animate

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    // Update objects
    cloudParticles.forEach((p) => {
      p.rotation.z -= 0.001;
    });
    // Updating colors and powers
    ambient.color.setHex(typeOfAnimation === "night" ? 0xffeedd : 0x555555);
    redLight.power = typeOfAnimation === "night" ? 0 : 150;
    orangeLight.intensity = typeOfAnimation === "night" ? 0 : 50;
    blueLight.intensity = typeOfAnimation === "night" ? 0 : 50;
    flash.power = typeOfAnimation === "night" ? 100 : 0;
    directionalLight.color.setHex(
      typeOfAnimation === "night" ? 0xffeedd : 0xff8c19
    );
    bloomEffect.blendMode.opacity.value = typeOfAnimation === "night" ? 0 : 9.5;
    scene.fog.color.setHex(typeOfAnimation === "night" ? 0x11111f : 0x035443);
    scene.fog.density = typeOfAnimation === "night" ? 0.002 : 0.001;
    renderer.setClearColor(scene.fog.color);

    if (typeOfAnimation === "night") {
      if (Math.random() > 0.93 || flash.power > 100) {
        // if (flash.power < 100)
        flash.position.set(Math.random() * 400, 300 + Math.random() * 200, 100);
        flash.power = 50 + Math.random() * 500;
      }
    }

    // Update Orbital Controls
    // controls.update()
    composer.render(clock.delta);
    // Render
    renderer.render(scene, camera);
    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
  };
  tick();
}

// document.addEventListener("scroll", () => {
//   typeOfAnimation = typeOfAnimation === "ambient" ? "night" : "ambient";
// });

document.getElementById("ambientBtn").addEventListener("click", () => {
  typeOfAnimation = "ambient";
  document.getElementById("ambientBtn").className = "active";
  document.getElementById("nightBtn").className = "notActive";
});

document.getElementById("nightBtn").addEventListener("click", () => {
  typeOfAnimation = "night";
  document.getElementById("ambientBtn").className = "notActive";
  document.getElementById("nightBtn").className = "active";
});

ambientClouds();
