const Gpio = require('./gpioInit').default 
const led = new Gpio(18, {mode: Gpio.OUTPUT});
 
const LIGHT_HIGH = 200
let socket

const lightUp = (lightStatus) => {
	console.log('Current light up status: ', lightStatus)
  if(lightStatus) {
    led.pwmWrite(LIGHT_HIGH)
  } else {
    led.pwmWrite(0)
  }
}

module.exports = (io) => {
  if(io != null) {
     io.on('connection', ioSocket => {
       console.log('Setting socket for car')
       socket = ioSocket
       socket.on('light', (lightStatus) => {
         lightUp(lightStatus)
       })
     })
  }
  return {
    stop: ()=>lightUp(false)
  }
}
