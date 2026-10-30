#!/usr/bin/env python3
"""Build the reading edition from the canonical Markdown manuscript.

Run from the repository root:
  uv run --with reportlab --with markdown-it-py python libro/generar_pdf.py
"""

from html import escape
from pathlib import Path

from markdown_it import MarkdownIt
from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, KeepTogether, PageBreak, PageTemplate, Paragraph, Spacer,
)
from reportlab.platypus.tableofcontents import TableOfContents


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "libro/comunidad-libre.md"
OUTPUT = ROOT / "output/pdf/comunidad-libre.pdf"
WIDTH, HEIGHT = 432, 648  # 6 by 9 inches
PRIMARY_HEX = "#1447E6"
PRIMARY = colors.HexColor(PRIMARY_HEX)
INK = colors.HexColor("#0A0A0A")
MUTED = colors.HexColor("#737373")
PAPER = colors.HexColor("#FFFFFF")
BORDER = colors.HexColor("#E5E5E5")


def register_fonts():
    mac = Path("/System/Library/Fonts/Supplemental")
    linux = Path("/usr/share/fonts/truetype/dejavu")
    if (mac / "Georgia.ttf").exists():
        files = [mac / f"Georgia{suffix}.ttf" for suffix in
                 ("", " Bold", " Italic", " Bold Italic")]
        sans = [mac / "Arial.ttf", mac / "Arial Bold.ttf"]
    else:
        files = [linux / f"DejaVuSerif{suffix}.ttf" for suffix in
                 ("", "-Bold", "-Italic", "-BoldItalic")]
        sans = [linux / "DejaVuSans.ttf", linux / "DejaVuSans-Bold.ttf"]
    for name, path in zip(("Book", "Book-Bold", "Book-Italic", "Book-BoldItalic"), files):
        pdfmetrics.registerFont(TTFont(name, str(path)))
    for name, path in zip(("Sans", "Sans-Bold"), sans):
        pdfmetrics.registerFont(TTFont(name, str(path)))
    pdfmetrics.registerFontFamily("Book", normal="Book", bold="Book-Bold",
                                 italic="Book-Italic", boldItalic="Book-BoldItalic")


register_fonts()
BODY = ParagraphStyle(
    "Body", fontName="Book", fontSize=10.1, leading=14.1,
    textColor=INK, alignment=TA_JUSTIFY, spaceAfter=7,
    allowWidows=0, allowOrphans=0, splitLongWords=False,
)
CHAPTER = ParagraphStyle(
    "Chapter", parent=BODY, fontName="Book-Bold", fontSize=23,
    leading=28, textColor=PRIMARY, alignment=TA_LEFT,
    spaceBefore=16, spaceAfter=24, keepWithNext=True,
)
SECTION = ParagraphStyle(
    "Section", parent=BODY, fontName="Book-Bold", fontSize=12,
    leading=16, alignment=TA_LEFT, spaceBefore=12, spaceAfter=9,
    keepWithNext=True,
)
SMALL = ParagraphStyle(
    "Small", parent=BODY, fontSize=8.8, leading=12.7,
    alignment=TA_LEFT, textColor=MUTED, spaceAfter=8,
)
REFERENCE = ParagraphStyle(
    "Reference", parent=BODY, fontSize=9.2, leading=13.5,
    alignment=TA_LEFT, spaceAfter=12,
)
KICKER = ParagraphStyle(
    "Kicker", fontName="Sans-Bold", fontSize=8, leading=12,
    textColor=MUTED, spaceAfter=14,
)


def normalize(text):
    return text.replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-")


