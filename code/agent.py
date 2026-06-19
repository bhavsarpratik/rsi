"""agent.py — a tool-calling agent in one file."""
import json
import litellm

MODEL = "openai/gpt-4.1-nano"  # swap for any model litellm supports

SEED_PROMPT = "You are a warehouse assistant. Use the lookup tool to answer questions. Be concise."

# --- the world our agent lives in -----------------------------------
# Three hidden conventions the agent is never told:
#   1. a "carton" holds 12 units
#   2. dates are DD-MM-YYYY
#   3. active=true means DISCONTINUED (a legacy bug nobody fixed)
WAREHOUSE = {
    "SKU-101": {"name": "blue mug",   "cartons": 4,  "added": "03-01-2026", "active": True},
    "SKU-202": {"name": "red plate",  "cartons": 7,  "added": "15-11-2025", "active": False},
    "SKU-303": {"name": "green bowl", "cartons": 12, "added": "28-02-2026", "active": False},
    "SKU-404": {"name": "black vase", "cartons": 9,  "added": "05-03-2026", "active": True},
    "SKU-505": {"name": "white cup",  "cartons": 2,  "added": "01-12-2025", "active": False},
}

def lookup(sku: str) -> str:
    record = WAREHOUSE.get(sku.strip().upper())
    return json.dumps(record) if record else "not found"

TOOLS = [{
    "type": "function",
    "function": {
        "name": "lookup",
        "description": "Look up a product record by SKU, e.g. SKU-101.",
        "parameters": {
            "type": "object",
            "properties": {"sku": {"type": "string"}},
            "required": ["sku"],
        },
    },
}]

# --- the agent loop --------------------------------------------------
def run_agent(question: str, system_prompt: str, model: str = MODEL, max_steps: int = 6) -> str:
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": question},
    ]
    for _ in range(max_steps):
        response = litellm.completion(model=model, messages=messages, tools=TOOLS)
        msg = response.choices[0].message
        messages.append(msg.model_dump())

        if not msg.tool_calls:                      # the model answered
            return (msg.content or "").strip()

        for call in msg.tool_calls:                 # the model wants a tool
            args = json.loads(call.function.arguments)
            messages.append({
                "role": "tool",
                "tool_call_id": call.id,
                "content": lookup(**args),
            })
    return "ran out of steps"

if __name__ == "__main__":
    print(run_agent("How many cartons of SKU-202 do we have?", SEED_PROMPT))
