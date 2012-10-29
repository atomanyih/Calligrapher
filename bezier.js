
//TODO use vectors for everything so it's less stupid

// Generalized recurvsive BEZIER FUNCTIONS (why am I doing it this way I don't know)
/**
 * returns a point on the bezier curve
 * @param {Array} ps    Control points of bezier curve
 * @param {Numeric} t   Location along bezier curve [0,1]  
 * @return {Array}      Returns the point on the bezier curve
 */
function bezierPos(ps, t) {
    var size = ps.length;
    if(size == 1)
        return ps[0];
        
        //WARNING, changed direction on this. May cause problems
    var bx = (t) * bezierPos(ps.slice(1),t)[0] + (1-t) * bezierPos(ps.slice(0,size-1),t)[0],
        by = (t) * bezierPos(ps.slice(1),t)[1] + (1-t) * bezierPos(ps.slice(0,size-1),t)[1];
        
    return [bx,by];
}

function bezierSlo(ps, t) {
    var size = ps.length;
    
    if(size == 1)
        return ps[0];
        
    var dx = bezierPos(ps.slice(0,size-1),t)[0] - bezierPos(ps.slice(1),t)[0] ,
        dy = bezierPos(ps.slice(0,size-1),t)[1] - bezierPos(ps.slice(1),t)[1];
        
    return dy/dx;
}

// Bezier function class. Meant simply as a math thing (no drawing or any bullshit)
/**
 * @class Bezier function class.
 * @return {Bezier} Returns the bezier function
 */
function Bezier(controlPoints) {
    this.order = controlPoints.length-1; //useful? or obtuse? //Answer: not used anywhere
    this.controlPoints = controlPoints; 
}

Bezier.prototype.getStart = function() {
    return this.controlPoints[0];
}

Bezier.prototype.getEnd = function() {
    return this.controlPoints[this.order];
}

Bezier.prototype.getPoint = function(t) {
    return bezierPos(this.controlPoints,t);
}

Bezier.prototype.drawPlain = function(ctx) {
    if(this.order = 3) {
        var c = this.controlPoints;
        ctx.beginPath();
        ctx.moveTo(c[0][0],c[0][1]);
        ctx.bezierCurveTo(c[1][0],c[1][1],c[2][0],c[2][1],c[3][0],c[3][1]);
        ctx.stroke();
    }
        
}

Bezier.prototype.getDerivativeVector = function(t) {
    var size = .001,
        p0 = null,
        p1 = null;
    if(t<size) {
        p0 = bezierPos(this.controlPoints,t);
        p1 = bezierPos(this.controlPoints,t+2*size);
    } else if (1-t<size) {
        p0 = bezierPos(this.controlPoints,t-2*size);
        p1 = bezierPos(this.controlPoints,t);
    } else {
        p0 = bezierPos(this.controlPoints,t-size);
        p1 = bezierPos(this.controlPoints,t+size); 
    }
    return sub(p1,p0);
}

Bezier.prototype.getTangentVector = function(t) {
    return normalize(this.getDerivativeVector(t));
}

Bezier.prototype.getLength = function() {
    var res = 50, //FIXME: can't use resolution :|| that would be circular
        len = 0,
        point = this.getStart();
    for(var i = 0; i <= res; i++){
        var t = i/res;
        len += getDist(point,this.getPoint(t));
        point = this.getPoint(t);
    }
    return len;
}

Bezier.prototype.getLengthAt = function(t) {
    return getLengthAtWithStep(t,.01);
}

Bezier.prototype.getLengthAtWithStep = function(t,s) {
    var tt = 0,
        len = 0,
        point = this.getStart();
    while(tt <= t) {
        var newPoint = this.getPoint(tt)
        len += getDist(point,newPoint);
        point = newPoint;
        t += s;
    }
    return len;
}

Bezier.prototype.getPointByLength = function(l) {//doesn't actually return a point. bad name
    var t = 0,
        len = 0,
        point = this.getStart();
    while(len < l) {
        var newPoint = this.getPoint(t)
        len += getDist(point,newPoint);
        point = newPoint;
        t += .01;
        if(t>=1)
            return 1; //so we don't extrapolate or anything stupid
    }
    return t;
}
Bezier.prototype.getPointByLengthBack = function(l) {//doesn't actually return a point. bad name
    var t = 1,
        len = 0,
        point = this.getEnd();
    while(len < l) {
        var newPoint = this.getPoint(t)
        len += getDist(point,newPoint);
        point = newPoint;
        t -= .01;
        if(t<=0)
            return 1; //so we don't extrapolate or anything stupid
    }
    return t;
}

