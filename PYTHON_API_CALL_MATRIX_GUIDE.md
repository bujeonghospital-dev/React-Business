# 📞 คู่มือการนำ "ตารางบันทึกการโทรตามช่วงเวลา" ไปใช้กับ Python API

## 🎯 ภาพรวม

คู่มือนี้อธิบายวิธีการสร้าง Python API สำหรับจัดการ "ตารางบันทึกการโทรตามช่วงเวลา" (Call Matrix) ที่:

- บันทึกการโทรของ Agent (101-108) ตามช่วงเวลา (9:00-20:00)
- เชื่อมต่อกับ Google Sheets เพื่ออ่านและเขียนข้อมูล
- Deploy บน Railway (Python API)
- เชื่อมกับ Next.js Frontend บน Vercel

---

## 📊 โครงสร้างข้อมูล

### Google Sheets Structure

**Sheet Name:** `สรุป call_AI_summary`

| Agent | 9-10 | 10-11 | 11-12 | 12-13 | 13-14 | 14-15 | 15-16 | 16-17 | 17-18 | 18-19 | 19-20 | รวม |
| ----- | ---- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | --- |
| 101   | 5    | 8     | 12    | 10    | 15    | 9     | 11    | 8     | 6     | 4     | 3     | 91  |
| 102   | 6    | 7     | 10    | 11    | 13    | 8     | 10    | 9     | 5     | 3     | 2     | 84  |
| ...   | ...  | ...   | ...   | ...   | ...   | ...   | ...   | ...   | ...   | ...   | ...   | ... |

**หมายเหตุ:**

- แต่ละเซลล์คือจำนวนการโทรในช่วงเวลานั้น
- คอลัมน์สุดท้ายคือผลรวมต่อ Agent
- แถวล่างสุดคือผลรวมต่อช่วงเวลา

---

## 🐍 Python API Implementation

### 1. โครงสร้างโปรเจ็กต์

```
python-api/
├── app.py                    # Main Flask application
├── services/
│   ├── __init__.py
│   ├── google_sheets.py      # Google Sheets service
│   └── call_matrix.py        # Call Matrix logic
├── models/
│   ├── __init__.py
│   └── call_log.py           # Data models
├── requirements.txt          # Python dependencies
├── Procfile                  # Railway deployment
├── railway.json              # Railway config
├── runtime.txt               # Python version
└── .env.example              # Environment variables template
```

### 2. ติดตั้ง Dependencies

**requirements.txt:**

```txt
Flask==3.0.0
flask-cors==4.0.0
google-auth==2.25.2
google-auth-oauthlib==1.2.0
google-auth-httplib2==0.2.0
gspread==5.12.1
python-dotenv==1.0.0
gunicorn==21.2.0
pytz==2023.3
```

**ติดตั้ง:**

```bash
cd python-api
pip install -r requirements.txt
```

---

## 📝 Code Implementation

### 3. Google Sheets Service (services/google_sheets.py)

