/* Math theatre. All equations derive from a measured pitch estimate OR the clearly labeled tuning model. */
(()=>{
 const $=id=>document.getElementById(id);
 const write=(id,value)=>{const n=$(id);if(n)n.textContent=value};
 const fnum=(n,d=2)=>Number(n).toFixed(d);
 const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
 const makeCurve=(cycles,offsetY)=>{
  let d='';for(let i=0;i<=320;i++){const x=16+i*668/320;const y=offsetY-30*Math.sin((i/320)*Math.PI*2*cycles);d+=(i?' L':'M')+fnum(x,1)+' '+fnum(y,1)}return d;
 };
 const svg=(ratio,isSong=false)=>{
  const c=clamp(ratio,.5,3),blue=makeCurve(2.8,104),gold=makeCurve(2.8*c,178);
  const grid=Array.from({length:15},(_,i)=>`<line x1="${i*50}" y1="12" x2="${i*50}" y2="263" stroke="#9bb6dd" stroke-opacity=".07"/>`).join('');
  return `<defs><filter id="mathSoftGlow"><feGaussianBlur stdDeviation="4"/></filter><linearGradient id="mathAqua" x2="1" y2="0"><stop stop-color="#74c6d8"/><stop offset="1" stop-color="#c7f6ff"/></linearGradient></defs>${grid}
  <line x1="15" y1="104" x2="685" y2="104" stroke="#8eaecb" stroke-opacity=".16" stroke-dasharray="4 7"/><line x1="15" y1="178" x2="685" y2="178" stroke="#d1b57c" stroke-opacity=".2" stroke-dasharray="4 7"/>
  <path d="${blue}" stroke="#77d2de" stroke-opacity=".3" stroke-width="9" filter="url(#mathSoftGlow)" fill="none"/><path d="${blue}" stroke="url(#mathAqua)" stroke-width="2.7" fill="none"/>
  <path d="${gold}" stroke="#efc787" stroke-opacity=".28" stroke-width="10" filter="url(#mathSoftGlow)" fill="none"/><path d="${gold}" stroke="#efc787" stroke-width="2.7" fill="none"/>
  <text x="22" y="50" fill="#9cc9d7" font-size="11" letter-spacing="3">SA / TONIC</text><text x="22" y="246" fill="#e4c393" font-size="11" letter-spacing="3">${isSong?'RAGA MODEL':'SELECTED PITCH'}</text>`;
 };
 function voice(s,seg){
  if(!s||!seg)return;
  const sa=Number(s.sa),hz=Number(seg.frequency),ratio=hz/sa,cents=1200*Math.log2(ratio);
  write('mathSourceTag',s.source==='sample'?'SYNTHESIZED EXAMPLE':s.source==='upload'?'ESTIMATED FROM UPLOADED AUDIO':'ESTIMATED FROM YOUR MICROPHONE');
  write('mathSwaraTag',seg.label+' / YOUR MUSICAL INTERVAL');
  write('mathEqBloom',fnum(ratio,3)+' × Sa');
  write('mathEqReal',fnum(hz,1)+' Hz ÷ '+fnum(sa,1)+' Hz = '+fnum(ratio,3));
  write('mathMetricFrequency',fnum(hz,1)+' Hz');write('mathMetricCents',fnum(cents,0)+' ¢');
  write('mathMetricPeriod',fnum(1000/hz,2)+' ms');write('mathMetricWave',fnum(343/hz,2)+' m');
  write('mathProse',`This ${s.source==='sample'?'synthesized example':'recording'} places ${seg.label} near ${fnum(hz,1)} Hz. The pitch ratio and interval are calculated from that value and Sa. The wave shapes illustrate the frequencies, slowed down so you can see them.`);
  $('mathWaveCompare').innerHTML=svg(ratio);
  write('mathDataDisclaimer',s.source==='sample'?'This is a generated demonstration, not a measured human voice. Acoustic waveforms are schematic.': 'Frequency is estimated from audio; the period, ratio and wavelength are calculated. This does not directly measure your vocal-fold motion.');
 }
 function song({note,sa,ratio,f,cents}){
  write('songMathSwara',note.n+' / '+(note.s===0?'THE TONIC':'RAGA INTERVAL'));
  $('songMathHero').innerHTML=fnum(ratio,3)+'<span>× Sa</span>';
  write('songMathDerivation',fnum(sa,0)+' × 2^('+note.s+'/12) = '+fnum(f,1)+' Hz');
  write('songMathCents',fnum(cents,0)+' cents above Sa');
  write('songMathSoundPhysics','T = '+fnum(1000/f,2)+' ms  ·  λ ≈ '+fnum(343/f,2)+' m in air');
  write('songMathInsight',`For ${note.n}, the equal-tempered comparison model places the note ${fnum(cents,0)} cents above Sa. Carnatic intonation and gamakas can vary in a real performance; this is not a measurement of M. S. Subbulakshmi's recording.`);
  $('songMathWave').innerHTML=svg(ratio,true);
 }
 window.renderMathVoice=voice;window.renderMathSong=song;
 // Render a meaningful initial state; later swara selections update the visual.
 const initial={note:{n:'Sa',s:0},sa:240,ratio:1,f:240,cents:0};
 song(initial);
})();
