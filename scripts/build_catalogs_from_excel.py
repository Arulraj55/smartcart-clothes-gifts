import os
import json
import random
import re
from pathlib import Path
import pandas as pd

repo_root = Path(__file__).resolve().parents[1]
fashion_excel_path = repo_root / "fashion_dataset_completed.xlsx"
footwear_excel_path = repo_root / "Footwear_Final_12_Columns.xlsx"

output_dir = repo_root / "frontend" / "src" / "data"
output_dir.mkdir(parents=True, exist_ok=True)

clothing_json_path = output_dir / "clothing-catalog.json"
footwear_json_path = output_dir / "footwear-catalog.json"
category_images_path = output_dir / "category-images.json"

random.seed(42)

# Footwear category mapping (20 raw -> 14 canonical)
FOOTWEAR_MAP = {
    "Sandals": "Sandals",
    "Sandals & Slides": "Sandals",
    "Sneakers": "Sneakers",
    "Sneakers & Athletic Shoes": "Sneakers",
    "Casual Shoes": "Casual Shoes",
    "Slippers": "Slippers",
    "Boots": "Boots",
    "Chelsea & Chukka Boots": "Boots",
    "Flats": "Flats",
    "Flats & Mary Janes": "Flats",
    "Loafers": "Loafers",
    "Loafers & Moccasins": "Loafers",
    "Cleats & Sports Shoes": "Cleats & Sports Shoes",
    "Heels": "Heels",
    "Heels & Wedges": "Heels",
    "Dress & Oxford Shoes": "Dress & Oxford Shoes",
    "Rain & Snow Boots": "Rain & Snow Boots",
    "Western & Cowboy Boots": "Western & Cowboy Boots",
    "Canvas & Skate Shoes": "Canvas & Skate Shoes",
    "Clogs": "Clogs"
}

# Fashion 18 Categories Mapping
# Current 16: 'Co-ord Sets', 'Dresses & Gowns', 'Dupattas & Stoles', 'Jackets & Coats', 'Jeans', 'Jumpsuits & Playsuits', 'Kurtas & Kurtis', 'Lehengas', 'Sarees', 'Shorts', 'Shrugs', 'Skirts', 'Sweaters & Sweatshirts', 'T-Shirts', 'Tops, Shirts & Blouses', 'Trousers & Pants'
# We will split 'Tops, Shirts & Blouses' into 'Tops & Tunics' and 'Shirts & Blouses', and assign any remaining items into 18 crisp categories.
FASHION_18_CATEGORIES = [
    "Tops & Tunics",
    "Shirts & Blouses",
    "Jeans",
    "Kurtas & Kurtis",
    "Trousers & Pants",
    "Jackets & Coats",
    "Sarees",
    "Lehengas",
    "Dupattas & Stoles",
    "Sweaters & Sweatshirts",
    "Dresses & Gowns",
    "T-Shirts",
    "Shrugs",
    "Co-ord Sets",
    "Skirts",
    "Jumpsuits & Playsuits",
    "Shorts",
    "Innerwear & Nightwear"
]

CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"]
FOOTWEAR_SIZES = ["6", "7", "8", "9", "10", "11"]

CLOTHES_FABRICS = ["100% Cotton", "Silk Blend", "Viscose Rayon", "Polyester Blend", "Linen Blend", "Georgette", "Chiffon", "Denim Premium"]
CLOTHES_FITS = ["Regular Fit", "Slim Fit", "Relaxed Fit", "Tailored Fit", "Oversized Fit"]
CLOTHES_CARE = ["Hand wash warm", "Machine wash cold", "Dry clean only", "Gentle wash cycle"]

FOOTWEAR_SOLES = ["Rubber Sole", "EVA Cushioned Sole", "Memory Foam Insole", "TPR Durable Sole", "Synthetic Rubber", "Leather Sole"]
FOOTWEAR_CLOSURES = ["Slip-On", "Lace-Up", "Buckle Strap", "Hook & Loop", "Elastic Band"]
FOOTWEAR_MATERIALS = ["Genuine Leather", "Faux Leather", "Breathable Mesh", "Canvas Upper", "Suede Finish"]

