var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

var canvas_size = getViewport();
var canvas_width  = canvas_size[0];
var canvas_height = canvas_size[1];
canvas.setAttribute("width", canvas_width);
canvas.setAttribute("height", canvas_height);

var stars = [];

function createStars()
{
    var star = {};
    star.x = rNumber(0,canvas_width);
    star.y = 0;
    star.size = rNumber(1,6);
    star.speed = star.size*0.5;
    star.style = "white";
    stars.push(star);
};

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

function createAsteroid()
{
    var random = rNumber(1,3);
    var asteroid = {};
    asteroid.x = rNumber(0,canvas_width);
    asteroid.sprite = new Image();
    asteroid.sprite.src = "img/game/asteroid" + random +".png";
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
    asteroid.y = 0- asteroid.size.y ;
    asteroid.speed = 6 - (Math.floor(asteroid.size.x * 0.1)/2);
    asteroid.rotation = rNumber(1,360);
    if (tooCloseTo(asteroid) == false)
    {
        asteroids.push(asteroid);
    }
}

function updateAsteroid()
{
    for(var i = 0; i < asteroids.length; i++)
    {
        var asteroid = asteroids[i];
        asteroid.y += asteroid.speed;
        if (asteroid.y > canvas_height)
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
    if(random > 70)
    {
        createAsteroid();
    }
    updateAsteroid();
}

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
        if (random == 0) return 1
        else return random
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

        if (istooclose == true)
        {
            return true;
        }
        else
        {
            return false;
        }
}



function drawRotated(image, x, y, angle) {

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
 else if (typeof document.documentElement != 'undefined'
 && typeof document.documentElement.clientWidth !=
 'undefined' && document.documentElement.clientWidth != 0) {
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