function getSlopeVector(slope,length) {
    var x = length * Math.cos(Math.atan(slope)),
        y = length * Math.sin(Math.atan(slope));
    return [x,y];
}

function scalePoint(s0,s1,p0,p1,v) { //Could probs be simplified, also currently not used
    var xScale = (p1[0]-p0[0])/(s1[0]-s0[0]), //scaling factos
        yScale = (p1[1]-p0[1])/(s1[1]-s0[1]),
        x = p0[0]+xScale*(v[0]-s0[0]), //Scaled x and y
        y = p0[1]+yScale*(v[1]-s0[1]);
    return [x,y];
}

//Draws a bezier curve scaled between the two points (good idea? bad idea? dunno.) 
/**
 * @param {Bezier}  curve   The bezier curve to be drawn
 * @param {Numerical} wid   Nominal width
 * @param {Function} wF     Width function
 * @param {Context} ctx     Context to draw to
 */
//FIXME width function gets "bunched up" around control points (detail below)
//      the bezier calculation means that more of t is spent near control points. turn on debug to see
//      this is good for detail b/c it means higher resolution at tight curves (a happy accident)
//      but the width contour gets a bit bunched up. solution: instead of wF(t), use wF(currentLength/totalLength)

//FIXME Ugly (code)
function drawBezier(curve,wid,wF,ctx) { 
    var length = curve.getLength(),
        numPoints = Math.round(length/RESOLUTION),
        leftPoints = [],
        rightPoints = [],
        currentPoint = sub(scale(curve.getStart(),2),curve.controlPoints[1]);

    for(var i = 0; i <= numPoints; i++){
        var t = i/numPoints,
            centerPoint = curve.getPoint(t)
            offset = scale(perpNorm(sub(centerPoint,currentPoint)),wF(t)*wid/2);
            
        leftPoints.push(add(centerPoint,offset));
        rightPoints.push(sub(centerPoint,offset));
        currentPoint = centerPoint;

    }
    //Drawing the polygon
    var s = leftPoints[0];
    ctx.beginPath();
    ctx.moveTo(s[0],s[1]); //starting from start center
    for(var i = 0; i < leftPoints.length; i++){
        var p = leftPoints[i];
        ctx.lineTo(p[0],p[1]);
    }
    for(var i = rightPoints.length-1; i >= 0; i--){
        var p = rightPoints[i];
        ctx.lineTo(p[0],p[1]);
    }
    ctx.closePath();
    ctx.fill();
    
    //DEBUG DRAWING
    if(DEBUG.STROKE_INTERNALS) {
        ctx.globalCompositeOperation = "xor";
        
        var end = curve.getEnd();
        for(var i = 0; i < leftPoints.length; i++) {
            var p0 = leftPoints[i],
                p1 = rightPoints[i];
            ctx.beginPath();
            ctx.moveTo(p0[0],p0[1]);
            ctx.lineTo(p1[0],p1[1]);
            ctx.stroke();
        }
        ctx.globalCompositeOperation = "source-over";
    }
    if(DEBUG.CONTROL_POINTS) {
        ctx.globalCompositeOperation = "xor";
        ctx.lineWidth = 2;
        for(var i = 0; i < curve.controlPoints.length; i++){
            var p = curve.controlPoints[i];
            drawCircle(p[0],p[1],5,ctx);
        }
        ctx.lineWidth = 1;
        ctx.globalCompositeOperation = "source-over";
    }
    
    if(DEBUG.TANGENT_LINES) {
        context.globalCompositeOperation = "xor";
        console.log("Drawing tangent lines");
        for(var i = 0; i < numPoints; i++) {
            var t = i/numPoints,
                pos = curve.getPoint(t),
                tan = scale(curve.getTangentVector(t),10);
            drawVector(tan,pos,ctx);
        }
        context.globalCompositeOperation = "source-over";
    }
}

function drawBezierTransformed(p0,p1,curve,wid,wF,ctx) {
    var s0 = curve.getStart(),
        s1 = curve.getEnd(),
        xScale = (p1[0]-p0[0])/(s1[0]-s0[0]), //scaling factos
        yScale = (p1[1]-p0[1])/(s1[1]-s0[1]),
        controlPoints = [];
        
    for(var i = 0; i <= curve.order; i++) {
        var p = curve.controlPoints[i],
            x = p0[0]+xScale*(p[0]-s0[0]), //Scaled x and y
            y = p0[1]+yScale*(p[1]-s0[1]);
        controlPoints[i] = [x,y];
    }
    drawBezier(new Bezier(controlPoints),wid,wF,ctx);
        
}


