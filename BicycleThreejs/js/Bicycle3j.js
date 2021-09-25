import * as THREE from '../lib/three/build/three.module.js';
import { TrackballControls } from '../lib/three/examples/jsm/controls/TrackballControls.js';
import { addCoordSystem } from '../lib/wfa-coord.js';

let renderer;
let scene;
let camera;
let controls;
let lastTime = 0.0;
let bicycle;
let wheel;
let frontWheel;
let wheelRotation = Math.PI;

let SIZE = 500;


export function main(){
    let myCanvas = document.getElementById('webgl');

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({canvas: myCanvas, antialias: true});
    renderer.setClearColor(0xBFD104, 0xff);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.x = -20;
    camera.position.y = 30;
    camera.position.z = 60;
    camera.up = new THREE.Vector3(0, 1, 0);
    let target = new THREE.Vector3(0.0, 0.0, 0.0);
    camera.lookAt(target);

    let directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(50, 300, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0;
    directionalLight.shadow.camera.far = 301;
    directionalLight.shadow.camera.left = -250;
    directionalLight.shadow.camera.right = 250;
    directionalLight.shadow.camera.top = 250;
    directionalLight.shadow.camera.bottom = -250;
    directionalLight.shadow.camera.visible = true;

    //Hjelpeklasse for å vise lysets utstrekning:
    let lightCamHelper = new THREE.CameraHelper( directionalLight.shadow.camera );
    scene.add( lightCamHelper );
    scene.add(directionalLight);

    controls = new TrackballControls(camera, renderer.domElement);
    controls.addEventListener( 'change', render);

    addModels();
    addCoordSystem(scene);

    window.addEventListener('resize', onWindowResize, false);


    //document.addEventListener('keyup', handleKeyUp, false);
    //document.addEventListener('keydown', handleKeyDown, false);
}

function addModels() {
    //Plan:
    /*let gPlane = new THREE.PlaneGeometry(SIZE * 2, SIZE * 2);
    let mPlane = new THREE.MeshLambertMaterial({ color: 0x33aabb, side: THREE.DoubleSide });
    let meshPlane = new THREE.Mesh(gPlane, mPlane);
    meshPlane.rotation.x = Math.PI / 2;
    meshPlane.receiveShadow = true;	//NB!
    scene.add(meshPlane);*/

    addBicycle();


}

function render() {
    renderer.render(scene, camera);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    controls.handleResize();
    render();
}

function addBicycle(){
    bicycle = new THREE.Group(); //holder hele sykkelen
    wheel = new THREE.Group(); //gruppe for hjul
    let frontBikePart = new THREE.Group(); //gruppe for frontdelen av sykkel (med hjul) - for å gjøre det mulig å svinge
    let frame = new THREE.Group(); // ramma til sykkel


    const loadManager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(loadManager);
    //const loader = new THREE.TextureLoader();
    const materials = [
        new THREE.MeshPhongMaterial({ map: loader.load('images/peakpx.jpg')}),
        new THREE.MeshLambertMaterial({ map: loader.load('images/wheelPattern.PNG')}),
        new THREE.MeshPhongMaterial({ map: loader.load('images/metalgold.jpg')}),
        new THREE.MeshPhongMaterial({ map: loader.load('images/bluedrops.jpg')}),
        new THREE.MeshLambertMaterial({ map: loader.load('images/leather.jpg')}),
        new THREE.MeshLambertMaterial({ map: loader.load('images/grass.jpg')}),
        new THREE.MeshPhongMaterial({ map: loader.load('images/whiteseat.jpg')})
    ];

    loadManager.onLoad = () => {
        //Plane (Fungerer ikke, tanken var å ha texture på plane)
        /*let planeGeo = new THREE.PlaneGeometry(SIZE * 2, SIZE * 2);
        let planeMesh = new THREE.Mesh(planeGeo, materials[5]);
        planeMesh.rotation.x = Math.PI / 2;
        planeMesh.receiveShadow = true;	//NB!
        scene.add(planeMesh);*/

        //Wheel object
        let rubberWheelGeometry = new THREE.TorusGeometry(7, 1.0, 30, 100);
        let wheelMesh = new THREE.Mesh(rubberWheelGeometry, materials[1]);
        wheel.add(wheelMesh);
        let innerWheelGeometry = new THREE.TorusGeometry(6.4, 0.9, 3, 100);
        let innerWheelMesh = new THREE.Mesh(innerWheelGeometry, materials[0]);
        wheel.add(innerWheelMesh);
        let thinCylinderGeometry = new THREE.CylinderGeometry(0.05, 0.05, 15, 64,1,false,0, 6.3);
        let thinCylinderMesh = new THREE.Mesh(thinCylinderGeometry, materials[2]);
        wheel.add(thinCylinderMesh);
        for (let i = 0; i < 2*Math.PI; i+=2*Math.PI/20){
            let thinTubeCopy = thinCylinderMesh.clone();
            thinTubeCopy.rotation.z = i;
            wheel.add(thinTubeCopy);
        }
        let middleCylinderMesh = thinCylinderMesh.clone();
        middleCylinderMesh.rotation.x = Math.PI/2;
        middleCylinderMesh.scale.x = 6;
        middleCylinderMesh.scale.z = 6;
        wheel.scale.x = 2;
        wheel.scale.y = 2;
        frontWheel = wheel.clone();
        let middleOfFrontWheel = middleCylinderMesh.clone();
        middleCylinderMesh.scale.y = 0.7;
        wheel.add(middleCylinderMesh);

        //front bike part
        middleOfFrontWheel.scale.y = 0.37;
        frontWheel.add(middleOfFrontWheel);
        frontWheel.position.x = 4;
        frontBikePart.add(frontWheel);

        //frontframe
        let frontTorsoGeo = new THREE.CylinderGeometry(0.5, 0.5, 17, 64, 1, false, 0, 6.3);
        let frontTorsoMesh = new THREE.Mesh(frontTorsoGeo, materials[3]);
        let frontOverWheel = frontTorsoMesh.clone();
        let sideBarWheel = frontTorsoMesh.clone();
        let middleSteeringVertical = frontTorsoMesh.clone();
        let bottomFrame = frontTorsoMesh.clone();
        let seatSupportFrame = frontTorsoMesh.clone();
        frontTorsoMesh.translateY(25.7);
        //frontTorsoMesh.translateX(3);
        frontTorsoMesh.scale.x = 1.7;
        frontTorsoMesh.scale.z = 1.7;
        //frontTorsoGeo.center();
        frontBikePart.add(frontTorsoMesh);

        frontOverWheel.rotation.x = Math.PI/2;
        frontOverWheel.scale.y = 0.3;
        frontOverWheel.scale.x = 1.7;
        frontOverWheel.scale.z = 1.7;
        let steeringBar = frontOverWheel.clone();

        frontOverWheel.position.y = 17;
        //frontOverWheel.position.x = -3;
        frontBikePart.add(frontOverWheel);
        sideBarWheel.scale.y = 1.0;

        let sideBarBackWheel = sideBarWheel.clone();
        let upperSideBarBackWheel = sideBarWheel.clone();
        sideBarWheel.position.y = 8.2;
        sideBarWheel.rotation.z = 0.23;
        sideBarWheel.position.x = 2;
        let sideBarWheel2 = sideBarWheel.clone();
        sideBarWheel.position.z = 2;
        frontBikePart.add(sideBarWheel);

        sideBarWheel2.position.z = -2;
        frontBikePart.add(sideBarWheel2);

        steeringBar.position.y = 34.5;
        //steeringBar.position.x = -3;
        let middleSteeringHorizontal = steeringBar.clone();
        steeringBar.scale.x = 1;
        steeringBar.scale.y = 0.5;
        steeringBar.scale.z = 1;
        frontBikePart.add(steeringBar);

        middleSteeringVertical.scale.y = 0.07;
        middleSteeringVertical.scale.x = 1.9;
        middleSteeringVertical.scale.z = 1.9;
        middleSteeringVertical.position.y = 34;
        //middleSteeringVertical.position.x= -3;
        frontBikePart.add(middleSteeringVertical);

        //middleSteeringHorizontal.scale.x = 1.3;
        middleSteeringHorizontal.scale.y = 0.2;
        middleSteeringHorizontal.scale.z = 1.3;
        frontBikePart.add(middleSteeringHorizontal);

        let handle1Geo = new THREE.CylinderGeometry(0.5, 0.5, 4, 64, 1, false, 0, 6.3)
        let handle1Mesh = new THREE.Mesh(handle1Geo, materials[4]);
        handle1Mesh.scale.x = 1.2;
        handle1Mesh.scale.z = 1.2;
        handle1Mesh.position.y = 34.5;
        //handle1Mesh.position.x = -3;
        handle1Mesh.rotation.x = Math.PI/2;
        let handle2 = handle1Mesh.clone();
        handle1Mesh.position.z = 6;
        handle1Geo.center();
        frontBikePart.add(handle1Mesh);

        handle2.position.z = -6;
        frontBikePart.add(handle2);

        sideBarBackWheel.scale.y = 0.75;
        sideBarBackWheel.rotation.z = Math.PI/2;
        sideBarBackWheel.position.x = 6.6;
        let sideBarBackWheel2 = sideBarBackWheel.clone();
        let inwardSideBarBackWheel = sideBarBackWheel.clone();
        sideBarBackWheel.position.z = 4;
        frame.add(sideBarBackWheel);

        sideBarBackWheel2.position.z = -4;
        frame.add(sideBarBackWheel2);

        inwardSideBarBackWheel.scale.y = 0.45;
        inwardSideBarBackWheel.position.x = 16;
        let inwardSideBarBackWheel2 = inwardSideBarBackWheel.clone();

        inwardSideBarBackWheel.rotation.y = 0.55;
        inwardSideBarBackWheel.position.z = 2.1;
        frame.add(inwardSideBarBackWheel);

        inwardSideBarBackWheel2.rotation.y = Math.PI - 0.55;
        inwardSideBarBackWheel2.position.z = -2.1;
        frame.add(inwardSideBarBackWheel2);

        bottomFrame.position.x = 31.8;
        bottomFrame.position.y = 10.3;
        bottomFrame.scale.x = 1.7;
        bottomFrame.scale.y = 1.97;
        bottomFrame.scale.z = 1.7;
        let upperFrame = bottomFrame.clone();
        bottomFrame.rotation.z = Math.PI - 0.9;
        frame.add(bottomFrame);

        upperFrame.position.y = 18;
        upperFrame.position.x = 30;
        upperFrame.scale.y = 2.07;
        upperFrame.rotation.z = Math.PI - 1;
        frame.add(upperFrame);

        seatSupportFrame.position.x = 13.5;
        seatSupportFrame.position.y = 13.3;
        seatSupportFrame.scale.x = 1.7;
        seatSupportFrame.scale.y = 1.75;
        seatSupportFrame.scale.z = 1.7;
        seatSupportFrame.rotation.z = 0.4;
        frame.add(seatSupportFrame);

        upperSideBarBackWheel.rotation.z = Math.PI/2 +0.7;
        upperSideBarBackWheel.position.z = 4;
        upperSideBarBackWheel.position.x = 5.2;
        upperSideBarBackWheel.position.y = 4;
        upperSideBarBackWheel.scale.y = 0.75;
        let upperSideBarBackWheel2 = upperSideBarBackWheel.clone();
        frame.add(upperSideBarBackWheel);

        upperSideBarBackWheel2.position.z = -4;
        frame.add(upperSideBarBackWheel2);

        let upperInwardSideBarBackWheel = inwardSideBarBackWheel.clone();
        let upperInwardSideBarBackWheel2 = inwardSideBarBackWheel2.clone();
        upperInwardSideBarBackWheel.position.y = 10.57;
        upperInwardSideBarBackWheel.position.x = 11.63;
        upperInwardSideBarBackWheel.position.z = 2.03
        upperInwardSideBarBackWheel.rotation.z = Math.PI/2 + 0.79;
        upperInwardSideBarBackWheel.rotation.y =  0.86;
        frame.add(upperInwardSideBarBackWheel);

        upperInwardSideBarBackWheel2.position.y = 10.57;
        upperInwardSideBarBackWheel2.position.x = 11.63;
        upperInwardSideBarBackWheel2.position.z = -2.03;
        upperInwardSideBarBackWheel2.rotation.z = Math.PI/2 - 0.79;
        upperInwardSideBarBackWheel2.rotation.y = 0.86;
        frame.add(upperInwardSideBarBackWheel2);

        let underSeat = new THREE.BoxGeometry(10, 1, 10);
        let underSeatMesh = new THREE.Mesh(underSeat, materials[2]);
        underSeatMesh.scale.z = 0.5;
        underSeatMesh.scale.x = 1.2;
        underSeatMesh.scale.y = 0.5;
        underSeatMesh.position.x = 8;
        underSeatMesh.position.y = 27;
        frame.add(underSeatMesh);

        let seatGeo = new THREE.CylinderGeometry(3, 3, 12, 50, 2, false,0, Math.PI);
        let seatMesh = new THREE.Mesh(seatGeo, materials[6]);
        seatMesh.rotation.z = Math.PI/2;
        seatMesh.position.x = 8;
        seatMesh.position.y = 27;
        seatMesh.scale.x = 0.7;

        frame.add(seatMesh);

        /* rotasjon på y-aksen av frontBikePart brukes til å svinge)*/
        //frontBikePart.rotation.y = 1.2;


        //frontBikePart.rotation.z = 0.4;

        frontBikePart.position.x = 45;


        bicycle.add(wheel);
        bicycle.add(frontBikePart);
        bicycle.add(frame);
            scene.add(bicycle);

        animate();

    }
}


function animate(currentTime) {
    requestAnimationFrame(animate);
    if (currentTime == undefined)
        currentTime = 0; //Udefinert f�rste gang.

    let elapsed = 0.0; 			// Forl�pt tid siden siste kall p� draw().
    if (lastTime != 0.0) 		// F�rst gang er lastTime = 0.0.
        elapsed = (currentTime - lastTime) / 1000; //Opererer med sekunder.
    lastTime = currentTime;
    let rotationSpeed = (Math.PI / 3); // Bestemmer rotasjonshastighet.
    wheelRotation = wheelRotation - (rotationSpeed * elapsed);
    wheelRotation %= (Math.PI * 2); // "Rull rundt
    wheel.rotation.z = wheelRotation;
    frontWheel.rotation.z = wheelRotation;
    controls.update();
    render();
}