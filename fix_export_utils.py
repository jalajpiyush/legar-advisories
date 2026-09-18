import re

with open("src/lib/exportUtils.ts", "r") as f:
    content = f.read()

# Fix borders
content = content.replace("borders: {", "border: {")

# Fix bold/italics
old_legal_advisories = """    new Paragraph({
      text: "Legal Advisories",
      alignment: AlignmentType.CENTER,
      bold: true
    }),
    new Paragraph({
      text: "AI-assisted legal drafting",
      alignment: AlignmentType.CENTER,
      italics: true
    })"""

new_legal_advisories = """    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Legal Advisories", bold: true })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "AI-assisted legal drafting", italics: true })]
    })"""
content = content.replace(old_legal_advisories, new_legal_advisories)

# Fix html2pdf options type
content = content.replace("const opt = {", "const opt: any = {")

with open("src/lib/exportUtils.ts", "w") as f:
    f.write(content)

