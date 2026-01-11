"""
Supabase Adapter for Transport Management System
This adapter will replace the SQLite models when Supabase credentials are provided
"""

from supabase import create_client
import os
from typing import List, Dict, Optional, Any
import json

class SupabaseTransportAdapter:
    """Adapter for Supabase database operations"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase = create_client(supabase_url, supabase_key)
    
    def get_connection(self):
        """Get Supabase client"""
        return self.supabase
    
    def dict_from_row(self, row) -> Dict:
        """Convert Supabase response to dictionary"""
        return row if isinstance(row, dict) else dict(row) if row else None

class SupabaseTransportStudent(SupabaseTransportAdapter):
    """Transport Student Model for Supabase"""
    
    def get_all(self, filters: Dict = None) -> List[Dict]:
        """Get all transport students"""
        try:
            query = self.supabase.table('transport_students').select('*')

            if filters:
                if filters.get('route_id'):
                    query = query.eq('route_id', filters['route_id'])
                if filters.get('status'):
                    query = query.eq('status', filters['status'])
                if filters.get('fee_status'):
                    query = query.eq('fee_status', filters['fee_status'])

            # Order by full_name column
            response = query.order('full_name').execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching students: {e}")
            return []
    
    def get_by_id(self, student_id: str) -> Optional[Dict]:
        """Get student by ID"""
        try:
            response = self.supabase.table('transport_students').select('*').eq('register_number', student_id).single().execute()
            return response.data if response.data else None
        except Exception as e:
            print(f"Error fetching student: {e}")
            return None
    
    def create(self, data: Dict) -> Dict:
        """Create new transport student"""
        try:
            response = self.supabase.table('transport_students').insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating student: {e}")
            raise Exception(f"Failed to create student: {str(e)}")
    
    def update(self, student_id: str, data: Dict) -> Dict:
        """Update transport student"""
        try:
            response = self.supabase.table('transport_students').update(data).eq('register_number', student_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating student: {e}")
            raise Exception(f"Failed to update student: {str(e)}")
    
    def delete(self, student_id: str) -> bool:
        """Delete transport student"""
        try:
            response = self.supabase.table('transport_students').delete().eq('register_number', student_id).execute()
            return len(response.data) > 0 if response.data else False
        except Exception as e:
            print(f"Error deleting student: {e}")
            return False

class SupabaseTransportFaculty(SupabaseTransportAdapter):
    """Transport Faculty Model for Supabase"""
    
    def get_all(self, filters: Dict = None) -> List[Dict]:
        """Get all transport faculty"""
        try:
            query = self.supabase.table('transport_faculty').select('*')

            if filters:
                if filters.get('route_id'):
                    query = query.eq('route_id', filters['route_id'])
                if filters.get('status'):
                    query = query.eq('status', filters['status'])
                if filters.get('department'):
                    query = query.eq('department', filters['department'])

            # Order by id column to match expected sequence
            response = query.order('id').execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching faculty: {e}")
            return []
    
    def get_by_id(self, faculty_id: str) -> Optional[Dict]:
        """Get faculty by ID"""
        try:
            response = self.supabase.table('transport_faculty').select('*').eq('faculty_id', faculty_id).single().execute()
            return response.data if response.data else None
        except Exception as e:
            print(f"Error fetching faculty: {e}")
            return None
    
    def create(self, data: Dict) -> Dict:
        """Create new transport faculty"""
        try:
            response = self.supabase.table('transport_faculty').insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating faculty: {e}")
            raise Exception(f"Failed to create faculty: {str(e)}")
    
    def update(self, faculty_id: str, data: Dict) -> Dict:
        """Update transport faculty"""
        try:
            response = self.supabase.table('transport_faculty').update(data).eq('faculty_id', faculty_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating faculty: {e}")
            raise Exception(f"Failed to update faculty: {str(e)}")
    
    def delete(self, faculty_id: str) -> bool:
        """Delete transport faculty"""
        try:
            response = self.supabase.table('transport_faculty').delete().eq('faculty_id', faculty_id).execute()
            return len(response.data) > 0 if response.data else False
        except Exception as e:
            print(f"Error deleting faculty: {e}")
            return False

class SupabaseBus(SupabaseTransportAdapter):
    """Bus Model for Supabase"""
    
    def get_all(self, filters: Dict = None) -> List[Dict]:
        """Get all buses"""
        try:
            query = self.supabase.table('buses').select('*')
            
            if filters:
                if filters.get('route_id'):
                    query = query.eq('route_id', filters['route_id'])
                if filters.get('status'):
                    query = query.eq('status', filters['status'])
                if filters.get('driver_id'):
                    query = query.eq('driver_id', filters['driver_id'])
            
            response = query.order('bus_number').execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching buses: {e}")
            return []
    
    def get_by_id(self, bus_id: int) -> Optional[Dict]:
        """Get bus by ID"""
        try:
            response = self.supabase.table('buses').select('*').eq('id', bus_id).single().execute()
            return response.data if response.data else None
        except Exception as e:
            print(f"Error fetching bus: {e}")
            return None
    
    def create(self, data: Dict) -> Dict:
        """Create new bus"""
        try:
            response = self.supabase.table('buses').insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating bus: {e}")
            raise Exception(f"Failed to create bus: {str(e)}")
    
    def update(self, bus_id: int, data: Dict) -> Dict:
        """Update bus"""
        try:
            response = self.supabase.table('buses').update(data).eq('id', bus_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating bus: {e}")
            raise Exception(f"Failed to update bus: {str(e)}")
    
    def delete(self, bus_id: int) -> bool:
        """Delete bus"""
        try:
            response = self.supabase.table('buses').delete().eq('id', bus_id).execute()
            return len(response.data) > 0 if response.data else False
        except Exception as e:
            print(f"Error deleting bus: {e}")
            return False

class SupabaseDriver(SupabaseTransportAdapter):
    """Driver Model for Supabase"""
    
    def get_all(self, filters: Dict = None) -> List[Dict]:
        """Get all drivers"""
        try:
            query = self.supabase.table('drivers').select('*')
            
            if filters:
                if filters.get('status'):
                    query = query.eq('status', filters['status'])
                if filters.get('shift'):
                    query = query.eq('shift', filters['shift'])
                if filters.get('assigned_bus'):
                    query = query.eq('assigned_bus', filters['assigned_bus'])
            
            response = query.order('full_name').execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching drivers: {e}")
            return []
    
    def get_by_id(self, driver_id: str) -> Optional[Dict]:
        """Get driver by ID"""
        try:
            response = self.supabase.table('drivers').select('*').eq('driver_id', driver_id).single().execute()
            return response.data if response.data else None
        except Exception as e:
            print(f"Error fetching driver: {e}")
            return None
    
    def create(self, data: Dict) -> Dict:
        """Create new driver"""
        try:
            response = self.supabase.table('drivers').insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating driver: {e}")
            raise Exception(f"Failed to create driver: {str(e)}")
    
    def update(self, driver_id: str, data: Dict) -> Dict:
        """Update driver"""
        try:
            response = self.supabase.table('drivers').update(data).eq('driver_id', driver_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating driver: {e}")
            raise Exception(f"Failed to update driver: {str(e)}")
    
    def delete(self, driver_id: str) -> bool:
        """Delete driver"""
        try:
            response = self.supabase.table('drivers').delete().eq('driver_id', driver_id).execute()
            return len(response.data) > 0 if response.data else False
        except Exception as e:
            print(f"Error deleting driver: {e}")
            return False

class SupabaseRoute(SupabaseTransportAdapter):
    """Route Model for Supabase"""
    
    def get_all(self, filters: Dict = None) -> List[Dict]:
        """Get all routes"""
        try:
            query = self.supabase.table('routes').select('*')
            
            if filters:
                if filters.get('status'):
                    query = query.eq('status', filters['status'])
                if filters.get('assigned_bus'):
                    query = query.eq('assigned_bus', filters['assigned_bus'])
            
            response = query.order('route_id').execute()
            routes = response.data if response.data else []
            
            # Parse JSON stops for each route
            for route in routes:
                if route.get('stops'):
                    try:
                        route['stops'] = json.loads(route['stops'])
                    except:
                        route['stops'] = []
            
            return routes
        except Exception as e:
            print(f"Error fetching routes: {e}")
            return []
    
    def get_by_id(self, route_id: str) -> Optional[Dict]:
        """Get route by ID"""
        try:
            response = self.supabase.table('routes').select('*').eq('route_id', route_id).single().execute()
            route = response.data if response.data else None
            
            if route and route.get('stops'):
                try:
                    route['stops'] = json.loads(route['stops'])
                except:
                    route['stops'] = []
            
            return route
        except Exception as e:
            print(f"Error fetching route: {e}")
            return None
    
    def create(self, data: Dict) -> Dict:
        """Create new route"""
        try:
            # Convert stops to JSON
            route_data = data.copy()
            if 'stops' in route_data:
                route_data['stops'] = json.dumps(route_data['stops'])
            
            response = self.supabase.table('routes').insert(route_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating route: {e}")
            raise Exception(f"Failed to create route: {str(e)}")
    
    def update(self, route_id: str, data: Dict) -> Dict:
        """Update route"""
        try:
            # Convert stops to JSON
            route_data = data.copy()
            if 'stops' in route_data:
                route_data['stops'] = json.dumps(route_data['stops'])
            
            response = self.supabase.table('routes').update(route_data).eq('route_id', route_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating route: {e}")
            raise Exception(f"Failed to update route: {str(e)}")
    
    def delete(self, route_id: str) -> bool:
        """Delete route"""
        try:
            response = self.supabase.table('routes').delete().eq('route_id', route_id).execute()
            return len(response.data) > 0 if response.data else False
        except Exception as e:
            print(f"Error deleting route: {e}")
            return False

def initialize_supabase_transport(supabase_url: str, supabase_key: str):
    """Initialize Supabase transport models"""
    return {
        'student_model': SupabaseTransportStudent(supabase_url, supabase_key),
        'faculty_model': SupabaseTransportFaculty(supabase_url, supabase_key),
        'bus_model': SupabaseBus(supabase_url, supabase_key),
        'driver_model': SupabaseDriver(supabase_url, supabase_key),
        'route_model': SupabaseRoute(supabase_url, supabase_key),
    }

# Example usage:
# When you provide your Supabase credentials, you can switch to Supabase by:
# 1. Setting environment variables SUPABASE_URL and SUPABASE_KEY
# 2. Updating the controllers to use Supabase models instead of SQLite models
# 3. The API endpoints will remain the same
