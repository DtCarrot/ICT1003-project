const pigpio = require('pigpio')
const Gpio = pigpio.Gpio
pigpio.configureSocketPort(8889)

exports.default = Gpio