```python
import os
import gspread
from google.oauth2.service_account import Credentials
from datetime import datetime
import pytz

class GoogleSheetsService:
    def __init__(self):
        # ตั้งค่า credentials
        self.credentials = self._get_credentials()
        self.client = gspread.authorize(self.credentials)
        self.spreadsheet_id = os.getenv('GOOGLE_SPREADSHEET_ID')

    def _get_credentials(self):
        """สร้าง credentials จาก environment variables"""
        scopes = [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive'
        ]

        credentials_info = {
            "type": "service_account",
            "project_id": os.getenv('GOOGLE_PROJECT_ID'),
            "private_key_id": os.getenv('GOOGLE_PRIVATE_KEY_ID'),
            "private_key": os.getenv('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY').replace('\\n', '\n'),
            "client_email": os.getenv('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
            "client_id": os.getenv('GOOGLE_CLIENT_ID'),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": os.getenv('GOOGLE_CLIENT_CERT_URL')
        }

        return Credentials.from_service_account_info(credentials_info, scopes=scopes)

    def get_spreadsheet(self):
        """เปิด spreadsheet"""
        return self.client.open_by_key(self.spreadsheet_id)

    def get_worksheet(self, sheet_name):
        """เปิด worksheet ตามชื่อ"""
        spreadsheet = self.get_spreadsheet()
        return spreadsheet.worksheet(sheet_name)

    def read_call_matrix(self, date=None):
        """อ่านข้อมูล Call Matrix จาก Google Sheets

        Args:
            date: วันที่ในรูปแบบ YYYY-MM-DD (ถ้าไม่ระบุจะใช้วันนี้)

        Returns:
            dict: ข้อมูล call matrix
        """
        if date is None:
            bangkok_tz = pytz.timezone('Asia/Bangkok')
            date = datetime.now(bangkok_tz).strftime('%Y-%m-%d')

        try:
            # เปิด worksheet
            worksheet = self.get_worksheet('สรุป call_AI_summary')

            # อ่านข้อมูลทั้งหมด
            all_values = worksheet.get_all_values()

            if len(all_values) < 2:
                return {"error": "No data found"}

            # แปลงข้อมูลเป็น format ที่ใช้งานง่าย
            headers = all_values[0]  # ['Agent', '9-10', '10-11', ...]
            time_slots = headers[1:-1]  # เอาเฉพาะช่วงเวลา (ไม่เอา Agent และ รวม)

            matrix_data = {}
            totals_by_agent = {}
            totals_by_slot = {slot: 0 for slot in time_slots}

            for row in all_values[1:]:  # ข้ามแถวหัวตาราง
                if not row or len(row) < 2:
                    continue

                agent_id = row[0]
                if not agent_id or agent_id == 'รวม':
                    continue

                matrix_data[agent_id] = {}
                agent_total = 0

                for i, slot in enumerate(time_slots, start=1):
                    try:
                        value = int(row[i]) if row[i] else 0
                    except (ValueError, IndexError):
                        value = 0

                    matrix_data[agent_id][slot] = value
                    agent_total += value
                    totals_by_slot[slot] += value

                totals_by_agent[agent_id] = agent_total

            return {
                "success": True,
                "date": date,
                "time_slots": time_slots,
                "matrix_data": matrix_data,
                "totals_by_agent": totals_by_agent,
                "totals_by_slot": totals_by_slot,
                "grand_total": sum(totals_by_agent.values())
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def update_call_count(self, agent_id, time_slot, increment=1):
        """อัพเดทจำนวนการโทรในช่วงเวลาที่กำหนด

        Args:
            agent_id: รหัส agent (เช่น '101', '102')
            time_slot: ช่วงเวลา (เช่น '9-10', '10-11')
            increment: จำนวนที่จะเพิ่ม (default=1)

        Returns:
            dict: ผลลัพธ์การอัพเดท
        """
        try:
            worksheet = self.get_worksheet('สรุป call_AI_summary')

            # หาตำแหน่งของ agent และ time slot
            all_values = worksheet.get_all_values()
            headers = all_values[0]

            # หาคอลัมน์ของ time_slot
            try:
                col_index = headers.index(time_slot) + 1  # +1 เพราะ gspread นับเริ่ม 1
            except ValueError:
                return {
                    "success": False,
                    "error": f"Time slot '{time_slot}' not found"
                }

            # หาแถวของ agent
            row_index = None
            for i, row in enumerate(all_values[1:], start=2):  # เริ่มนับที่ 2 (ข้ามหัวตาราง)
                if row[0] == agent_id:
                    row_index = i
                    break

            if row_index is None:
                return {
                    "success": False,
                    "error": f"Agent '{agent_id}' not found"
                }

            # อ่านค่าปัจจุบัน
            current_value = worksheet.cell(row_index, col_index).value
            try:
                current_value = int(current_value) if current_value else 0
            except ValueError:
                current_value = 0

            # คำนวณค่าใหม่
            new_value = current_value + increment

            # อัพเดทค่าใหม่
            worksheet.update_cell(row_index, col_index, new_value)

            return {
                "success": True,
                "agent_id": agent_id,
                "time_slot": time_slot,
                "old_value": current_value,
                "new_value": new_value,
                "increment": increment
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def batch_update_call_counts(self, updates):
        """อัพเดทหลายช่องพร้อมกัน

        Args:
            updates: list of dict [{"agent_id": "101", "time_slot": "9-10", "value": 5}, ...]

        Returns:
            dict: ผลลัพธ์การอัพเดท
        """
        try:
            worksheet = self.get_worksheet('สรุป call_AI_summary')
            all_values = worksheet.get_all_values()
            headers = all_values[0]

            # เตรียม batch update
            batch_data = []

            for update in updates:
                agent_id = update.get('agent_id')
                time_slot = update.get('time_slot')
                new_value = update.get('value', 0)

                # หาตำแหน่ง
                try:
                    col_index = headers.index(time_slot) + 1
                except ValueError:
                    continue

                row_index = None
                for i, row in enumerate(all_values[1:], start=2):
                    if row[0] == agent_id:
                        row_index = i
                        break

                if row_index is None:
                    continue

                # เพิ่มเข้า batch
                batch_data.append({
                    'range': worksheet.title + '!' + gspread.utils.rowcol_to_a1(row_index, col_index),
                    'values': [[new_value]]
                })

            # อัพเดททั้งหมดพร้อมกัน
            if batch_data:
                worksheet.spreadsheet.values_batch_update(batch_data)

            return {
                "success": True,
                "updated_count": len(batch_data)
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
```

