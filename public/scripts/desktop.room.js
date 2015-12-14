// Lorsque le serveur nous envoie le code de la room
socket.on('room:created', function (id) {
    $('#code').html(id);
});


$('#askCode').on('click', function () {
    socket.emit('room:create');
    $(this).hide();
});