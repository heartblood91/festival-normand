-- i18n migration: rename existing text fields to _fr, add _en columns

-- Events
ALTER TABLE events RENAME COLUMN title TO title_fr;
ALTER TABLE events ADD COLUMN title_en TEXT;
ALTER TABLE events RENAME COLUMN description TO description_fr;
ALTER TABLE events ADD COLUMN description_en TEXT;
ALTER TABLE events RENAME COLUMN pricing TO pricing_fr;
ALTER TABLE events ADD COLUMN pricing_en TEXT;

-- Change description_fr to TEXT type if not already
ALTER TABLE events ALTER COLUMN description_fr TYPE TEXT;

-- News
ALTER TABLE news RENAME COLUMN title TO title_fr;
ALTER TABLE news ADD COLUMN title_en TEXT;
ALTER TABLE news RENAME COLUMN excerpt TO excerpt_fr;
ALTER TABLE news ADD COLUMN excerpt_en TEXT;
ALTER TABLE news RENAME COLUMN content TO content_fr;
ALTER TABLE news ADD COLUMN content_en TEXT;

-- Change content_fr to TEXT type if not already
ALTER TABLE news ALTER COLUMN content_fr TYPE TEXT;

-- Partners
ALTER TABLE partners RENAME COLUMN name TO name_fr;
ALTER TABLE partners ADD COLUMN name_en TEXT;

-- Pages
ALTER TABLE pages RENAME COLUMN title TO title_fr;
ALTER TABLE pages ADD COLUMN title_en TEXT;
ALTER TABLE pages RENAME COLUMN content TO content_fr;
ALTER TABLE pages ADD COLUMN content_en TEXT;

-- Change content_fr to TEXT type if not already
ALTER TABLE pages ALTER COLUMN content_fr TYPE TEXT;
