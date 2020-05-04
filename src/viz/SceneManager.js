import * as THREE from "three";
import Stats from "stats.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import FirstPersonControls from "./controls/FirstPersonControls";
import { cinematicResize } from "../utils/jsUtils";

export class SceneManager {
  constructor(canvas) {
    const opts = {
      songId: null,
      fov: 60,
      bpm: null,
      dprMax: 5,
      canvas,
      clock: new THREE.Clock(true),
      resizeMethod: "fullscreen",
      pauseVisuals: false,
      sceneDimensions: {
        width: null,
        height: null,
      },
      spectrumFunction: (n) => "#FFFFFF",
      showStats: false,
      fpcControl: false,
    };

    // bind properties to 'this'
    Object.assign(this, opts);
    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);

    // run initialization functions
    this.setSceneDimensions();
  }

  init() {
    this.scene = this.initScene();
    this.renderer = this.initRender();
    this.camera = this.initCamera();
    this.controls = this.initControls();
    this.subjects = this.initSubjects();
    this.lights = this.initLights();
    this.helpers = this.initHelpers();
  }

  stop() {
    window.cancelAnimationFrame(this.currentFrame);
  }

  setSceneDimensions() {
    this.sceneDimensions = {
      width:
        this.resizeMethod === "cinematic"
          ? this.canvas.width
          : this.resizeMethod === "fullscreen"
          ? window.innerWidth
          : null,
      height:
        this.resizeMethod === "cinematic"
          ? this.canvas.height
          : this.resizeMethod === "fullscreen"
          ? window.innerHeight
          : null,
    };
  }

  applyAll(obj, callback, exceptions = []) {
    // recursively apply callback to all descendants of obj
    obj.children.forEach((child) => {
      if (child.children.length > 0) {
        this.applyAll(child, callback, exceptions);
      } else {
        if (!exceptions.find((ex) => child.name.includes(ex))) {
          callback(child);
        }
      }
    });
  }

  disposeAll(obj) {
    while (obj.children.length > 0) {
      this.disposeAll(obj.children[0]);
      obj.remove(obj.children[0]);
    }
    if (obj.geometry) obj.geometry.dispose();

    if (obj.material) {
      // in case of map, bumpMap, normalMap, envMap ...
      Object.keys(obj.material).forEach((prop) => {
        if (!obj.material[prop]) return;
        if (typeof obj.material[prop].dispose === "function")
          obj.material[prop].dispose();
      });
      obj.material.dispose();
    }
  }

  animate() {
    this.showStats && this.helpers.stats.begin();
    this.render();
    this.showStats && this.helpers.stats.end();
    this.currentFrame = requestAnimationFrame(this.animate);
  }

  initScene() {
    const scene = new THREE.Scene();
    return scene;
  }

  initRender() {
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      autoClear: false,
      canvas: this.canvas,
      antialias: true,
      outputEncoding: THREE.sRGBEncoding,
    });

    let DPR = Math.min(
      this.dprMax || 1.5,
      window.devicePixelRatio ? window.devicePixelRatio : 1
    );

    renderer.setPixelRatio(DPR);
    renderer.setSize(this.sceneDimensions.width, this.sceneDimensions.height);

    return renderer;
  }

  initCamera() {
    const nearPlane = 1;
    const farPlane = 10000;
    const camera = new THREE.PerspectiveCamera(
      this.getFov(),
      1,
      nearPlane,
      farPlane
    );
    camera.aspect = this.getAspectRatio();
    camera.position.set(0, 10, 115);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.updateProjectionMatrix();
    return camera;
  }

  initControls() {
    const controls = {};
    this.fpcControl && (controls.fpc = new FirstPersonControls(this.camera));
    return controls;
  }

  initSubjects() {
    const subjects = {};
    return subjects;
  }

  initLights() {
    const lights = {
      ambient: new THREE.AmbientLight(0xffffff, 0.1),
    };
    this.scene.add(lights.ambient);
    this.lights = lights;
  }

  initHelpers() {
    const helpers = {
      gltfLoader: new GLTFLoader(),
    };
    if (this.showStats) {
      helpers.stats = new Stats();
      helpers.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
      helpers.stats.dom.style.left = null;
      helpers.stats.dom.style.right = "0px";
      document.body.appendChild(helpers.stats.dom);
    }
    return helpers;
  }

  getFov() {
    return this.fov;
  }

  getAspectRatio() {
    return this.sceneDimensions.width / this.sceneDimensions.height;
  }

  onWindowResize() {
    this.setSceneDimensions();
    this.resizeMethod === "cinematic" && cinematicResize(this.canvas);
    this.camera.fov = this.getFov();
    this.camera.aspect = this.getAspectRatio();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(
      this.sceneDimensions.width,
      this.sceneDimensions.height
    );
    this.render(true);
  }

  loadModel(options = {}) {
    const { name } = options;
    const format =
      process.env[`REACT_APP_MODEL_FORMAT_${this.songId.toUpperCase()}`] ||
      process.env.REACT_APP_MODEL_FORMAT;

    let ext;

    if (format === "glb") {
      ext = ".glb";
    } else {
      ext = ".gltf";
    }

    return new Promise((resolve, reject) => {
      let url;

      if (process.env.REACT_APP_ASSET_LOCATION === "local") {
        url = `${process.env.PUBLIC_URL}/models/${this.songId}/${name}${ext}`;
      } else if (process.env.REACT_APP_ASSET_LOCATION === "s3") {
        url = `https://soundscape-public.s3.us-east-2.amazonaws.com/app/models/${this.songId}/${format}/${name}${ext}`;
      }

      this.helpers.gltfLoader.load(
        url,
        (model) => resolve(model),
        null,
        (err) => reject(err)
      );
    });
  }
}
