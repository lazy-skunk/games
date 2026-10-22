import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent } from "react";

import { BreakoutView } from "./BreakoutView";
import { advance, createGame, movePaddle, togglePlay, WIDTH } from "./game";
import type { Game } from "./game";
function App() {
  const [game, setGame] = useState(createGame);
  const current = useRef(game);
  const board = useRef<HTMLDivElement>(null);
  const keys = useRef(new Set<string>());

  function update(next: Game) {
    current.current = next;
    setGame(next);
  }

  function play() {
    const next = current.current;
    update(
      next.status === "won" || next.status === "lost" ? togglePlay(createGame()) : togglePlay(next),
    );
    board.current?.focus({ preventScroll: true });
  }

  useEffect(() => {
    const release = (event: KeyboardEvent) => keys.current.delete(event.key);
    const pause = () => {
      keys.current.clear();
      if (current.current.status === "playing") {
        const next = { ...current.current, status: "paused" as const };
        current.current = next;
        setGame(next);
      }
    };
    const visibility = () => {
      if (document.hidden) pause();
    };
    window.addEventListener("keyup", release);
    window.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("keyup", release);
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => {
    if (game.status !== "playing") return;
    let frame: number;
    let previous: number | undefined;
    const tick = (time: number) => {
      const direction =
        Number(keys.current.has("ArrowRight")) - Number(keys.current.has("ArrowLeft"));
      const next = advance(
        current.current,
        previous === undefined ? 0 : (time - previous) / 1000,
        direction,
      );
      previous = time;
      current.current = next;
      setGame(next);
      if (next.status === "playing") frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [game.status]);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      keys.current.add(event.key);
      if (current.current.status === "ready")
        update(
          movePaddle(
            current.current,
            current.current.paddle + (event.key === "ArrowLeft" ? -1 : 1) * (WIDTH / 40),
          ),
        );
    }
    if ((event.key === " " || event.key === "Escape") && !event.repeat) {
      event.preventDefault();
      if (event.key === " " || current.current.status === "playing") play();
    }
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.target instanceof HTMLButtonElement) return;
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = event.currentTarget.getBoundingClientRect();
    update(movePaddle(current.current, ((event.clientX - rect.left) / rect.width) * WIDTH));
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" && event.buttons === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    update(movePaddle(current.current, ((event.clientX - rect.left) / rect.width) * WIDTH));
  };
  return (
    <BreakoutView
      game={game}
      boardRef={board}
      onPlay={play}
      onKeyDown={onKeyDown}
      onBlur={() => keys.current.clear()}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
    />
  );
}

export default App;
