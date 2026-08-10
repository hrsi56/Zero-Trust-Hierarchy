#!/usr/bin/env python3
"""Build the deterministic, dependency-light Zero-Trust Hierarchy site."""

from __future__ import annotations

import argparse
import hashlib
import html
import math
import os
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit, urlunsplit


ROOT = Path(__file__).resolve().parents[1]
ARTICLE = ROOT / "article.md"
RULEBOOK = ROOT / "RULEBOOK.md"
TEMPLATES = ROOT / "templates"
FORMS = ROOT / "forms"
CSS = ROOT / "assets" / "site.css"
SVG = ROOT / "assets" / "zero-trust-hierarchy.svg"

ARTICLE_OUTPUT = ROOT / "index.html"
RULEBOOK_OUTPUT = ROOT / "RULEBOOK.html"
FORMS_INDEX_OUTPUT = FORMS / "index.html"

TITLE = "Zero-Trust Hierarchy"
STANDFIRST = "No success claim promotes itself. A distributed verification system for agent work."
DESCRIPTION = STANDFIRST
AUTHOR = "Yarden Viktor Dejorno"
PUBLIC_URL = "https://hrsi56.github.io/gauntlet-hierarchy/"
REPOSITORY_URL = "https://github.com/hrsi56/gauntlet-hierarchy"

MERMAID_VERSION = "11.16.0"
MERMAID_PACKAGE = f"@mermaid-js/mermaid-cli@{MERMAID_VERSION}"
PANDOC_VERSION = "3.6.4"
MERMAID_TEMP = "/tmp/zero-trust-hierarchy.mmd"
MERMAID_COMMAND = (
    'PUPPETEER_SKIP_DOWNLOAD=true '
    'PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" '
    'npm_config_cache=/tmp/zero-trust-hierarchy-npm-cache '
    f"npx --yes {MERMAID_PACKAGE} -i {MERMAID_TEMP} "
    "-o assets/zero-trust-hierarchy.svg -b transparent -w 1400"
)

MERMAID_FENCE = re.compile(
    r"(?ms)^```mermaid[ \t]*\n(?P<source>.*?)^```[ \t]*$"
)
HASH_RECORD = re.compile(r"mermaid-source-sha256:\s*([0-9a-f]{64})", re.I)
RENDERER_RECORD = re.compile(r"mermaid-renderer:\s*([^\r\n<]+)", re.I)
COMMAND_RECORD = re.compile(r"mermaid-command:\s*([^\r\n<]+)", re.I)
SVG_METADATA = re.compile(
    r"\s*<metadata\s+id=[\"']zero-trust-build-metadata[\"']\s*>.*?</metadata>\s*",
    re.I | re.S,
)
MARKER = '<div data-build-sentinel="zero-trust-hierarchy-diagram"></div>'
CSP = (
    "default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src 'none'; "
    "script-src 'none'; connect-src 'none'; object-src 'none'; base-uri 'none'; "
    "form-action 'none'"
)


class BuildError(RuntimeError):
    """A publication source or build invariant is invalid."""


@dataclass(frozen=True)
class PageSpec:
    """One canonical Markdown source and its generated publication page."""

    source: Path
    output: Path
    kind: str
    active_nav: str
    markdown: str
    description: str
    has_diagram: bool = False


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError as exc:
        try:
            label = path.relative_to(ROOT)
        except ValueError:
            label = path
        raise BuildError(f"required file is missing: {label}") from exc


def normalized_mermaid(source: str) -> str:
    """Normalize line endings, trailing whitespace, and the terminal newline."""
    source = source.replace("\r\n", "\n").replace("\r", "\n")
    lines = [line.rstrip(" \t") for line in source.split("\n")]
    while lines and not lines[0]:
        lines.pop(0)
    while lines and not lines[-1]:
        lines.pop()
    if not lines:
        raise BuildError("the Mermaid block is empty")
    return "\n".join(lines) + "\n"


