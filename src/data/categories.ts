import { MenuItem, Order } from "@/types/order";
import menu from "@/data/menu.json";

export type Station = "kitchen" | "bar";
export type DoneFlag = "startersDone" | "mainsDone" | "drinksDone";

export interface MenuSectionDef {
  /** key into menu.json */
  menuKey: keyof typeof menu;
  /** display title, used on the order screen and on kitchen/bar tickets */
  label: string;
  /** value stored on MenuItem.category for items in this section */
  category: string;
  /** which physical station prepares this section */
  station: Station;
  /** which Order boolean flag marks this section done */
  doneFlag: DoneFlag;
}

// Single source of truth for menu sections: what they're called, which
// category key they carry, which station preps them and which done-flag
// they satisfy. The Employee order screen, Kitchen/Bar displays, and the
// Orders/Completed tickets all derive their grouping from this list instead
// of each maintaining their own (previously inconsistent) copies.
export const MENU_SECTIONS: MenuSectionDef[] = [
  { menuKey: "breakfast", label: "Breakfast", category: "breakfast", station: "kitchen", doneFlag: "startersDone" },
  { menuKey: "parathas", label: "Parathas", category: "paratha", station: "kitchen", doneFlag: "startersDone" },
  { menuKey: "starters", label: "Starters", category: "starter", station: "kitchen", doneFlag: "startersDone" },
  { menuKey: "streetFood", label: "Street Food", category: "streetfood", station: "kitchen", doneFlag: "startersDone" },
  { menuKey: "mains", label: "Mains", category: "main", station: "kitchen", doneFlag: "mainsDone" },
  { menuKey: "vegMains", label: "Vegetarian Mains", category: "main-veg", station: "kitchen", doneFlag: "mainsDone" },
  { menuKey: "burgers", label: "Burgers", category: "burger", station: "kitchen", doneFlag: "mainsDone" },
  { menuKey: "sides", label: "Sides & Sundries", category: "side", station: "kitchen", doneFlag: "mainsDone" },
  { menuKey: "mocktails", label: "Mocktails", category: "mocktail", station: "bar", doneFlag: "drinksDone" },
  { menuKey: "desserts", label: "Desserts", category: "dessert", station: "bar", doneFlag: "drinksDone" },
  { menuKey: "shakes", label: "Ice-Cream Shakes", category: "shake", station: "bar", doneFlag: "drinksDone" },
  { menuKey: "chai", label: "Chai & Lassi", category: "chai", station: "bar", doneFlag: "drinksDone" },
  { menuKey: "softDrinks", label: "Soft Drinks & Juices", category: "softdrink", station: "bar", doneFlag: "drinksDone" },
];

const CATEGORY_TO_SECTION = new Map(MENU_SECTIONS.map((s) => [s.category, s]));

export function sectionForCategory(category: string): MenuSectionDef | undefined {
  return CATEGORY_TO_SECTION.get(category);
}

export function isKitchenCategory(category: string): boolean {
  return sectionForCategory(category)?.station === "kitchen";
}

export function isBarCategory(category: string): boolean {
  return sectionForCategory(category)?.station === "bar";
}

export function hasKitchenItems(items: MenuItem[]): boolean {
  return items.some((i) => isKitchenCategory(i.category));
}

export function hasBarItems(items: MenuItem[]): boolean {
  return items.some((i) => isBarCategory(i.category));
}

export function hasStationItems(items: MenuItem[], station: Station): boolean {
  return station === "kitchen" ? hasKitchenItems(items) : hasBarItems(items);
}

/** Groups an order's items into labelled sections, in MENU_SECTIONS order, skipping empty ones. */
export function groupOrderItems(
  items: MenuItem[],
  station?: Station,
): { title: string; doneFlag: DoneFlag; items: MenuItem[] }[] {
  return MENU_SECTIONS.filter((s) => !station || s.station === station)
    .map((s) => ({
      title: s.label,
      doneFlag: s.doneFlag,
      items: items.filter((i) => i.category === s.category),
    }))
    .filter((s) => s.items.length > 0);
}

/** Whether every section for a station that has items has also been marked done on the order. */
export function isStationDone(order: Order, station: Station): boolean {
  const sections = groupOrderItems(order.items, station);
  return sections.every((s) => order[s.doneFlag]);
}
