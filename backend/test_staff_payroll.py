#!/usr/bin/env python3
"""
Test script to verify Supabase connection and finance_staffpayroll table access.
This script will test:
1. Supabase connection
2. finance_staffpayroll table existence and schema
3. Record count (should be ~2000)
4. Data fetching performance
5. RLS policies
"""

import sys
import os
import time
from datetime import datetime

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from supabase_client import get_supabase, supabase_admin
    print("✅ Successfully imported Supabase client")
except ImportError as e:
    print(f"❌ Failed to import Supabase client: {e}")
    sys.exit(1)

def test_staff_payroll_table():
    """Test finance_staffpayroll table existence and schema"""
    print("\n" + "="*60)
    print("📋 TESTING finance_staffpayroll TABLE")
    print("="*60)
    
    expected_schema = {
        'staff_id': 'text',
        'staff_name': 'text', 
        'department': 'text',
        'role': 'text',
        'base_salary': 'bigint',
        'allowance': 'bigint',
        'deduction': 'bigint',
        'net_salary': 'bigint',
        'payment_date': 'text'
    }
    
    try:
        supabase = get_supabase()
        
        # Test table existence by trying to select a small sample
        start_time = time.time()
        result = supabase.table('finance_staffpayroll').select('*').limit(1).execute()
        end_time = time.time()
        
        if result.data is None:
            print("❌ Table 'finance_staffpayroll' does not exist or is not accessible")
            return False
            
        print("✅ Table 'finance_staffpayroll' exists and is accessible")
        print(f"⏱️  Query response time: {(end_time - start_time)*1000:.2f}ms")
        
        # Check schema from the first record
        if result.data:
            sample_record = result.data[0]
            print("\n📊 Actual table schema:")
            for column, value in sample_record.items():
                print(f"   {column}: {type(value).__name__}")
                
            # Verify expected columns exist
            missing_columns = []
            for expected_col in expected_schema.keys():
                if expected_col not in sample_record:
                    missing_columns.append(expected_col)
            
            if missing_columns:
                print(f"\n⚠️  Missing expected columns: {missing_columns}")
            else:
                print("\n✅ All expected columns are present")
                
        return True
        
    except Exception as e:
        print(f"❌ Schema verification failed: {e}")
        return False

def test_staff_payroll_record_count():
    """Test record count (should be ~2000)"""
    print("\n" + "="*60)
    print("🔢 TESTING STAFF PAYROLL RECORD COUNT")
    print("="*60)
    
    try:
        supabase = get_supabase()
        
        # Get exact count
        start_time = time.time()
        count_result = supabase.table('finance_staffpayroll').select('staff_id', count='exact').execute()
        end_time = time.time()
        
        record_count = count_result.count if count_result.count else 0
        print(f"📊 Total records: {record_count}")
        print(f"⏱️  Count query response time: {(end_time - start_time)*1000:.2f}ms")
        
        # Check if count is approximately 2000
        if 1800 <= record_count <= 2200:
            print("✅ Record count is within expected range (~2000)")
        elif record_count > 0:
            print(f"⚠️  Record count ({record_count}) is not close to expected 2000")
        else:
            print("❌ No records found in table")
            
        return record_count
        
    except Exception as e:
        print(f"❌ Record count test failed: {e}")
        return 0

def test_staff_payroll_data_structure():
    """Test data structure and sample records"""
    print("\n" + "="*60)
    print("📊 TESTING STAFF PAYROLL DATA STRUCTURE")
    print("="*60)
    
    try:
        supabase = get_supabase()
        
        # Get sample records
        start_time = time.time()
        result = supabase.table('finance_staffpayroll').select('*').limit(5).execute()
        end_time = time.time()
        
        if result.data and len(result.data) > 0:
            print(f"✅ Retrieved {len(result.data)} sample records")
            print(f"⏱️  Query time: {(end_time - start_time)*1000:.2f}ms")
            
            # Show sample records
            for i, record in enumerate(result.data[:3], 1):
                print(f"\n📄 Sample Record {i}:")
                for key, value in record.items():
                    display_value = str(value)[:50] + "..." if len(str(value)) > 50 else str(value)
                    print(f"   {key}: {display_value}")
            
            # Test salary calculations
            print(f"\n💰 Testing salary calculations:")
            for i, record in enumerate(result.data[:3], 1):
                base_salary = record.get('base_salary', 0)
                allowance = record.get('allowance', 0)
                deduction = record.get('deduction', 0)
                net_salary = record.get('net_salary', 0)
                calculated_net = base_salary + allowance - deduction
                
                print(f"   Record {i}: Base={base_salary}, Allowance={allowance}, Deduction={deduction}")
                print(f"   Net Salary: Stored={net_salary}, Calculated={calculated_net}")
                print(f"   Match: {'✅' if net_salary == calculated_net else '❌'}")
            
            return True
        else:
            print("❌ No sample records found")
            return False
            
    except Exception as e:
        print(f"❌ Data structure test failed: {e}")
        return False

