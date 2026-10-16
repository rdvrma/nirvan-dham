"""Download completed question film packages from the configured Runpod volume."""

import concurrent.futures
import hashlib
import os
import sys
import tempfile
from pathlib import Path

import boto3


ROOT = Path(__file__).resolve().parent.parent
FILES = ("master.mp4", "thumbnail.jpg", "manifest.json", "youtube.json", "SHA256SUMS")


def main() -> None:
    films = sys.argv[1:]
    if not films or any(not film.startswith("gm-t") or "-q" not in film for film in films):
        raise SystemExit("Usage: download-runpod-question-films.py gm-tNN-qNN [...]")
    for line in (ROOT / ".env.local").read_text(encoding="utf-8").splitlines():
        if "=" in line and not line.lstrip().startswith("#"):
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))
    client = boto3.client(
        "s3",
        endpoint_url=os.environ.get("RUNPOD_S3_ENDPOINT", "https://s3api-eu-ro-1.runpod.io"),
        region_name=os.environ.get("RUNPOD_S3_REGION", "eu-ro-1"),
        aws_access_key_id=os.environ["RUNPOD_S3_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["RUNPOD_S3_SECRET_ACCESS_KEY"],
    )
    bucket = os.environ["RUNPOD_S3_VOLUME_ID"]
    root = Path(tempfile.gettempdir()) / "nirvan-qa-upload"

    def fetch(film: str) -> str:
        chapter = int(film.split("-q")[0].removeprefix("gm-t"))
        prefix = f"gyanmarg/t{chapter:02d}/{film}/"
        folder = root / film
        folder.mkdir(parents=True, exist_ok=True)
        for name in FILES:
            path = folder / name
            remote = client.head_object(Bucket=bucket, Key=prefix + name)
            if not path.exists() or path.stat().st_size != remote["ContentLength"]:
                client.download_file(bucket, prefix + name, str(path))
            if path.stat().st_size != remote["ContentLength"]:
                raise RuntimeError(f"Incomplete download: {film}/{name}")
        checksums = dict(line.split("  ", 1) for line in (folder / "SHA256SUMS").read_text().splitlines() if "  " in line)
        expected = next((digest for digest, name in checksums.items() if name == "master.mp4"), None)
        if not expected:
            raise RuntimeError(f"Missing master checksum: {film}")
        digest = hashlib.file_digest((folder / "master.mp4").open("rb"), "sha256").hexdigest()
        if digest != expected:
            raise RuntimeError(f"Checksum mismatch: {film}")
        return f"{film}: verified ({(folder / 'master.mp4').stat().st_size} bytes)"

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        for result in pool.map(fetch, films):
            print(result)


if __name__ == "__main__":
    main()
