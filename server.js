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
        rooms.create(id);
        socket.roomID = id;

        // On envoie l'id de la room au client
        socket.emit('room:created', id);

        console.log("New room "+ id +" created");
    });


    // Lorsqu'un iPhone rejoint une room
    socket.on('room:join', function (room) {
        // Si la room demande n'existe pas
        if (rooms.exists(room) === false) {
            socket.emit('room:error', 'Partie non trouvée');
            return;
        }

        // Si la room demande est deja commencee
        if (rooms.getState(room) === true) {
            socket.emit('room:error', 'Partie deja en cours');
            return;
        }

        // Si la room demande est deja complete
        if (rooms.countPlayers(room) >= 4) {
            socket.emit('room:error', 'Partie complète');
            return;
        }

        // Ajoute le player a la room
        rooms.addPlayer(room, {
            socket: socket,
            spaceship: null
        });
        
        console.log('New user join room '+ room + ' ('+ rooms.countPlayers(room) +'/4)');
        socket.emit('room:success', room);
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

        }

    });

});


// On lance le serveur sur le port 3000
server.listen(port, function () {
    console.log('Server listening at port %d', port);
});
