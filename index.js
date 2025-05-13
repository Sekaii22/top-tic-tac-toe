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

    const checkValid = function(pos) {
        pos = Number(pos);
        
        // return false if pos is not a number or not a valid position
        // or the position has already been filled or game has ended
        if (!Number.isInteger(pos) || pos < 0 || pos > 8)
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

    const reset = function() {
        board = [[null, null, null], 
                 [null, null, null], 
                 [null, null, null]];
    };

    return {show, fill, reset};
})();

function createPlayer(name, symbol) {
    // private
    // let moves = [];

    // public
    // const addMove = (pos) => moves.push(pos);
    // const getMoves = () => moves.slice();

    return {name, symbol};
}

// not display dependent, can be played as a console game
const gameController = (function(gameboard) {
    // private
    let gameStarted = false;
    let turnNum = 0;

    let player1;
    let player2;
    // each bucket represents the number of position in player's moves 
    // that are found in that particular winState
    let player1CountBuckets;
    let player2CountBuckets;

    // 8 possible winning combination,
    const winStates = [[0, 1, 2], [3, 4, 5], [6, 7, 8],
                       [0, 3, 6], [1, 4, 7], [2, 5, 8],
                       [0, 4, 8], [2, 4, 6]];
    let winningCombination = null;

    const checkWin = function(buckets) {
        // if any bucket count reaches 3, it means a winning combination is satisfied
        winIndex = buckets.indexOf(3);
        if (winIndex !== -1) {
            winningCombination = winStates[winIndex];
            return true;
        }

        return false;
    };

    const update = function(buckets, pos) {
        // update bucket
        winStates.forEach((combi, index) => {
            if (combi.includes(pos))
                buckets[index]++;
        });
    }

    // public
    const getPlayers = () => [player1, player2];

    const gameSetup = function(p1, p2) {
        gameStarted = true;
        turnNum = 0;
        winningCombination = null;

        player1 = p1;
        player2 = p2;
        player1CountBuckets = [0, 0, 0, 0, 0, 0, 0, 0];
        player2CountBuckets = [0, 0, 0, 0, 0, 0, 0, 0];

        gameboard.reset();
        gameboard.show();
    };

    // returns the player that took the move, else none if invalid move
    const takeTurn = function(pos) {
        if (gameStarted) {
            // p1: even turns, p2 = odd turns
            let player = (turnNum % 2 === 0) ? player1 : player2;
            let buckets = (turnNum % 2 === 0) ? player1CountBuckets : player2CountBuckets;
            
            console.log("Turn: " + turnNum);
            if (gameboard.fill(player.symbol, pos)) {
                gameboard.show();
                update(buckets, pos);
                turnNum++;

                // check for win
                if (checkWin(buckets)) {
                    gameStarted = false;
                    // set off win event
                    alert(`Player ${player.name} (${player.symbol}) won`);
                    console.log(winningCombination);
                }
                // else check for draw
                else if (turnNum >= 9) {
                    gameStarted = false;
                    // set off draw event
                    alert(`Draw`);
                }

                return player;
            }
            else {
                console.log("Invalid move");
            }
        }

        return null;
    };

    return { gameSetup, takeTurn, getPlayers };
})(gameboard);

// DOM/display related
const displayController = (function(doc, game) {
    // private
    const gameContainer = doc.querySelector("#game-container");
    const startBtn = doc.querySelector("#start-btn");

    // public
    const markCell = function(pos, symbol) {
        let cell = doc.querySelector(`.cell[data-position="${pos}"]`);
        cell.innerHTML = symbol;
    };

    const setupDisplay = function() {
        for (let cell of gameContainer.querySelectorAll(".cell")) {
            gameContainer.removeChild(cell);
        }

        for (let pos = 0; pos < 9; pos++) {
            let cell = doc.createElement("div");
            gameContainer.appendChild(cell);
            
            cell.classList.add("cell");
            cell.dataset.position = pos;

            cell.addEventListener("click", () => {
                let player = game.takeTurn(pos);

                if (player !== null) {
                    // valid move taken
                    markCell(pos, player.symbol);
                } 
                else {
                    // show some error
                }
            });
        }
    };

    // initialize (run only once on script load)
    setupDisplay();

    startBtn.addEventListener("click", () => {
        // TODO: take player details from some input later
        let p1 = createPlayer("Bob", "x");
        let p2 = createPlayer("Tim", "o");
        setupDisplay();
        game.gameSetup(p1, p2);
    });
    
    return { setupDisplay, markCell };
})(document, gameController);

