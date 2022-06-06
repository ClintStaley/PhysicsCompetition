var steelPrm = {
   map: steelPlateAlbedo,
   normal: steelPlateNormal,
   displacement: {file: steelPlateHeight, scale: 0.1},
   roughness: steelPlateRoughness,
   ao: steelPlateAo,
   metal: {metalness: 0.5},
   reps: {x: 5, y: 5}
};

var concretePrm = {
   map: concreteAlbedo,
   normal: concreteNormal,
   displacement: {file: concreteHeight, scale: 0.1},
   roughness: concreteRoughness,
   ao: concreteAo,
   metal: {file: concreteMetalness, metalness: 0.5}
};

var brickPrm = {
   map: brickAlbedo,
   normal: brickNormal,
   displacement: {file: brickHeight, scale: 0.1},
   roughness: brickRoughness,
   ao: brickAo
};

var flatSteelPrm = {
   roughness: flatSteelRoughness,
   metal: {metalness: 0.5}
};

// Return promise that awaits load of all parameters in the object passed.
// "Then" on this promise yields an object of loaded param objects, labelled
// by the param names, e.g. steelPrm, concretePrm, etc.  Use these to make
// StandardMaterials or other materials.
loadMatParams(prmSpecs) {
   let loads = {};  // Object of labeled Promises returned from loadModelParams

   Object.entries(prmSpecs.forEach)(([key, value]) => {
      loads[key] = loadModelParams(value);
   });

   return Promise.all(Object.values(loads))
   .then(res => {
      let rtn = {};
      Object.keys(loads).forEach((key, idx) => {
         rtn[key] = res[idx];
      })
      return rtn;
   })
}

loadModelParams(prmSpec) {
   let reps = prmSpec.reps;
   let params = {color: 0xFFFFFF, side: prmSpec.side || THREE.DoubleSide};
   let loads = {};

   if (prmSpec.map)
      loads.map = loadTextureAsync(prmSpec.map, reps);

   if (prmSpec.normal)
      loads.normalMap = loadTextureAsync(prmSpec.normal, reps);

   if (prmSpec.displacement) {
      loads.displacementMap = loadTextureAsync(prmSpec.displacement.file, reps);
      params.displacementScale = prmSpec.displacement.scale
   }
   
   if (prmSpec.aoMap)
      loads.aoMap = loadTextureAsync(prmSpec.ao, reps);

   if (prmSpec.roughness)
      loads.roughness = loadTextureAsync(prmSpec.roughness, reps);

   if (prmSpec.metal) {
      if (prmSpec.metal.file)
         loads.metalnessMap = loadTextureAsync(prmSpec.metal.file, reps);
      params.metalness = prmSpec.metal.metalness;
   }
   
   return Promise.all(Object.values(loads))
   .then (res => {
      Object.keys(loads).forEach((key, idx) => {
         params[key] = res[idx];
      });
      params.needsUpdate = true;

      return params; 
   });
}

loadTextureAsync(path, reps) {
   return new THREE.TextureLoader().loadAsync(path)
   .then(tex => {
      if (reps) {
         tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping;
         tex.repeat.set(reps.x, reps.y);
      }
      return tex;
   });
}

/* Main program might be:
loadMatPrms({steelPrm, concretePrm, brickPrm}).then(prms => {
   Prms is now an object of loaded mat params:
   {
      steelPrm: loadedSteePrm
      concretePrm: loadedConcretePrm,
      etc...
   }
}
*/