import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

handlers = """  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles: File[] = [];
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        newFiles.push(e.dataTransfer.files[i]);
      }
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const [prompt, setPrompt] = useState("");"""

# Use regex to replace
content = re.sub(
    r"  const removeFile = \(index: number\) => \{\n    setUploadedFiles\(prev => prev\.filter\(\(_, i\) => i !== index\)\);\n  \};\n\s+const \[prompt, setPrompt\] = useState\(\"\"\);",
    handlers,
    content
)

with open("src/pages/Dashboard.tsx", "w") as f:
    f.write(content)
