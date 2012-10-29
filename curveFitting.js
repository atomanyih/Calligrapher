function getLengths(chord) {
    var lens = [0]; //first is 0
    
    for(var i = 1; i<chord.length; i++)
        lens[i] = lens[i-1]+getDist(chord[i],chord[i-1]);
    return lens;
}

function normalizeList(lens) {
    for(var i = 1; i<lens.length; i++)
        lens[i] = lens[i]/lens[lens.length-1];
    return lens;
}

function findListMax(list) {
    var iMax = 0,
        max = list[0];
    for(var i = 0; i<list.length; i++) {
        if(max<list[i]) {
            iMax = i;
            max = list[i];
        }
    }
    return [iMax,max];       
}

function findListMin(list) {
    var iMin = 0,
        min = list[0];
    for(var i in list) {
        if(min>list[i]) {
            iMin = i;
            min = list[i];
        }
    }
    return [iMin,min];
}

function parameterize(chord) {
    /*var lens = getLengths(chord);
    return normalizeList(lens);*/
    var lens = [0]; //first is 0
    
    for(var i = 1; i<chord.length; i++)
        lens[i] = lens[i-1]+getDist(chord[i],chord[i-1]);
    for(var i = 1; i<chord.length; i++)
        lens[i] = lens[i]/(lens[chord.length-1]);
    return lens;
    
}

function parameterizeByLength(chord, curve) {
    var lens = getLengths(chord),
        ts = [0];
    for(var i = 1; i<chord.length; i++) {
        ts[i] = curve.getPointByLength(lens[i]);
    }
    return normalizeList(ts);
}

function coefficientHelper(chord,ts) { //bad name
    var c00 = 0, c01 = 0, c02x = 0, c02y = 0,
        c10 = 0, c11 = 0, c12x = 0, c12y = 0,
        x0 = chord[0][0],
        y0 = chord[0][1],
        x3 = chord[chord.length-1][0],
        y3 = chord[chord.length-1][1];
        
    for(var i = 0; i<ts.length; i++) {
        var t = ts[i],
            px = chord[i][0],
            py = chord[i][1];
        c00 += 3*Math.pow(t,2)*Math.pow(1-t,4); //I'm doing it the dumb way cause it's easier to read
        c01 += 3*Math.pow(t,3)*Math.pow(1-t,3);
        c02x += t*Math.pow(1-t,2)*(px - Math.pow(1-t,3) * x0 - Math.pow(t,3) * x3);
        c02y += t*Math.pow(1-t,2)*(py - Math.pow(1-t,3) * y0 - Math.pow(t,3) * y3);
        
        c10 += 3*Math.pow(t,3)*Math.pow(1-t,3);
        c11 += 3*Math.pow(t,4)*Math.pow(1-t,2);
        c12x += Math.pow(t,2)*(1-t)*(px - Math.pow(1-t,3) * x0 - Math.pow(t,3) * x3);
        c12y += Math.pow(t,2)*(1-t)*(py - Math.pow(1-t,3) * y0 - Math.pow(t,3) * y3);
    }
    return [[[c00,c01,c02x],[c10,c11,c12x]],
            [[c00,c01,c02y],[c10,c11,c12y]]];
}

function leastSquaresFit(chord,ts) { //IT FUCKIN WORKS FUCK YEAAAAAAAH
    if(chord.length < 4) {
        var c1 = chord[0],
            c4 = chord[chord.length-1],
            c2 = midpoint(c1,c4,.25),
            c3 = midpoint(c1,c4,.75);
        return new Bezier([c1,c2,c3,c4]);
    }
    var cs = coefficientHelper(chord,ts),
        xs = gaussianElimination(cs[0]),
        ys = gaussianElimination(cs[1]);
    
    return new Bezier([chord[0], [xs[0],ys[0]], [xs[1],ys[1]], chord[chord.length-1]]);
}

