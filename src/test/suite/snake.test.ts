import * as assert from 'assert';
import { createSnakeGame, nextHighScore, stepSnake, tickDelay, turnSnake } from '../../games/snake/snake';

suite('Snake rules', () => {
    test('starts alive, length 3, moving right', () => {
        const game = createSnakeGame(8, 8, () => 0);
        assert.strictEqual(game.alive, true);
        assert.strictEqual(game.snake.length, 3);
        assert.strictEqual(game.direction, 'right');
        assert.strictEqual(game.food.x, 0);
        assert.strictEqual(game.food.y, 0);
    });

    test('steps forward and refuses to reverse', () => {
        const started = createSnakeGame(8, 8, () => 0);
        const head = started.snake[0];
        const reversed = turnSnake(started, 'left');
        const stepped = stepSnake(reversed, () => 0);
        assert.strictEqual(stepped.snake[0].x, head.x + 1);
        assert.strictEqual(stepped.snake[0].y, head.y);
        assert.strictEqual(stepped.snake.length, 3);
    });

    test('turns up on the next step', () => {
        const started = createSnakeGame(8, 8, () => 0);
        const head = started.snake[0];
        const turned = turnSnake(started, 'up');
        const stepped = stepSnake(turned, () => 0);
        assert.strictEqual(stepped.snake[0].x, head.x);
        assert.strictEqual(stepped.snake[0].y, head.y - 1);
        assert.strictEqual(stepped.direction, 'up');
    });

    test('grows and scores when the head reaches food', () => {
        const started = createSnakeGame(8, 8, () => 0);
        started.food = {
            x: started.snake[0].x + 1,
            y: started.snake[0].y,
        };
        const stepped = stepSnake(started, () => 0);
        assert.strictEqual(stepped.score, 1);
        assert.strictEqual(stepped.snake.length, 4);
        assert.strictEqual(stepped.alive, true);
    });

    test('dies on the wall', () => {
        const started = createSnakeGame(8, 8, () => 0);
        let game = started;
        for (let i = 0; i < 8; i++) {
            game = stepSnake(game, () => 0);
        }
        assert.strictEqual(game.alive, false);
        assert.strictEqual(game.won, false);
    });

    test('dies when the head hits the body', () => {
        const started = createSnakeGame(8, 8, () => 0);
        started.snake = [
            { x: 2, y: 2 },
            { x: 2, y: 3 },
            { x: 3, y: 3 },
            { x: 3, y: 2 },
            { x: 3, y: 1 },
        ];
        started.direction = 'up';
        started.pending = 'right';
        started.food = { x: 0, y: 0 };
        const stepped = stepSnake(started, () => 0);
        assert.strictEqual(stepped.alive, false);
    });

    test('moving into the tail is allowed because the tail leaves', () => {
        const started = createSnakeGame(8, 8, () => 0);
        started.snake = [
            { x: 2, y: 2 },
            { x: 3, y: 2 },
            { x: 3, y: 3 },
            { x: 2, y: 3 },
        ];
        started.direction = 'down';
        started.pending = 'down';
        started.food = { x: 0, y: 0 };
        const stepped = stepSnake(started, () => 0);
        assert.strictEqual(stepped.alive, true);
        assert.strictEqual(stepped.snake[0].x, 2);
        assert.strictEqual(stepped.snake[0].y, 3);
    });

    test('high score only moves up', () => {
        assert.strictEqual(nextHighScore(3, 5), 5);
        assert.strictEqual(nextHighScore(5, 2), 5);
    });

    test('tick speeds up and then stops getting faster', () => {
        assert.strictEqual(tickDelay(0), 170);
        assert.strictEqual(tickDelay(4), 158);
        assert.strictEqual(tickDelay(100), 70);
    });
});
