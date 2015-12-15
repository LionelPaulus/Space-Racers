var express = require('express'); //EXPRESS c'est un framework qui va juste servir a servir le site statique aux utilisateur
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000; // Process c'est pour heroku car le port peut changer

var gyroscope = null;
var game = null;
var startInfos = {};

// Site static 
app.use(express.static(__dirname + '/public'));

// Lorsqu'un utilisateur se connecte au serv
io.on('connection', function(socket) {
    
    socket.on('gyroscope', function () {
        gyroscope = socket;

        console.log('GYRO JOINED');

        if (game != null) socket.emit('init', JSON.stringify(startInfos));
    });

    // client width
    // client height
    // position start (x, y)
    socket.on('game', function (infos) {
        game = socket;
        startInfos = JSON.parse(infos);

        console.log('GAME JOINED');
        console.log(startInfos);

        if (gyroscope != null) socket.emit('init', startInfos);
    });

    socket.on('position', function (pos) {
        game.emit('position', pos);

        console.log('POSIITION');
        console.log(pos);
    });

});


// On lance le serveur sur le port 3000
server.listen(port, function () {
    console.log('Server listening at port %d', port);
});
