"""
Card Generator Module - For Testing & Educational Purposes Only
Generates valid test credit card numbers using the Luhn algorithm.
"""

import random
from datetime import datetime, timedelta
from typing import List, Dict, Optional


# --- Random Cardholder Name Data ---
FIRST_NAMES = [
    'James', 'Robert', 'John', 'Michael', 'David', 'William', 'Richard', 'Joseph',
    'Thomas', 'Christopher', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark',
    'Donald', 'Steven', 'Andrew', 'Paul', 'Joshua', 'Kenneth', 'Kevin', 'Brian',
    'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan',
    'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin',
    'Scott', 'Brandon', 'Benjamin', 'Samuel', 'Raymond', 'Gregory', 'Frank',
    'Alexander', 'Patrick', 'Jack', 'Dennis', 'Jerry',
    'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan',
    'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra',
    'Ashley', 'Dorothy', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Carol',
    'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura',
    'Cynthia', 'Kathleen', 'Amy', 'Angela', 'Shirley', 'Anna', 'Brenda',
    'Pamela', 'Emma', 'Nicole', 'Helen', 'Samantha', 'Katherine', 'Christine',
    'Debra', 'Rachel', 'Carolyn', 'Janet', 'Catherine', 'Maria', 'Heather',
    'Diane', 'Olivia', 'Julie',
]

LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
    'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
    'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen',
    'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera',
    'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans',
    'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
    'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez',
    'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey', 'Reed', 'Kelly',
    'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
]


CARD_NETWORKS = {
    'visa': {
        'name': 'Visa',
        'prefixes': ['4'],
        'length': 16,
        'cvv_length': 3,
        'icon': '💳',
    },
    'mastercard': {
        'name': 'Mastercard',
        'prefixes': ['51', '52', '53', '54', '55'],
        'prefix_ranges': [(2221, 2720)],
        'length': 16,
        'cvv_length': 3,
        'icon': '💳',
    },
    'amex': {
        'name': 'American Express',
        'prefixes': ['34', '37'],
        'length': 15,
        'cvv_length': 4,
        'icon': '💳',
    },
    'discover': {
        'name': 'Discover',
        'prefixes': ['6011', '644', '645', '646', '647', '648', '649', '65'],
        'length': 16,
        'cvv_length': 3,
        'icon': '💳',
    },
    'jcb': {
        'name': 'JCB',
        'prefixes': [],
        'prefix_ranges': [(3528, 3589)],
        'length': 16,
        'cvv_length': 3,
        'icon': '💳',
    },
    'diners': {
        'name': 'Diners Club',
        'prefixes': ['300', '301', '302', '303', '304', '305', '36', '38'],
        'length': 14,
        'cvv_length': 3,
        'icon': '💳',
    },
    'unionpay': {
        'name': 'UnionPay',
        'prefixes': ['62'],
        'length': 16,
        'cvv_length': 3,
        'icon': '💳',
    },
    'mir': {
        'name': 'Mir',
        'prefixes': ['2200', '2201', '2202', '2203', '2204'],
        'length': 16,
        'cvv_length': 3,
        'icon': '💳',
    },
    'maestro': {
        'name': 'Maestro',
        'prefixes': ['5018', '5020', '5038', '5893', '6304', '6759', '6761', '6762', '6763'],
        'length': 16,
        'cvv_length': 3,
        'icon': '💳',
    },
    'ebt': {
        'name': 'EBT',
        'prefixes': [
            '5076', '5077',  # Common EBT BINs
            '6274',          # Quest EBT
            '5081', '5082',  # State EBT programs
            '6004', '6007',  # FIS / Conduent EBT
            '5085', '5086',  # Additional state BINs
        ],
        'length': 19,
        'cvv_length': 9,
        'icon': '🏛️',
    },
    'custom_491212': {
        'name': 'Custom (491212)',
        'prefixes': ['491212'],
        'length': 19,
        'cvv_length': 9,
        'icon': '💳',
    },
}


def luhn_checksum(card_number: str) -> int:
    """Calculate the Luhn checksum of a card number string."""
    digits = [int(d) for d in card_number]
    odd_digits = digits[-1::-2]
    even_digits = digits[-2::-2]
    total = sum(odd_digits)
    for d in even_digits:
        total += sum(divmod(d * 2, 10))
    return total % 10


def validate_card_number(number: str) -> bool:
    """Validate a card number using the Luhn algorithm."""
    number = number.replace(' ', '').replace('-', '')
    if not number.isdigit() or len(number) < 12 or len(number) > 19:
        return False
    return luhn_checksum(number) == 0


def detect_network(number: str) -> Optional[str]:
    """Detect the card network based on the card number prefix."""
    number = number.replace(' ', '').replace('-', '')
    if not number.isdigit():
        return None

    # Check in order of prefix specificity (longest prefix first)
    matches = []
    for key, config in CARD_NETWORKS.items():
        for prefix in config.get('prefixes', []):
            if number.startswith(prefix):
                matches.append((len(prefix), config['name']))
        for start, end in config.get('prefix_ranges', []):
            prefix_len = len(str(start))
            num_prefix = number[:prefix_len]
            if num_prefix.isdigit() and start <= int(num_prefix) <= end:
                matches.append((prefix_len, config['name']))

    if matches:
        # Return the match with the longest prefix (most specific)
        matches.sort(key=lambda x: x[0], reverse=True)
        return matches[0][1]
    return None


