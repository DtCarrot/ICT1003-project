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
let motorAPWM = 200
let motorBPWM = 200

const moveForward = () => {
  motorA.pwmWrite(motorAPWM)
  motorB.pwmWrite(motorAPWM)
  // Move forward
  pinA.digitalWrite(1)
  pinB.digitalWrite(0)
  pinC.digitalWrite(1)
  pinD.digitalWrite(0)
}

const moveBackward = () => {
  motorA.pwmWrite(motorAPWM)
  motorB.pwmWrite(motorAPWM)
  // Move backwards based on truth table
  pinA.digitalWrite(0)
  pinB.digitalWrite(1)
  pinC.digitalWrite(0)
  pinD.digitalWrite(1)
}

const moveLeft = () => {
  // Turn left so Motor A needs to be slower
  motorA.pwmWrite(motorAPWM - 60)
  motorB.pwmWrite(motorAPWM)
  // Move forward
  pinA.digitalWrite(1)
  pinB.digitalWrite(0)
  pinC.digitalWrite(1)
  pinD.digitalWrite(0)
}

const moveRight = () => {
  motorA.pwmWrite(motorAPWM)
  // Turn left so Motor A needs to be slower
  motorB.pwmWrite(motorAPWM - 60)
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
