"""improve.py — the agent improves its own prompt."""
import litellm
from agent import MODEL, SEED_PROMPT
from evals import evaluate

REFLECT = """You are improving the system prompt of a warehouse Q&A agent.

CURRENT PROMPT:
{prompt}

The agent got these questions WRONG:
{failures}

Look for patterns in the failures and infer GENERAL RULES about how this
warehouse's data works (units, dates, flags). Do NOT memorize specific
answers or SKUs. Write an improved system prompt that states the rules.

Reply with ONLY the new system prompt."""

def reflect(prompt: str, failures: list) -> str:
    report = "\n".join(
        f"- Q: {f['question']}\n  agent said: {f['got']}\n  correct answer: {f['expected']}"
        for f in failures
    )
    response = litellm.completion(
        model=MODEL,
        messages=[{"role": "user", "content": REFLECT.format(prompt=prompt, failures=report)}],
    )
    return response.choices[0].message.content.strip()

def improve(seed: str = SEED_PROMPT, rounds: int = 5) -> str:
    best = seed
    best_score, failures = evaluate(best, split="train")
    print(f"round 0: {best_score:.0%}")

    for r in range(1, rounds + 1):
        if not failures:
            break                                   # nothing left to learn
        candidate = reflect(best, failures)         # mutate
        score, cand_failures = evaluate(candidate)  # evaluate
        if score > best_score:                      # gate: keep or revert
            best, best_score, failures = candidate, score, cand_failures
            print(f"round {r}: {score:.0%}  KEPT")
        else:
            print(f"round {r}: {score:.0%}  reverted")
    return best

if __name__ == "__main__":
    best = improve()
    print("\n--- best prompt ---\n" + best)
    test_score, _ = evaluate(best, split="test")
    print(f"\nheld-out test score: {test_score:.0%}")
