"""
Test Transport API Endpoints
"""

import requests
import json
import time
from datetime import datetime

# Base URL
BASE_URL = "http://localhost:5001/api/transport"

def test_endpoint(endpoint, method='GET', data=None, params=None):
    """Test an API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == 'GET':
            response = requests.get(url, params=params)
        elif method == 'POST':
            response = requests.post(url, json=data)
        elif method == 'PUT':
            response = requests.put(url, json=data)
        elif method == 'DELETE':
            response = requests.delete(url)
        else:
            print(f"❌ Unsupported method: {method}")
            return False
        
        print(f"\n{'='*50}")
        print(f"Testing: {method} {endpoint}")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print(f"✅ SUCCESS: {result.get('message', 'Request successful')}")
                if 'data' in result:
                    data = result['data']
                    if isinstance(data, list):
                        print(f"📊 Data: {len(data)} items returned")
                        if data and isinstance(data[0], dict):
                            print(f"📋 Sample keys: {list(data[0].keys())[:5]}")
                    elif isinstance(data, dict):
                        print(f"📋 Data keys: {list(data.keys())[:10]}")
                    else:
                        print(f"📊 Data: {str(data)[:100]}...")
                return True
            else:
                print(f"❌ FAILED: {result.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ HTTP ERROR: {response.status_code}")
            try:
                error_data = response.json()
                print(f"📋 Error: {error_data.get('error', 'Unknown error')}")
            except:
                print(f"📋 Response: {response.text[:200]}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ CONNECTION ERROR: Could not connect to {url}")
        print("📋 Make sure the Flask server is running on localhost:5001")
        return False
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def main():
    """Test all transport endpoints"""
    print("🚀 Testing Transport API Endpoints")
    print("="*60)
    
    # Test data
    test_student = {
        "student_id": "2024999",
        "name": "Test Student",
        "email": "test@student.edu",
        "phone": "+91 9876543210",
        "address": "Test Address, Chennai",
        "route_id": "RT-01",
        "route_name": "Route 1",
        "pickup_point": "Stop 1"
    }
    
    test_faculty = {
        "faculty_id": "FAC999",
        "name": "Test Faculty",
        "email": "test@faculty.edu",
        "phone": "+91 9876543211",
        "department": "CSE",
        "route_id": "RT-02",
        "route_name": "Route 2"
    }
    
    test_bus = {
        "bus_number": "TN-09-AB-9999",
        "route_id": "RT-03",
        "route_name": "Route 3",
        "capacity": 50,
        "driver_id": 1,
        "driver_name": "Test Driver"
    }
    
    test_driver = {
        "driver_id": "DRV999",
        "name": "Test Driver",
        "phone": "+91 9876543212",
        "license_number": "TN999999999",
        "license_expiry": "2025-12-31",
        "blood_group": "A+",
        "emergency_contact": "+91 9876543213",
        "experience_years": 10
    }
    
    test_route = {
        "route_id": "RT-99",
        "route_name": "Test Route",
        "stops": [
            {"name": "Stop 1", "time": "07:30 AM"},
            {"name": "Stop 2", "time": "07:45 AM"},
            {"name": "College", "time": "08:00 AM"}
        ],
        "pickup_time": "07:30 AM",
        "drop_time": "06:00 PM"
    }
    
    test_payment = {
        "student_id": "2024001",
        "student_name": "Student 1",
        "amount": 2500,
        "payment_date": datetime.now().strftime("%Y-%m-%d"),
        "payment_mode": "Online"
    }
    
    test_attendance = {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "entity_type": "Student",
        "entity_id": "2024001",
        "entity_name": "Student 1",
        "route_id": "RT-01",
        "bus_number": "TN-09-AB-1234",
        "status": "Present"
    }
    
    # Test endpoints
    tests = [
        # Health and Info
        ("/health", "GET"),
        ("/info", "GET"),
        
        # Dashboard
        ("/dashboard/metrics", "GET"),
        
        # Students
        ("/students", "GET"),
        ("/students", "POST", test_student),
        ("/students/2024999", "PUT", {"name": "Updated Test Student"}),
        ("/students/2024999", "DELETE"),
        
        # Faculty
        ("/faculty", "GET"),
        ("/faculty", "POST", test_faculty),
        ("/faculty/FAC999", "PUT", {"name": "Updated Test Faculty"}),
        ("/faculty/FAC999", "DELETE"),
        
        # Buses
        ("/buses", "GET"),
        ("/buses", "POST", test_bus),
        ("/buses/999", "PUT", {"status": "Under Maintenance"}),
        ("/buses/999", "DELETE"),
        
        # Drivers
        ("/drivers", "GET"),
        ("/drivers", "POST", test_driver),
        ("/drivers/DRV999", "PUT", {"status": "On Leave"}),
        ("/drivers/DRV999", "DELETE"),
        
        # Routes
        ("/routes", "GET"),
        ("/routes/RT-01", "GET"),
        ("/routes", "POST", test_route),
        ("/routes/RT-99", "PUT", {"status": "Inactive"}),
        ("/routes/RT-99", "DELETE"),
        
        # Fees
        ("/fees", "GET"),
        ("/fees/payment", "POST", test_payment),
        
        # Attendance
        ("/attendance", "GET"),
        ("/attendance", "POST", test_attendance),
        
        # Live Tracking
        ("/live-locations", "GET"),
        ("/route-history/1/2024-01-01", "GET"),
        
        # Reports
        ("/reports/attendance", "GET"),
        ("/reports/fees", "GET"),
        ("/reports/routes", "GET"),
        ("/reports/drivers", "GET"),
    ]
    
    # Run tests
    passed = 0
    total = len(tests)
    
    for test in tests:
        if len(test) == 2:
            endpoint, method = test
            data = None
        else:
            endpoint, method, data = test
        
        if test_endpoint(endpoint, method, data):
            passed += 1
        
        # Small delay between requests
        time.sleep(0.1)
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    print(f"✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")
    print(f"📈 Success Rate: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("\n🎉 All tests passed! Transport API is working correctly.")
    else:
        print(f"\n⚠️  {total - passed} tests failed. Please check the server and database.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
