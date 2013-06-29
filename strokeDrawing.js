//Stroke drawing and analysis
//Basically, a "stroke" will be a collection of segments
//the segments when drawn will be assigned corners and types and stuff

function drawSegment(wF,segment,width,ctx) {
    if(DEBUG.TRANSPARENT_SEGMENTS) {
            ctx.fillStyle = "rgba(0,0,0,.5)";
    }
    drawBezier(segment,width,wF,ctx);
    ctx.fillStyle = "rgba(0,0,0,1)";
}



function drawBasicStroke(segment,width,ctx) { //TODO
    var attrs = getSegmentAttributes(segment),
        comps = checkRules2(attrs,RULE_BS);
    
    //corners
    if(comps.length == 1){ //dian
        var point = midpoint(attrs.startPoint,attrs.endPoint,0.5);  //FIXME these stupid width division factors
        drawCornerScaled(comps[0],point,degToRad(attrs.startAngle),width/13,attrs.length/20,ctx);
    } else {
        drawCorner(comps[0],attrs.startPoint,degToRad(attrs.startAngle),width/10,ctx);
        if(comps.length == 3) {
            drawCorner(comps[2],attrs.endPoint,degToRad(attrs.endAngle),width/10,ctx);
        }
        
        drawSegment(comps[1],segment,width,ctx);
    }
}

function Stroke(segments) {
    this.segments = segments;
}

Stroke.prototype.drawPlain = function(ctx) {
    var x = this.segments[0].getStart()[0],
        y = this.segments[0].getStart()[1];
    ctx.moveTo(x,y);
    for(var i = 0; i < this.segments.length; i++) {
        var b = this.segments[i].controlPoints;
        ctx.bezierCurveTo(b[1][0],b[1][1],b[2][0],b[2][1],b[3][0],b[3][1]);
    }
    ctx.stroke();      
};

Stroke.prototype.draw = function(width, ctx) {
    if(DEBUG.DRAW_PLAIN) {
        this.drawPlain(ctx);
        return;
    }
    if(this.segments.length == 1){ //Basic Stroke
        drawBasicStroke(this.segments[0],width,ctx);
    } else { //Compound stroke
        drawCompoundStroke(this,width,ctx);
    }
};

function drawCompoundStroke(stroke,width,ctx) { //FIXME copypasta
    var numSegments = stroke.segments.length;

    //corners
    var attrs = getSegmentAttributes(stroke.segments[0]),
        corners = [];
    
    var corner = checkRules2(attrs,RULE_CC_START);//checkRules(attrs,COMPOUND_CORNER_START);
    if(corner != null)
        drawCorner(corner,attrs.startPoint,attrs.startAngle/180*Math.PI,width/10,ctx);
    corners.push(corner);
    
    for(var i = 1; i<numSegments; i++) {
        attrs = getCornerAttributes(stroke.segments[i-1],stroke.segments[i]);
        corner = checkRules2(attrs,RULE_CC_MID);//checkRules(attrs,COMPOUND_CORNER_MID);
        if(corner != null)
            drawDICorner(corner,attrs,width/10,ctx);
        corners.push(corner);
    }
    attrs = getSegmentAttributes(stroke.segments[numSegments-1]);
    corner = checkRules2(attrs,RULE_CC_END);//checkRules(attrs,COMPOUND_CORNER_END);
    if(corner != null)
        drawCorner(corner,attrs.endPoint,attrs.endAngle/180*Math.PI,width/10,ctx);
    corners.push(corner);
    
    //SEGMENTS FIXME gross code
    
    if(corners[0] == null)
        drawSegment(SEGMENT_III,stroke.segments[0],width,ctx);
    else
        drawSegment(SEGMENT_I,stroke.segments[0],width,ctx);
    for(var i = 1; i<numSegments-1; i++) {
        drawSegment(SEGMENT_I,stroke.segments[i],width,ctx); //FIXME only segment I. this is not done!
    }
    if(corners[numSegments] == null)
        drawSegment(SEGMENT_II,stroke.segments[numSegments-1],width,ctx);
    else
        drawSegment(SEGMENT_I,stroke.segments[numSegments-1],width,ctx);
    ctx.fillStyle = "rgba(0,0,0,1)";
    
}

function inRange(num,range) {
    return num >= range[0] && num < range[1];
}

function inRanges(num,ranges) {
    for(var i = 0; i<ranges.length; i++) {
        if(inRange(num,ranges[i]))
            return true;
    }
    return false;
}

function getSegmentAttributes(seg) {
    var attrs = {
        "startAngle" : getSegAngleStart(seg) *180/Math.PI,
        "endAngle" : getSegAngleEnd(seg) * 180/Math.PI,
        "startPoint" : seg.getStart(),
        "endPoint" : seg.getEnd(),
        "length" : seg.getLength()
    };
    return attrs;
}

function getCornerAttributes(inSeg, outSeg) {
    var attrs = {
        "inAngle" : getSegAngleEnd(inSeg) * 180/Math.PI,
        "outAngle" : getSegAngleStart(outSeg) * 180/Math.PI,
        "point" : inSeg.getEnd()
    };
    attrs.betweenAngle = getInnerAngle(attrs.inAngle,attrs.outAngle);
    console.log(attrs.inAngle,attrs.outAngle);
    console.log(attrs.betweenAngle);
    return attrs;
}

function getInnerAngle(inAngle, outAngle) { //If outAngle is past inAngle, then it's negative
    inAngle = reduceAngleDeg(inAngle+180);
    var ang = Math.abs(getSmallerAngleDeg(inAngle - outAngle));
    if(inAngle>outAngle){
        if(inAngle-180<outAngle)
            return ang;
        return -ang;
    } else {
        if(outAngle-180<inAngle)
            return -ang;
        return ang;
    }
        
}

