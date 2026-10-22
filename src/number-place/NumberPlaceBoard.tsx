import { type KeyboardEvent, useState } from "react";

import { type Board } from "./numberPlace";
import type { Cell } from "./useNumberPlaceState";

type NumberPlaceBoardProps = {
  cells: Cell[][];
  isVerifyResultVisible: boolean;
  solutionBoard: Board;
  onInput: (rowIndex: number, columnIndex: number, value: string) => void;
};

export function NumberPlaceBoard({
  cells,
  isVerifyResultVisible,
  solutionBoard,
  onInput,
}: NumberPlaceBoardProps) {
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const selected = selectedCell ? cells[selectedCell[0]][selectedCell[1]] : null;
  const canEdit = selected !== null && !selected.fixed;
  const activeCell = hoveredCell ?? (canEdit ? selectedCell : null);
  const blockedDigits = new Set<number>();
  if (selectedCell && canEdit) {
    const [selectedRow, selectedColumn] = selectedCell;
    cells.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if (
          cell.fixed &&
          cell.value !== 0 &&
          (rowIndex === selectedRow ||
            columnIndex === selectedColumn ||
            (Math.floor(rowIndex / 3) === Math.floor(selectedRow / 3) &&
              Math.floor(columnIndex / 3) === Math.floor(selectedColumn / 3)))
        ) {
          blockedDigits.add(cell.value);
        }
      });
    });
  }

  function enterDigit(value: string) {
    if (selectedCell && canEdit && !blockedDigits.has(Number(value))) {
      onInput(selectedCell[0], selectedCell[1], value);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.ctrlKey || event.metaKey || event.altKey || event.nativeEvent.isComposing) return;
    if (/^[1-9]$/.test(event.key)) {
      event.preventDefault();
      enterDigit(event.key);
    } else if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      enterDigit("");
    }
  }

  return (
    <>
      <div
        className="border-foreground/50 grid aspect-square w-full max-w-xl grid-cols-9 grid-rows-9 border-2"
        onPointerLeave={() => setHoveredCell(null)}
      >
        {cells.map((row, rowIndex) =>
          row.map((cell, columnIndex) => {
            const isHighlighted =
              activeCell !== null &&
              (rowIndex === activeCell[0] ||
                columnIndex === activeCell[1] ||
                (Math.floor(rowIndex / 3) === Math.floor(activeCell[0] / 3) &&
                  Math.floor(columnIndex / 3) === Math.floor(activeCell[1] / 3)));
            const isWrongVisible =
              isVerifyResultVisible &&
              cell.value !== 0 &&
              solutionBoard[rowIndex][columnIndex] !== cell.value &&
              !cell.fixed;
            const isCorrectVisible =
              isVerifyResultVisible &&
              cell.value !== 0 &&
              solutionBoard[rowIndex][columnIndex] === cell.value &&
              !cell.fixed;

            return (
              <div
                key={`${rowIndex}-${columnIndex}`}
                onPointerEnter={() => {
                  if (!cell.fixed) {
                    setHoveredCell([rowIndex, columnIndex]);
                  }
                }}
                className={[
                  "border-foreground/50 min-h-0 min-w-0 border",
                  rowIndex > 0 && rowIndex % 3 === 0 && "border-t-2",
                  columnIndex > 0 && columnIndex % 3 === 0 && "border-l-2",
                  cell.fixed && !isHighlighted && "bg-gray-200 dark:bg-gray-800",
                  canEdit &&
                    selectedCell?.[0] === rowIndex &&
                    selectedCell?.[1] === columnIndex &&
                    "outline-2 -outline-offset-2 outline-blue-500",
                  isHighlighted &&
                    !isWrongVisible &&
                    !isCorrectVisible &&
                    (cell.fixed ? "bg-blue-200 dark:bg-blue-800" : "bg-blue-100 dark:bg-blue-900"),
                  isWrongVisible && "bg-red-900 text-red-100",
                  isCorrectVisible && "bg-green-900 text-green-100",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <input
                  inputMode="none"
                  readOnly
                  className="size-full bg-transparent text-center text-3xl"
                  value={cell.value === 0 ? "" : String(cell.value)}
                  onFocus={() => {
                    setHoveredCell(null);
                    setSelectedCell([rowIndex, columnIndex]);
                  }}
                  onClick={() => {
                    setHoveredCell(null);
                    setSelectedCell([rowIndex, columnIndex]);
                  }}
                  onKeyDown={handleKeyDown}
                  disabled={cell.fixed}
                />
              </div>
            );
          }),
        )}
      </div>
      <div onKeyDown={handleKeyDown} className="grid w-full max-w-xl grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <button
            key={digit}
            type="button"
            disabled={!canEdit || blockedDigits.has(digit)}
            onClick={() => enterDigit(String(digit))}
            className="disabled:bg-foreground/3 disabled:text-foreground/50 dark:disabled:bg-foreground/3 dark:disabled:text-foreground/50 cursor-pointer rounded bg-green-100 px-4 py-2 text-sm font-medium text-green-900 disabled:cursor-not-allowed disabled:active:translate-y-0 motion-safe:transition motion-safe:active:translate-y-px dark:bg-green-900 dark:text-green-100"
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          disabled={!canEdit || selected?.value === 0}
          onClick={() => enterDigit("")}
          className="disabled:bg-foreground/3 disabled:text-foreground/50 dark:disabled:bg-foreground/3 dark:disabled:text-foreground/50 cursor-pointer rounded bg-red-100 px-4 py-2 text-sm font-medium text-red-900 disabled:cursor-not-allowed disabled:active:translate-y-0 motion-safe:transition motion-safe:active:translate-y-px dark:bg-red-900 dark:text-red-100"
        >
          Clear
        </button>
      </div>
    </>
  );
}
