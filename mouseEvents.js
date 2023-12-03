let starCreated = false;


// Place a star button

document.querySelector('#playButton').addEventListener('click', function() {
	this.classList.add('active');
	document.querySelector('.ball').classList.add('active');
	
	let clickAudio = document.querySelector("#click");
	clickAudio.volume = 0.4;
	clickAudio.play();


	let song = document.querySelector("#song");

	clickAudio.addEventListener('ended', function(){
		song.play();
	});

	starCreated = true;
	document.querySelector('#canvas').classList.add('active');

	ctx.resume();

	let ambience = document.querySelector("#ambience");

	song.addEventListener('ended', function(){
		ambience.play();
		ambience.volume = 0.2;
	});

	ambience.addEventListener('ended', function(){
		ambience.play();
		ambience.volume = 0.2;
	});

});


// Mute and unmute buttons

let muteButton = document.querySelector('.mute');
let unmuteButton = document.querySelector('.unmute');

function mutePage(elem) {
    elem.muted = true;
}

function unmutePage(elem) {
    elem.muted = false;
}

muteButton.addEventListener('click', function() {
	document.querySelectorAll("video, audio").forEach((elem) => mutePage(elem));
	this.classList.toggle('hidden');
	unmuteButton.classList.toggle('hidden');
});

unmuteButton.addEventListener('click', function() {
	document.querySelectorAll("video, audio").forEach((elem) => unmutePage(elem));
	this.classList.toggle('hidden');
	muteButton.classList.toggle('hidden');
});




// Ball cursor

const ball = document.querySelector('.ball');

let mouseX = 0;
let mouseY = 0;

let ballX = 0;
let ballY = 0;

let speed = 0.1;

// Update ball position
function animate() {
	//Determine distance between ball and mouse
	let distX = mouseX - ballX;
	let distY = mouseY - ballY;
	
	// Find position of ball and some distance * speed
	ballX = ballX + (distX * speed);
	ballY = ballY + (distY * speed);
	
	ball.style.left = ballX + "px";
	ball.style.top = ballY + "px";
	
	requestAnimationFrame(animate);
}
animate();

// Move ball with cursor
document.addEventListener("mousemove", function(event) {

	ball.classList.add('active');
	muteButton.classList.add('active');
	unmuteButton.classList.add('active');

	mouseX = event.pageX;
	mouseY = event.pageY;

	if (false) {
		setTimeout(4000, function(){
			ball.classList.remove('active');
			muteButton.classList.remove('active');
			unmuteButton.classList.remove('active');
		});
	}
});