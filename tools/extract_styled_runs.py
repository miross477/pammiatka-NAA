"""Extract Android <b>, <i>, and <u> string ranges for the PWA renderer."""
from __future__ import annotations

import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


def clean(value: str | None) -> str:
    # AAPT's decoded XML uses double quotes to delimit literal string segments.
    return (value or "").replace('"', '')


def flatten(node: ET.Element, styles: dict[str, bool], chunks: list[dict]) -> None:
    def append(value: str | None) -> None:
        value = clean(value)
        if value:
            chunks.append({"text": value, **styles})

    append(node.text)
    for child in node:
        child_styles = styles.copy()
        if child.tag in {"b", "i", "u"}:
            child_styles[{"b": "bold", "i": "italic", "u": "underline"}[child.tag]] = True
        flatten(child, child_styles, chunks)
        append(child.tail)


def strings_by_name(path: Path) -> dict[str, str]:
    root = ET.parse(path).getroot()
    return {
        item.attrib["name"]: "".join(item.itertext()).replace("\\n", "\n")
        for item in root.findall("string")
    }


def main(original: Path, plain: Path, output: Path) -> None:
    canonical = strings_by_name(plain)
    root = ET.parse(original).getroot()
    result: dict[str, list[dict]] = {}
    missing: list[str] = []

    for item in root.findall("string"):
        name = item.attrib.get("name")
        if not name or name not in canonical:
            continue
        chunks: list[dict] = []
        flatten(item, {}, chunks)
        cursor = 0
        runs: list[dict] = []
        for chunk in chunks:
            if not any(chunk.get(style) for style in ("bold", "italic", "underline")):
                continue
            needle = chunk["text"]
            start = canonical[name].find(needle, cursor)
            if start < 0:
                missing.append(f"{name}: {needle[:48]!r}")
                continue
            runs.append({
                "start": start,
                "end": start + len(needle),
                "bold": bool(chunk.get("bold")),
                "italic": bool(chunk.get("italic")),
                "underline": bool(chunk.get("underline")),
            })
            cursor = start + len(needle)
        if runs:
            result[name] = runs

    output.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Styled strings: {len(result)}; unresolved runs: {len(missing)}")
    for entry in missing[:20]:
        print(entry, file=sys.stderr)


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3]))
