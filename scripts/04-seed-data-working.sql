-- Insert sample resources without requiring a specific user
-- We'll use NULL for uploaded_by initially, then update policies to allow this
INSERT INTO public.resources (
  name, description, file_url, file_type, file_size, category, 
  uploaded_by, downloads, rating, rating_count, is_featured
) VALUES 
(
  'Advanced Calculus Fundamentals',
  'Comprehensive guide to advanced calculus concepts including limits, derivatives, and integrals. Perfect for undergraduate mathematics students.',
  '/placeholder.svg?height=400&width=300&text=Calculus+PDF',
  'pdf',
  2457600, -- 2.4 MB in bytes
  'Mathematics',
  NULL, -- No specific user - system resource
  1247,
  4.8,
  156,
  true
),
(
  'Quantum Physics Introduction',
  'Explore the fascinating world of quantum mechanics and particle physics. Covers wave-particle duality, uncertainty principle, and quantum states.',
  '/placeholder.svg?height=400&width=300&text=Quantum+Physics',
  'pdf',
  3251200, -- 3.1 MB in bytes
  'Physics',
  NULL,
  892,
  4.6,
  98,
  false
),
(
  'Interactive World History Timeline',
  'Visual timeline showcasing major world events from ancient civilizations to modern times. Interactive elements help students understand historical connections.',
  '/placeholder.svg?height=400&width=300&text=History+Timeline',
  'image',
  1887436, -- 1.8 MB in bytes
  'History',
  NULL,
  2156,
  4.9,
  203,
  true
),
(
  'Chemistry Lab Safety Protocol',
  'Essential safety procedures and protocols for chemistry laboratory work. Includes emergency procedures, equipment handling, and chemical storage guidelines.',
  '/placeholder.svg?height=400&width=300&text=Lab+Safety',
  'video',
  47185920, -- 45.2 MB in bytes
  'Chemistry',
  NULL,
  567,
  4.7,
  67,
  false
),
(
  'Classic Literature Anthology',
  'Curated collection of timeless literary masterpieces and analysis. Features works from Shakespeare, Dickens, Austen, and other renowned authors.',
  '/placeholder.svg?height=400&width=300&text=Literature+Collection',
  'document',
  5872025, -- 5.6 MB in bytes
  'Literature',
  NULL,
  1834,
  4.5,
  145,
  false
),
(
  'Cell Biology Structure Guide',
  'Detailed presentation on cellular anatomy, organelles, and biological processes. Includes high-resolution diagrams and interactive elements.',
  '/placeholder.svg?height=400&width=300&text=Cell+Biology',
  'presentation',
  8601600, -- 8.2 MB in bytes
  'Biology',
  NULL,
  743,
  4.4,
  89,
  false
),
(
  'Programming Fundamentals in Python',
  'Complete beginner guide to Python programming. Covers variables, functions, loops, and object-oriented programming concepts.',
  '/placeholder.svg?height=400&width=300&text=Python+Programming',
  'pdf',
  4123456, -- 3.9 MB in bytes
  'Computer Science',
  NULL,
  3421,
  4.7,
  287,
  true
),
(
  'Renaissance Art History',
  'Comprehensive study of Renaissance art movements, key artists, and cultural impact. Features high-quality reproductions of famous works.',
  '/placeholder.svg?height=400&width=300&text=Renaissance+Art',
  'presentation',
  12345678, -- 11.8 MB in bytes
  'Art',
  NULL,
  1567,
  4.6,
  134,
  false
),
(
  'World Geography Atlas',
  'Interactive atlas covering physical geography, climate patterns, and cultural regions. Includes detailed maps and statistical data.',
  '/placeholder.svg?height=400&width=300&text=Geography+Atlas',
  'image',
  9876543, -- 9.4 MB in bytes
  'Geography',
  NULL,
  2234,
  4.8,
  198,
  true
),
(
  'Music Theory Fundamentals',
  'Essential music theory concepts including scales, chords, rhythm, and composition techniques. Audio examples included.',
  '/placeholder.svg?height=400&width=300&text=Music+Theory',
  'audio',
  15432109, -- 14.7 MB in bytes
  'Music',
  NULL,
  987,
  4.5,
  76,
  false
),
(
  'Organic Chemistry Reactions',
  'Comprehensive guide to organic chemistry reactions, mechanisms, and synthesis pathways. Includes practice problems and solutions.',
  '/placeholder.svg?height=400&width=300&text=Organic+Chemistry',
  'pdf',
  6789012, -- 6.5 MB in bytes
  'Chemistry',
  NULL,
  1456,
  4.6,
  112,
  false
),
(
  'European History 1800-1900',
  'Detailed analysis of 19th century European political, social, and economic developments. Covers major wars, revolutions, and cultural changes.',
  '/placeholder.svg?height=400&width=300&text=European+History',
  'document',
  3456789, -- 3.3 MB in bytes
  'History',
  NULL,
  987,
  4.4,
  89,
  false
),
(
  'Data Structures and Algorithms',
  'Essential computer science concepts covering arrays, linked lists, trees, graphs, sorting, and searching algorithms with code examples.',
  '/placeholder.svg?height=400&width=300&text=Data+Structures',
  'pdf',
  5432109, -- 5.2 MB in bytes
  'Computer Science',
  NULL,
  2345,
  4.8,
  201,
  true
),
(
  'Modern Art Movements',
  'Exploration of 20th century art movements including Impressionism, Cubism, Surrealism, and Abstract Expressionism.',
  '/placeholder.svg?height=400&width=300&text=Modern+Art',
  'presentation',
  8765432, -- 8.4 MB in bytes
  'Art',
  NULL,
  1234,
  4.5,
  98,
  false
),
(
  'Physical Geography Fundamentals',
  'Study of Earth\'s physical features, climate systems, and natural processes. Includes topographic maps and satellite imagery.',
  '/placeholder.svg?height=400&width=300&text=Physical+Geography',
  'image',
  7654321, -- 7.3 MB in bytes
  'Geography',
  NULL,
  1678,
  4.7,
  145,
  false
);

-- Note: We don't insert sample ratings since we don't have real users yet
-- Ratings will be added when real users start using the system
