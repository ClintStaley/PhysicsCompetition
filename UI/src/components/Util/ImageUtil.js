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
   let loader = new THREE.TextureLoader();
   let path = `${window.location.origin}/textures/${tex.root}/`;
   let reps = tex.reps;
   
   return new THREE.MeshStandardMaterial({
      color,
      normalMap: tex.normal && loadTexture(`${path}/${tex.normal}`, reps),
      displacementMap:
       tex.displacement && loadTexture(`${path}/${tex.displacement.file}`, reps),
      displacementScale: tex.displacement && tex.displacement.scale,
      roughnessMap:
       tex.roughness && loadTexture(`${path}/${tex.roughness}, reps`),
      aoMap: tex.ao && loadTexture(`${path}/${tex.ao}`, reps),
      metalnessMap: tex.metal && loadTexture(`${path}/${tex.metal.file}`, reps),
      metalness: tex.metal && tex.metal.metalness,
   });
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

loadTexture(path, reps) {
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
         console.log(modelFile.scene.children)
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

export function createTexturedMaterial(maps) {
   let loader = new THREE.TextureLoader();
   let path = `${window.location.origin}/textures/${maps.root}/`;
   let material = new THREE.MeshStandardMaterial(
      {
         color: 0x111111,
         normalMap: this.loadTexture(`${path}/${maps.normal}`),
         displacementMap: this.loadTexture(`${path}/${maps.displacement}`),
         displacementScale: 0.1,
         roughnessMap: this.loadTexture(`${path}/${maps.roughness}`),
         aoMap: this.loadTexture(`${path}/${maps.ao}`),
         metalnessMap: loader.load(`${path}/${maps.metalness}`),
         metalness: 0.5,
      }
   );
   return material;
}
