import { useState } from "react";

import type { Difficulty } from "./numberPlace";

type NumberPlaceControlsProps = {
  difficulty: Difficulty;
  onNewGame: (difficulty: Difficulty) => void;
  onReset: () => void;
  isVerifyResultVisible: boolean;
  onToggleVerifyResultVisibility: () => void;
};

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

export function NumberPlaceControls({
  difficulty,
  onNewGame,
  onReset,
  isVerifyResultVisible,
  onToggleVerifyResultVisibility,
}: NumberPlaceControlsProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState(difficulty);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <label>
        <span className="text-sm font-medium">Difficulty:</span>{" "}
        <select
          className="bg-foreground/3 rounded px-2 py-1"
          value={selectedDifficulty}
          onChange={(event) => setSelectedDifficulty(event.target.value as Difficulty)}
        >
          {DIFFICULTIES.map((difficultyOption) => (
            <option
              key={difficultyOption}
              value={difficultyOption}
              className="bg-background text-foreground"
            >
              {difficultyOption.charAt(0).toUpperCase() + difficultyOption.slice(1)}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        className="cursor-pointer rounded bg-green-100 px-4 py-2 text-sm font-medium text-green-900 motion-safe:transition motion-safe:active:translate-y-px dark:bg-green-900 dark:text-green-100"
        onClick={() => onNewGame(selectedDifficulty)}
      >
        New Game
      </button>

      <button
        type="button"
        className="cursor-pointer rounded bg-red-100 px-4 py-2 text-sm font-medium text-red-900 motion-safe:transition motion-safe:active:translate-y-px dark:bg-red-900 dark:text-red-100"
        onClick={onReset}
      >
        Reset
      </button>

      <button
        type="button"
        className="cursor-pointer rounded bg-green-100 px-4 py-2 text-sm font-medium text-green-900 motion-safe:transition motion-safe:active:translate-y-px dark:bg-green-900 dark:text-green-100"
        onClick={onToggleVerifyResultVisibility}
      >
        {isVerifyResultVisible ? "Hide Result" : "Verify"}
      </button>
    </div>
  );
}
