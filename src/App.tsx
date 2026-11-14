import { lazy, Suspense } from "react";
import { Link, Route, Routes } from "react-router";

import breakoutScreenshot from "./assets/breakout/screenshot.png";
import celestialMergeScreenshot from "./assets/celestial-merge/screenshot.png";
import numberPlaceScreenshot from "./assets/number-place/screenshot.png";

const games = [
  {
    id: "number-place",
    name: "Number Place",
    description: "Fill the grid with numbers from 1 to 9 in this classic logic puzzle.",
    screenshot: numberPlaceScreenshot,
    screenshotContentWidth: 576,
    Component: lazy(() => import("./number-place/App")),
  },
  {
    id: "celestial-merge",
    name: "Celestial Merge",
    description: "Drop and merge matching celestial bodies to create larger ones.",
    screenshot: celestialMergeScreenshot,
    screenshotContentWidth: (1080 - 13 * 16) * (9 / 14),
    Component: lazy(() => import("./celestial-merge/App")),
  },
  {
    id: "breakout",
    name: "Breakout",
    description: "Bounce the ball with your paddle and clear all 112 bricks.",
    screenshot: breakoutScreenshot,
    screenshotContentWidth: (1080 - 15 * 16) * (9 / 14),
    Component: lazy(() => import("./breakout/App")),
  },
];

export default function App() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Suspense
        fallback={
          <p className="text-foreground/50 flex items-center gap-2 p-6">
            <span className="size-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin" />
            Loading…
          </p>
        }
      >
        <Routes>
          {games.map(({ id, Component }) => (
            <Route key={id} path={`/${id}`} element={<Component />} />
          ))}
          <Route path="*" element={<GameList />} />
        </Routes>
      </Suspense>
    </div>
  );
}

function GameList() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="mx-auto max-w-4xl text-center">
        <h1 className="text-lg font-bold">
          <Link to="/">Games</Link>
        </h1>
      </header>
      <main>
        <ul className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
          {games.map(({ id, name, description, screenshot, screenshotContentWidth }) => (
            <li key={id}>
              <Link
                to={`/${id}`}
                aria-labelledby={`${id}-title`}
                className="bg-foreground/3 hover:bg-foreground/6 block h-full rounded p-4 motion-safe:transition-colors"
              >
                <img
                  src={screenshot}
                  alt={`${name} gameplay`}
                  width={1920}
                  height={1080}
                  className="mb-4 w-full rounded object-cover"
                  style={{ aspectRatio: `${screenshotContentWidth + 32} / 1080` }}
                />
                <h2 id={`${id}-title`} className="font-semibold">
                  {name}
                </h2>
                <p className="text-foreground/50 mt-2">{description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