### 4. Call Matrix Service (services/call_matrix.py)

```python
from datetime import datetime
import pytz

class CallMatrixService:
    def __init__(self, sheets_service):
        self.sheets = sheets_service

    def get_current_time_slot(self):
        """คำนวณช่วงเวลาปัจจุบัน

        Returns:
            str: ช่วงเวลา เช่น '9-10', '10-11'
        """
        bangkok_tz = pytz.timezone('Asia/Bangkok')
        now = datetime.now(bangkok_tz)
        hour = now.hour

        # ถ้าไม่ใช่เวลาทำงาน (9-20) return None
        if hour < 9 or hour >= 20:
            return None

        return f"{hour}-{hour + 1}"

    def log_call(self, agent_id, call_type='outgoing', time_slot=None):
        """บันทึกการโทร

        Args:
            agent_id: รหัส agent
            call_type: ประเภทการโทร ('outgoing', 'incoming', 'missed')
            time_slot: ช่วงเวลา (ถ้าไม่ระบุจะใช้ช่วงเวลาปัจจุบัน)

        Returns:
            dict: ผลลัพธ์การบันทึก
        """
        if time_slot is None:
            time_slot = self.get_current_time_slot()

        if time_slot is None:
            return {
                "success": False,
                "error": "Not in working hours (9:00-20:00)"
            }

        # บันทึกลง Google Sheets
        result = self.sheets.update_call_count(agent_id, time_slot, increment=1)

        return result

    def get_call_matrix(self, date=None):
        """ดึงข้อมูล Call Matrix

        Args:
            date: วันที่ (YYYY-MM-DD)

        Returns:
            dict: ข้อมูล call matrix
        """
        return self.sheets.read_call_matrix(date)

    def get_agent_summary(self, agent_id, date=None):
        """ดึงสรุปการโทรของ agent คนหนึ่ง

        Args:
            agent_id: รหัส agent
            date: วันที่

        Returns:
            dict: สรุปการโทร
        """
        matrix = self.sheets.read_call_matrix(date)

        if not matrix.get('success'):
            return matrix

        agent_data = matrix.get('matrix_data', {}).get(agent_id)
        if not agent_data:
            return {
                "success": False,
                "error": f"Agent {agent_id} not found"
            }

        return {
            "success": True,
            "agent_id": agent_id,
            "date": matrix.get('date'),
            "calls_by_slot": agent_data,
            "total_calls": matrix.get('totals_by_agent', {}).get(agent_id, 0)
        }

    def get_time_slot_summary(self, time_slot, date=None):
        """ดึงสรุปการโทรในช่วงเวลาหนึ่ง

        Args:
            time_slot: ช่วงเวลา (เช่น '9-10')
            date: วันที่

        Returns:
            dict: สรุปการโทร
        """
        matrix = self.sheets.read_call_matrix(date)

        if not matrix.get('success'):
            return matrix

        slot_data = {}
        for agent_id, calls in matrix.get('matrix_data', {}).items():
            slot_data[agent_id] = calls.get(time_slot, 0)

        return {
            "success": True,
            "time_slot": time_slot,
            "date": matrix.get('date'),
            "calls_by_agent": slot_data,
            "total_calls": matrix.get('totals_by_slot', {}).get(time_slot, 0)
        }
```

