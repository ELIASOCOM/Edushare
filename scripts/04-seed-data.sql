-- Insert sample resources (these will be replaced with real uploads later)
INSERT INTO public.resources (
  name, description, file_url, file_type, file_size, category, 
  uploaded_by, downloads, rating, rating_count, is_featured
) VALUES 
(
  'Advanced Calculus Fundamentals',
  'Comprehensive guide to advanced calculus concepts including limits, derivatives, and integrals',
  '/placeholder.svg?height=400&width=300',
  'pdf',
  2457600, -- 2.4 MB in bytes
  'Mathematics',
  (SELECT id FROM public.profiles LIMIT 1),
  1247,
  4.8,
  156,
  true
),
(
  'Quantum Physics Introduction',
  'Explore the fascinating world of quantum mechanics and particle physics',
  '/placeholder.svg?height=400&width=300',
  'pdf',
  3251200, -- 3.1 MB in bytes
  'Physics',
  (SELECT id FROM public.profiles LIMIT 1),
  892,
  4.6,
  98,
  false
),
(
  'Interactive World History Timeline',
  'Visual timeline showcasing major world events from ancient civilizations to modern times',
  '/placeholder.svg?height=400&width=300',
  'image',
  1887436, -- 1.8 MB in bytes
  'History',
  (SELECT id FROM public.profiles LIMIT 1),
  2156,
  4.9,
  203,
  true
),
(
  'Chemistry Lab Safety Protocol',
  'Essential safety procedures and protocols for chemistry laboratory work',
  '/placeholder.svg?height=400&width=300',
  'video',
  47185920, -- 45.2 MB in bytes
  'Chemistry',
  (SELECT id FROM public.profiles LIMIT 1),
  567,
  4.7,
  67,
  false
),
(
  'Classic Literature Anthology',
  'Curated collection of timeless literary masterpieces and analysis',
  '/placeholder.svg?height=400&width=300',
  'document',
  5872025, -- 5.6 MB in bytes
  'Literature',
  (SELECT id FROM public.profiles LIMIT 1),
  1834,
  4.5,
  145,
  false
),
(
  'Cell Biology Structure Guide',
  'Detailed presentation on cellular anatomy, organelles, and biological processes',
  '/placeholder.svg?height=400&width=300',
  'presentation',
  8601600, -- 8.2 MB in bytes
  'Biology',
  (SELECT id FROM public.profiles LIMIT 1),
  743,
  4.4,
  89,
  false
);
