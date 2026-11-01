const fs=require('node:fs'),assert=require('node:assert/strict'),P=require('../pitch-core.js');
const file=fs.readFileSync(__dirname+'/../samples/test-sa-ri-ga.wav');
assert.equal(file.toString('ascii',0,4),'RIFF');
const rate=file.readUInt32LE(24),channels=file.readUInt16LE(22),bits=file.readUInt16LE(34);
assert.equal(channels,1);assert.equal(bits,16);
const dataOffset=file.indexOf('data',36)+8;
const samples=new Float32Array((file.length-dataOffset)/2);
for(let i=0;i<samples.length;i++)samples[i]=file.readInt16LE(dataOffset+i*2)/32768;
const out=[];const win=2048,hop=Math.round(rate*.075);
for(let i=0;i+win<samples.length;i+=hop){const d=P.yinDetail(samples.subarray(i,i+win),rate);out.push({t:i/rate,hz:d.hz,clarity:d.clarity});}
const smooth=P.smoothPitchFrames(out),sa=P.tonicFromFirst(smooth);
assert(sa&&sa>150&&sa<350,`sa=${sa}`);
const segments=P.segmentSwaras(smooth,sa,'mayamalavagowla');
const notes=segments.map(n=>n.label);
console.log('BUNDLED WAV', {sa:sa.toFixed(1),notes,quality:P.assess(smooth,segments,sa,'mayamalavagowla')});
assert.deepEqual(notes,['Sa','Ri','Ga','Sa','Ri','Ga','Sa','Ri','Ga']);
