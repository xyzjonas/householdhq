import sys
import requests
import os

API_URL = os.getenv('API_URL') or (print('API_URL variable missing') or sys.exit(1))



def main():
    response = requests.get(os.path.join(API_URL, "categories"))
    response.raise_for_status()
    categories = response.json()['data']

    response = requests.get(os.path.join(API_URL, "transactions/all"))
    response.raise_for_status()
    trans = response.json()['data']

    problematic = []
    existing_categories = categories

    for transaction in trans:
        print(f'editing trans: {transaction["id"]} - {transaction["description"]}')
        if len(transaction['tags']) > 1:
            print(f"!!! {transaction['id']} has more than 1 tag")
            problematic.append(transaction)
            continue

        tag = transaction['tags'][0]
        if tag['name'] not in [c['name'] for c in existing_categories]:
            new_cat = {
                'name': tag['name'],
                'description': tag['description'],
                'icon': tag['icon'],
                'color': tag['color'],
            }
            r = requests.put(os.path.join(API_URL, "categories"), json=new_cat)
            if r.status_code != 201:
                print(f"category {tag['name']} can't be created for some reason.")
                problematic.append(transaction)
                continue
            category = r.json()['data']
        else:
            category = [cat for cat in existing_categories if cat['name'] == tag['name']][0]

        connect_cat = {
            "id": transaction['id'],
            "categoryId": category['id']
        }
        r = requests.patch(os.path.join(API_URL, "transactions"), json=connect_cat)
        if r.status_code != 200:
            print(f"category {tag['name']} can't be connected for some reason.")
            problematic.append(transaction)


def test():
    response = requests.get(os.path.join(API_URL, "transactions/all"))
    response.raise_for_status()
    trans = response.json()['data']
    for transaction in trans:
        assert transaction['tags'][0]['name'] == transaction['category']['name']


if __name__ == '__main__':
    if sys.argv[1] == "test":
        test()
    else:
        main()
