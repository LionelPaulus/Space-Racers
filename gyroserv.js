var express = require('express'); // Framework for static website (landing page)
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000; // Process: get port from heroku

var gyroscope = null;
var game = null;
var startInfos = {};
var positions = {};

// Static website
app.use(express.static(__dirname + '/public'));

// When a mobile connect to the room
io.on('connection', function(socket) {

    socket.on('gyroscope', function() {
        gyroscope = socket;

        console.log('GYRO JOINED');
    });

    // When the player fire -> send to game
    socket.on('fire', function() {
        game.emit('fire');
    });

    // client width
    // client height
    // position start (x, y)
    socket.on('game', function(infos) {
        game = socket;
        startInfos = JSON.parse(infos);

        console.log('GAME JOINED');
        console.log(startInfos);
    });

    socket.on('position', function(pos) {
        game.emit('position', pos);
    });
});


// We start the server on the port 3000
server.listen(port, function() {
    console.log('Server listening at port %d', port);
});