def article_parts() -> tuple[str, str, str]:
    article = read_text(ARTICLE).replace("\r\n", "\n").replace("\r", "\n")
    matches = list(MERMAID_FENCE.finditer(article))
    if len(matches) != 1:
        raise BuildError(
            f"article.md must contain exactly one fenced Mermaid block; found {len(matches)}"
        )
    if not re.search(r"(?m)^# Zero-Trust Hierarchy[ \t]*$", article):
        raise BuildError(f"article.md must contain the exact H1: {TITLE}")
    if STANDFIRST not in article:
        raise BuildError(f"article.md must contain the exact standfirst: {STANDFIRST}")

    match = matches[0]
    source = normalized_mermaid(match.group("source"))
    marked_article = article[: match.start()] + MARKER + article[match.end() :]
    return article, source, marked_article


def source_hash(source: str) -> str:
    return hashlib.sha256(source.encode("utf-8")).hexdigest()


def rerender_instructions(expected_hash: str) -> str:
    return "\n".join(
        [
            "The committed diagram is stale or lacks valid build metadata.",
            f"Expected normalized Mermaid SHA-256: {expected_hash}",
            "From the repository root, run exactly:",
            f"  python3 scripts/build.py --extract-mermaid {MERMAID_TEMP}",
            f"  {MERMAID_COMMAND}",
            "  python3 scripts/build.py --stamp-svg",
            "  python3 scripts/build.py",
        ]
    )


def validate_svg(svg: str, expected_hash: str) -> float:
    try:
        root = ET.fromstring(svg)
    except ET.ParseError as exc:
        raise BuildError(f"assets/zero-trust-hierarchy.svg is not valid XML: {exc}") from exc

    def local_name(tag: str) -> str:
        return tag.rsplit("}", 1)[-1]

    if local_name(root.tag) != "svg":
        raise BuildError("assets/zero-trust-hierarchy.svg has no SVG root element")
    view_box = root.attrib.get("viewBox", "").split()
    if len(view_box) != 4:
        raise BuildError("the SVG root must contain a four-value viewBox")
    try:
        native_width = float(view_box[2])
    except ValueError as exc:
        raise BuildError("the SVG viewBox width is not numeric") from exc
    if native_width <= 0:
        raise BuildError("the SVG viewBox width must be positive")

    metadata_nodes = [
        node
        for node in root.iter()
        if local_name(node.tag) == "metadata"
        and node.attrib.get("id") == "zero-trust-build-metadata"
    ]
    if len(metadata_nodes) != 1:
        raise BuildError(rerender_instructions(expected_hash))
    metadata_text = "\n".join(metadata_nodes[0].itertext())
    hashes = HASH_RECORD.findall(metadata_text)
    renderers = [value.strip() for value in RENDERER_RECORD.findall(metadata_text)]
    commands = [value.strip() for value in COMMAND_RECORD.findall(metadata_text)]

    if hashes != [expected_hash]:
        raise BuildError(rerender_instructions(expected_hash))
    if renderers != [MERMAID_PACKAGE]:
        raise BuildError(
            f"SVG renderer metadata must be exactly {MERMAID_PACKAGE!r}.\n"
            + rerender_instructions(expected_hash)
        )
    if commands != [MERMAID_COMMAND]:
        raise BuildError(
            "SVG rendering-command metadata does not match the approved pinned command.\n"
            + rerender_instructions(expected_hash)
        )

    titles = [
        node for node in root.iter() if local_name(node.tag) == "title" and node.attrib.get("id")
    ]
    descriptions = [
        node for node in root.iter() if local_name(node.tag) == "desc" and node.attrib.get("id")
    ]
    if not titles or not descriptions:
        raise BuildError("the committed SVG must contain identified <title> and <desc> elements")
    labelled_by = set(root.attrib.get("aria-labelledby", "").split())
    described_by = set(root.attrib.get("aria-describedby", "").split())
    if (
        not root.attrib.get("role")
        or titles[0].attrib["id"] not in labelled_by
        or descriptions[0].attrib["id"] not in described_by
    ):
        raise BuildError("the SVG root must expose a role and title/description ARIA linkage")
    if re.search(r"<script\b", svg, re.I):
        raise BuildError("the committed SVG must not contain scripts")
    if re.search(
        r"<(?:image|use|foreignObject)\b[^>]*\b(?:src|href|xlink:href)=[\"']https?://",
        svg,
        re.I,
    ):
        raise BuildError("the committed SVG must not load remote resources")
    if re.search(r"(?:@import|url\()\s*[\"']?https?://", svg, re.I):
        raise BuildError("the committed SVG CSS must not load remote resources")
    for variable in ("--diagram-panel", "--diagram-ink", "--diagram-line"):
        if f"var({variable})" not in svg:
            raise BuildError(f"the SVG palette must use the semantic CSS variable {variable}")
    font_sizes = [float(value) for value in re.findall(r"font-size:\s*([0-9.]+)px", svg, re.I)]
    if not font_sizes or min(font_sizes) < 12:
        found = min(font_sizes) if font_sizes else "none"
        raise BuildError(f"the SVG must not define text below 12px; smallest value: {found}")
    return native_width


