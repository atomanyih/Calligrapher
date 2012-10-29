// Angle test distance
var ANG_DIST = .3;

function getSegAngleStart(curve) {
    var start = curve.getStart(),
        point = curve.getPoint(curve.getPointByLength(20)),//curve.getPoint(ANG_DIST),
        dir   = getAngle(sub(point,start));
    if(dir<0)                   //No like
        dir += 2*Math.PI;
    return dir;
}

function getSegAngleEnd(curve) {
    var end = curve.getEnd(),
        point = curve.getPoint(curve.getPointByLengthBack(20)),//curve.getPoint(1-ANG_DIST),
        dir   = getAngle(sub(end,point)); //different from counterpart, maybe bad?
    if(dir<0)
        dir += 2*Math.PI;
    return dir;
}



