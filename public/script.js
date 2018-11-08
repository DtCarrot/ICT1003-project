var canvas = document.getElementById('canvas')
var context = canvas.getContext('2d')
var sendCanvas = document.getElementById('sendCanvas')
var sendContext = canvas.getContext('2d')

// canvas.width = 320
// canvas.height = 240
sendContext.width = canvas.width
sendContext.height = canvas.height
var video = document.getElementById('video')
var socket = io()
function logger(msg) {
  $('#logger').text(msg)
}
function loadCam(stream) {
  video.src = window.URL.createObjectURL(stream)
  logger('camara cargada correctamente [OK]')
}
function loadFail() {
  logger('Camara no encontrada, revise la camara')
}
function viewVideo(video, context) {
  context.drawImage(video, 0, 0, context.width, context.height)
  //para trasmitir las imagenes como cadena,  webp es un formato parecido a png

  console.log('Width: ', context.width)
  socket.emit('stream', canvas.toDataURL('image/webp'))
}
$(function() {
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msgGetUserMedia
  if (navigator.getUserMedia) {
    navigator.getUserMedia({ video: true }, loadCam, loadFail)
  }
  setInterval(function() {
    viewVideo(video, sendContext)
  }, 120)
})

var tracker = new tracking.ObjectTracker('face')
tracker.setInitialScale(4)
tracker.setStepSize(2)
tracker.setEdgesDensity(0.1)
tracking.track('#video', tracker, { camera: true })
tracker.on('track', function(event) {
  context.clearRect(0, 0, canvas.width, canvas.height)
  event.data.forEach(function(rect) {
    context.strokeStyle = '#a64ceb'
    context.strokeRect(rect.x, rect.y, rect.width, rect.height)
    context.font = '11px Helvetica'
    context.fillStyle = '#fff'
    context.fillText(
      'x: ' + rect.x + 'px',
      rect.x + rect.width + 5,
      rect.y + 11,
    )
    context.fillText(
      'y: ' + rect.y + 'px',
      rect.x + rect.width + 5,
      rect.y + 22,
    )
  })
})
