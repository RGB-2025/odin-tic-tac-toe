// Note: X is 1, O is 0, blank is null

const Player = (function () {
    const createPlayer = (name, type) => {
        return {name, type};
    };

    return {createPlayer};
})();

const GameBoard = (function () {
    let _gridSize = 3; // Normal tic-tac-toe
    let _grid = Array.from({length: _gridSize}, () => Array(_gridSize).fill(null));

    const setCell = (row, column, player) => {
        if (row < 0 || row >= _gridSize || column < 0 || column >= _gridSize) {
            console.error('Out of bounds!');
            return;
        }        
        if (_grid[row][column] !== null) {
            console.error('Cell already occupied!');
            return;
        }
        _grid[row][column] = player.type;
    };

    const setgridSize = (newSize) => {
        _gridSize = newSize;
        resetGrid();
    };

    const resetGrid = () => {
        _grid = Array.from({length: _gridSize}, () => Array(_gridSize).fill(null));
    }

    // Gettters
    const grid = () => _grid;
    const gridSize = () => _gridSize;

    return {setCell, grid, gridSize, setgridSize, resetGrid};
})();


const GameController = (function () {
    let _playerX = Player.createPlayer('Player X', 1);
    let _playerO = Player.createPlayer('Player O', 0);
    let defaultTurn = _playerX;
    let _turn = defaultTurn;
    let gameOver = false;

    // From https://stackoverflow.com/questions/67264023/how-to-find-the-diagonals-of-a-point-in-a-2d-array
    // Legendary find
    function diagonal(matrix, cellX, cellY) {
        let forward = []; // diagonal according forward slash shape: / 
        let backward = []; // diagonal according backslash shape: \
        // Adding this to track indices
        let forwardI = [];
        let backwardI = [];
        let n = matrix.length;
        matrix.forEach((row, y) => {
            let x = cellX - (cellY - y);
            if (x >= 0 && x < n) backward.push(row[x]);
            backwardI.push([y, x]);
            x = cellX + (cellY - y);
            if (x >= 0 && x < n) forward.push(row[x]);
            forwardI.push([y, x]);
        });
        return [forward, backward, forwardI, backwardI];
    }

    const checkCells = cells => {
        if (cells.includes(null)) {return null} // If there is null
        if (cells.includes(0) && cells.includes(1)) {return null} // If there are cases like OXX

        // This means that its either OOO or XXX
        let playerXWins = cells.every(cell => cell === _playerX.type);
        let winner = playerXWins ? _playerX.type : _playerO.type;
        return winner; // We're done checking
    };

    const checkForWinner = grid => {
        let result = null;

        // Check columns
        for (let i = 0; i < grid[0].length; i++) { // Number of columns
            let column = grid.map(function(row, _) {return row[i]});
            let columnIndices = grid.map((_, rowI) => [rowI, i]);
            result = checkCells(column);
            if (result !== null) { // This means there is a winner
                return {
                    winner: result,
                    location: columnIndices
                };
            }
        }

        // Check rows
        for (let i = 0; i < grid.length; i++) { // Number of rows
            let row = grid[i];
            let rowIndices = grid[i].map((_, cellI) => [i, cellI]);
            result = checkCells(row);
            if (result !== null) { // This means there is a winner
                return {
                    winner: result,
                    location: rowIndices
                };
            }
        }

        // Check diagonals
        let middleCell = [Math.floor(grid.length / 2), Math.floor(grid[0].length / 2)];
        let diagonals = diagonal(grid, middleCell[0], middleCell[1]);
        for (let i = 0; i < diagonals.length - 2; i++) { // forward, backward
            let diagonal = diagonals[i];
            let diagonalIndices = diagonals[i+2]; // forwardI, backwardI
            result = checkCells(diagonal);
            if (result !== null) { // This means there is a winner
                return {
                    winner: result,
                    location: diagonalIndices
                }
            }
        }

        // Check if grid is filled
        if (!grid.flat().includes(null)) { 
            return {
                winner: 2,
                location: null
            }; // This means it's a tie
        }

        return {
            winner: null,
            location: null
        }; // This means theres no winner
    };

    const playRound = (row, column, value) => {
        if (gameOver || GameBoard.grid()[row][column] !== null) {return}

        GameBoard.setCell(row, column, _turn);

        // Switch turns
        _turn = _turn === _playerX ? _playerO : _playerX;

        let result = checkForWinner(GameBoard.grid());

        if (result.winner === null) {
            Display.displayStatus(`${_turn.name}'s turn`);
            return;
        } // Round is not over
        
        gameOver = true;
        Display.showGameOver(result);
    };

    const setPlayerName = (player, name) => player.name = name;

    const startGame = () => {
        gameOver = false;
        _turn = defaultTurn;
        Display.displayStatus(`${GameController.turn().name}'s turn`);
        GameBoard.resetGrid();
    };

    // Getters
    const playerO = () => _playerO;
    const playerX = () => _playerX;
    const turn = () => _turn;

    return {playRound, playerO, playerX, setPlayerName, turn, startGame};
})();

