import os
from PIL import Image

src_dir = '/home/dan/Proyectos/BEFORE/Huertify/assets/'
dest_dir = '/home/dan/Proyectos/BEFORE/Huertify/frontend/public/images/products/'
max_width = 800

if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)

for filename in os.listdir(src_dir):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        file_path = os.path.join(src_dir, filename)
        img = Image.open(file_path)
        
        # Calculate new height to maintain aspect ratio
        width_percent = (max_width / float(img.size[0]))
        new_height = int((float(img.size[1]) * float(width_percent)))
        
        # Resize image
        img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        # Save optimized image
        dest_path = os.path.join(dest_dir, filename)
        img.save(dest_path, optimize=True, quality=85)
        print(f"Optimized: {filename} -> {dest_path}")
