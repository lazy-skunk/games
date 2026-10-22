import sun from "../../assets/celestial-merge/space01_sun.webp";
import mercury from "../../assets/celestial-merge/space02_mercury.webp";
import venus from "../../assets/celestial-merge/space03_venus.webp";
import earth from "../../assets/celestial-merge/space04_earth.webp";
import moon from "../../assets/celestial-merge/space04_moon.webp";
import mars from "../../assets/celestial-merge/space05_mars.webp";
import jupiter from "../../assets/celestial-merge/space06_jupitor.webp";
import saturn from "../../assets/celestial-merge/space07_saturn.webp";
import uranus from "../../assets/celestial-merge/space07_uranus.webp";
import neptune from "../../assets/celestial-merge/space08_neptune.webp";
import pluto from "../../assets/celestial-merge/space09_pluto.webp";
import { BOARD_WIDTH } from "./board";

const FIRST_BODY_RADIUS = BOARD_WIDTH / 30;
const BODY_RADIUS_STEP = FIRST_BODY_RADIUS / 2;

export const CelestialLevel = {
  Moon: 0,
  Mercury: 1,
  Venus: 2,
  Earth: 3,
  Mars: 4,
  Jupiter: 5,
  Saturn: 6,
  Uranus: 7,
  Neptune: 8,
  Pluto: 9,
  Sun: 10,
} as const;

export type CelestialLevel = (typeof CelestialLevel)[keyof typeof CelestialLevel];

export const CELESTIAL_PROGRESSION = Object.values(CelestialLevel);

// Coordinates in the original image, including transparent padding.
// Measure the spherical surface only; exclude rings and glow.
export type ImageBodyCircle = Readonly<{ cx: number; cy: number; radius: number }>;

type CelestialBodyDefinition = {
  name: string;
  image: string;
  imageBody: ImageBodyCircle;
};

export const CELESTIAL_BODIES: Record<CelestialLevel, CelestialBodyDefinition> = {
  [CelestialLevel.Moon]: {
    image: moon,
    imageBody: { cx: 208, cy: 204, radius: 195 },
    name: "Moon",
  },
  [CelestialLevel.Mercury]: {
    image: mercury,
    imageBody: { cx: 204, cy: 205, radius: 195 },
    name: "Mercury",
  },
  [CelestialLevel.Venus]: {
    image: venus,
    imageBody: { cx: 206, cy: 205, radius: 195 },
    name: "Venus",
  },
  [CelestialLevel.Earth]: {
    image: earth,
    imageBody: { cx: 212, cy: 204, radius: 195 },
    name: "Earth",
  },
  [CelestialLevel.Mars]: {
    image: mars,
    imageBody: { cx: 207, cy: 202, radius: 195 },
    name: "Mars",
  },
  [CelestialLevel.Jupiter]: {
    image: jupiter,
    imageBody: { cx: 210, cy: 202, radius: 195 },
    name: "Jupiter",
  },
  [CelestialLevel.Saturn]: {
    image: saturn,
    imageBody: { cx: 366, cy: 233, radius: 195 },
    name: "Saturn",
  },
  [CelestialLevel.Uranus]: {
    image: uranus,
    imageBody: { cx: 249, cy: 356, radius: 195 },
    name: "Uranus",
  },
  [CelestialLevel.Neptune]: {
    image: neptune,
    imageBody: { cx: 209, cy: 205, radius: 195 },
    name: "Neptune",
  },
  [CelestialLevel.Pluto]: {
    image: pluto,
    imageBody: { cx: 207, cy: 205, radius: 195 },
    name: "Pluto",
  },
  [CelestialLevel.Sun]: {
    image: sun,
    imageBody: { cx: 289, cy: 271, radius: 245 },
    name: "Sun",
  },
};

export function celestialBodyRadius(level: CelestialLevel) {
  return FIRST_BODY_RADIUS + BODY_RADIUS_STEP * level;
}
