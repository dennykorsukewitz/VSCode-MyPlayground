import * as vscode from 'vscode';
import { SnakeViewProvider } from './games/snake/snakeView';
import { ScoresViewProvider } from './scores/scoresView';

export function activate(context: vscode.ExtensionContext): void {
    const scores = new ScoresViewProvider(context);
    const snake = new SnakeViewProvider(context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(ScoresViewProvider.viewId, scores),
        vscode.window.registerWebviewViewProvider(SnakeViewProvider.viewId, snake),
        vscode.commands.registerCommand('myPlayground.showScores', () => {
            void vscode.commands.executeCommand('myPlayground.scores.focus');
        }),
        vscode.commands.registerCommand('myPlayground.snake.newGame', () => {
            snake.newGame();
        }),
    );
}

export function deactivate(): void {
}
