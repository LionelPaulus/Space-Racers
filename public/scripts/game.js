var virtual_canvas = document.createElement('canvas');
var virtual_ctx = virtual_canvas.getContext('2d');

var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var positions = [];
var gyroInterval = null;

var canvas_size = getViewport();
var canvas_width  = canvas_size[0];
var canvas_height = canvas_size[1];
canvas.setAttribute("width", canvas_width);
canvas.setAttribute("height", canvas_height);

var time_start = 0;

var count = document.getElementById("counter");

var wait = true;

var player_alone = null;
var player_alone_spaceship = null;
var players = [];
var dead_player = [];

var sounds = {};

sounds.main = new Howl({
        urls:["sounds/ingame.mp3"],
        volume: 0.5,
        buffer:true,
        loop:true
    });

    sounds.blaster = new Howl({
        urls:["sounds/blaster.mp3"],
        volume: 0.5,
        buffer:true
    });

    sounds.explosion = new Howl({
        urls:["sounds/explosion.mp3"],
        volume: 1,
        buffer:true
    });

function countdown()
{
    setTimeout(function() {counter.innerHTML = "2"},1000);
    setTimeout(function() {counter.innerHTML = "1"},2000);
    setTimeout(function() {counter.innerHTML = "0"; counter.style.display = "none"},3000);
}

function createPlayerShip(number_of_player,ship_number, player_number)
{
    var ship = {};
    ship.id = player_number;
    ship.type = ship_number;
    ship.score = 0;
    ship.spaceship = ship_number;

    if(ship_number == 4)
    {
        ship.width = 53;
        ship.height = 112;
        ship.sprite = new Image();
        ship.sprite.src = "img/game/jedi1.png";
    }
    else if(ship_number == 2)
    {
        ship.width = 100;
        ship.height = 112;
        ship.sprite = new Image();
        ship.sprite.src = "img/game/jedi2.png";
    }
    else if(ship_number == 1)
    {
        ship.width = 59;
        ship.height = 109;
        ship.sprite = new Image();
        ship.sprite.src = "img/game/sith1.png";
    }
    else if(ship_number == 3)
    {
        ship.width = 66;
        ship.height = 112;
        ship.sprite = new Image();
        ship.sprite.src = "img/game/sith2.png";
    }
    if (number_of_player == 1)
    {
        ship.x = Math.floor(canvas_width/2 - ship.width/2);
        ship.y = canvas_height-ship.height -50;
    }
    else if (number_of_player == 2)
    {
        if(player_number == 1)
        {
            ship.x = canvas_width/2 - ship.width/2 - canvas_width/4 ;
            ship.y = canvas_height-ship.height -50;
        }
        else if (player_number == 2)
        {
            ship.x = canvas_width/2 - ship.width/2 + canvas_width/4 ;
            ship.y = canvas_height-ship.height -50;
        }
    }

    else if (number_of_player == 3)
    {
        if(player_number == 1)
        {
            ship.x = canvas_width/2 - ship.width/2 - canvas_width/4;
            ship.y = canvas_height-ship.height -50;
        }
        else if (player_number == 2)
        {
            ship.x = canvas_width/2 - ship.width/2;
            ship.y = canvas_height-ship.height -50;
        }
        else if (player_number == 3)
        {
            ship.x = canvas_width/2 - ship.width/2 + canvas_width/4;
            ship.y = canvas_height-ship.height -50;
        }
    }

    else if (number_of_player == 4)
    {
        if(player_number == 1)
        {
            ship.x = canvas_width/2 - ship.width/2 - (canvas_width/8*2);
            ship.y = canvas_height-ship.height -50;
        }
        else if (player_number == 2)
        {
            ship.x = canvas_width/2 - ship.width/2 - canvas_width/12;
            ship.y = canvas_height-ship.height -50;
        }
        else if (player_number == 3)
        {
            ship.x = canvas_width/2 - ship.width/2 + canvas_width/12;
            ship.y = canvas_height-ship.height -50;
        }

        else if (player_number == 4)
        {
            ship.x = canvas_width/2 - ship.width/2 + (canvas_width/8*2);
            ship.y = canvas_height-ship.height -50;
        }
    }

    players.push(ship);
}

