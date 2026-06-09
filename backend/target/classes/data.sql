-- Insert a Teacher-in-Charge (Admin)
INSERT INTO users (email, password, name, role) 
VALUES ('admin@cuet.ac.bd', '$2a$10$Xy.hO1z.QxZ8vD/K4yL5EOGlV.xQz0P6J/Y/wZ8s5o7k4e9D0P2K2', 'Prof. Admin', 'ADMIN'); -- password is 'password'

-- Insert a Reference Teacher
INSERT INTO users (email, password, name, role)
VALUES ('teacher1@cuet.ac.bd', '$2a$10$Xy.hO1z.QxZ8vD/K4yL5EOGlV.xQz0P6J/Y/wZ8s5o7k4e9D0P2K2', 'Dr. Teacher', 'TEACHER');

-- Insert the 6 Resources
-- Note: User ID 1 is the Admin
INSERT INTO resources (name, type, capacity, indoor, open_time, close_time, teacher_in_charge_id) VALUES
('East Gallery', 'Gallery', 200, true, '09:00:00', '20:00:00', 1),
('West Gallery', 'Gallery', 200, true, '09:00:00', '20:00:00', 1),
('Auditorium', 'Auditorium', 1000, true, '09:00:00', '20:00:00', 1),
('TSC 3rd Floor', 'Hall', 150, true, '09:00:00', '20:00:00', 1),
('Basketball Ground', 'Outdoor Field', 500, false, null, null, 1),
('Central Field', 'Outdoor Field', 5000, false, null, null, 1);