def inline_svg(svg: str) -> str:
    """Remove document-only wrappers while preserving generated SVG geometry."""
    svg = re.sub(r"^\s*<\?xml[^>]*\?>\s*", "", svg, count=1, flags=re.I)
    svg = re.sub(r"^\s*<!DOCTYPE[^>]*>\s*", "", svg, count=1, flags=re.I)
    svg = re.sub(r"\bxlink:href=", "href=", svg, flags=re.I)

    def secure_external_link(match: re.Match[str]) -> str:
        attributes = match.group(1)
        if not re.search(r"\bhref=[\"']https?://", attributes, re.I):
            return match.group(0)
        if not re.search(r"\btarget=", attributes, re.I):
            attributes += ' target="_blank"'
        if not re.search(r"\brel=", attributes, re.I):
            attributes += ' rel="external noopener noreferrer"'
        return f"<a{attributes}>"

    return re.sub(r"<a\b([^>]*)>", secure_external_link, svg, flags=re.I).strip()


def verify_pandoc() -> None:
    try:
        result = subprocess.run(
            ["pandoc", "--version"],
            text=True,
            encoding="utf-8",
            capture_output=True,
            cwd=ROOT,
            check=False,
        )
    except FileNotFoundError as exc:
        raise BuildError("Pandoc is required but was not found on PATH") from exc
    version_line = result.stdout.splitlines()[0] if result.stdout else ""
    if result.returncode or version_line != f"pandoc {PANDOC_VERSION}":
        raise BuildError(
            f"Pandoc {PANDOC_VERSION} is required for deterministic output; found {version_line!r}"
        )


def run_pandoc(markdown: str) -> str:
    try:
        result = subprocess.run(
            ["pandoc", "--from=gfm", "--to=html5", "--wrap=none"],
            input=markdown,
            text=True,
            encoding="utf-8",
            capture_output=True,
            cwd=ROOT,
            check=False,
        )
    except FileNotFoundError as exc:
        raise BuildError("Pandoc is required but was not found on PATH") from exc
    if result.returncode:
        detail = result.stderr.strip() or "unknown Pandoc error"
        raise BuildError(f"Pandoc failed with exit code {result.returncode}: {detail}")
    return result.stdout.strip()


def prepare_markdown(markdown: str, source: Path) -> tuple[str, str]:
    """Keep one page H1 and demote later template-fill headings outside code fences."""
    markdown = markdown.replace("\r\n", "\n").replace("\r", "\n")
    lines: list[str] = []
    title: str | None = None
    fence_character: str | None = None
    fence_length = 0

    for line in markdown.split("\n"):
        fence_match = re.match(r"^\s*(`{3,}|~{3,})", line)
        if fence_match:
            token = fence_match.group(1)
            if fence_character is None:
                fence_character = token[0]
                fence_length = len(token)
            elif token[0] == fence_character and len(token) >= fence_length:
                fence_character = None
                fence_length = 0
            lines.append(line)
            continue

        heading = re.match(r"^#\s+(.+?)\s*$", line) if fence_character is None else None
        if heading:
            if title is None:
                title = heading.group(1)
            else:
                line = "#" + line
        lines.append(line)

    if fence_character is not None:
        raise BuildError(f"unclosed Markdown fence in {source.relative_to(ROOT)}")
    if title is None:
        raise BuildError(f"{source.relative_to(ROOT)} must contain one H1")
    return title, "\n".join(lines)


