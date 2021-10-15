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
    if (resp.res == "saveFile") {
        let down = document.createElement('a');
        down.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(resp.saveData));
        down.setAttribute('download', game + ".txt");

        down.style.display = 'none';
        document.body.appendChild(down);

        down.click();
        document.body.removeChild(down);
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
            let color  = colors[i][j];
            switch(pieces[i][j]) {
                case 'b':
                    getImage(td, "bishop", j, i, color);
                    break;
                case 'p':
                    getImage(td, "pawn", j ,i, color);
                    break;
                case 'r':
                    getImage(td, 'rook', j ,i, color);
                    break;
                case 'k':
                    getImage(td, 'knight', j ,i, color);
                    break;
                case 'q':
                    getImage(td, 'queen', j ,i, color);
                    break;
                case 'i':
                    getImage(td, 'king', j ,i, color);
                    break;
                default:
                    getImage(td, 'empty', j ,i);
                    break;
            }

            if ((j + i) % 2 == 1) {
                td.className = 'black';
            }
            else {
                td.className = 'white';
            }
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    board.appendChild(table)
}

let chosenX = -1;
let chosenY = -1;

function getImage(td, name, x, y, color) {
    let button = document.createElement('button');
    button.innerHTML = name;
    button.addEventListener('click', function() {
        if (chosenX == -1 && chosenY == -1) {
            chosenX = x;
            chosenY = y;
            document.getElementById("ch").innerHTML = name + `, ${x}:${y}`;
        }
        else {
            console.log("Requesting piece move");
            requestPieceMove(chosenX, chosenY, x, y);
            chosenX = -1;
            chosenY = -1;
            document.getElementById("ch").innerHTML = "none";
        }
    });
    button.className = "piece_button";
    if (color !== undefined) {
        let colorChar = color;
        let urlStr = "url('pieces/" + colorChar + "_" + name + ".png')";
        td.style.backgroundImage = urlStr;
        td.style.backgroundRepeat = "no-repeat";
        td.style.backgroundSize = "100% 100%";
    }
    td.appendChild(button);
}

function save() {
    ws.send(JSON.stringify({ req: "save", game: game }))
}

setInterval(() => { 
    if (ws.readyState !== ws.OPEN) {
        let error = document.getElementById("error");
        error.innerHTML = "NO CONNECTION!";
        error.style.backgroundColor = 'rgb(255, 0, 0)';
        return; 
    }
    ws.send(JSON.stringify({ req: "keepalive" })) 
}, 1000);