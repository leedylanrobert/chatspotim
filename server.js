var express = require('express');
var app = express();
var server = require('http').createServer(app);
var iogood = require('socket.io').listen(server);
var users = [];
var connections = [];

server.listen(process.env.PORT || 3000);
console.log('Server running...');

var io = require('socket.io-client');
var spot = io("https://spotim-demo-chat-server.herokuapp.com",{secure: true,rejectUnauthorized: false});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

spot.on('connect', (socket) =>{
  console.log('Spot.IM');
  connections.push(socket);
  console.log('Connected: %s sockets connected!', connections.length);

  spot.on("disconnect", (data) => {
    console.log("disconnected from chat server!");
    users.splice(users.indexOf(socket.username), 1);
    updateUsernames();
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: %s sockets connected', connections.length);
  });
});

iogood.on('connection', function(socket){

  console.log('Local');
  connections.push(socket);
  console.log('Connected: %s sockets connected', connections.length);

  // Disconnect
  socket.on('disconnect', function(data){
    users.splice(users.indexOf(socket.username), 1);
    updateUsernames();
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: %s sockets connected', connections.length);
  });

  // Send message
  socket.on('send message', function(data){
    iogood.emit('new message', {msg: data, user: socket.username});
  });

  // New User
  socket.on('new user', function(data, callback){
    callback(true);
    socket.username = data;
    users.push(socket.username);
    updateUsernames();
  });

  function updateUsernames(){
    iogood.emit('get users', users);
  }
});
