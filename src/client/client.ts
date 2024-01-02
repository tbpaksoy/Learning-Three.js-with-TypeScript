import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

let index = 0;

const names: string[] = ['cathedral.fbx', 'temple.fbx'];

let points: THREE.Vector3[] = [];

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x645d65);

const raycaster = new THREE.Raycaster();

const color = 0xaaaaaa;

let material: THREE.Material;
material = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, wireframe: false, reflectivity: 1 });

let way = 0.001;

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.z = 5;


const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
let theObject: THREE.Mesh;
const loader = new FBXLoader();
loader.load('models/' + names[0], function (object) {
    const mesh = object.children[0] as THREE.Mesh;
    theObject = new THREE.Mesh(mesh.geometry, material);
    scene.add(theObject);
}, function (xhr) { }, function (error) { console.error(error); });

const light = new THREE.DirectionalLight(0xffffff);
light.shadow.camera.near = 0.5;
scene.add(light);
camera.position.set(0, 20, 100);
window.addEventListener('resize', onWindowResize, false);
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

renderer.render(scene, camera);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

addEventListener('keydown', (event) => {
    console.log(event);
    switch (event.key) {
        case 'ArrowUp':
            camera.zoom -= 0.1;
            break;
        case 'ArrowDown':
            camera.zoom += 0.1;
            break;
        case 'ArrowLeft':
            way -= 0.001;
            break;
        case 'ArrowRight':
            way += 0.001;
            break;
        case ' ':
            way = 0;
            break;
        case 'e':
            index++;
            index %= names.length;
            scene.remove(theObject);
            loader.load('models/' + names[index], function (object) {
                const mesh = object.children[0] as THREE.Mesh;
                theObject = new THREE.Mesh(mesh.geometry, material);
                scene.add(theObject);
            }, function (xhr) { }, function (error) { console.error(error); });
            break;
        case 'q':
            index--;
            if (index < 0) index += names.length;
            scene.remove(theObject);
            loader.load('models/' + names[index], function (object) {
                const mesh = object.children[0] as THREE.Mesh;
                theObject = new THREE.Mesh(mesh.geometry, material);
                scene.add(theObject);
            }, function (xhr) { }, function (error) { console.error(error); });
            break;
        case 'f':
            if (material instanceof THREE.MeshPhongMaterial) material = new THREE.MeshBasicMaterial({ color: color, wireframe: true });
            else material = new THREE.MeshPhongMaterial({ color: color, wireframe: false });
            theObject.material = material;
            break;
    }
});

function animate() {
    requestAnimationFrame(animate)
    if (!theObject) return;
    theObject.rotation.y += way;
    light.position.x = Math.sin(Date.now() * 0.001) * 30;
    light.position.z = Math.cos(Date.now() * 0.001) * 30;
    light.position.y = Math.sin(Date.now() * 0.001) * 30;
    render()
}

function render() {
    renderer.render(scene, camera)
}

function Raycast(pointer: THREE.Vector2) {
    raycaster.setFromCamera(pointer, camera);
    const intersect = raycaster.intersectObject(theObject);
    if (intersect.length == 0) return;
    points.push(intersect[0].point);
    if (points.length == 2) {
        const temp0 = Math.pow(points[0].x - points[1].x, 2);
        const temp1 = Math.pow(points[0].y - points[1].y, 2);
        const temp2 = Math.pow(points[0].z - points[1].z, 2);
        const distance = Math.sqrt(temp0 + temp1 + temp2);
        points = [];
        console.log(distance);
    }
}
window.addEventListener('click', (event) => {
    Raycast(new THREE.Vector2((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1));
});
animate()