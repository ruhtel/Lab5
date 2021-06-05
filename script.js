// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const form = document.getElementById('generate-meme');
const imgInput = document.getElementById('image-input');

const canvas = document.getElementById("user-image");
const ctx = canvas.getContext('2d');

const resetBtn = document.querySelector("[type='reset']");
const readBtn = document.querySelector("[type='button']");
const imgBtn = document.querySelector("[type='submit']");

const volGrp = document.getElementById('volume-group');
var volume = 0;

// Below code copied directly from SpeechSynth API page
const voiceSelect = document.getElementById('voice-selection');
const synth = window.speechSynthesis;
var voices = [];

function populateVoiceList() {
  voices = synth.getVoices();

  for(var i = 0; i < voices.length ; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let newDim = getDimmensions(canvas.width, canvas.height, img.width, img.height);
  ctx.drawImage(img, newDim.startX, newDim.startY, newDim.width, newDim.height);
});

imgInput.addEventListener('change', () => {
  img.src = URL.createObjectURL(imgInput.files[0]); // from FAQ
  img.alt = imgInput.files[0].name;
});

form.addEventListener('submit', (event) => {
  event.preventDefault(); // from FAQ

  let top = document.getElementById('text-top').value;
  let bottom = document.getElementById('text-bottom').value;

  ctx.fillStyle = 'white';
  ctx.font = 'bold 32px Comic Sans';
  ctx.textAlign = 'center';

  ctx.fillText(top, canvas.width / 2, 40);
  ctx.fillText(bottom, canvas.width / 2, canvas.height - 20);

  ctx.strokeStyle = 'black'; // outline text

  ctx.strokeText(top, canvas.width / 2, 40);
  ctx.strokeText(bottom, canvas.width / 2, canvas.height - 20);

  ctx.fillStyle = 'black'; // back to base fillstyle

  imgBtn.disabled = true;
  resetBtn.disabled = false;
  readBtn.disabled = false;
  voiceSelect.disabled = false;
}); 

resetBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  imgBtn.disabled = false;
  resetBtn.disabled = true;
  readBtn.disabled = true;
  voiceSelect.disabled = true;
});

readBtn.addEventListener('click', () => {

  let top = document.getElementById('text-top').value;
  let bottom = document.getElementById('text-bottom').value;

  let topVoice = new SpeechSynthesisUtterance(top);
  let botVoice = new SpeechSynthesisUtterance(bottom);

  let thisVoice = voiceSelect.selectedOptions[0].getAttribute('data-name');

  for(let i = 0; i < voices.length; i++) {
    if(thisVoice === voices[i].name) {
      topVoice.voice = voices[i];
      botVoice.voice = voices[i];
    }
  }

  synth.speak(topVoice);
  synth.speak(botVoice);
});

volGrp.addEventListener('change', () => {
  let volLvl = volGrp.childNodes[3];
  let volIcon = volGrp.childNodes[1];
  volume = volLvl.value / 100;
  
  if(volLvl.value <= 0) volIcon.src = "icons/volume-level-0.svg";
  else if(volLvl.value < 34) volIcon.src = "icons/volume-level-1.svg";
  else if(volLvl.value < 67) volIcon.src = "icons/volume-level-2.svg";
  else volIcon.src = "icons/volume-level-3.svg";
});


/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
