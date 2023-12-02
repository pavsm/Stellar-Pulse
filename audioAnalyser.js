const audio = document.querySelector('#song');

window.AudioContext = window.AudioContext || window.webkitAudioContext;
const ctx = new window.AudioContext();
const analyser = ctx.createAnalyser();
const source = ctx.createMediaElementSource(audio);
source.connect(analyser);
source.connect(ctx.destination);
analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount
let dataArray = new Uint8Array(bufferLength)

function pulsing(){ // getting data from the song frequency to apply pulsing effect
    analyser.getByteFrequencyData(dataArray);
    if(dataArray[1] > 250){
        document.querySelector('#canvas').classList.add("pulse");
    } else {
        document.querySelector('#canvas').classList.remove("pulse");
    }
}

setInterval(pulsing, 10); 