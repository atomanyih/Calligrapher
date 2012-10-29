
/**
 * @classDescription        A shape made out of bezier curves. Hopefully connected
 * @param {Array} sections
 */
function BezierShape(sections) {
    this.sections = sections;
    this.name = ""; //optional
    this.skeleton = [];
}

BezierShape.prototype.copy = function() {
    var newSections = [],
        newSkeleton = [];
    for(var i in this.sections) {
        newSections[i] = [];
        for(var j = 0; j<4; j++) {
            newSections[i][j] = this.sections[i][j].slice(0);
        }
    }
    for(var i in this.skeleton)
        newSkeleton[i] = this.skeleton[i].copy();
    
    var copy = new BezierShape(newSections);
    copy.name = this.name;
    copy.skeleton = newSkeleton;
    return copy;
}

/**
 * Draws the BezierShape NO SCALING OR NUFFIN. Probably only used internally
 * @param {Object} ctx
 */
BezierShape.prototype.draw = function(ctx) {
    var x = this.sections[0][0][0], //ew
        y = this.sections[0][0][1];
    ctx.beginPath();
    ctx.moveTo(x,y);
    for(var i = 0; i < this.sections.length; i++) {
        var b = this.sections[i];
        ctx.bezierCurveTo(b[1][0],b[1][1],b[2][0],b[2][1],b[3][0],b[3][1]);
    }
    ctx.closePath();
    
    ctx.fill();
    if(DEBUG.CORNER_OUTLINES) {
        ctx.globalCompositeOperation = "xor";
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
    }
}

function Bone(points,offset) {
    this.points = points;
    this.offset = offset;
}

Bone.prototype.copy = function() {
    var nP = [];
    for(var i in this.points)
        nP[i] = this.points[i].slice(0);
    return new Bone(nP,this.offset);
}

function drawCornerScaled(corner,pos,dir,width,height,ctx) { //FIXME degree, radian inconsistency
    ctx.save();
    ctx.translate(pos[0],pos[1]);
    ctx.rotate(dir);
    ctx.scale(height,width);
    
    corner.draw(ctx);
    ctx.restore();
}

function drawCorner(corner,pos,dir,width,ctx) {
    drawCornerScaled(corner,pos,dir,width,width,ctx);
}

function drawDICorner(corner,attrs,width,ctx) {
    if(corner == null)
        return;
    
    // corner rotation
    var pos = attrs.point,
        inAngle = attrs.inAngle-corner.skeleton["armA"].offset, //This is so the whole corner is rotated //FIXME a little gross
        outAngle = attrs.outAngle,
        c = setBoneAngles(corner,[["armB",(outAngle-inAngle)/180*Math.PI]]); 

    drawCorner(c,pos,inAngle/180*Math.PI,width,ctx);
}



// HERE ARE SOME CORNERS // some may need to be rotated
kappa = .5522847498;
// Circle-ish thing. Not a corner.
CIRCLE = new BezierShape([
    [[-5,0],[-5,-5*kappa],[-5*kappa,-5],[0,-5]],
    [[0,-5],[5*kappa,-5],[5,-5*kappa],[5,0]],
    [[5,0],[5,5*kappa],[5*kappa,5],[0,5]],
    [[0,5],[-5*kappa,5],[-5,5*kappa],[-5,0]]
]);
                
        
C1 = new BezierShape([
     [[15,6],  [-3,4],     [-11,5],   [-20,0]]
    ,[[-20,0],  [-15,-5],  [4,-9],    [13,-5]]
    ,[[13,-5], [20,0],     [21,8],    [15,6]]
]);
C1.name = "C1";

C2 = new BezierShape([
     [[2,5],    [-2,5],     [-12,2],    [-13,-2]]
    ,[[-13,2],  [-7,-5],    [0,-5],     [2,-5]]
    ,[[2,-5],   [3,-5],     [3,5],      [2,5]]
]);
C2.name = "C2";

C3 = new BezierShape([
    [[-8,5],    [-10,5],     [-10,-5],    [-8,-5]]
   ,[[-8,-5],   [3,-5],     [15,0],     [15,5]]
   ,[[15,5],    [10,7],     [2,5],      [-8,5]]
]);
C3.name = "C3";

