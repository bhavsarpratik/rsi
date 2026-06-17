"""memory.py — learning across tasks, measured honestly."""
import litellm
from agent import MODEL, SEED_PROMPT, run_agent
from evals import load_tasks, is_correct, evaluate

DISTILL = """An agent answered a warehouse question wrongly.

Q: {question}
agent said: {got}
correct answer: {expected}

Write ONE short, GENERAL lesson (a rule about how this warehouse's data
works, not this specific answer) that would prevent this mistake.
Reply with only the lesson."""

def with_lessons(prompt: str, lessons: list) -> str:
    if not lessons:
        return prompt
    return prompt + "\n\nLessons learned:\n" + "\n".join(f"- {l}" for l in lessons)

def learn_from_train() -> list:
    lessons = []
    for t in load_tasks("train"):
        answer = run_agent(t["question"], with_lessons(SEED_PROMPT, lessons))
        if not is_correct(answer, t["expected"]):
            response = litellm.completion(model=MODEL, messages=[{
                "role": "user",
                "content": DISTILL.format(question=t["question"], got=answer, expected=t["expected"]),
            }])
            lesson = response.choices[0].message.content.strip()
            lessons.append(lesson)
            print(f"learned: {lesson}")
    return lessons

if __name__ == "__main__":
    # the control: same model, same tasks, no memory
    stateless, _ = evaluate(SEED_PROMPT, split="test")

    # the learner: sees train tasks once, carries lessons forward
    lessons = learn_from_train()
    stateful, _ = evaluate(with_lessons(SEED_PROMPT, lessons), split="test")

    print(f"\nstateless test score: {stateless:.0%}")
    print(f"stateful  test score: {stateful:.0%}")
    print(f"gain:                 {stateful - stateless:+.0%}")
