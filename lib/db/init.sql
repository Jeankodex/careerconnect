
-- Insert default skills (run after creating tables)
INSERT INTO skills (name, category) VALUES
('JavaScript', 'Programming Languages'),
('TypeScript', 'Programming Languages'),
('Python', 'Programming Languages'),
('Java', 'Programming Languages'),
('React', 'Frameworks'),
('Next.js', 'Frameworks'),
('Node.js', 'Backend'),
('PostgreSQL', 'Databases'),
('MongoDB', 'Databases'),
('Docker', 'DevOps'),
('AWS', 'Cloud'),
('Git', 'Version Control'),
('Agile', 'Methodologies'),
('Project Management', 'Management')
ON CONFLICT (name) DO NOTHING;