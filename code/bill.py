"""bill.py — every loop gets a budget and a receipt."""
import litellm

SPENT = 0.0
BUDGET = 0.50  # dollars. the loop dies before your wallet does.

_original = litellm.completion

def _metered(*args, **kwargs):
    global SPENT
    if SPENT >= BUDGET:
        raise RuntimeError(f"budget exhausted at ${SPENT:.4f}")
    response = _original(*args, **kwargs)
    try:
        SPENT += litellm.completion_cost(completion_response=response)
    except Exception:
        pass  # some local models report no price; spend stays 0
    return response

litellm.completion = _metered  # every call in the project is now metered

if __name__ == "__main__":
    from agent import SEED_PROMPT
    from evals import evaluate
    from improve import improve

    before, _ = evaluate(SEED_PROMPT, split="test")
    best = improve()
    after, _ = evaluate(best, split="test")

    gain_points = (after - before) * 100
    print(f"\nspend:        ${SPENT:.4f}")
    print(f"test gain:    {gain_points:+.0f} points")
    if gain_points > 0:
        print(f"cost per point of gain: ${SPENT / gain_points:.4f}")
    else:
        print("no gain. the spend bought you a negative result, which is also information.")