def form_sources() -> tuple[Path, ...]:
    numbered: list[tuple[int, Path]] = []
    for source in TEMPLATES.glob("*.md"):
        match = re.match(r"^(\d+)-", source.name)
        if not match:
            raise BuildError(f"template filename must start with its form number: {source.name}")
        numbered.append((int(match.group(1)), source))
    numbered.sort()
    numbers = [number for number, _ in numbered]
    if numbers != list(range(1, 11)):
        raise BuildError(f"expected exactly forms 1 through 10; found {numbers}")
    return tuple(source for _, source in numbered)


def form_output(source: Path) -> Path:
    return FORMS / f"{source.stem}.html"


def forms_index_markdown(sources: tuple[Path, ...]) -> str:
    lines = [
        "# Zero-Trust Hierarchy forms",
        "",
        "Ten boundary forms carry authorization, evidence, judgment, and lifecycle state across the method’s seams. Use them with the complete rulebook; bracketed fields are prompts, not permission to weaken the controlling bar.",
        "",
    ]
    for number, source in enumerate(sources, start=1):
        title, _ = prepare_markdown(read_text(source), source)
        match = re.fullmatch(r"Zero-Trust Hierarchy form \d+ — (.+)", title)
        label = match.group(1) if match else title
        lines.append(f"{number}. [{label}]({source.stem}.html)")
    lines.extend(
        [
            "",
            "The Markdown files in `templates/` remain the canonical form sources. These pages are deterministic publication renderings.",
            "",
        ]
    )
    return "\n".join(lines)


def relative_href(from_output: Path, to_output: Path) -> str:
    return os.path.relpath(to_output, start=from_output.parent).replace(os.sep, "/")


def rewrite_anchors(
    fragment: str,
    source: Path,
    output: Path,
    source_outputs: dict[Path, Path],
) -> str:
    """Rewrite local canonical Markdown links and secure external anchors."""

    def replace_anchor(match: re.Match[str]) -> str:
        tag = match.group(0)
        href_match = re.search(r"\bhref=([\"'])(.*?)\1", tag, re.I)
        if not href_match:
            return tag
        raw_href = html.unescape(href_match.group(2))
        parts = urlsplit(raw_href)
        rewritten = raw_href

        if not parts.scheme and not parts.netloc and parts.path.lower().endswith(".md"):
            decoded_path = unquote(parts.path)
            if decoded_path.startswith("/"):
                target_source = (ROOT / decoded_path.lstrip("/")).resolve()
            else:
                target_source = (source.parent / decoded_path).resolve()
            target_output = source_outputs.get(target_source)
            if target_output is None:
                raise BuildError(
                    f"{source.relative_to(ROOT)} links to Markdown without a generated page: "
                    f"{raw_href}"
                )
            rewritten = urlunsplit(
                ("", "", relative_href(output, target_output), parts.query, parts.fragment)
            )

        escaped_href = html.escape(rewritten, quote=True)
        start, end = href_match.span(2)
        tag = tag[:start] + escaped_href + tag[end:]

        rewritten_parts = urlsplit(rewritten)
        if rewritten_parts.scheme in {"http", "https"} and not re.search(
            r"\brel=", tag, re.I
        ):
            tag = tag[:-1] + ' rel="external noopener noreferrer">'
        return tag

    return re.sub(r"<a\b[^>]*>", replace_anchor, fragment, flags=re.I)


