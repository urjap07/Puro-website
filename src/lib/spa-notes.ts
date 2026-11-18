/**
 * Reads the spa range's own descriptions for the things a therapist scans for:
 * the scent notes (with a colour for each) and the mood a product suits.
 * Everything here comes from the product text; nothing is added.
 */

/** Ingredient → swatch colour. Longer names first so "Ylang Ylang" beats "Ylang". */
const NOTES: [name: string, match: RegExp, colour: string][] = [
  ["Ylang Ylang", /ylang/i, "#E9C46A"],
  ["Juniper Berry", /juniper/i, "#5B6C8F"],
  ["Lemongrass", /lemongrass/i, "#A7C957"],
  ["Peppermint", /peppermint|minty/i, "#6CC4A1"],
  ["Lavender", /lavender|balinese/i, "#9C89C9"],
  ["Rose", /\brose\b/i, "#E58FA6"],
  ["Sandalwood", /sandalwood/i, "#C49A6C"],
  ["Frankincense", /frankincense/i, "#CDB891"],
  ["Bergamot", /bergamot/i, "#C5D86D"],
  ["Geranium", /geranium/i, "#E07A8F"],
  ["Basil", /basil/i, "#5E9C5A"],
  ["Rosemary", /rosemary/i, "#7FA37A"],
  ["Mandarin", /mandarin/i, "#F4A259"],
  ["Grapefruit", /grapefruit/i, "#F28482"],
  ["Orange", /\borange\b/i, "#F59E3B"],
  ["Lemon", /\blemon\b/i, "#F2D649"],
  ["Ginger", /ginger/i, "#D9A441"],
  ["Cinnamon", /cinnamon/i, "#B5653A"],
  ["Cypress", /cypress/i, "#4F7A5E"],
  ["Citronella", /citronella/i, "#C9D66B"],
  ["Cocoa", /cocoa|chocolate|mocha/i, "#7B4B36"],
  ["Wine", /\bwine\b/i, "#8E3B53"],
  ["Vanilla", /vanilla/i, "#EADBB5"],
  ["Saffron", /saffron/i, "#E9A23B"],
  ["Turmeric", /turmeric/i, "#E3B23C"],
  ["Kiwi", /kiwi/i, "#8DB255"],
  ["Goji berry", /goji/i, "#D1495B"],
  ["Coconut", /coconut/i, "#E8E1D5"],
  ["Almond", /almond/i, "#D9B48F"],
  ["Olive", /\bolive\b/i, "#9AA05B"],
  ["Grapeseed", /grape ?seed/i, "#7D5A8C"],
  ["Walnut", /walnut/i, "#8C6A4F"],
  ["Licorice", /licorice/i, "#6B4E3D"],
  ["Aloe vera", /aloe/i, "#8CC0A0"],
  ["Sea salt", /\bsalts?\b/i, "#BFD7E0"],
];

export interface Note {
  name: string;
  colour: string;
}

/** The notes named in a product's name and description, in the order they're first mentioned. */
export function notesFor(name: string, text: string, max = 3): Note[] {
  const source = `${name}. ${text}`;
  return NOTES.map(([note, match, colour]) => ({ note, colour, at: source.search(match) }))
    .filter((found) => found.at >= 0)
    .sort((a, b) => a.at - b.at)
    .slice(0, max)
    .map(({ note, colour }) => ({ name: note, colour }));
}

/** Moods, matched against what each description says the product does. */
export const MOODS = [
  { id: "calm", label: "Calm & unwind", match: /calm|relax|sooth|stress|serenity|peace|sedate|anxiety|nerves|ground/i },
  { id: "uplift", label: "Uplift & energise", match: /uplift|energ|mood|happy|happiness|stimulat|refresh|fresh|clarity|positive|boost/i },
  { id: "detox", label: "Detox & clarify", match: /detox|toxin|lymph|clarif|cleans|impurit|water retention/i },
  { id: "muscle", label: "Muscle & circulation", match: /muscle|circulat|tissue|warming|exertion|swelling|inflammat/i },
  { id: "nourish", label: "Nourish & soften", match: /moistur|nourish|hydrat|soft|supple|dry|repair|glow|brighten|radian/i },
] as const;

export type MoodId = (typeof MOODS)[number]["id"];

export function moodsFor(text: string): MoodId[] {
  return MOODS.filter((mood) => mood.match.test(text)).map((mood) => mood.id);
}

export const isBestseller = (text: string) => /best[\s-]?sell/i.test(text);
