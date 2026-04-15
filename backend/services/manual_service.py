"""
Manual service — reads and writes cs-manual.md.

ManualProvider is an abstract base so a future GoogleDocsManualProvider
can be swapped in without touching callers.
"""
from __future__ import annotations

import hashlib
import os
import re
from abc import ABC, abstractmethod

from ..schemas import ManualSection


class ManualProvider(ABC):
    @abstractmethod
    def get_content(self) -> str: ...

    @abstractmethod
    def get_sections(self) -> list[ManualSection]: ...

    @abstractmethod
    def add_section(self, title: str, content: str) -> ManualSection: ...

    @abstractmethod
    def update_section(self, section_id: str, title: str | None, content: str | None) -> ManualSection: ...

    @abstractmethod
    def delete_section(self, section_id: str) -> bool: ...


def _make_id(title: str) -> str:
    return hashlib.md5(title.encode("utf-8")).hexdigest()[:8]


def _parse_sections(raw: str) -> list[ManualSection]:
    """Split markdown into ## level sections."""
    # Split on lines that start with '## '
    parts = re.split(r"(?m)^(## .+)$", raw)
    # parts: [preamble, heading1, body1, heading2, body2, ...]
    sections: list[ManualSection] = []
    i = 1  # skip preamble
    while i < len(parts) - 1:
        heading = parts[i].lstrip("## ").strip()
        body = parts[i + 1].strip()
        sections.append(ManualSection(id=_make_id(heading), title=heading, content=body))
        i += 2
    return sections


def _rebuild_markdown(preamble: str, sections: list[ManualSection]) -> str:
    parts = [preamble.rstrip()]
    for sec in sections:
        parts.append(f"\n\n## {sec.title}\n\n{sec.content}")
    return "\n".join(parts) + "\n"


class FileManualProvider(ManualProvider):
    """Reads/writes a local markdown file."""

    def __init__(self, file_path: str):
        self.file_path = os.path.abspath(file_path)

    def _read(self) -> str:
        with open(self.file_path, encoding="utf-8") as f:
            return f.read()

    def _write(self, content: str) -> None:
        with open(self.file_path, "w", encoding="utf-8") as f:
            f.write(content)

    def _preamble(self, raw: str) -> str:
        match = re.search(r"(?m)^## ", raw)
        return raw[: match.start()] if match else raw

    def get_content(self) -> str:
        return self._read()

    def get_sections(self) -> list[ManualSection]:
        return _parse_sections(self._read())

    def add_section(self, title: str, content: str) -> ManualSection:
        raw = self._read()
        sections = _parse_sections(raw)
        new_sec = ManualSection(id=_make_id(title), title=title, content=content)
        sections.append(new_sec)
        self._write(_rebuild_markdown(self._preamble(raw), sections))
        return new_sec

    def update_section(self, section_id: str, title: str | None, content: str | None) -> ManualSection:
        raw = self._read()
        sections = _parse_sections(raw)
        for sec in sections:
            if sec.id == section_id:
                if title is not None:
                    sec = ManualSection(id=_make_id(title), title=title, content=sec.content)
                if content is not None:
                    sec = ManualSection(id=sec.id, title=sec.title, content=content)
                sections = [sec if s.id == section_id else s for s in sections]
                self._write(_rebuild_markdown(self._preamble(raw), sections))
                return sec
        raise KeyError(f"Section '{section_id}' not found")

    def delete_section(self, section_id: str) -> bool:
        raw = self._read()
        sections = _parse_sections(raw)
        new_sections = [s for s in sections if s.id != section_id]
        if len(new_sections) == len(sections):
            return False
        self._write(_rebuild_markdown(self._preamble(raw), new_sections))
        return True


def get_provider() -> ManualProvider:
    path = os.getenv("MANUAL_PATH", "../cs-manual.md")
    return FileManualProvider(path)