C4 = new BezierShape([
    [[0,5],     [-2,5],     [-4,7],     [-5,8]]
   ,[[-5,8],    [-7,10],    [-9,12],    [-8,5]]
   ,[[-8,5],    [-7,3],     [-5,-5],    [0,-5]]
   ,[[0,-5],    [3,-5],     [3,5],      [0,5]]
]);
C4.name = "C4";

C5 = new BezierShape([
    [[0,-5],    [-3,-5],    [-3,5],     [0,5]]
   ,[[0,5],     [8,5],      [10,5],     [15,2]]
   ,[[15,2],    [12,-2],    [-2,-5],    [0,-5]]
]);
C5.name = "C5";

C6 = new BezierShape([
    [[0,5],     [-6,6],     [-8,7],     [-12,8]]
    ,[[-12,8],  [-13,9],    [-13,7],    [-12,6]]
    ,[[-12,6],  [-10,3],    [-5,-4],    [0,-5]]
    ,[[0,-5],   [3,-5],     [3,5],      [0,5]]
]);
C6.name = "C6";

C7 = new BezierShape([
    [[-5,-5],[0,-5],[11,-7],[15,-6]]
    ,[[15,-6],[17,-5],[2,4],[1,5]]
    ,[[1,5],[0,5],[0,5],[-5,5]]
    ,[[-5,5],[-8,5],[-8,-5],[-5,-5]]
]);
C7.name = "C7";

SI_CORNERS = [C1,C2,C3,C4,C5,C6,C7];

C8 = new BezierShape([
    [[-13,3],   [-20,3],    [-20,-3],   [-13,-3]],
    [[-13,-3],  [-5,-5],    [-6,-7],    [-4,-8]],
    [[-4,-8],   [0,-8],     [12,3],     [7,5]],
    [[7,5],     [5,6],      [5,8],      [3,13]],
    [[3,13],    [3,20],     [-3,20],    [-3,13]],
    [[-3,13],   [-5,5],     [-10,5],    [-13,3]]
]);
C8.name = "C8";
C8.skeleton["armA"] = new Bone([[0,0],[0,1],[0,2],[0,3],[1,0],[1,1],[5,2],[5,3]],0);
C8.skeleton["armB"] = new Bone([[4,0],[4,1],[4,2],[4,3],[3,2],[3,3],[5,0],[5,1],
                                [1,2],[1,3],[2,0],[2,1]],90);

C8R = horizFlipCopy(C8);

/*C9 = new BezierShape([ //TODO fix corner so that stem moves depending on angle
    [[-3,-10],  [-3,-15],   [3,-15],    [3,-10]],
    [[3,-10],   [5,-5],     [6,6],      [0,11]],
    [[0,11],    [-5,15],    [-3,5],     [-10,3]],
    [[-10,3],   [-15,3],    [-15,-3],   [-10,-3]],
    [[-10,-3],  [-5,-5],    [-5,-7],    [-3,-10]]
]);
C9.name = "C9";
C9.skeleton["armA"] = new Bone([[0,0],[0,1],[0,2],[0,3],[1,0],[1,1],[4,2],[4,3]],90);
C9.skeleton["armB"] = new Bone([[3,0],[3,1],[3,2],[3,3],[4,0],[4,1],[2,2],[2,3]],180);*/

C9 = new BezierShape([ //note, 90º angles look a little weird
   [[-4,-12],[-4,-15],[4,-15],[5,-12]],
   [[5,-12],[5,-2],[6,3],[1,8]],
   [[-1,8],[-3,11],[-4,2],[-12,-5]],
   [[-12,-5],[-15,-7],[-15,-9],[-10,-8]],
   [[-10,-8],[-6,-8],[-4,-7],[-4,-12]] 
]);
C9.name = "C9";
C9.skeleton["armA"] = new Bone([[0,0],[0,1],[0,2],[0,3],[1,0],[1,1],[4,2],[4,3],[1,2]],90); //not that this actually matters
C9.skeleton["armB"] = new Bone([[3,0],[3,1],[3,2],[3,3],[4,0],[4,1],[2,2],[2,3]],210);

