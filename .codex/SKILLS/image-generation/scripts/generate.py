#!/usr/bin/env python3
"""
Image generation script using Nano Banana (Google Gemini Image API).

Generates images using a text prompt and a reference image.
"""

import argparse
import base64
import os
import sys
from io import BytesIO
from pathlib import Path

from PIL import Image

# Load .env file from the script's directory
_env_path = Path(__file__).parent / ".env"
if _env_path.exists():
    with open(_env_path, encoding="utf-8") as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                _key, _value = _line.split("=", 1)
                os.environ.setdefault(_key.strip(), _value.strip())


def load_image_as_base64(image_path: str) -> tuple[str, str]:
    """Load an image file and return base64 data and mime type."""
    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    # Determine mime type from extension
    ext = path.suffix.lower()
    mime_types = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".webp": "image/webp",
    }
    mime_type = mime_types.get(ext, "image/png")

    with open(image_path, "rb") as f:
        data = base64.b64encode(f.read()).decode("utf-8")

    return data, mime_type


_MODEL = "gemini-3-pro-image-preview"
_SKILL_DIR = Path(__file__).resolve().parent.parent
_REFERENCE_IMAGES = [
    str(_SKILL_DIR / "T_Passive_BlastAmplifier.PNG"),
    str(_SKILL_DIR / "T_Passive_ChanceToHealOnCritKill.PNG"),
    str(_SKILL_DIR / "T_Passive_InfiniteBeerRange.PNG"),
    str(_SKILL_DIR / "T_Passive_LvlUpHPRegen.PNG"),
    str(_SKILL_DIR / "T_Passive_MaxHealth_Ballistic.PNG"),
]
_SYSTEM_PROMPT_PATH = _SKILL_DIR / "Game-icon-prompt.md"


def _load_system_prompt() -> str:
    """Load the style system prompt from the skill folder."""
    with open(_SYSTEM_PROMPT_PATH, encoding="utf-8") as f:
        return f.read().strip()


def _crop_to_aspect(image: Image.Image, aspect_ratio: str) -> Image.Image:
    """Crop image to the given aspect ratio (e.g. '1:1', '16:9') via center crop."""
    w_ratio, h_ratio = (int(x) for x in aspect_ratio.split(":"))
    src_w, src_h = image.size
    target_w = min(src_w, int(src_h * w_ratio / h_ratio))
    target_h = min(src_h, int(src_w * h_ratio / w_ratio))
    left = (src_w - target_w) // 2
    top = (src_h - target_h) // 2
    return image.crop((left, top, left + target_w, top + target_h))


def generate_image(
    prompt: str,
    output_path: str,
    aspect_ratio: str | None = None,
    num_images: int = 1,
    transparent: bool = False,
) -> list[str]:
    """
    Generate game icon image(s) using Google Gemini / Nano Banana API.

    Always uses the built-in style system prompt and reference images.

    Args:
        prompt: Subject/object description (e.g., "a shotgun", "a shield").
        output_path: Path to save the generated image(s).
        aspect_ratio: Aspect ratio crop applied post-generation (e.g., "1:1", "16:9").
        num_images: Number of images to generate.
        transparent: Remove background using rembg, saving as RGBA PNG.

    Returns:
        List of paths to saved images.
    """
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GENAI_API_KEY")
    if not api_key:
        raise ValueError(
            "API key not found. Set GEMINI_API_KEY or GENAI_API_KEY environment variable."
        )

    # lazy importing since very heavy libs
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=api_key)

    # Build content parts
    parts: list[types.Part] = []

    # Add reference images (always use built-in examples)
    for ref_path in _REFERENCE_IMAGES:
        img_data, mime_type = load_image_as_base64(ref_path)
        parts.append(
            types.Part.from_bytes(
                data=base64.b64decode(img_data),
                mime_type=mime_type,
            )
        )

    # Combine system prompt with user prompt
    system_prompt = _load_system_prompt()
    full_prompt = f"{system_prompt}\n\nSubject: {prompt}"
    parts.append(types.Part.from_text(text=full_prompt))

    # Build generation config
    generate_config = types.GenerateContentConfig(
        response_modalities=["TEXT", "IMAGE"],
    )

    saved_paths: list[str] = []
    output_dir = Path(output_path).parent
    output_dir.mkdir(parents=True, exist_ok=True)

    base_name = Path(output_path).stem
    extension = Path(output_path).suffix or ".png"

    for i in range(num_images):
        response = client.models.generate_content(
            model=_MODEL,
            contents=types.Content(parts=parts),
            config=generate_config,
        )

        # Validate response
        if not response.candidates:
            raise ValueError("No candidates returned from the API")

        candidate = response.candidates[0]
        if not candidate.content or not candidate.content.parts:
            raise ValueError("No content parts returned from the API")

        # Process response parts
        image_count = 0
        for part in candidate.content.parts:
            if part.inline_data is not None and part.inline_data.data is not None:
                # Extract and save the image
                image_data = part.inline_data.data
                image = Image.open(BytesIO(image_data))

                # Generate output filename
                if num_images == 1 and image_count == 0:
                    save_path = output_path
                else:
                    save_path = str(
                        output_dir / f"{base_name}_{i + 1}_{image_count + 1}{extension}"
                    )

                # Post-process: crop to aspect ratio
                if aspect_ratio:
                    image = _crop_to_aspect(image, aspect_ratio)

                # Post-process: remove background
                if transparent:
                    from rembg import remove  # noqa: PLC0415
                    image = remove(image)
                    # Ensure extension supports alpha; preserve original case if already PNG
                    orig_suffix = Path(save_path).suffix
                    if orig_suffix.lower() not in {".png"}:
                        save_path = str(Path(save_path).with_suffix(".PNG"))

                image.save(save_path)
                saved_paths.append(save_path)
                print(f"Saved: {save_path}")
                image_count += 1
            elif part.text:
                # Print any text response from the model
                print(f"Model response: {part.text}")

    return saved_paths


def main() -> None:
    """Main entry point for CLI usage."""
    parser = argparse.ArgumentParser(
        description="Generate images using Nano Banana (Google Gemini Image API).",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate a game icon
  python generate.py --prompt "a shotgun" --output shotgun.png

  # Generate multiple variations
  python generate.py --prompt "a shield" --output shield.png --num-images 3
""",
    )

    parser.add_argument(
        "--prompt",
        "-p",
        type=str,
        required=True,
        help="Text prompt describing the desired image.",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=str,
        default="output.png",
        help="Output path for the generated image (default: output.png).",
    )
    parser.add_argument(
        "--aspect-ratio",
        "-a",
        type=str,
        choices=["1:1", "16:9", "9:16", "4:3", "3:4"],
        help="Aspect ratio for the generated image.",
    )
    parser.add_argument(
        "--num-images",
        "-n",
        type=int,
        default=1,
        help="Number of images to generate (default: 1).",
    )
    parser.add_argument(
        "--transparent",
        "-t",
        action="store_true",
        help="Remove background after generation (requires rembg). Output is saved as RGBA PNG.",
    )

    args = parser.parse_args()

    try:
        saved_paths = generate_image(
            prompt=args.prompt,
            output_path=args.output,
            aspect_ratio=args.aspect_ratio,
            num_images=args.num_images,
            transparent=args.transparent,
        )

        print(f"\nSuccessfully generated {len(saved_paths)} image(s):")
        for path in saved_paths:
            print(f"  - {path}")

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
