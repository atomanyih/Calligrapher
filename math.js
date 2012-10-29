/*
 * A bunch of stuff
 */

function vectorSum(v1,c,v2) {
    result = [];
    for(var i = 0; i < v1.length; i++)
        result[i] = v1[i]+c*v2[i];
    return result;
}

/**
 * Prints a matrix in row,column format
 */
function matrixPrint(matrix) {
    for(var i = 0; i<matrix.length; i++) {
        console.log(matrix[i]);
    }
}

function zeroes(r,c) {
    var m = [];
    for(var i = 0; i<r; i++) {
        m[i]=[];
        for(var j = 0; j<c; j++)
            m[i][j]=0;
    }
    return m;
}

//Basic matrix operations
function transpose(m) {
    var result = zeroes(m[0].length,m.length);
    for(var r = 0; r<result.length; r++) {
        for(var c = 0; c<result[0].length; c++) {
            result[r][c]=m[c][r];
        }
    }
    return result;
}

function matrixMult(m1,m2) {
    if(m1[0].length != m2.length)
        throw "Matrix dimension mismatch. Cannot multiply";
    
    var result = zeroes(m1.length,m2[0].length);
    
    for(var r = 0; r<result.length; r++) {
        for(var c = 0; c<result[0].length; c++) {
            result[r][c]=mMultHelper(m1,m2,r,c);
        }
    }
    return result;
}

function mMultHelper(m1,m2,r,c) { //does dot producting BS
    var result = 0;
    for(var i = 0; i<m1.length; i++)
        result += m1[r][i]*m2[i][c];
    return result;
}

//probably will never be used
function rowProduct(m,r) {
    var result = 1;
    for(var i = 0; i<m[0].length; i++)
        result *= m[r][i]
    return result;
}

function colProduct(m,c) {
    var result = 1;
    for(var i = 0; i<m.length; i++)
        result *= m[i][c]
    return result;
}

/** indexed row,column 
 *  DOES NOT DO ANY LEGITIMACY CHECKS OR ANYTHING
 * @param {Object} matrix
 */
function gaussianElimination1(matrix) {
    matrix = matrix.slice(0); //shallow copy (it's cool cause it's ints)
    
    for(var i = 0; i<matrix.length; i++) {//each row get the first coeffecient
        var temp = gElHelper1(matrix[i]),
            p = temp[0],
            a = temp[1];
            
        for(var j = 0; j<matrix.length; j++) { //remove from other rows
            var b = matrix[j][p];
            
            if(b != 0 && i != j)
                matrix[j] = vectorSum(matrix[j],-b/a,matrix[i]);
        }
    }

    //This part assumes that you end up with something in almost row echelon form (coeffecients may not be 1)    
    var result = [],
        numVars = matrix[0].length-1;
    for(var i = 0; i<numVars; i++) { //grabbing the results
        result[i] = matrix[i][numVars]/matrix[i][i];
    }
    return result;
    
    
}
//Helper function returns the first position of a nonzero coeffecient and the coefficient itself
function gElHelper1(vector) {
    for(var i = 0; i<vector.length; i++)
        if(vector[i] != 0)
            return [i,vector[i]];
}

function gaussianElimination(matrix) {
    matrix = matrix.slice(0);
    var numRows = matrix.length,
        numCols = matrix[0].length,
        sol = [];
        
    //matrixPrint(matrix);
    
    for(var c = 0; c<numRows; c++) {
        var iMax = gElHelper(matrix,c);
        
        if(matrix[iMax][c] == 0)
            throw "Matrix is singular"
        swapRows(matrix,c,iMax);
        
        for(var d = c+1; d<numRows; d++) {
            var mult = matrix[d][c]/matrix[c][c];
            
            matrix[d] = vectorSum(matrix[d],-mult,matrix[c]);
        }
    }
    
    for(var r = 0; r<numRows; r++) {
        var i = numRows-r-1;
        
        for(var s = r+1; s<numRows; s++) {
            var mult = -matrix[s][i]/matrix[r][i]
            matrix[s] = vectorSum(matrix[s],mult,matrix[r]);
        }
        sol.push(matrix[r][numCols-1]/matrix[r][i]);
    }
    
    return sol.reverse();
}
//Helper function finds the pos of the max in the column
function gElHelper(matrix,c) {
    var iMax = 0;
    for(var i = c; i<matrix.length; i++) {
        if(Math.abs(matrix[i][c])>Math.abs(matrix[iMax][c]))
            iMax = i;
    }
    return iMax
}

function swapRows(matrix,r0,r1) {
    var i = matrix[r0];
    matrix[r0]=matrix[r1];
    matrix[r1]=i;
    return matrix;
}
