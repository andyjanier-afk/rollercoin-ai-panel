import test from 'node:test';
import assert from 'node:assert/strict';
import { validarEnlaceOneDrive, tokenCompartido } from '../src/onedriveCompartido.js';

test('acepta un enlace compartido de OneDrive personal', () => {
  const url='https://onedrive.live.com/:x:/g/personal/12345/ABCDEFGHIJKLMNOP?rtime=x';
  assert.equal(validarEnlaceOneDrive(url),url);
  const token=tokenCompartido(url);
  assert.ok(token.startsWith('u!'));
  const raw=token.slice(2).replace(/-/g,'+').replace(/_/g,'/');
  assert.equal(Buffer.from(raw,'base64').toString('utf8'),url);
});

test('acepta enlaces abreviados y empresariales seguros', () => {
  assert.equal(validarEnlaceOneDrive('https://1drv.ms/x/s!abcdef'), 'https://1drv.ms/x/s!abcdef');
  assert.equal(validarEnlaceOneDrive('https://empresa.sharepoint.com/:x:/s/archivo'), 'https://empresa.sharepoint.com/:x:/s/archivo');
});

test('rechaza URL no segura o de un dominio parecido', () => {
  for(const url of [
    'http://onedrive.live.com/file',
    'https://onedrive.live.com.evil.example/x',
    'https://evil.example/',
    'javascript:alert(1)',
    '',
    'https://user:secret@onedrive.live.com/file',
  ])assert.throws(()=>validarEnlaceOneDrive(url));
});
