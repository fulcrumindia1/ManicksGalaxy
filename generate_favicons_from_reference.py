import os
import shutil
import base64
from PIL import Image, ImageEnhance, ImageFilter

base_dir = r'C:\Users\hp\Desktop\ManicksGalaxy\manicksgalaxy\public'
icons_dir = os.path.join(base_dir, 'brand', 'icons')
styles_dir = os.path.join(icons_dir, 'styles')
os.makedirs(icons_dir, exist_ok=True)
os.makedirs(styles_dir, exist_ok=True)

# Load the perfect crop of the Main Icon from the user's reference image
ref_main_path = os.path.join(icons_dir, 'main_icon_perfect.png')
ref_main = Image.open(ref_main_path).convert('RGBA')

# High quality upscaled base (512x512) with slight vibrance & sharpness boost for small tab legibility
base_512 = ref_main.resize((512, 512), Image.Resampling.LANCZOS)
enhancer = ImageEnhance.Sharpness(base_512)
base_512 = enhancer.enhance(1.2)
color_enhancer = ImageEnhance.Color(base_512)
base_512 = color_enhancer.enhance(1.1)

# Generate all standard resolutions
sizes = [16, 24, 32, 48, 64, 128, 180, 192, 256, 512]
generated_images = {}

for s in sizes:
    resized = base_512.resize((s, s), Image.Resampling.LANCZOS)
    if s <= 32:
        # Extra crisp unsharp mask for tiny 16x16 and 32x32 browser tabs
        resized = resized.filter(ImageFilter.UnsharpMask(radius=1.0, percent=150, threshold=2))
    generated_images[s] = resized

    # Save to public/brand/icons/
    resized.save(os.path.join(icons_dir, f'favicon-{s}x{s}.png'), 'PNG')
    if s == 180:
        resized.save(os.path.join(icons_dir, 'apple-touch-icon.png'), 'PNG')
        resized.save(os.path.join(base_dir, 'apple-touch-icon.png'), 'PNG')
    elif s == 192:
        resized.save(os.path.join(icons_dir, 'android-chrome-192x192.png'), 'PNG')
    elif s == 512:
        resized.save(os.path.join(icons_dir, 'android-chrome-512x512.png'), 'PNG')
        resized.save(os.path.join(icons_dir, 'maskable-icon-512x512.png'), 'PNG')
        resized.save(os.path.join(icons_dir, 'icon-512x512.png'), 'PNG')

# Save multi-resolution favicon.ico containing 16, 24, 32, 48, 64
ico_layers = [generated_images[16], generated_images[24], generated_images[32], generated_images[48], generated_images[64]]
ico_path_brand = os.path.join(icons_dir, 'favicon.ico')
ico_path_root = os.path.join(base_dir, 'favicon.ico')
ico_layers[0].save(ico_path_brand, format='ICO', sizes=[(16,16), (24,24), (32,32), (48,48), (64,64)], append_images=ico_layers[1:])
shutil.copy2(ico_path_brand, ico_path_root)

# Save root fallback PNGs
shutil.copy2(os.path.join(icons_dir, 'favicon-32x32.png'), os.path.join(base_dir, 'favicon-32x32.png'))
shutil.copy2(os.path.join(icons_dir, 'favicon-16x16.png'), os.path.join(base_dir, 'favicon-16x16.png'))
shutil.copy2(os.path.join(icons_dir, 'favicon-32x32.png'), os.path.join(base_dir, 'favicon.png'))

# Generate an SVG favicon embedding the high-resolution reference artwork
# so browsers requesting image/svg+xml render the reference artwork directly
with open(os.path.join(icons_dir, 'favicon-128x128.png'), 'rb') as f:
    b64_img = base64.b64encode(f.read()).decode('utf-8')

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <image href="data:image/png;base64,{b64_img}" width="512" height="512" preserveAspectRatio="xMidYMid meet" />
</svg>'''

with open(os.path.join(icons_dir, 'favicon.svg'), 'w', encoding='utf-8') as f:
    f.write(svg_content)
shutil.copy2(os.path.join(icons_dir, 'favicon.svg'), os.path.join(base_dir, 'favicon.svg'))

# Copy all alternative reference styles into public/brand/icons/styles/
for style_name in ['lettermark', 'ringed_planet', 'milky_way', 'nebula']:
    src_file = os.path.join(icons_dir, f'{style_name}_perfect.png')
    if os.path.exists(src_file):
        im_style = Image.open(src_file).convert('RGBA')
        im_style.resize((256, 256), Image.Resampling.LANCZOS).save(os.path.join(styles_dir, f'{style_name}-256x256.png'))
        im_style.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(styles_dir, f'{style_name}-32x32.png'))

print("[SUCCESS] Favicon suite successfully regenerated from the exact reference image artwork!")
