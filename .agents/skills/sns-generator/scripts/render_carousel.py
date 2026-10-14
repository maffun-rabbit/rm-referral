import argparse,json,html,shutil
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--input',required=True,type=Path);p.add_argument('--output-dir',required=True,type=Path);a=p.parse_args()
d=json.loads(a.input.read_text());assert len(d['slides'])==8 and len(d['background_images']) in (1,8)
assert d['background_mode'] in ('ai','user')
t=(Path(__file__).resolve().parent.parent/'assets/carousel-template.html').read_text();a.output_dir.mkdir(parents=True,exist_ok=True)
for i,s in enumerate(d['slides'],1):
 bg=Path(d['background_images'][0 if len(d['background_images'])==1 else i-1]).resolve();assert bg.is_file()
 target=a.output_dir/f'slide-{i}.html'
 if target.exists():raise SystemExit('Existing HTML; choose a new branch directory')
 asset=a.output_dir/f'background-{0 if len(d["background_images"])==1 else i}.png'
 if not asset.exists():shutil.copyfile(bg,asset)
 value=t.replace("photo.src = p.get('background') || '';",'photo.src = '+json.dumps(asset.name)+';').replace("el.textContent = p.get('text') || '';",'el.textContent = '+json.dumps(s,ensure_ascii=False)+';')
 target.write_text(value)
print(json.dumps({'htmlCount':8,'next':'Native full-page browser capture at 1080x1920'},ensure_ascii=False))