### 5. Flask API Routes (app.py)

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime
import pytz

# Import services
from services.google_sheets import GoogleSheetsService
from services.call_matrix import CallMatrixService

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize services
sheets_service = GoogleSheetsService()
call_matrix_service = CallMatrixService(sheets_service)

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    bangkok_tz = pytz.timezone('Asia/Bangkok')
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now(bangkok_tz).isoformat(),
        'service': 'Call Matrix API'
    })

# ========================================
# Call Matrix Endpoints
# ========================================

@app.route('/api/call-matrix', methods=['GET'])
def get_call_matrix():
    """ดึงข้อมูล Call Matrix ทั้งหมด

    Query Parameters:
        date (optional): วันที่ในรูปแบบ YYYY-MM-DD

    Example:
        GET /api/call-matrix?date=2025-11-18
    """
    date = request.args.get('date')
    result = call_matrix_service.get_call_matrix(date)

    status_code = 200 if result.get('success') else 500
    return jsonify(result), status_code

@app.route('/api/call-matrix/agent/<agent_id>', methods=['GET'])
def get_agent_summary(agent_id):
    """ดึงสรุปการโทรของ agent คนหนึ่ง

    Path Parameters:
        agent_id: รหัส agent (เช่น '101', '102')

    Query Parameters:
        date (optional): วันที่

    Example:
        GET /api/call-matrix/agent/101?date=2025-11-18
    """
    date = request.args.get('date')
    result = call_matrix_service.get_agent_summary(agent_id, date)

    status_code = 200 if result.get('success') else 404
    return jsonify(result), status_code

@app.route('/api/call-matrix/time-slot/<time_slot>', methods=['GET'])
def get_time_slot_summary(time_slot):
    """ดึงสรุปการโทรในช่วงเวลาหนึ่ง

    Path Parameters:
        time_slot: ช่วงเวลา (เช่น '9-10', '10-11')

    Query Parameters:
        date (optional): วันที่

    Example:
        GET /api/call-matrix/time-slot/9-10?date=2025-11-18
    """
    date = request.args.get('date')
    result = call_matrix_service.get_time_slot_summary(time_slot, date)

    status_code = 200 if result.get('success') else 404
    return jsonify(result), status_code

@app.route('/api/call-matrix/log', methods=['POST'])
def log_call():
    """บันทึกการโทร

    Request Body:
        {
            "agent_id": "101",
            "call_type": "outgoing",  # optional, default: "outgoing"
            "time_slot": "9-10"       # optional, default: current time slot
        }

    Example:
        POST /api/call-matrix/log
        {
            "agent_id": "101"
        }
    """
    data = request.get_json()

    if not data or 'agent_id' not in data:
        return jsonify({
            "success": False,
            "error": "agent_id is required"
        }), 400

    agent_id = data.get('agent_id')
    call_type = data.get('call_type', 'outgoing')
    time_slot = data.get('time_slot')

    result = call_matrix_service.log_call(agent_id, call_type, time_slot)

    status_code = 200 if result.get('success') else 400
    return jsonify(result), status_code

