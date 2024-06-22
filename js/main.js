import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x0F0F0F);
renderer.setPixelRatio(window.devicePixelRatio);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(8, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(150, 0, -100); // Posição inicial da câmera
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableRotate = true;
controls.enablePan = false;
controls.enableZoom = false;
controls.minAzimuthAngle = -Math.PI / -3; // Limite de rotação à esquerda (45 graus)
controls.maxAzimuthAngle = Math.PI / -1; // Limite de rotação à direita (45 graus)
controls.minPolarAngle = Math.PI / 2; // Fixa o ângulo vertical para que não haja rotação vertical
controls.maxPolarAngle = Math.PI / 2; // Fixa o ângulo vertical para que não haja rotação vertical
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();

const groundGeometry = new THREE.PlaneGeometry(0, 0, 0, 0);
groundGeometry.rotateX(-Math.PI / 2);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x555555,
  side: THREE.DoubleSide,
});
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.castShadow = false;
groundMesh.receiveShadow = true;
scene.add(groundMesh);

const spotLight = new THREE.SpotLight(0xffffff,  3, 100, 0.22, 1);
spotLight.position.set(0, 25, 0);
spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
scene.add(spotLight);

const loader = new GLTFLoader().setPath('public/millennium_falcon/');
loader.load('scene.gltf', (gltf) => {
  const mesh = gltf.scene;

  mesh.traverse((child) => {
    if (child.isMesh) {
      child.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
      child.material.map.wrapS = THREE.RepeatWrapping;
      child.material.map.wrapT = THREE.RepeatWrapping;
      child.material.map.repeat.set(1, 1);
      child.material.metalness = 0.2;
      child.material.roughness = 0.6;
      child.material.map.magFilter = THREE.NearestFilter;
      child.material.map.minFilter = THREE.NearestFilter;
      child.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy() * 2;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  mesh.position.set(0, 0, 0);
  mesh.rotation.x = -Math.PI / 2;
  scene.add(mesh);

  const objectWrapper = document.getElementById('object-wrapper');
  objectWrapper.appendChild(renderer.domElement);

  document.getElementById('progress-container').style.display = 'none';
}, (xhr) => {
  const progress = Math.max(xhr.loaded / xhr.total, 0) * 100;
  document.getElementById('progress').innerHTML = `LOADING ${Math.floor(progress)}%`;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  
  const aspectRatio = 0.2; // Proporção de largura para a largura da janela de visualização
  const canvasHeight = window.innerWidth * aspectRatio;
  
  camera.aspect = window.innerWidth * aspectRatio / canvasHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth * aspectRatio, canvasHeight);
  
  renderer.render(scene, camera);
}

animate();