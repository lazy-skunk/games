// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vite-plus/test";

import { NumberPlaceBoard } from "./NumberPlaceBoard";

afterEach(cleanup);

function renderBoard(fixedCells: [number, number, number][] = []) {
  const cells = Array.from({ length: 9 }, (_, row) =>
    Array.from({ length: 9 }, (_, column) => ({
      value: row === 0 && column === 0 ? 1 : 0,
      fixed: row === 0 && column === 0,
    })),
  );
  cells[0][1].value = 2;
  fixedCells.forEach(([row, column, value]) => {
    cells[row][column] = { value, fixed: true };
  });
  const onInput = vi.fn();
  render(
    <NumberPlaceBoard
      cells={cells}
      solutionBoard={Array.from({ length: 9 }, () => Array<number>(9).fill(1))}
      isVerifyResultVisible={false}
      onInput={onInput}
    />,
  );
  return onInput;
}

function input(row: number, column: number) {
  return screen.getAllByRole("textbox")[(row - 1) * 9 + column - 1];
}

function cell(row: number, column: number) {
  return input(row, column).parentElement!;
}

function pointer(row: number, column: number, type = "pointerover") {
  const event = new MouseEvent(type, { bubbles: true });
  fireEvent(cell(row, column), event);
}

test("enters and clears the selected cell from the keypad after input focus leaves", () => {
  const onInput = renderBoard();
  const digit = screen.getByRole("button", { name: "7" }) as HTMLButtonElement;
  expect(digit.disabled).toBe(true);

  fireEvent.focus(input(1, 2));
  const selectedInput = input(1, 2) as HTMLInputElement;
  expect(selectedInput.readOnly).toBe(true);
  expect(selectedInput.inputMode).toBe("none");
  fireEvent.blur(selectedInput);
  fireEvent.click(digit);
  expect(onInput).toHaveBeenLastCalledWith(0, 1, "7");

  fireEvent.click(screen.getByRole("button", { name: "Clear" }));
  expect(onInput).toHaveBeenLastCalledWith(0, 1, "");
});

test("accepts physical digits and deletion keys while keeping native text input disabled", () => {
  const onInput = renderBoard();
  fireEvent.focus(input(2, 2));
  expect((input(2, 2) as HTMLInputElement).readOnly).toBe(true);
  expect((input(2, 2) as HTMLInputElement).inputMode).toBe("none");
  fireEvent.keyDown(input(2, 2), { key: "8" });
  expect(onInput).toHaveBeenLastCalledWith(1, 1, "8");
  for (const key of ["Backspace", "Delete"]) {
    fireEvent.keyDown(input(2, 2), { key });
    expect(onInput).toHaveBeenLastCalledWith(1, 1, "");
  }
  fireEvent.keyDown(screen.getByRole("button", { name: "7" }), { key: "4" });
  expect(onInput).toHaveBeenLastCalledWith(1, 1, "4");
  const callCount = onInput.mock.calls.length;
  fireEvent.keyDown(input(2, 2), { key: "1" });
  fireEvent.keyDown(input(2, 2), { key: "0" });
  fireEvent.keyDown(input(2, 2), { key: "7", ctrlKey: true });
  expect(onInput).toHaveBeenCalledTimes(callCount);
});

test("disables only digits from fixed peers and updates when the selection changes", () => {
  const onInput = renderBoard([
    [4, 0, 3],
    [0, 4, 4],
    [3, 3, 5],
  ]);
  fireEvent.focus(input(5, 5));
  for (const digit of [3, 4, 5]) {
    expect(
      (screen.getByRole("button", { name: String(digit) }) as HTMLButtonElement).disabled,
    ).toBe(true);
  }
  const one = screen.getByRole("button", { name: "1" }) as HTMLButtonElement;
  expect(one.disabled).toBe(false);
  pointer(1, 2);
  expect(one.disabled).toBe(false);
  fireEvent.click(screen.getByRole("button", { name: "3" }));
  expect(onInput).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "7" }));
  expect(onInput).toHaveBeenLastCalledWith(4, 4, "7");

  fireEvent.focus(input(9, 9));
  for (const digit of [3, 4, 5]) {
    expect(
      (screen.getByRole("button", { name: String(digit) }) as HTMLButtonElement).disabled,
    ).toBe(false);
  }
});

test("allows digits entered in non-fixed peers and still allows clearing", () => {
  const onInput = renderBoard();
  fireEvent.focus(input(1, 3));
  const two = screen.getByRole("button", { name: "2" }) as HTMLButtonElement;
  expect(two.disabled).toBe(false);
  fireEvent.click(two);
  expect(onInput).toHaveBeenLastCalledWith(0, 2, "2");

  fireEvent.focus(input(1, 2));
  fireEvent.click(screen.getByRole("button", { name: "Clear" }));
  expect(onInput).toHaveBeenLastCalledWith(0, 1, "");
});
