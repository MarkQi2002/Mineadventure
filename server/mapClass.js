class map{
    constructor(quarterSize2D,blockSize2D) {

        this.PerlinNoise = new function() {

            this.initX = Math.floor(Math.random() * 255);
            this.initY = Math.floor(Math.random() * 255);

            this.noise = function(x, y, z) {
            
            var p = new Array(512);
    
            
            var permutation = [ 151,160,137,91,90,15,
            131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
            190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
            88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
            77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
            102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
            135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
            5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
            223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
            129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
            251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
            49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
            138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
            ];
    
            for (var i=0; i < 256 ; i++)
                    p[256+i] = p[i] = permutation[i]; 
            
                
            
                var X = Math.floor(x) & 255,                  // FIND UNIT CUBE THAT
                    Y = Math.floor(y) & 255,                  // CONTAINS POINT.
                    Z = Math.floor(z) & 255;
                x -= Math.floor(x);                                // FIND RELATIVE X,Y,Z
                y -= Math.floor(y);                                // OF POINT IN CUBE.
                z -= Math.floor(z);
                var u = fade(x),                                // COMPUTE FADE CURVES
                    v = fade(y),                                // FOR EACH OF X,Y,Z.
                    w = fade(z);
                var A = p[X  ]+Y, AA = p[A]+Z, AB = p[A+1]+Z,      // HASH COORDINATES OF
                    B = p[X+1]+Y, BA = p[B]+Z, BB = p[B+1]+Z;      // THE 8 CUBE CORNERS,
            
                return scale(lerp(w, lerp(v, lerp(u, grad(p[AA  ], x  , y  , z   ),  // AND ADD
                                                grad(p[BA  ], x-1, y  , z   )), // BLENDED
                                        lerp(u, grad(p[AB  ], x  , y-1, z   ),  // RESULTS
                                                grad(p[BB  ], x-1, y-1, z   ))),// FROM  8
                                lerp(v, lerp(u, grad(p[AA+1], x  , y  , z-1 ),  // CORNERS
                                                grad(p[BA+1], x-1, y  , z-1 )), // OF CUBE
                                        lerp(u, grad(p[AB+1], x  , y-1, z-1 ),
                                                grad(p[BB+1], x-1, y-1, z-1 )))));
            }
            function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
            function lerp( t, a, b) { return a + t * (b - a); }
            function grad(hash, x, y, z) {
                var h = hash & 15;                      // CONVERT LO 4 BITS OF HASH CODE
                var u = h<8 ? x : y,                 // INTO 12 GRADIENT DIRECTIONS.
                        v = h<4 ? y : h==12||h==14 ? x : z;
                return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);
            } 
            function scale(n) { return (1 + n)/2; }
        }


        this.blockSize2D = {
            x: blockSize2D[0],
            y: blockSize2D[1],
        };

        this.spaceArray = {
            pp: new quarterMap([1,1], quarterSize2D, blockSize2D, this.PerlinNoise),
            pn: new quarterMap([1,-1], quarterSize2D, blockSize2D, this.PerlinNoise),
            np: new quarterMap([-1,1], quarterSize2D, blockSize2D, this.PerlinNoise),
            nn: new quarterMap([-1,-1], quarterSize2D, blockSize2D, this.PerlinNoise),
        };
    }



    getQuarterMap(x,y){
        var selectArray;
        if (x > 0){
            if (y > 0){
                selectArray = this.spaceArray.pp;
            }else{
                selectArray = this.spaceArray.pn;
            }
        }else{
            if (y > 0){
                selectArray = this.spaceArray.np;
            }else{
                selectArray = this.spaceArray.nn;
            }
        }
        return selectArray;
    }



    getUnit(unitX,unitY){
        return getBlock(Math.floor(unitX / blockSize2D.x), Math.floor(unitY / blockSize2D.y)).unitList[Math.abs(unitY) % blockSize2D.y][Math.abs(unitX) % blockSize2D.x];
    }

    getBlock(x,y){
        return this.getQuarterMap(x,y)[Math.abs(x)][Math.abs(y)];
    }

    
    addBlock(x,y){
        let theQuarterMap =  getQuarterMap(x,y);


        theQuarterMap.blockList[y][x] = new block(x,y,this.PerlinNoise);

        
    }
        
    
      




}



class quarterMap{
    constructor(diriction, quarterSize2D, blockSize2D, PerlinNoise) {
        this.blockList = [];
        this.diriction = { //1 or -1
            x: diriction[0],
            y: diriction[1]
        }
        this.makeQuarterMap(quarterSize2D[0], quarterSize2D[1]);
        this.initQuarterMap(blockSize2D, PerlinNoise);
    }

    makeQuarterMap(x, y) {
        for(let i = 0; i < y; i++) {
            this.blockList.push(new Array(x));
        }
    }

    setQuarterSize(x, y){
        this.blockList.length = y;
        for(let i = 0; i < y; i++) {
            this.blockList[i].length = x;
        }
    }

    initQuarterMap(blockSize2D, PerlinNoise){
        for (let y_Axis = 0; y_Axis < this.blockList.length; y_Axis++) {
            for (let x_Axis = 0; x_Axis < this.blockList[y_Axis].length; x_Axis++) {
                this.blockList[y_Axis][x_Axis] = new block(x_Axis, y_Axis, this.diriction, blockSize2D, PerlinNoise);
            }
        }
    }

}




class block{
    constructor(x, y, direction, blockSize2D, PerlinNoise) {
        this.unitList = [];
        this.makeBlock(blockSize2D[0], blockSize2D[1]);
        this.initBlock(x, y, direction, PerlinNoise);
    }

    makeBlock(x, y) {
        for(let i = 0; i < y; i++) {
            this.unitList.push(new Array(x));
        }
    }

    setBlockSize(x, y){
        this.unitList.length = y;
        for(let i = 0; i < y; i++) {
            this.unitList[i].length = x;
        }
    }

    initBlock(x, y, direction, PerlinNoise){
        
        for (let y_Axis = 0; y_Axis < this.unitList.length; y_Axis++) {
            for (let x_Axis = 0; x_Axis < this.unitList[y_Axis].length; x_Axis++) {

                var colorHeight = 2-PerlinNoise.noise((PerlinNoise.initX + (x * this.unitList[0].length + x_Axis) * direction.x) / 10 , (PerlinNoise.initY + (y * this.unitList.length + y_Axis) * direction.y) / 10, 0.1)*4;
                if(colorHeight < 0){
                    colorHeight = 0;
                }
                //var height = colorHeight*3;
                this.unitList[y_Axis][x_Axis] = {
                    colorHeight: colorHeight,
                    color3D: [Math.random(), Math.random(), Math.random()]
                };

            }
        }
    }

}



module.exports = map;