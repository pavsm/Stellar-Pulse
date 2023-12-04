// Star Generator
// Modified code from galaxy generation example on YouTube

import * as THREE from 'three'

import { starTypes } from './config/starDistributions.js'


const texture = new THREE.TextureLoader().load('./textures/star.png');
const materials = new THREE.SpriteMaterial({map: texture, color: '#ffffff'});

const STAR_MIN = 0.25;
const STAR_MAX = 1;
let mainStar = true;

function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
}


export class Star {

    constructor(position) {
        this.position = position;
        this.starType = this.generateStarType();
        this.obj = null;
    }

    generateStarType() {
        let num = Math.random() * 100;
        let pct = starTypes.percentage;
        for (let i = 0; i < pct.length; i++) {
            num -= pct[i];
            if (num < 0) {
                return i;
            }
        }
        return 0;
    }

    updateScale(camera) {
        let dist = this.position.distanceTo(camera.position) / 250;

        // update star size
        let starSize = dist * starTypes.size[this.starType];
        starSize = clamp(starSize, STAR_MIN, STAR_MAX);
        this.obj?.scale.copy(new THREE.Vector3(starSize, starSize, starSize));
    }

    toThreeObject(scene) {
        let sprite = new THREE.Sprite(materials);
        
        if (mainStar) {
            sprite.scale.multiplyScalar(10);
            mainStar = false;
        }

        sprite.scale.multiplyScalar(starTypes.size[this.starType]);
        sprite.position.copy(this.position);

        this.obj = sprite;

        scene.add(sprite);
    }
}