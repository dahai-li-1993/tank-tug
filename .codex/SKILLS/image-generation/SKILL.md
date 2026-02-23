---
name: image-generation
description: Generate images using nano banana.
---

# Image Generation Skill

Generate diesel-punk game icons using Nano Banana (Google Gemini Image API). Automatically uses the built-in style system prompt (`Game-icon-prompt.md`) and 5 real in-game icons (`T_Passive_*.PNG`) as multi-image style references — just provide a subject description.

## Setup

### Dependencies

```bash
pip install google-genai Pillow
```

### Environment Variable

Set your API key:

```bash
export GEMINI_API_KEY="your_api_key_here"
```

## Usage

### Generate a Game Icon

```bash
python scripts/generate.py --prompt "a shotgun" --output shotgun.png
```

### Generate Multiple Variations

```bash
python scripts/generate.py --prompt "a shield" --output shield.png --num-images 3
```

## Arguments

| Argument | Short | Required | Default | Description |
|----------|-------|----------|---------|-------------|
| `--prompt` | `-p` | Yes | — | Subject/object description (e.g., "a shotgun", "a shield") |
| `--output` | `-o` | No | `output.png` | Output path for the generated image |
| `--aspect-ratio` | `-a` | No | — | Aspect ratio crop applied post-generation: `1:1`, `16:9`, `9:16`, `4:3`, `3:4` |
| `--num-images` | `-n` | No | `1` | Number of images to generate |
| `--transparent` | `-t` | No | `false` | Remove background via rembg; output saved as RGBA PNG |

## Programmatic Usage

Import the function directly in Python:

```python
from scripts.generate import generate_image

paths = generate_image(
    prompt="a shotgun",
    output_path="./outputs/shotgun.png",
    num_images=2,
)
```

## How It Works

The script automatically:
1. Loads the style system prompt from `Game-icon-prompt.md` (diesel-punk chibi icon style)
2. Uses 5 real in-game icons (`T_Passive_*.PNG`) as multi-image art style references (the generated subject will differ from the references)
3. Combines the system prompt with your subject description as `Subject: <your prompt>`

## Tips

- **Keep prompts simple**: Just describe the subject — e.g., "a shotgun", "a shield", "a wrench"
- **Add details when needed**: You can add specifics like "a rusty iron shield with rivets"
- **Use num-images for variations**: Generate multiple outputs and pick the best one
