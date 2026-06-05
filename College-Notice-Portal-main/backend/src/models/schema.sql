-- Enhanced Database Schema for College Notice Portal
-- Adds sections and file attachments support

-- Drop existing tables (use with caution in production)
DROP TABLE IF EXISTS notice_attachments CASCADE;
DROP TABLE IF EXISTS notice_recipients CASCADE;
DROP TABLE IF EXISTS faculty_sections CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS notices CASCADE;
DROP TABLE IF EXISTS faculty_classes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS classes CASCADE;

-- Classes/Years table (e.g., "MCA 1st Year", "BCA 2nd Year")
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sections table (e.g., Section A, Section B within a class)
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name VARCHAR(10) NOT NULL, -- 'A', 'B', 'C', etc.
  display_name VARCHAR(50), -- Optional: 'Section A', 'Division A', etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(class_id, name)
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'faculty', 'student')),
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty-Class assignments
CREATE TABLE faculty_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(faculty_id, class_id)
);

-- Faculty-Section assignments (faculty can be assigned to specific sections)
CREATE TABLE faculty_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(faculty_id, section_id)
);

-- Enhanced Notices table
CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  notice_type VARCHAR(20) NOT NULL CHECK (notice_type IN ('ALL', 'FACULTY', 'CLASS', 'SECTION')),
  sent_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notice Recipients (for targeted notices to multiple classes/sections)
CREATE TABLE notice_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id UUID NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- Either class_id or section_id should be present
  CHECK (class_id IS NOT NULL OR section_id IS NOT NULL)
);

-- Notice Attachments table (for files/images)
CREATE TABLE notice_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id UUID NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(100), -- MIME type
  file_size BIGINT, -- in bytes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_class ON users(class_id);
CREATE INDEX idx_users_section ON users(section_id);
CREATE INDEX idx_sections_class ON sections(class_id);
CREATE INDEX idx_notices_type ON notices(notice_type);
CREATE INDEX idx_notices_sent_by ON notices(sent_by);
CREATE INDEX idx_notice_recipients_notice ON notice_recipients(notice_id);
CREATE INDEX idx_notice_recipients_class ON notice_recipients(class_id);
CREATE INDEX idx_notice_recipients_section ON notice_recipients(section_id);
CREATE INDEX idx_notice_attachments_notice ON notice_attachments(notice_id);

-- -- Sample data
-- -- Insert sample classes
-- INSERT INTO classes (id, name) VALUES 
--   ('11111111-1111-1111-1111-111111111111', 'MCA 1st Year'),
--   ('22222222-2222-2222-2222-222222222222', 'MCA 2nd Year'),
--   ('33333333-3333-3333-3333-333333333333', 'BCA 1st Year');

-- -- Insert sample sections
-- INSERT INTO sections (class_id, name, display_name) VALUES 
--   ('11111111-1111-1111-1111-111111111111', 'A', 'Section A'),
--   ('11111111-1111-1111-1111-111111111111', 'B', 'Section B'),
--   ('22222222-2222-2222-2222-222222222222', 'A', 'Section A'),
--   ('33333333-3333-3333-3333-333333333333', 'A', 'Section A'),
--   ('33333333-3333-3333-3333-333333333333', 'B', 'Section B');

-- -- Insert sample admin user (password: Admin@123)
INSERT INTO users (name, email, password, role) VALUES 
  ('Admin User', 'admin@college.edu', '$2a$10$rVZ5YXqU5YXqU5YXqU5YXuO9YXqU5YXqU5YXqU5YXqU5YXqU5YXqU', 'admin');

-- -- Insert sample faculty (password: Faculty@123)
-- INSERT INTO users (name, email, password, role) VALUES 
--   ('Dr. John Smith', 'john.smith@college.edu', '$2a$10$rVZ5YXqU5YXqU5YXqU5YXuO9YXqU5YXqU5YXqU5YXqU5YXqU5YXqU', 'faculty');

-- -- Insert sample students (password: Student@123)
-- INSERT INTO users (name, email, password, role, class_id, section_id) VALUES 
--   ('Alice Johnson', 'alice@student.edu', '$2a$10$rVZ5YXqU5YXqU5YXqU5YXuO9YXqU5YXqU5YXqU5YXqU5YXqU5YXqU', 'student', 
--    '11111111-1111-1111-1111-111111111111', 
--    (SELECT id FROM sections WHERE class_id = '11111111-1111-1111-1111-111111111111' AND name = 'A')),
--   ('Bob Williams', 'bob@student.edu', '$2a$10$rVZ5YXqU5YXqU5YXqU5YXqU5YXqU5YXqU5YXqU5YXqU5YXqU5YXqU', 'student', 
--    '11111111-1111-1111-1111-111111111111', 
--    (SELECT id FROM sections WHERE class_id = '11111111-1111-1111-1111-111111111111' AND name = 'B'));