def inline(tokens):
    parts = []
    for token in tokens or []:
        if token.type == "text":
            parts.append(escape(normalize(token.content)))
        elif token.type in ("softbreak", "hardbreak"):
            parts.append(" " if token.type == "softbreak" else "<br/>")
        elif token.type == "em_open":
            parts.append("<i>")
        elif token.type == "em_close":
            parts.append("</i>")
        elif token.type == "strong_open":
            parts.append("<b>")
        elif token.type == "strong_close":
            parts.append("</b>")
        elif token.type == "link_open":
            href = escape(token.attrGet("href"), quote=True)
            parts.append(f'<link href="{href}" color="{PRIMARY_HEX}">')
        elif token.type == "link_close":
            parts.append("</link>")
        elif token.type == "code_inline":
            parts.append(escape(token.content))
        else:
            raise ValueError(f"Unsupported inline token: {token.type}")
    return "".join(parts)


def draw_page(canvas, doc):
    canvas.saveState()
    if doc.page == 1:
        canvas.setFillColor(PRIMARY)
        canvas.rect(0, 0, WIDTH, HEIGHT, fill=1, stroke=0)
        canvas.setStrokeColor(PAPER)
        canvas.setLineWidth(0.6)
        canvas.rect(24, 24, WIDTH - 48, HEIGHT - 48)
        canvas.setFillColor(PAPER)
        canvas.setFont("Sans-Bold", 8)
        canvas.drawString(48, 578, "ENSAYO POLÍTICO  /  EDICIÓN LIBERTARIA")
        canvas.setFillColor(PAPER)
        canvas.setFont("Book", 38)
        canvas.drawString(46, 454, "Comunidad")
        canvas.setFont("Book", 54)
        canvas.drawString(46, 393, "Libre")
        canvas.setStrokeColor(PAPER)
        canvas.setLineWidth(1)
        canvas.line(48, 350, 126, 350)
        canvas.setFont("Book", 16)
        for i, line in enumerate(("La cooperación humana", "frente al monopolio", "del poder")):
            canvas.drawString(48, 313 - i * 24, line)
        canvas.setFillColor(PAPER)
        canvas.setFont("Sans", 9)
        canvas.drawString(48, 94, "LIBERTAD  ·  PROPIEDAD  ·  COMUNIDAD")
        canvas.setFillColor(PAPER)
        canvas.setFont("Sans", 8)
        canvas.drawString(48, 75, "OCTUBRE DE 2026")
    else:
        canvas.setFillColor(MUTED)
        canvas.setFont("Sans", 7)
        canvas.drawString(49, HEIGHT - 28, "COMUNIDAD LIBRE")
        canvas.setStrokeColor(BORDER)
        canvas.setLineWidth(0.35)
        canvas.line(49, 40, WIDTH - 49, 40)
        canvas.setFont("Sans", 8)
        canvas.drawCentredString(WIDTH / 2, 26, str(doc.page))
    canvas.restoreState()


class BookDocument(BaseDocTemplate):
    def __init__(self, filename):
        super().__init__(filename, pagesize=(WIDTH, HEIGHT),
                         leftMargin=49, rightMargin=49,
                         topMargin=50, bottomMargin=51,
                         title="Comunidad Libre: La cooperación humana frente al monopolio del poder",
                         author="Comunidad Libre", subject="Ensayo de filosofía política libertaria",
                         lang="es", pageCompression=1)
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height,
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates(PageTemplate(id="Book", frames=[frame], onPage=draw_page))

    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph) and flowable.style.name == "Chapter":
            text = flowable.getPlainText()
            key = flowable._bookmark
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(text, key, level=0, closed=False)
            self.notify("TOCEntry", (0, text, self.page, key))


