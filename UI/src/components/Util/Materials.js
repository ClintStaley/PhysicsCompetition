import * as ImageUtil from './ImageUtil'

import steelPlateAlbedo from '../../assets/textures/steelPlate/albedo.png';
import steelPlateNormal from '../../assets/textures/steelPlate/normal.png';
import steelPlateRoughness from '../../assets/textures/steelPlate/roughness.png';
import steelPlateAo from '../../assets/textures/steelPlate/ao.png';

import concreteAlbedo from '../../assets/textures/concrete/albedo.jpg';
import concreteNormal from '../../assets/textures/concrete/normal.jpg';
import concreteMetalness from '../../assets/textures/concrete/metalness.jpg';
import concreteRoughness from '../../assets/textures/concrete/roughness.jpg';
import concreteAo from '../../assets/textures/concrete/ao.jpg';

import brickAlbedo from '../../assets/textures/brick/albedo.png';
import brickNormal from '../../assets/textures/brick/normal.png';
import brickRoughness from '../../assets/textures/brick/roughness.png';
import brickAo from '../../assets/textures/brick/ao.png';

import flatSteelRoughness from "../../assets/textures/flatSteel/roughness.png";

var steelMat = ImageUtil.createMaterial({
   map: steelPlateAlbedo,
   normal: steelPlateNormal,
   roughness: steelPlateRoughness,
   ao: steelPlateAo,
   metal: {metalness: 0.5},
   reps: {x: 5, y: 5}
});

var concreteMat = ImageUtil.createMaterial({
   map: concreteAlbedo,
   normal: concreteNormal,
   roughness: concreteRoughness,
   ao: concreteAo,
   metal: {file: concreteMetalness, metalness: 0.5}
});

var brickMat = ImageUtil.loadMatParams({
   map: brickAlbedo,
   normal: brickNormal,
   roughness: brickRoughness,
   ao: brickAo
});

var flatSteelMat = ImageUtil.createMaterial({
   roughness: flatSteelRoughness,
   metal: {metalness: 0.5}
});

var brickMatParams = {
   map: brickAlbedo,
   normal: brickNormal,
   roughness: brickRoughness,
   ao: brickAo
};

export {steelMat, concreteMat, brickMat, flatSteelMat, brickMatParams};
