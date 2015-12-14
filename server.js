var express = require('express'); //EXPRESS c'est un framework qui va juste servir a servir le site statique aux utilisateur
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000; // Process c'est pour heroku car le port peut changer


// Site static
app.use(express.static(__dirname + '/public'));



// Lorsqu'un utilisateur se connecte au serv
io.on('connection', function(socket) {

	

});


// On lance le serveur sur le port 3000
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});