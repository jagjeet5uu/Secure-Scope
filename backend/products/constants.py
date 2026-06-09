from decimal import Decimal, InvalidOperation


CATEGORY_ALIASES = {
    "ring": "Rings",
    "rings": "Rings",
    "solitaire ring": "Solitaire Rings",
    "small earrings": "Small Earrings",
    "cocktail earrings": "Cocktail Earrings",
    "solitaire earrings": "Solitaire Earrings",
    "bracelet": "Bracelets",
    "bracelets": "Bracelets",
    "bangle": "Bangles",
    "bangles": "Bangles",
    "necklace": "Necklaces",
    "necklaces": "Necklaces",
    "pendant": "Pendants",
    "pendants": "Pendants",
    "chain": "Chains",
    "chains": "Chains",
    "nose pin": "Nose Pins",
    "nose pins": "Nose Pins",
    "ear cuff": "Ear Cuffs",
    "ear cuffs": "Ear Cuffs",
    "packaging": "Packaging Material",
    "packaging material": "Packaging Material",
}

CERTIFICATION_ALIASES = {
    "": "Unknown",
    "na": "No",
    "n/a": "No",
    "no": "No",
    "none": "No",
    "yes": "Yes - Generic",
    "generic": "Yes - Generic",
    "igi": "IGI",
    "sgl": "SGL",
    "hallmark": "Hallmark",
}

INVENTORY_ALIASES = {
    "": "Available",
    "available": "Available",
    "in stock": "Available",
    "stock": "Available",
    "reserved": "Reserved",
    "sold": "Sold",
    "return": "Returned",
    "returned": "Returned",
    "under service": "Under Service",
    "service": "Under Service",
    "archived": "Archived",
    "inactive": "Archived",
}


def normalize_category(value):
    key = str(value or "").strip().lower()
    return CATEGORY_ALIASES.get(key, "Other" if not key else value.strip().title())


def normalize_certification(value):
    key = str(value or "").strip().lower()
    return CERTIFICATION_ALIASES.get(key, "Unknown")


def normalize_inventory(value):
    key = str(value or "").strip().lower()
    return INVENTORY_ALIASES.get(key, "Available")


def parse_money(value):
    raw = str(value or "").replace(",", "").strip()
    if not raw:
        return Decimal("0.00")
    try:
        return Decimal(raw)
    except InvalidOperation:
        raise ValueError("Invalid price")
