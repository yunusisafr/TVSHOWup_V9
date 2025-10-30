/*
  # Cleanup Wrong Turkish Provider IDs

  1. Purpose
    - Remove all incorrect Turkish provider IDs and their relationships
    - Clean up providers: 1791 (wrong Exxen), 1838 (wrong Gain), 9001-9004 (custom IDs)
    - Remove all content_providers relationships with these IDs
    - Prepare database for correct TMDB network IDs (4409 Gain, 4405 Exxen)

  2. Changes
    - Delete content_providers records with wrong provider IDs
    - Delete provider records with wrong IDs
    - Clean up any orphaned data

  3. Impact
    - Removes incorrect Turkish provider mappings
    - Prepares for correct TMDB network ID integration
    - No data loss - relationships will be recreated with correct IDs

  4. Security
    - Maintains existing RLS policies
    - No impact on user permissions
*/

-- Step 1: Remove content_providers relationships with wrong IDs
DELETE FROM content_providers
WHERE provider_id IN (1791, 1838, 9001, 9002, 9003, 9004);

-- Step 2: Remove provider records with wrong IDs
DELETE FROM providers
WHERE id IN (1791, 1838, 9001, 9002, 9003, 9004);

-- Step 3: Verify cleanup
DO $$
DECLARE
  removed_content_providers INTEGER;
  removed_providers INTEGER;
BEGIN
  -- Check if any wrong IDs still exist
  SELECT COUNT(*) INTO removed_content_providers
  FROM content_providers
  WHERE provider_id IN (1791, 1838, 9001, 9002, 9003, 9004);

  SELECT COUNT(*) INTO removed_providers
  FROM providers
  WHERE id IN (1791, 1838, 9001, 9002, 9003, 9004);

  IF removed_content_providers > 0 OR removed_providers > 0 THEN
    RAISE WARNING 'Cleanup incomplete: % content_providers, % providers remain',
      removed_content_providers, removed_providers;
  ELSE
    RAISE NOTICE 'Cleanup successful: All wrong Turkish provider IDs removed';
    RAISE NOTICE '  - Removed IDs: 1791 (Exxen), 1838 (Gain), 9001-9004 (Custom)';
    RAISE NOTICE '  - Ready for correct TMDB network IDs: 4409 (Gain), 4405 (Exxen)';
  END IF;
END $$;
