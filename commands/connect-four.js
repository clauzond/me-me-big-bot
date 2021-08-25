// Game parameters
let FPS = 30;
let HEIGHT = 700;
let WIDTH = 640;
let GRID_SIZE = 7; // number of rows and columns

let SIDE_MARGIN = 0;
let CELL = ((WIDTH - 2 * SIDE_MARGIN) / GRID_SIZE); // size of cell ; 1 side margin on left and right
let TOP_MARGIN = HEIGHT - (GRID_SIZE * CELL) - SIDE_MARGIN;
let STROKE = CELL / 10; // stroke width (stroke=contour)
let TILE_STROKE = CELL / 15;
let DOT = STROKE; // dot radius

let PLAYERTURN_X = WIDTH / 2;
let PLAYERTURN_Y = TOP_MARGIN / 2;

let PADDING = 20; // padding in style.css - #myCanvas

function initGrid() {
    FPS = 30;
    HEIGHT = 700;
    WIDTH = 640;
    GRID_SIZE = GET_GRID_SIZE();
    SIDE_MARGIN = 20;
    CELL = ((WIDTH - 2 * SIDE_MARGIN) / GRID_SIZE);
    TOP_MARGIN = HEIGHT - (GRID_SIZE * CELL) - SIDE_MARGIN;
    STROKE = CELL / 10;
    TILE_STROKE = CELL / 15;
    DOT = STROKE;
    PLAYERTURN_X = WIDTH / 2;
    PLAYERTURN_Y = TOP_MARGIN / 2;
}

// Colors
const COLOR_BOARD = "#8AAAE5";
const COLOR_BORDER = "#0063B2FF";
const COLOR_TILE = "#2C73F7";
const COLOR_OUTER_TILE = COLOR_BORDER;
const COLOR_YELLOW = "#FCE77D";
const COLOR_RED = "#F7545C";
const COLOR_TIE = "#EEEEFF";
const COLOR_LINE = COLOR_BORDER;


// Game Canvas
var canv = document.getElementById("myCanvas");
canv.height = HEIGHT;
canv.width = WIDTH;

const GET_GRID_SIZE = () => { return 7; };


function getGridRowCol(x, y) {
	// Outside the board
	if (x < SIDE_MARGIN || x >= SIDE_MARGIN + (GRID_SIZE * CELL)) {
		return (null);
	} else if (y < TOP_MARGIN || y >= (TOP_MARGIN + (GRID_SIZE * CELL))) {
		return (null);
	}

	// Inside the board
	const col = Math.floor((x - SIDE_MARGIN) / CELL);
	const row = getPossibleRow(col);
	if (row < 0) {
		return (null);
	}
	return [row, col];
}

function getPossibleRow(col) {
	return ((GRID_SIZE - 1) - DISK_PER_COLUMN[col]);
}

function drawBoard() {
	ctx.fillStyle = COLOR_BOARD;
	ctx.strokeStyle = COLOR_BORDER;
	ctx.lineWidth = STROKE;
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	ctx.strokeRect(STROKE / 2, STROKE / 2, WIDTH - STROKE, HEIGHT - STROKE);
}

function drawGrid() {
	for (let i = 0; i < GRID_SIZE; i++) { // row
		for (let j = 0; j < GRID_SIZE; j++) { // column
			drawTile(getGridX(j), getGridY(i));
		}
	}
}
function drawTile(x, y) {
	drawDisk(x + CELL / 2, y + CELL / 2, COLOR_BOARD);
	drawCircle(x + CELL / 2, y + CELL / 2, COLOR_OUTER_TILE);
}

function drawDisks() {
	for (const row of DISK_LIST) {
		for (const disk of row) {
			disk.draw();
			disk.highlight();
		}
	}
}

