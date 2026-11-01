/* TĀRA musical pitch core — deterministic and independently testable.
   Pitch is not speech recognition. Frequency-to-swara mapping requires a tonic
   and a selected swara reference. Confidence is a periodicity heuristic, not a
   calibrated probability of musical correctness. */
(function(root,factory){
  const lib=factory();
  if(typeof module!=='undefined' && module.exports)module.exports=lib;
  root.TaraPitch=lib;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const NAMES=['Sa','Ri','Ga','Ma','Pa','Dha','Ni','Sa′'];
  const SCALES=Object.freeze({
    mayamalavagowla:{name:'Mayamalavagowla',semitones:[0,1,4,5,7,8,11,12]},
    shankarabharanam:{name:'Shankarabharanam',semitones:[0,2,4,5,7,9,11,12]},
    kharaharapriya:{name:'Kharaharapriya',semitones:[0,2,3,5,7,9,10,12]}
  });
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  function median(arr){if(!arr.length)return 0;const s=[...arr].sort((a,b)=>a-b),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2}
  function yinDetail(signal,sampleRate){
    const n=signal.length,minTau=Math.max(2,Math.floor(sampleRate/880)),maxTau=Math.min(Math.floor(sampleRate/85),Math.floor(n/2)-1);
    if(maxTau<=minTau||n<640)return {hz:null,clarity:0,rms:0};
    let energy=0;for(let i=0;i<n;i++)energy+=signal[i]*signal[i];
    const rms=Math.sqrt(energy/n);
    if(rms<.009)return {hz:null,clarity:0,rms};
    const len=Math.min(1400,n-maxTau-1),cmnd=new Float32Array(maxTau+1);
    if(len<160)return {hz:null,clarity:0,rms};
    let cumulative=0;
    for(let tau=1;tau<=maxTau;tau++){
      let d=0;
      for(let j=0;j<len;j++){const delta=signal[j]-signal[j+tau];d+=delta*delta}
      cumulative+=d;
      cmnd[tau]=cumulative>1e-10?d*tau/cumulative:1;
    }
    let selected=-1;
    for(let tau=minTau;tau<=maxTau;tau++){
      if(cmnd[tau]<.17){while(tau<maxTau&&cmnd[tau+1]<cmnd[tau])tau++;selected=tau;break}
    }
    if(selected<0){let lowest=minTau;for(let t=minTau+1;t<=maxTau;t++)if(cmnd[t]<cmnd[lowest])lowest=t;
      if(cmnd[lowest]>.24)return {hz:null,clarity:0,rms};selected=lowest;
    }
    let refined=selected;
    if(selected>1&&selected<maxTau){const a=cmnd[selected-1],b=cmnd[selected],c=cmnd[selected+1],d=a-2*b+c;
      if(Math.abs(d)>1e-9)refined+=clamp((a-c)/(2*d),-1,1);
    }
    const hz=sampleRate/refined,clarity=clamp(1-cmnd[selected],0,1);
    if(!(hz>=85&&hz<=880)||clarity<.76)return {hz:null,clarity,rms};
    return {hz,clarity,rms};
  }
  function pitchYIN(signal,sampleRate){return yinDetail(signal,sampleRate).hz}
  function findSwara(hz,sa,scale='mayamalavagowla'){
    if(!Number.isFinite(hz)||hz<=0||!Number.isFinite(sa)||sa<=0)return null;
    const semis=(SCALES[scale]||SCALES.mayamalavagowla).semitones;
    let best=null;
    for(let octave=-2;octave<=2;octave++)for(let i=0;i<8;i++){
      const target=sa*Math.pow(2,(semis[i]+12*octave)/12);
      const cents=1200*Math.log2(hz/target);
      if(!best||Math.abs(cents)<Math.abs(best.cents)-1e-7||
          (Math.abs(Math.abs(cents)-Math.abs(best.cents))<=1e-7&&Math.abs(octave)<Math.abs(best.oct))){
        best={name:NAMES[i],label:NAMES[i]+(octave<0?'↓':octave>0?'↑':''),i,cents,f:target,oct:octave};
      }
    }
    return best;
  }
  function tonicFromFirst(frames){
    const voiced=frames.filter(x=>Number.isFinite(x.hz)&&x.hz>90&&x.t<2.3);
    if(voiced.length<3)return null;
    const first=voiced[0],cluster=[];
    for(const f of voiced){
      if(f.t-first.t>.50)break;
      if(Math.abs(1200*Math.log2(f.hz/first.hz))<75)cluster.push(f.hz);
      else if(cluster.length>=3)break;
    }
    if(cluster.length<3)return null;
    const result=median(cluster);
    // Only infer the tonic when it is within a plausible singer range.
    return result>=100&&result<=440?result:null;
  }
  function smoothPitchFrames(raw){
    const clean=raw.map((f,i)=>{
      if(!Number.isFinite(f.hz)||f.hz<=0)return {...f,hz:null};
      const neighbors=raw.slice(Math.max(0,i-2),Math.min(raw.length,i+3))
        .filter(v=>v.hz>0&&Math.abs(v.t-f.t)<.23&&Math.abs(1200*Math.log2(v.hz/f.hz))<160)
        .map(v=>v.hz);
      return {...f,hz:neighbors.length>=2?median(neighbors):f.hz};
    });
    // Repair single-frame octave errors only when adjacent frames agree.
    for(let i=1;i<clean.length-1;i++){
      const a=clean[i-1],b=clean[i],c=clean[i+1];
      if(!a.hz||!b.hz||!c.hz||c.t-a.t>.32)continue;
      if(Math.abs(1200*Math.log2(a.hz/c.hz))>110)continue;
      if(Math.abs(1200*Math.log2(b.hz/a.hz))<700)continue;
      const corrected=[b.hz/2,b.hz*2].find(v=>Math.abs(1200*Math.log2(v/a.hz))<95);
      if(corrected)clean[i]={...b,hz:corrected};
    }
    return clean;
  }
  function segmentSwaras(frames,sa,scale='mayamalavagowla'){
    const grouped=[];
    for(const f of frames){
      if(!(f.hz>0))continue;
      const sw=findSwara(f.hz,sa,scale);
      if(!sw||Math.abs(sw.cents)>125)continue;
      const last=grouped[grouped.length-1];
      if(last&&last.label===sw.label&&f.t-last.end<=.155){last.end=f.t;last.values.push(f.hz);last.cents.push(sw.cents)}
      else grouped.push({label:sw.label,i:sw.i,start:f.t,end:f.t,values:[f.hz],cents:[sw.cents]});
    }
    return grouped.filter(s=>s.values.length>=2).map(s=>({
      label:s.label,i:s.i,start:s.start,end:s.end,frequency:median(s.values),
      deviationCents:median(s.cents.map(Math.abs)),frames:s.values.length
    }));
  }
  function assess(frames,segments,sa,scale){
    const voiced=frames.filter(f=>f.hz>0),onScale=voiced.filter(f=>{
      const note=findSwara(f.hz,sa,scale);return note&&Math.abs(note.cents)<=125;
    });
    const coverage=frames.length?voiced.length/frames.length:0;
    const nearScale=voiced.length?onScale.length/voiced.length:0;
    const rating=coverage<.3||nearScale<.52?'LOW':coverage<.55||nearScale<.72?'CHECK':'GOOD';
    return {coverage,nearScale,rating,voicedCount:voiced.length,framesCount:frames.length,events:segments.length};
  }
  return {NAMES,SCALES,median,yinDetail,pitchYIN,findSwara,tonicFromFirst,smoothPitchFrames,segmentSwaras,assess};
});
