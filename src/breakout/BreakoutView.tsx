import type { ComponentProps, RefObject } from "react";
import { Link } from "react-router";

import {
  BALL_RADIUS,
  BRICK_COUNT,
  BRICK_HEIGHT,
  BRICK_WIDTH,
  HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_Y,
  WIDTH,
} from "./game";
import type { Game } from "./game";

type BreakoutViewProps = Pick<
  ComponentProps<"div">,
  "onKeyDown" | "onBlur" | "onPointerDown" | "onPointerMove"
> & {
  game: Game;
  boardRef: RefObject<HTMLDivElement | null>;
  onPlay: () => void;
};
const button =
  "cursor-pointer rounded px-4 py-2 text-sm font-medium motion-safe:transition motion-safe:active:translate-y-px";
const messages = {
  ready: "Ready",
  playing: "Playing",
  paused: "Paused",
  won: "Completed",
  lost: "Game over",
};

export function BreakoutView({
  game,
  boardRef,
  onPlay,
  onKeyDown,
  onBlur,
  onPointerDown,
  onPointerMove,
}: BreakoutViewProps) {
  const ended = game.status === "won" || game.status === "lost";
  const action = game.status === "paused" ? "Resume" : ended ? "Play again" : "Start";
  const title = game.status === "ready" && game.lives < 3 ? "Next ball" : messages[game.status];

  return (
    <div
      className="grid min-h-screen content-center justify-center p-4"
      style={{
        gridTemplateColumns: "minmax(0, min(calc(100vw - 2rem), calc((100svh - 15rem) * 9 / 14)))",
      }}
    >
      <header className="mb-2 flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-semibold">
          <Link to="/breakout">Breakout</Link>
        </h1>
        <dl className="bg-foreground/3 ml-auto rounded px-3 py-2 text-center text-sm tabular-nums">
          <dt className="text-xs">Lives</dt>
          <dd className="font-semibold">{game.lives}</dd>
        </dl>
      </header>
      <main>
        <div
          ref={boardRef}
          tabIndex={0}
          className="bg-foreground/3 relative touch-none overflow-hidden rounded outline-offset-4 focus-visible:outline-2 focus-visible:outline-blue-500"
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
        >
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="block w-full" aria-hidden="true">
            {game.bricks.map((brick) => (
              <rect
                key={brick.id}
                x={brick.x}
                y={brick.y}
                width={BRICK_WIDTH}
                height={BRICK_HEIGHT}
                rx="3"
                className="fill-blue-500"
              />
            ))}
            <rect
              x={game.paddle - PADDLE_WIDTH / 2}
              y={PADDLE_Y}
              width={PADDLE_WIDTH}
              height={PADDLE_HEIGHT}
              rx="3"
              className="fill-foreground"
            />
            <circle cx={game.ball.x} cy={game.ball.y} r={BALL_RADIUS} className="fill-foreground" />
          </svg>
          {game.status !== "playing" && (
            <div className="bg-background/50 absolute inset-0 flex flex-col items-center justify-center gap-3 rounded">
              <p>{title}</p>
              <button
                type="button"
                onClick={onPlay}
                className={`${button} bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100`}
              >
                {action}
              </button>
            </div>
          )}
        </div>

        <div className={`mt-2 flex justify-end${game.status === "playing" ? "" : " invisible"}`}>
          <button
            type="button"
            onClick={onPlay}
            className={`${button} bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100`}
          >
            Pause
          </button>
        </div>

        <section className="bg-foreground/3 mt-2 rounded p-2 text-sm">
          <h2 className="mb-1">How to play</h2>
          <p>Move: mouse, touch, or ← → with the board focused. Space: start/pause. Esc: pause.</p>
          <p>Clear all {BRICK_COUNT} bricks with 3 lives.</p>
        </section>
      </main>
    </div>
  );
}
