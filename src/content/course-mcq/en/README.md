# Nirvan Sutra Course — English MCQ Questions

This directory holds MCQ question files for the **English** language variant of the Nirvan Sutra Course.

## File Naming

Each chapter's questions live in a single JSON file:

```
chapter-1.json
chapter-2.json
...
chapter-8.json
```

## JSON Schema

Each file should contain an array of question objects (or `{ "questions": [...] }`):

```json
[
  {
    "id": 101,
    "question": "Question text",
    "options": [
      { "key": "A", "text": "..." },
      { "key": "B", "text": "..." },
      { "key": "C", "text": "..." },
      { "key": "D", "text": "..." }
    ],
    "correct": "B",
    "explanation": "Detailed explanation grounded in the chapter."
  }
]
```

## Status

| Chapter | File | Status |
|---------|------|--------|
| 1 — Self-Discovery | `chapter-1.json` | ⏳ Pending generation |
| 2 — Layers of Mind | `chapter-2.json` | ⏳ Pending generation |
| 3 — Witness Awareness | `chapter-3.json` | ⏳ Pending generation |
| 4 — Root of Ego | `chapter-4.json` | ⏳ Pending generation |
| 5 — The Play of Maya | `chapter-5.json` | ⏳ Pending generation |
| 6 — Gateway of Meditation | `chapter-6.json` | ⏳ Pending generation |
| 7 — Path of Liberation | `chapter-7.json` | ⏳ Pending generation |
| 8 — Nirvan Sutra | `chapter-8.json` | ⏳ Pending generation |

> The API at `GET /api/course/questions?lang=en&chapter=N` will return 404 with
> `{ "error": "Questions not yet generated" }` until the corresponding file is created.
