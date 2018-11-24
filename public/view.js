var img = document.getElementById('play')
var tracker = new tracking.ObjectTracker('face')
var imageValid = false
var alertStatus = false
var socket = io()
tracker.setInitialScale(4)
tracker.setStepSize(2)
tracker.setEdgesDensity(0.1)

function updateButtonStatus(alertStatus) {
  if(alertStatus) {
    $('#alertButton').html('Stop alert')
  } else {
    $('#alertButton').html('Start alert')
  }
}


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
  console.log('Detected track')
  if(!socket) return
  socket.emit('light', true)
  alertStatus = true
  updateButtonStatus(alertStatus)
  event.data.forEach(function(rect) {
    updateFaceRegion(rect.x, rect.y, rect.width, rect.height)
  })
})

socket.on('stream', function(image) {
  img.src = image
  var log = document.getElementById('logger')
  if (imageValid) {
    tracking.track('#play', tracker, { camera: true })
  }
  imageValid = true
})
var carElement = $('#car-img').css({ 'transform': 'rotate(180deg)'})
function setTitle(title, bgColor) {
  var dirTitle = $('.car-dir')
  dirTitle.html(title)
}
var red = '#e74c3c'
var green = '#2ecc71'
socket.on('bleStatus', function(bleStatus) { 
  console.log('Current ble status: ', bleStatus)
  var title = 'Bluetooth is'
  title += bleStatus ? ' connected.' : ' not connected.'
  $('#ble-status').html(title)
})

socket.on('car_move', function(carDir) {
  console.log('Dir: ', carDir)
  var carElement = $('#car-img')
  switch(carDir) {
    case 'F':
    responsiveVoice.speak('Going straight')
    carElement.css({'transform': 'rotate(180deg)'})
    setTitle('Forward', green)
    break
    case 'FR':
    responsiveVoice.speak('Turning right')
    carElement.css({'transform': 'rotate(215deg)'})
    setTitle('Forward <br>right', green)
    break
    case 'FL':
    responsiveVoice.speak('Turning left')
    carElement.css({'transform': 'rotate(145deg)'})
    setTitle('Forward <br>left', green)
    break
    case 'B':
    responsiveVoice.speak('Going back')
    carElement.css({'transform': 'rotate(0deg)'})
    setTitle('Back', green)
    break
    case 'STOP':
    responsiveVoice.speak('Stopping')
    carElement.css({'transform': 'rotate(180deg)'})
    setTitle('Stop', red)
    break
  }
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


$('#alertButton').click(function(e) {
  // When alert button has been clicked
  console.log('Alert btn has been clicked') 
  alertStatus = !alertStatus
  socket.emit('light', alertStatus)
  if(alertStatus) {
    $('#alertButton').removeClass('btn-danger').addClass('btn-success')
  } else {
    $('#alertButton').removeClass('btn-success').addClass('btn-danger')
  }
  updateButtonStatus(alertStatus)
})
