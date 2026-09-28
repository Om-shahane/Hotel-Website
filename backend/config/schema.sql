-- Hotel Website Database Schema
-- Run this file in MySQL to create the database and tables:
--   mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS hotel_db;
USE hotel_db;

-- Room types / inventory
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,          -- e.g. "Deluxe King Room"
  type VARCHAR(50) NOT NULL,           -- e.g. "Deluxe", "Suite", "Standard"
  description TEXT,
  price_per_night DECIMAL(10,2) NOT NULL,
  capacity INT NOT NULL DEFAULT 2,
  total_rooms INT NOT NULL DEFAULT 1,  -- how many rooms of this type exist
  image_url VARCHAR(255),
  amenities VARCHAR(500),              -- comma-separated: "WiFi,AC,TV,Mini Bar"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings made by guests
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  guest_name VARCHAR(100) NOT NULL,
  guest_email VARCHAR(100) NOT NULL,
  guest_phone VARCHAR(20),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INT NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  status ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Contact form messages
CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  subject VARCHAR(150),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin users (for a simple admin login)
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample room data (photos verified live on Pexels, free to use)
INSERT INTO rooms (name, type, description, price_per_night, capacity, total_rooms, image_url, amenities) VALUES
('Standard Room', 'Standard',
 'Comfortable room with modern facilities.',
 50000.00, 2, 10, 'IMAGE_URL',
 'WiFi,AC,TV'),

('Deluxe Room', 'Deluxe',
 'Spacious deluxe room with premium facilities.',
 62000.00, 3, 8, 'IMAGE_URL',
 'WiFi,AC,TV,Mini Bar'),

('Family Suite', 'Family',
 'Large family accommodation with comfortable beds.',
 75000.00, 4, 6, 'IMAGE_URL',
 'WiFi,AC,TV,Mini Bar,Extra Beds'),

('Luxury Suite', 'Suite',
 'Premium suite with separate living area.',
 85000.00, 4, 4, 'IMAGE_URL',
 'WiFi,AC,TV,Mini Bar,Balcony,Bathtub');