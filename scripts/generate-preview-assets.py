from pathlib import Path

from PIL import Image, ImageOps


PROJECT_ROOT = Path(__file__).resolve().parents[1]
PUBLIC_ROOT = PROJECT_ROOT / "public"
PREVIEW_ROOT = PUBLIC_ROOT / "preview"
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
SKIP_DIRECTORIES = {"assets", "mobile", "preview"}
SKIP_FILES = {"favicon.png", "og.png", "portfolio-ufo-cover.jpg"}


def output_path(relative_path: Path) -> Path:
    return (PREVIEW_ROOT / relative_path).with_suffix(".webp")


def convert(source: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image.seek(0)
        frame = ImageOps.exif_transpose(image.copy())
        converted = frame.convert("RGBA" if "A" in frame.getbands() else "RGB")
        converted.thumbnail((1440, 1440), Image.Resampling.LANCZOS)
        converted.save(destination, "WEBP", quality=82, method=6)


def main() -> None:
    converted = 0
    original_bytes = 0
    preview_bytes = 0
    for source in PUBLIC_ROOT.rglob("*"):
        if not source.is_file() or source.suffix.lower() not in IMAGE_SUFFIXES:
            continue
        relative = source.relative_to(PUBLIC_ROOT)
        if relative.parts[0] in SKIP_DIRECTORIES or relative.name in SKIP_FILES:
            continue
        destination = output_path(relative)
        convert(source, destination)
        converted += 1
        original_bytes += source.stat().st_size
        preview_bytes += destination.stat().st_size

    print(
        f"Generated {converted} WebP previews: "
        f"{original_bytes / 1024 / 1024:.2f} MB -> {preview_bytes / 1024 / 1024:.2f} MB"
    )


if __name__ == "__main__":
    main()
