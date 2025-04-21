// Note: X is 1, O is 0, blank is null

const Player = (function () {
    const createPlayer = (name, type) => {name, type};

    return {createPlayer};
})();

const GameBoard = (function () {
    let grid = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];

    const setCell = (row, column, player) =>
        grid[row][column] = player.type;

    const getGrid = () => grid;

    return {setCell, getGrid};
})();