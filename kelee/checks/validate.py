"""Read-only checks for owned runtime URLs and native Surge syntax; no converter."""
from pathlib import Path
import hashlib, json, re, shutil, subprocess, tempfile

ROOT = Path(__file__).resolve().parents[2]
BASE = 'https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/'
MODULES = [ROOT/name/(name+'.sgmodule') for name in ['kelee','kelee-HTTPDNS','kelee-JDPrice']]
CLI = shutil.which('surge-cli') or '/Applications/Surge.app/Contents/Applications/surge-cli'
report = {'modules':{},'runtime_assets':{},'jq_expressions':0,'javascript_files':0}
combined = {}

def local_asset(url):
    assert url.startswith(BASE), 'Runtime resource is not owned by this repository: '+url
    relative = url[len(BASE):]
    assert '..' not in relative.split('/') and '?' not in relative and '#' not in relative
    asset = ROOT/relative
    assert asset.is_file(), 'Missing referenced file: '+relative
    report['runtime_assets'][relative] = hashlib.sha256(asset.read_bytes()).hexdigest()
    return asset

with tempfile.TemporaryDirectory(prefix='surge-kelee-check-') as temporary:
    tmp = Path(temporary)
    for module in MODULES:
        text = module.read_text()
        assert text.splitlines()[0] == '#!name='+module.stem
        defaults = {}
        for line in text.splitlines():
            if line.startswith('#!arguments='):
                defaults.update(item.split(':',1) for item in line.split('=',1)[1].split(','))
        for key,value in defaults.items(): text = text.replace('{{{'+key+'}}}',value)
        assert '{{{' not in text
        section = ''; sections = {}; script_names = []
        for line in text.splitlines():
            if line.startswith('['):
                section = line; sections.setdefault(section,[]); continue
            if not section or not line.strip() or line.startswith('#'): continue
            assert not line.startswith('FINAL,'), 'A module must not add FINAL'
            if section == '[Script]':
                script_names.append(line.split('=',1)[0].strip())
                url = re.search(r'script-path=([^,]+)',line).group(1)
                line = line.replace('script-path='+url,'script-path='+str(local_asset(url)))
            if section == '[Map Local]' and 'data-type=file' in line:
                url = re.search(r'data=([^ ]+)',line).group(1).strip('"')
                line = line.replace('data='+url,'data='+str(local_asset(url)))
            if line.startswith(('http-response-jq ','http-request-jq ')):
                expression = line.split(' ',2)[2]
                assert expression[0] in "\"'" and expression[-1] == expression[0]
                expression = expression[1:-1]
                result = subprocess.run(['jq','-n','empty | ('+expression+')'],capture_output=True,text=True)
                assert result.returncode == 0, result.stderr
                report['jq_expressions'] += 1
                for url in re.findall(r'https://raw\.githubusercontent\.com/[^"\s]+',expression): local_asset(url)
            if section == '[MITM]':
                assert line.startswith('hostname = %APPEND% ')
                line = line.replace('%APPEND% ','')
            sections[section].append(line)
        assert len(script_names) == len(set(script_names))
        for section,lines in sections.items(): combined.setdefault(section,[]).extend(lines)
        fixture = ['[General]','loglevel = notify']
        for section,lines in sections.items():
            fixture.extend([section,*lines])
            if section == '[Rule]': fixture.append('FINAL,DIRECT')
        if '[Rule]' not in sections: fixture.extend(['[Rule]','FINAL,DIRECT'])
        path = tmp/(module.stem+'.conf');path.write_text('\n'.join(fixture)+'\n')
        result = subprocess.run([CLI,'--check',str(path)],capture_output=True,text=True)
        assert result.returncode == 0, result.stdout+result.stderr
        report['modules'][module.relative_to(ROOT).as_posix()] = {'syntax':'PASS','sections':{k:len(v) for k,v in sections.items()}}

    assert len(report['runtime_assets']) == 15
    all_names = [line.split('=',1)[0].strip() for line in combined.get('[Script]',[])]
    assert len(all_names) == len(set(all_names)), 'Cross-module script name collision'
    fixture = ['[General]','loglevel = notify']
    for section,lines in combined.items():
        fixture.append(section)
        if section == '[MITM]':
            fixture.append('hostname = '+', '.join(l.split('=',1)[1].strip() for l in lines))
        else: fixture.extend(lines)
        if section == '[Rule]': fixture.append('FINAL,DIRECT')
    path = tmp/'combined.conf';path.write_text('\n'.join(fixture)+'\n')
    result = subprocess.run([CLI,'--check',str(path)],capture_output=True,text=True)
    assert result.returncode == 0, result.stdout+result.stderr
    report['combined_syntax'] = 'PASS'

for folder in ['kelee/js','kelee/resources','kelee-JDPrice/js']:
    for file in (ROOT/folder).glob('*.js'):
        result = subprocess.run(['node','--check',str(file)],capture_output=True,text=True)
        assert result.returncode == 0, result.stderr
        report['javascript_files'] += 1
for file in (ROOT/'kelee/resources').glob('*.json'): json.loads(file.read_text())
image = (ROOT/'kelee/resources/cyys1.jpg').read_bytes()
assert image.startswith(b'\xff\xd8\xff') and image.endswith(b'\xff\xd9'), 'Invalid JPEG resource'
print(json.dumps(report,ensure_ascii=False,indent=2))
