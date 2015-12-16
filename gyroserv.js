var express = require('express'); //EXPRESS c'est un framework qui va juste servir a servir le site statique aux utilisateur
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000; // Process c'est pour heroku car le port peut changer

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

        if (game !== null) gyro_intelligence();
    });

    // client width
    // client height
    // position start (x, y)
    socket.on('game', function(infos) {
        game = socket;
        startInfos = JSON.parse(infos);

        console.log('GAME JOINED');
        console.log(startInfos);

        // if (gyroscope !== null) gyro_intelligence();
    });

    socket.on('position', function(pos) {
        positions = JSON.parse(pos);
    });

    function gyro_intelligence() {
        var x = 0,
            y = 0,
            vx = 0,
            vy = 0,
            inertia = 5,
            x_old = 0,
            y_old = 0;

        setInterval(function() {
            // Get positions
            var ax = positions.x * 5,
                ay = positions.y * 5,
                az = positions.z * 5;
            console.log(positions);

            // Calibration
            ax -= 35;

            // Fix bug reverse
            if (az < 0) {
                ax -= az;
            }

            // Dead zone
            if (ax > -10 && ax < 10) {
                ax = 0;
                if (vx > inertia) {
                    vx -= inertia;
                } else if (vx < -inertia) {
                    vx += inertia;
                } else {
                    vx = 0;
                }
            }
            if (ay > -10 && ay < 10) {
                ay = 0;
                if (vy > inertia) {
                    vy -= inertia;
                } else if (vy < -inertia) {
                    vy += inertia;
                } else {
                    vy = 0;
                }
            }

            // Inertia
            vx = vx + ay;
            vy = vy + ax;

            vx = vx * 0.97;
            vy = vy * 0.97;
            y = parseInt(y + vy / 50);
            x = parseInt(x + vx / 50);

            boundingBoxCheck();

            // Check changes
            if (x != x_old || y != y_old) {
                // Send position to server
                game.emit('position', JSON.stringify({
                    x: x,
                    y: y
                }));
                console.log('POSITIONS SENT TO THE GAME');
                // Save actual position
                x_old = x;
                y_old = y;
            }
        }, 25);


        function boundingBoxCheck() {
            if (x < 0) {
                x = 0;
                vx = -vx;
            }
            if (y < 0) {
                y = 0;
                vy = -vy;
            }
            if (x > startInfos.width - 20) {
                x = startInfos.width - 20;
                vx = -vx;
            }
            if (y > startInfos.height - 20) {
                y = startInfos.height - 20;
                vy = -vy;
            }
        }
    }
});


// We start the server on the port 3000
server.listen(port, function() {
    console.log('Server listening at port %d', port);
});
