import { promises as fs } from 'fs';
import path from 'path';

const root = path.resolve(new URL('.', import.meta.url).pathname, '..');
const imgDir = path.join(root, 'img', 'charms');
const dataDir = path.join(root, 'data');
const outFile = path.join(dataDir, 'charms.json');

const regex = /^charm-(\d{2})(?:-(front|back))?\.(png|jpg|jpeg|webp)$/i;

async function generate(){
  const files = await fs.readdir(imgDir);
  const map = new Map();
  for(const file of files){
    const m = file.match(regex);
    if(!m) continue;
    const num = m[1];
    const side = m[2] || 'front';
    const id = `charm-${num}`;
    const obj = map.get(num) || { id, name: `Charm ${num}`, category: 'Charms', tags: [], color: 'Multicolor', material: 'Esmalte' };
    const relPath = path.posix.join('img/charms', file);
    if(side === 'back') obj.imgBack = relPath;
    else obj.imgFront = relPath;
    map.set(num, obj);
  }
  const charms = Array.from(map.keys()).sort().map(num => {
    const c = map.get(num);
    if(!c.imgBack) c.imgBack = c.imgFront;
    c.stock = randInt(6,20);
    c.badge = 'Descuento';
    c.discountPercent = randInt(15,40);
    c.price = randInt(30,125);
    c.priceOriginal = Math.round(c.price / (1 - c.discountPercent/100));
    return c;
  }).sort((a,b)=>a.id.localeCompare(b.id));
  await fs.mkdir(dataDir, {recursive:true});
  await fs.writeFile(outFile, JSON.stringify(charms,null,2));
  console.log(`Catalogo generado con ${charms.length} charms en ${outFile}`);
}

function randInt(min,max){
  return Math.floor(Math.random()*(max-min+1))+min;
}

generate().catch(err=>{console.error('Error generando catálogo',err); process.exit(1);});
