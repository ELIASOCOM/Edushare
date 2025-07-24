-- First, let's create a sample profile to reference in resources
-- This will be created automatically when a user signs up, but for seeding we need one
INSERT INTO public.profiles (
  id, 
  username, 
  full_name, 
  bio
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'system',
  'System Administrator',
  'System account for sample resources'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample resources
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
  '00000000-0000-0000-0000-000000000000'::uuid,
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
  '00000000-0000-0000-0000-000000000000'::uuid,
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
  '00000000-0000-0000-0000-000000000000'::uuid,
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
  '00000000-0000-0000-0000-000000000000'::uuid,
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
  '00000000-0000-0000-0000-000000000000'::uuid,
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
  '00000000-0000-0000-0000-000000000000'::uuid,
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
  '00000000-0000-0000-0000-000000000000'::uuid,
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
  '00000000-0000-0000-0000-000000000000'::uuid,
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
  '00000000-0000-0000-0000-000000000000'::uuid,
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
  '00000000-0000-0000-0000-000000000000'::uuid,
  987,
  4.5,
  76,
  false
);

-- Insert some sample ratings for variety
INSERT INTO public.ratings (user_id, resource_id, rating) 
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid,
  id,
  (RANDOM() * 2 + 3)::integer -- Random rating between 3-5
FROM public.resources 
LIMIT 5
ON CONFLICT (user_id, resource_id) DO NOTHING;
