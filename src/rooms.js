var rooms_manager = {
    rooms: {},

    /**
     * Genere un id de room
     */
    generateID: function () {
        return Math.round(Math.random() * 10000);
    },

    /**
     * Cree une room
     * @param int id
     */
    create: function (id) {
        this.rooms[id] = {
            players: [],
            state: false
        };
    },

    /**
     * Verifie si une room existe
     * @param int id
     * @return boolean
     */
    exists: function (id) {
        return (!this.rooms[id]) ? false : true;
    },

    /**
     * Recupere l'etat d'une room
     * @param int id
     * @return boolean
     */
    getState: function (id) {
        return this.rooms[id].state;
    },

    /**
     * Ajoute un joueur a une room
     * @param int id
     * @param object user
     */
    addPlayer: function (id, user) {
        this.rooms[id].players[this.countPlayers(id)] = user;
    },

    /**
     * Compte le nombre de joueur d'une room
     * @param int id
     * @return int
     */
    countPlayers: function (id) {
        return this.rooms[id].players.length;
    },

    /**
     * Recupere tous les joueurs d'une room
     * @param int id
     * @return array || false
     */
    getPlayers: function (id) {
        return this.rooms[id].players;
    },

    /**
     * Recupere la room et l'id de l'utilisateur
     * @param string socketID
     * @return object
     */
    getPlayersParents: function (socketID) {
        var infos = false;

        // Parcourt les rooms
        for(var i in this.rooms) {
            // Parcourt les players
            for(var userI in this.rooms[i].players) {
                var currentPlayer = this.rooms[i].players[userI];

                // Si on a trouve l'utilisateur
                if (currentPlayer.socket.id == socketID) {
                    infos = {playerID: userI, roomID: i};
                    break;
                }
            }

            if (infos != false) break;
        }

        return infos;
    },

    /**
     * Supprime une room
     * @param int id
     */
    remove: function (id) {
        delete this.rooms[id];
    }
};

module.exports = rooms_manager;
