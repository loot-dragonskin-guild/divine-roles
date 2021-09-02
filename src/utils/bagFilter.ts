import { Bag } from "loot-sdk/dist/types";

enum BagKeysToCheck {
  chest = "chest",
  foot = "foot",
  hand = "hand",
  waist = "waist",
  head = "head",
  neck = "neck",
}

export const bagKeysToCheck: Array<BagKeysToCheck> = [
  BagKeysToCheck.chest,
  BagKeysToCheck.foot,
  BagKeysToCheck.hand,
  BagKeysToCheck.waist,
  BagKeysToCheck.head,
  BagKeysToCheck.neck,
];

export const bagFilterFunc = (bag: Bag) =>
  bagKeysToCheck.map((key) => bag[key].toLowerCase().includes("katana"));
