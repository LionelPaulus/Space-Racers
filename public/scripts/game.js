$.get("scripts/data.json", function(hitbox) {

var socket = io.connect('localhost:3000');

var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

var virtual_canvas = document.createElement('canvas');
var virtual_ctx = virtual_canvas.getContext('2d');

var canvas_size = getViewport();
var canvas_width  = canvas_size[0];
var canvas_height = canvas_size[1];
canvas.setAttribute("width", canvas_width);
canvas.setAttribute("height", canvas_height);

var positions = {}; // Positions x, y and z from gyroscope

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
    var random = 3;//rNumber(1,3);
    var asteroid = {};
    asteroid.x = rNumber(0,canvas_width);
    asteroid.sprite = new Image();
    asteroid.type = random;
    asteroid.size = {};
    if(random == 1)
    {
        asteroid.size.x = 18;
        asteroid.size.y = 18;
    }
    else if(random == 2)
    {
        asteroid.size.x = 34;
        asteroid.size.y = 34;
    }
    else if(random == 3)
    {
        asteroid.size.x = 66;
        asteroid.size.y = 66;
    }

    asteroid.sprite.src = "img/game/asteroid" + random +".png";
    asteroid.speed = 2;
    asteroid.y = 0 - asteroid.size.y ;
    if (tooCloseTo(asteroid) === false)
    {
        asteroids.push(asteroid);
    }
}
//Update the position of asteroids and delete them if they are off canvas
function updateAsteroid()
{
    for(var i = 0, len = asteroids.length; i < len; i++)
    {
        var asteroid = asteroids[i];
        asteroid.y += asteroid.speed;
        if (asteroid.y-asteroid.size.y > canvas_height)
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

var players = [];

function createPlayerShip(number_of_player,ship_number, player_number)
{
    var ship = {};
    ship.id = player_number;
    ship.type = ship_number;
    ship.score = 0;
    if(ship_number == 1)
    {
        ship.size = {};
        ship.size.x = 53;
        ship.size.y = 112;
        ship.sprite = new Image();
        ship.sprite.src = "img/game/jedi1.png";
    }
    if (number_of_player == 1)
    {
        ship.x = Math.floor(canvas_width/2 - ship.size.x/2);
        ship.y = canvas_height-ship.size.y -50;
    }
    else if (number_of_player == 2)
    {
        if(player_number == 1)
        {
            ship.x = canvas_width/2 - ship.size.x/2 - canvas_width/4 ;
            ship.y = canvas_height-ship.size.y -50;
        }
        else if (player_number == 2)
        {
            ship.x = canvas_width/2 - ship.size.x/2 + canvas_width/4 ;
            ship.y = canvas_height-ship.size.y -50;
        }
    }

    else if (number_of_player == 3)
    {
        if(player_number == 1)
        {
            ship.x = canvas_width/2 - ship.size.x/2 - canvas_width/4;
            ship.y = canvas_height-ship.size.y -50;
        }
        else if (player_number == 2)
        {
            ship.x = canvas_width/2 - ship.size.x/2;
            ship.y = canvas_height-ship.size.y -50;
        }
        else if (player_number == 3)
        {
            ship.x = canvas_width/2 - ship.size.x/2 + canvas_width/4;
            ship.y = canvas_height-ship.size.y -50;
        }
    }

    else if (number_of_player == 4)
    {
        if(player_number == 1)
        {
            ship.x = canvas_width/2 - ship.size.x/2 - (canvas_width/8*2);
            ship.y = canvas_height-ship.size.y -50;
        }
        else if (player_number == 2)
        {
            ship.x = canvas_width/2 - ship.size.x/2 - canvas_width/12;
            ship.y = canvas_height-ship.size.y -50;
        }
        else if (player_number == 3)
        {
            ship.x = canvas_width/2 - ship.size.x/2 + canvas_width/12;
            ship.y = canvas_height-ship.size.y -50;
        }

        else if (player_number == 4)
        {
            ship.x = canvas_width/2 - ship.size.x/2 + (canvas_width/8*2);
            ship.y = canvas_height-ship.size.y -50;
        }
    }

    players.push(ship);

        // No need anymore
        socket.emit('game', JSON.stringify({
            width: canvas_width,
            height: canvas_height,
            x: ship.x,
            y: ship.y
        }));
}

var first_time = true;
socket.on('position', function (datas) {
    positions = JSON.parse(datas);

    if(first_time){
        gyroIntelligence();
        first_time = false;
    }
});

function drawShip()
{
    for(var i = 0; i < players.length;i++)
    {
        var ship = players[i];
        ctx.drawImage(ship.sprite,ship.x,ship.y);
    }
}


function applyPhysic()
{
    for(var i = 0; i < players.length;i++)
    {
        var ship = players[i];
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
                            console.log("boum");
                            break;
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
    }
    else if(kind == "asteroid")
    {
        if(obj.type == 3)
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

function draw()
{
    var random = rNumber(1,100);
    window.requestAnimationFrame(draw);
    //erase canvas
    clear();
    //background updates
    createStars();
    updateStars();

    //asteroid updates
    if(random > 85)
    {
        createAsteroid();
    }

    updateAsteroid();
    drawShip();
    applyPhysic();
}

createPlayerShip(1,1,1);
//createAsteroid();
//console.log(asteroids[0]);
//asteroids[0].sprite.onload = function() {
//ctx.drawImage(asteroids[0].sprite,asteroids[0].x,asteroids[0].y);
//}
//players[0].sprite.onload = function() {
//ctx.drawImage(players[0].sprite,players[0].x,players[0].y);
//applyPhysic();
//}

draw();


//var hitbox = {};
//hitbox.ship1 = getHitboxFromPng("img/game/jedi1.png",53,112,[],8);
//hitbox.asteroid3 = getHitboxFromPng("img/game/asteroid3.png",66,66,[],8);
//setTimeout(function() {console.log(JSON.stringify(hitbox));},5000);

function getHitboxFromPng(src,size_x,size_y,array,resolution)
{

    var sprite = new Image();
    sprite.src = src;
    sprite.onload = function()
    {
        virtual_ctx.drawImage(sprite,0,0);
        for( var y = 0; y < size_y; y=y+resolution )
        {
            for( var x = 0; x < size_x; x=x+resolution )
            {
                var pixel = virtual_ctx.getImageData( x, y, resolution, resolution );
                var global_opacity = 0;
                for(var i = 0, len = pixel.data.length; i < len;i+=4)
                {
                    if(pixel.data[i+3] <= 50)
                    {
                        global_opacity++;
                    }
                }
                if(((resolution*resolution)/2 > global_opacity))
                {
                   array.push( { x:x, y:y } );
                }
            }
        }
        clear();
    }
    return {data:array,resolution:resolution};
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

            if (asteroid.y <= ((asteroid.size.y * 2) + (asteroid.size.y / 2)))
            {
                if (((new_asteroid.x + new_asteroid.size.x) >= asteroid.x && (new_asteroid.x + new_asteroid.size.x) <= (asteroid.x + asteroid.size.x)) || (new_asteroid.x >= asteroid.x && new_asteroid.x <= asteroid.x + asteroid.size.x))
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



//function drawRotated(image, x, y, angle)
//{
//    ctx.save();
//    ctx.translate(x, y);
//    ctx.rotate(angle*Math.PI/180);
//    ctx.drawImage(image, -(image.width/2), -(image.height/2));
//    ctx.restore();
//}


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

    function gyroIntelligence() {
    var x = 0,
        y = 0,
        vx = 0,
        vy = 0,
        inertia = 5,
        x_old = 0,
        y_old = 0;

    setInterval(function() {
        var ship = players[0];

        // Get positions
        var ax = positions.x * 5,
            ay = positions.y * 5,
            az = positions.z * 5;

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
            // Update vessel position
            ship.x = x;
            ship.y = y;
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
        if (x > canvas_width - 20) {
            x = canvas_width - 20;
            vx = -vx;
        }
        if (y > canvas_height - 20) {
            y = canvas_height - 20;
            vy = -vy;
        }
    }
}
});
