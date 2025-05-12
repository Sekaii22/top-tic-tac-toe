const gameboard = (function() {
    // private
    /*
    [0, 1, 2]
    [3, 4, 5]
    [6, 7, 8]
    */
    let board = [[null, null, null], 
                 [null, null, null], 
                 [null, null, null]];
    const winStates = [[0, 1, 2], [3, 4, 5], [6, 7, 8],
                       [0, 3, 6], [1, 4, 7], [2, 5, 8],
                       [0, 4, 8], [2, 4, 6]];
    let winningCombination = null;

    const checkValid = function(pos) {
        // return false if pos is not a number or not a valid position
        // or the position has already been filled or someone has already won
        if (!Number.isInteger(pos) || pos < 0 || pos > 8 || winningCombination !== null)
            return false;

        let row = Math.floor(pos / 3);
        let col = pos % 3;

        if (board[row][col] === null)
            return true;

        return false;
    };
    
    // public
    const show = function() {
        console.log(`${board[0][0]}`.padStart(4) + " | " + `${board[0][1]}`.padStart(4) + " | " + `${board[0][2]}`.padStart(4));
        console.log("-----|------|-----")
        console.log(`${board[1][0]}`.padStart(4) + " | " + `${board[1][1]}`.padStart(4) + " | " + `${board[1][2]}`.padStart(4));
        console.log("-----|------|-----")
        console.log(`${board[2][0]}`.padStart(4) + " | " + `${board[2][1]}`.padStart(4) + " | " + `${board[2][2]}`.padStart(4));
    };

    const fill = function(symbol, pos) {
        // check if move is valid
        if (checkValid(pos) === false)
            return false;

        // mark symbol on board at pos
        let row = Math.floor(pos / 3);
        let col = pos % 3;
        board[row][col] = symbol;

        return true;
    };

    const checkWin = function(moves) {
        // 8 possible winning combination
        let combinationCountBucket = [0, 0, 0, 0, 0, 0, 0, 0];

        moves.forEach((pos) => {
            winStates.forEach((combi, index) => {
                if (combi.includes(pos))
                    combinationCountBucket[index]++;
            });
        });

        winIndex = combinationCountBucket.indexOf(3);
        if (winIndex !== -1) {
            winningCombination = winStates[winIndex];
            return true
        }

        return false;
    };

    const getWinningCombination = () => winningCombination;

    const reset = function() {
        board = [[null, null, null], 
                 [null, null, null], 
                 [null, null, null]];
        winningCombination = null;
    };

    return {show, fill, checkWin, getWinningCombination, reset};
})();

console.log(gameboard);