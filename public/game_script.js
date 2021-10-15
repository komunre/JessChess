let board = "";
let game = window.location.href.split("/")[4];
let ws = null;
if (document.location.href.indexOf("https://") == 0){
    console.log("Connecting secure...");
    ws = new WebSocket("wss://" + document.location.host + "/socket");
}
else {
    console.log("Connecting insecure...");
    ws = new WebSocket("ws://" + document.location.host + "/socket");
}

let piece = null;
let white = false;

ws.onopen = () => {
    ws.send(JSON.stringify({ req: "join", game: game }))
    //drawBoard();
    requestBoard();
}

ws.onmessage = message => {
    const resp = JSON.parse(message.data);
    if (resp.req == "board") {
        //drawBoard();
        requestBoard();
    }
    if (resp.res == "boardRes") {
        drawBoardNew(resp.pieces, resp.colors);
    }
}

function requestBoard() {
    ws.send(JSON.stringify({ req: "boardReq", game: game }));
}

function requestPieceMove(x, y, targetX, targetY) {
    let moveReq = new XMLHttpRequest();
    moveReq.open('GET', '/move' + `?x=${x}&y=${y}&targetX=${targetX}&targetY=${targetY}&game=${game}`);
    moveReq.send(null);
    //moveReq.onload = drawBoard;
}

function requestPiece(x, y) {
    let pieceReq = new XMLHttpRequest();
    pieceReq.open("GET", '/piece' + `?x=${x}&y=${y}&game=${game}`, false);
    pieceReq.send(null);
    
    if (pieceReq.status == 200) {
        return JSON.parse(pieceReq.responseText);
    }
    /*console.log("Requesting piece with callback...");
    ws.send(JSON.stringify({ req: "piece", game: game, x: x, y: y }), (data) => {
        console.log("Adding piece!")
        let parsed = JSON.parse(data);
        getImage(td, data.name, x, y);
    });*/
}

function drawBoardNew(pieces, colors) {
    console.log("pieces: ");
    console.log(pieces);
    console.log("colors: ");
    console.log(colors);

    let board = document.getElementById("board");
    board.removeChild(board.lastChild);
    let table = document.createElement("table");
    for (let i = 0; i < pieces.length; i++) {
        let tr = document.createElement("tr");
        for (let j  = 0; j < pieces[i].length; j++) {
            let td = document.createElement('td');
            switch(pieces[i][j]) {
                case 'b':
                    getImage(td, "bishop", j, i);
                    break;
                case 'p':
                    getImage(td, "pawn", j ,i);
                    break;
                case 'r':
                    getImage(td, 'rook', j ,i);
                    break;
                case 'k':
                    getImage(td, 'knight', j ,i);
                    break;
                case 'q':
                    getImage(td, 'queen', j ,i);
                    break;
                case 'i':
                    getImage(td, 'king', j ,i);
                    break;
                default:
                    getImage(td, 'empty', j ,i);
                    break;
            }
            if (colors[i][j] == 'w') {
                td.className = 'white';
            }
            else {
                td.className = 'black';
            }
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    board.appendChild(table)
}

function drawBoard() {
    let board = document.getElementById("board");
    board.removeChild(board.lastChild);
    let table = document.createElement("table");
    for (let i = 0; i < 8; i++) {
        let tr = document.createElement("tr");
        for (let j = 0; j < 8; j++) {
            let td = document.createElement('td');
            let resp = requestPiece(j, i);
            //let resp = {name: piece, white: white};
            if (resp.white) {
                td.className = "white";
            }
            else {
                td.className = 'black';
            }
            switch (resp.name) {
                case 'pawn':
                    getImage(td, "pawn", j ,i);
                    break;
                case 'bishop':
                    getImage(td, "bishop", j ,i);
                    break;
                case 'rook':
                    getImage(td, 'rook', j ,i);
                    break;
                case 'knight':
                    getImage(td, 'knight', j ,i);
                    break;
                case 'queen':
                    getImage(td, 'queen', j ,i);
                    break;
                case 'king':
                    getImage(td, 'king', j ,i);
                    break;
                default:
                    getImage(td, 'empty', j ,i);
                    break;
            }
            piece = null;
            white = false;
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    board.appendChild(table)
    console.log("Got board!");
}

let chosenX = -1;
let chosenY = -1;

function getImage(td, name, x, y) {
    let button = document.createElement('button');
    button.innerHTML = name;
    button.addEventListener('click', function() {
        if (chosenX == -1 && chosenY == -1) {
            chosenX = x;
            chosenY = y;
        }
        else {
            console.log("Requesting piece move");
            requestPieceMove(chosenX, chosenY, x, y);
            chosenX = -1;
            chosenY = -1;
        }
    });
    td.appendChild(button);
}