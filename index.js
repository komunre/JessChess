const express = require('express');
const { read } = require('fs');
const board = require('./board');
const cookieParser = require("cookie-parser");
const fileupload = require("express-fileupload");

class boardState {
    constructor(board) {
        this.board = board;
        this.whiteTurn = true;
        this.players = [];
    }

    getBoard() {
        return this.board;
    }
    
    addPlayer(player) {
        this.players.push(player);
    }

    getPlayers() {
        return this.players;
    }
}


var boards = {};

const app = express();

const WebSocket = require( "ws");
const http = require('http');
const https = require('https');
const { constants } = require('buffer');
const { WebSocketServer } = require('ws');

const server = http.createServer(app);

const webSocketServer = new WebSocket.Server({ server, path: "/socket" });

webSocketServer.on('connection', ws => {
    ws.on('message', msg => {
        try {
            let parsed = JSON.parse(msg);
            if (parsed.req == 'join') {
                if (boards[parsed.game]) {
                    boards[parsed.game].addPlayer(ws);
                }
            }

            if (parsed.req == 'boardReq') {
                let currBoard = boards[parsed.game].board;
                ws.send(JSON.stringify({ res: "boardRes", pieces: currBoard.getPiecesStr(),  colors: currBoard.getColorsStr()}))
            }
            if (parsed.req == "save") {
                let currBoard = boards[parsed.game].board;
                ws.send(JSON.stringify({ res: "saveFile", saveData: JSON.stringify({ pieces: currBoard.getPiecesStr(), colors: currBoard.getColorsStr() }) }));
            }
        } catch (e) {
            console.error(e);
        }
    });
});

function sendGameState(game) {
    if (boards[game]) {
        boards[game].getPlayers().forEach(player => {
           player.send(JSON.stringify({ req: "board" })) 
        });
    }
}

let gamesStarted = {};
const viewsDir = "/views";

function getViewDir(name) {
    return __dirname + viewsDir + '/' + name;
}

app.set('view engine', 'pug');

app.set('views', '/views');
app.use(express.static('public'));
app.use(express.json());
app.use(fileupload());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/game', express.static('public'));

app.get("/", (req, res) => {
    res.sendFile(getViewDir('index.html'));
});

app.get("/create", (req, res) => {
    let abc = "abcdefghijklmnopqrstuvwxyz";
    let id = ""
    for (let i = 0; i < 10; i++) {
        id += abc[Math.floor(Math.random() * abc.length)];
    }
    let userid = "";
    for (let i = 0; i < 10; i++) {
        userid += abc[Math.floor(Math.random() * abc.length)];
    }
    boards[id] = new boardState(new board);
    console.log(`Game created. List of games:`)
    console.log(boards);
    return res.redirect("/game/" + id);
});

app.get('/piece', (req, res) => {
    let game = req.query.game;
    if (boards[game] != null) {
        let currBoard = boards[game].getBoard();
        let piece = currBoard.getPiece(req.query.x, req.query.y);
        res.json({ white: piece.getColor(), name: piece.getName() })
    }
    else {
        res.json({ white: true, name: "error" });
    }
})

app.get("/game/:gameid", (req, res) => {
    if (!gamesStarted[req.params.gameid]) {
        gamesStarted[req.params.gameid] = false;
    }
    else if (gamesStarted[req.params.gameid] == false) {
        gamesStarted[req.params.gameid] = true;
    }
    else {
        res.send("Already started!");
    }
    res.sendFile(getViewDir('game.html'));
});

app.get('/move', (req, res) => {
    if (req.query.x < 0 || req.query.y < 0) {
        res.json({err: "no"});
    }
    if (boards[req.query.game]) {
        let currBoard = boards[req.query.game].getBoard();
        let piece = currBoard.getPiece(req.query.x, req.query.y);
        let targetPiece = currBoard.getPiece(req.query.targetX, req.query.targetY); // For future checks
        // Do checks here
        if (req.query.x == req.query.targetX && req.query.y == req.query.targetY) {
            res.status(200).send();
            return;
        }
        // Continue work
        currBoard.setPiece(piece, req.query.targetX, req.query.targetY);
        currBoard.setPiece(currBoard.getEmptyPiece(req.query.x, req.query.y), req.query.x, req.query.y);
        console.log("Piece moved");
        console.log("Broadcasting...");
        sendGameState(req.query.game);
        console.log("Broadcasted");
        res.status(200).send();
        return;
    }
    res.status(404).send();
})

app.post('/import', (req, res) => {
    let abc = "abcdefghijklmnopqrstuvwxyz";
    let id = ""
    for (let i = 0; i < 10; i++) {
        id += abc[Math.floor(Math.random() * abc.length)];
    }
    let userid = "";
    for (let i = 0; i < 10; i++) {
        userid += abc[Math.floor(Math.random() * abc.length)];
    }
    boards[id] = new boardState(new board(req.files.importFile.data));
    console.log(`Game created. List of games:`)
    console.log(boards);
    return res.redirect("/game/" + id);
})

server.listen(process.env.PORT, '0.0.0.0', () => {
    console.log(`Listening at ${process.env.PORT}`);
});