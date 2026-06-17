"""evals.py — a deterministic judge for the agent."""
import json
import re
from agent import run_agent, SEED_PROMPT

def load_tasks(split: str) -> list:
    with open("tasks.json") as f:
        return [t for t in json.load(f) if t["split"] == split]

def is_correct(answer: str, expected: str) -> bool:
    # word-boundary match, so "no" doesn't match "November"
    return re.search(rf"\b{re.escape(expected.lower())}\b", answer.lower()) is not None

def evaluate(system_prompt: str, split: str = "train", verbose: bool = False):
    tasks = load_tasks(split)
    failures = []
    for t in tasks:
        answer = run_agent(t["question"], system_prompt)
        ok = is_correct(answer, t["expected"])
        if verbose:
            print(f"{'PASS' if ok else 'FAIL'}  {t['question']}")
            print(f"      agent: {answer}")
        if not ok:
            failures.append({"question": t["question"], "got": answer, "expected": t["expected"]})
    score = (len(tasks) - len(failures)) / len(tasks)
    return score, failures

if __name__ == "__main__":
    score, _ = evaluate(SEED_PROMPT, split="train", verbose=True)
    print(f"\ntrain score: {score:.0%}")