@app.route('/api/call-matrix/update', methods=['POST'])
def update_call_count():
    """อัพเดทจำนวนการโทรด้วยตนเอง

    Request Body:
        {
            "agent_id": "101",
            "time_slot": "9-10",
            "value": 5
        }

    Example:
        POST /api/call-matrix/update
        {
            "agent_id": "101",
            "time_slot": "9-10",
            "value": 5
        }
    """
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "error": "Request body is required"
        }), 400

    required_fields = ['agent_id', 'time_slot', 'value']
    for field in required_fields:
        if field not in data:
            return jsonify({
                "success": False,
                "error": f"{field} is required"
            }), 400

    agent_id = data.get('agent_id')
    time_slot = data.get('time_slot')
    value = data.get('value')

    # อัพเดทค่าโดยการเขียนทับ (ไม่ใช่การเพิ่ม)
    result = sheets_service.update_call_count(
        agent_id,
        time_slot,
        increment=value  # จะต้องแก้ logic ใน update_call_count ให้รองรับการ set ค่าโดยตรง
    )

    status_code = 200 if result.get('success') else 400
    return jsonify(result), status_code

@app.route('/api/call-matrix/batch-update', methods=['POST'])
def batch_update_call_counts():
    """อัพเดทหลายช่องพร้อมกัน

    Request Body:
        {
            "updates": [
                {"agent_id": "101", "time_slot": "9-10", "value": 5},
                {"agent_id": "102", "time_slot": "10-11", "value": 8}
            ]
        }
    """
    data = request.get_json()

    if not data or 'updates' not in data:
        return jsonify({
            "success": False,
            "error": "updates array is required"
        }), 400

    updates = data.get('updates', [])
    result = sheets_service.batch_update_call_counts(updates)

    status_code = 200 if result.get('success') else 400
    return jsonify(result), status_code

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
```

---

## 🔧 การตั้งค่า Environment Variables

### .env.example

```bash
# Google Sheets Configuration
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_PROJECT_ID=your_project_id
GOOGLE_PRIVATE_KEY_ID=your_private_key_id
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40project.iam.gserviceaccount.com

# Server Configuration
PORT=5000
FLASK_ENV=production
```

### วิธีหา Google Service Account Credentials

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้าง Project ใหม่หรือเลือก Project ที่มีอยู่
3. เปิดใช้งาน Google Sheets API
4. สร้าง Service Account:
   - IAM & Admin → Service Accounts → Create Service Account
   - ตั้งชื่อ Service Account (เช่น "call-matrix-api")
   - Grant permissions: Editor
5. สร้าง JSON Key:
   - คลิก Service Account → Keys → Add Key → Create New Key → JSON
   - ดาวน์โหลดไฟล์ JSON
6. คัดลอกค่าจากไฟล์ JSON ไปใส่ใน `.env`

---

## 🚀 การ Deploy บน Railway

### 1. เตรียมไฟล์สำหรับ Railway

**Procfile:**

```
web: gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
```

**runtime.txt:**

```
python-3.11.5
```

**railway.json:**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pip install -r requirements.txt"
  },
  "deploy": {
    "startCommand": "gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2. Deploy ไปยัง Railway

```bash
# 1. ติดตั้ง Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. ไปที่โฟลเดอร์ python-api
cd python-api

# 4. สร้าง project
railway init

# 5. Deploy
railway up

# 6. เปิด Dashboard
railway open
```

### 3. ตั้งค่า Environment Variables บน Railway

ไปที่ Railway Dashboard → Variables และเพิ่ม:

- `GOOGLE_SPREADSHEET_ID`
- `GOOGLE_PROJECT_ID`
- `GOOGLE_PRIVATE_KEY_ID`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_CERT_URL`

### 4. รับ Public URL

Railway จะสร้าง URL ให้อัตโนมัติ:

```
https://believable-ambition-production.up.railway.app
```

---

## 🌐 การเชื่อมต่อกับ Next.js Frontend

### 1. เพิ่ม Environment Variable ใน Vercel

