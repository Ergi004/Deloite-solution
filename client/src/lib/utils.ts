export { cn } from "cn"

/** Base UI's Slider reports value as number | readonly number[] depending on usage; our sliders always use one thumb. */
export function firstOf(value: number | readonly number[]): number {
  return Array.isArray(value) ? value[0] : (value as number);
}
