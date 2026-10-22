export const WIDTH = 360;
const BOARD_ASPECT_RATIO = 14 / 9;
export const HEIGHT = WIDTH * BOARD_ASPECT_RATIO;
export const PADDLE_WIDTH = WIDTH / 5;
export const PADDLE_HEIGHT = HEIGHT / 50;
export const PADDLE_Y = HEIGHT * 0.9;
export const BALL_RADIUS = WIDTH / 100;
export const ROWS = 14;
export const COLUMNS = 8;
export const BRICK_COUNT = ROWS * COLUMNS;
const BRICK_GAP = WIDTH / 100;
const BRICK_MARGIN = WIDTH * 0.05;
export const BRICK_WIDTH = (WIDTH - BRICK_MARGIN * 2 - BRICK_GAP * (COLUMNS - 1)) / COLUMNS;
export const BRICK_HEIGHT = HEIGHT / 50;
const PADDLE_SPEED = WIDTH * 0.5;
const MAX_BALL_SPEED = WIDTH * 0.5;
const BALL_SPEED_INCREMENT = WIDTH * 0.005;
const MIN_BALL_X_SPEED = WIDTH * 0.1;

export type Status = "ready" | "playing" | "paused" | "won" | "lost";
export type Brick = { x: number; y: number; id: number };
export type Game = {
  status: Status;
  lives: number;
  paddle: number;
  ball: { x: number; y: number; vx: number; vy: number };
  bricks: Brick[];
};

function createBall(x: number) {
  return { x, y: PADDLE_Y - BALL_RADIUS * 2, vx: WIDTH * 0.2, vy: -WIDTH * 0.4 };
}

export function createGame(): Game {
  return {
    status: "ready",
    lives: 3,
    paddle: WIDTH / 2,
    ball: createBall(WIDTH / 2),
    bricks: Array.from({ length: BRICK_COUNT }, (_, id) => ({
      id,
      x: BRICK_MARGIN + (id % COLUMNS) * (BRICK_WIDTH + BRICK_GAP),
      y: HEIGHT * 0.1 + Math.floor(id / COLUMNS) * (BRICK_HEIGHT + BRICK_GAP),
    })),
  };
}

export function movePaddle(game: Game, x: number): Game {
  const halfWidth = PADDLE_WIDTH / 2;
  const paddle = Math.max(halfWidth, Math.min(WIDTH - halfWidth, x));
  return {
    ...game,
    paddle,
    ball: game.status === "ready" ? { ...game.ball, x: paddle } : game.ball,
  };
}

export function togglePlay(game: Game): Game {
  if (game.status === "won" || game.status === "lost") return game;
  return { ...game, status: game.status === "playing" ? "paused" : "playing" };
}

// Small physics steps prevent the ball from passing through thin blocks.
export function advance(game: Game, elapsed: number, direction = 0): Game {
  if (game.status !== "playing") return game;
  let next = { ...game, ball: { ...game.ball } };
  const steps = Math.ceil(Math.min(elapsed, 0.05) * 240);
  if (steps <= 0) return game;
  const dt = Math.min(elapsed, 0.05) / steps;
  for (let step = 0; step < steps; step++) {
    next = movePaddle(next, next.paddle + direction * PADDLE_SPEED * dt);
    const ball = next.ball;
    const previousY = ball.y;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    if (ball.x < BALL_RADIUS || ball.x > WIDTH - BALL_RADIUS) {
      ball.x = Math.max(BALL_RADIUS, Math.min(WIDTH - BALL_RADIUS, ball.x));
      ball.vx *= -1;
    }
    if (ball.y < BALL_RADIUS) {
      ball.y = BALL_RADIUS;
      ball.vy = Math.abs(ball.vy);
    }
    if (
      ball.vy > 0 &&
      previousY + BALL_RADIUS <= PADDLE_Y &&
      ball.y + BALL_RADIUS >= PADDLE_Y &&
      ball.x + BALL_RADIUS >= next.paddle - PADDLE_WIDTH / 2 &&
      ball.x - BALL_RADIUS <= next.paddle + PADDLE_WIDTH / 2
    ) {
      const offset = Math.max(-1, Math.min(1, (ball.x - next.paddle) / (PADDLE_WIDTH / 2)));
      const speed = Math.min(MAX_BALL_SPEED, Math.hypot(ball.vx, ball.vy) + BALL_SPEED_INCREMENT);
      ball.vx = Math.sin(offset * (Math.PI / 3)) * speed;
      if (Math.abs(ball.vx) < MIN_BALL_X_SPEED)
        ball.vx = ball.vx < 0 ? -MIN_BALL_X_SPEED : MIN_BALL_X_SPEED;
      ball.vy = -Math.sqrt(speed * speed - ball.vx * ball.vx);
      ball.y = PADDLE_Y - BALL_RADIUS;
    }
    for (const brick of next.bricks) {
      const closestX = Math.max(brick.x, Math.min(brick.x + BRICK_WIDTH, ball.x));
      const closestY = Math.max(brick.y, Math.min(brick.y + BRICK_HEIGHT, ball.y));
      if ((ball.x - closestX) ** 2 + (ball.y - closestY) ** 2 > BALL_RADIUS ** 2) continue;
      if (previousY <= brick.y || previousY >= brick.y + BRICK_HEIGHT) {
        ball.vy *= -1;
        ball.y =
          previousY <= brick.y ? brick.y - BALL_RADIUS : brick.y + BRICK_HEIGHT + BALL_RADIUS;
      } else {
        ball.vx *= -1;
        ball.x =
          ball.x < brick.x + BRICK_WIDTH / 2
            ? brick.x - BALL_RADIUS
            : brick.x + BRICK_WIDTH + BALL_RADIUS;
      }
      next.bricks = next.bricks.filter(({ id }) => id !== brick.id);
      if (next.bricks.length === 0) {
        next.status = "won";
        return next;
      }
      break;
    }
    if (ball.y - BALL_RADIUS > HEIGHT) {
      next.lives -= 1;
      next.status = next.lives === 0 ? "lost" : "ready";
      next.ball = createBall(next.paddle);
      return next;
    }
  }
  return next;
}
