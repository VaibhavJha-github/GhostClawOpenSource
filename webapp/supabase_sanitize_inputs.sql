-- Create a function to trim whitespace from specific text columns
CREATE OR REPLACE FUNCTION trim_agent_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Trim telegram_bot_token if present
  IF NEW.telegram_bot_token IS NOT NULL THEN
    NEW.telegram_bot_token := TRIM(NEW.telegram_bot_token);
  END IF;

  -- Trim API keys if present
  IF NEW.anthropic_api_key IS NOT NULL THEN
    NEW.anthropic_api_key := TRIM(NEW.anthropic_api_key);
  END IF;
  
  IF NEW.openai_api_key IS NOT NULL THEN
    NEW.openai_api_key := TRIM(NEW.openai_api_key);
  END IF;
  
  -- Trim Name if present
  IF NEW.name IS NOT NULL THEN
    NEW.name := TRIM(NEW.name);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_trim_agent_fields ON agents;
CREATE TRIGGER trigger_trim_agent_fields
BEFORE INSERT OR UPDATE ON agents
FOR EACH ROW
EXECUTE FUNCTION trim_agent_fields();
