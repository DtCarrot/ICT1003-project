//const Gpio = require('pigpio').Gpio
const Gpio = require('./gpioInit').default
const carcontrol = require('./carcontrol')(null)
 
// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECONDS_PER_CM = 1e6/34321;
 
const trigger = new Gpio(22, {mode: Gpio.OUTPUT});
const echo = new Gpio(17, {mode: Gpio.INPUT, alert: true});
 
trigger.digitalWrite(0); // Make sure trigger is low
let LESS_THAN_30_COUNT = 0
const watchHCSR04 = () => {
  let startTick;
  echo.on('alert', (level, tick) => {
    if (level == 1) {
      startTick = tick;
    } else {
      const endTick = tick;
      const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
      const distance = diff / 2 / MICROSECONDS_PER_CM
      console.log('Distance: ', distance)
      if (distance < 25) {
        LESS_THAN_30_COUNT++
      } else {
        LESS_THAN_30_COUNT = 0
      }
      if(LESS_THAN_30_COUNT == 3) {
	console.log('Collision incoming')
	LESS_THAN_30_COUNT = 0
	carcontrol.move('B')
      }
    }
  });
};
 
watchHCSR04();
 
// Trigger a distance measurement once per second
setInterval(() => {
  console.log("Starting check");
  trigger.trigger(10, 1); // Set trigger high for 10 microseconds
}, 1000);
