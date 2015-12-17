var express = require('express'); //EXPRESS c'est un framework qui va juste servir a servir le site statique aux utilisateur
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000; // Process c'est pour heroku car le port peut changer


// Partials
var rooms = require('./src/rooms.js');


// Site static
app.use(express.static(__dirname + '/public'));



// Lorsqu'un utilisateur se connecte au serv
io.on('connection', function(socket) {

    // Lorsque le PC cree une room
    socket.on('room:create', function () {
        var id = rooms.generateID();
        rooms.create(id, socket);
        socket.roomID = id;

        // On envoie l'id de la room au client
        socket.emit('room:created', id);

        console.log("New room "+ id +" created");
    });


    // Lorsqu'un iPhone rejoint une room
    socket.on('room:join', function (room) {
        // Si la room demande n'existe pas
        if (rooms.exists(room) === false) {
            socket.emit('room:error', 'Game not found');
            return;
        }

        // Si la room demande est deja commencee
        if (rooms.getState(room) === true) {
            socket.emit('room:error', 'Game already started');
            return;
        }

        // Si la room demande est deja complete
        if (rooms.countPlayers(room) >= 4) {
            socket.emit('room:error', 'Game full');
            return;
        }

        // Ajoute le player a la room
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
    });


    // Lorsqu'un utilisateur choisi son vaisseau
    socket.on('spaceship:choose', function (spaceship) {
        var playerParents = rooms.getPlayersParents(socket.id);

        // Si le vaisseau est deja occupe
        if (rooms.isSpaceshipUsed(playerParents.roomID, spaceship) === true) {
            socket.emit('spaceship:error', 'Spaceship already used');
            return;
        }

        rooms.spaceshipAssign(playerParents.roomID, playerParents.playerID, spaceship);
        socket.emit('spaceship:success');

        // On previent les autres utilisateurs
        var adversaries = rooms.getAdversaries(playerParents.roomID, playerParents.playerID);
        for (var user in adversaries) {
            var player = adversaries[user];
            player.socket.emit('spaceship:picked', JSON.stringify(
                rooms.getUsedSpaceships(playerParents.roomID)
            ));
        }

        console.log('The player '+ socket.id +' chose the spaceship '+ spaceship);
    });


    // QUand tous les utilisateurs ont dismiss les regles
    socket.on('game:ready', function () {
        var playerParents = rooms.getPlayersParents(socket.id);

        // On set le player actuel comme ready
        rooms.setPlayerReady(playerParents.roomID, playerParents.playerID);

        // Si tout le monde a choisi son vaisseau
        // On commence la partie
        if (rooms.arePlayersReady(playerParents.roomID) === true) {
            // On previent le pc
            rooms.getHost(playerParents.roomID).emit('game:started', JSON.stringify(
                rooms.getUsedSpaceships(playerParents.roomID)
            ));

            // On previent les joueurs
            var players = rooms.getPlayers(playerParents.roomID);
            for (var user in players) {
                var player = players[user];
                player.socket.emit('game:started');
            }

            console.log('The game '+ playerParents.roomID +' just started');
        }
    });


    // Lorsque le pc demande a demarrer
    socket.on('spaceship:start', function () {
        if (!socket.roomID) return;

        // Si la partie est deja en cours
        if (rooms.getState(socket.roomID) === true) {
            socket.emit('game:error', 'Game already started');
            return;
        }

        // Si il n'y a pas de joueurs
        if (rooms.getPlayers(socket.roomID).length == 0) {
            socket.emit('game:error', 'No players !');
            return;
        }

        rooms.setStarted(socket.roomID);
        socket.emit('spaceship:started');

        console.log('The game '+ socket.roomID +' just started selecting spaceship');

        // On previent les joueurs
        var players = rooms.getPlayers(socket.roomID);
        for (var user in players) {
            var player = players[user];
            player.socket.emit('spaceship:started');
        }
    });


    // Lorsque le joueur bouge
    socket.on('game:move', function (pos) {
        var positions = JSON.parse(pos);
        var playerParents = rooms.getPlayersParents(socket.id);
        var playerSpaceship = rooms.getPlayers(playerParents.roomID)[playerParents.playerID].spaceship;

        // Si l'utilisateur est mort
        if (rooms.getUserState(playerParents.roomID, playerParents.playerID) === false) return;

        // Send to PC move event (spaceship and his positions)
        rooms.getHost(playerParents.roomID).emit('game:move', JSON.stringify({
           user: playerParents.playerID,
           positions: positions
        }));

        // console.log('Player '+ socket.id +' is moving');
    });


    // Lorsque le joueur tire
    socket.on('game:fire', function () {
        var playerParents = rooms.getPlayersParents(socket.id);
        var playerSpaceship = rooms.getPlayers(playerParents.roomID)[playerParents.playerID].spaceship;

        // Si l'utilisateur est mort
        if (rooms.getUserState(playerParents.roomID, playerParents.playerID) === false) return;

        // Send to PC fire event
        rooms.getHost(playerParents.roomID).emit('game:fire', playerParents.playerID);

        console.log('The player '+ socket.id +' shoot');
    });


    // Quand l'utilisateur meurt
    socket.on('game:dead', function (user) {
        if (!socket.roomID) return;

        if (rooms.exists(socket.roomID) === false) return;

        rooms.setUserDead(socket.roomID, user);

        // On notifie l'utilisateur de sa mort
        rooms.getPlayers(socket.roomID)[user].socket.emit('game:dead');

        console.log('The player '+ rooms.getPlayers(socket.roomID)[user].socket.id +' just died')
    });


    // Quand le jeu se termine
    socket.on('game:end', function (winner) {
        if (!socket.roomID) return;

        winner -= 1;
        var roomID = socket.roomID;

        var roomPlayers = rooms.getPlayers(roomID);

        rooms.remove(roomID);
        socket.roomID = false;

        // On deconnecte tous les utilisateurs de la room
        for(var user in roomPlayers) {
            var player = roomPlayers[user];
            player.socket.emit('room:close');
        }

        console.log(roomPlayers[winner].socket.id +' win the game '+ roomID);
        console.log('End of the game '+ roomID);
    });


    // Lorsqu'un client se deconnecte
    socket.on('disconnect', function () {
        // Lorsque l'hote se deconnecte on supprime la room
        // Et on deconnecte les telephones de la room
        if (socket.roomID) {
            var roomPlayers = rooms.getPlayers(socket.roomID);

            rooms.remove(socket.roomID);

            // On deconnecte tous les utilisateurs de la room
            for(var user in roomPlayers) {
                var player = roomPlayers[user];
                player.socket.emit('room:close');
            }

            console.log("Host logged out, delete the room "+ socket.roomID);
        } else {
            // Lorsqu'un joueur se deconnecte on le supprime de la room a laquelle il appartient
            var playerParents = rooms.getPlayersParents(socket.id);

            // Si il n'appartient a aucune partie
            if (playerParents === false) return;

            rooms.playerRemove(playerParents.roomID, playerParents.playerID);
            console.log('Player '+ socket.id +' is leaving the room '+ playerParents.roomID);

            // Si la partie n'est pas encore commencee
            if (rooms.getState(playerParents.roomID) === false) {
                // On libere le vaisseau
                var adversaries = rooms.getPlayers(playerParents.roomID);

                for (var user in adversaries) {
                    var player = adversaries[user];
                    player.socket.emit('spaceship:picked', JSON.stringify(
                        rooms.getUsedSpaceships(playerParents.roomID)
                    ));
                }
            }
        }
    });

});


// On lance le serveur sur le port 3000
server.listen(port, function () {
    console.log('Server listening at port %d', port);
});
