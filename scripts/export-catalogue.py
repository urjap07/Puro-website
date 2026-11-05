"""
Exports SaNiSa_Product_Data_Filled.xlsx to scripts/data/catalogue.json.

    python3 scripts/export-catalogue.py

Rows are matched to database products by their position ("Product 01" …),
which mirrors the product IDs already seeded in MySQL.
"""

import json
import re
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "SaNiSa_Product_Data_Filled.xlsx"
OUTPUT = ROOT / "scripts" / "data" / "catalogue.json"
FIRST_DATA_ROW = 7  # rows 1-6 are template headers and guidance


def clean(value):
    if value is None:
        return None
    text = re.sub(r"\s+", " ", str(value).replace("\xa0", " ")).strip()
    return None if text in ("", "-", "NA") else text


def parse_summary(summary):
    """'Headline. Suitable for X. tagline it, flaunt it, naturally.' -> parts."""
    if not summary:
        return None, None
    match = re.search(r"Suitable for (?:For )?(.+)\.\s+(\S+ it, .+)$", summary)
    if not match:
        return None, None
    skin_type, tagline = match.group(1).strip(), match.group(2).strip()
    return skin_type, tagline[0].upper() + tagline[1:]


def capitalise(text):
    return text[0].upper() + text[1:] if text else text


def parse_benefit(value):
    """Buzz Knight bullets are 'Title:\\nBody' — keep the title as the bullet."""
    if value is None:
        return None
    raw = str(value).replace("\xa0", " ")
    raw = re.split(r":\s*\n", raw, maxsplit=1)[0]
    return clean(raw)


def size_label(variant):
    """'100gm' -> '100 g', '200ml' -> '200 ml'."""
    match = re.match(r"(\d+)\s*(gm|g|ml)$", variant.strip(), re.I)
    if not match:
        return variant
    unit = "g" if match.group(2).lower().startswith("g") else "ml"
    return f"{match.group(1)} {unit}"


def main():
    sheet = openpyxl.load_workbook(SOURCE, data_only=True).active
    products = []

    for position, row in enumerate(
        sheet.iter_rows(min_row=FIRST_DATA_ROW, values_only=True), start=1
    ):
        if not row[1]:
            continue

        summary = clean(row[17])
        skin_type, tagline = parse_summary(summary)
        headline = clean(row[16])
        if summary and not skin_type:
            # e.g. Buzz Knight: "Fresh Vibes, All Day. simply calm, simply fresh, naturally"
            first, _, rest = summary.partition(". ")
            headline, tagline = first, capitalise(rest) or None
        benefits = [b for b in (parse_benefit(row[i]) for i in range(19, 23)) if b]
        variant = clean(row[2]) or ""
        is_gift_set = clean(row[3]) == "Gift Sets"

        products.append(
            {
                "id": position,
                "name": clean(row[1]),
                "category": clean(row[3]),
                "subCategory": clean(row[4]),
                "certifications": [
                    c.strip() for c in (clean(row[6]) or "").split("|") if c.strip()
                ],
                "price": row[8],
                # Gift-set pack sizes in the sheet are a "500 gm" placeholder.
                "sizeLabel": None if is_gift_set else size_label(variant),
                "keyIngredients": clean(row[12]),
                "shelfLife": clean(row[14]),
                "storage": clean(row[15]),
                "headline": headline,
                "skinType": skin_type,
                "tagline": tagline,
                "description": clean(row[18]),
                "benefits": benefits,
                "howToUse": clean(row[23]),
            }
        )

    OUTPUT.write_text(json.dumps(products, indent=2, ensure_ascii=False) + "\n")
    print(f"Exported {len(products)} products -> {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
