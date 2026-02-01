import argparse
import csv
import json
import os
import random
import re
from pathlib import Path


def parse_args() -> argparse.Namespace:
    repo_root = Path(__file__).resolve().parents[1]
    default_input = repo_root / "amazon_products_selected_categories_subset.csv"
    default_output = repo_root / "frontend" / "src" / "data" / "gifts-catalog.json"

    parser = argparse.ArgumentParser(description="Build gifts catalog JSON from CSV")
    parser.add_argument("--input", default=str(default_input), help="Path to input CSV")
    parser.add_argument("--output", default=str(default_output), help="Path to output JSON")
    return parser.parse_args()


args = parse_args()
INPUT_PATH = Path(args.input)
OUTPUT_PATH = Path(args.output)

CATEGORY_IDS = [
    89, 90,
    95, 96,
    113, 114,
    118, 121, 122, 123,
    46, 48,
    39, 125, 12,
    221, 227, 230
]

TOTAL_TARGET = 4000

CATEGORY_LABELS = {
    89: "Boys' Watches",
    90: "Boys' Shoes",
    95: "Girls' Jewelry",
    96: "Girls' Watches",
    113: "Men's Watches",
    114: "Men's Shoes",
    118: "Women's Handbags",
    121: "Women's Watches",
    122: "Women's Shoes",
    123: "Women's Jewelry",
    46: "Perfumes & Fragrances",
    48: "Makeup",
    39: "Baby Gifts",
    125: "Gift Cards",
    12: "Gift Wrapping Supplies",
    221: "Dolls & Accessories",
    227: "Puzzles",
    230: "Baby & Toddler Toys",
}

COLORS = ["Red", "Blue", "Black", "White", "Green", "Gray", "Navy", "Pink", "Purple", "Beige"]
SIZES = ["XS", "S", "M", "L", "XL", "XXL"]

random.seed(42)

rows_by_cat = {cid: [] for cid in CATEGORY_IDS}

with INPUT_PATH.open(encoding="utf-8", newline="") as fin:
    reader = csv.DictReader(fin)
    for row in reader:
        cid = row.get("category_id", "").strip()
        if not cid.isdigit():
            continue
        cid = int(cid)
        if cid not in rows_by_cat:
            continue
        title = (row.get("title") or "").strip()
        img = (row.get("imgUrl") or "").strip()
        if not title or not img:
            continue
        rows_by_cat[cid].append(row)

selected = []
used_titles = set()
used_images = set()
next_id = 1

# Build availability per category based on unique titles
available_by_cat = {}
for cid in CATEGORY_IDS:
    titles = { (row.get("title") or "").strip() for row in rows_by_cat[cid] if (row.get("title") or "").strip() }
    available_by_cat[cid] = len(titles)

# Initial equal split
base_per_category = TOTAL_TARGET // len(CATEGORY_IDS)
targets = {cid: min(base_per_category, available_by_cat[cid]) for cid in CATEGORY_IDS}

# Redistribute remaining across categories with extra capacity
assigned = sum(targets.values())
remaining = TOTAL_TARGET - assigned
while remaining > 0:
    progress = False
    for cid in CATEGORY_IDS:
        capacity = available_by_cat[cid] - targets[cid]
        if capacity > 0 and remaining > 0:
            targets[cid] += 1
            remaining -= 1
            progress = True
    if not progress:
        break

if sum(targets.values()) < TOTAL_TARGET:
    raise SystemExit(f"Not enough unique items to reach {TOTAL_TARGET}. Available: {sum(available_by_cat.values())}")

for cid in CATEGORY_IDS:
    rows = rows_by_cat[cid]
    random.shuffle(rows)
    count = 0
    for row in rows:
        if count >= targets[cid]:
            break
        title = row.get("title", "").strip()
        if title in used_titles:
            continue
        img = row.get("imgUrl", "").strip()
        if not img:
            continue
        if img in used_images:
            continue

        price_raw = re.sub(r"[^0-9.]", "", (row.get("price") or ""))
        try:
            price = int(float(price_raw)) if price_raw else random.randint(199, 2499)
        except ValueError:
            price = random.randint(199, 2499)

        list_price_raw = re.sub(r"[^0-9.]", "", (row.get("listPrice") or ""))
        try:
            list_price = int(float(list_price_raw)) if list_price_raw else price + random.randint(100, 800)
        except ValueError:
            list_price = price + random.randint(100, 800)
        if list_price < price:
            list_price = price + random.randint(100, 600)

        rating_raw = (row.get("stars") or "").strip()
        try:
            rating = round(float(rating_raw), 1)
        except ValueError:
            rating = round(random.uniform(3.4, 4.9), 1)

        reviews_raw = re.sub(r"[^0-9]", "", (row.get("reviews") or ""))
        try:
            reviews = int(reviews_raw) if reviews_raw else random.randint(5, 500)
        except ValueError:
            reviews = random.randint(5, 500)

        discount = round((list_price - price) / list_price * 100) if list_price > 0 else 0
        brand = title.split()[0] if title else "SmartCart"

        item = {
            "id": next_id,
            "name": title,
            "price": price,
            "originalPrice": list_price,
            "image": img,
            "category": CATEGORY_LABELS.get(cid, f"Category {cid}"),
            "category_id": cid,
            "description": f"{CATEGORY_LABELS.get(cid, 'Gift')} selection. {title}",
            "rating": str(rating),
            "reviews": reviews,
            "colors": random.sample(COLORS, k=2),
            "sizes": random.sample(SIZES, k=3),
            "inStock": True,
            "discount": discount,
            "brand": brand,
            "material": random.choice(["Cotton", "Linen", "Polyester", "Denim", "Silk", "Wool"]),
            "care": "Keep in cool dry place",
            "origin": "India",
            "weight": f"{random.randint(120, 650)}g",
            "dimensions": f"{random.randint(40, 80)}cm x {random.randint(50, 110)}cm",
            "source": "amazon",
            "productURL": (row.get("productURL") or "").strip(),
        }

        selected.append(item)
        used_titles.add(title)
        used_images.add(img)
        next_id += 1
        count += 1

    if count < targets[cid]:
        raise SystemExit(f"Not enough unique items for category {cid}. Needed {targets[cid]}, got {count}.")

if len(selected) != TOTAL_TARGET:
    raise SystemExit(f"Expected {TOTAL_TARGET} items, got {len(selected)}")

OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
with OUTPUT_PATH.open("w", encoding="utf-8") as fout:
    json.dump(selected, fout, ensure_ascii=False, indent=2)

print(f"Wrote {len(selected)} items to {OUTPUT_PATH}")
