/** Read the shared hex token once during canvas setup, never in the draw loop. */
export function readBrandOrange(element: Element): [number, number, number] {
  const hex = getComputedStyle(element).getPropertyValue('--color-orange-500').trim();
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}
