var noble = require('noble')
const Gpio = require('pigpio').Gpio;
const pinANo = 26
const pinBNo = 5
const enMotorA = 13
const enMotorB = 12
const pinCNo = 16
const pinDNo = 6
const pinA = new Gpio(pinANo, {mode: Gpio.OUTPUT})
const pinB = new Gpio(pinBNo, {mode: Gpio.OUTPUT})
const pinC = new Gpio(pinCNo, {mode: Gpio.OUTPUT})
const pinD = new Gpio(pinDNo, {mode: Gpio.OUTPUT})
const motorA = new Gpio(enMotorA, {mode: Gpio.OUTPUT})
const motorB = new Gpio(enMotorB, {mode: Gpio.OUTPUT})


noble.startScanning([], true); // any service UUID, allow duplicates


noble.on('stateChange', state => {
  if (state === 'poweredOn') {
    console.log('Scanning');
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

function receivedServicesAndCharacteristics(err, services, characteristics) {
  console.log('Discovered services and characteristics', characteristics[0]);
  const echoCharacteristic = characteristics[characteristics.length - 1];
  console.log(characteristics);

  // data callback receives notifications
  echoCharacteristic.on('data', (data, isNotification) => {
    console.log('Received: "' + data + '"');
    setTimeout(function() {

    }, 5000)
    motorA.pwmWrite(200)
    motorB.pwmWrite(200)
    pinA.digitalWrite(1)
    pinB.digitalWrite(0)
    pinC.digitalWrite(1)
    pinD.digitalWrite(0)
  });
  
  // subscribe to be notified whenever the peripheral update the characteristic
  echoCharacteristic.subscribe(error => {
    if (error) {
      console.error('Error subscribing to echoCharacteristic');
    } else {
      console.log('Subscribed for echoCharacteristic notifications');
    }
  });

  // create an interval to send data to the service
  let count = 0;
  setInterval(() => {
    count++;
    const message = new Buffer('hello, ble ' + count, 'utf-8');
    console.log("Sending:  '" + message + "'");
    //echoCharacteristic.write(message);
  }, 2500)

}

function connectAndSetUp(peripheral) {

  peripheral.connect(error => {
    console.log('Connected to', peripheral.id);

    peripheral.discoverAllServicesAndCharacteristics(receivedServicesAndCharacteristics)
  });
  
  peripheral.on('disconnect', () => console.log('disconnected'));
}

noble.on('discover', peripheral => {
    // connect to the first peripheral that is scanned
    const name = peripheral.advertisement.localName;
    if(name == 'BlueNRG') {
        noble.stopScanning();
        console.log(peripheral)

        console.log(`Connecting to '${name}' ${peripheral.id}`);
        connectAndSetUp(peripheral);
    }
});


