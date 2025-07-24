-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Resources policies
CREATE POLICY "Resources are viewable by everyone" 
  ON public.resources FOR SELECT 
  USING (is_approved = true);

CREATE POLICY "Users can insert their own resources" 
  ON public.resources FOR INSERT 
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own resources" 
  ON public.resources FOR UPDATE 
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own resources" 
  ON public.resources FOR DELETE 
  USING (auth.uid() = uploaded_by);

-- Favorites policies
CREATE POLICY "Users can view their own favorites" 
  ON public.favorites FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" 
  ON public.favorites FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
  ON public.favorites FOR DELETE 
  USING (auth.uid() = user_id);

-- Ratings policies
CREATE POLICY "Ratings are viewable by everyone" 
  ON public.ratings FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own ratings" 
  ON public.ratings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
  ON public.ratings FOR UPDATE 
  USING (auth.uid() = user_id);

-- Downloads policies
CREATE POLICY "Users can view their own downloads" 
  ON public.downloads FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own downloads" 
  ON public.downloads FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
