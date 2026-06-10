export const cardIndexOptions = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
] as const;
export const cardColumns = ["A", "B", "C", "D"] as const;
export const cardRows = ["1", "2", "3", "4", "5", "6"] as const;
export const cardModes = ["standard", "capillary"] as const;
export const cardSlotRadius = 2;

export function isValidCardPosition({ x, y }: { x: number; y: number }) {
  return Math.sqrt(x ** 2 + y ** 2) <= cardSlotRadius;
}
