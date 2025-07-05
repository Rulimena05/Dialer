#!/usr/bin/env python3
from flask import Flask, request, jsonify
from flask_cors import CORS
import csv
import os
import time
import threading
import json
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("autodial.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("autodial")

app = Flask(__name__)
CORS(app)

# Global variables
customers = []
call_history = []
is_dialing = False
current_call = None
call_delay = 5  # seconds between calls

# SIP configuration
sip_config = {
    "server": "103.22.251.101",
    "proxy": "103.22.251.101",
    "username": "Admin",
    "domain": "103.22.251.101",
    "login": "peLit4_pks",
    "password": "GDUgy72fgWG89hN"
}

# This would be replaced with actual MicroSip integration
# For demonstration, we'll simulate SIP integration
class MicroSipSimulator:
    def __init__(self, config):
        self.config = config
        self.connected = False
        logger.info("MicroSip simulator initialized")
    
    def connect(self):
        logger.info(f"Connecting to SIP server: {self.config['server']}")
        time.sleep(1)  # Simulate connection delay
        self.connected = True
        logger.info("Connected to SIP server")
        return True
    
    def disconnect(self):
        logger.info("Disconnecting from SIP server")
        self.connected = False
        return True
    
    def make_call(self, phone_number):
        if not self.connected:
            logger.error("Cannot make call: Not connected")
            return False
        
        logger.info(f"Making call to: {phone_number}")
        time.sleep(1)  # Simulate call setup
        return True
    
    def end_call(self):
        logger.info("Ending current call")
        return True
    
    def get_call_status(self):
        # Simulate various call statuses
        import random
        statuses = ["Answer", "Not Answer", "Not Active", "Voice Mail"]
        return random.choice(statuses)

# Initialize the MicroSip simulator
microsip = MicroSipSimulator(sip_config)

@app.route('/api/connect', methods=['POST'])
def connect_sip():
    try:
        result = microsip.connect()
        return jsonify({"success": result, "message": "Connected to MicroSip"})
    except Exception as e:
        logger.error(f"Error connecting to SIP: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/disconnect', methods=['POST'])
def disconnect_sip():
    try:
        result = microsip.disconnect()
        return jsonify({"success": result, "message": "Disconnected from MicroSip"})
    except Exception as e:
        logger.error(f"Error disconnecting from SIP: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/settings', methods=['GET'])
def get_settings():
    return jsonify({
        "sipConfig": sip_config,
        "callDelay": call_delay,
        "autoHangup": True
    })

@app.route('/api/settings', methods=['POST'])
def update_settings():
    global sip_config, call_delay
    data = request.json
    
    if 'sipConfig' in data:
        sip_config = data['sipConfig']
    
    if 'callDelay' in data:
        call_delay = data['callDelay']
    
    return jsonify({"success": True, "message": "Settings updated"})

@app.route('/api/customers', methods=['GET'])
def get_customers():
    return jsonify(customers)

@app.route('/api/customers', methods=['POST'])
def upload_customers():
    global customers
    try:
        if 'file' not in request.files:
            return jsonify({"success": False, "message": "No file part"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"success": False, "message": "No file selected"}), 400
        
        if not file.filename.endswith('.csv'):
            return jsonify({"success": False, "message": "Only CSV files are allowed"}), 400
        
        # Process CSV file
        csv_content = file.read().decode('utf-8')
        reader = csv.DictReader(csv_content.splitlines())
        
        new_customers = []
        for i, row in enumerate(reader):
            customer = {
                "id": f"customer-{i}",
                "caseId": row.get('Case ID', '') or row.get('Case_Id', ''),
                "customerName": row.get('Customer name', '') or row.get('Customer_Name', ''),
                "phoneNumber": row.get('PhoneNumber1', '') or row.get('Phonenumber1', ''),
                "handel": row.get('HANDEL', '') or row.get('Handel', '')
            }
            if customer["caseId"] and customer["phoneNumber"]:
                new_customers.append(customer)
        
        customers = new_customers
        return jsonify({
            "success": True, 
            "message": f"Uploaded {len(new_customers)} customers",
            "customers": new_customers
        })
    except Exception as e:
        logger.error(f"Error uploading customers: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/call-history', methods=['GET'])
def get_call_history():
    return jsonify(call_history)

def autodial_worker(selected_customers):
    global is_dialing, current_call, call_history
    
    logger.info(f"Starting auto-dial for {len(selected_customers)} customers")
    is_dialing = True
    
    for customer in selected_customers:
        if not is_dialing:
            logger.info("Auto-dial stopped")
            break
        
        # Create call record
        call_record = {
            "id": f"call-{int(time.time())}-{customer['caseId']}",
            "caseId": customer['caseId'],
            "customerName": customer['customerName'],
            "phoneNumber": customer['phoneNumber'],
            "handel": customer['handel'],
            "callDate": datetime.now().isoformat(),
            "startTime": datetime.now().isoformat(),
            "endTime": "",
            "duration": 0,
            "status": "in progress"
        }
        
        current_call = call_record
        call_history.append(call_record)
        
        try:
            # Make the call
            microsip.make_call(customer['phoneNumber'])
            
            # Simulate call duration
            call_duration = min(10, max(1, int(time.time()) % 10))  # 1-10 seconds
            time.sleep(call_duration)
            
            # Get call status
            call_status = microsip.get_call_status()
            
            # Update call record
            call_record["endTime"] = datetime.now().isoformat()
            call_record["duration"] = call_duration
            call_record["status"] = call_status
            
            # If call was answered, hang up automatically
            if call_status == "Answer":
                microsip.end_call()
            
            # Wait for the configured delay before next call
            time.sleep(call_delay)
            
        except Exception as e:
            logger.error(f"Error during call: {str(e)}")
            call_record["endTime"] = datetime.now().isoformat()
            call_record["status"] = "Error"
    
    is_dialing = False
    current_call = None
    logger.info("Auto-dial completed")

@app.route('/api/start-autodial', methods=['POST'])
def start_autodial():
    global is_dialing
    
    if is_dialing:
        return jsonify({"success": False, "message": "Auto-dial already in progress"}), 400
    
    data = request.json
    selected_customers = data.get('customers', [])
    
    if not selected_customers:
        return jsonify({"success": False, "message": "No customers selected"}), 400
    
    if not microsip.connected:
        return jsonify({"success": False, "message": "MicroSip is not connected"}), 400
    
    # Start auto-dial in a separate thread
    thread = threading.Thread(target=autodial_worker, args=(selected_customers,))
    thread.daemon = True
    thread.start()
    
    return jsonify({"success": True, "message": f"Started auto-dial for {len(selected_customers)} customers"})

@app.route('/api/stop-autodial', methods=['POST'])
def stop_autodial():
    global is_dialing
    
    if not is_dialing:
        return jsonify({"success": False, "message": "No auto-dial in progress"}), 400
    
    is_dialing = False
    return jsonify({"success": True, "message": "Stopping auto-dial"})

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        "connected": microsip.connected,
        "isDialing": is_dialing,
        "currentCall": current_call
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)