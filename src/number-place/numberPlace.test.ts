import { describe, expect, it } from "vite-plus/test";

import { emptyBoard } from "./numberPlace";

describe("emptyBoard", () => {
  it("creates a 9x9 board filled with zeroes", () => {
    const board = emptyBoard();

    expect(board).toHaveLength(9);
    expect(board.every((row) => row.length === 9)).toBe(true);
    expect(board.flat().every((value) => value === 0)).toBe(true);
  });
});
