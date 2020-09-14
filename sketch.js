// dimensions of our board
var numRows = 35;
var numCols = 35;

// myGrid will represent a 2-D array
var myGrid = new Array(numCols);

// openSet = nodes to be looked at
var openSet = [];
// closedSet = already seen
var closedSet = [];

// start - top left of board
// end - bottom right of board
var start, end;

// scaling for our cell size
var width, height;
var path;

var noSolution = false;


function Spot(i, j) {
    // keeping track of where we are on board
    this.i = i;
    this.j = j;

    this.f = 0;
    this.g = 0;
    this.h = 0;

    // each spot will keep track of neighbors
    this.neighbors = [];
    this.parent = null;

    // adding an attribute to act as a flag for a wall
    if (random(1) < 0.25) {
        this.wall = true;
    } else {
        this.wall = false;
    }

    this.addNeighbors = function (myGrid) {
        // checking boundary conditions
        if (this.i < numCols - 1) {
            this.neighbors.push(myGrid[this.i + 1][this.j]);
        }
        if (this.i > 0) {
            this.neighbors.push(myGrid[this.i - 1][this.j]);
        }
        if (this.j < numRows - 1) {
            this.neighbors.push(myGrid[this.i][this.j + 1]);
        }
        if (this.j > 0) {
            this.neighbors.push(myGrid[this.i][this.j - 1]);
        }

        // // adding diagnols
        // if (this.i > 0 && this.j > 0) {
        //     this.neighbors.push(myGrid[this.i - 1][this.j - 1]);
        // }
        // if (this.i < numCols - 1 && this.j > 0) {
        //     this.neighbors.push(myGrid[this.i + 1][this.j - 1]);
        // }
        // if (this.i > 0 && this.j < numRows - 1) {
        //     this.neighbors.push(myGrid[this.i - 1][this.j + 1]);
        // }
        // if (this.i < numCols - 1 && this.j < numRows - 1) {
        //     this.neighbors.push(myGrid[this.i + 1][this.j + 1]);
        // }
    }

    this.show = function (color) {
        fill(color);
        if (this.wall) {
            fill(0);
        }
        // represent each grid cell as a rectangle
        rect(this.i * width, this.j * height, width, height);
        stroke(0);
        strokeWeight(1);
    }
}

function setup() {
    createCanvas(1000, 600);
    console.log('A* Algorithm');

    width = width / numCols;
    height = height / numRows;

    // making a 2-D array
    for (var i = 0; i < numCols; i++) {
        myGrid[i] = new Array(numRows);
    }

    // adding our spot object for each grid cell
    for (var i = 0; i < numCols; i++) {
        for (var j = 0; j < numRows; j++) {
            myGrid[i][j] = new Spot(i, j);
        }
    }

    // add neighbors for each spot
    for (var i = 0; i < numCols; i++) {
        for (var j = 0; j < numRows; j++) {
            myGrid[i][j].addNeighbors(myGrid);
        }
    }

    start = myGrid[0][0];
    end = myGrid[numCols - 1][numRows - 1];
    // make sure start and end are't barriers
    start.wall = end.wall = false;

    // add our first node
    openSet.push(start);
    console.log(myGrid);
}

// p5 animation loop - serves as our while loop
function draw() {
    if (openSet.length > 0) {
        // keep going

        var lowestIndex = 0;
        for (var i = 0; i < openSet.length; i++) {
            // we want to find the lowest f score
            if (openSet[i].f < openSet[lowestIndex].f) {
                lowestIndex = i;
            }
        }

        var curr = openSet[lowestIndex];

        if (curr === end) {
            // reached our goal
            noLoop();
            console.log(path);
            console.log("Traversal Complete");
        }

        closedSet.push(curr);
        removeFromArray(openSet, curr);

        var neighbors = curr.neighbors;
        for (var i = 0; i < neighbors.length; i++) {
            var neighbor = neighbors[i];

            if (!closedSet.includes(neighbor) &&
                !neighbor.wall) {
                var tempG = curr.g + 1;

                var newPath = false;
                if (openSet.includes(neighbor)) {
                    // already been viewed
                    if (tempG < neighbors.g) {
                        // we have a faster path
                        neighbor.g = tempG;
                        newPath = true;
                    }
                } else {
                    neighbor.g = tempG;
                    // add new node to set
                    openSet.push(neighbor);
                    newPath = true;
                }

                if (newPath) {
                    neighbor.h = heuristic(neighbor, end);
                    // how long we took to get there +
                    // how long we think it is until the end
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.parent = curr;
                }
            }
        }

    } else {
        // no solution
        console.log('No solution');
        noSolution = true;
        noLoop();
        alert("The target is unreachable.");
        return;
    }

    background(255);

    // color each grid cell white unless our cell
    // is the start, the finish, or a wall
    for (var i = 0; i < numCols; i++) {
        for (var j = 0; j < numRows; j++) {
            if (myGrid[i][j] === start || myGrid[i][j] === end) {
                start.show(color(0, 255, 255));
                end.show(color(0, 255, 0));
            } else {
                myGrid[i][j].show(color(255));
            }
        }
    }

    // trace back path
    var temp = curr;
    path = [];
    path.push(curr);
    if (!noSolution) {
        while (temp.parent != null) {
            path.push(temp.parent);
            temp = temp.parent;
        }
    }

    // trace path as we go with a line
    noFill();
    stroke(130, 91, 220);
    strokeWeight(4);
    beginShape();
    for (var i = 0; i < path.length; i++) {
        vertex(path[i].i * width + (width / 2), path[i].j * height + (height / 2));
    }
    endShape();

}

// remove an element from an array
function removeFromArray(arr, element) {
    for (var i = arr.length - 1; i >= 0; i--) {
        if (arr[i] === element) {
            arr.splice(i, 1);
        }
    }
}

// the heuristic function helps us determine
// which direction we should move in
function heuristic(spot1, spot2) {
    // JS function to calculate the distance
    // between two points
    return abs(spot1.i - spot2.i) + abs(spot1.j - spot2.j);
}
