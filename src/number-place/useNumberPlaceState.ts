import { useState } from "react";

import { generatePuzzle, type Board, type Difficulty } from "./numberPlace";

export type Cell = {
  value: number;
  fixed: boolean;
};

type InternalState = {
  cells: Cell[][];
  initial: Board;
  solution: Board;
  difficulty: Difficulty;
};

function toCells(board: Board): Cell[][] {
  return board.map((row) => row.map((value) => ({ value, fixed: value !== 0 })));
}

function createGameState(difficulty: Difficulty): InternalState {
  const { puzzle, solution } = generatePuzzle(difficulty);
  return {
    cells: toCells(puzzle),
    initial: puzzle,
    solution,
    difficulty,
  };
}

export function useNumberPlaceState() {
  const defaultDifficulty: Difficulty = "easy";
  const [state, setState] = useState<InternalState>(() => createGameState(defaultDifficulty));
  const { cells, difficulty, solution: solutionBoard } = state;

  const [isVerifyResultVisible, setIsVerifyResultVisible] = useState(false);

  const hasUserEditsSinceStart = cells.some((row) =>
    row.some((cell) => !cell.fixed && cell.value !== 0),
  );

  function startNewGame(nextDifficulty: Difficulty) {
    setState(createGameState(nextDifficulty));
    setIsVerifyResultVisible(false);
  }

  function resetToInitialPuzzle() {
    setState((previousState) => ({
      ...previousState,
      cells: toCells(previousState.initial),
    }));
    setIsVerifyResultVisible(false);
  }

  function applyDigitInput(rowIndex: number, columnIndex: number, rawInput: string) {
    const digit = rawInput.replace(/[^1-9]/g, "").slice(0, 1);
    const value = digit ? parseInt(digit, 10) : 0;

    setIsVerifyResultVisible(false);
    setState((previousState) => {
      if (previousState.cells[rowIndex][columnIndex].fixed) {
        return previousState;
      }
      const nextCells = previousState.cells.map((cellRow, rowIndexValue) =>
        cellRow.map((cell, columnIndexValue) =>
          rowIndexValue === rowIndex && columnIndexValue === columnIndex
            ? { ...cell, value }
            : cell,
        ),
      );
      return { ...previousState, cells: nextCells };
    });
  }

  function toggleVerifyResultVisibility() {
    setIsVerifyResultVisible((previousValue) => !previousValue);
  }

  return {
    cells,
    difficulty,
    hasUserEditsSinceStart,
    isVerifyResultVisible,
    solutionBoard,
    applyDigitInput,
    startNewGame,
    resetToInitialPuzzle,
    toggleVerifyResultVisibility,
  };
}
