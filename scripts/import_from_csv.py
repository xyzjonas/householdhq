import sys
import requests
import re
import os


API_URL = os.getenv('API_URL') or (print('API_URL variable missing') or sys.exit(1))


def main():
    file = sys.argv[1]

    entries = []
    tags = set()
    with open(file, "r") as csv_file:
        for index, line in enumerate(csv_file.readlines()):
            try:
                print(f"line {index}: {line}")
                if not line.strip():
                    continue
                line = re.sub(r"(\d),(\d)", r"\1.\2", line)
                _, date, desc, cat, amount, _, _, _ = line.split("\t")
                if date:
                    dd, mm, yyy = date.split(".")
                    date = f"{yyy}-{mm}-{dd}"
                tags.add(cat)
                # match = re.findall(r"(\d+\.\d+)", amount)
                # amount = float(match[0]) if match else 0
                amount = float(amount)
                entries.append({
                    "created": date,
                    "sourceId": 1,
                    "description": desc,
                    "amount": amount,
                    "currency": "CZK",
                    "tags": cat
                })
            except Exception as e:
                print(f"ERROR on line {index}")
                raise

    print(os.path.join(API_URL, "tags"))
    # for tag in tags:
    #     print(f'putting trans: {tag}')
    #     requests.put(os.path.join(API_URL, "tags"), json={"name": tag})

    for entry in entries:
        print(f'putting trans: {entry}')
        r = requests.put(os.path.join(API_URL, "transactions"), json=entry)
        r.raise_for_status()


if __name__ == '__main__':
    main()