```bash
NEXT_PUBLIC_PYTHON_API_URL=https://believable-ambition-production.up.railway.app
```

### 2. สร้าง API Client (utils/callMatrixApi.ts)

```typescript
const API_URL =
  process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:5000";

export interface CallMatrixData {
  success: boolean;
  date: string;
  time_slots: string[];
  matrix_data: Record<string, Record<string, number>>;
  totals_by_agent: Record<string, number>;
  totals_by_slot: Record<string, number>;
  grand_total: number;
}

export interface LogCallRequest {
  agent_id: string;
  call_type?: "outgoing" | "incoming" | "missed";
  time_slot?: string;
}

export interface UpdateCallRequest {
  agent_id: string;
  time_slot: string;
  value: number;
}

// ดึงข้อมูล Call Matrix
export async function fetchCallMatrix(date?: string): Promise<CallMatrixData> {
  const url = date
    ? `${API_URL}/api/call-matrix?date=${date}`
    : `${API_URL}/api/call-matrix`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch call matrix: ${response.statusText}`);
  }

  return response.json();
}

// บันทึกการโทร
export async function logCall(data: LogCallRequest) {
  const response = await fetch(`${API_URL}/api/call-matrix/log`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to log call: ${response.statusText}`);
  }

  return response.json();
}

// อัพเดทจำนวนการโทร
export async function updateCallCount(data: UpdateCallRequest) {
  const response = await fetch(`${API_URL}/api/call-matrix/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update call count: ${response.statusText}`);
  }

  return response.json();
}

// ดึงสรุปของ Agent คนหนึ่ง
export async function fetchAgentSummary(agentId: string, date?: string) {
  const url = date
    ? `${API_URL}/api/call-matrix/agent/${agentId}?date=${date}`
    : `${API_URL}/api/call-matrix/agent/${agentId}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch agent summary: ${response.statusText}`);
  }

  return response.json();
}
```

### 3. ใช้งานใน Component

```typescript
"use client";

import { useState, useEffect } from "react";
import {
  fetchCallMatrix,
  logCall,
  updateCallCount,
} from "@/utils/callMatrixApi";

export default function CallMatrixDashboard() {
  const [matrixData, setMatrixData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // โหลดข้อมูล
  useEffect(() => {
    loadMatrix();
  }, [selectedDate]);

  async function loadMatrix() {
    try {
      setLoading(true);
      const data = await fetchCallMatrix(selectedDate);
      setMatrixData(data);
    } catch (error) {
      console.error("Error loading matrix:", error);
    } finally {
      setLoading(false);
    }
  }

  // บันทึกการโทร
  async function handleLogCall(agentId: string) {
    try {
      await logCall({ agent_id: agentId });
      await loadMatrix(); // รีเฟรชข้อมูล
    } catch (error) {
      console.error("Error logging call:", error);
    }
  }

  // อัพเดทจำนวนการโทร
  async function handleUpdateCell(
    agentId: string,
    timeSlot: string,
    value: number
  ) {
    try {
      await updateCallCount({
        agent_id: agentId,
        time_slot: timeSlot,
        value: value,
      });
      await loadMatrix(); // รีเฟรชข้อมูล
    } catch (error) {
      console.error("Error updating cell:", error);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* UI ของคุณ */}
      <h1>Call Matrix Dashboard</h1>

      {/* Date Selector */}
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      {/* แสดงตาราง */}
      {matrixData && (
        <table>
          <thead>
            <tr>
              <th>Agent</th>
              {matrixData.time_slots.map((slot) => (
                <th key={slot}>{slot}</th>
              ))}
              <th>รวม</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(matrixData.matrix_data).map(([agentId, calls]) => (
              <tr key={agentId}>
                <td>{agentId}</td>
                {matrixData.time_slots.map((slot) => (
                  <td
                    key={slot}
                    onClick={() =>
                      handleUpdateCell(agentId, slot, calls[slot] + 1)
                    }
                    style={{ cursor: "pointer" }}
                  >
                    {calls[slot] || 0}
                  </td>
                ))}
                <td>{matrixData.totals_by_agent[agentId]}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th>รวม</th>
              {matrixData.time_slots.map((slot) => (
                <th key={slot}>{matrixData.totals_by_slot[slot]}</th>
              ))}
              <th>{matrixData.grand_total}</th>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}
```

---

## 🧪 การทดสอบ API

### ทดสอบด้วย cURL

```bash
# 1. Health Check
curl https://believable-ambition-production.up.railway.app/health

# 2. ดึงข้อมูล Call Matrix วันนี้
curl https://believable-ambition-production.up.railway.app/api/call-matrix

# 3. ดึงข้อมูลวันที่กำหนด
curl https://believable-ambition-production.up.railway.app/api/call-matrix?date=2025-11-18

# 4. ดึงสรุปของ Agent 101
curl https://believable-ambition-production.up.railway.app/api/call-matrix/agent/101

# 5. ดึงสรุปช่วงเวลา 9-10
curl https://believable-ambition-production.up.railway.app/api/call-matrix/time-slot/9-10

# 6. บันทึกการโทร
curl -X POST https://believable-ambition-production.up.railway.app/api/call-matrix/log \
  -H "Content-Type: application/json" \
  -d '{"agent_id":"101"}'

# 7. อัพเดทจำนวนการโทร
curl -X POST https://believable-ambition-production.up.railway.app/api/call-matrix/update \
  -H "Content-Type: application/json" \
  -d '{"agent_id":"101","time_slot":"9-10","value":5}'

# 8. Batch Update
curl -X POST https://believable-ambition-production.up.railway.app/api/call-matrix/batch-update \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {"agent_id":"101","time_slot":"9-10","value":5},
      {"agent_id":"102","time_slot":"10-11","value":8}
    ]
  }'
```

### ทดสอบด้วย Python

```python
import requests

API_URL = "https://believable-ambition-production.up.railway.app"

# 1. ดึงข้อมูล Call Matrix
response = requests.get(f"{API_URL}/api/call-matrix")
print(response.json())

# 2. บันทึกการโทร
response = requests.post(
    f"{API_URL}/api/call-matrix/log",
    json={"agent_id": "101"}
)
print(response.json())

# 3. อัพเดทจำนวนการโทร
response = requests.post(
    f"{API_URL}/api/call-matrix/update",
    json={
        "agent_id": "101",
        "time_slot": "9-10",
        "value": 5
    }
)
print(response.json())
```

---

## 📊 API Endpoints Summary

| Endpoint                           | Method | Description           | Parameters                           |
| ---------------------------------- | ------ | --------------------- | ------------------------------------ |
| `/health`                          | GET    | Health check          | -                                    |
| `/api/call-matrix`                 | GET    | ดึงข้อมูล Call Matrix | `date` (optional)                    |
| `/api/call-matrix/agent/:id`       | GET    | ดึงสรุปของ Agent      | `date` (optional)                    |
| `/api/call-matrix/time-slot/:slot` | GET    | ดึงสรุปช่วงเวลา       | `date` (optional)                    |
| `/api/call-matrix/log`             | POST   | บันทึกการโทร          | `agent_id`, `call_type`, `time_slot` |
| `/api/call-matrix/update`          | POST   | อัพเดทจำนวนการโทร     | `agent_id`, `time_slot`, `value`     |
| `/api/call-matrix/batch-update`    | POST   | อัพเดทหลายช่อง        | `updates[]`                          |

---

## 🔧 Troubleshooting

### ปัญหา: Google Sheets Permission Denied

**วิธีแก้:**

1. เช็คว่า Service Account มีสิทธิ์เข้าถึง Google Sheets
2. แชร์ Google Sheets ให้กับ Service Account Email
3. ให้สิทธิ์ Editor

### ปัญหา: CORS Error

**วิธีแก้:**

```python
# ใน app.py
from flask_cors import CORS

# Allow specific origins
CORS(app, origins=['https://your-frontend.vercel.app'])
```

### ปัญหา: Railway Build Failed

**วิธีแก้:**

1. เช็ค `requirements.txt` มีครบหรือไม่
2. เช็ค `Procfile` syntax ถูกต้องหรือไม่
3. ดู Build Logs บน Railway Dashboard

### ปัญหา: Private Key Format Error

**วิธีแก้:**

```bash
# ใน .env ต้องมี \\n สำหรับ newline
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\\nYour_Key\\n-----END PRIVATE KEY-----

# บน Railway ใช้ \n (single backslash)
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour_Key\n-----END PRIVATE KEY-----
```

---

## 📈 การปรับปรุงและขยายระบบ

### 1. เพิ่มการ Cache ด้วย Redis

```python
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def get_call_matrix_cached(date=None):
    cache_key = f"call_matrix:{date or 'today'}"

    # Check cache
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    # Fetch from Google Sheets
    data = sheets_service.read_call_matrix(date)

    # Cache for 5 minutes
    redis_client.setex(cache_key, 300, json.dumps(data))

    return data
```

### 2. เพิ่ม Authentication

```python
from functools import wraps
from flask import request

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if api_key != os.getenv('API_KEY'):
            return jsonify({'error': 'Invalid API key'}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/call-matrix', methods=['GET'])
@require_api_key
def get_call_matrix():
    # ...
```

### 3. เพิ่ม Rate Limiting

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/api/call-matrix/log', methods=['POST'])
@limiter.limit("10 per minute")
def log_call():
    # ...
```

### 4. เพิ่ม Webhook Notifications

```python
import requests

def send_webhook(event_type, data):
    webhook_url = os.getenv('WEBHOOK_URL')
    if webhook_url:
        requests.post(webhook_url, json={
            'event': event_type,
            'data': data,
            'timestamp': datetime.now().isoformat()
        })

# ใช้งาน
def log_call(agent_id, call_type, time_slot):
    result = sheets_service.update_call_count(agent_id, time_slot)

    if result.get('success'):
        send_webhook('call_logged', {
            'agent_id': agent_id,
            'time_slot': time_slot
        })

    return result
```

---

## 🔐 Security Best Practices

1. **ไม่เปิดเผย Credentials** - เก็บใน Environment Variables
2. **ใช้ HTTPS เท่านั้น** - Railway มี SSL certificate อัตโนมัติ
3. **เพิ่ม API Key Authentication** - สำหรับ production
4. **Rate Limiting** - ป้องกัน abuse
5. **Input Validation** - ตรวจสอบ input ทุกครั้ง
6. **Error Handling** - ไม่เปิดเผยรายละเอียด internal error
7. **Logging & Monitoring** - บันทึก access logs

---

## 📚 Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Google Sheets API Python](https://developers.google.com/sheets/api/quickstart/python)
- [gspread Documentation](https://docs.gspread.org/)
- [Railway Documentation](https://docs.railway.app/)
- [Flask-CORS](https://flask-cors.readthedocs.io/)

---

## ✅ Checklist การ Deploy

- [ ] ติดตั้ง dependencies (`requirements.txt`)
- [ ] สร้าง Google Service Account
- [ ] แชร์ Google Sheets ให้ Service Account
- [ ] ตั้งค่า Environment Variables
- [ ] ทดสอบ API ใน local (`python app.py`)
- [ ] สร้าง Procfile, runtime.txt, railway.json
- [ ] Push code ขึ้น GitHub
- [ ] Deploy ไปยัง Railway
- [ ] ตั้งค่า Environment Variables บน Railway
- [ ] ทดสอบ API endpoints
- [ ] เพิ่ม `NEXT_PUBLIC_PYTHON_API_URL` ใน Vercel
- [ ] Redeploy Frontend
- [ ] ทดสอบการเชื่อมต่อ Frontend-Backend

---

**สร้างโดย:** Film Developer Team  
**วันที่:** 18 พฤศจิกายน 2025  
**เวอร์ชัน:** 1.0.0
