// Star Counter that gets the number of stars from a server and increments it by 1 when "Place Your Star" is clicked
// Modified code from Claude
// Using MySQL and PHP on my own server, CORS disabled


// Get DOM elements

const starCounter = document.querySelector('#counter');
const btn = document.querySelector('#playButton');



// Load and store initial count value 

loadCount();


// Increment count when button clicked

btn.addEventListener('click', () => {
incrementCount();
});

async function loadCount() {
const response = await fetch('https://www.pavsdesign.com/Stellar-Pulse/get-count.php');
const count = await response.text(); 
starCounter.innerText = count + ' stars';

return count;
}

async function incrementCount() {
const response = await fetch('https://www.pavsdesign.com/Stellar-Pulse/increment-count.php');
loadCount();
}

