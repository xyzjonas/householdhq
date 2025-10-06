import sys
from datetime import datetime

import requests
import re
import os
from pathlib import Path

import editor


# API_URL = os.getenv('API_URL') or (print('API_URL variable missing') or sys.exit(1))
API_URL = "https://home.bohunky.xyz/api"


TAGS = dict()


def parse_amount(amount_str) -> float:
    cleaned = (
        amount_str
        .replace(",", ".")
        .replace(" Kč", "")
        .replace(" ", "")
        .replace("\xa0", "")
    )
    if cleaned == "-":
        return 0

    return float(cleaned)


def process_month_file(file_path: Path) -> list[dict]:
    entries = []
    with open(file_path, "r") as csv_file:

        handle_incomes = False
        handle_items = False
        lines = csv_file.readlines()

    matches = re.findall(r".*(\d{1,2}.\d{1,2}.\d{4}).*", "\n".join(lines))
    if not matches:
        raise ValueError("can't deduce sheet's year and month")
    date_match = matches[-1]
    _, month, year = date_match.split(".")
    first_of_month = datetime(year=int(year), month=int(month), day=1)

    for index, line in enumerate(lines):
        try:
            line = line.strip()
            if "VÝPLATA" in line:
                handle_incomes = True
                continue

            if handle_incomes:
                if "jonynecek" in line or "marianecka" in line:
                    total = parse_amount(line.split("\t")[-1])
                    cat = f"Výplata {'J' if 'jonynecek' in line else 'M'}"
                    entries.append({
                        "transactedAt": first_of_month.isoformat(),
                        "sourceId": 2,
                        "targetId": 1,
                        "description": cat,
                        "amount": float(total),
                        "currency": "CZK",
                        "isImportant": False,
                        "categoryId": TAGS[cat]
                    })
                if "marianecka" in line:
                    handle_incomes = False

                continue

            if "date" in line and "item" in line:
                handle_items = True
                continue

            if handle_items:
                splits = line.split("\t")
                if len(splits) <= 1:
                    continue

                date, desc, cat, amount, _ = splits
                date_splits = date.split(".")
                if len(date_splits) == 2:
                    date = f"{date}.{year}"

                dd, mm, yyy = date.split(".")
                transaction_date = datetime(year=int(yyy), month=int(mm), day=int(dd))

                amount = parse_amount(amount)
                if amount == 0:
                    continue

                if not cat in TAGS:
                    raise ValueError(f"Missing category: {cat}")

                entries.append({
                    "transactedAt": transaction_date.isoformat(),
                    "sourceId": 1,
                    "targetId": 2,
                    "description": desc,
                    "amount": amount,
                    "currency": "CZK",
                    "isImportant": False,
                    "categoryId": TAGS[cat]
                })
        except Exception:
            print(f"ERROR: {file_path}, on line {index}")
            raise

    return entries


def process_simple_file(file_path: Path) -> list[dict]:
    entries = []
    with open(file_path, "r") as csv_file:
        lines = csv_file.readlines()
        
    print(len(lines))

    for index, line in enumerate(lines):
        try:
            line = line.strip()
            splits = [split for split in line.split(",") if split]
            if len(splits) <= 1:
                continue

            if len(splits) != 4:
                raise ValueError(f"Malformed line {index}, got {len(splits)}: {splits}")
            date, desc, cat, amount = splits

            amount = parse_amount(amount)
            if amount == 0:
                continue

            if not cat in TAGS:
                raise ValueError(f"Missing category: {cat}")

            entries.append({
                "transactedAt": date,
                "sourceId": 1,
                "targetId": 2,
                "description": desc,
                "projectId": 3,  # comment out
                "amount": amount,
                "currency": "CZK",
                "isImportant": False,
                "categoryId": TAGS[cat]
            })
        except Exception:
            print(f"ERROR: {file_path}, on line {index}")
            raise

    return entries



def process_files(dir_path: Path, use_month_func: bool = False) -> list[dict]:
    if not dir_path.is_dir():
        raise ValueError(f"not a directory: {dir_path}")

    entries = []
    for file in dir_path.glob("*"):
        print(f"Processing file: {file}")
        if file.is_file():
            if use_month_func:
                entries.extend(process_month_file(file))
            else:
                entries.extend(process_simple_file(file))

    print(f"Found {len(entries)} items to be imported.")

    return entries


def load_categories():
    categories_url = os.path.join(API_URL, "categories")
    print(categories_url)
    result = requests.get(categories_url)
    categories = result.json()["data"]
    for cat in categories:
        TAGS[cat["name"]] = cat["id"]


def upload(entries: list[dict]):
    for entry in entries:
        print(f'putting trans: {entry}')
        r = requests.put(os.path.join(API_URL, "transactions"), json=entry)
        r.raise_for_status()


def main():
    load_categories()
    items = process_files(Path("/home/jonas/Downloads/home"))

    text = "\n".join([
        f"{item['transactedAt']} :: {item['categoryId']} :: {item['amount']} :: {item['description']}"
        for item in items
    ])
    # editor.editor(text)
    x = input("continue? [y/n]:   ")
    if x != "y":
        import sys
        sys.exit(1)

    for index, entry in enumerate(items):
        print(f'{index + 1}/{len(items)}: saving {entry['description']}')
        r = requests.put(os.path.join(API_URL, "transactions"), json=entry)
        r.raise_for_status()


if __name__ == '__main__':
    main()


