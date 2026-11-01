const assert=require('node:assert/strict');
const P=require('../pitch-core.js');
function signal(f,sr=44100,n=4096,noise=0,harmonics=false){
  const a=new Float32Array(n);let seed=10273;
  for(let i=0;i<n;i++){
    seed=(seed*1664525+1013904223)>>>0;
    const rand=seed/4294967296-.5,t=i/sr;
    a[i]=.55*Math.sin(2*Math.PI*f*t)+(harmonics?.19*Math.sin(2*Math.PI*f*2*t):0)+(harmonics?.11*Math.sin(2*Math.PI*f*3*t):0)+rand*noise;
  }
  return a;
}
const metrics=[];
for(const f of [110,146.83,196,220,240,269.4,299.7,360,440,480,660,740]){
  const d=P.yinDetail(signal(f,44100,4096,.04,true),44100);
  const cents=Math.abs(1200*Math.log2(d.hz/f));
  metrics.push({expected:f,estimated:d.hz?.toFixed(2),errorCents:cents.toFixed(2),clarity:d.clarity.toFixed(3)});
  assert(d.hz,`${f}: missing estimate`);
  assert(cents<18,`${f}: ${cents}c off`);
}
assert.equal(P.yinDetail(new Float32Array(4096),44100).hz,null);
for(const s of ['mayamalavagowla','shankarabharanam','kharaharapriya'])assert(P.SCALES[s]);
const Sa=240;
const ri1=240*Math.pow(2,1/12),ri2=240*Math.pow(2,2/12);
assert.equal(P.findSwara(ri1,Sa,'mayamalavagowla').name,'Ri');
assert.equal(P.findSwara(ri2,Sa,'shankarabharanam').name,'Ri');
assert(Math.abs(P.findSwara(ri2,Sa,'mayamalavagowla').cents)>75,'Scale differences should be measurable');
const pattern=[0,1,4,0,1,4,0,1,4],raw=[];
for(let k=0;k<pattern.length;k++){
  const h=240*Math.pow(2,pattern[k]/12);
  for(let j=0;j<7;j++)raw.push({t:k*.52+(j+.5)*.52/7,hz:h*(1+.002*Math.sin(j))});
}
const smooth=P.smoothPitchFrames(raw);const tonic=P.tonicFromFirst(smooth);
assert(Math.abs(tonic-240)<1,`Bad tonic: ${tonic}`);
const segments=P.segmentSwaras(smooth,tonic,'mayamalavagowla');
assert.deepEqual(segments.map(s=>s.label),['Sa','Ri','Ga','Sa','Ri','Ga','Sa','Ri','Ga']);
const q=P.assess(smooth,segments,tonic,'mayamalavagowla');
assert(q.coverage>.95&&q.nearScale>.95,`Quality failed: ${JSON.stringify(q)}`);
console.log('PASS: synthetic voiced tones, silent input, scale reference, tonic, 9-note Sa-Ri-Ga, quality.');
console.table(metrics);
