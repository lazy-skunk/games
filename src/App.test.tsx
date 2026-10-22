// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { HashRouter } from "react-router";
import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";

import App from "./App";

beforeEach(() => {
  window.history.replaceState(null, "", "/games/");
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

test("opens a listed game and preserves its settings through its title", async () => {
  render(
    <HashRouter>
      <App />
    </HashRouter>,
  );
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
  fireEvent.click(screen.getByRole("link", { name: "Number Place" }));
  const difficulty = await screen.findByRole("combobox", {}, { timeout: 5000 });
  fireEvent.change(difficulty, { target: { value: "hard" } });
  fireEvent.click(screen.getByRole("link", { name: "Number Place" }));
  expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("hard");
  expect(window.location.hash).toBe("#/number-place");
}, 10000);

test("loads a direct game URL and follows browser history", async () => {
  window.history.pushState(null, "", "/games/#/number-place");
  render(
    <HashRouter>
      <App />
    </HashRouter>,
  );
  await screen.findByRole("heading", { name: "Number Place" }, { timeout: 5000 });
  expect(screen.getAllByRole("textbox")).toHaveLength(81);
  window.history.back();
  await screen.findByRole("link", { name: "Games" });
  window.history.forward();
  await waitFor(() => expect(screen.getAllByRole("textbox")).toHaveLength(81), { timeout: 5000 });
}, 10000);

test("shows the game list for an unknown URL", async () => {
  window.history.replaceState(null, "", "/games/#/missing");
  render(
    <HashRouter>
      <App />
    </HashRouter>,
  );
  await screen.findByRole("link", { name: "Games" });
});

test("opens breakout, preserves play through its title and pause, and stops its frame on exit", async () => {
  vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1);
  const cancelFrame = vi.spyOn(window, "cancelAnimationFrame");
  const { unmount } = render(
    <HashRouter>
      <App />
    </HashRouter>,
  );
  fireEvent.click(screen.getByRole("link", { name: "Breakout" }));
  fireEvent.click(await screen.findByRole("button", { name: "Start" }, { timeout: 5000 }));
  expect(screen.getByRole("button", { name: "Pause" })).toBeDefined();

  fireEvent.click(screen.getByRole("link", { name: "Breakout" }));
  expect(window.location.hash).toBe("#/breakout");
  expect(screen.getByRole("button", { name: "Pause" })).toBeDefined();

  fireEvent.click(screen.getByRole("button", { name: "Pause" }));
  expect(screen.getByText("Paused")).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Resume" }));
  expect(screen.getByRole("button", { name: "Pause" })).toBeDefined();

  unmount();
  expect(cancelFrame).toHaveBeenCalledWith(1);
}, 10000);