def generate_clothes_highlights(row, category):
    color = str(row.get("color", "")).strip() or "Multicolor"
    seller = str(row.get("seller", "")).strip() or "SmartCart"
    fabric = random.choice(CLOTHES_FABRICS)
    fit = random.choice(CLOTHES_FITS)
    care = random.choice(CLOTHES_CARE)
    return [
        f"Material & Fabric: {fabric}",
        f"Fit Type: {fit}",
        f"Color: {color}",
        f"Care Instructions: {care}",
        f"Sold by: {seller}"
    ]

def generate_footwear_highlights(row, category):
    color = str(row.get("color", "")).strip() or "Black"
    seller = str(row.get("seller", "")).strip() or "SmartCart Footwear"
    sole = random.choice(FOOTWEAR_SOLES)
    closure = random.choice(FOOTWEAR_CLOSURES)
    mat = random.choice(FOOTWEAR_MATERIALS)
    return [
        f"Upper Material: {mat}",
        f"Sole Material: {sole}",
        f"Closure Type: {closure}",
        f"Color: {color}",
        f"Sold by: {seller}"
    ]

def clean_val(val, default=""):
    if pd.isna(val) or val is None:
        return default
    return str(val).strip()

def clean_num(val, default=0, is_float=False):
    if pd.isna(val) or val is None:
        return default
    try:
        val_str = str(val).replace(",", "").strip()
        val_str = re.sub(r"[^\d.]", "", val_str)
        if is_float:
            return float(val_str) if val_str else default
        return int(float(val_str)) if val_str else default
    except Exception:
        return default

def clean_bool(val):
    if pd.isna(val) or val is None:
        return False
    s = str(val).strip().lower()
    return s in ["true", "1", "yes", "t"]

def parse_fashion_excel():
    print("Parsing fashion_dataset_completed.xlsx...")
    df = pd.read_excel(fashion_excel_path)
    products = []
    category_images = {}
    
    # We will split 'Tops, Shirts & Blouses' across 'Tops & Tunics' and 'Shirts & Blouses'
    # And if any items are missing, map them smoothly into the 18 categories
    
    for idx, row in df.iterrows():
        name = clean_val(row.get("name"))
        img = clean_val(row.get("image"))
        if not name or not img:
            continue
        
        raw_cat = clean_val(row.get("category"))
        if raw_cat == "category":
            continue
        
        # Categorize into 18 categories
        if raw_cat == "Tops, Shirts & Blouses":
            category = "Tops & Tunics" if idx % 2 == 0 else "Shirts & Blouses"
        elif raw_cat == "Shorts" and idx % 2 == 1:
            category = "Innerwear & Sleepwear"
        elif raw_cat in FASHION_18_CATEGORIES:
            category = raw_cat
        else:
            # Fallback
            category = "Tops & Tunics"
        
        seller = clean_val(row.get("seller"), "SmartCart Retail")
        rating = clean_num(row.get("ratings"), 4.2, is_float=True)
        rating_count = clean_num(row.get("ratings_count"), 120)
        is_special_price = clean_bool(row.get("is_special_price"))
        price = clean_num(row.get("price"), 1999)
        discounted_price = clean_num(row.get("discounted_price"), 899)
        if discounted_price >= price and price > 0:
            discounted_price = int(price * 0.6)
        
        discount_pct = clean_val(row.get("discount percentage"))
        if not discount_pct:
            if price > 0:
                pct = int(round((1 - discounted_price / price) * 100))
                discount_pct = f"{pct}%"
            else:
                discount_pct = "40%"
        
        color = clean_val(row.get("color"), "Multicolor")
        desc = clean_val(row.get("description"), f"{name} - Premium quality fashion clothing from {seller}.")
        
        pid = 10000 + idx + 1
        
        product = {
            "id": pid,
            "_id": str(pid),
            "name": name,
            "category": category,
            "seller": seller,
            "rating": rating,
            "ratings": rating,
            "rating_count": rating_count,
            "ratings_count": rating_count,
            "is_special_price": is_special_price,
            "special_price_badge": is_special_price,
            "price": price,
            "discounted_price": discounted_price,
            "discount_percentage": discount_pct,
            "discount": discount_pct,
            "color": color,
            "colors": [color],
            "image": img,
            "images": [img],
            "description": desc,
            "sizes": CLOTHING_SIZES,
            "highlights": generate_clothes_highlights(row, category),
            "type": "clothes"
        }
        
        products.append(product)
        
        if category not in category_images and img:
            category_images[category] = img

    print(f"Total Fashion Products Parsed: {len(products)}")
    return products, category_images

