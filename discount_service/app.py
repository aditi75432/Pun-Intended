# discount_service/app.py
from flask import Flask, request, jsonify
import pandas as pd
import os
from flask_cors import CORS # NEW: Import CORS for cross-origin requests

app = Flask(__name__)
CORS(app) # NEW: Enable CORS for all routes (important for frontend to access)

# Define the base directory for CSVs. Assumes 'data' folder is next to app.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CUSTOMER_DATA_PATH = os.path.join(BASE_DIR, 'data', 'main_customer_data.csv')
PRODUCT_CATALOG_PATH = os.path.join(BASE_DIR, 'data', 'product_catalog.csv')

# Load datasets once when the app starts
try:
    events_df = pd.read_csv(CUSTOMER_DATA_PATH)
    events_df['event_time'] = pd.to_datetime(events_df['event_time'])
    events_df['product_id'] = events_df['product_id'].astype(str)

    catalog_df = pd.read_csv(PRODUCT_CATALOG_PATH)
    catalog_df['product_id'] = catalog_df['product_id'].astype(str)
except FileNotFoundError as e:
    print(f"Error loading CSV files: {e}. Make sure '{CUSTOMER_DATA_PATH}' and '{PRODUCT_CATALOG_PATH}' exist.")
    exit(1)

# NEW: Endpoint to get all product catalog data
@app.route('/get-catalog', methods=['GET'])
def get_catalog():
    # Convert the DataFrame to a list of dictionaries for JSON response
    # It's important to convert product_id to string here too, to match other parts
    catalog_data = catalog_df.to_dict(orient='records')
    return jsonify(catalog_data)

# Define the existing API endpoint for discount
@app.route('/get-discount', methods=['POST'])
def get_discount():
    data = request.get_json()
    product_id = data.get('product_id')

    if not product_id:
        return jsonify({"error": "Product ID is required"}), 400

    product_data = events_df[events_df['product_id'] == product_id]
    catalog_row = catalog_df[catalog_df['product_id'] == product_id]

    if product_data.empty or catalog_row.empty:
        return jsonify({"error": "Product not found in event data or catalog"}), 404
    
    price = catalog_row['price'].iloc[0]
    cost = catalog_row['cost'].iloc[0]
    category = catalog_row['category'].iloc[0]

    views = product_data[product_data['event_type'] == 'view'].shape[0]
    carts = product_data[product_data['event_type'] == 'cart'].shape[0]
    purchases = product_data[product_data['event_type'] == 'purchase'].shape[0]
    
    margin = price - cost
    max_discount_allowed = round(margin * 0.7, 2)

    discount_amount = 0
    explanation = ""

    if carts > purchases and carts >= 5:
        raw_discount = price * 0.15
        discount_amount = min(raw_discount, max_discount_allowed)
        explanation = "High cart abandonment — offering up to 15% within margin."
    elif views >= 5 and purchases == 0:
        raw_discount = price * 0.10
        discount_amount = min(raw_discount, max_discount_allowed)
        explanation = "Many views but no conversions — gentle 10% nudge."
    elif purchases > 0 and carts > 0:
        raw_discount = price * 0.05
        discount_amount = min(raw_discount, max_discount_allowed)
        explanation = "Returning interest — consider 5% soft promo."
    else:
        explanation = "Low behavioral signal — discount not required."

    discount_percent = round((discount_amount / price) * 100, 2) if price > 0 else 0

    cheaper_alternatives = []
    if discount_amount == 0:
        cheaper_alts_df = catalog_df[
            (catalog_df['category'] == category) &
            (catalog_df['price'] < price) &
            (catalog_df['product_id'] != product_id)
        ].sort_values('price').head(3)

        cheaper_alternatives = cheaper_alts_df[['product_id', 'product_name', 'price']].to_dict(orient='records')

    return jsonify({
        "product_id": product_id,
        "views": views,
        "carts": carts,
        "purchases": purchases,
        "price": round(price, 2),
        "cost": round(cost, 2),
        "margin": round(margin, 2),
        "max_safe_discount": round(max_discount_allowed, 2),
        "suggested_discount_percent": discount_percent,
        "suggested_discount_amount": round(discount_amount, 2),
        "explanation": explanation,
        "cheaper_alternatives": cheaper_alternatives
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5001)