def diagram_figure(svg: str, native_width: float) -> str:
    width = math.ceil(native_width * 1000) / 1000
    return "\n".join(
        [
            '<figure class="hierarchy-diagram" aria-labelledby="hierarchy-diagram-caption">',
            '  <nav class="diagram-navigation" aria-label="Diagram positions">',
            '    <a href="#my-svg-flowchart-O-0">Governance</a>',
            '    <a href="#my-svg-flowchart-H-10">Human control point</a>',
            '    <a href="#my-svg-flowchart-G-12">Gauntlet loop</a>',
            "  </nav>",
            f'  <div class="diagram-frame" tabindex="0" role="region" aria-label="Scrollable hierarchy diagram" style="--diagram-native-width: {width:g}px">',
            inline_svg(svg),
            "  </div>",
            '  <figcaption id="hierarchy-diagram-caption">',
            "    Authority and evidence flow in Zero-Trust Hierarchy. The same human appears at both control points. Use the position links or scroll the focused diagram to inspect every node.",
            "  </figcaption>",
            "</figure>",
        ]
    )


def canonical_url(output: Path) -> str:
    relative = output.relative_to(ROOT)
    if relative == Path("index.html"):
        return PUBLIC_URL
    if relative.name == "index.html":
        directory = relative.parent.as_posix().rstrip("/")
        return f"{PUBLIC_URL}{directory}/"
    return f"{PUBLIC_URL}{relative.as_posix()}"


def navigation(output: Path, active: str) -> str:
    targets = (
        ("article", "Article", ARTICLE_OUTPUT),
        ("rulebook", "Rulebook", RULEBOOK_OUTPUT),
        ("forms", "Forms", FORMS_INDEX_OUTPUT),
    )
    links: list[str] = []
    for key, label, target in targets:
        current = ' aria-current="page"' if key == active else ""
        links.append(
            f'        <a href="{html.escape(relative_href(output, target), quote=True)}"'
            f"{current}>{label}</a>"
        )
    links.append(
        f'        <a rel="external noopener noreferrer" href="{REPOSITORY_URL}">Source</a>'
    )
    return "\n".join(links)


def page_shell(spec: PageSpec, title: str, fragment: str, css: str) -> str:
    escaped_title = html.escape(title, quote=True)
    escaped_description = html.escape(spec.description, quote=True)
    escaped_author = html.escape(AUTHOR, quote=True)
    escaped_csp = html.escape(CSP, quote=False)
    home = html.escape(relative_href(spec.output, ARTICLE_OUTPUT), quote=True)
    license_href = html.escape(relative_href(spec.output, ROOT / "LICENSE"), quote=True)
    canonical = canonical_url(spec.output)

    return f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="{escaped_csp}">
  <title>{escaped_title}</title>
  <meta name="description" content="{escaped_description}">
  <meta name="author" content="{escaped_author}">
  <meta name="color-scheme" content="light dark">
  <meta property="og:title" content="{escaped_title}">
  <meta property="og:description" content="{escaped_description}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="{canonical}">
  <meta name="twitter:card" content="summary">
  <link rel="canonical" href="{canonical}">
  <link rel="icon" href="data:,">
  <style>
{css}
  </style>
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to the main content</a>
  <header class="site-header">
    <div class="site-header__inner">
      <a class="site-name" href="{home}">Zero-Trust Hierarchy</a>
      <nav class="site-nav" aria-label="Publication">
{navigation(spec.output, spec.active_nav)}
      </nav>
    </div>
  </header>
  <main id="main-content">
    <article class="article article--{spec.kind}">
{fragment}
    </article>
  </main>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <p>Written by {escaped_author}. Licensed under <a href="{license_href}">CC BY 4.0</a>.</p>
    </div>
  </footer>
