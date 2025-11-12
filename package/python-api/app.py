from flask import Flask, jsonify, request
from flask_cors import CORS
from google.oauth2 import service_account
from googleapiclient.discovery import build
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Google Sheets Configuration
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
SPREADSHEET_ID = os.getenv('GOOGLE_SPREADSHEET_ID')

# Create credentials from environment variables
def get_google_credentials():
    """Create Google credentials from environment variables"""
    credentials_info = {
        "type": "service_account",
        "project_id": os.getenv('GOOGLE_PROJECT_ID'),
        "private_key_id": os.getenv('GOOGLE_PRIVATE_KEY_ID'),
        "private_key": os.getenv('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY', '').replace('\\n', '\n'),
        "client_email": os.getenv('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
        "client_id": os.getenv('GOOGLE_CLIENT_ID'),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": os.getenv('GOOGLE_CLIENT_CERT_URL')
    }
    
    credentials = service_account.Credentials.from_service_account_info(
        credentials_info, scopes=SCOPES
    )
    return credentials

def get_sheets_service():
    """Get Google Sheets API service"""
    credentials = get_google_credentials()
    service = build('sheets', 'v4', credentials=credentials)
    return service

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/film-call-status', methods=['GET'])
def get_film_call_status():
    """
    Get call status from Film_dev sheet
    Returns records with status "อยู่ระหว่างโทรออก"
    """
    try:
        service = get_sheets_service()
        
        # Read data from Film_dev sheet - extended range to include column AS
        sheet_range = 'Film_dev!A:AZ'
        result = service.spreadsheets().values().get(
            spreadsheetId=SPREADSHEET_ID,
            range=sheet_range
        ).execute()
        
        rows = result.get('values', [])
        
        if not rows:
            return jsonify({
                'success': True,
                'data': [],
                'total': 0,
                'message': 'No data found in Film_dev sheet'
            })
        
        # First row is header (or might be Google Sheet column names like AS, AT, AU)
        headers = rows[0]
        
        # Check if first row has sheet column names (A, B, C, AS, AT, etc.)
        first_row_has_column_names = any(
            cell and len(str(cell).strip()) <= 3 and str(cell).strip().isupper() 
            for cell in headers[:5]
        )
        
        if first_row_has_column_names and len(rows) > 1:
            print(f"📋 Detected 2-row header system")
            print(f"Row 0 (Column names): {headers}")
            print(f"Row 1 (Real headers): {rows[1]}")
            headers = rows[1]  # Use second row as real headers
            data_rows = rows[2:]  # Data starts from row 3
        else:
            data_rows = rows[1:]  # Data starts from row 2
        
        print(f"\n=== GOOGLE SHEETS - Film_dev (Call Status) ===")
        print(f"Total columns: {len(headers)}")
        print(f"Headers: {headers}")
        print(f"Total data rows: {len(data_rows)}")
        
        # Find column indexes
        # Fixed column indexes based on your requirements:
        # Column C (index 2) = ผลิตภัณฑ์ที่สนใจ
        # Column F (index 5) = ชื่อ
        # Column G (index 6) = เบอร์โทร
        # Column H (index 7) = หมายเหตุ
        # Column AS (index 44) = status_call
        
        product_idx = 2  # Column C
        name_idx = 5     # Column F
        phone_idx = 6    # Column G
        remarks_idx = 7  # Column H
        status_call_idx = 44  # Column AS
        
        print(f"\n=== MAPPING COLUMNS (FIXED INDEXES) ===")
        print(f"Column C (index 2) = ผลิตภัณฑ์ที่สนใจ: '{headers[product_idx] if len(headers) > product_idx else 'N/A'}'")
        print(f"Column F (index 5) = ชื่อ: '{headers[name_idx] if len(headers) > name_idx else 'N/A'}'")
        print(f"Column G (index 6) = เบอร์โทร: '{headers[phone_idx] if len(headers) > phone_idx else 'N/A'}'")
        print(f"Column H (index 7) = หมายเหตุ: '{headers[remarks_idx] if len(headers) > remarks_idx else 'N/A'}'")
        print(f"Column AS (index 44) = status_call: '{headers[status_call_idx] if len(headers) > status_call_idx else 'N/A'}'")
        
        if len(headers) <= status_call_idx:
            print(f"❌ Headers only have {len(headers)} columns, AS (44) not found")
            return jsonify({
                'success': False,
                'error': f'Column AS not found. Only {len(headers)} columns available.',
                'availableHeaders': headers
            }), 400
        
        # Check first few data rows for column AS to see status values
        print(f"\n📊 Sample data from columns:")
        for idx in range(min(5, len(data_rows))):
            if len(data_rows[idx]) > 0:
                row = data_rows[idx]
                print(f"  Row {idx + 2}:")
                print(f"    - ผลิตภัณฑ์: '{row[product_idx] if len(row) > product_idx else ''}'")
                print(f"    - ชื่อ: '{row[name_idx] if len(row) > name_idx else ''}'")
                print(f"    - เบอร์: '{row[phone_idx] if len(row) > phone_idx else ''}'")
                print(f"    - หมายเหตุ: '{row[remarks_idx] if len(row) > remarks_idx else ''}'")
                print(f"    - สถานะ: '{row[status_call_idx] if len(row) > status_call_idx else ''}'")
        
        # Filter data with status "อยู่ระหว่างโทรออก"
        outgoing_calls = []
        status_values = set()
        
        for idx, row in enumerate(data_rows):
            if not row or len(row) == 0:
                continue
            
            # Get values safely (handle if row is shorter than expected)
            status = row[status_call_idx].strip() if len(row) > status_call_idx and row[status_call_idx] else ""
            product = row[product_idx].strip() if len(row) > product_idx and row[product_idx] else ""
            name = row[name_idx].strip() if len(row) > name_idx and row[name_idx] else ""
            phone = row[phone_idx].strip() if len(row) > phone_idx and row[phone_idx] else ""
            remarks = row[remarks_idx].strip() if len(row) > remarks_idx and row[remarks_idx] else ""
            
            # Collect all status values for debugging
            if status:
                status_values.add(status)
            
            # Filter by status "อยู่ระหว่างโทรออก"
            if status == "อยู่ระหว่างโทรออก" and phone and phone != "-":
                outgoing_calls.append({
                    'id': f'film-{idx + 2}',
                    'customerName': name if name else phone,
                    'phoneNumber': phone,
                    'product': product,
                    'remarks': remarks,
                    'status': 'outgoing',  # Map to frontend status
                    'contactDate': datetime.now().isoformat()
                })
                print(f"✅ Row {idx + 2}: {name or 'No name'} - {phone} - {product} ({status})")
        
        print(f"\n=== UNIQUE STATUS VALUES FOUND ===")
        print(f"Total unique statuses: {len(status_values)}")
        print(f"Status values: {sorted(status_values)}")
        print(f"\n=== RESULTS ===")
        print(f"Total outgoing calls: {len(outgoing_calls)}")
        
        return jsonify({
            'success': True,
            'data': outgoing_calls,
            'total': len(outgoing_calls),
            'timestamp': datetime.now().isoformat(),
            'debug': {
                'totalRows': len(data_rows),
                'matchedRows': len(outgoing_calls),
                'columns': {
                    'product': f"Column C (index {product_idx}): {headers[product_idx] if len(headers) > product_idx else 'N/A'}",
                    'name': f"Column F (index {name_idx}): {headers[name_idx] if len(headers) > name_idx else 'N/A'}",
                    'phone': f"Column G (index {phone_idx}): {headers[phone_idx] if len(headers) > phone_idx else 'N/A'}",
                    'remarks': f"Column H (index {remarks_idx}): {headers[remarks_idx] if len(headers) > remarks_idx else 'N/A'}",
                    'status': f"Column AS (index {status_call_idx}): {headers[status_call_idx] if len(headers) > status_call_idx else 'N/A'}"
                },
                'uniqueStatuses': sorted(list(status_values))
            }
        })
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Check if required environment variables are set
    required_vars = [
        'GOOGLE_SPREADSHEET_ID',
        'GOOGLE_SERVICE_ACCOUNT_EMAIL',
        'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY'
    ]
    
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        print("Please create a .env file with the required variables")
        exit(1)
    
    print("🚀 Starting Flask API server...")
    print(f"📊 Spreadsheet ID: {SPREADSHEET_ID}")
    app.run(host='0.0.0.0', port=5000, debug=True)
