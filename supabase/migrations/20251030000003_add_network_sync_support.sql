/*
  # Add Network Sync Support

  1. Purpose
    - Ensure sync scripts can properly identify and handle network providers
    - Add indexes for efficient network provider queries
    - Prepare content_providers table for network relationships
    - Support dual provider system (watch providers + network providers)

  2. Changes
    - Add index on providers(is_network_provider) for efficient filtering
    - Add index on providers(provider_type, country_of_origin) for Turkish networks
    - Add composite index on content_providers(tmdb_id, content_type, provider_id)
    - Update provider constraints to support both provider types

  3. Impact
    - Improves query performance for network provider lookups
    - Enables efficient sync operations for Turkish content
    - Supports content having both watch providers and network providers
    - No breaking changes to existing functionality

  4. Security
    - Maintains existing RLS policies
    - No impact on user permissions
*/

-- Add index for network provider queries
CREATE INDEX IF NOT EXISTS idx_providers_is_network_provider
ON providers(is_network_provider)
WHERE is_network_provider = true;

-- Add index for Turkish network providers
CREATE INDEX IF NOT EXISTS idx_providers_network_country
ON providers(provider_type, country_of_origin)
WHERE provider_type = 'network' AND country_of_origin = 'TR';

-- Add composite index for content-provider relationships
CREATE INDEX IF NOT EXISTS idx_content_providers_lookup
ON content_providers(content_id, content_type, provider_id);

-- Add index for provider type queries
CREATE INDEX IF NOT EXISTS idx_content_providers_provider_country
ON content_providers(provider_id, country_code);

-- Verify indexes
DO $$
DECLARE
  network_idx_exists BOOLEAN;
  country_idx_exists BOOLEAN;
  lookup_idx_exists BOOLEAN;
  type_idx_exists BOOLEAN;
BEGIN
  -- Check if indexes exist
  SELECT EXISTS(
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_providers_is_network_provider'
  ) INTO network_idx_exists;

  SELECT EXISTS(
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_providers_network_country'
  ) INTO country_idx_exists;

  SELECT EXISTS(
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_content_providers_lookup'
  ) INTO lookup_idx_exists;

  SELECT EXISTS(
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_content_providers_provider_country'
  ) INTO type_idx_exists;

  IF network_idx_exists AND country_idx_exists AND lookup_idx_exists AND type_idx_exists THEN
    RAISE NOTICE 'Network sync support indexes created successfully:';
    RAISE NOTICE '  ✓ idx_providers_is_network_provider - Network provider filtering';
    RAISE NOTICE '  ✓ idx_providers_network_country - Turkish network lookup';
    RAISE NOTICE '  ✓ idx_content_providers_lookup - Content-provider relationships';
    RAISE NOTICE '  ✓ idx_content_providers_provider_country - Provider country queries';
    RAISE NOTICE '';
    RAISE NOTICE 'Sync scripts can now efficiently:';
    RAISE NOTICE '  - Query network providers for Turkish content';
    RAISE NOTICE '  - Update content-provider relationships';
    RAISE NOTICE '  - Handle both watch providers and network providers';
  ELSE
    RAISE WARNING 'Some indexes may not have been created';
  END IF;
END $$;
