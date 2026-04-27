-- CREATE SAVED CONTACTS TABLE
CREATE TABLE IF NOT EXISTS saved_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, contact_id)
);

-- CREATE STICKER PACKS TABLE
CREATE TABLE IF NOT EXISTS sticker_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  thumbnail_url text,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- CREATE STICKERS TABLE
CREATE TABLE IF NOT EXISTS stickers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id uuid REFERENCES sticker_packs(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  name text,
  created_at timestamptz DEFAULT now()
);

-- CREATE VOICE MESSAGES TABLE
CREATE TABLE IF NOT EXISTS voice_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  group_id uuid,
  media_url text NOT NULL,
  duration integer,
  created_at timestamptz DEFAULT now()
);

-- CREATE INVITES TABLE
CREATE TABLE IF NOT EXISTS invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL, -- 'group' or 'community'
  target_id uuid NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  expires_at timestamptz,
  max_uses integer,
  uses integer DEFAULT 0,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ENABLE REALTIME FOR NEW TABLES
ALTER PUBLICATION supabase_realtime ADD TABLE saved_contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE sticker_packs;
ALTER PUBLICATION supabase_realtime ADD TABLE stickers;
ALTER PUBLICATION supabase_realtime ADD TABLE voice_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE invites;
