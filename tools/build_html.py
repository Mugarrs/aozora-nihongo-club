#!/usr/bin/env python3
"""Gabungkan pages/*.html menjadi index.html untuk situs statis Aozora."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main():
    files = sorted((ROOT / "pages").glob("*.html"))
    if not files:
        raise SystemExit("Tidak ada pages/*.html untuk digabungkan.")
    template = (ROOT / "index.template.html").read_text(encoding="utf-8")
    result = template
    for path in files:
        marker = f"<!-- BUILD:{path.stem} -->"
        if result.count(marker) != 1:
            raise SystemExit(f"Marker harus tepat satu kali: {marker}")
        result = result.replace(marker, path.read_text(encoding="utf-8").rstrip())
    if "<!-- BUILD:" in result:
        raise SystemExit("Masih ada marker build yang belum diganti.")
    (ROOT / "index.html").write_text(result.rstrip() + "\n", encoding="utf-8", newline="\n")
    print(f"index.html dibuat dari template dan {len(files)} bagian HTML.")


if __name__ == "__main__":
    main()
