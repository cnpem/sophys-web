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
export const cardCapillaryColumns = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
] as const;
export const cardModes = ["standard", "capillary"] as const;
export const cardTypesGrid = cardModes[0];
export const cardTypesCapillary = cardModes[1];
export const cardSlotRadius = 2;
