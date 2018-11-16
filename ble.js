const noble = require('noble')
const carcontrol = require('./carcontrol')(null)

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

  // create an interval to send data to the service
  let count = 0
  /*
  setInterval(() => {
    count++
    const message = new Buffer('hello, ble ' + count, 'utf-8')
    console.log("Sending:  '" + message + "'")
    //echoCharacteristic.write(message);
  }, 2500)
  */
}

const connectAndSetUp = peripheral => {
  peripheral.connect(err => {
    if (err) {
      console.error(`Error in connecting to devices ${err}`)
    }
    console.log('Connected to', peripheral.id)

    peripheral.discoverAllServicesAndCharacteristics(
      receivedServicesAndCharacteristics,
    )
  })

  peripheral.on('disconnect', () => {
    noble.startScanning([], true)
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

noble.on('discover', peripheral => {
  // connect to the first peripheral that is scanned
  const name = peripheral.advertisement.localName
  const address = peripheral.address
  // Need to change to peripheral id in the event
  // of multiple 'BlueNRG'
  console.log("Name: ", peripheral)

  if (address == 'e2:fc:41:3e:6b:e5') {
    noble.stopScanning()
    console.log(peripheral)
    console.log(`Connecting to '${name}' ${peripheral.id}`)
    connectAndSetUp(peripheral)
  }
})
