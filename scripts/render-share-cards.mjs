#!/usr/bin/env node
// Experimental opt-in renderer; Readmate's default design route uses a professional design skill.
// No network or dependencies for HTML. PNG export uses an existing Playwright installation.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const labels = {
  source_quote: '原文摘录', reader_quote: '读者原话',
  reader_paraphrase: '读者观点整理', ai_summary: 'AI 归纳',
};
const styles = new Set(['editorial', 'minimal', 'night']);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const compact = value => value.replace(/\s+/gu, '');
const text = (value, label) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} 必须是非空文字`);
  return value.trim();
};
function options(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (key === '--help' || key === '--png') result[key.slice(2)] = true;
    else if (['--input', '--output', '--style', '--playwright-module', '--channel'].includes(key)) {
      if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw new Error(`缺少 ${key} 参数`);
      result[key.slice(2)] = argv[++i];
    } else throw new Error(`未知参数 ${key}`);
  }
  return result;
}
function validate(input, style) {
  const title = text(input.title, 'title');
  if (!styles.has(style)) throw new Error('style 必须是 editorial / minimal / night');
  if (!Array.isArray(input.cards) || !input.cards.length || input.cards.length > 20) throw new Error('cards 需要1—20张');
  const cards = input.cards.map((card, index) => {
    const label = `卡片${index + 1}`;
    if (!Object.hasOwn(labels, card.kind)) throw new Error(`${label} 缺少有效kind`);
    const quote = text(card.text, `${label}.text`);
    if ([...quote].length > 220) throw new Error(`${label} 太长，请拆卡（最多220字符，实际仍须检查布局）`);
    const source = card.source || {};
    text(source.work, `${label}.source.work`);
    text(source.article, `${label}.source.article`);
    for (const key of ['edition', 'author', 'location']) {
      if (source[key] != null && typeof source[key] !== 'string') throw new Error(`${label}.source.${key} 必须是文字`);
    }
    text(card.evidence?.text, `${label}.evidence.text`);
    text(card.evidence?.locator, `${label}.evidence.locator`);
    if (['source_quote', 'reader_quote'].includes(card.kind) && !compact(card.evidence.text).includes(compact(quote))) {
      throw new Error(`${label} 引文不是证据中的连续原句；改写请改用整理类型`);
    }
    return {...card, text: quote, source};
  });
  return {title, style, cards};
}

const css = `
*{box-sizing:border-box}html,body{margin:0;padding:0}body{background:#dedbd5;color:#292720}
.card{width:1080px;height:1440px;padding:82px 88px 72px;display:flex;flex-direction:column;
position:relative;overflow:hidden;background:var(--paper);color:var(--ink);font-family:"PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif;
--paper:#f7f3e9;--ink:#2e302a;--muted:#6f7065;--accent:#ae4835;--line:#c8c3b5}
.masthead{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid var(--line);padding-bottom:25px;gap:24px}
.brand{font:500 22px/1.4 Georgia,serif;letter-spacing:4px}.count{font-size:22px;letter-spacing:2px;color:var(--muted)}
.reading{margin-top:42px;font-size:29px;line-height:1.6;letter-spacing:1px;overflow-wrap:anywhere}
.edition{margin-top:7px;font-size:23px;color:var(--muted)}
.main{flex:1;display:flex;flex-direction:column;justify-content:center;min-height:0;padding:48px 0 60px}
.badge{align-self:flex-start;font-size:23px;line-height:1.4;padding:9px 16px;border:1px solid var(--accent);color:var(--accent);margin-bottom:34px;letter-spacing:2px}
.quote{margin:0;font:500 66px/1.65 "Songti SC","Noto Serif CJK SC",serif;letter-spacing:1px;white-space:pre-wrap;overflow-wrap:anywhere;text-wrap:pretty}
.quote.long{font-size:54px;line-height:1.58}.quote.medium{font-size:60px}
.bottom{border-top:2px solid var(--line);padding-top:28px;flex-shrink:0}
.relation{color:var(--accent);font-size:23px;line-height:1.5;margin-bottom:11px}
.article{font-size:30px;line-height:1.55;font-weight:600;overflow-wrap:anywhere}
.detail{color:var(--muted);font-size:22px;line-height:1.6;margin-top:14px;overflow-wrap:anywhere}
.end{display:flex;justify-content:space-between;margin-top:32px;font-size:19px;letter-spacing:3px;color:var(--muted)}
.minimal{--paper:#edf1e9;--ink:#253b33;--muted:#5c7065;--accent:#91603e;--line:#b9c8bd}
.minimal .quote{font-family:"PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif;font-weight:600;line-height:1.57;letter-spacing:0}
.minimal .badge{border:0;border-left:5px solid var(--accent);padding-left:20px}
.night{--paper:#202b2c;--ink:#f7f1e4;--muted:#bdc9c3;--accent:#e6b77e;--line:#52625f}
.night .badge{border:0;padding:0}.night .main{border-left:2px solid var(--accent);padding-left:40px;margin:60px 0}
.gallery{padding:40px;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:28px;max-width:1500px;margin:auto}
.preview{width:100%;aspect-ratio:3/4;border:0;background:#fff}.intro{padding:36px 40px 0;font:16px/1.6 system-ui}.intro h1{font-size:25px;margin:0 0 8px}
`;
function cardHTML(card, i, total, style) {
  const s = card.source;
  const length = [...card.text].length;
  const size = length > 120 ? 'long' : length > 78 ? 'medium' : '';
  return `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=1080"><title>${escape(s.article)}</title><style>${css}</style><body>
<article class="card ${style}"><header class="masthead"><div class="brand">READING NOTES</div><div class="count">${String(i+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}</div></header>
<div class="reading">${escape(s.work)}</div>${s.edition ? `<div class="edition">${escape(s.edition)}</div>` : ''}
<section class="main"><p class="quote ${size}">${escape(card.text)}</p></section>
<footer class="bottom"><div class="article">${escape(s.article)}</div></footer></article></body></html>`;
}
async function exportPNGs(pack, out, opts) {
  let pw;
  try {
    pw = opts['playwright-module'] ? await import(pathToFileURL(path.resolve(opts['playwright-module'])).href) : await import('playwright');
  } catch {
    throw new Error('PNG未生成：找不到现有Playwright；HTML已保留。可指定 --playwright-module，不会自动安装。');
  }
  const browser = await pw.chromium.launch({headless:true, ...(opts.channel ? {channel:opts.channel} : {})});
  try {
    const page = await browser.newPage({viewport:{width:1080,height:1440},deviceScaleFactor:1});
    await fs.mkdir(path.join(out, 'images'));
    for (let i=0;i<pack.cards.length;i++) {
      const filename = `${String(i+1).padStart(2,'0')}`;
      await page.goto(pathToFileURL(path.join(out,'cards',`${filename}.html`)).href);
      await page.evaluate(() => document.fonts.ready);
      const layout = await page.evaluate(() => {
        const card=document.querySelector('.card'), main=document.querySelector('.main'), quote=document.querySelector('.quote'), footer=document.querySelector('.bottom');
        const rect=card.getBoundingClientRect(), mr=main.getBoundingClientRect(), qr=quote.getBoundingClientRect(), fr=footer.getBoundingClientRect();
        const nodes=[...card.querySelectorAll('*')];
        return {width:rect.width,height:rect.height,ok:card.scrollHeight<=card.clientHeight && nodes.every(n=>n.scrollWidth<=n.clientWidth+1) && qr.bottom<=mr.bottom && qr.top>=mr.top && qr.bottom+20<=fr.top && fr.bottom<=rect.bottom-45};
      });
      if (!layout.ok) throw new Error(`卡片${i+1}排版溢出，请拆卡或缩短整理文案；未导出这张PNG`);
      await page.locator('.card').screenshot({path:path.join(out,'images',`${filename}.png`)});
    }
  } finally {await browser.close();}
}
async function main() {
  const opts=options(process.argv.slice(2));
  if (opts.help) {
    console.log('实验模板：仅在明确选择时使用；Readmate默认优先专业设计Skill。\nnode render-share-cards.mjs --input cards.json --output /private/output [--style editorial|minimal|night] [--png] [--playwright-module /path/to/playwright/index.mjs] [--channel chrome]\nHTML无需依赖；PNG需现有Playwright及浏览器。输出目录须尚不存在，且在Skill包之外。');
    return;
  }
  if (!opts.input || !opts.output) throw new Error('需要 --input 和 --output；详见 --help');
  const input=JSON.parse(await fs.readFile(path.resolve(opts.input),'utf8'));
  const pack=validate(input,opts.style || input.style || 'editorial');
  const out=path.resolve(opts.output);
  const ancestor=await fs.realpath(await nearestExisting(path.dirname(out)));
  const physicalRoot=await fs.realpath(skillRoot);
  const inside = p => p===physicalRoot || p.startsWith(physicalRoot+path.sep);
  if (inside(out) || inside(ancestor)) throw new Error('私人卡片输出必须放在Skill包之外');
  await fs.mkdir(path.dirname(out),{recursive:true});
  await fs.mkdir(out); // Exclusive: do not mix old images into a new pack.
  await fs.mkdir(path.join(out,'cards'));
  const manifest={schema_version:1,title:pack.title,style:pack.style,canvas:{width:1080,height:1440},created_at:new Date().toISOString(),png_status:opts.png?'pending':'not_requested',cards:pack.cards};
  const manifestPath=path.join(out,'private-manifest.json');
  await fs.writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
  for (let i=0;i<pack.cards.length;i++) await fs.writeFile(path.join(out,'cards',`${String(i+1).padStart(2,'0')}.html`),cardHTML(pack.cards[i],i,pack.cards.length,pack.style));
  const frames=pack.cards.map((_,i)=>`<iframe class="preview" title="卡片${i+1}" src="cards/${String(i+1).padStart(2,'0')}.html" scrolling="no"></iframe>`).join('');
  const preview=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escape(pack.title)}</title><style>${css}</style><body><header class="intro"><h1>${escape(pack.title)}</h1><div>样式：${pack.style} · 分享使用images中的PNG。私有回查清单不随图分享。</div></header><main class="gallery">${frames}</main><script>for(const f of document.querySelectorAll('iframe')){function fit(){try{const s=f.clientWidth/1080;const b=f.contentDocument.body;b.style.width='1080px';b.style.transformOrigin='top left';b.style.transform='scale('+s+')'}catch{}}f.addEventListener('load',fit);new ResizeObserver(fit).observe(f)}</script></body></html>`;
  await fs.writeFile(path.join(out,'preview.html'),preview);
  try {
    if (opts.png) {await exportPNGs(pack,out,opts);manifest.png_status='complete';}
  } catch(error) {
    manifest.png_status='failed';manifest.png_error=error.message;throw error;
  } finally {await fs.writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');}
  console.log(JSON.stringify({output:out,html_cards:pack.cards.length,png_status:manifest.png_status,preview:path.join(out,'preview.html')},null,2));
}
async function nearestExisting(dir) {
  try {await fs.stat(dir);return dir;} catch(error) {
    if(error.code!=='ENOENT'||path.dirname(dir)===dir) throw error;
    return nearestExisting(path.dirname(dir));
  }
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