C9R = vertFlipCopy(C9);

C10 = new BezierShape([
    [[-5,5],[-6,5],[-6,-5],[-5,-5]],
    [[-5,-5],[-2,-7],[2,-7],[5,-5]],
    [[5,-5],[6,-5],[6,5],[5,5]],
    [[5,5],[2,7],[-2,7],[-5,5]]
])
C10.name = "C10";
C10.skeleton["armA"] = new Bone([[0,0],[0,1],[0,2],[0,3],[1,0],[1,2],[3,2],[3,3]],0);
C10.skeleton["armB"] = new Bone([[2,0],[2,1],[2,2],[2,3],[3,0],[3,1],[1,2],[1,3]],0);

function linInterpolate(y0,y1,mu) {
    return y0*(1-mu) + y1*mu;
}

function cosInterpolate(y0,y1,mu) {
    var mu2 = (1-Math.cos(mu*Math.PI))/2;
    return y0*(1-mu2)+y1*mu2;
}

function linFunction(points) {
    return function(t) {
        if(t==0)
            return points[0][1];
        for(var i = 1; i<points.length; i++) {
            var p0 = points[i-1],
                p1 = points[i];
            if(t<=p1[0] && t>p0[0]) {
                var mu = (t-p0[0])/(p1[0]-p0[0]);
                return linInterpolate(p0[1],p1[1],mu); //cubic might be better
            }
        }
    };
}

/**
 * Returns a function that cosine interpolates between the values given
 */
function cosFunction(points) {
    return function(t) {
        if(t==0)
            return points[0][1];
        for(var i = 1; i<points.length; i++) {
            var p0 = points[i-1],
                p1 = points[i];
            if(t<=p1[0] && t>p0[0]) {
                var mu = (t-p0[0])/(p1[0]-p0[0]);
                return cosInterpolate(p0[1],p1[1],mu); //cubic might be better
            }
        }
    };
}

//example thickness functions
function one(t) {
    return 1;
}

function test(t) {
    return t;
}

//These are ugly
SEGMENT_I = cosFunction([[0,1],[.5,.7],[1,1]]); //FIXME, sometimes extends past corners
SEGMENT_II = linFunction([[0,1],[.5,.8],[1,.2]]); //kinda ugly :||
SEGMENT_III = linFunction([[0,.2],[.5,.8],[1,1]]);

HEN = [C2,SEGMENT_I,C3];
SHU1 = [C4,SEGMENT_I,C5];
SHU2 = [C4,SEGMENT_II];
NA = [C6,SEGMENT_I,C7];
DIAN = [C1];
OTHER = [C4,SEGMENT_II];

function RAND(t) {
    return Math.random();
}

function setBoneAngles(c,dirList) {
    var c = c.copy();
    
    for(var i in dirList) {
        var dir = dirList[i][1],
            bone = dirList[i][0];
        for(var j in c.skeleton[bone].points) {
            var p = c.skeleton[bone].points[j],
                offset = c.skeleton[bone].offset/180*Math.PI,
                vec = c.sections[p[0]][p[1]];
            //console.log(vec);
            console.log(dir-offset);
            //console.log(rotate(vec,dir-offset));
            c.sections[p[0]][p[1]] = rotate(vec,dir-offset);
            
        }
    }
    
    return c;
}

function vertFlipCopy(c) {
    var c = c.copy();
    
    for(var i in c.sections){
        for(var j in c.sections[i]) {
            c.sections[i][j][1] = -c.sections[i][j][1];
        }
    }
    for(var i in c.skeleton) {
        c.skeleton[i].offset = 360 - c.skeleton[i].offset;
    }
    return c
}

function horizFlipCopy(c) {
    var c = c.copy();
    
    for(var i in c.sections){
        for(var j in c.sections[i]) {
            c.sections[i][j][0] = -c.sections[i][j][0];
        }
    }
    for(var i in c.skeleton) {
        c.skeleton[i].offset = 180 - c.skeleton[i].offset;
        if(c.skeleton[i].offset<0)
            c.skeleton[i].offset += 360;
    }
    return c
}
