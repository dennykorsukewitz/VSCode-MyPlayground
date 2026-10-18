import * as vscode from 'vscode';
import { gameById } from '../registry';
import { notifyScoresChanged } from '../../scores/scoreboard';
import { createSnakeGame, isDirection, nextHighScore, SnakeGame, stepSnake, tickDelay, turnSnake } from './snake';

const SNAKE = gameById('snake');

export class SnakeViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewId = 'myPlayground.snake';

    private view: vscode.WebviewView | undefined;
    private game: SnakeGame = createSnakeGame();
    private timer: ReturnType<typeof setTimeout> | undefined;
    private highScore: number;

    constructor(private readonly context: vscode.ExtensionContext) {
        const stored = context.globalState.get<number>(storageKey(), 0);
        if (typeof stored === 'number' && stored > 0) {
            this.highScore = stored;
        } else {
            this.highScore = 0;
        }
    }

    public resolveWebviewView(webviewView: vscode.WebviewView): void {
        this.view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
        };
        webviewView.webview.html = this.html(webviewView.webview);
        webviewView.webview.onDidReceiveMessage((message: { type?: string; direction?: unknown }) => {
            this.onMessage(message);
        });
        webviewView.onDidDispose(() => {
            this.stop();
            this.view = undefined;
        });
        webviewView.onDidChangeVisibility(() => {
            if (webviewView.visible) {
                this.arm();
                this.post();
            } else {
                this.stop();
            }
        });
        this.post();
        this.arm();
    }

    public newGame(): void {
        this.game = createSnakeGame();
        this.post();
        this.stop();
        this.arm();
    }

    private onMessage(message: { type?: string; direction?: unknown }): void {
        if (message.type === 'turn' && isDirection(message.direction)) {
            this.game = turnSnake(this.game, message.direction);
            return;
        }
        if (message.type === 'restart') {
            this.newGame();
            return;
        }
        if (message.type === 'openScores') {
            void vscode.commands.executeCommand('myPlayground.scores.focus');
        }
    }

    private arm(): void {
        if (this.timer || !this.view || !this.view.visible || !this.game.alive) {
            return;
        }
        this.timer = setTimeout(() => {
            this.timer = undefined;
            this.tick();
            this.arm();
        }, tickDelay(this.game.score));
    }

    private stop(): void {
        if (!this.timer) {
            return;
        }
        clearTimeout(this.timer);
        this.timer = undefined;
    }

    private tick(): void {
        if (!this.game.alive) {
            return;
        }
        this.game = stepSnake(this.game);
        const stored = nextHighScore(this.highScore, this.game.score);
        if (stored !== this.highScore) {
            this.highScore = stored;
            void this.context.globalState.update(storageKey(), this.highScore);
            notifyScoresChanged();
        }
        this.post();
    }

    private post(): void {
        if (!this.view) {
            return;
        }
        void this.view.webview.postMessage({
            type: 'state',
            game: this.game,
            highScore: this.highScore,
        });
    }

    private html(webview: vscode.Webview): string {
        const nonce = randomNonce();
        const csp = webview.cspSource;
        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${csp} 'unsafe-inline'; script-src 'nonce-${nonce}';">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Snake</title>
<style>
    body {
        margin: 0;
        padding: 10px;
        color: var(--vscode-foreground);
        font-family: var(--vscode-font-family);
        font-size: var(--vscode-font-size);
    }
    .hud {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
    }
    .hud strong {
        color: var(--vscode-charts-green, #89d185);
    }
    .stage {
        position: relative;
    }
    #board {
        display: grid;
        gap: 2px;
        width: 100%;
        aspect-ratio: 1;
        background: var(--vscode-panel-border, rgba(127, 127, 127, 0.35));
        padding: 2px;
        box-sizing: border-box;
    }
    #board:focus {
        outline: 1px solid var(--vscode-focusBorder);
    }
    .cell {
        background: var(--vscode-editor-background);
        border-radius: 2px;
    }
    .cell.head {
        background: var(--vscode-charts-green, #89d185);
    }
    .cell.body {
        background: var(--vscode-charts-green, #89d185);
        opacity: 0.55;
    }
    .cell.food {
        background: var(--vscode-charts-orange, #e5a04b);
        border-radius: 50%;
    }
    .overlay {
        display: none;
        position: absolute;
        inset: 0;
        align-items: center;
        justify-content: center;
        text-align: center;
        background: color-mix(in srgb, var(--vscode-editor-background) 72%, transparent);
        font-weight: 600;
    }
    .overlay.show {
        display: flex;
    }
    .controls {
        display: grid;
        grid-template-columns: repeat(3, 36px);
        grid-template-rows: repeat(2, 32px);
        gap: 4px;
        justify-content: center;
        margin-top: 10px;
    }
    button {
        color: var(--vscode-button-foreground);
        background: var(--vscode-button-background);
        border: none;
        border-radius: 2px;
        cursor: pointer;
    }
    button:hover {
        background: var(--vscode-button-hoverBackground);
    }
    button.link {
        color: var(--vscode-textLink-foreground);
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        font: inherit;
    }
    button.link:hover {
        background: none;
        text-decoration: underline;
    }
    #up { grid-column: 2; }
    #left { grid-column: 1; }
    #down { grid-column: 2; }
    #right { grid-column: 3; }
    .hint {
        margin: 8px 0 0;
        opacity: 0.75;
        font-size: 0.85em;
        text-align: center;
    }
</style>
</head>
<body>
    <div class="hud">
        <span>Score <strong id="score">0</strong></span>
        <button id="scores" class="link" type="button">Scores</button>
        <span>Best <strong id="best">0</strong></span>
    </div>
    <div class="stage">
        <div id="board" tabindex="0"></div>
        <div id="overlay" class="overlay"></div>
    </div>
    <div class="controls">
        <button id="up" type="button" title="Up">↑</button>
        <button id="left" type="button" title="Left">←</button>
        <button id="down" type="button" title="Down">↓</button>
        <button id="right" type="button" title="Right">→</button>
    </div>
    <p class="hint">Click the board, then use arrow keys. Restart from the view title.</p>
    <script nonce="${nonce}">
        const vscodeApi = acquireVsCodeApi();
        const board = document.getElementById('board');
        const scoreNode = document.getElementById('score');
        const bestNode = document.getElementById('best');
        const overlay = document.getElementById('overlay');
        const buttons = {
            up: document.getElementById('up'),
            down: document.getElementById('down'),
            left: document.getElementById('left'),
            right: document.getElementById('right'),
        };

        function turn(direction) {
            vscodeApi.postMessage({ type: 'turn', direction: direction });
        }

        document.getElementById('scores').addEventListener('click', function () {
            vscodeApi.postMessage({ type: 'openScores' });
        });

        buttons.up.addEventListener('click', function () { turn('up'); });
        buttons.down.addEventListener('click', function () { turn('down'); });
        buttons.left.addEventListener('click', function () { turn('left'); });
        buttons.right.addEventListener('click', function () { turn('right'); });

        board.addEventListener('keydown', function (event) {
            const map = {
                ArrowUp: 'up',
                ArrowDown: 'down',
                ArrowLeft: 'left',
                ArrowRight: 'right',
                w: 'up',
                s: 'down',
                a: 'left',
                d: 'right',
            };
            const direction = map[event.key];
            if (!direction) {
                return;
            }
            event.preventDefault();
            turn(direction);
        });

        window.addEventListener('message', function (event) {
            const message = event.data;
            if (!message || message.type !== 'state') {
                return;
            }
            render(message.game, message.highScore);
        });

        function render(game, highScore) {
            scoreNode.textContent = String(game.score);
            bestNode.textContent = String(highScore);
            board.style.gridTemplateColumns = 'repeat(' + game.width + ', 1fr)';
            board.style.gridTemplateRows = 'repeat(' + game.height + ', 1fr)';
            const count = game.width * game.height;
            while (board.children.length < count) {
                board.appendChild(document.createElement('div'));
            }
            while (board.children.length > count) {
                board.removeChild(board.lastChild);
            }
            const kind = new Array(count).fill('cell');
            for (let i = 0; i < game.snake.length; i++) {
                const cell = game.snake[i];
                const index = cell.y * game.width + cell.x;
                kind[index] = i === 0 ? 'cell head' : 'cell body';
            }
            const foodIndex = game.food.y * game.width + game.food.x;
            if (foodIndex >= 0 && foodIndex < count) {
                kind[foodIndex] = 'cell food';
            }
            for (let i = 0; i < count; i++) {
                board.children[i].className = kind[i];
            }
            if (game.alive) {
                overlay.className = 'overlay';
                overlay.textContent = '';
            } else if (game.won) {
                overlay.className = 'overlay show';
                overlay.textContent = 'Board cleared';
            } else {
                overlay.className = 'overlay show';
                overlay.textContent = 'Crashed';
            }
        }

        board.focus();
    </script>
</body>
</html>`;
    }
}

function storageKey(): string {
    if (!SNAKE) {
        return 'myPlayground.snakeHighScore';
    }
    return SNAKE.storageKey;
}

function randomNonce(): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let value = '';
    for (let i = 0; i < 32; i++) {
        value += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return value;
}
