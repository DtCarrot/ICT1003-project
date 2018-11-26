/*
 * 	This file manages the ble connection for the application.
 * 	
 * 
 * 
 */

const noble = require('noble')
const carcontrol = require('./carcontrol')(null)
let bleConnected = false
// Store the current socket information
let socket;

const receivedServicesAndCharacteristics = (err, services, characteristics) => {
  console.log('Discovered services and characteristics', characteristics[0])
  const echoCharacteristic = characteristics[characteristics.length - 1]
  console.log(characteristics)

  // data callback receives notifications
  echoCharacteristic.on('data', (data, isNotification) => {
    console.log('Received: "' + data + '"')
    setTimeout(function() {}, 5000)
	  console.log('Control: ', carcontrol)
    carcontrol.move(data.toString())
  })

  // subscribe to be notified whenever the peripheral update the characteristic
  echoCharacteristic.subscribe(err => {
    if (err) {
      console.error('Error subscribing to echoCharacteristic')
    } else {
      console.log('Subscribed for echoCharacteristic notifications')
    }
  })
}

  // create an interval to send data to the service
  let count = 0

// This function will send a connect signal to the tinycircuit ble device.
const connectAndSetUp = peripheral => {
  peripheral.connect(err => {
    if (err) {
      console.error(`Error in connecting to devices ${err}`)
    }
    console.log('Connected to', peripheral.id)
    bleConnected = true
    if(socket) { 
      socket.emit('bleStatus', bleConnected)
    }

    peripheral.discoverAllServicesAndCharacteristics(
      receivedServicesAndCharacteristics,
    )
  })

// 	When the bluetooth device is about to disconnect
  peripheral.on('disconnect', () => {
	  // We need to start scanning again. It could be a temporary disconnection.
    noble.startScanning([], true)
    bleConnected = false
    if(socket) {
		// Update the socket so we can update the bluetooth connectivity on the GUI 
      socket.emit('bleStatus', bleConnected)
    }
    console.log('disconnected')
  })
}

noble.startScanning([], true) // any service UUID, allow duplicates

noble.on('stateChange', state => {
  if (state === 'poweredOn') {
    console.log('Scanning')
    noble.startScanning()
  } else {
    noble.stopScanning()
  }
})

// When a new device has been discovered
noble.on('discover', peripheral => {
  // connect to the first peripheral that is scanned
  const name = peripheral.advertisement.localName
  const address = peripheral.address
  // We only connect to the ble device with the given address 
  if (address == 'e2:fc:41:3e:6b:e5') {
	  // Stop scanning as we have found the device we want to connect to
	noble.stopScanning()
    console.log(peripheral)
    console.log(`Connecting to '${name}' ${peripheral.id}`)
    connectAndSetUp(peripheral)
  }
})


module.exports = (io) => {
  if(io != null) {
    io.on('connection', ioSocket => {
      console.log('Connected to ble')
      socket = ioSocket
		// Update the socket so we can update the bluetooth connectivity on the GUI 
      socket.emit('bleStatus', bleConnected)
    })
  }
}
