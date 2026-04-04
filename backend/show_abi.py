import json

with open('lib/abis/LoyaltyBadge.json') as f:
    abi = json.load(f)['abi']

for fn in abi:
    if fn.get('name') in ('updateBadgeType', 'registerBadgeType'):
        inputs = fn.get('inputs', [])
        print(fn['name'] + ':')
        for i in inputs:
            print('  ' + i['name'] + ' : ' + i['type'])
        print()
