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

        // mark symbol on board arr at pos
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

function createPlayer(name, textSymbol, imgSymbol) {
    return {name, textSymbol, imgSymbol};
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
    let gameoverEventHandlers = [];

    const checkWin = function(buckets) {
        // if any bucket count reaches 3, it means a winning combination is satisfied
        winIndex = buckets.indexOf(3);
        if (winIndex !== -1) {
            winningCombination = winStates[winIndex];
            return true;
        }

        return false;
    };

    const updateBucket = function(buckets, pos) {
        // update bucket
        winStates.forEach((combi, index) => {
            if (combi.includes(pos))
                buckets[index]++;
        });
    }

    // public
    const addGameOverEventHandler = (callbackFn) => gameoverEventHandlers.push(callbackFn);

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
        console.log("try take turn");
        if (gameStarted) {
            // p1: even turns, p2 = odd turns
            let player = (turnNum % 2 === 0) ? player1 : player2;
            let buckets = (turnNum % 2 === 0) ? player1CountBuckets : player2CountBuckets;
            
            console.log("Turn: " + turnNum);
            if (gameboard.fill(player.textSymbol, pos)) {
                gameboard.show();
                updateBucket(buckets, pos);
                turnNum++;

                // check for win
                if (checkWin(buckets)) {
                    // stop game
                    gameStarted = false;

                    console.log(`Player ${player.name} (${player.textSymbol}) won`);
                    console.log(winningCombination);

                    // fire off gameover event
                    gameoverEventHandlers.forEach((func) => {
                        let event = {
                            winner: player,
                            combination: winningCombination,
                        };
                        func(event);
                    });
                }
                // else check for draw
                else if (turnNum >= 9) {
                    // stop game
                    gameStarted = false;
                    
                    console.log(`Draw`);

                    // fire off gameover event
                    gameoverEventHandlers.forEach((func) => {
                        let event = {
                            winner: null,
                        };
                        func(event);
                    });
                }

                return player;
            }
            else {
                console.log("Invalid move");
            }
        }

        return null;
    };

    return { gameSetup, takeTurn, addGameOverEventHandler };
})(gameboard);

// DOM/display related, using display to interact with gameController
const displayController = (function(doc, game) {
    // private
    const gameContainer = doc.querySelector("#game-container");
    const form = doc.querySelector("form");
    const startBtn = doc.querySelector("#start-btn");
    const player1NameInput = doc.querySelector("#player1-name");
    const player2NameInput = doc.querySelector("#player2-name");
    const resultHeading = doc.querySelector("#result-heading");
    const resultText = doc.querySelector("#result-text");
    const resultModal = doc.querySelector("#result-modal");
    const modalArea = doc.querySelector("#modal-area")

    const crossSymbol = `<svg class="cross" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>`;
    const circleSymbol = `<svg class="circle" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>`;

    const disableCellInteractivity = function(cell) {
        cell.classList.remove("open");
        cell.style.cssText = "pointer-events: none;";
    }

    const disableAllCellInteractivity = function() {
        for (let cell of gameContainer.querySelectorAll(".cell")) {
            disableCellInteractivity(cell);
        }
    }

    // public
    const markCell = function(pos, imgSymbol) {
        let cell = doc.querySelector(`.cell[data-position="${pos}"]`);
        cell.innerHTML = imgSymbol;
    };

    const setupDisplay = function() {
        for (let cell of gameContainer.querySelectorAll(".cell")) {
            gameContainer.removeChild(cell);
        }

        for (let pos = 0; pos < 9; pos++) {
            let cell = doc.createElement("div");
            gameContainer.appendChild(cell);
            
            cell.classList.add("cell", "open");
            cell.dataset.position = pos;

            cell.addEventListener("click", () => {
                let player = game.takeTurn(pos);

                if (player !== null) {
                    // valid move taken
                    markCell(pos, player.imgSymbol);
                    disableCellInteractivity(cell);
                }
            });
        }

        resultHeading.textContent = "";
        resultText.textContent = "";
    };

    // initialize (run only once on script load)
    gameController.addGameOverEventHandler((event) => {
        // game is over
        disableAllCellInteractivity();

        if (event.winner !== null){
            resultHeading.textContent = `${event.winner.name} is the Winner!`;
            resultText.textContent = "Congratulation!";
        }
        else {
            resultHeading.textContent = "Its a Draw!";
            resultText.textContent = "You are both winners. Congrats!";
        }

        resultModal.showModal();

        // unlock name inputs
        player1NameInput.readOnly = false;
        player2NameInput.readOnly = false;
        player1NameInput.style.cssText = "pointer-events: auto;";
        player2NameInput.style.cssText = "pointer-events: auto;";
    });

    // clicking outside modal should closes it as well
    resultModal.addEventListener("click", () => resultModal.close());
    modalArea.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    startBtn.addEventListener("click", (e) => {
        if (form.checkValidity()) {
            e.preventDefault();

            // lock name inputs
            player1NameInput.readOnly = true;
            player2NameInput.readOnly = true;
            player1NameInput.style.cssText = "pointer-events: none;";
            player2NameInput.style.cssText = "pointer-events: none;";

            let p1 = createPlayer(player1NameInput.value, "x", crossSymbol);
            let p2 = createPlayer(player2NameInput.value, "o", circleSymbol);

            // start game and setup display
            game.gameSetup(p1, p2);
            setupDisplay();
        }
    });
    
    return { setupDisplay, markCell };
})(document, gameController);