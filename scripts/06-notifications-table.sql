-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications(read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at DESC);

-- Function to create notifications for new resources
CREATE OR REPLACE FUNCTION public.notify_users_of_new_resource()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify users who have favorited resources in the same category
  INSERT INTO public.notifications (user_id, title, message, type, action_url)
  SELECT DISTINCT f.user_id,
    'New Resource Available!',
    'A new ' || NEW.category || ' resource "' || NEW.name || '" has been added.',
    'info',
    '/resource/' || NEW.id
  FROM public.favorites f
  JOIN public.resources r ON f.resource_id = r.id
  WHERE r.category = NEW.category
    AND f.user_id != NEW.uploaded_by; -- Don't notify the uploader
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new resource notifications
DROP TRIGGER IF EXISTS on_new_resource_notify ON public.resources;
CREATE TRIGGER on_new_resource_notify
  AFTER INSERT ON public.resources
  FOR EACH ROW EXECUTE PROCEDURE public.notify_users_of_new_resource();

-- Function to create notifications for new favorites
CREATE OR REPLACE FUNCTION public.notify_resource_owner_of_favorite()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify resource owner when someone favorites their resource
  INSERT INTO public.notifications (user_id, title, message, type, action_url)
  SELECT r.uploaded_by,
    'Resource Favorited!',
    'Someone added your resource "' || r.name || '" to their favorites.',
    'success',
    '/resource/' || r.id
  FROM public.resources r
  WHERE r.id = NEW.resource_id
    AND r.uploaded_by IS NOT NULL
    AND r.uploaded_by != NEW.user_id; -- Don't notify if user favorites their own resource
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for favorite notifications
DROP TRIGGER IF EXISTS on_favorite_notify ON public.favorites;
CREATE TRIGGER on_favorite_notify
  AFTER INSERT ON public.favorites
  FOR EACH ROW EXECUTE PROCEDURE public.notify_resource_owner_of_favorite();

-- Function to create notifications for new ratings
CREATE OR REPLACE FUNCTION public.notify_resource_owner_of_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify resource owner when someone rates their resource
  INSERT INTO public.notifications (user_id, title, message, type, action_url)
  SELECT r.uploaded_by,
    'New Rating!',
    'Your resource "' || r.name || '" received a ' || NEW.rating || '-star rating.',
    'success',
    '/resource/' || r.id
  FROM public.resources r
  WHERE r.id = NEW.resource_id
    AND r.uploaded_by IS NOT NULL
    AND r.uploaded_by != NEW.user_id; -- Don't notify if user rates their own resource
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for rating notifications
DROP TRIGGER IF EXISTS on_rating_notify ON public.ratings;
CREATE TRIGGER on_rating_notify
  AFTER INSERT ON public.ratings
  FOR EACH ROW EXECUTE PROCEDURE public.notify_resource_owner_of_rating();
