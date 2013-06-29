var canvas = document.getElementById('canvas'),
    width = canvas.width,
    height = canvas.height,
    context = canvas.getContext("2d");

function drawCircle(x,y,r,ctx) {
    ctx.beginPath();
    ctx.arc(x,y,r, 0, 2*Math.PI,false);
    //ctx.fill();
    ctx.stroke();
}

function drawLine(x0,y0,x1,y1,ctx) {
    ctx.beginPath();
    ctx.moveTo(x0,y0);
    ctx.lineTo(x1,y1);
    ctx.stroke();
}


//FIXME REORGANIZE EBERYTING
//--- constants ---//
RESOLUTION = 4; 
WEIGHT = 15;
MIN_MOUSE_DIST = 5;
SPLIT_THRESHOLD = 8;
SQUARE_SIZE = 300;

DEBUG = {
    "CONTROL_POINTS" : false,
    "DRAW_POINTS" : false,
    "ERROR_LINES" : false,
    "STROKE_INTERNALS" : false,
    "TANGENT_LINES" : false,
    "CORNER_OUTLINES" : false,
    "TRANSPARENT_SEGMENTS" : false,
    "DRAW_PLAIN" : false
};
    
//--- variables ---//
strokes = [];
points = [];
lines = [];
currentPath = [];
errPoint = [];
mouseDown = false;



function setDebug(name,t) {
    DEBUG[name] = t;
    update();
}
function toggleDebug(name) {
    DEBUG[name] = !DEBUG[name];
    update();
}
function drawUI() {
    context.strokeStyle = "rgb(55,55,55)";
    context.strokeRect(0,0,width,height);
    
    /*var squareX = width/2-SQUARE_SIZE/2,
        squareY = height/2-SQUARE_SIZE/2;
    context.lineWidth = 2;
    context.strokeRect(squareX,squareY,SQUARE_SIZE,SQUARE_SIZE);
    context.lineWidth = 1;
    context.strokeRect(squareX+SQUARE_SIZE/3,squareY,SQUARE_SIZE/3,SQUARE_SIZE);
    context.strokeRect(squareX,squareY+SQUARE_SIZE/3,SQUARE_SIZE,SQUARE_SIZE/3);
    context.strokestyle = "rgb(0,0,0,0)";*/
}

function update() {
    context.clearRect(0,0,width,height);
    drawUI();
    for(var i = 0; i<strokes.length; i++)
        strokes[i].draw(WEIGHT,context);
    
    if(DEBUG.DRAW_POINTS) { 
        context.globalCompositeOperation = "xor";
        var corners = detectCorners(points),
            c = 0;
        for(var i = 0; i<points.length; i++){
            if(i == corners[c]) {
                context.lineWidth = 2;
                c++;
            }
            drawCircle(points[i][0],points[i][1],5,context);
            context.lineWidth = 1;
        }
        context.globalCompositeOperation = "source-over";
    }
    if(DEBUG.ERROR_LINES) {
        context.globalCompositeOperation = "xor";
        console.log("Drawing error lines");
        for(var i = 0; i<lines.length; i++)
            drawLine(lines[i][0],lines[i][1],lines[i][2],lines[i][3],context);
        context.globalCompositeOperation = "source-over";
    }
}

function drawCurrentPath() {
    context.beginPath();
    context.moveTo(currentPath[0][0],currentPath[0][1]);
    for(var i = 1; i<currentPath.length; i++) 
        context.lineTo(currentPath[i][0],currentPath[i][1]);
    context.stroke();
}

/*function getErrorLines() {
    var ts = parameterize(points),
        lines = [];
    for(var i = 0; i<points.length; i++) {
        var bPoint = strokes[0].segments[0].getPoint(ts[i]);
        lines.push(points[i].concat(bPoint));
    }
    return lines;
}*/

canvas.onmousedown = function(event) {
    mouseDown = true;
    currentPath = [];
};

canvas.onmouseup = function(event) {
    mouseDown = false;
    points = currentPath;
    
    var curves = fitStroke(points);
    //var curves = [leastSquaresFit(points)]; //reparameterize testing
    
    strokes.push(new Stroke(curves));
    //strokes[0]=new Stroke(curves); //reparameterize testing
    
    update();
};

canvas.onmousemove = function(event) {
    var mousePos = [event.clientX,event.clientY];
    if(mouseDown) {
        
        if(currentPath.length != 0) {
            if(getDist(mousePos,currentPath[currentPath.length-1])>=MIN_MOUSE_DIST)
                currentPath.push(mousePos);
            drawCurrentPath();
        } else
            currentPath.push(mousePos);
    } /*else {
        var ang = getAngle(sub([300,300],mousePos));
        update();
        c = setArmAngles(0,ang);
        drawCorner(c,[300,300],0,10,context);
    }*/ 
};

keydown = function(event) {
    var k = event.keyCode;
    console.log(k);
    if(k==68) {
        strokes.pop();
    }
    update();
};

window.addEventListener("keydown",keydown,true);

update();

/*for(var i = 1; i<= 9; i++) {
    var x = 100+i*50;
    drawCorner(this["C"+i],[x,100],0,2,context);
}*/
