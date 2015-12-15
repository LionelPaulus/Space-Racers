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
     * @return array
     */
    getPlayers: function (id) {
        return this.rooms[id].players;
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
