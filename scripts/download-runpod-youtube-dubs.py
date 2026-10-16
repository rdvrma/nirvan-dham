"""Download verified course dubs for manual YouTube Studio language uploads."""

import os
import sys
import tempfile
from pathlib import Path

import boto3


ROOT = Path(__file__).resolve().parent.parent
LOCALES = ("bn", "en", "gu", "kn", "ml", "mr", "or", "pa", "ta", "te")


def main() -> None:
    if len(sys.argv) != 2 or not sys.argv[1].startswith("gm-t"):
        raise SystemExit("Usage: download-runpod-youtube-dubs.py gm-tNN-qNN")
    film = sys.argv[1]
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
    destination = Path(tempfile.gettempdir()) / "nirvan-youtube-dubs" / film
    destination.mkdir(parents=True, exist_ok=True)
    for locale in LOCALES:
        path = destination / f"{locale}.m4a"
        key = f"nirvan-sutra/course-audio/v1/{film}/{locale}.m4a"
        size = client.head_object(Bucket=os.environ["RUNPOD_S3_VOLUME_ID"], Key=key)["ContentLength"]
        if not path.exists() or path.stat().st_size != size:
            client.download_file(os.environ["RUNPOD_S3_VOLUME_ID"], key, str(path))
        if path.stat().st_size != size:
            raise RuntimeError(f"Size mismatch for {film} {locale}")
    print(f"{film}: {len(LOCALES)} verified dubbed tracks ready")


if __name__ == "__main__":
    main()
