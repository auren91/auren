import { promises as fs } from 'fs';
import path from 'path';

const root = path.resolve(new URL('.', import.meta.url).pathname, '..');
const imgDir = path.join(root, 'img', 'ropa');
const dataDir = path.join(root, 'data');
const outFile = path.join(dataDir, 'ropa.json');

const regex = /^ropa-\s?\((\d+)\)\.(jpe?g|png|webp)$/i;

function rand(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function dominantFromBuffer(buf){
  const len = Math.min(buf.length, 10000);
  let sum = 0;
  for(let i=0;i<len;i++) sum += buf[i];
  const avg = sum / len;
  if(avg > 170) return 'claro';
  if(avg < 85) return 'oscuro';
  return 'neutro';
}

async function generate(){
  const files = await fs.readdir(imgDir);
  const items = [];
  for(const file of files){
    const m = file.match(regex);
    if(!m) continue;
    const num = m[1].padStart(3, '0');
    const id = `ropa-${num}`;
    const imgPath = path.posix.join('img/ropa', file);
    const price = rand(199, 899);
    const discountPercent = rand(10, 35);
    const priceOriginal = Math.round(price / (1 - discountPercent/100));
    const buf = await fs.readFile(path.join(imgDir, file));
    const dominant = dominantFromBuffer(buf);
    items.push({
      id,
      name: `Prenda ${num}`,
      img: imgPath,
      thumb: imgPath,
      price,
      priceOriginal,
      discountPercent,
      tags: [],
      dominant,
      palette: [],
      createdAt: new Date().toISOString()
    });
  }
  items.sort((a,b)=>a.id.localeCompare(b.id));
  await fs.mkdir(dataDir, {recursive: true});
  await fs.writeFile(outFile, JSON.stringify(items, null, 2));
  console.log(`Catálogo de ropa con ${items.length} elementos guardado en ${outFile}`);
}

generate().catch(err => { console.error('Error generando catálogo', err); process.exit(1); });
