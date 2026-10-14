#!/usr/bin/env python3
import argparse
import re
import shutil
import subprocess
import tempfile
from pathlib import Path


def find_ffmpeg(output_dir: Path) -> Path:
    system = shutil.which("ffmpeg")
    if system:
        return Path(system)
    for parent in [output_dir, *output_dir.parents]:
        candidate = parent / ".runtime" / "node_modules" / "ffmpeg-static" / "ffmpeg"
        if candidate.exists():
            return candidate
    raise SystemExit("FFmpegが見つかりません。SNS/.runtimeへffmpeg-staticを導入してください")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", required=True, type=Path)
    parser.add_argument("--date", required=True)
    parser.add_argument("--branch", default="")
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    suffix = f"_{args.branch}" if args.branch else ""
    policy_path = Path(__file__).resolve().parents[4] / "docs/operations/PROMOTION.md"
    policy = policy_path.read_text(encoding="utf-8")
    seconds = int(re.search(r"正式な標準尺を1ページあたり(\d+)秒", policy).group(1))
    pages = int(re.search(r"(\d+)ページなら\d+秒", policy).group(1))
    images = [args.input_dir / f"{i}_{args.date}{suffix}.png" for i in range(1, pages + 1)]
    missing = [str(p) for p in images if not p.exists()]
    if missing:
        raise SystemExit("PNGが不足しています: " + ", ".join(missing))

    ffmpeg = find_ffmpeg(args.input_dir)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="sns-video-") as tmp:
        concat = Path(tmp) / "slides.txt"
        rows = []
        for image in images:
            rows.extend([f"file '{image.resolve()}'", f"duration {seconds}"])
        rows.append(f"file '{images[-1].resolve()}'")
        concat.write_text("\n".join(rows) + "\n", encoding="utf-8")
        cmd = [
            str(ffmpeg), "-y", "-f", "concat", "-safe", "0", "-i", str(concat),
            "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-preset", "medium",
            "-movflags", "+faststart", "-t", str(pages * seconds), str(args.output),
        ]
        subprocess.run(cmd, check=True)
    print(args.output)


if __name__ == "__main__":
    main()
