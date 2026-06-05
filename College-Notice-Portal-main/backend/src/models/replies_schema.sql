-- Add replies table to support notice replies
-- Run this after your existing schema.sql

-- Notice Replies table
CREATE TABLE IF NOT EXISTS notice_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id UUID NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES notice_replies(id) ON DELETE CASCADE, -- For nested replies (optional)
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  reply_type VARCHAR(20) NOT NULL CHECK (reply_type IN ('REPLY', 'REPLY_ALL')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notice Reply Recipients table (for REPLY_ALL tracking who receives the reply)
CREATE TABLE IF NOT EXISTS notice_reply_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reply_id UUID NOT NULL REFERENCES notice_replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(reply_id, user_id)
);

-- Indexes for better performance
CREATE INDEX idx_notice_replies_notice ON notice_replies(notice_id);
CREATE INDEX idx_notice_replies_sender ON notice_replies(sender_id);
CREATE INDEX idx_notice_reply_recipients_reply ON notice_reply_recipients(reply_id);
CREATE INDEX idx_notice_reply_recipients_user ON notice_reply_recipients(user_id);

-- Comments for documentation
COMMENT ON TABLE notice_replies IS 'Stores replies to notices';
COMMENT ON COLUMN notice_replies.reply_type IS 'REPLY: only to sender, REPLY_ALL: to all recipients';
COMMENT ON TABLE notice_reply_recipients IS 'Tracks recipients for REPLY_ALL type replies';