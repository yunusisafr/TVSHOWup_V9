/*
  # Add IP-Based Validation to AI Chat Rate Limiting

  ## Problem
  Visitors can manipulate rate limits by:
  1. Clearing browser storage (sessionStorage/localStorage)
  2. Creating new session IDs to bypass the 5 prompt limit

  ## Solution
  Implement server-side IP address validation:
  1. Store client IP address with each session record
  2. Validate IP address on every request
  3. If IP changes, treat as new session (prevents hijacking)
  4. Automatically create records with proper IP tracking

  ## Changes
  - Ensure ip_address column exists in ai_chat_usage_limits table
  - Update check_and_reset_ai_chat_limits to validate and store IP
  - Update increment_ai_chat_usage to validate IP before incrementing
  - Auto-create records with IP address if they don't exist

  ## Security
  - IP validation prevents session manipulation
  - Each session is tied to its originating IP address
  - IP changes invalidate old session and create new one
  - No IP bans - just per-IP session tracking
*/

-- Ensure ip_address column exists (may already exist from previous migrations)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_chat_usage_limits'
    AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE ai_chat_usage_limits ADD COLUMN ip_address inet;
    CREATE INDEX IF NOT EXISTS idx_ai_chat_usage_limits_ip_address
      ON ai_chat_usage_limits(ip_address);
  END IF;
END $$;

-- Drop and recreate check_and_reset_ai_chat_limits with IP validation
DROP FUNCTION IF EXISTS check_and_reset_ai_chat_limits(uuid, text);

CREATE OR REPLACE FUNCTION check_and_reset_ai_chat_limits(
  p_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL
)
RETURNS TABLE(
  daily_limit integer,
  bonus_limit integer,
  used_count integer,
  remaining integer,
  reset_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record ai_chat_usage_limits;
  v_now timestamptz := now();
  v_hours_since_reset numeric;
  v_base_limit integer := 5;
  v_client_ip inet;
BEGIN
  -- Get client IP address from the current connection
  v_client_ip := inet_client_addr();

  -- Fallback if IP not available (shouldn't happen in production)
  IF v_client_ip IS NULL THEN
    v_client_ip := '0.0.0.0'::inet;
  END IF;

  -- Determine base limit
  IF p_user_id IS NOT NULL THEN
    v_base_limit := 25;
  ELSE
    v_base_limit := 5;
  END IF;

  -- Find existing record
  IF p_user_id IS NOT NULL THEN
    SELECT * INTO v_record FROM ai_chat_usage_limits WHERE user_id = p_user_id;
  ELSE
    SELECT * INTO v_record FROM ai_chat_usage_limits WHERE session_id = p_session_id;
  END IF;

  -- Check if record exists and validate IP
  IF v_record.id IS NOT NULL THEN
    -- If IP has changed, delete old session and create new one
    IF v_record.ip_address IS NOT NULL AND v_record.ip_address != v_client_ip THEN
      RAISE NOTICE 'IP address changed from % to % - creating new session', v_record.ip_address, v_client_ip;

      DELETE FROM ai_chat_usage_limits WHERE id = v_record.id;
      v_record.id := NULL; -- Force creation of new record
    END IF;
  END IF;

  -- If no valid record exists, create it
  IF v_record.id IS NULL THEN
    INSERT INTO ai_chat_usage_limits (
      user_id,
      session_id,
      ip_address,
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
      v_client_ip,
      v_base_limit,
      0,
      0,
      v_now,
      v_now,
      v_now
    )
    RETURNING * INTO v_record;

    RAISE NOTICE 'Created new rate limit record with IP %', v_client_ip;
  ELSE
    -- Calculate hours since last reset
    v_hours_since_reset := EXTRACT(EPOCH FROM (v_now - v_record.last_reset_at)) / 3600;

    -- If more than 24 hours, reset limits
    IF v_hours_since_reset >= 24 THEN
      UPDATE ai_chat_usage_limits
      SET
        used_count = 0,
        bonus_limit = 0,
        last_reset_at = v_now,
        updated_at = v_now,
        ip_address = v_client_ip
      WHERE id = v_record.id
      RETURNING * INTO v_record;

      RAISE NOTICE 'Reset rate limits after 24 hours';
    ELSE
      -- Just update IP address if it hasn't changed
      IF v_record.ip_address != v_client_ip THEN
        UPDATE ai_chat_usage_limits
        SET ip_address = v_client_ip, updated_at = v_now
        WHERE id = v_record.id
        RETURNING * INTO v_record;
      END IF;
    END IF;
  END IF;

  -- Return current state
  RETURN QUERY SELECT
    v_record.daily_limit,
    0 as bonus_limit,
    v_record.used_count,
    (v_record.daily_limit - v_record.used_count) as remaining,
    v_record.last_reset_at + interval '24 hours' as reset_at;
END;
$$;

-- Drop and recreate increment_ai_chat_usage with IP validation
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
  v_client_ip inet;
  v_stored_ip inet;
BEGIN
  -- Get client IP address
  v_client_ip := inet_client_addr();

  IF v_client_ip IS NULL THEN
    v_client_ip := '0.0.0.0'::inet;
  END IF;

  -- Determine base limit
  IF p_user_id IS NOT NULL THEN
    v_base_limit := 25;
  ELSE
    v_base_limit := 5;
  END IF;

  -- Get current usage, daily limit, and stored IP
  IF p_user_id IS NOT NULL THEN
    SELECT used_count, daily_limit, ip_address
    INTO v_current_used, v_daily_limit, v_stored_ip
    FROM ai_chat_usage_limits
    WHERE user_id = p_user_id;
  ELSE
    SELECT used_count, daily_limit, ip_address
    INTO v_current_used, v_daily_limit, v_stored_ip
    FROM ai_chat_usage_limits
    WHERE session_id = p_session_id;
  END IF;

  -- If no record found, create it
  IF v_current_used IS NULL THEN
    RAISE NOTICE 'No usage record found - creating new record with limit % and IP %', v_base_limit, v_client_ip;

    INSERT INTO ai_chat_usage_limits (
      user_id,
      session_id,
      ip_address,
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
      v_client_ip,
      v_base_limit,
      0,
      1,
      v_now,
      v_now,
      v_now
    );

    RAISE NOTICE 'Successfully created record and set usage to 1';
    RETURN true;
  END IF;

  -- Validate IP address matches
  IF v_stored_ip IS NOT NULL AND v_stored_ip != v_client_ip THEN
    RAISE NOTICE 'IP address mismatch: stored=%, client=% - rejecting request', v_stored_ip, v_client_ip;
    RETURN false;
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
      ip_address = v_client_ip,
      updated_at = now()
    WHERE user_id = p_user_id
      AND used_count < daily_limit;
  ELSE
    UPDATE ai_chat_usage_limits
    SET
      used_count = used_count + 1,
      ip_address = v_client_ip,
      updated_at = now()
    WHERE session_id = p_session_id
      AND used_count < daily_limit;
  END IF;

  -- Check if update was successful
  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

  IF v_rows_updated > 0 THEN
    RAISE NOTICE 'Successfully incremented usage count to % for IP %', v_current_used + 1, v_client_ip;
    RETURN true;
  ELSE
    RAISE NOTICE 'Failed to increment - concurrent limit reached';
    RETURN false;
  END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_and_reset_ai_chat_limits(uuid, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION increment_ai_chat_usage(uuid, text) TO authenticated, anon;
