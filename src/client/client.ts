//NOTES:
// BufferGeometry does apply to extruded geometry - https://threejs.org/docs/#api/en/geometries/ExtrudeGeometry if we extrude a ring, we should be good https://threejs.org/docs/#api/en/geometries/RingGeometry
// https://github.com/mrdoob/three.js/blob/master/src/core/InstancedBufferGeometry.js also see this for instancing maybe...

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DragControls } from 'three/examples/jsm/controls/DragControls'
import { FlyControls } from 'three/examples/jsm/controls/FlyControls'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { BufferGeometry, Color, EventDispatcher } from 'three'
import { isMainThread } from 'worker_threads'

const scene = new THREE.Scene()

//HELPERS
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const helper = new THREE.CameraHelper(camera)
scene.add(helper)

// SETUP our DEV CAMERA for navigation and setting up of the scene
const orbitCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.z = 8
orbitCamera.position.z = 4

// LOADERS
// CANT GET IT TO WORK. SIMPLE WHERE SHOULD I REFERENCE THIS SHIT ISSUE
// Instantiate a loader
const loader = new GLTFLoader()
// Load a glTF resource
loader.load('assets/web_n_lights.gltf', (gltfScene: any) => {
    scene.add(gltfScene.scene)
})

// THE PLAYGROUND
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
})

const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

const controls = new OrbitControls(orbitCamera, renderer.domElement)

// ADD TO THIS ARRAY - Also, please make me a keybinding to cycle through objects so we can move them arround and... we need to be able to store the location of things
let objects = [cube, camera]

//Lights
let lightsArray = [
    {
        type: 'point',
        translation: [-31.238074177466043, -77.04772774425008, -10.42891519351398],
        Color: 0xff75ef,
        intensity: 0.615,
    },
    {
        type: 'directional',
        translation: [23.2390798106559, -2.918168273538896, -24.02123297941177],
        rotation: [
            -0.6128186576322113, 0.6945839065061901, -0.28257700061689345, 0.24931251152482312,
        ],
        Color: 0xff75ef,
        intensity: 0.513,
    },
    {
        type: 'directional',
        translation: [24.790311017298276, -88.65452636449864, 26.515379520314966],
        rotation: [
            0.08172792545966906, -0.5957586416899301, 0.7915807597084732, -0.10859138046449561,
        ],
        Color: 0xff75ef,
        intensity: 0.384,
    },
    {
        type: 'directional',
        translation: [24.790311017298276, -106.54721055180511, 26.515379520314966],
        rotation: [
            0.0705115418236218, -0.6142032584353462, 0.7808625859815723, -0.08964430607255884,
        ],
        Color: 0xff75ef,
        intensity: 0.384,
    },
    {
        type: 'directional',
        translation: [-3.3740196139311287, -100.9402752796707, 61.17854158329121],
        rotation: [
            -0.008200340410676795, -0.4907948716986974, 0.871114978089208, 0.01455483699828912,
        ],
        Color: 0xff75ef,
        intensity: 0.384,
    },
    {
        type: 'spot',
        translation: [-38.17, 95.56, -51.88],
        rotation: [-0.15643446504023092, 0, 0, 0.9876883405951378],
        intensity: 0.384,
    },
]

// Lights
const lights = new THREE.Group()

lightsArray.forEach((i) => {
    let helper
    let light
    if (i.type == 'directional') {
        light = new THREE.DirectionalLight(i.Color, i.intensity)
        light.position.set(i.translation[0], i.translation[1], i.translation[2])
        helper = new THREE.DirectionalLightHelper(light, 5)
    }
    if (i.type == 'spot') {
        light = new THREE.SpotLight(i.Color, i.intensity)
        light.position.set(i.translation[0], i.translation[1], i.translation[2])
        helper = new THREE.SpotLightHelper(light, 5)
    }
    if (i.type == 'point') {
        light = new THREE.PointLight(i.Color, i.intensity)
        light.position.set(i.translation[0], i.translation[1], i.translation[2])
        helper = new THREE.PointLightHelper(light, 5)
    }
    light = light ? lights.add(light) : null
    helper ? lights.add(helper) : null
})

const transformControls = new TransformControls(orbitCamera, renderer.domElement)
transformControls.enabled = false
transformControls.attach(objects[0])
scene.add(transformControls)

let cameraSwap = [orbitCamera, camera]
let camSelect = cameraSwap[0]
// Controlling our scene
window.addEventListener('keydown', function (event) {
    switch (event.code) {
        case 'KeyX':
            transformControls.enabled = true
            controls.enabled = false
            break
        case 'KeyZ':
            transformControls.enabled = false
            controls.enabled = true
            break
        case 'KeyW':
            transformControls.setMode('translate')
            break
        case 'KeyR':
            transformControls.setMode('rotate')
            break
        case 'KeyS':
            transformControls.setMode('scale')
            break
        case 'KeyC': {
            camSelect = cameraSwap[1]
            break
        }
    }
})
window.addEventListener('keyup', function (event) {
    switch (event.code) {
        case 'KeyC': {
            camSelect = cameraSwap[0]
            break
        }
    }
})

// controls.update(600)
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    orbitCamera.aspect = window.innerWidth / window.innerHeight
    orbitCamera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

/**
 ** 3D OBJECT
 */

// Setup
const amount = 24
let rotMod = 0
const materialConfig: any = {
    color: 0xe295ef,
    flatShading: THREE.SmoothShading,
    metalness: 0.5,
    roughness: 0.6,
}

// Boilerplate code
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

// Lathe
let lathe: any
const latheRender = () => {
    const extrudeSettings = {
        depth: 1.5,
        steps: 1,
        bevelEnabled: false,
        bevelThickness: 0.1,
        bevelSegments: 2,
        bevelSize: 0.1,
        curveSegments: 64,
    }
    lathe = new THREE.Group()
    const difference = 0.04
    const amount = 36
    let lastOuterWall = 1

    for (let i = 0; i < amount; i++) {
        const value = (i + 0.5) / 2
        const innerWall = lastOuterWall === 1 ? value : lastOuterWall - 0.0085
        const outerWall = lastOuterWall === 1 ? value + difference : innerWall + difference

        let arcShape = new THREE.Shape()
        arcShape.absarc(0, 0, outerWall, 0, Math.PI * 2, true)
        let holePath = new THREE.Path()
        holePath.absarc(0, 0, innerWall, 0, Math.PI * 2, false)
        arcShape.holes.push(holePath)
        const geo = new THREE.ExtrudeGeometry(arcShape, extrudeSettings)
        const material = new THREE.MeshStandardMaterial(materialConfig)
        const cyl = new THREE.Mesh(geo, material)
        cyl.scale.set(1, 1, difference + 0.1)

        lathe.add(cyl)
        lastOuterWall = outerWall
    }

    lathe.rotation.set(0, 0, 4.53)
    scene.add(lathe)
}
latheRender()

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(window.devicePixelRatio)
renderer.shadowMap.enabled = true

function animate() {
    requestAnimationFrame(animate)

    // cube.rotation.x += 0.01
    // cube.rotation.y += 0.01

    render()
}

function render() {
    if (rotMod >= -0.53) {
        rotMod = rotMod - 0.002
        lathe.children.forEach((cyl: any, i: any) => {
            const factor = i * 0.18
            cyl.rotation.y = factor * rotMod
            cyl.rotation.x = factor * rotMod
            cyl.rotation.z = factor * rotMod
        })
    }

    renderer.render(scene, camSelect)
}

animate()

// Animation
function animateCrt() {
    requestAnimationFrame(animateCrt)
}
animateCrt()
