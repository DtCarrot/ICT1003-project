/*
 *		Main entry for the web server  
 * 	This file is responsible for initialize the socket connection and 
 * 	the HTTP server   
 * 
 * 
 */
var express = require('express')
const { exec } = require('child_process')
var app = new express()
var opn = require('opn')
var http = require('http').Server(app)
var io = require('socket.io')(http)
var car = require('./carcontrol')(io)
var light = require('./ledcontrol')(io)
require('./ble')(io)
require('./ultrasonic')
const tempMonitor = require('./temp')(io)
tempMonitor.monitorTemp()
var Log = require('log'),
log = new Log('debug')

var port = process.env.PORT || 3000

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
  res.redirect('view.html') //Render the view page
})

app.get('/pub', function(req, res) {
  res.redirect('index.html') // Render main page
})

// Listen for connection
io.on('connection', socket => {
	// Emit an image whenever it is found
  socket.on('stream', image => {
    socket.broadcast.emit('stream', image)
  })
  // When a vehicle control command has been sent
  socket.on('control', control => {
    // User enter key
    console.log(control)
    // Call carcontrol.js to change direction of the car 
    car.move(control)
  })
})

// Start the HTTP server at PORT x
http.listen(port, () => {
	// Callback function when the HTTP server has successfully started
  log.info('Starting on %s', port)
  log.info('Preparing to exec')
  //  Exec the terminal command to open a headless chromium instance.
  exec('DISPLAY=:0 sudo chromium-browser http://localhost:3000 --no-sandbox')
})

// When user enters CTRL+C to exit the application
process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    // Stop the car to prevent car from moving
    // even after the application terminated
    car.move('STOP')
    // Stop the lights from blinking
    light.stop()
    // Exit the process
    process.exit();
});