const Display = (function () {
    let gridContainer = document.getElementById('grid');
    let cells = {};
    let disabled;

    const clearGrid = () => {gridContainer.innerHTML = ''; cells = []};

    const cleanGrid = () => {
        gridContainer.querySelectorAll('.xo').forEach(e => e.remove());
        for (let id in cells) {
            let cell = cells[id].cell;
            cell.classList.remove('disabled');
        }
        disabled = false;
    };

    const makeClickFunctionality = (cell, position) => {
        cell.addEventListener('click', () => {
            if (GameController.turn() && !disabled) {
                GameController.playRound(position[0], position[1]);
                render(GameBoard.grid());
            }
        })
    }

    const makeGrid = (grid) => {
        let gridSize = GameBoard.gridSize();
        let fragment = document.createDocumentFragment(); // to do it all at once
        clearGrid();
        document.querySelector(':root').style.setProperty('--grid-size', gridSize); // changing --grid-size for :root
        for (let i = 0; i < gridSize ** 2; i++) { // for all cells
            let cell = document.createElement('div');
            let row = Math.floor(i / gridSize);
            let column = i % gridSize;
            cell.className = 'cell';
            cells[`${row}-${column}`] = {
                cell,
                value: grid[row][column],
                position: [row, column]
            };            
            makeClickFunctionality(cell, [row, column]);
            fragment.appendChild(cell);
        }
        gridContainer.appendChild(fragment);
    }

    const render = (grid) => {
        for (let id in cells) {
            let cell = cells[id].cell;
            let newValue = grid[cells[id].position[0]][cells[id].position[1]];
            if (cells[id].value !== newValue) {
                cells[id].value = newValue;
            }

            // If disabled
            if (disabled && !cell.classList.contains('disabled')) {cell.classList.add('disabled')};

            // If empty
            if (cells[id].value === null) {continue}

            // If X or O
            let isX = cells[id].value == GameController.playerX().type;

            let img = cell.querySelector('.xo') || document.createElement('img'); // Exists? If not make one
            img.src = isX ? 'img/X.svg' : 'img/O.svg';
            img.alt = isX ? 'X' : 'O';
            
            if (!cell.querySelector('.xo')) {
                img.className = 'xo';
                cell.appendChild(img);
            }
        }
    }

    
    const disable = () => {disabled = true; render(GameBoard.grid())};

    const displayStatus = text => document.getElementById('status').textContent = text;

    const showGameOver = (result) => {
        let resultText = document.getElementById('results');
        displayStatus(); // clear

        switch (result.winner) {
            case GameController.playerO().type:
                resultText.textContent = `${GameController.playerO().name} wins!`;
                break;
            case GameController.playerX().type:
                resultText.textContent = `${GameController.playerX().name} wins!`;
                break;
            default:
                resultText.textContent = 'It\'s a tie!';
                break;
        }

        document.getElementById('game-over').showModal();
        Display.disable();
    }

    return {makeGrid, render, displayStatus, disable, showGameOver, clearGrid, cleanGrid};
})();

document.getElementById('grid-size').addEventListener('change', (e) => {
    let self = e.target;
    let gridDisplay = document.getElementById('grid-display');
    gridDisplay.textContent = `x ${self.value}`
    if (Number(self.value) % 2 == 0) {
        document.getElementById('error').textContent = 'Grid size must be an odd number.';
    } else {document.getElementById('error').textContent = ''}
});

document.getElementById('start-form').addEventListener('submit', (e) => {
    let playerXName = document.getElementById('playerX');
    let playerOName = document.getElementById('playerO');

    e.preventDefault();

    const newGridSize = Number(document.getElementById('grid-size').value);

    if (newGridSize % 2 == 0) {
        return;
    }

    const needsReset = newGridSize !== GameBoard.gridSize() || !document.getElementById('grid').querySelector('.cell');

    if (needsReset) {
        Display.clearGrid();
        GameBoard.setgridSize(newGridSize);
        Display.makeGrid(GameBoard.grid());
    }
    GameController.setPlayerName(GameController.playerX(), playerXName.value || 'Player X');
    GameController.setPlayerName(GameController.playerO(), playerOName.value || 'Player O');
    e.target.className = 'hidden';
    GameController.startGame();
    Display.displayStatus(`${GameController.turn().name}'s turn`);
    document.getElementById('grid').classList.remove('hidden');
});

document.getElementById('reset').addEventListener('click', () => {
    document.getElementById('game-over').close()
    document.getElementById('grid').classList.add('hidden');
    Display.cleanGrid();
    document.getElementById('start-form').classList.remove('hidden');
});