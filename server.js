var express = require('express')
var app = new express()
var opn = require('opn')
var http = require('http').Server(app)
var io = require('socket.io')(http)

var Log = require('log'),
  log = new Log('debug')

var port = process.env.PORT || 3000

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
  res.redirect('view.html') //para archivos estaticos
})

app.get('/pub', function(req, res) {
  res.redirect('index.html') //para archivos estaticos
})

io.on('connection', socket => {
  socket.on('stream', image => {
    socket.broadcast.emit('stream', image)
  })
  socket.on('control', control => {
    // User enter key
    console.log(control)
  })
})

http.listen(port, function() {
  log.info('Servidor escuchando por el puerto %s', port)
  //opn('http://localhost:3000')
})
