
-- =====================================================
-- Migration: 002_seed_skills
-- Description: Insert default skills into the skills table
-- =====================================================

-- Programming Languages
INSERT INTO skills (name, category) VALUES
('JavaScript', 'Programming Languages'),
('TypeScript', 'Programming Languages'),
('Python', 'Programming Languages'),
('Java', 'Programming Languages'),
('C#', 'Programming Languages'),
('PHP', 'Programming Languages'),
('Ruby', 'Programming Languages'),
('Go', 'Programming Languages'),
('Rust', 'Programming Languages'),
('Swift', 'Programming Languages'),
('Kotlin', 'Programming Languages')
ON CONFLICT (name) DO NOTHING;

-- Frontend Frameworks
INSERT INTO skills (name, category) VALUES
('React', 'Frontend Frameworks'),
('Next.js', 'Frontend Frameworks'),
('Vue.js', 'Frontend Frameworks'),
('Angular', 'Frontend Frameworks'),
('Svelte', 'Frontend Frameworks'),
('Tailwind CSS', 'Frontend Frameworks'),
('Bootstrap', 'Frontend Frameworks'),
('Material UI', 'Frontend Frameworks'),
('HTML5', 'Frontend Frameworks'),
('CSS3', 'Frontend Frameworks')
ON CONFLICT (name) DO NOTHING;

-- Backend Technologies
INSERT INTO skills (name, category) VALUES
('Node.js', 'Backend Technologies'),
('Express.js', 'Backend Technologies'),
('Django', 'Backend Technologies'),
('Flask', 'Backend Technologies'),
('Spring Boot', 'Backend Technologies'),
('Laravel', 'Backend Technologies'),
('Ruby on Rails', 'Backend Technologies'),
('ASP.NET', 'Backend Technologies'),
('GraphQL', 'Backend Technologies'),
('REST APIs', 'Backend Technologies')
ON CONFLICT (name) DO NOTHING;

-- Databases
INSERT INTO skills (name, category) VALUES
('PostgreSQL', 'Databases'),
('MySQL', 'Databases'),
('MongoDB', 'Databases'),
('Redis', 'Databases'),
('Elasticsearch', 'Databases'),
('Firebase', 'Databases'),
('DynamoDB', 'Databases'),
('SQLite', 'Databases')
ON CONFLICT (name) DO NOTHING;

-- DevOps & Cloud
INSERT INTO skills (name, category) VALUES
('Docker', 'DevOps'),
('Kubernetes', 'DevOps'),
('AWS', 'Cloud'),
('Azure', 'Cloud'),
('GCP', 'Cloud'),
('Terraform', 'DevOps'),
('Jenkins', 'DevOps'),
('GitLab CI', 'DevOps'),
('GitHub Actions', 'DevOps'),
('Linux', 'DevOps')
ON CONFLICT (name) DO NOTHING;

-- Soft Skills
INSERT INTO skills (name, category) VALUES
('Communication', 'Soft Skills'),
('Teamwork', 'Soft Skills'),
('Problem Solving', 'Soft Skills'),
('Leadership', 'Soft Skills'),
('Project Management', 'Soft Skills'),
('Time Management', 'Soft Skills'),
('Critical Thinking', 'Soft Skills'),
('Adaptability', 'Soft Skills')
ON CONFLICT (name) DO NOTHING;

-- Design
INSERT INTO skills (name, category) VALUES
('Figma', 'Design'),
('Adobe XD', 'Design'),
('Photoshop', 'Design'),
('Illustrator', 'Design'),
('Sketch', 'Design'),
('UI/UX Design', 'Design'),
('Wireframing', 'Design'),
('Prototyping', 'Design')
ON CONFLICT (name) DO NOTHING;

-- Testing
INSERT INTO skills (name, category) VALUES
('Jest', 'Testing'),
('Cypress', 'Testing'),
('Selenium', 'Testing'),
('JUnit', 'Testing'),
('PyTest', 'Testing'),
('Mocha', 'Testing'),
('Chai', 'Testing')
ON CONFLICT (name) DO NOTHING;