def create_story():
    story = [Spacer(1, 500), PageBreak()]
    story.append(Paragraph("SOBRE ESTA EDICIÓN", KICKER))
    story.append(Paragraph("Libertad, propiedad<br/>y cooperación", CHAPTER.clone("FrontTitle")))
    for text in (
        "Este libro desarrolla los ocho episodios de Comunidad Libre en un ensayo de orientación "
        "libertaria. Examina los fundamentos de la libertad, la propiedad legítima y la "
        "cooperación voluntaria mediante argumentos propios y un diálogo crítico con distintas tradiciones.",
        "La edición incluye un prólogo, ocho capítulos y una bibliografía comentada. Los ejemplos "
        "institucionales son propuestas del libro; las referencias identifican las obras con las "
        "que se contrastan. Los enlaces del texto y del índice pueden abrirse desde el PDF.",
        "Las propuestas para Costa Rica expresan una orientación filosófica y política. Su "
        "aplicación requeriría estudios jurídicos, financieros e institucionales específicos.",
    ):
        story.append(Paragraph(text, BODY))
    story.append(Spacer(1, 20))
    story.append(Paragraph("Edición: 29 de octubre de 2026.<br/>"
                           "Manuscrito fuente: libro/comunidad-libre.md.<br/>"
                           "La revisión detallada de autores acompaña al manuscrito en un documento separado.", SMALL))
    story.append(PageBreak())
    story.append(Paragraph("Índice", CHAPTER.clone("ContentsTitle")))
    toc = TableOfContents()
    toc.levelStyles = [ParagraphStyle(
        "TOC", fontName="Book", fontSize=10.3, leading=15.5,
        leftIndent=0, rightIndent=18, spaceBefore=11, textColor=INK,
    )]
    story.append(toc)
    source = SOURCE.read_text(encoding="utf-8")
    source = source[source.index("## Prólogo."):]
    tokens = MarkdownIt("commonmark").parse(source)
    bibliography = False
    reading_notes = False
    pending_bibliography_heading = None
    lists = []
    item_prefix = None
    i = 0
    chapter_number = 0
    while i < len(tokens):
        token = tokens[i]
        if token.type == "heading_open":
            text = inline(tokens[i + 1].children)
            level = int(token.tag[1:])
            if level == 2:
                story.append(PageBreak())
                chapter_number += 1
                paragraph = Paragraph(text, CHAPTER)
                paragraph._bookmark = f"chapter-{chapter_number}"
                story.append(paragraph)
                bibliography = "Bibliografía" in text
                reading_notes = False
            else:
                reading_notes = "Lecturas para contrastar" in text
                heading = Paragraph(text, SECTION)
                if bibliography:
                    pending_bibliography_heading = heading
                else:
                    story.append(heading)
            i += 3
            continue
        if token.type in ("bullet_list_open", "ordered_list_open"):
            lists.append(int(token.attrGet("start") or 1) if token.type == "ordered_list_open" else None)
        elif token.type in ("bullet_list_close", "ordered_list_close"):
            lists.pop()
        elif token.type == "list_item_open":
            item_prefix = f"{lists[-1]}. " if lists[-1] is not None else "• "
            if lists[-1] is not None:
                lists[-1] += 1
        elif token.type == "list_item_close":
            item_prefix = None
        elif token.type == "paragraph_open":
            text = inline(tokens[i + 1].children)
            if item_prefix:
                text = item_prefix + text
                item_prefix = None
            style = REFERENCE if bibliography else SMALL if reading_notes or "Notas de lectura" in text else BODY
            paragraph = Paragraph(text, style)
            if pending_bibliography_heading is not None:
                story.append(KeepTogether([pending_bibliography_heading, paragraph]))
                pending_bibliography_heading = None
            elif bibliography:
                story.append(KeepTogether([paragraph]))
            elif "Notas de lectura" in text and isinstance(story[-1], Paragraph):
                closing_paragraph = story.pop()
                story.append(KeepTogether([closing_paragraph, paragraph]))
            else:
                story.append(paragraph)
            i += 3
            continue
        elif token.type not in ("paragraph_close", "inline"):
            raise ValueError(f"Unsupported block token: {token.type}")
        i += 1
    return story


if __name__ == "__main__":
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = BookDocument(str(OUTPUT))
    doc.multiBuild(create_story())
    print(f"PDF creado: {OUTPUT}")
