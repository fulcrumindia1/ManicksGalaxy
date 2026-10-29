import os
import io
import urllib.request
import urllib.parse
import json
from PIL import Image

TARGETS = [
    {
        'slug': 'ganymede',
        'title': 'File:Ganymede map by Askaniy.png',
        'target_width': 3840,
        'has_4k': True
    },
    {
        'slug': 'callisto',
        'title': 'File:Callisto map by Askaniy.png',
        'target_width': 3840,
        'has_4k': True
    },
    {
        'slug': 'enceladus',
        'title': 'File:Color map of Enceladus PIA18435 Nov. 2014.jpg',
        'target_width': 3840,
        'has_4k': True
    },
    {
        'slug': 'triton',
        'title': 'File:Triton map no grid.jpg',
        'target_width': 3840,
        'has_4k': True
    },
    {
        'slug': 'charon',
        'title': 'File:Charon map iau1803c.jpg',
        'target_width': 3840,
        'has_4k': True
    },
    {
        'slug': 'ceres',
        'title': 'File:PIA19606-Ceres-Dawn-GlobalMap-Unannotated-20150728.jpg',
        'target_width': 3281,
        'has_4k': False
    },
    {
        'slug': 'vesta',
        'title': 'File:589450main pia14703-full full.jpg',
        'target_width': 2137,
        'has_4k': False
    },
    {
        'slug': 'phobos',
        'title': 'File:Phobos Viking Mosaic DLRcontrol 7200.jpg',
        'target_width': 3840,
        'has_4k': False
    },
    {
        'slug': 'deimos',
        'title': 'File:Deimos color map.jpg',
        'target_width': 1264,
        'has_4k': False
    }
]

HEADERS = {
    'User-Agent': 'ManicksGalaxyBot/1.0 (scientific-education; mailto:admin@manicksgalaxy.edu)'
}

def get_download_url(title, target_width):
    api_url = f"https://commons.wikimedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=imageinfo&iiprop=url&iiurlwidth={target_width}&format=json"
    req = urllib.request.Request(api_url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        pages = data['query']['pages']
        for pid in pages:
            info = pages[pid].get('imageinfo', [{}])[0]
            thumb = info.get('thumburl')
            orig = info.get('url')
            return thumb if thumb else orig
    return None

def main():
    base_dir = os.path.join(os.getcwd(), 'public', 'assets', 'planets')
    os.makedirs(base_dir, exist_ok=True)

    for item in TARGETS:
        slug = item['slug']
        title = item['title']
        slug_dir = os.path.join(base_dir, slug)
        os.makedirs(slug_dir, exist_ok=True)

        print(f"\n--- Processing {slug.upper()} ({title}) ---")
        dl_url = get_download_url(title, item['target_width'])
        print(f"URL: {dl_url}")

        req = urllib.request.Request(dl_url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=45) as resp:
            img_bytes = resp.read()

        print(f"Downloaded {len(img_bytes)} bytes")
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        w, h = img.size
        print(f"Original size: {w}x{h}")

        # Equirectangular 2k: 2048 x 1024
        img_2k = img.resize((2048, 1024), Image.Resampling.LANCZOS)
        path_2k = os.path.join(slug_dir, f"{slug}_2k.jpg")
        img_2k.save(path_2k, 'JPEG', quality=90, optimize=True)
        print(f"Saved 2K: {path_2k} ({os.path.getsize(path_2k)} bytes)")

        # Optional 4k: 4096 x 2048
        if item['has_4k']:
            img_4k = img.resize((4096, 2048), Image.Resampling.LANCZOS)
            path_4k = os.path.join(slug_dir, f"{slug}_4k.jpg")
            img_4k.save(path_4k, 'JPEG', quality=90, optimize=True)
            print(f"Saved 4K: {path_4k} ({os.path.getsize(path_4k)} bytes)")

    print("\n[SUCCESS] All Phase C celestial body textures downloaded and processed!")

if __name__ == '__main__':
    main()

