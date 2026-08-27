from pathlib import Path

from PIL import Image, ImageSequence


PROJECT_ROOT = Path(__file__).resolve().parents[1]
STATIC_ROOT = PROJECT_ROOT / "static-site"
PUBLIC_ROOT = PROJECT_ROOT / "public"
MOBILE_ROOT = PUBLIC_ROOT / "mobile"
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def output_path(relative_path: Path) -> Path:
    return (MOBILE_ROOT / relative_path).with_suffix(".webp")


def resize(frame: Image.Image, max_edge: int) -> Image.Image:
    converted = frame.convert("RGBA" if "A" in frame.getbands() else "RGB")
    converted.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)
    return converted


def convert(source: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        if getattr(image, "is_animated", False):
            frames = [resize(frame, 960) for frame in ImageSequence.Iterator(image)]
            durations = [frame.info.get("duration", image.info.get("duration", 80)) for frame in ImageSequence.Iterator(image)]
            frames[0].save(
                destination,
                "WEBP",
                save_all=True,
                append_images=frames[1:],
                duration=durations,
                loop=image.info.get("loop", 0),
                quality=62,
                method=4,
            )
            return

        resized = resize(image, 1280)
        resized.save(destination, "WEBP", quality=72, method=6)


def main() -> None:
    converted = 0
    original_bytes = 0
    mobile_bytes = 0
    for source in STATIC_ROOT.rglob("*"):
        if not source.is_file() or source.suffix.lower() not in IMAGE_SUFFIXES:
            continue
        relative = source.relative_to(STATIC_ROOT)
        if relative.parts[0] in {"assets", "mobile"} or relative.name in {"favicon.png", "og.png"}:
            continue
        destination = output_path(relative)
        convert(source, destination)
        converted += 1
        original_bytes += source.stat().st_size
        mobile_bytes += destination.stat().st_size

    print(
        f"Generated {converted} mobile images: "
        f"{original_bytes / 1024 / 1024:.2f} MB -> {mobile_bytes / 1024 / 1024:.2f} MB"
    )


if __name__ == "__main__":
    main()
