import * as assert from 'assert';
import { PLAYGROUND_GAMES } from '../../games/registry';
import { normalizeScore, rowsFromStored, scoreRows } from '../../scores/scoreboard';

suite('Scoreboard', () => {
    test('lists every registered game', () => {
        const rows = scoreRows(PLAYGROUND_GAMES, { snake: 7 });
        assert.strictEqual(rows.length, PLAYGROUND_GAMES.length);
        assert.strictEqual(rows[0].id, 'snake');
        assert.strictEqual(rows[0].title, 'Snake');
        assert.strictEqual(rows[0].score, 7);
        assert.strictEqual(rows[0].viewId, 'myPlayground.snake');
    });

    test('missing and invalid scores read as zero', () => {
        assert.strictEqual(normalizeScore(undefined), 0);
        assert.strictEqual(normalizeScore(-3), 0);
        assert.strictEqual(normalizeScore('4'), 0);
        const rows = rowsFromStored(() => {
            return undefined;
        });
        assert.strictEqual(rows[0].score, 0);
    });

    test('reads the stored key for each game', () => {
        const rows = rowsFromStored((key) => {
            if (key === 'myPlayground.snakeHighScore') {
                return 12;
            }
            return 0;
        });
        assert.strictEqual(rows[0].score, 12);
    });
});
