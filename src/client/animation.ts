import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0X000000);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 10);
scene.add(camera);

const light = new THREE.DirectionalLight(0xffffff);
scene.add(light);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);


const triggers: { [id: string]: boolean } = {};
const loader = new GLTFLoader();
const mixers: THREE.AnimationMixer[] = [];

loader.load('models/Gears.glb', function (gltf) {
    mixers.push(new THREE.AnimationMixer(gltf.scene));
    mixers[mixers.length - 1].clipAction(gltf.animations[0]).play();
    (gltf.scene.children[0].children[0] as THREE.Mesh).material = new THREE.MeshNormalMaterial();
    triggers['GearsMesh'] = false;
    gltf.scene.name = 'GearsMesh';
    scene.add(gltf.scene);
})

loader.load('models/Fiat 500 1950.glb', function (gltf) {
    mixers.push(new THREE.AnimationMixer(gltf.scene));
    mixers[mixers.length - 1].clipAction(gltf.animations[1]).play();
    (gltf.scene.children[0] as THREE.Mesh).material = new THREE.MeshNormalMaterial();
    triggers['Fiat_500_1950_Retopo'] = false;
    gltf.scene.name = 'Fiat_500_1950_Retopo';
    gltf.scene.position.set(3, 0, 0);
    scene.add(gltf.scene);
});

loader.load('models/Zero.glb', function (gltf) {
    mixers.push(new THREE.AnimationMixer(gltf.scene));
    mixers[mixers.length - 1].clipAction(gltf.animations[0]).play();
    (gltf.scene.children[0] as THREE.Mesh).material = new THREE.MeshNormalMaterial();
    gltf.scene.name = 'Zero';
    triggers[gltf.scene.name] = false;
    gltf.scene.position.set(-3, 0, 0);
    scene.add(gltf.scene);
});

onkeydown = (e) => {
    switch (e.key) {
        case ' ':
            mixers.forEach(mixer => {
                if (mixer.time >= 1.0) mixer.time = 0.0;
            });
            break;
    }
}

onclick = (e) => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersect = raycaster.intersectObjects(scene.children, true)[0];
    if (!intersect) return;
    console.log(intersect.object.name);
    triggers[intersect.object.name] = !triggers[intersect.object.name];
};

renderer.render(scene, camera);

function animate() {
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    mixers.forEach(mixer => {
        const name = (mixer.getRoot() as THREE.Object3D).name;
        if (triggers[name])
            mixer.update(0.01);
    });
}

function update() {
    requestAnimationFrame(update);
    animate()
    renderer.render(scene, camera);
}

console.log(triggers);

update();
