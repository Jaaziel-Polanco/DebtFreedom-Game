-- Add status and score tracking to qa_sessions
ALTER TABLE qa_sessions 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS correct_answers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS points_donated INTEGER DEFAULT 0;

-- Create index for session status
CREATE INDEX IF NOT EXISTS idx_qa_sessions_status ON qa_sessions(status);

-- Function to calculate session result and update participant points
CREATE OR REPLACE FUNCTION process_session_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_total_questions INTEGER;
  v_correct_answers INTEGER;
  v_success_rate DECIMAL(5,2);
  v_participant_id UUID;
BEGIN
  -- Only process when status changes to completed or failed
  IF NEW.status IN ('completed', 'failed') AND OLD.status = 'in_progress' THEN
    
    -- Calculate total questions answered in this session
    SELECT COUNT(*)
    INTO v_total_questions
    FROM session_questions
    WHERE session_id = NEW.id
    AND answer_id IS NOT NULL;
    
    -- Calculate correct answers
    SELECT COUNT(*)
    INTO v_correct_answers
    FROM session_questions sq
    INNER JOIN answers a ON sq.answer_id = a.id
    WHERE sq.session_id = NEW.id
    AND a.is_correct = true;
    
    -- Update session with calculated values
    NEW.total_questions := v_total_questions;
    NEW.correct_answers := v_correct_answers;
    
    -- Calculate success rate
    IF v_total_questions > 0 THEN
      v_success_rate := (v_correct_answers::DECIMAL / v_total_questions::DECIMAL) * 100;
    ELSE
      v_success_rate := 0;
    END IF;
    
    -- Check if user passed the 70% threshold
    IF v_success_rate >= 70 THEN
      -- User passed! Set status to completed
      NEW.status := 'completed';
      
      -- If participant_id is set, donate point
      IF NEW.participant_id IS NOT NULL THEN
        -- Update participant points
        UPDATE participants
        SET points = points + 1
        WHERE id = NEW.participant_id;
        
        -- Mark that point was donated
        NEW.points_donated := 1;
        
        -- Set completed timestamp
        NEW.completed_at := NOW();
      END IF;
    ELSE
      -- User failed (< 70%)
      NEW.status := 'failed';
      NEW.points_donated := 0;
      -- Don't set completed_at for failed sessions
      NEW.completed_at := NULL;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for session completion
DROP TRIGGER IF EXISTS trigger_process_session_completion ON qa_sessions;
CREATE TRIGGER trigger_process_session_completion
  BEFORE UPDATE ON qa_sessions
  FOR EACH ROW
  EXECUTE FUNCTION process_session_completion();

-- Function to validate participant selection before completion
CREATE OR REPLACE FUNCTION validate_session_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- If trying to complete/fail a session, must have a participant_id
  IF NEW.status IN ('completed', 'failed') AND NEW.participant_id IS NULL THEN
    RAISE EXCEPTION 'Cannot complete session without selecting a participant to donate to';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate participant before completion
DROP TRIGGER IF EXISTS trigger_validate_session_completion ON qa_sessions;
CREATE TRIGGER trigger_validate_session_completion
  BEFORE UPDATE ON qa_sessions
  FOR EACH ROW
  WHEN (NEW.status IN ('completed', 'failed') AND OLD.status = 'in_progress')
  EXECUTE FUNCTION validate_session_completion();

-- Add comment explaining the logic
COMMENT ON COLUMN qa_sessions.status IS 'Session status: in_progress, completed (>=70% correct), or failed (<70% correct)';
COMMENT ON COLUMN qa_sessions.points_donated IS 'Points donated to participant (1 if completed successfully, 0 if failed)';
COMMENT ON COLUMN qa_sessions.total_questions IS 'Total number of questions answered in this session';
COMMENT ON COLUMN qa_sessions.correct_answers IS 'Number of correct answers in this session';

-- Create view for session statistics
CREATE OR REPLACE VIEW session_statistics AS
SELECT 
  s.id as session_id,
  s.user_id,
  s.participant_id,
  u.name as user_name,
  u.phone as user_phone,
  p.name as participant_name,
  s.status,
  s.total_questions,
  s.correct_answers,
  CASE 
    WHEN s.total_questions > 0 THEN 
      ROUND((s.correct_answers::DECIMAL / s.total_questions::DECIMAL) * 100, 2)
    ELSE 0 
  END as success_rate,
  s.points_donated,
  s.created_at,
  s.completed_at
FROM qa_sessions s
INNER JOIN users u ON s.user_id = u.id
LEFT JOIN participants p ON s.participant_id = p.id
ORDER BY s.created_at DESC;

COMMENT ON VIEW session_statistics IS 'Comprehensive view of all sessions with calculated statistics';

