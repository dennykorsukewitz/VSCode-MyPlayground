import { PLAYGROUND_GAMES, PlaygroundGame } from '../games/registry';

export interface ScoreRow {
    id: string;
    title: string;
    viewId: string;
    score: number;
}

type ScoreListener = () => void;

const listeners: ScoreListener[] = [];

export function onScoresChanged(listener: ScoreListener): { dispose: () => void } {
    listeners.push(listener);
    return {
        dispose: () => {
            const index = listeners.indexOf(listener);
            if (index >= 0) {
                listeners.splice(index, 1);
            }
        },
    };
}

export function notifyScoresChanged(): void {
    for (const listener of listeners) {
        listener();
    }
}

export function normalizeScore(value: unknown): number {
    if (typeof value === 'number' && value > 0) {
        return value;
    }
    return 0;
}

export function scoreRows(games: PlaygroundGame[], scores: Record<string, number>): ScoreRow[] {
    const rows: ScoreRow[] = [];
    for (const game of games) {
        rows.push({
            id: game.id,
            title: game.title,
            viewId: game.viewId,
            score: normalizeScore(scores[game.id]),
        });
    }
    return rows;
}

export function rowsFromStored(read: (key: string) => unknown): ScoreRow[] {
    const scores: Record<string, number> = {};
    for (const game of PLAYGROUND_GAMES) {
        scores[game.id] = normalizeScore(read(game.storageKey));
    }
    return scoreRows(PLAYGROUND_GAMES, scores);
}
