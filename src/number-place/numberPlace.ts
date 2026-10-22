export type Board = number[][];

const GRID_SIZE = 9;
const BOX_SIZE = 3;

const createZeroBasedIndices = (length: number) => Array.from({ length }, (_, index) => index);

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

export function emptyBoard(): Board {
  return Array.from({ length: GRID_SIZE }, () => Array<number>(GRID_SIZE).fill(0));
}

function isSafe(board: Board, rowIndex: number, columnIndex: number, value: number): boolean {
  for (let index = 0; index < GRID_SIZE; index++) {
    if (board[rowIndex][index] === value) return false;
    if (board[index][columnIndex] === value) return false;
  }
  const boxRow = Math.floor(rowIndex / BOX_SIZE) * BOX_SIZE;
  const boxColumn = Math.floor(columnIndex / BOX_SIZE) * BOX_SIZE;
  for (let rowOffset = 0; rowOffset < BOX_SIZE; rowOffset++) {
    for (let columnOffset = 0; columnOffset < BOX_SIZE; columnOffset++) {
      if (board[boxRow + rowOffset][boxColumn + columnOffset] === value) return false;
    }
  }
  return true;
}

function findEmpty(board: Board): [number, number] | null {
  for (let rowIndex = 0; rowIndex < GRID_SIZE; rowIndex++) {
    for (let columnIndex = 0; columnIndex < GRID_SIZE; columnIndex++) {
      if (board[rowIndex][columnIndex] === 0) return [rowIndex, columnIndex];
    }
  }
  return null;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

// Fills the board in place; restores it if no solution exists.
function solve(board: Board): boolean {
  const empty = findEmpty(board);
  if (!empty) return true;
  const [rowIndex, columnIndex] = empty;
  for (const candidate of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    if (isSafe(board, rowIndex, columnIndex, candidate)) {
      board[rowIndex][columnIndex] = candidate;
      if (solve(board)) return true;
      board[rowIndex][columnIndex] = 0;
    }
  }
  return false;
}

// Temporarily changes cells, restoring them before returning.
// Finding two solutions is enough to rule out uniqueness.
function isUniqueSolution(board: Board): boolean {
  const countSolutionPaths = (current: Board, limit: number): number => {
    let nextCell: [number, number, number[]] | null = null;
    for (let rowIndex = 0; rowIndex < GRID_SIZE; rowIndex++) {
      for (let columnIndex = 0; columnIndex < GRID_SIZE; columnIndex++) {
        if (current[rowIndex][columnIndex] !== 0) continue;
        const candidates = candidatesFor(current, rowIndex, columnIndex);
        if (candidates.length === 0) return 0;
        if (!nextCell || candidates.length < nextCell[2].length) {
          nextCell = [rowIndex, columnIndex, candidates];
        }
      }
    }
    if (!nextCell) return 1;
    const [rowIndex, columnIndex, candidates] = nextCell;
    let count = 0;
    for (const candidate of candidates) {
      current[rowIndex][columnIndex] = candidate;
      count += countSolutionPaths(current, limit);
      if (count >= limit) {
        current[rowIndex][columnIndex] = 0;
        return count;
      }
      current[rowIndex][columnIndex] = 0;
    }
    return count;
  };

  return countSolutionPaths(board, 2) === 1;
}

function generateFullBoard(): Board {
  const board = emptyBoard();
  const firstRowSeed = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  for (let columnIndex = 0; columnIndex < GRID_SIZE; columnIndex++) {
    board[0][columnIndex] = firstRowSeed[columnIndex];
  }
  solve(board);
  return board;
}

export type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

function candidatesFor(board: Board, rowIndex: number, columnIndex: number): number[] {
  const candidates: number[] = [];
  for (let value = 1; value <= GRID_SIZE; value++) {
    if (isSafe(board, rowIndex, columnIndex, value)) candidates.push(value);
  }
  return candidates;
}

type LogicalMove = [rowIndex: number, columnIndex: number, value: number];

function findNakedSingle(board: Board): LogicalMove | null {
  for (let rowIndex = 0; rowIndex < GRID_SIZE; rowIndex++) {
    for (let columnIndex = 0; columnIndex < GRID_SIZE; columnIndex++) {
      if (board[rowIndex][columnIndex] !== 0) continue;
      const candidates = candidatesFor(board, rowIndex, columnIndex);
      if (candidates.length === 1) return [rowIndex, columnIndex, candidates[0]];
    }
  }
  return null;
}

function findHiddenSingleInCells(board: Board, cells: Array<[number, number]>): LogicalMove | null {
  for (let value = 1; value <= GRID_SIZE; value++) {
    const availableCells = cells.filter(
      ([rowIndex, columnIndex]) =>
        board[rowIndex][columnIndex] === 0 &&
        candidatesFor(board, rowIndex, columnIndex).includes(value),
    );
    if (availableCells.length === 1) return [...availableCells[0], value];
  }
  return null;
}

function findHiddenSingle(board: Board): LogicalMove | null {
  for (let index = 0; index < GRID_SIZE; index++) {
    const row = createZeroBasedIndices(GRID_SIZE).map(
      (columnIndex) => [index, columnIndex] as [number, number],
    );
    const column = createZeroBasedIndices(GRID_SIZE).map(
      (rowIndex) => [rowIndex, index] as [number, number],
    );
    const rowMove = findHiddenSingleInCells(board, row);
    if (rowMove) return rowMove;
    const columnMove = findHiddenSingleInCells(board, column);
    if (columnMove) return columnMove;
  }

  for (let boxRow = 0; boxRow < BOX_SIZE; boxRow++) {
    for (let boxColumn = 0; boxColumn < BOX_SIZE; boxColumn++) {
      const cells: Array<[number, number]> = [];
      for (let rowOffset = 0; rowOffset < BOX_SIZE; rowOffset++) {
        for (let columnOffset = 0; columnOffset < BOX_SIZE; columnOffset++) {
          cells.push([boxRow * BOX_SIZE + rowOffset, boxColumn * BOX_SIZE + columnOffset]);
        }
      }
      const move = findHiddenSingleInCells(board, cells);
      if (move) return move;
    }
  }
  return null;
}

function canSolveLogically(board: Board, includeHiddenSingles: boolean): boolean {
  const workingBoard = cloneBoard(board);
  while (findEmpty(workingBoard)) {
    const move = findNakedSingle(workingBoard);
    const nextMove = move ?? (includeHiddenSingles ? findHiddenSingle(workingBoard) : null);
    if (!nextMove) return false;
    const [rowIndex, columnIndex, value] = nextMove;
    workingBoard[rowIndex][columnIndex] = value;
  }
  return true;
}

export function rateDifficulty(board: Board): Difficulty {
  if (canSolveLogically(board, false)) return "easy";
  if (canSolveLogically(board, true)) return "medium";
  return "hard";
}

export function generatePuzzle(difficulty: Difficulty = "easy"): {
  puzzle: Board;
  solution: Board;
} {
  while (true) {
    const full = generateFullBoard();
    const puzzle = cloneBoard(full);
    const cellPositions = shuffle(createZeroBasedIndices(GRID_SIZE * GRID_SIZE));

    for (const positionIndex of cellPositions) {
      const rowIndex = Math.floor(positionIndex / GRID_SIZE);
      const columnIndex = positionIndex % GRID_SIZE;
      const backup = puzzle[rowIndex][columnIndex];
      puzzle[rowIndex][columnIndex] = 0;

      if (!isUniqueSolution(cloneBoard(puzzle))) {
        puzzle[rowIndex][columnIndex] = backup;
        continue;
      }

      const generatedDifficulty = rateDifficulty(puzzle);
      if (DIFFICULTIES.indexOf(generatedDifficulty) > DIFFICULTIES.indexOf(difficulty)) {
        puzzle[rowIndex][columnIndex] = backup;
      }
    }

    if (rateDifficulty(puzzle) === difficulty) return { puzzle, solution: full };
  }
}
