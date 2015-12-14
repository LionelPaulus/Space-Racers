var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
​
var canvas_height = canvas.height;
var canvas_width  = canvas.width;
​
var stars = [];
​
function createStars()
{
    var star = {};
    star.x = rNumber(0,canvas_width);
    star.y = -5;
    star.size = rNumber(1,3);
    star.speed = star.size*0.25;
    star.style = "white";
    stars.push(star);
};
​
function updateStars()
{
    for(var i = 0; i < stars.length; i++)
    {
        var star = stars[i];
        star.y += star.speed;
​
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
​
function draw()
{
    window.requestAnimationFrame(draw);
    //erase canvas
    clear();
    //background updates
    createStars();
    updateStars();
}
​
​
​
​
function rNumber(x,y)
{
    if (x != y && x < y)
    {
        var random = Math.floor(Math.random()*(y-x+1))+x;
        if (random == 0) return 1
        else return random
    }
}
​
function clear()
{
    ctx.clearRect(0,0,canvas.width,canvas.height);
}
​
draw();