def _get_prefix(network: str) -> str:
    """Get a random valid prefix for a given card network."""
    config = CARD_NETWORKS[network]
    prefixes = list(config.get('prefixes', []))
    prefix_ranges = config.get('prefix_ranges', [])

    # Build a combined list: static prefixes + one random from each range
    candidates = list(prefixes)
    for start, end in prefix_ranges:
        candidates.append(str(random.randint(start, end)))

    if not candidates:
        raise ValueError(f"No prefixes defined for network: {network}")

    return random.choice(candidates)


def generate_card_number(network: str, custom_bin: Optional[str] = None, ebt_length: int = 19) -> str:
    """Generate a valid card number for the specified network."""
    if network not in CARD_NETWORKS:
        raise ValueError(f"Unsupported network: {network}")

    config = CARD_NETWORKS[network]
    
    length = config['length']
    if network == 'ebt':
        length = ebt_length
        
    if custom_bin:
        prefix = custom_bin.replace(' ', '').replace('-', '')
    else:
        prefix = _get_prefix(network)

    if len(prefix) >= length:
        raise ValueError(f"BIN/prefix is too long for {config['name']} (max {length - 1} digits)")

    # Generate random digits to fill up to length - 1 (last digit is check digit)
    remaining = length - len(prefix) - 1
    number = prefix + ''.join(str(random.randint(0, 9)) for _ in range(remaining))

    # Calculate Luhn check digit
    check_digit = (10 - luhn_checksum(number + '0')) % 10
    return number + str(check_digit)


def generate_cvv(network: str) -> str:
    """Generate a random CVV/CVC for the given network."""
    if network in ('custom_491212', 'ebt'):
        return '491212' + ''.join(str(random.randint(0, 9)) for _ in range(3))
        
    config = CARD_NETWORKS[network]
    cvv_length = config['cvv_length']
    return ''.join(str(random.randint(0, 9)) for _ in range(cvv_length))


def generate_expiry() -> Dict[str, str]:
    """Generate a random future expiry date within the next 5 years."""
    now = datetime.now()
    months_ahead = random.randint(1, 60)
    future_month = now.month + months_ahead
    future_year = now.year + (future_month - 1) // 12
    future_month = ((future_month - 1) % 12) + 1

    return {
        'month': f'{future_month:02d}',
        'year': str(future_year),
        'short_year': str(future_year)[-2:],
        'formatted': f'{future_month:02d}/{str(future_year)[-2:]}'
    }


def generate_pin(length: int = 4) -> str:
    """Generate a random PIN of the specified length."""
    if length not in (4, 6):
        length = 4
    return ''.join(str(random.randint(0, 9)) for _ in range(length))


def format_card_number(number: str) -> str:
    """Format a card number with spaces for readability."""
    if len(number) == 15:  # Amex: xxxx xxxxxx xxxxx
        return f'{number[:4]} {number[4:10]} {number[10:]}'
    elif len(number) == 14:  # Diners: xxxx xxxxxx xxxx
        return f'{number[:4]} {number[4:10]} {number[10:]}'
    else:  # Standard: xxxx xxxx xxxx xxxx
        return ' '.join(number[i:i+4] for i in range(0, len(number), 4))


def generate_holder_name() -> str:
    """Generate a random cardholder name."""
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    return f'{first} {last}'


def generate_track2(number: str, expiry: Dict[str, str], cvv: str, network_key: str) -> str:
    """Generate Track 2 magnetic stripe data format."""
    # Special override for the Custom 19 and EBT network based on user request
    if network_key in ('custom_491212', 'ebt'):
        return '491212' + ''.join(str(random.randint(0, 9)) for _ in range(3))
        
    # Standard Format: PAN=YYMM201<CVV><RandomDiscretionaryData>
    yymm = f"{expiry['short_year']}{expiry['month']}"
    service_code = "201"  # 2: Magstripe, 0: Normal auth, 1: No restrictions
    
    # Typical Track 2 length is around 37 characters max
    target_len = 37
    current_len = len(number) + 1 + len(yymm) + len(service_code) + len(cvv)
    padding_len = max(0, target_len - current_len)
    random_padding = ''.join(str(random.randint(0, 9)) for _ in range(padding_len))
    
    return f"{number}={yymm}{service_code}{cvv}{random_padding}"


def generate_card(
    network: str,
    custom_bin: Optional[str] = None,
    include_pin: bool = False,
    pin_length: int = 4,
    ebt_length: int = 19
) -> Dict:
    """Generate a complete test card with all details."""
    number = generate_card_number(network, custom_bin, ebt_length)
    expiry = generate_expiry()
    balance = round(random.uniform(0, 1500), 2)

    cvv = generate_cvv(network)
    
    card = {
        'network': CARD_NETWORKS[network]['name'],
        'network_key': network,
        'number': number,
        'formatted_number': format_card_number(number),
        'cvv': cvv,
        'expiry': expiry,
        'holder_name': generate_holder_name(),
        'balance': balance,
        'formatted_balance': f"${balance:,.2f}",
        'track2': generate_track2(number, expiry, cvv, network),
    }

    if include_pin:
        card['pin'] = generate_pin(pin_length)

    return card


def generate_bulk(
    network: str,
    count: int = 1,
    custom_bin: Optional[str] = None,
    include_pin: bool = False,
    pin_length: int = 4,
    ebt_length: int = 19
) -> List[Dict]:
    """Generate multiple test cards at once. No upper limit."""
    count = max(1, count)
    return [
        generate_card(network, custom_bin, include_pin, pin_length, ebt_length)
        for _ in range(count)
    ]


def get_available_networks() -> Dict[str, Dict]:
    """Return metadata about all available card networks."""
    return {
        key: {
            'name': config['name'],
            'length': config['length'],
            'cvv_length': config['cvv_length'],
        }
        for key, config in CARD_NETWORKS.items()
    }
