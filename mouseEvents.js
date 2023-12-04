let starCreated = false;




// Place Your Star button events

document.querySelector('#playButton').addEventListener('click', function() {
	this.classList.add('active');
	document.querySelector('.ball').classList.add('active');
	document.querySelector('#canvas').classList.add('active');
	document.querySelector('.siteContent').classList.add('active');
	document.querySelector('.capture').classList.remove('hidden');
	document.querySelector('.info').classList.remove('hidden');

	setTimeout(function(){
		document.querySelector('.siteContent').style.display = 'none';
	}, 3000);
	

	let clickAudio = document.querySelector("#click");
	clickAudio.volume = 0.4;
	clickAudio.play();


	let song = document.querySelector("#song");

	clickAudio.addEventListener('ended', () => song.play());

	starCreated = true;
	document.querySelector('#canvas').classList.add('active');

	ctx.resume();

	let ambience = document.querySelector("#ambience");

	song.addEventListener('ended', function(){
		ambience.play();
		ambience.volume = 0.2;
	});

	ambience.addEventListener('ended', function(){ // Last song plays on loop
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




// Ball cursor (Source: Codepen.io)

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
let hideUI;




// Hiding the UI and controlling mouse position for ball cursor movement

document.addEventListener("mousemove", function(event) {
	if (hideUI){
		clearTimeout(hideUI);
	}
	
	ball.classList.remove('hidden');
	document.querySelectorAll('.buttons').forEach( (elem) => elem.classList.remove('hidden') );

	mouseX = event.pageX;
	mouseY = event.pageY;

	if (starCreated) {
		hideUI = setTimeout(function(){
			ball.classList.add('hidden');
			document.querySelectorAll('.buttons').forEach( (elem) => elem.classList.add('hidden') );
		}, 6000);
	}
});




// Capture button

let capturePressed = false;

document.querySelector('.capture').addEventListener('click', function() {
	capturePressed = true;
});



// Footer

let footer = document.querySelector('footer');

document.querySelector('.info').addEventListener('click', function openFooter() {
	footer.style.display = 'block';
	setTimeout(() => footer.classList.add('active'), 10);
	document.querySelector('canvas').addEventListener('click', function(){
		footer.classList.remove('active');
		setTimeout(() => footer.style.display = 'none', 600);
		this.removeEventListener('click', openFooter);
	});
});