def parse_footwear_excel():
    print("Parsing Footwear_Final_12_Columns.xlsx...")
    df = pd.read_excel(footwear_excel_path)
    products = []
    category_images = {}
    
    for idx, row in df.iterrows():
        name = clean_val(row.get("name"))
        img = clean_val(row.get("image"))
        if not name or not img:
            continue
        
        raw_cat = clean_val(row.get("category"))
        if raw_cat == "category" or raw_cat not in FOOTWEAR_MAP:
            continue
        
        category = FOOTWEAR_MAP[raw_cat]
        seller = clean_val(row.get("seller"), "SmartCart Footwear")
        rating = clean_num(row.get("ratings"), 4.3, is_float=True)
        rating_count = clean_num(row.get("ratings_count"), 250)
        is_special_price = clean_bool(row.get("is_special_price"))
        price = clean_num(row.get("price"), 2999)
        discounted_price = clean_num(row.get("discounted_price"), 1299)
        if discounted_price >= price and price > 0:
            discounted_price = int(price * 0.55)
        
        discount_pct = clean_val(row.get("discount percentage"))
        if not discount_pct:
            if price > 0:
                pct = int(round((1 - discounted_price / price) * 100))
                discount_pct = f"{pct}%"
            else:
                discount_pct = "45%"
        
        color = clean_val(row.get("color"), "Black")
        desc = clean_val(row.get("description"), f"{name} - High performance, comfortable footwear by {seller}.")
        
        pid = 20000 + idx + 1
        
        product = {
            "id": pid,
            "_id": str(pid),
            "name": name,
            "category": category,
            "seller": seller,
            "rating": rating,
            "ratings": rating,
            "rating_count": rating_count,
            "ratings_count": rating_count,
            "is_special_price": is_special_price,
            "special_price_badge": is_special_price,
            "price": price,
            "discounted_price": discounted_price,
            "discount_percentage": discount_pct,
            "discount": discount_pct,
            "color": color,
            "colors": [color],
            "image": img,
            "images": [img],
            "description": desc,
            "sizes": FOOTWEAR_SIZES,
            "highlights": generate_footwear_highlights(row, category),
            "type": "footwear"
        }
        
        products.append(product)
        
        if category not in category_images and img:
            category_images[category] = img

    print(f"Total Footwear Products Parsed: {len(products)}")
    return products, category_images

def main():
    clothes_products, clothes_cat_imgs = parse_fashion_excel()
    footwear_products, footwear_cat_imgs = parse_footwear_excel()
    
    # Save JSON files
    with open(clothing_json_path, "w", encoding="utf-8") as f:
        json.dump(clothes_products, f, indent=2)
    print(f"Wrote {clothing_json_path}")
    
    with open(footwear_json_path, "w", encoding="utf-8") as f:
        json.dump(footwear_products, f, indent=2)
    print(f"Wrote {footwear_json_path}")
    
    # Combined category images
    all_cat_imgs = {
        "clothes": clothes_cat_imgs,
        "footwear": footwear_cat_imgs
    }
    
    with open(category_images_path, "w", encoding="utf-8") as f:
        json.dump(all_cat_imgs, f, indent=2)
    print(f"Wrote {category_images_path}")
    
    print("\nSummary of Fashion Categories:")
    cats_clothes = sorted(list(set([p["category"] for p in clothes_products])))
    print(f"Count ({len(cats_clothes)}):", cats_clothes)
    
    print("\nSummary of Footwear Categories:")
    cats_fw = sorted(list(set([p["category"] for p in footwear_products])))
    print(f"Count ({len(cats_fw)}):", cats_fw)

if __name__ == "__main__":
    main()
