export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Cell {
    x: number;
    y: number;
}

export interface SnakeGame {
    width: number;
    height: number;
    snake: Cell[];
    direction: Direction;
    pending: Direction;
    food: Cell;
    score: number;
    alive: boolean;
    won: boolean;
}

const OPPOSITE: Record<Direction, Direction> = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
};

export function isDirection(value: unknown): value is Direction {
    return value === 'up' || value === 'down' || value === 'left' || value === 'right';
}

export function createSnakeGame(width = 12, height = 12, random: () => number = Math.random): SnakeGame {
    const midY = Math.floor(height / 2);
    const startX = Math.floor(width / 2);
    const game: SnakeGame = {
        width: width,
        height: height,
        snake: [
            { x: startX, y: midY },
            { x: startX - 1, y: midY },
            { x: startX - 2, y: midY },
        ],
        direction: 'right',
        pending: 'right',
        food: { x: 0, y: 0 },
        score: 0,
        alive: true,
        won: false,
    };
    const food = placeFood(game, random);
    if (food) {
        game.food = food;
    }
    return game;
}

export function turnSnake(game: SnakeGame, next: Direction): SnakeGame {
    if (!game.alive) {
        return game;
    }
    if (next === OPPOSITE[game.direction]) {
        return game;
    }
    return {
        ...game,
        pending: next,
    };
}

export function stepSnake(game: SnakeGame, random: () => number = Math.random): SnakeGame {
    if (!game.alive) {
        return game;
    }

    const direction = game.pending;
    const head = game.snake[0];
    const nextHead = move(head, direction);
    if (nextHead.x < 0 || nextHead.y < 0 || nextHead.x >= game.width || nextHead.y >= game.height) {
        return {
            ...game,
            direction: direction,
            alive: false,
        };
    }

    const eating = nextHead.x === game.food.x && nextHead.y === game.food.y;
    const body = eating ? game.snake : game.snake.slice(0, -1);
    for (const cell of body) {
        if (cell.x === nextHead.x && cell.y === nextHead.y) {
            return {
                ...game,
                direction: direction,
                alive: false,
            };
        }
    }

    const snake = [nextHead, ...body];
    if (!eating) {
        return {
            ...game,
            snake: snake,
            direction: direction,
            pending: direction,
        };
    }

    const grown: SnakeGame = {
        ...game,
        snake: snake,
        direction: direction,
        pending: direction,
        score: game.score + 1,
    };
    const food = placeFood(grown, random);
    if (!food) {
        return {
            ...grown,
            alive: false,
            won: true,
        };
    }
    return {
        ...grown,
        food: food,
    };
}

export function nextHighScore(stored: number, score: number): number {
    if (score > stored) {
        return score;
    }
    return stored;
}

export function tickDelay(score: number): number {
    const faster = Math.floor(score / 4) * 12;
    const delay = 170 - faster;
    if (delay < 70) {
        return 70;
    }
    return delay;
}

function move(cell: Cell, direction: Direction): Cell {
    if (direction === 'up') {
        return { x: cell.x, y: cell.y - 1 };
    }
    if (direction === 'down') {
        return { x: cell.x, y: cell.y + 1 };
    }
    if (direction === 'left') {
        return { x: cell.x - 1, y: cell.y };
    }
    return { x: cell.x + 1, y: cell.y };
}

function placeFood(game: SnakeGame, random: () => number): Cell | undefined {
    const free: Cell[] = [];
    for (let y = 0; y < game.height; y++) {
        for (let x = 0; x < game.width; x++) {
            let occupied = false;
            for (const cell of game.snake) {
                if (cell.x === x && cell.y === y) {
                    occupied = true;
                    break;
                }
            }
            if (!occupied) {
                free.push({ x: x, y: y });
            }
        }
    }
    if (free.length === 0) {
        return undefined;
    }
    let index = Math.floor(random() * free.length);
    if (index >= free.length) {
        index = free.length - 1;
    }
    if (index < 0) {
        index = 0;
    }
    return free[index];
}
