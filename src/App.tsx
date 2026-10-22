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
      <Suspense fallback={<p className="p-5">Loading…</p>}>
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
    <>
      <header className="mx-auto max-w-4xl px-6 py-4 text-center">
        <h1 className="text-lg font-semibold">
          <Link to="/">Games</Link>
        </h1>
      </header>
      <main className="p-8">
        <ul className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
          {games.map(({ id, name, description, screenshot, screenshotContentWidth }) => (
            <li key={id}>
              <Link
                to={`/${id}`}
                aria-labelledby={`${id}-title`}
                className="bg-foreground/3 hover:bg-foreground/6 block h-full rounded p-6"
              >
                <img
                  src={screenshot}
                  alt={`${name} gameplay`}
                  width={1920}
                  height={1080}
                  className="mb-4 w-full rounded object-cover"
                  style={{ aspectRatio: `${screenshotContentWidth + 32} / 1080` }}
                />
                <h2 id={`${id}-title`} className="text-lg font-semibold">
                  {name}
                </h2>
                <p className="text-foreground/50 mt-2 text-sm">{description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
