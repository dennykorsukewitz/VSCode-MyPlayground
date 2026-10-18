import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
    test('Extension activates without throwing', async () => {
        const extension = vscode.extensions.all.find((item) => {
            return item.packageJSON.name === 'MyPlayground';
        });
        assert.ok(extension);
        await extension.activate();
    });

    test('New game command is registered', async () => {
        const extension = vscode.extensions.all.find((item) => {
            return item.packageJSON.name === 'MyPlayground';
        });
        assert.ok(extension);
        await extension.activate();
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('myPlayground.snake.newGame'));
        assert.ok(commands.includes('myPlayground.showScores'));
    });
});
