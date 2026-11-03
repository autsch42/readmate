import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sandbox=await fs.mkdtemp(path.join(os.tmpdir(),'readmate-share-test-'));
const script=path.join(root,'scripts/render-share-cards.mjs');
let checks=0;
const sample={title:'虚构阅读测试',cards:[{kind:'reader_quote',text:'也许问题还需要慢慢想。',source:{work:'《虚构刊物》',article:'《示例篇目》'},evidence:{text:'我今天想到：也许问题还需要慢慢想。还没有答案。',locator:'PRIVATE-LOCATOR-ONLY'}}]};
async function run(name,input=sample,extra=[],out=path.join(sandbox,name)) {
  const source=path.join(sandbox,name+'.json');await fs.writeFile(source,JSON.stringify(input));
  const result=spawnSync(process.execPath,[script,'--input',source,'--output',out,...extra],{encoding:'utf8'});
  return {...result,out};
}
try {
  const good=await run('good');assert.equal(good.status,0,good.stderr);
  const html=await fs.readFile(path.join(good.out,'cards/01.html'),'utf8');
  assert.ok(html.includes('也许问题还需要慢慢想。'));assert.ok(html.includes('《示例篇目》'));
  assert.ok(!html.includes('PRIVATE-LOCATOR-ONLY'));assert.ok(!html.includes('我今天想到：'));
  assert.ok(!html.includes('读者原话'));assert.ok(!html.includes('读这篇时的感想'));
  const manifest=JSON.parse(await fs.readFile(path.join(good.out,'private-manifest.json'),'utf8'));
  assert.equal(manifest.png_status,'not_requested');assert.equal(manifest.cards[0].evidence.locator,'PRIVATE-LOCATOR-ONLY');checks++;
  assert.equal(manifest.cards[0].kind,'reader_quote');

  const injection=structuredClone(sample);injection.cards[0].source.article='<script>alert("x")</script>';
  const escaped=await run('escape',injection);assert.equal(escaped.status,0,escaped.stderr);
  const escapedHTML=await fs.readFile(path.join(escaped.out,'cards/01.html'),'utf8');
  assert.ok(!escapedHTML.includes('<script>alert('));assert.ok(escapedHTML.includes('&lt;script&gt;'));checks++;

  const altered=structuredClone(sample);altered.cards[0].text='问题已经完全想清楚了。';
  const mismatch=await run('mismatch',altered);assert.equal(mismatch.status,1);
  await assert.rejects(fs.stat(mismatch.out),{code:'ENOENT'});checks++;

  const missing=structuredClone(sample);delete missing.cards[0].source.article;
  assert.equal((await run('missing-source',missing)).status,1);checks++;

  const tooLong=structuredClone(sample);tooLong.cards[0].text='字'.repeat(221);
  assert.equal((await run('too-long',tooLong)).status,1);checks++;

  const existing=path.join(sandbox,'existing');await fs.mkdir(existing);await fs.writeFile(path.join(existing,'keep.txt'),'keep');
  assert.equal((await run('existing-input',sample,[],existing)).status,1);
  assert.equal(await fs.readFile(path.join(existing,'keep.txt'),'utf8'),'keep');checks++;

  const linked=path.join(sandbox,'skill-link');await fs.symlink(root,linked);
  const badPath=await run('inside-skill',sample,[],path.join(linked,'must-not-create'));
  assert.equal(badPath.status,1);await assert.rejects(fs.stat(path.join(root,'must-not-create')),{code:'ENOENT'});checks++;

  const failed=await run('missing-png',sample,['--png','--playwright-module',path.join(sandbox,'not-installed.mjs')]);
  assert.equal(failed.status,1);assert.ok(await fs.stat(path.join(failed.out,'preview.html')));
  assert.equal(JSON.parse(await fs.readFile(path.join(failed.out,'private-manifest.json'),'utf8')).png_status,'failed');
  await assert.rejects(fs.stat(path.join(failed.out,'images/01.png')),{code:'ENOENT'});checks++;

  if(process.env.READMATE_TEST_PLAYWRIGHT_MODULE) {
    const overflow=structuredClone(sample);overflow.cards[0].text='字'.repeat(210);overflow.cards[0].evidence.text=overflow.cards[0].text;
    const badLayout=await run('overflow',overflow,['--png','--playwright-module',process.env.READMATE_TEST_PLAYWRIGHT_MODULE,'--channel','chrome']);
    assert.equal(badLayout.status,1);assert.match(badLayout.stderr,/排版溢出/);
    await assert.rejects(fs.stat(path.join(badLayout.out,'images/01.png')),{code:'ENOENT'});checks++;
  }
  console.log(`${checks}项行为检查通过（虚构资料；不是宿主安装/发布验收）`);
} finally {await fs.rm(sandbox,{recursive:true,force:true});}
