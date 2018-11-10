var img = document.getElementById('play')
var tracker = new tracking.ObjectTracker('face')
var imageValid = false
tracker.setInitialScale(4)
tracker.setStepSize(2)
tracker.setEdgesDensity(0.1)

function updateFaceRegion(x, y, w, h) {
  var rect
  console.log('Updating region')
  if ($('.rect').length == 0) {
    $('#img-container').append('<div class="rect"/>')
  }
  $('.rect').css({
    width: w + 'px',
    height: h + 'px',
    left: img.offsetLeft + x + 'px',
    top: img.offsetTop + y + 'px',
  })
}

tracker.on('track', function(event) {
  console.log('Deteted')
  event.data.forEach(function(rect) {
    updateFaceRegion(rect.x, rect.y, rect.width, rect.height)
  })
})

var socket = io()
socket.on('stream', function(image) {
  img.src = image
  var log = document.getElementById('logger')
  $('#logger').text(image)
  if (imageValid) {
    tracking.track('#play', tracker, { camera: true })
  }
  imageValid = true
})

var LEFT_KEY = 37
var TOP_KEY = 38
var RIGHT_KEY = 39
var BOTTOM_KEY = 40
var SPACE_KEY = 32

$(document).keydown(function(e) {
  console.log(e.which)
  if (e.which < LEFT_KEY || e.which > BOTTOM_KEY) {
    if (e.which != SPACE_KEY) {
      return
    }
  }
  switch (e.which) {
    case LEFT_KEY:
      socket.emit('control', 'FL')
      break
    case TOP_KEY:
      socket.emit('control', 'F')
      break
    case BOTTOM_KEY:
      socket.emit('control', 'B')
      break
    case RIGHT_KEY:
      socket.emit('control', 'FR')
      break
    case SPACE_KEY:
      socket.emit('control', 'STOP')
      break
  }
})
