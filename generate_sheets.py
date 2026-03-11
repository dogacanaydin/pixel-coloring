#!/usr/bin/env python3
"""Generate data.js files from pixel art PNGs."""
import os, math, json
from PIL import Image

CHOSEN = "/Users/dogacanaydin/pixel-coloring/chosen-ones"
SHEETS_DIR = "/Users/dogacanaydin/pixel-coloring/sheets"

# Sheet 1 = Rubble (already exists, skip)
# Define sheets 2-11 from the chosen-ones folder
sheets = [
    # (filename, title, gridSize)
    ("20x20_Grid copy 3 1.png", "Bear Cub", 20),
    ("20x20_Grid copy 5 1.png", "Pink Princess", 20),
    ("20x20_Grid copy 7 1.png", "Sunshine Kid", 20),
    ("20x20_Grid copy 8 1.png", "Space Ranger", 20),
    ("20x20_Grid copy 9 1.png", "Pumpkin", 20),
    ("20x20_Grid copy 10 1.png", "Explorer", 20),
    ("20x20_Grid copy 10.png", "Brown Girl", 20),
    ("20x20_Grid copy 12 (1).png", "Neon Creature", 20),
    ("20x20_Grid copy 13_1 1.png", "Diamond Gem", 20),
    ("16x16_Grid copy 2 1.png", "Space Invaders", 16),
]

def rgb_distance(a, b):
    return math.sqrt(sum((x-y)**2 for x,y in zip(a,b)))

def get_cell_color(img, row, col, grid_size):
    w, h = img.size
    cell_w = w / grid_size
    cell_h = h / grid_size
    cx = int(col * cell_w + cell_w / 2)
    cy = int(row * cell_h + cell_h / 2)

    pixels = []
    for dy in range(-1, 2):
        for dx in range(-1, 2):
            px = min(max(cx + dx, 0), w - 1)
            py = min(max(cy + dy, 0), h - 1)
            p = img.getpixel((px, py))
            if len(p) == 4 and p[3] < 128:
                continue
            pixels.append(p[:3])

    if not pixels:
        return (255, 255, 255)

    r = round(sum(p[0] for p in pixels) / len(pixels))
    g = round(sum(p[1] for p in pixels) / len(pixels))
    b = round(sum(p[2] for p in pixels) / len(pixels))
    return (r, g, b)

def rgb_to_hex(rgb):
    return "#{:02X}{:02X}{:02X}".format(*rgb)

def build_palette(colors, threshold=30):
    palette = []
    for c in colors:
        found = False
        for p in palette:
            if rgb_distance(c, p) < threshold:
                found = True
                break
        if not found:
            palette.append(c)
    return palette

def nearest_index(rgb, palette):
    best = 0
    best_dist = float('inf')
    for i, p in enumerate(palette):
        d = rgb_distance(rgb, p)
        if d < best_dist:
            best_dist = d
            best = i
    return best

for idx, (filename, title, grid_size) in enumerate(sheets):
    sheet_num = idx + 2  # sheets 2-11
    filepath = os.path.join(CHOSEN, filename)

    if not os.path.exists(filepath):
        print(f"SKIP: {filename} not found")
        continue

    img = Image.open(filepath).convert("RGBA")

    # Sample all cell colors
    all_colors = []
    cell_colors = []
    for row in range(grid_size):
        row_colors = []
        for col in range(grid_size):
            c = get_cell_color(img, row, col, grid_size)
            all_colors.append(c)
            row_colors.append(c)
        cell_colors.append(row_colors)

    # Build palette
    palette = build_palette(all_colors, threshold=25)
    palette_hex = [rgb_to_hex(p) for p in palette]

    # Map cells to palette indices
    color_grid = []
    for row in cell_colors:
        grid_row = [nearest_index(c, palette) for c in row]
        color_grid.append(grid_row)

    # Write data.js
    sheet_dir = os.path.join(SHEETS_DIR, f"sheet{sheet_num}")
    os.makedirs(sheet_dir, exist_ok=True)

    lines = [f'window.SHEET_DATA_{sheet_num} = {{']
    lines.append(f'  title: "{title}",')
    lines.append(f'  gridSize: {grid_size},')
    pal_str = ", ".join('"' + h + '"' for h in palette_hex)
    lines.append(f'  palette: [{pal_str}],')
    lines.append('  colorGrid: [')
    for r, row in enumerate(color_grid):
        comma = ',' if r < len(color_grid) - 1 else ''
        lines.append(f'    [{",".join(str(x) for x in row)}]{comma}')
    lines.append('  ]')
    lines.append('};')

    data_path = os.path.join(sheet_dir, "data.js")
    with open(data_path, 'w') as f:
        f.write('\n'.join(lines) + '\n')

    # Copy artwork.png
    img_rgb = Image.new("RGB", img.size, (255, 255, 255))
    img_rgb.paste(img, mask=img.split()[3] if img.mode == 'RGBA' else None)
    img_rgb.save(os.path.join(sheet_dir, "artwork.png"))

    print(f"Sheet {sheet_num}: {title} ({grid_size}x{grid_size}, {len(palette)} colors)")

print("\nDone!")
