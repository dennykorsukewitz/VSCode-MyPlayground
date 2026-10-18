export interface PlaygroundGame {
    id: string;
    title: string;
    storageKey: string;
    viewId: string;
}

export const PLAYGROUND_GAMES: PlaygroundGame[] = [
    {
        id: 'snake',
        title: 'Snake',
        storageKey: 'myPlayground.snakeHighScore',
        viewId: 'myPlayground.snake',
    },
];

export function gameById(id: string): PlaygroundGame | undefined {
    for (const game of PLAYGROUND_GAMES) {
        if (game.id === id) {
            return game;
        }
    }
    return undefined;
}
