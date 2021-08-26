// Game parameters
let GRID_SIZE;

function initGrid() {
	GRID_SIZE = GET_GRID_SIZE();
}

// Emojis
const EMOJI_YELLOW = "🟡        ";
const EMOJI_YELLOW_WON = "🟨        ";
const EMOJI_RED = "🔴        ";
const EMOJI_RED_WON = "🟥        ";
const EMOJI_EMPTY = "⚪        ";

// Game variables
let PLAYER_TURN, STARTING_PLAYER, DISK_LIST, DISK_PER_COLUMN, MOVE_LIST, WINNER;
let WINNING_DISK_LIST = [];
let NUMBER_OF_YELLOW = 0;
let NUMBER_OF_RED = 0;
const GET_GRID_SIZE = () => { return 7; };
const getPlayerTurn = () => { return PLAYER_TURN; };
const getWinner = () => { return WINNER; };


function playMove(col) {
	if (!PLAYER_TURN) return;
	try {
		playTurn(col);
		registerMove(getPossibleRow(col), col);
	} catch (error) {
		// console.log("Incorrect move");
	}
}

function registerMove(row, col) {
	const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H"];
	const moveName = alphabet[col] + "" + row;
	MOVE_LIST.push(moveName);
}

function nextTurn() {
	if (!PLAYER_TURN) {
		return;
	} else if (PLAYER_TURN == "yellow") {
		PLAYER_TURN = "red";
	} else {
		PLAYER_TURN = "yellow";
	}
}

function getPossibleRow(col) {
	return ((GRID_SIZE - 1) - DISK_PER_COLUMN[col]);
}


function drawWinText(player, winCondition) {
	let infoText;

	infoText = "Game ended. ";
	infoText += (winCondition == "boardFull" ? "The board is full. " : "");

	if (player == "tie") {
		infoText += "It's a tie.";
	} else {
		infoText += (player == "yellow" ? "Yellow won." : "Red won.");
	}
	overwriteGameInfo(infoText);

	PLAYER_TURN = "";

	// let first_disk, last_disk;
	// for (const two_disk of WINNING_DISK_LIST) {
	// 	[first_disk, last_disk] = two_disk;
	// 	drawWinningLine(first_disk, last_disk);
	// }
}

// Emoji functions
function getEmoji(state) {
	if (state == "yellow") {
		return EMOJI_YELLOW;
	} else if (state == "yellow_won") {
		return EMOJI_YELLOW_WON;
	} else if (state == "red") {
		return EMOJI_RED;
	} else if (state == "red_won") {
		return EMOJI_RED_WON;
	} else {
		return EMOJI_EMPTY;
	}
}

function getGameString() {
	let gameString = "";
	for (let i = 0; i < GRID_SIZE; i++) {
		for (let j = 0; j < GRID_SIZE; j++) {
			gameString += getEmoji(DISK_LIST[i][j].state);
		}
		gameString += "\n\n";
	}
	return gameString;
}

// Tile object constructor
function Disk(row, col) {
	this.row = row;
	this.col = col;
	this.state = null;
}

// Game rules
function playTurn(col) {
	const row = getPossibleRow(col);

	if (PLAYER_TURN == "yellow") {
		NUMBER_OF_YELLOW += 1;
	} else {
		NUMBER_OF_RED += 1;
	}

	DISK_LIST[row][col].state = PLAYER_TURN;
	DISK_PER_COLUMN[col] += 1;

	const player = (PLAYER_TURN == "yellow" ? "Yellow" : "Red");
	const sentence = player + " has played in column " + (col + 1);

	overwriteGameInfo(sentence);
	checkForWin(row, col);
	nextTurn();
}

function checkInDirection(row, col, offset_row, offset_col) {
	const playerChecked = PLAYER_TURN;
	let first_disk, last_disk;
	let count = 1;
	WINNING_DISK_LIST.push(DISK_LIST[row][col]);

	// Count backwards
	let r = row - offset_row;
	let c = col - offset_col;
	while ((r >= 0 && r < GRID_SIZE) && (c >= 0 && c < GRID_SIZE)) {
		if (DISK_LIST[r][c].state == playerChecked) {
			count++;
			WINNING_DISK_LIST.push(DISK_LIST[r][c]);
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
			WINNING_DISK_LIST.push(DISK_LIST[r][c]);
		} else {
			break;
		}

		r += offset_row;
		c += offset_col;
	}

	if (!last_disk) {
		last_disk = DISK_LIST[row][col];
	}

	if (count < 4) {
		WINNING_DISK_LIST = [];
	} else {
		for (const disk of WINNING_DISK_LIST) {
			disk.state = (playerChecked == "yellow") ? "yellow_won" : "red_won";
		}
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
	WINNER = checkForConnectFour(row, col);
	if (NUMBER_OF_YELLOW + NUMBER_OF_RED == GRID_SIZE ** 2) {
		boardFull = true;
	}

	if (WINNER) {
		drawWinText(WINNER, "");
		stopGame();
	} else if (boardFull) {
		drawWinText("tie", "boardFull");
		stopGame();
	} else {
		return;
	}
}

function overwriteGameInfo(text) {
	// console.log(text);
}

function newGame() {
	initGrid();
	STARTING_PLAYER = ["yellow", "red"][Math.floor(Math.random() * 2)];
	PLAYER_TURN = STARTING_PLAYER;
	WINNER = "";
	WINNING_DISK_LIST = [];
	DISK_LIST = [];
	MOVE_LIST = [];
	DISK_PER_COLUMN = Array(GRID_SIZE).fill(0);
	for (let i = 0; i < GRID_SIZE; i++) {
		DISK_LIST[i] = [];
		for (let j = 0; j < GRID_SIZE; j++) {
			DISK_LIST[i][j] = new Disk(i, j);
		}
	}

	NUMBER_OF_RED = 0;
	NUMBER_OF_YELLOW = 0;
}

function stopGame() {
	PLAYER_TURN = "";
}

function resetGame() {
	stopGame();
	newGame();
	overwriteGameInfo("Game has reset.");
}

// Start a new game
// newGame();

module.exports = {
	getPlayerTurn,
	getGameString,
	getWinner,
	playMove,
	newGame,
	resetGame,
};