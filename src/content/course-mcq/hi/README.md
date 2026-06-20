# Nirvan Sutra Course — Hindi MCQ Questions

This directory holds MCQ question files for the **Hindi (Devanagari)** language variant of the Nirvan Sutra Course.

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
    "id": 1,
    "question": "प्रश्न यहाँ लिखें",
    "options": ["विकल्प A", "विकल्प B", "विकल्प C", "विकल्प D"],
    "answer": "विकल्प A"
  }
]
```

## Status

| Chapter | File | Status |
|---------|------|--------|
| 1 — स्वयं की खोज | `chapter-1.json` | ⏳ Pending generation |
| 2 — मन की परतें | `chapter-2.json` | ⏳ Pending generation |
| 3 — साक्षी बोध | `chapter-3.json` | ⏳ Pending generation |
| 4 — अहंकार की जड़ | `chapter-4.json` | ⏳ Pending generation |
| 5 — माया का खेल | `chapter-5.json` | ⏳ Pending generation |
| 6 — ध्यान का द्वार | `chapter-6.json` | ⏳ Pending generation |
| 7 — मुक्ति की राह | `chapter-7.json` | ⏳ Pending generation |
| 8 — निर्वाण सूत्र | `chapter-8.json` | ⏳ Pending generation |

> The API at `GET /api/course/questions?lang=hi&chapter=N` will return 404 with
> `{ "error": "Questions not yet generated" }` until the corresponding file is created.
