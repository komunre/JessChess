class board {
    constructor(bdata = null) {
        if (bdata == null) {
            this.pieces = ["rkbqibkr", "pppppppp", "", "", "", "", "pppppppp", "rkbqibkr"];
            this.colors = ["bbbbbbbb", "bbbbbbbb", "", "", "", "", "wwwwwwww", "wwwwwwww"];
        }
        else {
            let parsed = JSON.parse(bdata);
            this.pieces = parsed.pieces;
            this.colors = parsed.colors;
            console.log(this.pieces);
            console.log(this.colors);
        }
        this.pb = [ [], [], [], [], [], [], [], [] ];
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                let name = "";
                let shortName = "";
                switch (this.pieces[y][x]) {
                    case 'b':
                        name = "bishop";
                        shortName = 'b';
                        break;
                    case 'p':
                        name = "pawn";
                        shortName = 'p';
                        break;
                    case "k":
                        name = "knight";
                        shortName = 'k';
                        break;
                    case "r":
                        name = "rook";
                        shortName = 'r';
                        break;
                    case "q":
                        name = "queen";
                        shortName = 'q';
                        break;
                    case 'i':
                        name = "king";
                        shortName = 'i';
                        break;
                    default:
                        name = "none";
                        shortName = 'e';
                        break;
                }
                if (name == undefined || name == "none" || name == "")  {
                    //console.error("Soemthing is wrong with board generation");
                    this.pb[y][x] = new piece(x, y, "none", true, 'n');
                    continue;
                }

                let wh = false;
                if (this.colors[y][x] == 'w') {
                    wh = true;
                }
                this.pb[y][x] = new piece(x, y, name, wh, shortName);
            }
        }
    }

    getPiece(x, y) {
        return this.pb[y][x];
    }

    setPiece(piece, x, y) {
        this.pb[y][x] = piece;
    }

    getEmptyPiece(x, y) {
        return new piece(x, y, "empty", true, 'n');
    }

    getPiecesStr() {
        let result = [];
        for (let y = 0; y < 8; y++) {
            result[y] = "";
            for (let x = 0; x < 8; x++) {
                result[y] += this.pb[y][x].getShortName();
            }
        }
        return result;
    }

    getColorsStr() {
        let result = [];
        for (let y = 0; y < 8; y++) {
            result[y] = "";
            for (let x = 0; x < 8; x++) {
                result[y] += this.pb[y][x].white ? 'w' : 'b';
            }
        }
        return result;
    }
}

class piece {
    constructor(x, y, name, white, short) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.white = white;
        this.short = short;
    }

    getColor() {
        return this.white;
    }

    getName() {
        return this.name;
    }

    getShortName() {
        return this.short;
    }
}

module.exports = board;