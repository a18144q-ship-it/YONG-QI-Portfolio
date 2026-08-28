from pathlib import Path

from PIL import Image, ImageOps


PROJECT_ROOT = Path(__file__).resolve().parents[1]
PUBLIC_ROOT = PROJECT_ROOT / "public"
PREVIEW_ROOT = PUBLIC_ROOT / "preview"
MOBILE_PREVIEW_ROOT = PUBLIC_ROOT / "preview-mobile"
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
SKIP_DIRECTORIES = {"assets", "mobile", "preview", "preview-mobile"}
SKIP_FILES = {"favicon.png", "og.png", "portfolio-ufo-cover.jpg"}


def output_path(root: Path, relative_path: Path) -> Path:
    return (root / relative_path).with_suffix(".webp")


def convert(source: Path, destination: Path, maximum_size: int, quality: int) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image.seek(0)
        frame = ImageOps.exif_transpose(image.copy())
        converted = frame.convert("RGBA" if "A" in frame.getbands() else "RGB")
        converted.thumbnail((maximum_size, maximum_size), Image.Resampling.LANCZOS)
        converted.save(destination, "WEBP", quality=quality, method=6)


def main() -> None:
    converted = 0
    original_bytes = 0
    preview_bytes = 0
    mobile_preview_bytes = 0
    for source in PUBLIC_ROOT.rglob("*"):
        if not source.is_file() or source.suffix.lower() not in IMAGE_SUFFIXES:
            continue
        relative = source.relative_to(PUBLIC_ROOT)
        if relative.parts[0] in SKIP_DIRECTORIES or relative.name in SKIP_FILES:
            continue
        destination = output_path(PREVIEW_ROOT, relative)
        mobile_destination = output_path(MOBILE_PREVIEW_ROOT, relative)
        convert(source, destination, maximum_size=1440, quality=82)
        convert(source, mobile_destination, maximum_size=1080, quality=78)
        converted += 1
        original_bytes += source.stat().st_size
        preview_bytes += destination.stat().st_size
        mobile_preview_bytes += mobile_destination.stat().st_size

    print(
        f"Generated {converted} desktop and mobile WebP previews: "
        f"{original_bytes / 1024 / 1024:.2f} MB -> "
        f"{preview_bytes / 1024 / 1024:.2f} MB desktop / "
        f"{mobile_preview_bytes / 1024 / 1024:.2f} MB mobile"
    )


if __name__ == "__main__":
    main()
