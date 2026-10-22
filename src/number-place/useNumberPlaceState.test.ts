// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { useNumberPlaceState } from "./useNumberPlaceState";

vi.mock("./numberPlace", () => ({
  generatePuzzle: () => ({
    puzzle: [[5, 0, 0]],
    solution: [[5, 3, 4]],
  }),
}));

afterEach(cleanup);

describe("useNumberPlaceState", () => {
  it("protects fixed cells and detects entries being added and cleared", () => {
    const { result } = renderHook(() => useNumberPlaceState());

    act(() => result.current.applyDigitInput(0, 0, "9"));
    expect(result.current.cells[0][0]).toEqual({ value: 5, fixed: true });
    expect(result.current.hasUserEditsSinceStart).toBe(false);

    act(() => result.current.applyDigitInput(0, 1, "3"));
    expect(result.current.cells[0][1].value).toBe(3);
    expect(result.current.hasUserEditsSinceStart).toBe(true);

    act(() => result.current.applyDigitInput(0, 1, ""));
    expect(result.current.cells[0][1].value).toBe(0);
    expect(result.current.hasUserEditsSinceStart).toBe(false);
  });

  it("restores the initial puzzle and hides verification on reset", () => {
    const { result } = renderHook(() => useNumberPlaceState());
    const initialCells = result.current.cells;

    act(() => result.current.applyDigitInput(0, 1, "9"));
    act(() => result.current.toggleVerifyResultVisibility());
    expect(result.current.isVerifyResultVisible).toBe(true);

    act(() => result.current.resetToInitialPuzzle());
    expect(result.current.cells).toEqual(initialCells);
    expect(result.current.hasUserEditsSinceStart).toBe(false);
    expect(result.current.isVerifyResultVisible).toBe(false);
  });

  it("hides verification when an entry changes", () => {
    const { result } = renderHook(() => useNumberPlaceState());
    act(() => result.current.toggleVerifyResultVisibility());
    act(() => result.current.applyDigitInput(0, 1, "4"));
    expect(result.current.isVerifyResultVisible).toBe(false);
  });
});