//polyfill
function getViewport() {

 var viewPortWidth;
 var viewPortHeight;

 // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
 if (typeof window.innerWidth != 'undefined') {
   viewPortWidth = window.innerWidth,
   viewPortHeight = window.innerHeight
 }

// IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
 else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth !== 0) {
    viewPortWidth = document.documentElement.clientWidth,
    viewPortHeight = document.documentElement.clientHeight
 }

 // older versions of IE
 else {
   viewPortWidth = document.getElementsByTagName('body')[0].clientWidth,
   viewPortHeight = document.getElementsByTagName('body')[0].clientHeight
 }

 return [viewPortWidth, viewPortHeight];
}

function isDead(user) {
    var dead = false;

    for (var player in dead_player) {
        var current = dead_player[player];

        if (current.id == (user)) dead = true;
    }

    return dead;
}

$.get("scripts/data.JSON", function(hitbox) {

// SOCKET IO
// When the game starts
socket.on('game:started', function (spaceships) {
    reset();

    // Start the game
    spaceships = JSON.parse(spaceships);
    countdown();
    changePage('game');

    if (spaceships.length == 1) {
        time_start = Date.now();
        player_alone = 1;
        player_alone_spaceship = spaceships[0];
    }

    for (var player in spaceships) {
        var id = parseInt(player) + 1;
        createPlayerShip(spaceships.length, spaceships[player], id);

        positions[player] = {
            y_serv: 0,
            x_serv: 0,
            z_serv: 0,
            x: players[player].x,
            y: players[player].y,
            vx: 0,
            vy: 0,
            x_old: 0,
            y_old: 0
        };
    }

    // Sounds
    sounds.starship_selection.fadeOut(0,200);
    sounds.main.play();
    setTimeout(function() {wait = false;},5000);
    draw();
});

// When the user shoot
socket.on('game:fire', function(spaceship) {
    createBlasterShoot(players[spaceship]);
    sounds.blaster.play();
});

var first_time = true;

socket.on('game:move', function (datas) {
    datas = JSON.parse(datas);

    if(isDead((datas.user + 1))) return;

    positions[datas.user].x_serv = datas.positions.x;
    positions[datas.user].y_serv = datas.positions.y;
    positions[datas.user].z_serv = datas.positions.z;

    if (first_time) {
        gyroIntelligence();
        first_time = false;
    }
});

var game_play = null;
var stars = [];

// creating the first stars background
for(var i = 0; i < 600;i++)
{
    var star = {};
    star.x = rNumber(0,canvas_width);
    star.y = rNumber(0,canvas_height);
    star.size = rNumber(1,4);
    star.speed = star.size*0.5;
    star.style = "white";
    stars.push(star);
}

// Create the stars in the background
function createStars()
{
    var star = {};
    star.x = rNumber(0,canvas_width);
    star.y = 0;
    star.size = rNumber(1,4);
    star.speed = star.size*0.5;
    star.style = "white";
    stars.push(star);
}


// Update the position of the stars and delete them if they are off canvas
function updateStars()
{
    for(var i = 0; i < stars.length; i++)
    {
        var star = stars[i];
        star.y = Math.round(star.y + star.speed);
        if (star.y > canvas_height)
        {
            stars.splice(i,1);
        }
        else
        {
            ctx.beginPath();
            ctx.fillStyle = star.style;
            ctx.fillRect(star.x,star.y,star.size,star.size);
            ctx.closePath();
        }
    }
}

var asteroids = [];

// Create the asteroids
function createAsteroid()
{
    var random = rNumber(1,3);
    var asteroid = {};
    asteroid.x = rNumber(0,canvas_width);
    asteroid.sprite = new Image();
    asteroid.type = random;
    if(random == 1)
    {
        asteroid.width = 18;
        asteroid.height = 18;
        asteroid.life = 10;
    }
    else if(random == 2)
    {
        asteroid.width = 34;
        asteroid.height = 34;
        asteroid.life = 30;
    }
    else if(random == 3)
    {
        asteroid.width = 66;
        asteroid.height = 66;
        asteroid.life = 60;
    }
    asteroid.sprite.src = "img/game/asteroid" + random +".png";
    asteroid.speed = 2;
    asteroid.y = 0 - asteroid.height ;
    if (tooCloseTo(asteroid) === false)
    {
        asteroids.push(asteroid);
    }
}
// Update the position of asteroids and delete them if they are off canvas
function updateAsteroid()
{
    for(var i = 0, len = asteroids.length; i < len; i++)
    {
        var asteroid = asteroids[i];
        asteroid.y += asteroid.speed;
        if ((asteroid.y-asteroid.height > canvas_height))
        {
            asteroids.splice(i,1);
            i--;
            len--;
        }
        else
        {
                ctx.beginPath();
                ctx.drawImage(asteroid.sprite,asteroid.x,asteroid.y);
                ctx.closePath();
        }
    }
}

function drawShip()
{
    for(var i = 0; i < players.length;i++)
    {
        var ship = players[i];

        if (isDead(ship.id)) continue;

        ship.score++;
        ctx.drawImage(ship.sprite,ship.x,ship.y);
    }
}


function asteroidColision()
{
    for(var i = 0; i < players.length;i++)
    {
        var ship = players[i];

        if (isDead(ship.id) === true) continue;

        for(var d = 0; d < asteroids.length; d++)
        {
            var asteroid = asteroids[d];
            if(collide(ship,asteroid) == true)
            {
                var ship_hitbox = hitboxArea("ship",ship,[]);
                var asteroid_hitbox = hitboxArea("asteroid",asteroid,[]);

                for(var o = 0, len = ship_hitbox.length; o < len;o++)
                {
                    for(var k = 0, le = asteroid_hitbox.length; k < le;k++)
                    {
                        if(collide(ship_hitbox[o],asteroid_hitbox[k]) == true)
                        {
                            var middle_collision_x = (ship_hitbox[o].x + asteroid_hitbox[o].x)/2 - ship.width;
                            var middle_collision_y = (ship_hitbox[o].y + asteroid_hitbox[o].y)/2;
                            dead_player.push(ship);
                            ship.sprite =  null;
                            createExplosion(middle_collision_x, middle_collision_y);
                            socket.emit("game:dead",i);
                            sounds.explosion.play();
                            return true;
                        }
                    }
                }
            }
        }
    }
}

function collide(source,target)
{
    return !(
        ( ( source.y + source.height ) < ( target.y ) ) ||
        ( source.y > ( target.y + target.height ) ) ||
        ( ( source.x + source.width ) < target.x ) ||
        ( source.x > ( target.x + target.width ) )
    );
}

function hitboxArea(kind,obj,array)
{
    if(kind == "ship")
    {
        if(obj.type == 1)
        {
            for(var p = 0, len = hitbox.ship1.data.length; p < len;p++)
            {
                var area =
                {
                    x:hitbox.ship1.data[p].x +obj.x,
                    y:hitbox.ship1.data[p].y +obj.y,
                    width:hitbox.ship1.resolution,
                    height:hitbox.ship1.resolution
                }
                array.push(area);
            }
            return array;
        }

        else if(obj.type == 2)
        {
            for(var p = 0, len = hitbox.ship2.data.length; p < len;p++)
            {
                var area =
                {
                    x:hitbox.ship2.data[p].x +obj.x,
                    y:hitbox.ship2.data[p].y +obj.y,
                    width:hitbox.ship2.resolution,
                    height:hitbox.ship2.resolution
                }
                array.push(area);
            }
            return array;
        }

        else if(obj.type == 3)
        {
            for(var p = 0, len = hitbox.ship3.data.length; p < len;p++)
            {
                var area =
                {
                    x:hitbox.ship3.data[p].x +obj.x,
                    y:hitbox.ship3.data[p].y +obj.y,
                    width:hitbox.ship3.resolution,
                    height:hitbox.ship3.resolution
                }
                array.push(area);
            }
            return array;
        }

        else if(obj.type == 4)
        {
            for(var p = 0, len = hitbox.ship4.data.length; p < len;p++)
            {
                var area =
                {
                    x:hitbox.ship4.data[p].x +obj.x,
                    y:hitbox.ship4.data[p].y +obj.y,
                    width:hitbox.ship4.resolution,
                    height:hitbox.ship4.resolution
                }
                array.push(area);
            }
            return array;
        }
    }
    else if(kind == "asteroid")
    {
        if(obj.type == 1)
        {
            for(var n = 0, ln = hitbox.asteroid1.data.length; n < ln;n++)
            {
                var area =
                {
                    x:hitbox.asteroid1.data[n].x+obj.x,
                    y:hitbox.asteroid1.data[n].y+obj.y,
                    width:hitbox.asteroid1.resolution,
                    height:hitbox.asteroid1.resolution
                }
                array.push(area);
            }
            return array;
        }

        else if(obj.type == 2)
        {
            for(var n = 0, ln = hitbox.asteroid2.data.length; n < ln;n++)
            {
                var area =
                {
                    x:hitbox.asteroid2.data[n].x+obj.x,
                    y:hitbox.asteroid2.data[n].y+obj.y,
                    width:hitbox.asteroid2.resolution,
                    height:hitbox.asteroid2.resolution
                }
                array.push(area);
            }
            return array;
        }

        else if(obj.type == 3)
        {
            for(var n = 0, ln = hitbox.asteroid3.data.length; n < ln;n++)
            {
                var area =
                {
                    x:hitbox.asteroid3.data[n].x+obj.x,
                    y:hitbox.asteroid3.data[n].y+obj.y,
                    width:hitbox.asteroid3.resolution,
                    height:hitbox.asteroid3.resolution
                }
                array.push(area);
            }
            return array;
        }
    }
}

var shoots = [];
function createBlasterShoot(player)
{
    var shoot = {};
    shoot.x = Math.floor(player.x +player.width/2);
    shoot.y = player.y;
    shoot.speed = 4;
    shoot.width = 3;
    shoot.height = 10;

    shoots.push(shoot);
}

function updateBlasterShoot()
{
    for(var i = 0, len = shoots.length; i < len; i++)
    {
        var shoot = shoots[i];
        shoot.y -= shoot.speed;
        if (shoot.y-shoot.height < 0)
        {
            shoots.splice(i,1);
            i--;
            len--;
        }
        else
        {
                ctx.fillStyle = "red";
                ctx.fillRect(shoot.x,shoot.y,shoot.width,shoot.height);
        }
    }
}

function shootColision()
{
    for(var n = 0, len = shoots.length; n < shoots.length;n++)
    {
        var shoot = shoots[n];
        for(var k = 0, ln = asteroids.length; k < ln;k++)
        {
            var asteroid = asteroids[k];
            if(collide(shoot,asteroid) == true)
            {
                var asteroid_hitbox = hitboxArea("asteroid",asteroid,[]);
                for(l = 0 , u = asteroid_hitbox.length; l < u; l++)
                {
                    if(collide(shoot,asteroid_hitbox[l]) == true)
                    {
                        asteroid.life -=10;
                        shoots.splice(n,1);
                        len--;
                        if(asteroid.life == 0)
                        {
                            asteroids.splice(k,1);
                            ln--;
                        }
                        return "stop it";
                    }
                }
            }
        }
    }
}

var explosions = [];
function createExplosion(x,y)
{
    var explosion = {};
    explosion.sprite = [];
    for(var i = 1; i <= 64;i++)
    {
        var hello = new Image();
        hello.src = "img/game/explosion_sprite/"+i+".png";
        explosion.sprite.push(hello);
    }
    explosion.x = x;
    explosion.y = y;
    explosion.current_frame = 0;

    explosions.push(explosion);
}

function updateExplosion()
{
    for(var i = 0, len = explosions.length; i < len;i++)
    {
        var explosion = explosions[i];
        if(explosion.current_frame <= 63)
        {
            ctx.drawImage(explosion.sprite[explosion.current_frame],explosion.x,explosion.y);
            explosion.current_frame++;
        }
        else
        {
            explosions.splice(i,1);
            len--;
        }
    }
}

function reset()
{
    wait = true;
    first_time = true;
    player_alone = null;
    player_alone_spaceship = null;
    stars = [];
    asteroids = [];
    explosions = [];
    positions = [];
    shoots = [];
    dead_player = [];
    players = [];

    for(var i = 0; i < 600;i++) {
        var star = {};
        star.x = rNumber(0,canvas_width);
        star.y = rNumber(0,canvas_height);
        star.size = rNumber(1,4);
        star.speed = star.size*0.5;
        star.style = "white";
        stars.push(star);
    }

    initSounds();
}

function initSounds()
{
    sounds.main = new Howl({
        urls:["sounds/ingame.mp3"],
        volume: 0.5,
        buffer:true,
        loop:true
    });

    sounds.blaster = new Howl({
        urls:["sounds/blaster.mp3"],
        volume: 0.5,
        buffer:true
    });

    sounds.explosion = new Howl({
        urls:["sounds/explosion.mp3"],
        volume: 1,
        buffer:true
    });
}


function draw()
{
    var random = rNumber(1,100);
    game_play = window.requestAnimationFrame(draw);
    //erase canvas
    clear();
    //background updates
    createStars();
    updateStars();

    //asteroid updates
    if(random > 85)
    {
        if (wait == false)
        {
            createAsteroid();
        }
    }

    updateAsteroid();
    drawShip();
    updateBlasterShoot();
    shootColision();
    asteroidColision();
    updateExplosion();
    isGameOver();
}


function getSpaceshipImage(spaceship) {
    if(spaceship == 4) {
        return "img/jedistarfight.png";
    } else if(spaceship == 2) {
        return "img/xwing.png";
    } else if(spaceship == 1) {
        return "img/interceptor.png";
    } else if(spaceship == 3) {
        return "img/smit_sith.png";
    }
}


function getAlivePlayer() {
    var alivePlayer = 0;

    for (var user in players) {
        var player = players[user];
        if (player.sprite !== null) {
            alivePlayer = player;
            break;
        }
    }

    return alivePlayer;
}


function isGameOver(number_of_player)
{
    if(player_alone !== null)
    {
        if(dead_player.length == 1)
        {
            clearInterval(gyroInterval);
            // Display score
            socket.emit("game:end", player_alone);
            // We put spaceship image
            $('#end-preview').attr('src', getSpaceshipImage(player_alone_spaceship));
            // We display time
            var seconds = (Date.now() - time_start) / 1000;
            $('#end-txt').html('YOU SURVIVED '+ Math.round(seconds) +'s');
            sounds.main.fadeOut(0, 1000);

            setTimeout(function () {
                window.cancelAnimationFrame(game_play);
                changePage('end');
                clear();
                counter.innerHTML = "3";
                counter.style.display = "block";
            }, 1000);
        }
    }
    else
    {
        if((players.length - 1) == dead_player.length)
        {
            clearInterval(gyroInterval);

            var player = getAlivePlayer();
            // Display score
            socket.emit("game:end", player.id);
            // We put spaceship image
            $('#end-preview').attr('src', getSpaceshipImage(player.spaceship));
            sounds.main.fadeOut(0,1000);

            setTimeout(function () {
                window.cancelAnimationFrame(game_play);
                changePage('end');
                clear();
                counter.innerHTML = "3";
                counter.style.display = "block";
            }, 1000);
        }
    }
}

function clear()
{
    ctx.clearRect(0,0,canvas_width,canvas_height);
}


function rNumber(x,y)
{
    if (x != y && x < y)
    {
        var random = Math.floor(Math.random()*(y-x+1))+x;
        if (random === 0) return 1;
        else return random;
    }
}


function tooCloseTo(new_asteroid)
{
    var istooclose = false;

        for (var i = 0; i < asteroids.length; i++)
        {
            var asteroid = asteroids[i];

            if (asteroid.y <= ((asteroid.height * 2) + (asteroid.height / 2)))
            {
                if (((new_asteroid.x + new_asteroid.width) >= asteroid.x && (new_asteroid.x + new_asteroid.width) <= (asteroid.x + asteroid.width)) || (new_asteroid.x >= asteroid.x && new_asteroid.x <= asteroid.x + asteroid.width))
                {
                    istooclose = true;
                    break;
                }
                else
                {
                    istooclose = false;
                }
            }
        }

        if (istooclose === true)
        {
            return true;
        }
        else
        {
            return false;
        }
}
});