function getMaxErrorPoint(chord,ts,curve) {
    var max = 0,
        iMax = 0;
    for(var i = 0; i<ts.length; i++) {
        var dist = getDist(curve.getPoint(ts[i]),chord[i]);
        if(dist > max) {
            max = dist;
            iMax = i;
        }
    }
    return [iMax,max];
}

function fitStroke(chord) {
    var chords = splitChord(chord,detectCorners(chord)),
        curves = [];
        
    for(var i in chords) {
        var ts = parameterize(chords[i]),
            curve = leastSquaresFit(chords[i],ts);
        curves.push(curve);
    }
    
    return curves;
    /*var ts = parameterize(chord),
        curve = leastSquaresFit(chord,ts),
        err = getMaxErrorPoint(chord,ts,curve),
        errSum = sumSquaredError(chord,ts,curve);
    console.log("Error before split",errSum);*/
    
    /*for(var i = 1; i <= 2; i++) {
        console.log("reparameterize #",i);
        ts = parameterizeByLength(chord,curve);
        curve = leastSquaresFit(chord,ts);
        err = getMaxErrorPoint(chord,ts,curve);
        console.log("Max error",err);
        console.log(sumSquaredError(chord,ts,curve));
    }*/
    
    /*if(err[1]>SPLIT_THRESHOLD) {
        var curves1 = fitStroke(chord.slice(0,err[0]+1)),
            curves2 = fitStroke(chord.slice(err[0]));
        return curves1.concat(curves2);
    } //FIXME unreliable :| */
    
    //return [curve];
}

function splitCurve(chord,ts,curve) { //TODO FIGURE THIS FUCKING SHIT OUT
    var errs = [];
    for(var i = 1; i<chord.length; i++) {
        var chord1 = chord.slice(0,i+1),
            chord2 = chord.slice(i),
            ts1    = parameterize(chord1),
            ts2    = parameterize(chord2),
            curve1 = leastSquaresFit(chord1,ts1),
            curve2 = leastSquaresFit(chord2,ts2);
        errs.push(sumSquaredError(chord1,ts1,curve1) +
                  sumSquaredError(chord2,ts2,curve2));
    }
    //console.log(errs);
    return findListMin(errs);
}

function splitCurveAt(chord,i) {
    var chord1 = chord.slice(0,i+1),
        chord2 = chord.slice(i),
        ts1    = parameterize(chord1),
        ts2    = parameterize(chord2),
        curve1 = leastSquaresFit(chord1,ts1),
        curve2 = leastSquaresFit(chord2,ts2);
    return [curve1,curve2];
}

function sumSquaredError(chord,ts,curve) {
    var sum = 0;
    for(var i in chord) {
        sum += Math.pow(getDist(chord[i],curve.getPoint(ts[i])),2);
    }
    return sum;
}

// corner detection?

function detectCorners(chord) {
    var segmentLength = 30,
        angleThreshold = 135,
        indices = [];
    for(var i = 1; i<chord.length-1; i++) {
        var angle = getSmallerAngle(getAngleBetween(sub(chord[i-1],chord[i]), sub(chord[i+1],chord[i])))*180/Math.PI;

        if(angle<=angleThreshold) {
            indices.push(i);
        }
    }
    
    return indices;
}

//returns the shortest segment of the chord that is at least the given length
function getChordSegmentByLength(chord,length) {
    var dist = 0;
    var i = 0;
    while(dist<length) {
        i++;
        if(i >= chord.length) //if it's not long enough just return the whole thing
            return chord; 
        dist+=getDist(chord[i],chord[i-1]); 
    }
    return chord.slice(0,i);
}

function splitChord(chord,indices) {
    var newChords = [],
        ind = 0;
    for(var i in indices) {
        newChords.push(chord.slice(ind,indices[i]+1));
        ind = indices[i];
    }
    newChords.push(chord.slice(ind));
    return newChords;
}

function chordPrint(chord) {
    var s = "| ";
    for(var i in chord) {
        s+= chord[i] + " | ";
    }
    console.log(s);
}
