class app {
    private nbBlock: number;
    private nbMine: number;
    private appBoard: Element;
    private mess: HTMLElement;
    private blocks: Array<Array<Block>>;
    private gameStatus: GameStatus = GameStatus.run;
    private isDevMode = true;

    constructor(numberCase?: number, percentage: number = 12.5) {
        this.leftClickHandler = this.leftClickHandler.bind(this)
        this.rightClickHandler = this.rightClickHandler.bind(this)

        this.nbBlock = numberCase ?? 10;
        this.nbMine = Math.ceil(Math.pow(this.nbBlock, 2) * percentage / 100);

        this.appBoard = document.getElementById('main');
        this.mess = document.querySelector('.mess');
        this.blocks = [[]];

        this.init();
    }

    private init() {
        for (let i = 0; i < this.nbBlock; i++) {
            const r = document.createElement("div");
            r.classList.add("row");
            this.blocks.push(Array<Block>());
            for (let j = 0; j < this.nbBlock; j++) {
                const b = document.createElement("button");
                if (this.isDevMode) b.innerText = ".";
                r.appendChild(b);
                const block: Block = {
                    type: BlockType.void,
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
    }

    private setMines() {
        for (let i = 0; i < this.nbMine; i++) {
            let col = 0;
            let row = 0;
            let tryAgain = true;
            while (tryAgain) {
                col = Math.floor(Math.random() * (this.nbBlock - 1));
                row = Math.floor(Math.random() * (this.nbBlock - 1));
                if (this.blocks[col][row].type != BlockType.mine) tryAgain = false;
            }
            this.blocks[col][row].type = BlockType.mine;
            if (this.isDevMode) this.blocks[col][row].el.innerText = "X";
            this.setNumbers(col, row);
        }
    }

    private setNumbers(col: number, row: number) {
        let arroundBlocks = this.getArround(col, row);

        for (let i = 0; i < arroundBlocks.length; i++) {
            const b: Block = arroundBlocks[i];
            if (b.type !== BlockType.mine) {
                b.type = BlockType.number;
                b.number++;
                if (this.isDevMode) b.el.innerText = b.number.toString();
            }
        }

    }

    private getArround(col: number, row: number, diag: boolean = true) {
        let arroundBlocks = [];

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
    }

    private leftClickHandler(e: MouseEvent): void {
        const target = e.target;
        this.showBlocks((target as HTMLButtonElement));
        if (this.gameStatus == GameStatus.win) {
            this.mess.innerText = "Vous avez gagné";
        } else if (this.gameStatus == GameStatus.lose) {
            this.mess.innerText = "Vous avez appuyé sur une mine";
        }
    }
    
    private rightClickHandler(e: MouseEvent): void {
        e.preventDefault();
        const target = e.target;
        this.addFlag((target as HTMLButtonElement));
    }
    
    private showBlocks(target: HTMLButtonElement) {
        let {b, i, j} = this.findBlock(target);
        this.revealBlock(b);
        if (this.isAllReveal()) { this.gameStatus = GameStatus.win; }

        if (b.type == BlockType.mine) { 
            this.gameStatus = GameStatus.lose;
            this.revealAll();
        } else {
            if (b.type == BlockType.void) {
                let arroundBlock = this.getArround(i, j, false);
                arroundBlock.forEach((block) => {
                    if (block.type !== BlockType.mine && !block.isReveal) {
                        this.showBlocks(block.el);
                    }
                });
            }
        }
    }
    
    private addFlag(target: HTMLButtonElement) {
        let {b, i, j} = this.findBlock(target);
        this.toggleFlagBlock(b);
    }

    private revealBlock(b: Block) {
        b.isReveal = true;
        if (b.type == BlockType.mine) {
            b.el.innerHTML = "X";
            b.el.classList.add("mine");   
        } else if (b.type == BlockType.void) {
            b.el.innerHTML = ".";
        } else {
            b.el.innerHTML = b.number.toString();
        }
        if (b.isFlagged) {
            b.el.classList.remove("flag");
            b.isFlagged = false;
        }
        b.el.classList.add("reveal");
        b.el.removeEventListener('click',this.leftClickHandler);
        b.el.removeEventListener('contextmenu',this.rightClickHandler);
        b.el.addEventListener('contextmenu',(e) => e.preventDefault());
    }
    
    private toggleFlagBlock(b: Block) {
        if (!b.isFlagged) {
            b.isFlagged = true;
            b.el.classList.add("flag");
            b.el.innerHTML = "F";
        } else {
            b.isFlagged = false;
            b.el.classList.remove("flag");
            b.el.innerHTML = "";
        }
    }

    private revealAll() {
        this.blocks.forEach((row) => {
            row.forEach((b) => {
                this.revealBlock(b);
            })
        })
    }
    
    private isAllReveal() : boolean {
        for (let i = 0; i < this.blocks.length; i++) {
            for (let j = 0; j < this.blocks[i].length; j++) {
                if (!this.blocks[i][j].isReveal && this.blocks[i][j].type !== BlockType.mine) return false;
            }
        }
        return true;
    }

    private findBlock(target: HTMLButtonElement): BlockWithCoord {
        let b: Block;
        for (let i = 0; i < this.blocks.length; i++) {
            for (let j = 0; j < this.blocks[i].length; j++) {
                if (this.blocks[i][j].el === target) {
                    b = this.blocks[i][j];
                    return {
                        b,
                        i,
                        j
                    };
                }
            }
        }
    }
}

enum BlockType {
    mine,
    number,
    void
}

enum GameStatus {
    run,
    win,
    lose
}

interface Block {
    type: BlockType,
    isReveal: boolean,
    isFlagged: boolean,
    el: HTMLButtonElement,
    number: number,
}

interface BlockWithCoord {
    b: Block;
    i: number;
    j: number;
}


const game = new app();