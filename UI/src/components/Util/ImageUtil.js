import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// Create a MeshStandard material with the given color hex-value and the 
// given texture(s)
//
// tex format.  Only root 
// {
//   root: "root dir"
//   normal: "filename",
//   displacement: {file: "filename", scale: num},
//   roughness: "filename",
//   ao: "filename",
//   metal: {file: "filename", metalness: num}
//   reps: {x: num, y: num}
// }

export function createMaterial(color, tex) {
   let path = `${window.location.origin}/textures/${tex.root}/`;
   let reps = tex.reps;
   let params = {color, side: tex.side || THREE.FrontSide};

   if (tex.normal)
      params.normalMap = loadTexture(`${path}/${tex.normal}`, reps);

   if (tex.displacement) {
      params.displacementMap = loadTexture(`${path}/${tex.displacement.file}`,
       reps);
      params.displacementScale = tex.displacement.scale
   }
   
   if (tex.aoMap)
      params.aoMap = loadTexture(`${path}/${tex.ao}`, reps);

   if (tex.roughness)
      params.roughness = loadTexture(`${path}/${tex.roughness}, reps`);

   if (tex.metal) {
      params.metalnessMap = loadTexture(`${path}/${tex.metal.file}`, reps);
      params.metalness = tex.metal.metalness;
   }
   
   return new THREE.MeshStandardMaterial(params);
}

// Load GLTF asset from |url|, obtaining from it just the scene (not cameras,
// animations, etc).  Apply the indicated transformation, and return the scene. 
export function loadGLTFScene(url, transform) {
   let loader = new GLTFLoader();
   let modelUrl = `${window.location.origin}/models/${url}/scene.gltf`;

   loader.load(modelUrl,
      ({scene}) => {
         scene.updateMatrix(transform);
         scene.castShadow = true;
         return scene;
      },
      undefined,
      (err) => console.log(err)
   );
}

export function loadTexture(path, reps) {
   let loader = new THREE.TextureLoader();
   
   let texture = loader.load(path, (texture) => {
      if (reps) {
         texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
         texture.repeat.set(reps.x, reps.y);
      }
   });

   return texture;
}

export function loadAsset(url) {
   let loader = new GLTFLoader();
   let modelUrl = `${window.location.origin}/models/${url}/scene.gltf`;

   loader.load(
      modelUrl,
      (modelFile) => {
         let model = modelFile.scene.children[0];
         model.scale.set(0.1, 0.1, 0.1);
         model.rotation.x = Math.PI;
         model.position.set(-1, 10, -27.0);
         model.castShadow = true;
         this.scene.add(modelFile.scene);
         this.render();
      },
      undefined,
      (err) => console.log(err)
   );
}