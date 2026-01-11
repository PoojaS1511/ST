-- SQL script to create missing transport tables in Supabase
-- Run this in your Supabase SQL Editor

-- Create buses table
CREATE TABLE IF NOT EXISTS buses (
    id SERIAL PRIMARY KEY,
    bus_number VARCHAR(50) UNIQUE NOT NULL,
    route_id VARCHAR(20),
    route_name VARCHAR(100),
    capacity INTEGER NOT NULL DEFAULT 50,
    driver_id INTEGER,
    driver_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY,
    driver_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_expiry DATE NOT NULL,
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(15),
    experience_years INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
    id SERIAL PRIMARY KEY,
    route_id VARCHAR(20) UNIQUE NOT NULL,
    route_name VARCHAR(100) NOT NULL,
    stops JSONB,
    pickup_time TIME NOT NULL,
    drop_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transport_faculty table if it doesn't exist
CREATE TABLE IF NOT EXISTS transport_faculty (
    id SERIAL PRIMARY KEY,
    faculty_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    department VARCHAR(50),
    route_id VARCHAR(20),
    route_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to transport_students table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'transport_students' AND column_name = 'address') THEN
        ALTER TABLE transport_students ADD COLUMN address TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'transport_students' AND column_name = 'phone') THEN
        ALTER TABLE transport_students ADD COLUMN phone VARCHAR(15);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'transport_students' AND column_name = 'route_name') THEN
        ALTER TABLE transport_students ADD COLUMN route_name VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'transport_students' AND column_name = 'pickup_point') THEN
        ALTER TABLE transport_students ADD COLUMN pickup_point VARCHAR(100);
    END IF;
END $$;

-- Add missing columns to transport_faculty table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'transport_faculty' AND column_name = 'phone') THEN
        ALTER TABLE transport_faculty ADD COLUMN phone VARCHAR(15);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'transport_faculty' AND column_name = 'route_name') THEN
        ALTER TABLE transport_faculty ADD COLUMN route_name VARCHAR(100);
    END IF;
END $$;

-- Enable Row Level Security (optional but recommended)
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_faculty ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on buses" ON buses FOR ALL USING (true);
CREATE POLICY "Allow all operations on drivers" ON drivers FOR ALL USING (true);
CREATE POLICY "Allow all operations on routes" ON routes FOR ALL USING (true);
CREATE POLICY "Allow all operations on transport_faculty" ON transport_faculty FOR ALL USING (true);
