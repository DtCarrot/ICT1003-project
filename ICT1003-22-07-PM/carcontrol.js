const Gpio = require('pigpio').Gpio
// Define the Gpio pins that connect to the 2 motors
const pinANo = 26
const pinBNo = 5
const enMotorA = 13
const enMotorB = 12
const pinCNo = 16
const pinDNo = 6
const pinA = new Gpio(pinANo, { mode: Gpio.OUTPUT })
const pinB = new Gpio(pinBNo, { mode: Gpio.OUTPUT })
const pinC = new Gpio(pinCNo, { mode: Gpio.OUTPUT })
const pinD = new Gpio(pinDNo, { mode: Gpio.OUTPUT })
const motorA = new Gpio(enMotorA, { mode: Gpio.OUTPUT })
const motorB = new Gpio(enMotorB, { mode: Gpio.OUTPUT })
let fastPWM = 200
let slowPWM = 80

const moveForward = () => {
  motorA.pwmWrite(fastPWM)
  motorB.pwmWrite(fastPWM)
  // Move forward
  pinA.digitalWrite(1)
  pinB.digitalWrite(0)
  pinC.digitalWrite(1)
  pinD.digitalWrite(0)
}

const moveBackward = () => {
  motorA.pwmWrite(fastPWM)
  motorB.pwmWrite(fastPWM)
  // Move backwards based on truth table
  pinA.digitalWrite(0)
  pinB.digitalWrite(1)
  pinC.digitalWrite(0)
  pinD.digitalWrite(1)
}

const moveLeft = () => {
  // Turn left so Motor A needs to be slower
  motorA.pwmWrite(slowPWM)
  motorB.pwmWrite(fastPWM)
  // Move forward
  pinA.digitalWrite(1)
  pinB.digitalWrite(0)
  pinC.digitalWrite(1)
  pinD.digitalWrite(0)
}

const moveRight = () => {
  motorA.pwmWrite(fastPWM)
  // Turn left so Motor A needs to be slower
  motorB.pwmWrite(slowPWM)
  // Move forward
  pinA.digitalWrite(1)
  pinB.digitalWrite(0)
  pinC.digitalWrite(1)
  pinD.digitalWrite(0)
}

const stop = () => {
  motorA.pwmWrite(0)
  motorB.pwmWrite(0)
  // Stop the car completely
  pinA.digitalWrite(0)
  pinB.digitalWrite(0)
  pinC.digitalWrite(0)
  pinD.digitalWrite(0)
}

module.exports = {
  move: action => {
    switch (action) {
      case 'STOP':
        stop()
        break
      case 'F':
        moveForward()
        break
      case 'FL':
        moveLeft()
        break
      case 'FR':
        moveRight()
        break
      case 'B':
        moveBackward()
        break
      case 'STOP':
        stop()
        break
    }
  },
}
