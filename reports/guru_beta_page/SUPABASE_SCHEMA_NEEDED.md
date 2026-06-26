# SUPABASE SCHEMA NEEDED

## Reason
The existing form submissions on Nirvan Dham (e.g., `shakti_snan_applications`) are hardcoded to specific program fields. The Guru Beta Seva application requires 16 distinct fields that do not map to the existing tables.

## Required Table
Name: `guru_beta_applications`

## Schema definition (SQL)
```sql
CREATE TABLE guru_beta_applications (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  organization_name TEXT,
  tradition TEXT NOT NULL,
  primary_language TEXT NOT NULL,
  tester_count TEXT NOT NULL,
  disciple_language TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  disciple_private_testing TEXT NOT NULL,
  internal_beta_listing_permission TEXT NOT NULL,
  donation_support_preference TEXT NOT NULL,
  future_interest TEXT[],
  tradition_safety_notes TEXT,
  test_question_notes TEXT,
  additional_notes TEXT,
  consent BOOLEAN NOT NULL,
  source_page TEXT DEFAULT '/guru-beta-seva',
  status TEXT DEFAULT 'pending',
  email_delivery_status TEXT,
  email_delivery_error TEXT
);
```
