# Darshan API Spec (v0.1)

## Endpoint: POST /api/darshan

### Input
{
  "question": "string | empty",
  "userProfile": "optional premium context"
}

### Behavior
- If question is empty → mode = "now"
- If question exists → mode = "question"

### Output (always JSON)
{
  "mode": "now" | "question",
  "steps": ["7 short lines"],
  "image_prompt": "optional premium",
  "safety": { "flags": [], "note": "" }
}

### Rules
- Always return exactly 7 steps
- Step 6 must be a safe micro-practice
- Step 7 must be a presence question
