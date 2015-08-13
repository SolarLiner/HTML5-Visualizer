// ======== FFT Spectrum Script ========

var displaylog    = true;     // Display mode
var filled        = true;    // Fill mode (stroke/fill for false/true)
var oscilloscope  = false;    // Spectrum or Oscilloscope
var enhanced      = true;     // Enhanced frequencies "guesstimation"
var fftsize       = 2048;     // FFT Window size

var foreColor     = "white";  // Foreground color

// create the audio context (chrome only for now)
if (!window.AudioContext) {
  if (!window.webkitAudioContext) {
    alert('no audiocontext found');
  }
  window.AudioContext = window.webkitAudioContext;
}

var context = new AudioContext();
var audioBuffer;
var sourceNode;
var analyser;
var javascriptNode;

// Init the player to a manageable volume for FFT
$("#player")[0].volume = 0.5;

// get the context from the canvas to draw on
var ctx = $("#canvas").get(0).getContext('2d');
var width = $('#canvas').attr('width');
var height = $('#canvas').attr('height');

// create a gradient for the fill. Note the strange
// offset, since the gradient is calculated based on
// the canvas, not the specific element we draw

// load the sound
setupAudioNodes();

function setupAudioNodes() {

  // setup a javascript node
  javascriptNode = context.createScriptProcessor(1024, 1, 1);
  // connect to destination, else it isn't called
  javascriptNode.connect(context.destination);

  // setup a analyzer
  analyser = context.createAnalyser();
  analyser.smoothingTimeConstant = 0.5;
  analyser.fftSize = fftsize;
  
  // create a buffer source node
  sourceNode = context.createMediaElementSource($('#player')[0]);
  sourceNode.connect(analyser);
  analyser.connect(javascriptNode);

  sourceNode.connect(context.destination);
}

// log if an error occurs
function onError(e) {
  console.log(e);
}

// when the javascript node is called
// we use information from the analyzer node
// to draw the volume
javascriptNode.onaudioprocess = function() {

  // get the average for the first channel
  var array = new Uint8Array(analyser.frequencyBinCount);
  
  if(oscilloscope) analyser.getByteTimeDomainData(array);
  else analyser.getByteFrequencyData(array);

  // clear the current state
  ctx.clearRect(0, 0, width, height);

  // set the fill style
  //ctx.fillStyle = gradient;
  drawSpectrum(array);

};

function drawSpectrum(array) {
  ctx.beginPath();
  ctx.lineWidth=  1;
  ctx.strokeStyle=foreColor;
  ctx.lineJoin=   "round";
  ctx.fillStyle=  foreColor;
  
  if(oscilloscope) ctx.moveTo(0, height/2); 
  else ctx.moveTo(0, height);
  
  for (var i = 0; i < (array.length); i++) {
    var value = (array[i]/256.0)*height;
    
    if(oscilloscope) {
      var len = width/array.length;
      
      ctx.lineTo(i*len, height-value);
    } else {
      if(displaylog) { // Logarithmic scale mode
        var logi = Math.log(i + 1);
        var lasti = Math.log(i);
        var w = 148*width/array.length;
        
        var cori = logi;
        // Try to guesstimate the real frequency in between the two points
        var lastVal = (array[i-1]/256.0)*height;
        
        var lerpCtrl = (lastVal-value)/256+0.5; // normalized control point
        cori = lerp(lasti, logi, lerpCtrl);
        
        if (i!=0 && enhanced) ctx.lineTo(cori*w, height - value);
        else ctx.lineTo(logi*w, height - value);
        
      }else {         // Linear mode
        var len = width/array.length;
        
        ctx.lineTo(i*len, height-value);
      }
    }
  }
  if(oscilloscope) ctx.lineTo(width, height/2);
  else ctx.lineTo(width, height);
  
  if(!filled) ctx.stroke();
  else ctx.fill();
};


function toggleScale() {
  displaylog = !displaylog;
}

function toggleStyle() {
  filled = !filled;
}

function toggleMode() {
  oscilloscope = !oscilloscope;
}

function changeColor(col) {
  foreColor = col;
}

// MISC
function get(url, callback) {
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() { 
    if (request.readyState === 4 && request.status === 200) {
      callback(request.responseText);
    }
  }

  request.open("GET", url, true);            
  request.send(null);
}

function lerp(a, b, x) {
  return a*(1-x)+b*x;
}