// Math
function truncate(vector, max) {
    var mag = getMag(vector);
    if(mag > max)
        return scale(vector,max/mag);
    return vector;
}

function perp(vector) {
    return [vector[1],-vector[0]];
}

function perpNorm(vector) {
    return normalize(perp(vector));
}

function normalize(vector) {
    //if(vector[0]==0 && vector[1]==0)
    //    return [0,1];
    var mag = getMag(vector);
    return scale(vector,1/mag);
}

function normalizeTo(vector,mag) {
    return scale(normalize(vector),mag);
}

function projectedLength(vector,along) {
    return dot(vector,along)/getMag(along);
}

function project(vector,along) {
    
}

function scale(vector,factor) {
    return [vector[0]*factor,vector[1]*factor];
}

function add(vector1, vector2) {
    return [vector1[0]+vector2[0],vector1[1]+vector2[1]];
}

function sub(vector1, vector2) {
    return [vector1[0]-vector2[0],vector1[1]-vector2[1]];
}

function getMag(vector) {
    return getDist([0,0],vector);
}
    
function getDist(vector1,vector2) {
    return Math.sqrt(Math.pow((vector2[0]-vector1[0]),2)+Math.pow((vector2[1]-vector1[1]),2));
}

function getAngle(vector) {
    var quad = 0;
    if(vector[0]===0) // because 0 and -0 are not always the same
        vector[0] = +0;
    if(vector[0]<0)
        quad = Math.PI;
    else if(vector[0]>0 && vector[1]<0)
        quad = 2*Math.PI;
    return reduceAngle(Math.atan(vector[1]/vector[0])+quad);
}

function getAngleBetween(vector1,vector2) {
    return Math.abs(getAngle(vector1)-getAngle(vector2));
}

function getSmallerAngle(angle) {
    if(angle > Math.PI)
        return 2*Math.PI-angle;
    if(angle < -Math.PI)
        return -2*Math.PI-angle
    return angle;
}

function getSmallerAngleDeg(angle) {
    if(angle > 180)
        return 360-angle;
    if(angle < -180)
        return -360-angle;
    return angle;
}

function radToDeg(angle) {
    return angle*180/Math.PI;
}

function degToRad(angle) {
    return angle*Math.PI/180;
}

function reduceAngle(angle) {
    return angle-Math.floor(angle/(2*Math.PI))*2*Math.PI;
}

function reduceAngleDeg(angle) {
    return angle-Math.floor(angle/360)*360;
}

function dot(vector1,vector2) {
    return vector1[0]*vector2[0]+vector1[1]*vector2[1];
}

function point(vector,dir) {
    var mag = getMag(vector);
    return [Math.cos(dir)*mag,Math.sin(dir)*mag];
}

function rotate(v,rad) {
    var ang = getAngle(v);
    if(v[0] == 0 && v[1] == -8) {
        console.log(v);
        console.log("!");
        console.log(ang);
        console.log(rad);
        console.log(point(v,rad+ang));
    }
    return point(v,rad+ang);
}

function midpoint(p1,p2,t) {
    return add(scale(p1,1-t),scale(p2,t));
}


function drawVector(vector,pos,ctx) {
    ctx.beginPath();
    ctx.moveTo(pos[0],pos[1]);
    ctx.lineTo(pos[0]+vector[0],pos[1]+vector[1]);
    ctx.stroke();
}