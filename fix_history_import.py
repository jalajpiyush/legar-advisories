with open("src/pages/History.tsx", "r") as f:
    content = f.read()

content = content.replace("import ReactMarkdown;\nimport { ExportMenu } from '../components/ExportMenu'; from 'react-markdown';", "import ReactMarkdown from 'react-markdown';\nimport { ExportMenu } from '../components/ExportMenu';")

with open("src/pages/History.tsx", "w") as f:
    f.write(content)
