const exec = require('child_process').exec;
let child;
const command = 'vcgencmd measure_temp'
let socket

const startMonitoring = () => {
	child = exec(command,
   function (error, stdout, stderr) {
	  console.log('temp: ', stdout);
	  const temp = stdout.split('=')[1]	
	  if (error !== null) {
		  console.log('exec error: ' + error);
	  }
	  if(socket) socket.emit('temp', temp)
	  setTimeout(()=>startMonitoring(), 4000)
   })	
}

module.exports = (io) => {
	if(io != null) {
		io.on('connection', ioSocket => {
			console.log('Setting socket for car')
			socket = ioSocket
		})
	}
  return {
		monitorTemp: startMonitoring
  }
}

