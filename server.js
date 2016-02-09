var express = require('express'); // EXPRESS : framework for static website
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000; // Process : for heroku


// Partials
var rooms = require('./src/rooms.js');


// Static website
app.use(express.static(__dirname + '/public'));



// When a player connect to server
io.on('connection', function(socket) {

    // When the PC create a room
    socket.on('room:create', function () {
        var id = rooms.generateID();
        rooms.create(id, socket);
        socket.roomID = id;

        // Send the room ID to the client
        socket.emit('room:created', id);

        console.log("New room "+ id +" created");
    });


    // When a smartphone is joining a room
    socket.on('room:join', function (room) {
        // If the asked room does not exist
        if (rooms.exists(room) === false) {
            socket.emit('room:error', 'Game not found');
            return;
        }

        // If the asked room has already started
        if (rooms.getState(room) === true) {
            socket.emit('room:error', 'Game already started');
            return;
        }

        // If the asked room is full
        if (rooms.countPlayers(room) >= 4) {
            socket.emit('room:error', 'Game full');
            return;
        }

        // Add the player to the room
        rooms.addPlayer(room, {
            socket: socket,
            spaceship: null,
            ready: false,
            state: true
        });

        console.log('Player '+ socket.id +' join room '+ room + ' ('+ rooms.countPlayers(room) +'/4)');
        socket.emit('room:success', JSON.stringify(
            rooms.getUsedSpaceships(room)
        ));

        // Send number of players to Host
        rooms.getHost(room).emit('room:players', rooms.getPlayers(room).length);
    });


    // When a player choose his spaceship
    socket.on('spaceship:choose', function (spaceship) {
        var playerParents = rooms.getPlayersParents(socket.id);

        // If the spaceship is already taken
        if (rooms.isSpaceshipUsed(playerParents.roomID, spaceship) === true) {
            socket.emit('spaceship:error', 'Spaceship already used');
            return;
        }

        rooms.spaceshipAssign(playerParents.roomID, playerParents.playerID, spaceship);
        socket.emit('spaceship:success');

        // We prevent other players
        var adversaries = rooms.getAdversaries(playerParents.roomID, playerParents.playerID);
        for (var user in adversaries) {
            var player = adversaries[user];
            player.socket.emit('spaceship:picked', JSON.stringify(
                rooms.getUsedSpaceships(playerParents.roomID)
            ));
        }

        console.log('The player '+ socket.id +' chose the spaceship '+ spaceship);
    });


    // When all the players have dismiss rules
    socket.on('game:ready', function () {
        var playerParents = rooms.getPlayersParents(socket.id);

        // Actual player is ready
        rooms.setPlayerReady(playerParents.roomID, playerParents.playerID);

        // If everybody have his spaceship
        // We start the game
        if (rooms.arePlayersReady(playerParents.roomID) === true) {
            // We prevent the PC
            rooms.getHost(playerParents.roomID).emit('game:started', JSON.stringify(
                rooms.getUsedSpaceships(playerParents.roomID)
            ));

            // We prevent the players
            var players = rooms.getPlayers(playerParents.roomID);
            for (var user in players) {
                var player = players[user];
                player.socket.emit('game:started');
            }

            console.log('The game '+ playerParents.roomID +' just started');
        }
    });


    // When the PC ask for start
    socket.on('spaceship:start', function () {
        if (!socket.roomID) return;

        // If the game has already started
        if (rooms.getState(socket.roomID) === true) {
            socket.emit('game:error', 'Game already started');
            return;
        }

        // If there isn't any player
        if (rooms.getPlayers(socket.roomID).length == 0) {
            socket.emit('game:error', 'No players !');
            return;
        }

        rooms.setStarted(socket.roomID);
        socket.emit('spaceship:started');

        console.log('The game '+ socket.roomID +' just started selecting spaceship');

        // We prevent the players
        var players = rooms.getPlayers(socket.roomID);
        for (var user in players) {
            var player = players[user];
            player.socket.emit('spaceship:started');
        }
    });


    // When the player moves
    socket.on('game:move', function (pos) {
        var positions = JSON.parse(pos);
        var playerParents = rooms.getPlayersParents(socket.id);
        var playerSpaceship = rooms.getPlayers(playerParents.roomID)[playerParents.playerID].spaceship;

        // If dead
        if (rooms.getUserState(playerParents.roomID, playerParents.playerID) === false) return;

        // Send to PC move event (spaceship and his positions)
        rooms.getHost(playerParents.roomID).emit('game:move', JSON.stringify({
           user: playerParents.playerID,
           positions: positions
        }));
    });


    // When the player fires
    socket.on('game:fire', function () {
        var playerParents = rooms.getPlayersParents(socket.id);
        var playerSpaceship = rooms.getPlayers(playerParents.roomID)[playerParents.playerID].spaceship;

        // If dead
        if (rooms.getUserState(playerParents.roomID, playerParents.playerID) === false) return;

        // Send to PC fire event
        rooms.getHost(playerParents.roomID).emit('game:fire', playerParents.playerID);

        console.log('The player '+ socket.id +' shoot');
    });


    // If the player die
    socket.on('game:dead', function (user) {
        if (!socket.roomID) return;

        if (rooms.exists(socket.roomID) === false) return;

        rooms.setUserDead(socket.roomID, user);

        // It notifies the user of his death
        rooms.getPlayers(socket.roomID)[user].socket.emit('game:dead');

        console.log('The player '+ rooms.getPlayers(socket.roomID)[user].socket.id +' just died')
    });


    // When the game end
    socket.on('game:end', function (winner) {
        if (!socket.roomID) return;

        winner -= 1;
        var roomID = socket.roomID;

        var roomPlayers = rooms.getPlayers(roomID);

        //rooms.remove(roomID);
        //socket.roomID = false;

        // We disconnect all users from the room
        for(var user in roomPlayers) {
            // Reset
            roomPlayers[user].state = false;
            roomPlayers[user].ready = false;
            roomPlayers[user].spaceship = false;

            var player = roomPlayers[user];
            player.socket.emit('game:end');
        }

        console.log(roomPlayers[winner].socket.id +' win the game '+ roomID);
        console.log('End of the game '+ roomID);
    });


    // When the user answers the "do you want to replay" question
    socket.on('game:replay', function (answer) {
        var playerParents = rooms.getPlayersParents(socket.id);
        var currentPlayer = rooms.getPlayers(playerParents.roomID)[playerParents.playerID];
        var playersAlive = rooms.getPlayersState(playerParents.roomID);

        switch(answer) {
            case 0:
                // Si je suis le dernier joueur, on supprime la room
                if(playersAlive === 0 && rooms.countPlayers(playerParents.roomID) == 1) {
                    rooms.remove(playerParents.roomID);
                    // dis au PC d'afficher page d'accueil
                    console.log("Delete the room "+ playerParents.roomID);
                } else {
                    rooms.playerRemove(playerParents.roomID, playerParents.playerID);
                }

                socket.emit('room:close');
                console.log("Player "+ playerParents.playerID +" doesn't want to play again");
                break;

            case 1:
                if(playersAlive === 0) {
                    console.log('First player who wants to play again - Contact screen');
                    rooms.getHost(playerParents.roomID).emit('spaceship:started');
                }

                socket.emit('spaceship:started');
                rooms.setUserAlive(playerParents.roomID, playerParents.playerID);

                // Send number of players to Host
                rooms.getHost(playerParents.roomID).emit('room:players', rooms.getPlayersState(playerParents.roomID));

                console.log("Player "+ playerParents.playerID +" wants to play again");
                break;
        }
    });


    // When someone disconnect
    socket.on('disconnect', function () {

        if (!rooms.exists(socket.roomID)) return;

        // If he is the host, we delete the room
        // And kick all players
        if (socket.roomID) {
            var roomPlayers = rooms.getPlayers(socket.roomID);

            rooms.remove(socket.roomID);

            // Kick all players
            for(var user in roomPlayers) {
                var player = roomPlayers[user];
                player.socket.emit('room:close');
            }

            console.log("Host logged out, delete the room "+ socket.roomID);
        } else {
            // When a player disconnect, we remove it from the room to which he belongs
            var playerParents = rooms.getPlayersParents(socket.id);

            // No room
            if (playerParents === false) return;

            rooms.playerRemove(playerParents.roomID, playerParents.playerID);
            console.log('Player '+ socket.id +' is leaving the room '+ playerParents.roomID);

            // The spaceship is back available
            var adversaries = rooms.getPlayers(playerParents.roomID);
            for (var user in adversaries) {
                var player = adversaries[user];
                player.socket.emit('spaceship:picked', JSON.stringify(
                    rooms.getUsedSpaceships(playerParents.roomID)
                ));
            }
        }
    });

});


// We start the server on the port 3000
server.listen(port, function () {
    console.log('Server listening at port %d', port);
});
