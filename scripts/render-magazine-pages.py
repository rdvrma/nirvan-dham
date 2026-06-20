from __future__ import annotations

import argparse
import shutil
from pathlib import Path

import fitz


def render(source_pdf: Path, target_pdf: Path, pages_dir: Path) -> int:
    if not source_pdf.is_file():
        raise FileNotFoundError(f"Source PDF does not exist: {source_pdf}")

    target_pdf.parent.mkdir(parents=True, exist_ok=True)
    pages_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source_pdf, target_pdf)

    document = fitz.open(source_pdf)
    try:
        scale = fitz.Matrix(1.5, 1.5)
        for index, page in enumerate(document, start=1):
            pixmap = page.get_pixmap(matrix=scale, alpha=False)
            output = pages_dir / f"page_{index:02d}.jpg"
            pixmap.save(output, jpg_quality=90)
    finally:
        document.close()

    return index


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Copy a magazine PDF and render its pages as JPEGs.")
    parser.add_argument("source_pdf", type=Path)
    parser.add_argument("target_pdf", type=Path)
    parser.add_argument("pages_dir", type=Path)
    args = parser.parse_args()

    count = render(args.source_pdf, args.target_pdf, args.pages_dir)
    print(f"Rendered {count} pages from {args.source_pdf.name}")
