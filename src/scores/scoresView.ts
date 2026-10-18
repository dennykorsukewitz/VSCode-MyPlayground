import * as vscode from 'vscode';
import { onScoresChanged, rowsFromStored, ScoreRow } from './scoreboard';

export class ScoresViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewId = 'myPlayground.scores';

    private view: vscode.WebviewView | undefined;

    constructor(private readonly context: vscode.ExtensionContext) {
        context.subscriptions.push(onScoresChanged(() => {
            this.post();
        }));
    }

    public resolveWebviewView(webviewView: vscode.WebviewView): void {
        this.view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
        };
        webviewView.webview.html = this.html(webviewView.webview);
        webviewView.webview.onDidReceiveMessage((message: { type?: string; viewId?: unknown }) => {
            if (message.type === 'openGame' && typeof message.viewId === 'string') {
                void vscode.commands.executeCommand(`${message.viewId}.focus`);
            }
        });
        webviewView.onDidDispose(() => {
            this.view = undefined;
        });
        webviewView.onDidChangeVisibility(() => {
            if (webviewView.visible) {
                this.post();
            }
        });
        this.post();
    }

    private rows(): ScoreRow[] {
        return rowsFromStored((key) => {
            return this.context.globalState.get(key);
        });
    }

    private post(): void {
        if (!this.view) {
            return;
        }
        void this.view.webview.postMessage({
            type: 'scores',
            rows: this.rows(),
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
<title>Scores</title>
<style>
    body {
        margin: 0;
        padding: 10px;
        color: var(--vscode-foreground);
        font-family: var(--vscode-font-family);
        font-size: var(--vscode-font-size);
    }
    h2 {
        margin: 0 0 8px;
        font-size: 1em;
        font-weight: 600;
    }
    ul {
        list-style: none;
        margin: 0;
        padding: 0;
    }
    li {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        padding: 6px 0;
        border-bottom: 1px solid var(--vscode-panel-border, rgba(127, 127, 127, 0.35));
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
        text-decoration: underline;
    }
    .score {
        font-variant-numeric: tabular-nums;
    }
    .empty {
        opacity: 0.75;
    }
</style>
</head>
<body>
    <h2>Scores</h2>
    <ul id="rows"></ul>
    <script nonce="${nonce}">
        const vscodeApi = acquireVsCodeApi();
        const list = document.getElementById('rows');

        window.addEventListener('message', function (event) {
            const message = event.data;
            if (!message || message.type !== 'scores') {
                return;
            }
            render(message.rows);
        });

        function render(rows) {
            list.textContent = '';
            if (!rows || rows.length === 0) {
                const item = document.createElement('li');
                item.className = 'empty';
                item.textContent = 'No games yet.';
                list.appendChild(item);
                return;
            }
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const item = document.createElement('li');
                const open = document.createElement('button');
                open.className = 'link';
                open.type = 'button';
                open.textContent = row.title;
                open.addEventListener('click', function () {
                    vscodeApi.postMessage({ type: 'openGame', viewId: row.viewId });
                });
                const score = document.createElement('span');
                score.className = 'score';
                score.textContent = String(row.score);
                item.appendChild(open);
                item.appendChild(score);
                list.appendChild(item);
            }
        }
    </script>
</body>
</html>`;
    }
}

function randomNonce(): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let value = '';
    for (let i = 0; i < 32; i++) {
        value += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return value;
}
