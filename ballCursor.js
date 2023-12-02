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
	mouseX = event.pageX;
	mouseY = event.pageY;
})