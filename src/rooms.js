var rooms_manager = {
    rooms: {},

    generateID: function () {
        return Math.round(Math.random() * 10000);
    },

    create: function (id) {
        this.rooms[id] = {
            players: [],
            state: false
        };
    },

    exists: function (id) {
        return (!this.rooms[id]) ? false : true;
    },

    getState: function (id) {
        return this.rooms[id].state;
    },

    addPlayer: function (id, user) {
        this.rooms[id].players[this.countPlayers(id)] = user;
    },

    countPlayers: function (id) {
        return this.rooms[id].players.length;
    },

    remove: function (id) {
        delete this.rooms[id];
    }
};

module.exports = rooms_manager;