function drawWinningLine(first_disk, last_disk) {
	const x1 = first_disk.x + CELL / 2, y1 = first_disk.y + CELL / 2;
	const x2 = last_disk.x + CELL / 2, y2 = last_disk.y + CELL / 2;
	ctx.strokeStyle = COLOR_LINE;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

function drawDisk(x, y, color, alpha = 1) {
	ctx.fillStyle = color;
	ctx.globalAlpha = alpha;
	ctx.beginPath();
	ctx.arc(x, y, (CELL / 2) * 0.8 + 1, 0, Math.PI * 2);
	ctx.fill();
	ctx.globalAlpha = 1;
}

function drawCircle(x, y, color, alpha = 1) {
	ctx.strokeStyle = color;
	ctx.globalAlpha = alpha;
	ctx.lineWidth = STROKE / 2;
	ctx.beginPath();
	ctx.arc(x, y, (CELL / 2) * 0.8 + STROKE / 2 - 1, 0, Math.PI * 2);
	ctx.stroke();
	ctx.globalAlpha = 1;
	ctx.lineWidth = STROKE;
}

function drawText() {
	ctx.font = "48px Garamond";
	ctx.fillStyle = getColor(PLAYER_TURN);
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	const turn = (PLAYER_TURN == "yellow" ? "Yellow plays" : "Red plays");
	ctx.fillText(turn, PLAYERTURN_X, PLAYERTURN_Y, WIDTH);
}

function drawWinText(player, winCondition) {
	let screenText, infoText, winSentence;

	const x = PLAYER_TURN[0].toUpperCase() + PLAYER_TURN.substring(1);
	infoText = "Game ended. ";
	infoText += (winCondition == "boardFull" ? "The board is full. " : "");

	if (player == "tie") {
		screenText = "IT'S A TIE !";
		infoText += "It's a tie.";
	} else {
		screenText = (player == "yellow" ? "YELLOW WON !" : "RED WON !");
		infoText += (player == "yellow" ? "Yellow won." : "Red won.");
	}
	overwriteGameInfo(infoText);

	drawBoard();
	drawGrid();
	drawDisks();
	PLAYER_TURN = "";
	ctx.font = "48px Garamond";
	ctx.fillStyle = getColor(player);
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(screenText, PLAYERTURN_X, PLAYERTURN_Y, WIDTH);

	let first_disk, last_disk;
	for (const two_disk of WINNING_DISK_LIST) {
		[first_disk, last_disk] = two_disk;
		drawWinningLine(first_disk, last_disk);
	}
}

function getColor(state) {
	switch (state) {
		case "yellow":
			return (COLOR_YELLOW);
			break;
		case "red":
			return (COLOR_RED);
			break;
		case "tie":
			return (COLOR_TIE);
		default:
			return (false);
			break;
	}
}

// Tile object constructor
function Disk(row, col) {
	this.row = row;
	this.col = col;
	this.x = getGridX(col);
	this.y = getGridY(row);

	this.state = null;
	this.highlight_state = false;


	this.draw = () => {
		if (getColor(this.state) && PLAYER_TURN) {
			drawDisk(this.x + CELL / 2, this.y + CELL / 2, getColor(this.state));
		}
	};

	this.highlight = () => {
		const alpha = GET_ALPHA();
		if (this.highlight_state && PLAYER_TURN) {
			const possibleRow = getPossibleRow(this.col);
			if (this.row == possibleRow && HIGHLIGHT_HOVER()) {
				drawDisk(this.x + CELL / 2, this.y + CELL / 2, getColor(PLAYER_TURN), alpha);
			} else if (this.row <= possibleRow) {
				drawDisk(this.x + CELL / 2, this.y + CELL / 2, COLOR_OUTER_TILE, alpha);
			}
		}
	};

}

// Game rules
function playTurn(row, col, event) {
	if (PLAYER_TURN == "yellow") {
		NUMBER_OF_YELLOW += 1;
	} else {
		NUMBER_OF_RED += 1;
	}

	DISK_LIST[row][col].state = PLAYER_TURN;
	DISK_PER_COLUMN[col] += 1;

	const player = (PLAYER_TURN == "yellow" ? "Yellow" : "Red");
	const sentence = player + " has played in column " + (col + 1);

	clearHighlight();
	overwriteGameInfo(sentence);
	checkForWin(row, col);
	nextTurn();
	highlightGrid(event);
}

function checkInDirection(row, col, offset_row, offset_col) {
	const playerChecked = PLAYER_TURN;
	let first_disk, last_disk;
	let count = 1; // [row][col] is occupied by player

	// Count backwards
	let r = row - offset_row;
	let c = col - offset_col;
	while ((r >= 0 && r < GRID_SIZE) && (c >= 0 && c < GRID_SIZE)) {
		if (DISK_LIST[r][c].state == playerChecked) {
			count++;
			first_disk = DISK_LIST[r][c];
		} else {
			break;
		}

		r -= offset_row;
		c -= offset_col;
	}

	if (!first_disk) {
		first_disk = DISK_LIST[row][col];
	}

	// Count forwards
	r = row + offset_row;
	c = col + offset_col;
	while ((r >= 0 && r < GRID_SIZE) && (c >= 0 && c < GRID_SIZE)) {
		if (DISK_LIST[r][c].state == playerChecked) {
			count++;
			last_disk = DISK_LIST[r][c];
		} else {
			break;
		}

		r += offset_row;
		c += offset_col;
	}

	if (!last_disk) {
		last_disk = DISK_LIST[row][col];
	}

	if (count >= 4) {
		WINNING_DISK_LIST.push([first_disk, last_disk]);
	}
	return (count >= 4);
}

function checkForConnectFour(row, col) {
	const playerChecked = PLAYER_TURN;
	let bool = false;

	// Trigonometry-like rotation to check, but checking in straight line (both directions)
	bool = checkInDirection(row, col, 1, 0) || bool;
	bool = checkInDirection(row, col, 1, 1) || bool;
	bool = checkInDirection(row, col, 0, 1) || bool;
	bool = checkInDirection(row, col, -1, 1) || bool;
	return (bool ? playerChecked : "");
}

function checkForWin(row, col) {
	let boardFull = false;
	const winner = checkForConnectFour(row, col);
	if (NUMBER_OF_YELLOW + NUMBER_OF_RED == GRID_SIZE ** 2) {
		boardFull = true;
	}

	if (winner) {
		drawWinText(player = winner, winCondition = "");
		stopGame();
	} else if (boardFull) {
		drawWinText(player = "tie", winCondition = "boardFull");
		stopGame();
	} else {
		return;
	}
}

function newGame() {
	initGrid();
	STARTING_PLAYER = ((!STARTING_PLAYER || STARTING_PLAYER == "red") ? "yellow" : "red");
	PLAYER_TURN = STARTING_PLAYER;
	WINNING_DISK_LIST = [];
	DISK_LIST = [];
	MOVE_LIST = [];
	DISK_PER_COLUMN = Array(GRID_SIZE).fill(0);
	for (let i = 0; i < GRID_SIZE; i++) { // row
		DISK_LIST[i] = [];
		for (let j = 0; j < GRID_SIZE; j++) { // column
			DISK_LIST[i][j] = new Disk(i, j);
		}
	}

	NUMBER_OF_RED = 0;
	NUMBER_OF_YELLOW = 0;
}

function stopGame() {
	PLAYER_TURN = "";
}