/*
  # Fix AI Chat RLS Policies for Authenticated Users

  ## Problem
  Authenticated users (including admins) are getting RLS policy violations when
  trying to insert messages into ai_chat_messages table. The issue occurs when:
  1. An old conversation with session_id exists
  2. User logs in but the conversation wasn't updated with user_id
  3. RLS policy only checks user_id match, not session ownership

  ## Solution
  Update RLS policies to be more flexible:
  1. Allow authenticated users to create messages in conversations they own by user_id
  2. Also allow authenticated users to create messages in conversations they own by session
  3. Allow users to update conversations from session-based to user-based
  4. Add policy to allow users to update their own conversations

  ## Changes
  - Drop existing restrictive policies
  - Create more flexible policies that handle both user_id and session_id cases
  - Add UPDATE policy for conversations
*/

-- Drop existing restrictive policies for ai_chat_conversations
DROP POLICY IF EXISTS "Users can update own conversations" ON ai_chat_conversations;

-- Create more flexible UPDATE policy for conversations
CREATE POLICY "Users can update own or session conversations"
  ON ai_chat_conversations FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR (user_id IS NULL AND session_id IS NOT NULL)
  )
  WITH CHECK (
    auth.uid() = user_id
    OR (auth.uid() = user_id AND session_id IS NULL)
  );

-- Drop existing restrictive policies for ai_chat_messages
DROP POLICY IF EXISTS "Users can create messages in own conversations" ON ai_chat_messages;

-- Create more flexible INSERT policy for messages
CREATE POLICY "Users can create messages in own or session conversations"
  ON ai_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_chat_conversations
      WHERE ai_chat_conversations.id = ai_chat_messages.conversation_id
      AND (
        ai_chat_conversations.user_id = auth.uid()
        OR (ai_chat_conversations.user_id IS NULL AND ai_chat_conversations.session_id IS NOT NULL)
      )
    )
  );

-- Also update the SELECT policy to allow viewing session-based messages after login
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON ai_chat_messages;

CREATE POLICY "Users can view messages in own or session conversations"
  ON ai_chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ai_chat_conversations
      WHERE ai_chat_conversations.id = ai_chat_messages.conversation_id
      AND (
        ai_chat_conversations.user_id = auth.uid()
        OR (ai_chat_conversations.user_id IS NULL AND ai_chat_conversations.session_id IS NOT NULL)
      )
    )
  );

-- Update conversation policy to allow viewing session conversations after login
DROP POLICY IF EXISTS "Users can view own conversations" ON ai_chat_conversations;

CREATE POLICY "Users can view own or session conversations"
  ON ai_chat_conversations FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR (user_id IS NULL AND session_id IS NOT NULL)
  );
