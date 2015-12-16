var socket = io.connect('localhost:3000');

var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

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
    var random = rNumber(1,3);
    var asteroid = {};
    asteroid.x = rNumber(0,canvas_width);
    asteroid.rotation = rNumber(1,360);
    asteroid.sprite = new Image();
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
    for(var i = 0; i < asteroids.length; i++)
    {
        var asteroid = asteroids[i];
        asteroid.y += asteroid.speed;
        if (asteroid.y-asteroid.size.y > canvas_height)
        {
            asteroids.splice(i,1);
        }
        else
        {
                ctx.beginPath();
                drawRotated(asteroid.sprite,asteroid.x,asteroid.y,asteroid.rotation);
                ctx.closePath();
        }
    }
}

var players = [];

function createPlayerShip(number_of_player,ship_number, player_number)
{
    var ship = {};
    ship.id = player_number;
    ship.score = 0;
    if(ship_number == 1)
    {
        ship.size = {};
        ship.size.x = 53;
        ship.size.y = 113;
        ship.sprite = new Image();
        ship.sprite.src = "img/game/jedi1.png";
    }
    if (number_of_player == 1)
    {
        ship.x = canvas_width/2 - ship.size.x/2;
        ship.y = canvas_height-ship.size.y -50;
    }
    else if (number_of_player == 2)
    {
        if(player_number == 1)
        {
            ship.x = canvas_width/2 - ship.size.x/2 - 100;
            ship.y = canvas_height-ship.size.y -50;
        }
        else if (player_number == 2)
        {
            ship.x = canvas_width/2 - ship.size.x/2 + 100;
            ship.y = canvas_height-ship.size.y -50;
        }
    }

    else if (number_of_player == 3)
    {
        if(player_number == 1)
        {
            ship.x = canvas_width/2 - ship.size.x/2 -100;
            ship.y = canvas_height-ship.size.y -50;
        }
        else if (player_number == 2)
        {
            ship.x = canvas_width/2 - ship.size.x/2;
            ship.y = canvas_height-ship.size.y -50;
        }
        else if (player_number == 3)
        {
            ship.x = canvas_width/2 - ship.size.x/2 + 100;
            ship.y = canvas_height-ship.size.y -50;
        }
    }

    else if (number_of_player == 4)
    {
        if(player_number == 1)
        {
            ship.x = canvas_width/2 - ship.size.x/2 -200;
            ship.y = canvas_height-ship.size.y -50;
        }
        else if (player_number == 2)
        {
            ship.x = canvas_width/2 - ship.size.x/2 -100;
            ship.y = canvas_height-ship.size.y -50;
        }
        else if (player_number == 3)
        {
            ship.x = canvas_width/2 - ship.size.x/2 + 100;
            ship.y = canvas_height-ship.size.y -50;
        }

        else if (player_number == 4)
        {
            ship.x = canvas_width/2 - ship.size.x/2 + 100;
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
}

createPlayerShip(1,1,1);

draw();



function clear()
{
    ctx.clearRect(0,0,canvas.width,canvas.height);
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

            if (asteroid.y < ((asteroid.size.y * 2) + (asteroid.size.y / 2)))
            {
                if (((new_asteroid.x + new_asteroid.size.x) > asteroid.x && (new_asteroid.x + new_asteroid.size.x) < (asteroid.x + asteroid.size.x)) || (new_asteroid.x > asteroid.x && new_asteroid.x < asteroid.x + asteroid.size.x))
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



function drawRotated(image, x, y, angle)
{
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle*Math.PI/180);
    ctx.drawImage(image, -(image.width/2), -(image.height/2));
    ctx.restore();
}


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