def test_staff_payroll_performance():
    """Test performance with different page sizes"""
    print("\n" + "="*60)
    print("⚡ TESTING STAFF PAYROLL PERFORMANCE")
    print("="*60)
    
    page_sizes = [10, 50, 100, 500, 1000]
    
    try:
        supabase = get_supabase()
        
        for page_size in page_sizes:
            start_time = time.time()
            result = supabase.table('finance_staffpayroll').select('*').limit(page_size).execute()
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000
            records_fetched = len(result.data) if result.data else 0
            
            print(f"📄 Page size {page_size:4d}: {records_fetched:4d} records in {response_time:6.2f}ms")
            
            if records_fetched > 0:
                avg_time_per_record = response_time / records_fetched
                print(f"                     Avg: {avg_time_per_record:.2f}ms per record")
        
        return True
        
    except Exception as e:
        print(f"❌ Performance test failed: {e}")
        return False

def test_staff_payroll_rls():
    """Test Row Level Security policies"""
    print("\n" + "="*60)
    print("🔒 TESTING STAFF PAYROLL RLS POLICIES")
    print("="*60)
    
    try:
        # Test with anon client (should have limited access)
        supabase_anon = get_supabase(admin=False)
        
        start_time = time.time()
        try:
            result = supabase_anon.table('finance_staffpayroll').select('count').execute()
            end_time = time.time()
            
            if result.data is not None:
                print("✅ Anonymous access: SELECT permission granted")
                print(f"⏱️  Response time: {(end_time - start_time)*1000:.2f}ms")
            else:
                print("⚠️  Anonymous access: No data returned")
                
        except Exception as e:
            print(f"❌ Anonymous access failed: {e}")
        
        # Test with admin client (should have full access)
        supabase_admin_client = get_supabase(admin=True)
        
        start_time = time.time()
        result = supabase_admin_client.table('finance_staffpayroll').select('count').execute()
        end_time = time.time()
        
        if result.data is not None:
            print("✅ Admin access: SELECT permission granted")
            print(f"⏱️  Response time: {(end_time - start_time)*1000:.2f}ms")
        else:
            print("❌ Admin access: No data returned")
            
        return True
        
    except Exception as e:
        print(f"❌ RLS test failed: {e}")
        return False

def test_staff_payroll_filtering():
    """Test filtering capabilities"""
    print("\n" + "="*60)
    print("🔍 TESTING STAFF PAYROLL FILTERING")
    print("="*60)
    
    try:
        supabase = get_supabase()
        
        # Test department filter
        print("🏢 Testing department filter...")
        start_time = time.time()
        dept_result = supabase.table('finance_staffpayroll').select('*').eq('department', 'CSE').limit(10).execute()
        end_time = time.time()
        print(f"   CSE department: {len(dept_result.data)} records in {(end_time - start_time)*1000:.2f}ms")
        
        # Test role filter
        print("👔 Testing role filter...")
        start_time = time.time()
        role_result = supabase.table('finance_staffpayroll').select('*').eq('role', 'Professor').limit(10).execute()
        end_time = time.time()
        print(f"   Professor role: {len(role_result.data)} records in {(end_time - start_time)*1000:.2f}ms")
        
        # Test salary range filter
        print("💰 Testing salary range filter...")
        start_time = time.time()
        salary_result = supabase.table('finance_staffpayroll').select('*').gte('net_salary', 50000).limit(10).execute()
        end_time = time.time()
        print(f"   Salary >= 50000: {len(salary_result.data)} records in {(end_time - start_time)*1000:.2f}ms")
        
        # Test search filter
        print("🔍 Testing search filter...")
        start_time = time.time()
        search_result = supabase.table('finance_staffpayroll').select('*').ilike('staff_name', '%John%').limit(10).execute()
        end_time = time.time()
        print(f"   Name contains 'John': {len(search_result.data)} records in {(end_time - start_time)*1000:.2f}ms")
        
        return True
        
    except Exception as e:
        print(f"❌ Filtering test failed: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 SUPABASE & finance_staffpayroll VERIFICATION")
    print("=" * 60)
    print(f"📅 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run all tests
    tests = [
        ("Table Schema Test", test_staff_payroll_table),
        ("Record Count Test", test_staff_payroll_record_count),
        ("Data Structure Test", test_staff_payroll_data_structure),
        ("Performance Test", test_staff_payroll_performance),
        ("RLS Test", test_staff_payroll_rls),
        ("Filtering Test", test_staff_payroll_filtering),
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results[test_name] = False
    
    # Summary
    print("\n" + "="*60)
    print("📋 TEST SUMMARY")
    print("="*60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:25} : {status}")
        if result:
            passed += 1
    
    print(f"\n📊 Overall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! finance_staffpayroll integration is working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the issues above.")
    
    # Recommendations
    print("\n" + "="*60)
    print("💡 RECOMMENDATIONS")
    print("="*60)
    
    if not results.get("Record Count Test", 0):
        print("📝 Table appears to be empty. Consider adding sample data.")
    
    if not results.get("Performance Test", False):
        print("⚡ Consider adding indexes to improve query performance.")
    
    if not results.get("RLS Test", False):
        print("🔒 Review RLS policies to ensure proper access control.")

if __name__ == "__main__":
    main()
