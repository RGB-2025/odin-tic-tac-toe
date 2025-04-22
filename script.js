// Note: X is 1, O is 0, blank is null

const Player = (function () {
    const createPlayer = (name, type) => {
        return {name, type};
    };

    return {createPlayer};
})();

const GameBoard = (function () {
    let grid = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];

    const setCell = (row, column, player) => {
        if (grid[row][column] !== null) {
            console.error('Cell already occupied!');
            return;
        }
        grid[row][column] = player.type;
    }

    return {setCell, grid};
})();

const GameController = (function () {
    let playerX = Player.createPlayer('Player X', 1);
    let playerO = Player.createPlayer('Player O', 0);
    let gameOver = false;

    // From https://stackoverflow.com/questions/67264023/how-to-find-the-diagonals-of-a-point-in-a-2d-array
    // Legendary find
    function diagonal(matrix, cellX, cellY) {
        let forward = []; // diagonal according forward slash shape: / 
        let backward = []; // diagonal according backslash shape: \
        let n = matrix.length;
        matrix.forEach((row, y) => {
            let x = cellX - (cellY - y);
            if (x >= 0 && x < n) backward.push(row[x]);
            x = cellX + (cellY - y);
            if (x >= 0 && x < n) forward.push(row[x]); 
        });
        return [forward, backward];
    }

    const checkCells = cells => {
        if (cells.includes(null)) {return null} // If there is null
        if (cells.includes(0) && cells.includes(1)) {return null} // If there are cases like OXX

        // This means that its either OOO or XXX
        let playerXWins = cells.every(cell => cell === 1);
        let winner = playerXWins ? 1 : 0;
        return winner; // We're done checking
    };

    const checkForWinner = grid => {
        let result = null;

        // Check columns
        for (let i = 0; i < grid[0].length; i++) { // Number of columns
            let column = grid.map(function(row, _) {return row[i]});
            result = checkCells(column);
            if (result !== null) { // This means there is a winner
                return result;
            }
        }

        // Check rows
        for (let i = 0; i < grid.length; i++) { // Number of rows
            let row = grid[i];
            result = checkCells(row);
            if (result !== null) { // This means there is a winner
                return result;
            }
        }

        // Check diagonals
        let middleCell = [Math.floor(grid.length / 2), Math.floor(grid[0].length / 2)];
        let diagonals = diagonal(grid, middleCell[0], middleCell[1]);
        for (let i = 0; i < diagonals.length; i++) {
            let diagonal = diagonals[i];
            result = checkCells(diagonal);
            if (result !== null) { // This means there is a winner
                return result;
            }
        }

        // Check if grid is filled
        if (!grid.flat().includes(null)) { 
            return 2; // This means it's a tie
        }

        return null; // This means theres no winner
    };

    const playRound = (row, column, player) => {
        if (gameOver) {return}

        GameBoard.setCell(row, column, player);

        let result = checkForWinner(GameBoard.grid);

        if (result == null) {return} // Round is not over
        
        gameOver = true;

        switch (result) {
            case 0:
                console.log(`${playerO.name} wins!`);
                break;
            case 1:
                console.log(`${playerX.name} wins!`);
                break;
            default:
                console.log('Its a tie!');
                break;
        }
    };

    const setPlayerName = (player, name) => {
        player.name = name
    }

    return {playRound, playerO, playerX, setPlayerName}
})();

GameController.playRound(0, 0, GameController.playerO);
GameController.playRound(0, 1, GameController.playerX);
GameController.playRound(0, 2, GameController.playerO);

GameController.playRound(1, 0, GameController.playerX);
GameController.playRound(1, 1, GameController.playerX);
GameController.playRound(1, 2, GameController.playerO);

GameController.playRound(2, 0, GameController.playerX);
GameController.playRound(2, 1, GameController.playerO);
GameController.playRound(2, 2, GameController.playerX);


