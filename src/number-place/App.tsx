import { Link } from "react-router";

import { NumberPlaceBoard } from "./NumberPlaceBoard";
import { NumberPlaceControls } from "./NumberPlaceControls";
import { useNumberPlaceState } from "./useNumberPlaceState";

export default function App() {
  const {
    cells,
    difficulty,
    hasUserEditsSinceStart,
    applyDigitInput,
    startNewGame,
    resetToInitialPuzzle,
    isVerifyResultVisible,
    solutionBoard,
    toggleVerifyResultVisibility,
  } = useNumberPlaceState();

  const handleNewGame = (nextDifficulty: typeof difficulty) => {
    if (
      hasUserEditsSinceStart &&
      !window.confirm("Current entries will be lost. Start a new puzzle?")
    ) {
      return;
    }
    startNewGame(nextDifficulty);
  };

  const handleReset = () => {
    if (
      hasUserEditsSinceStart &&
      !window.confirm("Current entries will be lost. Reset the puzzle?")
    ) {
      return;
    }
    resetToInitialPuzzle();
  };

  const isComplete = cells.every((row, rowIndex) =>
    row.every((cell, columnIndex) => cell.value === solutionBoard[rowIndex][columnIndex]),
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-3">
      <header>
        <h1 className="text-lg font-semibold">
          <Link to="/number-place">Number Place</Link>
        </h1>
      </header>

      <main className="flex flex-col items-center gap-5">
        <NumberPlaceControls
          difficulty={difficulty}
          onNewGame={handleNewGame}
          onReset={handleReset}
          isVerifyResultVisible={isVerifyResultVisible}
          onToggleVerifyResultVisibility={toggleVerifyResultVisibility}
        />

        <NumberPlaceBoard
          cells={cells}
          onInput={applyDigitInput}
          isVerifyResultVisible={isVerifyResultVisible}
          solutionBoard={solutionBoard}
        />

        {isComplete && <p className="font-semibold">Completed</p>}
      </main>
    </div>
  );
}
