# Nirvan Sutra Course — Hinglish MCQ Questions

This directory holds MCQ question files for the **Hinglish (Roman Hindi)** language variant of the Nirvan Sutra Course.

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
| 1 — Swayam Ki Khoj | `chapter-1.json` | ⏳ Pending generation |
| 2 — Mann Ki Partein | `chapter-2.json` | ⏳ Pending generation |
| 3 — Sakshi Bodh | `chapter-3.json` | ⏳ Pending generation |
| 4 — Ahankar Ki Jad | `chapter-4.json` | ⏳ Pending generation |
| 5 — Maya Ka Khel | `chapter-5.json` | ⏳ Pending generation |
| 6 — Dhyan Ka Dwar | `chapter-6.json` | ⏳ Pending generation |
| 7 — Mukti Ki Raah | `chapter-7.json` | ⏳ Pending generation |
| 8 — Nirvan Sutra | `chapter-8.json` | ⏳ Pending generation |

> The API at `GET /api/course/questions?lang=hl&chapter=N` will return 404 with
> `{ "error": "Questions not yet generated" }` until the corresponding file is created.