</body>
</html>
'''


class GeneratedPageScanner(HTMLParser):
    """Collect structure, links, IDs, and page-load requests from generated HTML."""

    LOAD_ATTRIBUTES = {
        "script": ("src",),
        "img": ("src", "srcset"),
        "source": ("src", "srcset"),
        "video": ("src", "poster"),
        "audio": ("src",),
        "iframe": ("src",),
        "embed": ("src",),
        "object": ("data",),
        "input": ("src",),
    }
    LOADING_LINK_RELS = {"stylesheet", "preload", "modulepreload", "icon", "manifest"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.counts: dict[str, int] = {}
        self.remote_loads: list[str] = []
        self.anchor_hrefs: list[str] = []
        self.ids: list[str] = []
        self.in_head = False
        self.document_titles = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        self.counts[tag] = self.counts.get(tag, 0) + 1
        if tag == "head":
            self.in_head = True
        elif tag == "title" and self.in_head:
            self.document_titles += 1
        values = {name.lower(): value or "" for name, value in attrs}
        if values.get("id"):
            self.ids.append(values["id"])
        if tag == "a" and values.get("href"):
            self.anchor_hrefs.append(values["href"])

        attributes = self.LOAD_ATTRIBUTES.get(tag, ())
        if tag == "link":
            rels = set(values.get("rel", "").lower().split())
            if rels & self.LOADING_LINK_RELS:
                attributes = ("href",)
        for attribute in attributes:
            value = values.get(attribute, "").strip().lower()
            if value.startswith(("http://", "https://", "//")):
                self.remote_loads.append(f"{tag}[{attribute}]={value}")

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "head":
            self.in_head = False


def validate_generated_page(output: Path, page: str) -> GeneratedPageScanner:
    scanner = GeneratedPageScanner()
    scanner.feed(page)
    for tag in ("html", "head", "body", "header", "main", "article", "footer", "h1"):
        if scanner.counts.get(tag, 0) != 1:
            raise BuildError(
                f"{output.relative_to(ROOT)} must contain exactly one <{tag}>; "
                f"found {scanner.counts.get(tag, 0)}"
            )
    expected_navs = 2 if output == ARTICLE_OUTPUT else 1
    if scanner.counts.get("nav", 0) != expected_navs:
        raise BuildError(
            f"{output.relative_to(ROOT)} must contain exactly {expected_navs} <nav> "
            f"element{'s' if expected_navs != 1 else ''}; "
            f"found {scanner.counts.get('nav', 0)}"
        )
    if scanner.document_titles != 1:
        raise BuildError(
            f"{output.relative_to(ROOT)} must contain exactly one document <title>; "
            f"found {scanner.document_titles}"
        )
    if scanner.counts.get("script", 0):
        raise BuildError(f"{output.relative_to(ROOT)} contains runtime JavaScript")
    if scanner.remote_loads:
        raise BuildError(
            f"{output.relative_to(ROOT)} contains remote page-load resources: "
            + ", ".join(scanner.remote_loads)
        )
    if len(scanner.ids) != len(set(scanner.ids)):
        raise BuildError(f"{output.relative_to(ROOT)} contains duplicate element IDs")
    if MARKER in page:
        raise BuildError(f"{output.relative_to(ROOT)} still contains the diagram sentinel")
    if page.count("Content-Security-Policy") != 1 or CSP not in page:
        raise BuildError(f"{output.relative_to(ROOT)} does not contain the approved CSP")
    for href in scanner.anchor_hrefs:
        parts = urlsplit(href)
        if not parts.scheme and not parts.netloc and parts.path.lower().endswith(".md"):
            raise BuildError(
                f"{output.relative_to(ROOT)} retains a local Markdown link: {href}"
            )
    return scanner


def validate_local_links(
    outputs: dict[Path, str], scanners: dict[Path, GeneratedPageScanner]
) -> None:
    generated = {path.resolve() for path in outputs}
    for output, scanner in scanners.items():
        for href in scanner.anchor_hrefs:
            parts = urlsplit(href)
            if parts.scheme or parts.netloc or href.startswith(("#", "//")):
                continue
            path_part = unquote(parts.path)
            if not path_part:
                target = output
            else:
                target = (output.parent / path_part).resolve()
                if path_part.endswith("/") or target.is_dir():
                    target = target / "index.html"
            if target not in generated and not target.exists():
                raise BuildError(
                    f"broken local link in {output.relative_to(ROOT)}: {href}"
                )
            if parts.fragment and target in outputs:
                target_ids = set(scanners[target].ids)
                if unquote(parts.fragment) not in target_ids:
                    raise BuildError(
                        f"broken fragment in {output.relative_to(ROOT)}: {href}"
                    )


def build_outputs() -> dict[Path, str]:
    verify_pandoc()
    css = read_text(CSS).strip()
    if re.search(r"(?:@import|url\()\s*[\"']?https?://", css, re.I):
        raise BuildError("site CSS attempts to load a remote resource")

    _, mermaid, marked_article = article_parts()
    svg = read_text(SVG)
    diagram_width = validate_svg(svg, source_hash(mermaid))

    sources = form_sources()
    source_outputs = {
        ARTICLE.resolve(): ARTICLE_OUTPUT,
        RULEBOOK.resolve(): RULEBOOK_OUTPUT,
        **{source.resolve(): form_output(source) for source in sources},
    }
    virtual_forms_index = FORMS / "index.md"
    specs = [
        PageSpec(
            source=ARTICLE,
            output=ARTICLE_OUTPUT,
            kind="article",
            active_nav="article",
            markdown=marked_article,
            description=DESCRIPTION,
            has_diagram=True,
        ),
        PageSpec(
            source=RULEBOOK,
            output=RULEBOOK_OUTPUT,
            kind="reference",
            active_nav="rulebook",
            markdown=read_text(RULEBOOK),
            description="The complete operating contract for Zero-Trust Hierarchy.",
        ),
        PageSpec(
            source=virtual_forms_index,
            output=FORMS_INDEX_OUTPUT,
            kind="forms-index",
            active_nav="forms",
            markdown=forms_index_markdown(sources),
            description="Ten boundary forms for operating Zero-Trust Hierarchy.",
        ),
    ]
    specs.extend(
        PageSpec(
            source=source,
            output=form_output(source),
            kind="form",
            active_nav="forms",
            markdown=read_text(source),
            description=f"A boundary form for Zero-Trust Hierarchy: {source.stem}.",
        )
        for source in sources
    )

    outputs: dict[Path, str] = {}
    scanners: dict[Path, GeneratedPageScanner] = {}
    for spec in specs:
        title, prepared = prepare_markdown(spec.markdown, spec.source)
        fragment = run_pandoc(prepared)
        fragment = rewrite_anchors(fragment, spec.source, spec.output, source_outputs)
        if spec.has_diagram:
            if fragment.count(MARKER) != 1:
                raise BuildError("Pandoc did not preserve the unique diagram build sentinel")
            fragment = fragment.replace(MARKER, diagram_figure(svg, diagram_width))
        elif MARKER in fragment:
            raise BuildError(f"unexpected diagram sentinel in {spec.source.relative_to(ROOT)}")
        if spec.kind == "forms-index":
            fragment, ordered_lists = re.subn(
                r"<ol\b[^>]*>", '<ol class="form-index">', fragment
            )
            if ordered_lists != 1:
                raise BuildError(
                    "the forms index must contain exactly one ordered list; "
                    f"found {ordered_lists}"
                )
        page = page_shell(spec, title, fragment, css)
        outputs[spec.output] = page
        scanners[spec.output] = validate_generated_page(spec.output, page)

    if len(outputs) != 13:
        raise BuildError(f"expected 13 generated HTML artifacts; built {len(outputs)}")
    validate_local_links(outputs, scanners)
    return outputs


def check_outputs(outputs: dict[Path, str]) -> None:
    defects: list[str] = []
    for output, expected in outputs.items():
        if not output.exists():
            defects.append(f"missing {output.relative_to(ROOT)}")
        elif read_text(output) != expected:
            defects.append(f"stale {output.relative_to(ROOT)}")

    expected_forms = {path.resolve() for path in outputs if path.parent == FORMS}
    actual_forms = {path.resolve() for path in FORMS.glob("*.html")} if FORMS.exists() else set()
    for unexpected in sorted(actual_forms - expected_forms):
        defects.append(f"unexpected generated form page {unexpected.relative_to(ROOT)}")
    if defects:
        raise BuildError("generated site is not current:\n  " + "\n  ".join(defects))


def write_outputs(outputs: dict[Path, str]) -> None:
    for output, page in outputs.items():
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(page, encoding="utf-8", newline="\n")


def print_inventory(verb: str, outputs: dict[Path, str]) -> None:
    print(f"{verb} {len(outputs)} deterministic HTML artifacts:")
    for output in outputs:
        print(f"  {output.relative_to(ROOT)}")


def stamp_svg() -> None:
    _, mermaid, _ = article_parts()
    digest = source_hash(mermaid)
    svg = read_text(SVG)
    svg = SVG_METADATA.sub("\n", svg)
    palette = (
        ("rgba(232,232,232, 0.8)", "color-mix(in srgb, var(--diagram-bg) 88%, transparent)"),
        ("rgba(232, 232, 232, 0.5)", "color-mix(in srgb, var(--diagram-bg) 78%, transparent)"),
        ("rgba(185, 185, 185, 1)", "color-mix(in srgb, var(--diagram-line) 35%, transparent)"),
        ("hsl(80, 100%, 96.2745098039%)", "var(--diagram-bg)"),
        ("#333333", "var(--diagram-line)"),
        ("#000000", "var(--diagram-ink)"),
        ("#ECECFF", "var(--diagram-panel)"),
        ("#9370DB", "var(--diagram-accent)"),
        ("#ffffde", "color-mix(in srgb, var(--diagram-panel) 72%, var(--diagram-bg))"),
        ("#aaaa33", "var(--diagram-line)"),
        ("#552222", "var(--diagram-accent)"),
        ("#333", "var(--diagram-ink)"),
        ("#000", "var(--diagram-ink)"),
    )
    for generated_color, semantic_color in palette:
        if generated_color not in svg and semantic_color not in svg:
            raise BuildError(
                f"expected Mermaid palette token is missing: {generated_color}; "
                "inspect renderer output before stamping"
            )
        svg = svg.replace(generated_color, semantic_color)
    metadata = "\n".join(
        [
            '<metadata id="zero-trust-build-metadata">',
            f"  mermaid-source-sha256: {digest}",
            f"  mermaid-renderer: {MERMAID_PACKAGE}",
            f"  mermaid-command: {MERMAID_COMMAND}",
            "</metadata>",
        ]
    )
    opening = re.search(r"<svg\b[^>]*>", svg, re.I)
    if not opening:
        raise BuildError(f"{SVG.relative_to(ROOT)} does not contain an SVG root element")
    split = opening.end()
    stamped = svg[:split] + "\n" + metadata + "\n" + svg[split:].lstrip("\n")
    SVG.write_text(stamped.rstrip() + "\n", encoding="utf-8", newline="\n")
    print(f"Stamped {SVG.relative_to(ROOT)} with Mermaid SHA-256 {digest}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument(
        "--check",
        action="store_true",
        help="verify every generated HTML artifact against a fresh deterministic build",
    )
    mode.add_argument(
        "--extract-mermaid",
        metavar="PATH",
        type=Path,
        help="write the normalized canonical Mermaid source to PATH",
    )
    mode.add_argument(
        "--stamp-svg",
        action="store_true",
        help="record the canonical source hash, pinned renderer, and command in the SVG",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        if args.extract_mermaid is not None:
            _, mermaid, _ = article_parts()
            args.extract_mermaid.write_text(mermaid, encoding="utf-8", newline="\n")
            print(
                f"Wrote normalized Mermaid source to {args.extract_mermaid} "
                f"(SHA-256 {source_hash(mermaid)})"
            )
            return 0
        if args.stamp_svg:
            stamp_svg()
            return 0

        outputs = build_outputs()
        if args.check:
            check_outputs(outputs)
            print_inventory("Verified", outputs)
            return 0

        write_outputs(outputs)
        print_inventory("Built", outputs)
        return 0
    except BuildError as exc:
        print(f"build error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
