-- Seed data for CUET Resource Booking System
-- Uses INSERT IGNORE to avoid duplicates on restart

-- Insert a Teacher-in-Charge (Admin)
INSERT IGNORE INTO users (email, password, name, role) 
VALUES ('admin@cuet.ac.bd', '$2a$10$Xy.hO1z.QxZ8vD/K4yL5EOGlV.xQz0P6J/Y/wZ8s5o7k4e9D0P2K2', 'Prof. Admin', 'ADMIN');

-- Insert a Reference Teacher
INSERT IGNORE INTO users (email, password, name, role)
VALUES ('teacher1@cuet.ac.bd', '$2a$10$Xy.hO1z.QxZ8vD/K4yL5EOGlV.xQz0P6J/Y/wZ8s5o7k4e9D0P2K2', 'Dr. Teacher', 'TEACHER');

-- Insert the 6 Resources (use INSERT IGNORE to prevent duplicate errors on restart)
INSERT IGNORE INTO resources (name, type, capacity, indoor, open_time, close_time, teacher_in_charge_id) VALUES
('East Gallery', 'Gallery', 200, true, '09:00:00', '20:00:00', 1);
INSERT IGNORE INTO resources (name, type, capacity, indoor, open_time, close_time, teacher_in_charge_id) VALUES
('West Gallery', 'Gallery', 200, true, '09:00:00', '20:00:00', 1);
INSERT IGNORE INTO resources (name, type, capacity, indoor, open_time, close_time, teacher_in_charge_id) VALUES
('Auditorium', 'Auditorium', 1000, true, '09:00:00', '20:00:00', 1);
INSERT IGNORE INTO resources (name, type, capacity, indoor, open_time, close_time, teacher_in_charge_id) VALUES
('TSC 3rd Floor', 'Hall', 150, true, '09:00:00', '20:00:00', 1);
INSERT IGNORE INTO resources (name, type, capacity, indoor, open_time, close_time, teacher_in_charge_id) VALUES
('Basketball Ground', 'Outdoor Field', 500, false, null, null, 1);
INSERT IGNORE INTO resources (name, type, capacity, indoor, open_time, close_time, teacher_in_charge_id) VALUES
('Central Field', 'Outdoor Field', 5000, false, null, null, 1);
