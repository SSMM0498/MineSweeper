var app = /** @class */ (function () {
    function app(numberCase, percentage) {
        if (percentage === void 0) { percentage = 12.5; }
        this.gameStatus = GameStatus.run;
        this.isDevMode = false;
        this.leftClickHandler = this.leftClickHandler.bind(this);
        this.rightClickHandler = this.rightClickHandler.bind(this);
        this.nbBlock = numberCase !== null && numberCase !== void 0 ? numberCase : 10;
        this.nbMine = Math.ceil(Math.pow(this.nbBlock, 2) * percentage / 100);
        this.appBoard = document.getElementById('main');
        this.mess = document.querySelector('.mess');
        // this.chrono = document.getElementById("chronotime");
        this.blocks = [[]];
        this.init();
    }
    app.prototype.init = function () {
        for (var i = 0; i < this.nbBlock; i++) {
            var r = document.createElement("div");
            r.classList.add("row");
            this.blocks.push(Array());
            for (var j = 0; j < this.nbBlock; j++) {
                var b = document.createElement("button");
                if (this.isDevMode)
                    b.innerText = ".";
                r.appendChild(b);
                var block = {
                    type: BlockType["void"],
                    isReveal: false,
                    isFlagged: false,
                    el: b,
                    number: 0
                };
                block.el.addEventListener('click', this.leftClickHandler);
                block.el.addEventListener('contextmenu', this.rightClickHandler);
                this.blocks[i].push(block);
            }
            this.appBoard.appendChild(r);
        }
        this.setMines();
        // this.chronoStart();
    };
    app.prototype.setMines = function () {
        for (var i = 0; i < this.nbMine; i++) {
            var col = 0;
            var row = 0;
            var tryAgain = true;
            while (tryAgain) {
                col = Math.floor(Math.random() * (this.nbBlock - 1));
                row = Math.floor(Math.random() * (this.nbBlock - 1));
                if (this.blocks[col][row].type != BlockType.mine)
                    tryAgain = false;
            }
            this.blocks[col][row].type = BlockType.mine;
            if (this.isDevMode)
                this.blocks[col][row].el.innerText = "X";
            this.setNumbers(col, row);
        }
    };
    app.prototype.setNumbers = function (col, row) {
        var arroundBlocks = this.getArround(col, row);
        for (var i = 0; i < arroundBlocks.length; i++) {
            var b = arroundBlocks[i];
            if (b.type !== BlockType.mine) {
                b.type = BlockType.number;
                b.number++;
                if (this.isDevMode)
                    b.el.innerText = b.number.toString();
            }
        }
    };
    app.prototype.getArround = function (col, row, diag) {
        if (diag === void 0) { diag = true; }
        var arroundBlocks = [];
        if (col != 0) {
            arroundBlocks.push(this.blocks[col - 1][row]);
        }
        if (row != 0) {
            arroundBlocks.push(this.blocks[col][row - 1]);
        }
        if (row != this.nbBlock - 1) {
            arroundBlocks.push(this.blocks[col][row + 1]);
        }
        if (col != this.nbBlock - 1) {
            arroundBlocks.push(this.blocks[col + 1][row]);
        }
        if (diag) {
            if (col != 0 && row != 0) {
                arroundBlocks.push(this.blocks[col - 1][row - 1]);
            }
            if (col != 0 && row != this.nbBlock - 1) {
                arroundBlocks.push(this.blocks[col - 1][row + 1]);
            }
            if (col != this.nbBlock - 1 && row != 0) {
                arroundBlocks.push(this.blocks[col + 1][row - 1]);
            }
            if (col != this.nbBlock - 1 && row != this.nbBlock - 1) {
                arroundBlocks.push(this.blocks[col + 1][row + 1]);
            }
        }
        return arroundBlocks;
    };
    app.prototype.leftClickHandler = function (e) {
        var target = e.target;
        this.showBlocks(target);
        if (this.gameStatus == GameStatus.win) {
            this.mess.innerText = "Vous avez gagné";
        }
        else if (this.gameStatus == GameStatus.lose) {
            this.mess.innerText = "Vous avez appuyé sur une mine";
        }
    };
    app.prototype.rightClickHandler = function (e) {
        console.log("right");
        e.preventDefault();
        var target = e.target;
        this.addFlag(target);
    };
    app.prototype.showBlocks = function (target) {
        var _this = this;
        var _a = this.findBlock(target), b = _a.b, i = _a.i, j = _a.j;
        this.revealBlock(b);
        if (this.isAllReveal()) {
            this.gameStatus = GameStatus.win;
        }
        if (b.type == BlockType.mine) {
            this.gameStatus = GameStatus.lose;
            this.revealAll();
        }
        else {
            if (b.type == BlockType["void"]) {
                var arroundBlock = this.getArround(i, j, false);
                arroundBlock.forEach(function (block) {
                    if (block.type !== BlockType.mine && !block.isReveal) {
                        _this.showBlocks(block.el);
                    }
                });
            }
        }
    };
    app.prototype.addFlag = function (target) {
        var _a = this.findBlock(target), b = _a.b, i = _a.i, j = _a.j;
        this.toggleFlagBlock(b);
    };
    app.prototype.revealBlock = function (b) {
        b.isReveal = true;
        if (b.type == BlockType.mine) {
            b.el.classList.add("mine");
        }
        else if (b.type == BlockType["void"]) {
            b.el.innerHTML = ".";
        }
        else {
            b.el.innerHTML = b.number.toString();
        }
        if (b.isFlagged) {
            b.el.classList.remove("flag");
            b.isFlagged = false;
        }
        b.el.classList.add("reveal");
        b.el.removeEventListener('click', this.leftClickHandler);
        b.el.removeEventListener('contextmenu', this.rightClickHandler);
        b.el.addEventListener('contextmenu', function (e) { return e.preventDefault(); });
    };
    app.prototype.toggleFlagBlock = function (b) {
        if (!b.isFlagged) {
            b.isFlagged = true;
            b.el.classList.add("flag");
            b.el.removeEventListener('click', this.leftClickHandler);
        }
        else {
            b.isFlagged = false;
            b.el.classList.remove("flag");
            b.el.addEventListener('click', this.leftClickHandler);
        }
    };
    app.prototype.revealAll = function () {
        var _this = this;
        this.blocks.forEach(function (row) {
            row.forEach(function (b) {
                _this.revealBlock(b);
            });
        });
    };
    app.prototype.isAllReveal = function () {
        for (var i = 0; i < this.blocks.length; i++) {
            for (var j = 0; j < this.blocks[i].length; j++) {
                if (!this.blocks[i][j].isReveal && this.blocks[i][j].type !== BlockType.mine)
                    return false;
            }
        }
        return true;
    };
    app.prototype.findBlock = function (target) {
        var b;
        for (var i = 0; i < this.blocks.length; i++) {
            for (var j = 0; j < this.blocks[i].length; j++) {
                if (this.blocks[i][j].el === target) {
                    b = this.blocks[i][j];
                    return {
                        b: b,
                        i: i,
                        j: j
                    };
                }
            }
        }
    };
    return app;
}());
var BlockType;
(function (BlockType) {
    BlockType[BlockType["mine"] = 0] = "mine";
    BlockType[BlockType["number"] = 1] = "number";
    BlockType[BlockType["void"] = 2] = "void";
})(BlockType || (BlockType = {}));
var GameStatus;
(function (GameStatus) {
    GameStatus[GameStatus["run"] = 0] = "run";
    GameStatus[GameStatus["win"] = 1] = "win";
    GameStatus[GameStatus["lose"] = 2] = "lose";
})(GameStatus || (GameStatus = {}));
var game = new app();
