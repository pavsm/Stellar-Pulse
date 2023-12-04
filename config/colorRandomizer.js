import tinycolor from "tinycolor";

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// There are 10 different star colors that the user can generate, randomized each time.

const colorArray = [
    ['#FFEB88','#ffe91f'],
    ['#e0b377','#ff9e1f'],
    ['#e08977','#ff441f'],
    ['#e0778c','#ff1f4c'],
    ['#FCA5FF','#f81fff'],
    ['#D1A6FF','#AF5AFF'],
    ['#77afe0','#1f96ff'],
    ['#C0E8FF','#1dfaff'],
    ['#77e0b6','#1fffa5'],
    ['#81e077','#35ff1f']
];

const colorIndex = getRandomInt(colorArray.length);
console.log(colorIndex);

const lightColor = tinycolor(colorArray[colorIndex][0]).lighten(15).toString();
let bgColor;

if (colorIndex < 5){
    bgColor = tinycolor(colorArray[colorIndex][1]).darken(53).tetrad()[3].toHexString(); // To avoid green backgrounds
} else if (colorIndex === 5) {
    bgColor = tinycolor(colorArray[colorIndex][1]).darken(65).tetrad()[1].toHexString(); // Tetrad color turned out too bright
} else {
    bgColor = tinycolor(colorArray[colorIndex][1]).darken(53).tetrad()[1].toHexString();
}



export const COLOR_A = colorArray[colorIndex][0];
export const COLOR_B = colorArray[colorIndex][1];
export const LIGHT_COLOR = lightColor;
export const BG_COLOR = bgColor;