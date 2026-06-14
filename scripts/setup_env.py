from __future__ import annotations

from pathlib import Path
import secrets


def ensure_file(target: Path, example: Path) -> None:
    if not target.exists():
        target.write_text(example.read_text(encoding="utf-8"), encoding="utf-8")


def set_api_key(target: Path, api_key: str) -> None:
    content = target.read_text(encoding="utf-8")
    lines = content.splitlines()
    updated = False

    for index, line in enumerate(lines):
        if line.startswith("API_KEY="):
            lines[index] = f"API_KEY={api_key}"
            updated = True
            break

    if not updated:
        lines.append(f"API_KEY={api_key}")

    target.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    print("Creating .env files...")

    secrets_dir = Path("secrets")
    secrets_dir.mkdir(exist_ok=True)

    frontend_example = Path("scripts/.env.frontend.example")
    backend_example = Path("scripts/.env.backend.example")
    frontend_env = secrets_dir / ".env.frontend"
    backend_env = secrets_dir / ".env.backend"

    ensure_file(frontend_env, frontend_example)
    ensure_file(backend_env, backend_example)

    api_key = "king_note_" + secrets.token_hex(32)
    set_api_key(backend_env, api_key)
    set_api_key(frontend_env, api_key)
    print("Generated API key")


if __name__ == "__main__":
    main()