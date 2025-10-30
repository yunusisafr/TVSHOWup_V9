/*
  # Fix AI Chat Rate Limit Auto-Creation

  ## Problem
  When a user sends their first AI chat message, `increment_ai_chat_usage` is called
  but no record exists yet in `ai_chat_usage_limits` table, causing it to return false
  and the user sees "Daily limit reached" error.

  ## Solution
  Update `increment_ai_chat_usage` to auto-create the record if it doesn't exist,
  similar to how `check_and_reset_ai_chat_limits` works.

  ## Changes
  - Modified `increment_ai_chat_usage` to:
    1. Check if record exists
    2. If not, create it with appropriate base limit
    3. Then increment the counter
    4. This prevents the "no record found" false return
*/

-- Drop and recreate increment_ai_chat_usage with auto-creation
DROP FUNCTION IF EXISTS increment_ai_chat_usage(uuid, text);

CREATE OR REPLACE FUNCTION increment_ai_chat_usage(
  p_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_used integer;
  v_daily_limit integer;
  v_rows_updated integer;
  v_base_limit integer := 5;
  v_now timestamptz := now();
BEGIN
  -- Determine base limit
  IF p_user_id IS NOT NULL THEN
    v_base_limit := 25;
  ELSE
    v_base_limit := 5;
  END IF;

  -- Get current usage and daily limit
  IF p_user_id IS NOT NULL THEN
    SELECT used_count, daily_limit
    INTO v_current_used, v_daily_limit
    FROM ai_chat_usage_limits
    WHERE user_id = p_user_id;
  ELSE
    SELECT used_count, daily_limit
    INTO v_current_used, v_daily_limit
    FROM ai_chat_usage_limits
    WHERE session_id = p_session_id;
  END IF;

  -- If no record found, create it
  IF v_current_used IS NULL THEN
    RAISE NOTICE 'No usage record found - creating new record with limit %', v_base_limit;

    INSERT INTO ai_chat_usage_limits (
      user_id,
      session_id,
      daily_limit,
      bonus_limit,
      used_count,
      last_reset_at,
      created_at,
      updated_at
    )
    VALUES (
      p_user_id,
      p_session_id,
      v_base_limit,
      0,
      1, -- Start at 1 since we're incrementing
      v_now,
      v_now,
      v_now
    );

    RAISE NOTICE 'Successfully created record and set usage to 1';
    RETURN true;
  END IF;

  -- Check if limit would be exceeded
  IF v_current_used >= v_daily_limit THEN
    RAISE NOTICE 'Rate limit exceeded: % >= %', v_current_used, v_daily_limit;
    RETURN false;
  END IF;

  -- Atomically increment the counter
  IF p_user_id IS NOT NULL THEN
    UPDATE ai_chat_usage_limits
    SET
      used_count = used_count + 1,
      updated_at = now()
    WHERE user_id = p_user_id
      AND used_count < daily_limit;
  ELSE
    UPDATE ai_chat_usage_limits
    SET
      used_count = used_count + 1,
      updated_at = now()
    WHERE session_id = p_session_id
      AND used_count < daily_limit;
  END IF;

  -- Check if update was successful
  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

  IF v_rows_updated > 0 THEN
    RAISE NOTICE 'Successfully incremented usage count to %', v_current_used + 1;
    RETURN true;
  ELSE
    RAISE NOTICE 'Failed to increment - concurrent limit reached';
    RETURN false;
  END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_ai_chat_usage(uuid, text) TO authenticated, anon;