function innerAngleHelper(angle) { //if it's negative then it is the other angle
    if(angle>180)
        return angle-360;
    return angle;
}

function checkRule(obj,rule) {
    if(rule[0] == "Result")
        return rule[1];
    console.log(rule[0]);
    if(inRange(obj[rule[0]],rule[1]))
        return checkRule(obj,rule[2]);
    return null;
}

function checkRules(obj,ruleset) { //checks all rules, no shortcircuiting currently
    var results = [];
    console.log("Checking rules");
    for(var i = 0; i<ruleset.length-1; i++) {
        var result = checkRule(obj,ruleset[i]);
        if(result != null)
            results.push(result);
    }
    if(results.length > 1)
        throw "Overlapping conditions";
    if(results.length == 1)
        return results[0];
    console.log("no result");
    return ruleset[ruleset.length-1]; //default
}

function checkRules2(obj,ruleset) {
    var results = [];
    console.log("Checking rules");
    for(var i = 0; i<ruleset.length; i++) {
        if(ruleset[i].check(obj))
            return ruleset[i].result;
    }
    console.log("No Result");
    return null
}

function Rule(result,condition) {
    this.condition = condition;
    this.result = result;
}

Rule.prototype.check = function(attrs) {
    return checkCond(attrs,this.condition);
}

function checkCond(attrs,cond) {
    var op = OPERATIONS[cond[1]],
        val = attrs[cond[0]];
    console.log("Op:",cond[1]);
    console.log(cond[0],val);
    return op(attrs,val,cond.slice(2));
}


TH1 = 60;
TH2 = 40;

OPERATIONS = {
    "TRUE" : function(a,n,r) {
        return true;
    },
    "IN_RANGE" : function(a,n,r) {
        for(var i in r)
            if(n>=r[i][0] && n<r[i][1])
                return true;
            return false;
    },
    "GREATER_THAN" : function(a,n,r) {
        return n>=r;
    },
    "LESS_THAN" : function(a,n,r) {
        return n<r;
    },
    "OR" : function(a,n,c) {
        for(var i in c)
            if(checkCond(a,c[i]))
                return true; 
            return false;
    },
    "AND" : function(a,n,c) {
        for(var i in c) 
            if(!checkCond(a,c[i]))
                return false; 
            return true;
    }
};

RULE_CC_START = [
    new Rule(C2, ["startAngle", "IN_RANGE", [0,10], [350,360]]),
    new Rule(C4, ["startAngle", "IN_RANGE", [80,350]])
];

RULE_CC_END = [
    new Rule(C3, ["endAngle", "IN_RANGE", [0,10], [350,360]]),
    new Rule(C7, ["endAngle", "IN_RANGE", [10,80]]),
    new Rule(C5, ["engAngle", "IN_RANGE", [80,100]])
];

RULE_CC_MID = [
    new Rule(C8, ["", "AND", ["inAngle", "IN_RANGE",[0,45],[315,360]],
                             ["betweenAngle", "IN_RANGE",[0,180]]]),
    new Rule(C8R,["", "AND", ["inAngle", "IN_RANGE", [60,170]], //a little ugly :| but accurate?
                            ["betweenAngle", "IN_RANGE",[-180,0]]]), 
    new Rule(C9, ["", "AND", ["inAngle", "IN_RANGE", [45,145]],
                             ["betweenAngle","IN_RANGE", [0,180]]]),
    new Rule(C9R,["", "AND", ["inAngle", "IN_RANGE", [0,60], [240,360]],
                            ["betweenAngle","IN_RANGE",[-180,0]]])
];

RULE_BS = [ //TODO, fix the "default" case
    new Rule(DIAN,["length","LESS_THAN",TH2]),
    new Rule(HEN,["startAngle","IN_RANGE",[0,10],[350,360]]),
    new Rule(SHU1,["", "AND", ["startAngle","IN_RANGE",[80,100]],
                              ["length","GREATER_THAN",TH1]]),
    new Rule(SHU2,["", "AND", ["startAngle","IN_RANGE",[80,100]],
                              ["length","IN_RANGE",[TH2,TH1]]]), //to prevent overlap
    new Rule(NA,["startAngle","IN_RANGE",[10,80]]),
    new Rule(OTHER,["","TRUE"])
];

// Rules
BASIC_STROKE = [
    ["startAngle", [0,10]]
];

COMPOUND_CORNER_START = [
    ["startAngle",   [0,10],    ["Result",C2]],
    ["startAngle",   [80,350],  ["Result",C4]],
    ["startAngle",   [350,360], ["Result",C2]],
    null
    ];

COMPOUND_CORNER_MID = [
    ["inAngle",     [0,45], ["betweenAngle", [0,180], ["Result", C8]]],
    ["inAngle",     [315,360], ["betweenAngle", [0,180], ["Result", C8]]],
    ["inAngle",     [45,135], ["betweenAngle", [-180,-90], ["Result", C8R]]],
    ["inAngle",     [45,135], ["betweenAngle", [0,180], ["Result", C9]]],
    ["inAngle",     [45,180], ["betweenAngle", [-90,0], ["Result", C9R]]],
    ["inAngle",     [0,45], ["betweenAngle", [-180,0], ["Result", C9R]]],
    ["inAngle",     [315,360], ["betweenAngle", [-180,0], ["Result", C9R]]],
    null
];

COMPOUND_CORNER_END = [
    ["endAngle",   [0,10],    ["Result",C3]],
    ["endAngle",   [10,80],   ["Result",C7]],
    ["endAngle",   [80,100],  ["Result",C5]],
    null
    ];
   
