import QRCode from 'qrcode';
import {readFile,writeFile} from 'node:fs/promises';
const catalog=JSON.parse(await readFile(new URL('../src/data/supportCatalog.generated.json',import.meta.url),'utf8'));
const svg=await QRCode.toString(catalog.planUrl,{type:'svg',errorCorrectionLevel:'M',margin:4,width:256});
const target=new URL('../public/support-qr/afdian.svg',import.meta.url);
if(process.argv.includes('--check')){if(svg!==await readFile(target,'utf8'))throw Error('Afdian QR source mismatch');}else await writeFile(target,svg);
console.log('Afdian profile QR verified.');
