"""Copy packaged question dubs to the private course-audio prefix on Runpod."""

import argparse
import concurrent.futures
import json
import os
from pathlib import Path

import boto3


ROOT = Path(__file__).resolve().parent.parent
LOCALES = ("bn-IN", "en-IN", "gu-IN", "kn-IN", "ml-IN", "mr-IN", "od-IN", "pa-IN", "ta-IN", "te-IN")


def load_local_env():
    for line in (ROOT / ".env.local").read_text(encoding="utf-8").splitlines():
        if "=" not in line or line.lstrip().startswith("#"):
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    load_local_env()
    bucket = os.environ["RUNPOD_S3_VOLUME_ID"]
    client = boto3.client(
        "s3",
        endpoint_url=os.environ.get("RUNPOD_S3_ENDPOINT", "https://s3api-eu-ro-1.runpod.io"),
        region_name=os.environ.get("RUNPOD_S3_REGION", "eu-ro-1"),
        aws_access_key_id=os.environ["RUNPOD_S3_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["RUNPOD_S3_SECRET_ACCESS_KEY"],
    )
    assets = Path(os.environ.get("NIRVAN_QA_ASSETS", str(Path.home() / "AppData/Local/Temp/nirvan-qa-upload")))
    names = [p.name for p in assets.iterdir() if p.is_dir() and (p / "master.mp4").exists()]
    pairs = []
    for film in sorted(names):
        chapter = int(film.split("-q")[0].removeprefix("gm-t"))
        for locale in LOCALES:
            source = f"gyanmarg/t{chapter:02d}/{film}/audio/{locale}.m4a"
            # The course route uses its two-letter locale in the object key.
            course_locale = "or" if locale == "od-IN" else locale[:2]
            target = f"nirvan-sutra/course-audio/v1/{film}/{course_locale}.m4a"
            pairs.append((source, target))
    if args.dry_run:
        print(f"Would copy {len(pairs)} audio files for {len(names)} question videos")
        return

    def copy(pair):
        source, target = pair
        src = client.head_object(Bucket=bucket, Key=source)
        try:
            dst = client.head_object(Bucket=bucket, Key=target)
            if dst["ContentLength"] == src["ContentLength"]:
                return "existing"
        except client.exceptions.ClientError as error:
            if error.response.get("ResponseMetadata", {}).get("HTTPStatusCode") != 404:
                raise
        client.copy_object(Bucket=bucket, Key=target, CopySource={"Bucket": bucket, "Key": source}, ContentType="audio/mp4")
        dst = client.head_object(Bucket=bucket, Key=target)
        if dst["ContentLength"] != src["ContentLength"]:
            raise RuntimeError(f"Copied size mismatch: {target}")
        return "copied"

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        results = list(pool.map(copy, pairs))
    print(json.dumps({"films": len(names), "tracks": len(pairs), "copied": results.count("copied"), "existing": results.count("existing")}))


if __name__ == "__main__":
    main()
