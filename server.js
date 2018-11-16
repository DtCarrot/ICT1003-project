var express = require('express')
const {exec} = require('child_process')
var app = new express()
var opn = require('opn')
var http = require('http').Server(app)
var io = require('socket.io')(http)
var car = require('./carcontrol')(io)
console.log('Car fn: ', car)
require('./ble')

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
    car.move(control)
  })
})

http.listen(port, () => {
  log.info('Servidor escuchando por el puerto %s', port)
  log.info('Preparing to exec')
  exec('DISPLAY=:0 sudo chromium-browser http://localhost:3000 --no-sandbox')


})

process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    car.move('STOP')
    process.exit();
});
