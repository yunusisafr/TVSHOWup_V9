/*
  # Add Correct Turkish Network Providers

  1. Purpose
    - Add Gain (TMDB Network ID: 4409) to providers table
    - Add Exxen (TMDB Network ID: 4405) to providers table
    - Use correct TMDB network IDs instead of custom/wrong IDs
    - Mark them as network providers (production/broadcast)

  2. Changes
    - Insert Gain with ID 4409 (TMDB network)
    - Insert Exxen with ID 4405 (TMDB network)
    - Set provider_type = 'network'
    - Set is_network_provider = true
    - Set is_watch_provider = false (these are production networks, not streaming platforms)

  3. Provider Details
    - Gain (4409): Turkish streaming network that produces original content
    - Exxen (4405): Turkish premium streaming network that produces original content
    - Both are marked as networks because TMDB lists them in Networks API
    - Both support Turkey region only (supported_countries = ['TR'])

  4. Security
    - Maintains existing RLS policies
    - No impact on user permissions
*/

-- Insert Gain network provider (TMDB Network ID: 4409)
INSERT INTO providers (
  id,
  name,
  logo_path,
  display_priority,
  provider_type,
  is_watch_provider,
  is_network_provider,
  is_active,
  supported_countries,
  country_of_origin,
  website_url,
  description
)
VALUES (
  4409,
  'Gain',
  '/9ghgSC0MA082EL6HLCW3GalykFD.jpg',
  16,
  'network',
  false,
  true,
  true,
  ARRAY['TR'],
  'TR',
  'https://www.gain.tv',
  'Turkish streaming network producing original content'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  logo_path = EXCLUDED.logo_path,
  display_priority = EXCLUDED.display_priority,
  provider_type = EXCLUDED.provider_type,
  is_watch_provider = EXCLUDED.is_watch_provider,
  is_network_provider = EXCLUDED.is_network_provider,
  is_active = EXCLUDED.is_active,
  supported_countries = EXCLUDED.supported_countries,
  country_of_origin = EXCLUDED.country_of_origin,
  website_url = EXCLUDED.website_url,
  description = EXCLUDED.description,
  updated_at = now();

-- Insert Exxen network provider (TMDB Network ID: 4405)
-- Note: This is the network/production ID, different from watch provider ID
INSERT INTO providers (
  id,
  name,
  logo_path,
  display_priority,
  provider_type,
  is_watch_provider,
  is_network_provider,
  is_active,
  supported_countries,
  country_of_origin,
  website_url,
  description
)
VALUES (
  4405,
  'Exxen',
  '/8aCIXlAvcLYigdAoDgge1MvdfAb.jpg',
  15,
  'network',
  false,
  true,
  true,
  ARRAY['TR'],
  'TR',
  'https://www.exxen.com',
  'Turkish premium streaming network producing original content'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  logo_path = EXCLUDED.logo_path,
  display_priority = EXCLUDED.display_priority,
  provider_type = EXCLUDED.provider_type,
  is_watch_provider = EXCLUDED.is_watch_provider,
  is_network_provider = EXCLUDED.is_network_provider,
  is_active = EXCLUDED.is_active,
  supported_countries = EXCLUDED.supported_countries,
  country_of_origin = EXCLUDED.country_of_origin,
  website_url = EXCLUDED.website_url,
  description = EXCLUDED.description,
  updated_at = now();

-- Verify the insertions
DO $$
DECLARE
  gain_exists BOOLEAN;
  exxen_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM providers WHERE id = 4409) INTO gain_exists;
  SELECT EXISTS(SELECT 1 FROM providers WHERE id = 4405) INTO exxen_exists;

  IF gain_exists AND exxen_exists THEN
    RAISE NOTICE 'Turkish network providers added successfully:';
    RAISE NOTICE '  ✓ Gain (ID: 4409) - Network provider for Turkey';
    RAISE NOTICE '  ✓ Exxen (ID: 4405) - Network provider for Turkey';
  ELSE
    RAISE WARNING 'Provider insertion incomplete:';
    IF NOT gain_exists THEN
      RAISE WARNING '  ✗ Gain (4409) missing';
    END IF;
    IF NOT exxen_exists THEN
      RAISE WARNING '  ✗ Exxen (4405) missing';
    END IF;
  END IF;
END $$;
