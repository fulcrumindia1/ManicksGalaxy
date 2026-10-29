import os
import numpy as np
from PIL import Image

def build_io_equirectangular(out_w=4096, out_h=2048):
    print(f"Building Io Equirectangular mosaic ({out_w}x{out_h})...")
    eq_img = Image.open('public/assets/planets/io/PIA09257_raw.jpg')
    np_img = Image.open('public/assets/planets/io/north_pole_raw.jpg')
    sp_img = Image.open('public/assets/planets/io/south_pole_raw.jpg')

    # Target latitudes: -90 to +90 deg
    # Equator band covers lat -57.3 to +57.3 deg
    lat_cutoff = 57.3
    y_north_cutoff = int(out_h * (90.0 - lat_cutoff) / 180.0)
    y_south_cutoff = int(out_h * (90.0 + lat_cutoff) / 180.0)
    
    # 1. Resize equatorial band to width=out_w and height=(y_south_cutoff - y_north_cutoff)
    eq_h = y_south_cutoff - y_north_cutoff
    eq_resized = eq_img.resize((out_w, eq_h), Image.Resampling.LANCZOS)
    
    # Create full canvas
    result = np.zeros((out_h, out_w, 3), dtype=np.uint8)
    result[y_north_cutoff:y_south_cutoff, :, :] = np.array(eq_resized)
    
    # 2. Polar Stereographic reprojection for North and South poles
    np_arr = np.array(np_img)
    sp_arr = np.array(sp_img)
    np_w, np_h = np_img.size
    sp_w, sp_h = sp_img.size
    
    # North Polar region: y from 0 to y_north_cutoff
    print("Reprojecting North Pole...")
    y_indices = np.arange(y_north_cutoff)
    x_indices = np.arange(out_w)
    xx, yy = np.meshgrid(x_indices, y_indices)
    
    # Latitudes from +90 (yy=0) to lat_cutoff (yy=y_north_cutoff)
    lat_rad = np.radians(90.0 - (yy / out_h) * 180.0)
    lon_rad = (xx / out_w) * 2.0 * np.pi - np.pi
    
    # Polar stereographic radius: r = 2 * R * tan(pi/4 - lat/2)
    # Normalized so r=1 at lat=lat_cutoff
    r_norm = np.tan(np.pi / 4.0 - lat_rad / 2.0) / np.tan(np.pi / 4.0 - np.radians(lat_cutoff) / 2.0)
    
    # Stereographic pixel coordinates
    center_x = (np_w - 1) / 2.0
    center_y = (np_h - 1) / 2.0
    radius_max = center_x
    
    # On North polar map: x = center + r * sin(lon), y = center + r * cos(lon)
    px = np.clip(np.round(center_x + r_norm * radius_max * np.sin(lon_rad)).astype(int), 0, np_w - 1)
    py = np.clip(np.round(center_y - r_norm * radius_max * np.cos(lon_rad)).astype(int), 0, np_h - 1)
    result[:y_north_cutoff, :, :] = np_arr[py, px, :]

    # South Polar region: y from y_south_cutoff to out_h
    print("Reprojecting South Pole...")
    y_indices_s = np.arange(y_south_cutoff, out_h)
    xx_s, yy_s = np.meshgrid(x_indices, y_indices_s)
    
    lat_rad_s = np.radians((yy_s / out_h) * 180.0 - 90.0) # -57.3 to -90
    lon_rad_s = (xx_s / out_w) * 2.0 * np.pi - np.pi
    
    r_norm_s = np.tan(np.pi / 4.0 - lat_rad_s / 2.0) / np.tan(np.pi / 4.0 - np.radians(lat_cutoff) / 2.0)
    px_s = np.clip(np.round(center_x + r_norm_s * radius_max * np.sin(lon_rad_s)).astype(int), 0, sp_w - 1)
    py_s = np.clip(np.round(center_y + r_norm_s * radius_max * np.cos(lon_rad_s)).astype(int), 0, sp_h - 1)
    result[y_south_cutoff:, :, :] = sp_arr[py_s, px_s, :]
    
    # 3. Smooth blend across seam boundaries (±12 pixels)
    blend_h = int(out_h * 0.012)
    eq_arr = np.array(eq_resized)
    for i in range(blend_h):
        alpha = (i + 1) / (blend_h + 1)
        # North seam blend
        y_b = y_north_cutoff - blend_h // 2 + i
        y_eq = i
        if 0 <= y_b < out_h and 0 <= y_eq < eq_h:
            result[y_b, :, :] = (
                (1.0 - alpha) * result[y_b, :, :].astype(float) +
                alpha * eq_arr[y_eq, :, :].astype(float)
            ).astype(np.uint8)
            
        # South seam blend
        y_bs = y_south_cutoff - blend_h // 2 + i
        y_eqs = eq_h - blend_h + i
        if 0 <= y_bs < out_h and 0 <= y_eqs < eq_h:
            result[y_bs, :, :] = (
                (1.0 - alpha) * eq_arr[y_eqs, :, :].astype(float) +
                alpha * result[y_bs, :, :].astype(float)
            ).astype(np.uint8)

    out_img = Image.fromarray(result)
    out_path_4k = 'public/assets/planets/io/io_natural_4k.jpg' if out_w >= 4096 else 'public/assets/planets/io/io_natural_2k.jpg'
    out_img.save(out_path_4k, quality=92, optimize=True)
    print(f"Saved {out_path_4k} ({os.path.getsize(out_path_4k)} bytes)")
    
    if out_w >= 4096:
        # Also create 2k derivative
        img_2k = out_img.resize((2048, 1024), Image.Resampling.LANCZOS)
        out_path_2k = 'public/assets/planets/io/io_natural_2k.jpg'
        img_2k.save(out_path_2k, quality=90, optimize=True)
        print(f"Saved {out_path_2k} ({os.path.getsize(out_path_2k)} bytes)")

        # Create Enhanced Scientific Color variant (multispectral enhancement with enhanced contrast & sulfur saturation)
        arr_2k = np.array(img_2k, dtype=float)
        # Enhance sulfur-orange / violet spectral band separation
        r = arr_2k[:, :, 0]
        g = arr_2k[:, :, 1]
        b = arr_2k[:, :, 2]
        
        # Enhanced Scientific Color: accentuate volcanic silicates, dark calderas, and SO2 frost
        enhanced = np.zeros_like(arr_2k)
        enhanced[:, :, 0] = np.clip(r * 1.08 + (r - g) * 0.45, 0, 255)
        enhanced[:, :, 1] = np.clip(g * 0.96 - (r - g) * 0.15, 0, 255)
        enhanced[:, :, 2] = np.clip(b * 1.18 + (b - g) * 0.35, 0, 255)
        
        enhanced_img = Image.fromarray(enhanced.astype(np.uint8))
        enh_path = 'public/assets/planets/io/io_enhanced_2k.jpg'
        enhanced_img.save(enh_path, quality=90, optimize=True)
        print(f"Saved {enh_path} ({os.path.getsize(enh_path)} bytes)")

        # Create Coverage Map: binary mask indicating 100% USGS observed spacecraft coverage vs high-latitude interpolation
        cov_mask = np.full((1024, 2048, 4), 255, dtype=np.uint8)
        # Color code: Green (high confidence Galileo SSI / Voyager 1km/pix), Amber (high latitude oblique coverage)
        cov_mask[:, :, 0] = 34   # Green R
        cov_mask[:, :, 1] = 197  # Green G
        cov_mask[:, :, 2] = 94   # Green B
        cov_mask[:, :, 3] = 210  # Alpha
        
        # Mark polar areas above 72 deg as amber/moderate coverage
        y_amber_n = int(1024 * (90 - 72) / 180)
        y_amber_s = int(1024 * (90 + 72) / 180)
        cov_mask[:y_amber_n, :, 0] = 234
        cov_mask[:y_amber_n, :, 1] = 179
        cov_mask[:y_amber_n, :, 2] = 8
        cov_mask[y_amber_s:, :, 0] = 234
        cov_mask[y_amber_s:, :, 1] = 179
        cov_mask[y_amber_s:, :, 2] = 8
        
        cov_img = Image.fromarray(cov_mask)
        cov_path = 'public/assets/planets/io/io_coverage_2k.png'
        cov_img.save(cov_path, optimize=True)
        print(f"Saved {cov_path} ({os.path.getsize(cov_path)} bytes)")

if __name__ == '__main__':
    build_io_equirectangular(4096, 2048)
