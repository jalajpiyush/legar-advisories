from PIL import Image, ImageDraw, ImageFont
import base64
from io import BytesIO

img = Image.new('RGB', (100, 100), color = 'black')
d = ImageDraw.Draw(img)

# Try to use a serif font
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", 64)
except:
    font = ImageFont.load_default()

# Get text bounding box for centering
bbox = d.textbbox((0, 0), "L", font=font)
w = bbox[2] - bbox[0]
h = bbox[3] - bbox[1]
# Draw text
d.text(((100-w)/2, (100-h)/2 - h*0.2), "L", fill="white", font=font)

buffered = BytesIO()
img.save(buffered, format="PNG")
img_str = base64.b64encode(buffered.getvalue()).decode()
print(img_str)
