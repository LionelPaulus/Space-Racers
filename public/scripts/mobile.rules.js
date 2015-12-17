
$('#mobile [data-page="rules"]').on('click', function () {
    socket.emit('game:ready');
    changePage('waiting');
});
