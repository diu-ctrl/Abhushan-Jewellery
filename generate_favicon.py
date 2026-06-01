import os
from PIL import Image, ImageDraw, ImageFont

def generate_favicon():
    # Setup paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    font_path = os.path.join(base_dir, "fonts", "lucia-bt", "Lucia BT.ttf")
    output_png = os.path.join(base_dir, "images", "favicon.png")
    
    # Target image size
    size = 512
    center = size // 2
    
    # Colors
    bg_color = (50, 35, 37, 255)       # Charcoal (#322325)
    border_color = (192, 139, 93, 255) # Antique Gold (#C08B5D)
    gold_color = (212, 175, 122, 255)  # Soft Gold (#D4AF7A)
    
    # 1. Render the text 'A' on a temporary transparent image to get its exact pixel bounds
    temp_img = Image.new("RGBA", (size * 2, size * 2), (0, 0, 0, 0))
    temp_draw = ImageDraw.Draw(temp_img)
    
    # Load font
    font_size = 320
    try:
        font = ImageFont.truetype(font_path, font_size)
    except IOError:
        print(f"Error: Could not load font from {font_path}")
        return
        
    # Draw text at temporary location (size, size)
    temp_draw.text((size, size), "A", font=font, fill=(255, 255, 255, 255))
    
    # Get bounding box of drawn text
    bbox = temp_img.getbbox() # (left, top, right, bottom)
    if not bbox:
        print("Error: Nothing was rendered.")
        return
        
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    
    # Bounding box center relative to temp_img origin
    bbox_center_x = bbox[0] + text_w / 2
    bbox_center_y = bbox[1] + text_h / 2
    
    # 2. Create the final image
    final_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(final_img)
    
    # Draw background circular seal
    padding = 12
    draw.ellipse([padding, padding, size - padding, size - padding], fill=bg_color)
    
    # Draw gold border circle inside background
    border_padding = padding + 20
    draw.ellipse([border_padding, border_padding, size - border_padding, size - border_padding], 
                 outline=border_color, width=8)
    
    # Draw gold outer accent dots or subtle ring
    # (Just a clean, classic circular frame looks most premium)
    
    # 3. Calculate position for centering the text exactly
    # We want the center of the bounding box to be at (center, center) of the final image.
    # Therefore, the drawing coordinates should be offset by:
    offset_x = center - (bbox_center_x - size)
    offset_y = center - (bbox_center_y - size)
    
    # To visually balance calligraphic slants, we can adjust slightly (slight optical correction)
    # The letter A slants right, so shifting it slightly left helps it look more balanced.
    optical_shift_x = -8
    optical_shift_y = 5
    
    final_draw_coords = (offset_x + optical_shift_x, offset_y + optical_shift_y)
    
    # Draw the gold letter 'A'
    draw.text(final_draw_coords, "A", font=font, fill=gold_color)
    
    # Save the output image
    os.makedirs(os.path.dirname(output_png), exist_ok=True)
    final_img.save(output_png, "PNG")
    print(f"Favicon PNG successfully generated at: {output_png}")

if __name__ == "__main__":
    generate_favicon()
