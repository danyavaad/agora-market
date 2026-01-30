import os
from PIL import Image

def extract_icons(image_path, output_dir):
    img = Image.open(image_path)
    width, height = img.size
    
    # Analyze the bottom part of the image (third row)
    # The dark background row is roughly between y=440 and y=530
    y_range_start, y_range_end = 440, 530
    bottom_strip = img.crop((0, y_range_start, width, y_range_end))
    
    # Convert to grayscale and threshold to find the icon (green/white parts)
    gray = bottom_strip.convert('L')
    # Thresholding: green is relatively bright in 'L' compared to dark background
    threshold = 80 
    mask = gray.point(lambda p: 255 if p > threshold else 0)
    
    # Find bounding boxes of continuous segments in the horizontal direction
    # We look at the projection onto the X axis
    data = list(mask.getdata())
    w, h = mask.size
    x_projection = [0] * w
    for y in range(h):
        for x in range(w):
            if data[y * w + x] > 0:
                x_projection[x] += 1
                
    # Define segments where x_projection > 0
    segments = []
    start = None
    for x in range(w):
        if x_projection[x] > 0 and start is None:
            start = x
        elif x_projection[x] == 0 and start is not None:
            if x - start > 10: # Minimum width to be an icon
                segments.append((start, x))
            start = None
    if start is not None:
        segments.append((start, w))
        
    icon_names = [
        "single_plant", "plant_group", "tree", "group_of_trees", 
        "bush", "grass", "water", "pool", 
        "clock", "tools", "pump", "parking", "entrance"
    ]
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    print(f"Found {len(segments)} segments. Expected 13.")
    
    for i, (x1, x2) in enumerate(segments):
        if i >= len(icon_names):
            break
            
        # Add some padding
        pad = 5
        x_start = max(0, x1 - pad)
        x_end = min(width, x2 + pad)
        
        # For Y, we want to capture the whole square but avoid the text
        # Let's find the Y boundaries for this segment
        segment_img = mask.crop((x1, 0, x2, h))
        s_data = list(segment_img.getdata())
        sw, sh = segment_img.size
        y_proj = [0] * sh
        for y in range(sh):
            for x in range(sw):
                if s_data[y * sw + x] > 0:
                    y_proj[y] += 1
        
        y_start = 0
        while y_start < sh and y_proj[y_start] == 0:
            y_start += 1
        y_end = sh - 1
        while y_end > 0 and y_proj[y_end] == 0:
            y_end -= 1
            
        # Find the square based on the detected mask
        # The green rounded square is the main feature
        # We shift the center up slightly (by 2 pixels) to avoid the text at the bottom.
        y_center = (y_range_start + y_start + y_range_start + y_end) // 2 - 2
        x_center = (x_start + x_end) // 2
        
        # We assume the square is roughly 50x50 pixels.
        side = 50
        half_side = side // 2
        
        final_x_start = x_center - half_side
        final_x_end = x_center + half_side
        final_y_start = y_center - half_side
        final_y_end = y_center + half_side
        
        icon_img = img.crop((final_x_start, final_y_start, final_x_end, final_y_end))
        icon_img.save(os.path.join(output_dir, f"{icon_names[i]}.png"))
        print(f"Saved {icon_names[i]}.png centered at ({x_center}, {y_center}), size {side}x{side}")

if __name__ == "__main__":
    img_path = "/home/dan/.gemini/antigravity/brain/bebb5685-280c-471c-be1b-c44dbc0933d2/uploaded_media_1769617072888.jpg"
    out_dir = "/home/dan/Proyectos/BEFORE/Huertify/assets/icons"
    extract_icons(img_path, out_dir)
