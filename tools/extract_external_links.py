"""Extract Android buttons that open external URLs into a PWA data file."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT.parent / "AppGallery_5.5.1_recovered" / "sources" / "com" / "dtpru" / "pamiatka2"
OUTPUT = ROOT / "data" / "external-links.json"
URL = r'Uri\.parse\("([^"]+)"\)'


def main() -> None:
    links: dict[str, dict[str, dict[str, str]]] = {}
    for source in SOURCES.glob("Main*Activity.java"):
        text = source.read_text(encoding="utf-8")
        buttons: dict[str, str] = {}
        handlers: dict[str, str] = {}
        for method, body in re.findall(r"public void (\w+)\(View view\)\s*\{(.*?)\n\s*\}", text, re.S):
            match = re.search(URL, body)
            if match and method != "onClick":
                handlers[method] = match.group(1)
        for button, body in re.findall(r"view\.getId\(\)\s*==\s*R\.id\.(\w+)\)\s*\{(.*?)\n\s*\}", text, re.S):
            match = re.search(URL, body)
            if match:
                buttons[button] = match.group(1)
        for button, body in re.findall(r"case R\.id\.(\w+).*?:\s*(.*?)(?=case R\.id\.|\})", text, re.S):
            match = re.search(URL, body)
            if match:
                buttons[button] = match.group(1)
        if buttons or handlers:
            links[source.stem] = {"buttons": buttons, "handlers": handlers}
    OUTPUT.write_text(json.dumps(links, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"External links: {sum(len(item['buttons']) + len(item['handlers']) for item in links.values())}")


if __name__ == "__main__":
    main()
