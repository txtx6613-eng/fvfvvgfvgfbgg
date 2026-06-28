"""
VCC Generator - Flask Web Application
For Testing & Educational Purposes Only
"""

from flask import Flask, render_template, request, jsonify
from generator import (
    generate_bulk,
    validate_card_number,
    detect_network,
    get_available_networks,
    format_card_number,
)

app = Flask(__name__)


@app.route('/')
def index():
    """Serve the main application page."""
    networks = get_available_networks()
    return render_template('index.html', networks=networks)


@app.route('/api/generate', methods=['POST'])
def api_generate():
    """Generate test card numbers."""
    try:
        data = request.get_json()
        network = data.get('network', 'visa')
        count = int(data.get('count', 1))
        custom_bin = data.get('custom_bin', '').strip() or None
        include_pin = data.get('include_pin', False)
        pin_length = data.get('pin_length', 4)
        ebt_length = data.get('ebt_length', 19)

        # Validate network
        available = get_available_networks()
        if network not in available:
            return jsonify({'error': f'Invalid network: {network}'}), 400

        # Validate count
        if count < 1:
            return jsonify({'error': 'Count must be at least 1'}), 400

        # Validate custom BIN
        if custom_bin and (not custom_bin.isdigit() or len(custom_bin) < 1 or len(custom_bin) > 10):
            return jsonify({'error': 'Custom BIN must be 1-10 digits'}), 400

        cards = generate_bulk(network, count, custom_bin, include_pin, pin_length, ebt_length)
        return jsonify({'success': True, 'cards': cards, 'count': len(cards)})

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred'}), 500


@app.route('/api/validate', methods=['POST'])
def api_validate():
    """Validate a card number using the Luhn algorithm."""
    try:
        data = request.get_json()
        number = data.get('number', '').strip()

        if not number:
            return jsonify({'error': 'Card number is required'}), 400

        clean_number = number.replace(' ', '').replace('-', '')
        is_valid = validate_card_number(clean_number)
        network = detect_network(clean_number) if is_valid else None
        formatted = format_card_number(clean_number) if clean_number.isdigit() else number

        return jsonify({
            'success': True,
            'valid': is_valid,
            'network': network,
            'formatted': formatted,
            'number': clean_number,
        })

    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred'}), 500


@app.route('/api/networks', methods=['GET'])
def api_networks():
    """Return available card networks."""
    return jsonify(get_available_networks())


if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("  VCC Generator - For Testing & Educational Purposes Only")
    print("  Running at: http://127.0.0.1:5000")
    print("=" * 60 + "\n")
    app.run(debug=True, host='127.0.0.1', port=5000)
