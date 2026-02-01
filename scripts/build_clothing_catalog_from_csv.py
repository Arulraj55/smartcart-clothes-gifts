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
    default_output = repo_root / "frontend" / "src" / "data" / "clothing-catalog.json"

    parser = argparse.ArgumentParser(description="Build clothing catalog JSON from CSV")
    parser.add_argument("--input", default=str(default_input), help="Path to input CSV")
    parser.add_argument("--output", default=str(default_output), help="Path to output JSON")
    return parser.parse_args()


args = parse_args()
INPUT_PATH = Path(args.input)
OUTPUT_PATH = Path(args.output)

CATEGORY_PLAN = {
    91: 1250,
    110: 1250,
    116: 1250,
    84: 1250,
}

CATEGORY_LABELS = {
    91: "Girl's Clothing",
    110: "Men's Clothing",
    116: "Women's Clothing",
    84: "Boys's Clothings",
}

COLORS = ["Red", "Blue", "Black", "White", "Green", "Gray", "Navy", "Pink", "Purple", "Beige"]
SIZES = ["XS", "S", "M", "L", "XL", "XXL"]

# Exclude non-clothing and accessories
EXCLUDE_KEYWORDS = {
    "shoe", "shoes", "sneaker", "sneakers", "boot", "boots", "sandal", "sandals", "slipper", "slippers",
    "sock", "socks", "stocking", "stockings", "hosiery",
    "napkin", "napkins", "tissue", "tissues", "paper", "wipes", "wipe", "towel", "towels",
    "handbag", "handbags", "purse", "purses", "wallet", "wallets",
    "belt", "belts", "cap", "caps", "hat", "hats", "beanie", "scarf", "scarves", "glove", "gloves",
    "watch", "watches", "jewelry", "jewellery", "ring", "rings", "bracelet", "bracelets",
    "earring", "earrings", "necklace", "necklaces",
    "perfume", "fragrance", "shampoo", "conditioner", "soap", "lotion", "cream",
    "bag", "bags", "backpack", "backpacks",
    "mask", "masks"
}

def is_excluded(title: str) -> bool:
    text = title.lower()
    return any(keyword in text for keyword in EXCLUDE_KEYWORDS)

random.seed(42)

rows_by_cat = {cid: [] for cid in CATEGORY_PLAN}

with INPUT_PATH.open(encoding="utf-8", newline="") as fin:
    reader = csv.DictReader(fin)
    for row in reader:
        cid = row.get("category_id", "").strip()
        if not cid.isdigit():
            continue
        cid = int(cid)
        if cid not in CATEGORY_PLAN:
            continue
        title = (row.get("title") or "").strip()
        img = (row.get("imgUrl") or "").strip()
        if not title or not img:
            continue
        rows_by_cat[cid].append(row)

selected = []
used_titles = set()
next_id = 1

for cid, target in CATEGORY_PLAN.items():
    rows = rows_by_cat[cid]
    random.shuffle(rows)
    count = 0
    for row in rows:
        if count >= target:
            break
        title = row.get("title", "").strip()
        if title in used_titles:
            continue
        if is_excluded(title):
            continue
        img = row.get("imgUrl", "").strip()
        if not img:
            continue

        price_raw = re.sub(r"[^0-9.]", "", (row.get("price") or ""))
        try:
            price = int(float(price_raw)) if price_raw else random.randint(499, 2499)
        except ValueError:
            price = random.randint(499, 2499)

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
            rating = round(random.uniform(3.5, 4.9), 1)

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
            "description": f"{CATEGORY_LABELS.get(cid, 'Clothing')} selection. {title}",
            "rating": str(rating),
            "reviews": reviews,
            "colors": random.sample(COLORS, k=2),
            "sizes": random.sample(SIZES, k=3),
            "inStock": True,
            "discount": discount,
            "brand": brand,
            "material": random.choice(["Cotton", "Linen", "Polyester", "Denim", "Silk", "Wool"]),
            "care": "Machine wash cold, tumble dry low",
            "origin": "India",
            "weight": f"{random.randint(120, 650)}g",
            "dimensions": f"{random.randint(40, 80)}cm x {random.randint(50, 110)}cm",
            "source": "amazon",
            "productURL": (row.get("productURL") or "").strip(),
        }

        selected.append(item)
        used_titles.add(title)
        next_id += 1
        count += 1

    if count < target:
        raise SystemExit(f"Not enough unique items for category {cid}. Needed {target}, got {count}.")

if len(selected) != sum(CATEGORY_PLAN.values()):
    raise SystemExit(f"Expected {sum(CATEGORY_PLAN.values())} items, got {len(selected)}")

OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
with OUTPUT_PATH.open("w", encoding="utf-8") as fout:
    json.dump(selected, fout, ensure_ascii=False, indent=2)

print(f"Wrote {len(selected)} items to {OUTPUT_PATH}")
