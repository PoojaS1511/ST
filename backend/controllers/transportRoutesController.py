"""
Transport Routes Controller for handling transport_routes table
This handles the exact table structure specified in requirements:
- id (bigint, NOT NULL)
- bus_name (text)
- route (text)
- capacity (bigint)
- driver_name (text)
- faculty_id (uuid)
"""

from flask import jsonify, request
import sqlite3
import os
from typing import List, Dict, Optional, Any

class TransportRoutesController:
    """Controller for transport_routes table operations"""
    
    def __init__(self):
        self.db_path = os.path.join(os.path.dirname(__file__), '..', 'student_management.db')
    
    def get_connection(self):
        """Get database connection"""
        return sqlite3.connect(self.db_path)
    
    def get_all(self, filters: Dict = None, limit: int = None, offset: int = None) -> List[Dict]:
        """Get all transport routes with optional filtering and pagination"""
        try:
            conn = self.get_connection()
            conn.row_factory = sqlite3.Row  # Enable dictionary-like access
            cursor = conn.cursor()
            
            # Build query
            query = "SELECT * FROM transport_routes"
            params = []
            
            # Add filters
            if filters:
                where_clauses = []
                if 'bus_name' in filters:
                    where_clauses.append("bus_name LIKE ?")
                    params.append(f"%{filters['bus_name']}%")
                if 'route' in filters:
                    where_clauses.append("route LIKE ?")
                    params.append(f"%{filters['route']}%")
                if 'driver_name' in filters:
                    where_clauses.append("driver_name LIKE ?")
                    params.append(f"%{filters['driver_name']}%")
                if 'faculty_id' in filters:
                    where_clauses.append("faculty_id = ?")
                    params.append(filters['faculty_id'])
                
                if where_clauses:
                    query += " WHERE " + " AND ".join(where_clauses)
            
            # Add ordering
            query += " ORDER BY id"
            
            # Add pagination
            if limit:
                query += " LIMIT ?"
                params.append(limit)
                if offset:
                    query += " OFFSET ?"
                    params.append(offset)
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            # Convert to list of dictionaries
            routes = [dict(row) for row in rows]
            
            conn.close()
            return routes
            
        except Exception as e:
            print(f"Error fetching transport routes: {e}")
            return []
    
    def get_by_id(self, route_id: int) -> Optional[Dict]:
        """Get transport route by ID"""
        try:
            conn = self.get_connection()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM transport_routes WHERE id = ?", (route_id,))
            row = cursor.fetchone()
            
            route = dict(row) if row else None
            conn.close()
            return route
            
        except Exception as e:
            print(f"Error fetching transport route by ID: {e}")
            return None
    
    def create(self, data: Dict) -> Dict:
        """Create new transport route"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Get next ID
            cursor.execute("SELECT MAX(id) FROM transport_routes")
            max_id = cursor.fetchone()[0]
            next_id = (max_id or 0) + 1
            
            # Insert new record
            cursor.execute("""
                INSERT INTO transport_routes (id, bus_name, route, capacity, driver_name, faculty_id)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                next_id,
                data.get('bus_name'),
                data.get('route'),
                data.get('capacity'),
                data.get('driver_name'),
                data.get('faculty_id')
            ))
            
            conn.commit()
            
            # Return created record
            created = self.get_by_id(next_id)
            conn.close()
            return created
            
        except Exception as e:
            print(f"Error creating transport route: {e}")
            raise Exception(f"Failed to create transport route: {str(e)}")
    
    def update(self, route_id: int, data: Dict) -> Dict:
        """Update transport route"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Build update query dynamically
            update_fields = []
            params = []
            
            for field in ['bus_name', 'route', 'capacity', 'driver_name', 'faculty_id']:
                if field in data:
                    update_fields.append(f"{field} = ?")
                    params.append(data[field])
            
            if not update_fields:
                raise Exception("No valid fields to update")
            
            params.append(route_id)
            
            cursor.execute(f"""
                UPDATE transport_routes 
                SET {', '.join(update_fields)}
                WHERE id = ?
            """, params)
            
            conn.commit()
            
            # Return updated record
            updated = self.get_by_id(route_id)
            conn.close()
            return updated
            
        except Exception as e:
            print(f"Error updating transport route: {e}")
            raise Exception(f"Failed to update transport route: {str(e)}")
    
    def delete(self, route_id: int) -> bool:
        """Delete transport route"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("DELETE FROM transport_routes WHERE id = ?", (route_id,))
            success = cursor.rowcount > 0
            
            conn.commit()
            conn.close()
            return success
            
        except Exception as e:
            print(f"Error deleting transport route: {e}")
            return False
    
    def get_count(self, filters: Dict = None) -> int:
        """Get total count of transport routes"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            query = "SELECT COUNT(*) FROM transport_routes"
            params = []
            
            if filters:
                where_clauses = []
                if 'bus_name' in filters:
                    where_clauses.append("bus_name LIKE ?")
                    params.append(f"%{filters['bus_name']}%")
                if 'route' in filters:
                    where_clauses.append("route LIKE ?")
                    params.append(f"%{filters['route']}%")
                if 'driver_name' in filters:
                    where_clauses.append("driver_name LIKE ?")
                    params.append(f"%{filters['driver_name']}%")
                if 'faculty_id' in filters:
                    where_clauses.append("faculty_id = ?")
                    params.append(filters['faculty_id'])
                
                if where_clauses:
                    query += " WHERE " + " AND ".join(where_clauses)
            
            cursor.execute(query, params)
            count = cursor.fetchone()[0]
            
            conn.close()
            return count
            
        except Exception as e:
            print(f"Error getting transport routes count: {e}")
            return 0

# Flask route handlers
def get_transport_routes():
    """Get all transport routes with pagination"""
    try:
        controller = TransportRoutesController()
        
        # Get query parameters
        filters = {}
        if request.args.get('bus_name'):
            filters['bus_name'] = request.args.get('bus_name')
        if request.args.get('route'):
            filters['route'] = request.args.get('route')
        if request.args.get('driver_name'):
            filters['driver_name'] = request.args.get('driver_name')
        if request.args.get('faculty_id'):
            filters['faculty_id'] = request.args.get('faculty_id')
        
        # Pagination parameters
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        page = int(request.args.get('page', 1))
        
        # Calculate offset from page if provided
        if page > 1 and offset == 0:
            offset = (page - 1) * limit
        
        # Get data
        routes = controller.get_all(filters, limit, offset)
        total = controller.get_count(filters)
        
        return jsonify({
            'success': True,
            'data': routes,
            'total': total,
            'limit': limit,
            'offset': offset,
            'page': page,
            'pages': (total + limit - 1) // limit
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def get_transport_route(route_id):
    """Get specific transport route by ID"""
    try:
        controller = TransportRoutesController()
        route = controller.get_by_id(route_id)
        
        if route:
            return jsonify({'success': True, 'data': route})
        else:
            return jsonify({'success': False, 'error': 'Transport route not found'}), 404
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def create_transport_route():
    """Create new transport route"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['bus_name', 'route', 'capacity', 'driver_name']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'success': False, 'error': f'{field} is required'}), 400
        
        controller = TransportRoutesController()
        route = controller.create(data)
        
        return jsonify({'success': True, 'data': route})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def update_transport_route(route_id):
    """Update transport route"""
    try:
        data = request.get_json()
        
        controller = TransportRoutesController()
        route = controller.update(route_id, data)
        
        if route:
            return jsonify({'success': True, 'data': route})
        else:
            return jsonify({'success': False, 'error': 'Transport route not found'}), 404
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def delete_transport_route(route_id):
    """Delete transport route"""
    try:
        controller = TransportRoutesController()
        success = controller.delete(route_id)
        
        if success:
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'error': 'Transport route not found'}), 404
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
