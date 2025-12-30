import { Point } from "../types";

export const distanceBetween = (p1: Point, p2: Point) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const angleBetween = (p1: Point, p2: Point) => {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

// Quadratic Bezier curve midpoints
export const midPointBtw = (p1: Point, p2: Point) => {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2,
    width: p1.width + (p2.width - p1.width) / 2,
    time: p1.time + (p2.time - p1.time) / 2
  };
};

// Check if point is inside canvas bounds
export const isOutOfBounds = (x: number, y: number, width: number, height: number) => {
  return x < 0 || x > width || y < 0 || y > height;
};