/* @flow */

export default function pointRectDistance(
  px: number, py: number, rx: number, ry: number, rwidth: number, rheight: number
): number {
  const cx = Math.max(Math.min(px, rx+rwidth), rx);
  const cy = Math.max(Math.min(py, ry+rheight), ry);
  return Math.sqrt((px-cx)*(px-cx) + (py-cy)*(py-cy));
}
