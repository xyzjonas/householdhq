#!/usr/bin/env python3
"""Upload vehicle fuel entries from CSV into HouseholdHQ API.

The script logs in, sorts rows from oldest to newest, and creates entries one-by-one.
When a row is a full tank, it links to the previously created full-tank entry
using `previousFullTankFuelEntryId`.
"""

from __future__ import annotations

import argparse
import csv
import json
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

import requests


DEFAULT_BASE_URL = "https://home.bohunky.xyz"
DEFAULT_CSV = Path("fuel_log.csv")


@dataclass
class FuelRow:
    fueled_at: str
    odometer: float
    fuel_amount: float
    unit_price: float
    is_full_tank: bool
    original_index: int

    @property
    def sort_key(self) -> tuple[datetime, float, int]:
        return (datetime.fromisoformat(self.fueled_at), self.odometer, self.original_index)


def parse_bool(value: str | None) -> bool:
    if value is None:
        return False
    normalized = value.strip().lower()
    return normalized in {"1", "true", "yes", "y", "on"}


def parse_csv(csv_path: Path) -> list[FuelRow]:
    rows: list[FuelRow] = []
    with csv_path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        required = {
            "date",
            "odo",
            "fuel_amount_l",
            "unit_price_kc",
            "isFullTank",
        }
        missing = required.difference(reader.fieldnames or [])
        if missing:
            raise ValueError(f"CSV missing required columns: {', '.join(sorted(missing))}")

        for idx, raw in enumerate(reader, start=2):
            try:
                fueled_at = str(raw["date"]).strip()
                datetime.fromisoformat(fueled_at)
                rows.append(
                    FuelRow(
                        fueled_at=fueled_at,
                        odometer=float(str(raw["odo"]).strip()),
                        fuel_amount=float(str(raw["fuel_amount_l"]).strip()),
                        unit_price=float(str(raw["unit_price_kc"]).strip()),
                        is_full_tank=parse_bool(raw.get("isFullTank")),
                        original_index=idx,
                    )
                )
            except Exception as exc:  # noqa: BLE001
                raise ValueError(f"Invalid CSV row at line {idx}: {raw}") from exc

    rows.sort(key=lambda row: row.sort_key)
    return rows


def login(base_url: str, username: str, password: str) -> str:
    url = f"{base_url.rstrip('/')}/api/login"
    response = requests.post(
        url,
        json={"username": username, "password": password},
        timeout=30,
    )
    response.raise_for_status()
    payload = response.json()
    token = payload.get("token")
    if not token:
        raise RuntimeError(f"Login succeeded but token is missing in response: {payload}")
    return token


def create_fuel_entry(
    base_url: str,
    token: str,
    vehicle_id: int,
    row: FuelRow,
    previous_full_tank_id: int | None,
) -> dict[str, Any]:
    url = f"{base_url.rstrip('/')}/api/vehicles/{vehicle_id}/fuel-entries"
    payload: dict[str, Any] = {
        "fueledAt": row.fueled_at,
        "odometer": row.odometer,
        "fuelAmount": row.fuel_amount,
        "unitPrice": row.unit_price,
        "isFullTank": row.is_full_tank,
    }

    # Explicitly set the back-link; API expects null/number.
    payload["previousFullTankFuelEntryId"] = previous_full_tank_id

    response = requests.post(
        url,
        headers={"Authorization": f"Bearer {token}"},
        json=payload,
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()

    # Server usually returns entry directly, but support wrapped responses too.
    if isinstance(data, dict) and "data" in data and isinstance(data["data"], dict):
        return data["data"]
    if isinstance(data, dict):
        return data
    raise RuntimeError(f"Unexpected create response: {data}")


def get_entry_id(created: dict[str, Any]) -> int:
    entry_id = created.get("id")
    if not isinstance(entry_id, int):
        raise RuntimeError(f"Created entry has no integer 'id': {created}")
    return entry_id


def upload_rows(
    base_url: str,
    token: str,
    vehicle_id: int,
    rows: list[FuelRow],
    dry_run: bool,
) -> None:
    previous_full_tank_id: int | None = None
    total = len(rows)

    for index, row in enumerate(rows, start=1):
        payload_preview = {
            "fueledAt": row.fueled_at,
            "odometer": row.odometer,
            "fuelAmount": row.fuel_amount,
            "unitPrice": row.unit_price,
            "isFullTank": row.is_full_tank,
            "previousFullTankFuelEntryId": previous_full_tank_id,
        }

        if dry_run:
            print(f"[{index}/{total}] DRY RUN {json.dumps(payload_preview, ensure_ascii=True)}")
            if row.is_full_tank:
                previous_full_tank_id = -index
            continue

        created = create_fuel_entry(
            base_url=base_url,
            token=token,
            vehicle_id=vehicle_id,
            row=row,
            previous_full_tank_id=previous_full_tank_id,
        )
        entry_id = get_entry_id(created)

        if row.is_full_tank:
            previous_full_tank_id = entry_id

        print(
            f"[{index}/{total}] created id={entry_id} date={row.fueled_at} "
            f"full={row.is_full_tank} prevFull={payload_preview['previousFullTankFuelEntryId']}"
        )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Upload vehicle fuel entries from CSV to HouseholdHQ API.",
    )
    parser.add_argument("--csv", type=Path, default=DEFAULT_CSV, help="Path to CSV file")
    parser.add_argument(
        "--base-url",
        default=DEFAULT_BASE_URL,
        help="API host (default: https://home.bohunky.xyz)",
    )
    parser.add_argument("--vehicle-id", type=int, required=True, help="Vehicle ID")
    parser.add_argument("--username", required=True, help="Login username")
    parser.add_argument("--password", required=True, help="Login password")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate/preview payloads without uploading",
    )
    return parser


def main() -> None:
    args = build_parser().parse_args()

    if not args.csv.exists():
        raise FileNotFoundError(f"CSV not found: {args.csv}")

    rows = parse_csv(args.csv)
    print(f"Loaded {len(rows)} rows from {args.csv}")

    token = login(args.base_url, args.username, args.password)
    print("Authenticated successfully")

    upload_rows(
        base_url=args.base_url,
        token=token,
        vehicle_id=args.vehicle_id,
        rows=rows,
        dry_run=args.dry_run,
    )


if __name__ == "__main__":
    main()
