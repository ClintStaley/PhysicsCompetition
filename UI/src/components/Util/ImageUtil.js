import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// Create a MeshStandard material with the given properties.  All file names
// are imported values.  All properties are nullable
//
// {
//   color: hexValue,
//   map: "filename",
//   normal: "filename",
//   displacement: {file: "filename", scale: num},
//   roughness: "filename",
//   ao: "filename",
//   metal: {file: "filename", metalness: num}
//   reps: {x: num, y: num}
// }

export function createMaterial(tex) {
   return new THREE.MeshStandardMaterial(loadMatParams(tex));
}

export function loadMatParams(tex) {
   let reps = tex.reps;
   let params = {side: tex.side || THREE.DoubleSide};

   params.color = 0XFFFFFF;

   if (tex.map)
      params.map = loadTexture(tex.map, reps);

   if (tex.normal)
      params.normalMap = loadTexture(tex.normal, reps);

   if (tex.displacement) {
      params.displacementMap = loadTexture(tex.displacement.file, reps);
      params.displacementScale = tex.displacement.scale
   }
   
   if (tex.aoMap)
      params.aoMap = loadTexture(tex.ao, reps);

   if (tex.roughness)
      params.roughness = loadTexture(tex.roughness, reps);

   if (tex.metal) {
      if (tex.metal.file)
         params.metalnessMap = loadTexture(tex.metal.file, reps);
      params.metalness = tex.metal.metalness;
   }
   
   return params;
}

export function createMatFromParams(modelParams, reps) {
   let newParams = {...modelParams};

   ['map', 'normalMap', 'displacementMap', 'roughness', 'aoMap']
    .forEach(prop => {
      if (modelParams[prop]) {
         newParams[prop] = modelParams[prop].clone();

         if (reps) {
            newParams[prop].needsUpdate = true;
            const intrinsicRep = modelParams[prop].repeat;
            newParams[prop].repeat.set(
             intrinsicRep.x * reps.x, intrinsicRep.y * reps.y);
            newParams[prop].needsUpdate = true;
         }
      }
   })

   return new THREE.MeshStandardMaterial(newParams);
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


// Takes parameters to be cloned, an optional repeat count for the desired
// height and width for the texture to repeat in meters, and an optional offset
// value. 
// 
// Returns cloned parameters, with their repeat and offset adjusted. 
// 
// This function requires the textures in the parameters to be loaded
export function cloneMatPrms(prms, rep, offset) {
   let clonedPrms = {...prms};
   ['map', 'normalMap', 'displacementMap', 'roughness', 'aoMap']
    .forEach(prop => {
      if (prms[prop]) {
         clonedPrms[prop] = prms[prop].clone();

         if (rep) {
            const intrinsicRep = prms[prop].repeat;
            clonedPrms[prop].repeat.set(
             rep.x * intrinsicRep.x, rep.y * intrinsicRep.y);
         }

         if (offset) {
            clonedPrms[prop].offset.set(offset.x, offset.y);
         }
         clonedPrms[prop].needsUpdate = true;
      }
   })

   return clonedPrms;
}