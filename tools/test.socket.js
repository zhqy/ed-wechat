var socket = require('socket.io-client');
var uri = 'http://54.223.230.121:5002';
var client = socket(uri);
client.on('connect',function(){
  console.log('connected');
  // client.emit('breakimeter',data.sid,frame);
});

client.on('error', function(){
  console.log('error');
});

client.on('reconnecting', function(){
  console.log('reconnect');
});

client.on('connect_error', function(err){
  console.log(err.message)
})
