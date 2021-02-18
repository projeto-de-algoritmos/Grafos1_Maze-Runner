const SCREEN_SIZE = 1000;

canvas = document.getElementsByTagName("canvas")[0];
context = canvas.getContext("2d");

canvas.width = SCREEN_SIZE;
canvas.height = SCREEN_SIZE;

let Node = function(type){
	this.type = type;
	this.x = null;
	this.y = null;
};

let Maze = function(){
    this.graph = [];
    this.start = null;
    this.end = null;
};

Node.prototype.getType = function() {
    switch(this.type){
        case "wall":
            return "#010a5e";
        case "path":
            return "#fff";
        case "start":
            return "#3ad900";
        case "end":
            return "red";
        case "walk":
            return "yellow";
        default:
            return "#f400fc"
	}
};

Maze.prototype.initGraph = function(size){
	for (let i = 0; i < size; i++){
		this.graph.push([])
		for (let j = 0; j < size; j++){
			if (i == 0 || j==0 || i == (size-1) || j == (size-1)){
				let node = new Node("wall");
                node.x = j;
                node.y = i;
				this.graph[i].push(node);
			}
			else{
				let node = new Node("path");
				node.x = j;
                node.y = i;
				this.graph[i].push(node);
			}
		}
	}
};

Maze.prototype.createMaze = function([x1, x2], [y1, y2], size){
	let width = x2 - x1;
	let height = y2 - y1;
    let op1, op2, vertical, bisection, min, max, cond;

    // vertical
	if (width >= height){
        bisection = Math.ceil((x1+x2)/2);
        max = y2-1;
        min = y1+1;      
        op1 = y1;
        op2 = y2;
        vertical = true;
        cond = x2-x1>3

    // horizontal
    } else {
        bisection = Math.ceil((y1+y2)/2);
        max = x2-1;
        min = x1+1;     
        op1 = x1;
        op2 = x2;
        vertical = false;
        cond = y2-y1>3
    }

    if(cond){
        let randomPassage = Math.floor(Math.random() * (max - min + 1)) + min;
        let first = false;
        let second = false;
        
        if(vertical){
            if (this.graph[y2][bisection].type == "path"){
				randomPassage = max;
				first = true;
			}
			if (this.graph[y1][bisection].type == "path"){
				randomPassage = min;
				second = true;
			}
        } else{
            if (this.graph[bisection][x2].type == "path"){
				randomPassage = max;
				first = true;
			}
			if (this.graph[bisection][x1].type == "path"){
				randomPassage = min;
				second = true;
			}
        }
        for (let i = op1+1; i < op2; i++){
            if (first && second){
                if (i == max || i == min){
                    continue;
                }
            }
            else if (i == randomPassage){
                continue;
            }

            if(vertical)
                this.graph[i][bisection].type = "wall";
            else
                this.graph[bisection][i].type = "wall";
        }

        if(vertical){
            this.createMaze([x1, bisection],[y1, y2], size);
            this.createMaze([bisection, x2],[y1, y2], size);
        } else{
            this.createMaze([x1, x2],[y1, bisection], size);
			this.createMaze([x1, x2],[bisection, y2], size);
        }
    }
};

Maze.prototype.getPath = function(){
	let path = [];
	for (let y=0; y<this.graph.length; y++){
		for (let x=0; x<this.graph[0].length; x++){
			if (this.graph[y][x].type == "path"){
				path.push(this.graph[y][x]);
			}
		}
	}
	return path;
};

Maze.prototype.initObjective = function(){
	let path = this.getPath();
	if (path.length > 1){
		this.start = path[0];
		this.end = path[path.length-1];
		this.start.type = "start";
		this.end.type = "end";
	}
};

Maze.prototype.paint = function(){
	context.clearRect(0, 0, SCREEN_SIZE, SCREEN_SIZE);
	let numys = this.graph.length;
	let numxs = this.graph[0].length;
	let nodeWidth = SCREEN_SIZE/numxs;
	let nodeHeight = SCREEN_SIZE/numys;
	let nodeLength = nodeWidth > nodeHeight ? nodeHeight : nodeWidth;
	for (let y=0; y<numys; y++){
		for (let x=0; x<numxs; x++){
			let node = this.graph[y][x];
			context.fillStyle = node.getType()
			let rectX = x * nodeLength;
			let rectY = y * nodeLength;
			context.fillRect(rectX, rectY, nodeLength, nodeLength);
		}
	}
};

function initMaze(){
	maze = new Maze();
	mazeSize = document.getElementById("size").value;
	maze.initGraph(mazeSize);
	maze.createMaze([0, mazeSize-1], [0, mazeSize-1], mazeSize);
	maze.initObjective();
	maze.paint();
}

initMaze();

document.getElementById("create").addEventListener("click", initMaze);