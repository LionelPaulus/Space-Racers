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
    star.size = rNumber(1,8);
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

function draw()
{
    window.requestAnimationFrame(draw);
    //erase canvas
    clear();
    //background updates
    createStars();
    updateStars();
}

draw();



function rNumber(x,y)
{
    if (x != y && x < y)
    {
        var random = Math.floor(Math.random()*(y-x+1))+x;
        if (random == 0) return 1
        else return random
    }
}

function clear()
{
    ctx.clearRect(0,0,canvas.width,canvas.height);
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

