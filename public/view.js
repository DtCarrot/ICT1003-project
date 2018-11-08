var socket = io()
socket.on('stream', function(image) {
  var img = document.getElementById('play')
  img.src = image
  var log = document.getElementById('logger')
  $('#logger').text(image)
})
