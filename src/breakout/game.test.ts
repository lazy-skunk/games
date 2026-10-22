import { expect, test } from "vite-plus/test";

import {
  advance,
  BALL_RADIUS,
  BRICK_COUNT,
  BRICK_WIDTH,
  createGame,
  HEIGHT,
  movePaddle,
  PADDLE_WIDTH,
  PADDLE_Y,
  togglePlay,
  WIDTH,
} from "./game";

test("paddle stays inside the board and carries the ball before launch", () => {
  const left = movePaddle(createGame(), -100);
  expect(left.paddle).toBe(PADDLE_WIDTH / 2);
  expect(left.ball.x).toBe(left.paddle);
  expect(movePaddle(left, 1000).paddle).toBe(WIDTH - PADDLE_WIDTH / 2);
});

test("wall collisions reflect the ball without mutating the previous frame", () => {
  const game = togglePlay(createGame());
  game.ball = { x: BALL_RADIUS + 1, y: 300, vx: -160, vy: -320 };
  const next = advance(game, 0.02);
  expect(next.ball.vx).toBeGreaterThan(0);
  expect(next.ball.x).toBeGreaterThanOrEqual(BALL_RADIUS);
  expect(game.ball.vx).toBe(-160);
});

test("a paddle hit sends the ball upward and changes angle by impact position", () => {
  const game = togglePlay(createGame());
  game.ball = { x: game.paddle + PADDLE_WIDTH / 4, y: PADDLE_Y - BALL_RADIUS - 1, vx: 0, vy: 320 };
  const next = advance(game, 0.02);
  expect(next.ball.vy).toBeLessThan(0);
  expect(next.ball.vx).toBeGreaterThan(0);
  expect(next.lives).toBe(3);
});

test("hitting a brick removes only that brick and reflects", () => {
  const game = togglePlay(createGame());
  const brick = game.bricks[0];
  game.ball = { x: brick.x + BRICK_WIDTH / 2, y: brick.y - BALL_RADIUS - 1, vx: 0, vy: 300 };
  const next = advance(game, 0.02);
  expect(next.bricks).toHaveLength(BRICK_COUNT - 1);
  expect(next.ball.vy).toBeLessThan(0);
  expect(game.bricks).toHaveLength(BRICK_COUNT);
});

test("removing the final brick clears the game", () => {
  const game = togglePlay(createGame());
  game.bricks = [game.bricks[0]];
  const brick = game.bricks[0];
  game.ball = { x: brick.x + BRICK_WIDTH / 2, y: brick.y - BALL_RADIUS - 1, vx: 0, vy: 300 };
  const next = advance(game, 0.02);
  expect(next.status).toBe("won");
  expect(advance(next, 0.02)).toBe(next);
});

test("a miss consumes one life and waits for a new launch while preserving bricks", () => {
  const game = togglePlay(createGame());
  game.ball = { x: 10, y: HEIGHT + BALL_RADIUS, vx: 0, vy: 320 };
  const next = advance(game, 0.02);
  expect(next.lives).toBe(2);
  expect(next.status).toBe("ready");
  expect(next.ball.x).toBe(next.paddle);
  expect(next.bricks).toEqual(game.bricks);
});

test("missing with the last life ends the game", () => {
  const game = togglePlay(createGame());
  game.lives = 1;
  game.ball = { x: 10, y: HEIGHT + BALL_RADIUS, vx: 0, vy: 320 };
  const next = advance(game, 0.02);
  expect(next.status).toBe("lost");
  expect(next.lives).toBe(0);
  expect(togglePlay(next)).toBe(next);
});
