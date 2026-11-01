/* TĀRA — original local-first cosmic music experiment.
   The starfield is an artistic visualization, not a scientific catalogue.
   All musical measurements are estimates; we don't infer an inventor from sound. */
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)], clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const NAMES=['Sa','Ri','Ga','Ma','Pa','Dha','Ni','Sa′'], SEMIS=[0,1,4,5,7,8,11,12];
const SCALE_HELP={mayamalavagowla:'R₁ · G₃ · D₁ · N₃ — traditional beginner reference',shankarabharanam:'R₂ · G₃ · D₂ · N₃ — major-scale-like pitch positions',kharaharapriya:'R₂ · G₂ · D₂ · N₂ — another common swara reference'};
function scaleSemis(name=state.scale){return TaraPitch.SCALES[name]?.semitones||SEMIS;}
const EXAMPLES={
  motif:{name:'Sa Ri Ga, three times',desc:'A little pattern, repeated',notes:[0,1,2,0,1,2,0,1,2],dur:.49,history:'Illustrative practice motif; no named composer is known for this exact arrangement.'},
  sarali:{name:'The first swara ladder',desc:'A beginner Sarali Varisai',notes:[0,1,2,3,4,5,6,7,7,6,5,4,3,2,1,0],dur:.4,history:'A graded beginner exercise traditionally associated with Purandara Dasa’s teaching legacy.'},
  adi:{name:'The eight-beat orbit',desc:'Sa to higher Sa in Adi Taala',notes:[0,1,2,3,4,5,6,7],dur:.6,history:'A teaching demonstration of one note per beat, not a historical composition.'}
};
const LINKS={
 history:'https://mtosmt.org/issues/mto.15.21.4/mto.15.21.4.schachter_supp.html',
 practice:'https://www.indian-heritage.org/music/abhyasa.htm',
 research:'https://musicacademymadras.in/catalogue/files/journals/Vol.64_1993.pdf',
 voice:'https://www.nidcd.nih.gov/health/taking-care-your-voice',
 physics:'https://www.physicsclassroom.com/class/sound',
 stars:'https://stars.chromeexperiments.com/',
 rave:'https://www.retinarave.com/'
};
const reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const state={scene:'hero',slide:0,scale:'mayamalavagowla',zoom:1,yaw:.2,tilt:.18,drag:false,lastX:0,lastY:0,sa:240,audio:null,ambient:null,recording:false,calibrating:false,micStream:null,micSource:null,analyser:null,mediaRecorder:null,chunks:[],micFrames:[],micStart:0,micLoop:null,recordUrl:null,session:null,taalaVideoUrl:null,cameraStream:null,beatTimes:[],beatCount:0,syncOffset:0,pitchMode:'reference',selectedScience:'physics',selectedNote:0,activeExample:null,noticeTimer:null,animationRaf:null,flight:null,flying:false};
function msg(text){const t=$('#toast');t.textContent=text;t.classList.add('show');clearTimeout(state.noticeTimer);state.noticeTimer=setTimeout(()=>t.classList.remove('show'),4000)}
function setLabel(text){$('#mastheadLabel').textContent=text}
/* -------- Cosmic canvas: original pseudo-3D rendered star cloud -------- */
const can=$('#starCanvas'),ctx=can.getContext('2d',{alpha:false});let W=0,H=0,DPR=1,stars=[],farStars=[],nebula=null,frameCount=0;
let lastDraw=0;let seed=16429;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
function gaussian(){return (rand()+rand()+rand()+rand()-2)*1.73}
function initStars(){stars=[];farStars=[];seed=16429;
  for(let i=0;i<11200;i++){const arm=i%4,r=.035+Math.pow(rand(),.8)*1.12,angle=arm*Math.PI/2+r*5.9+gaussian()*(.13+.25*r),x=r*Math.cos(angle),y=r*Math.sin(angle),z=gaussian()*(.022+.09*r),hot=rand();stars.push({x,y,z,hot,lum:rand(),r:.25+rand()*1.3})}
  for(let i=0;i<1200;i++)farStars.push({x:rand(),y:rand(),s:rand()*1.3+.25,c:rand()});
}
initStars();
function resizeCanvas(){const d=Math.min(1.6,window.devicePixelRatio||1);if(W===window.innerWidth&&H===window.innerHeight&&DPR===d)return;W=window.innerWidth;H=window.innerHeight;DPR=d;can.width=Math.floor(W*d);can.height=Math.floor(H*d);ctx.setTransform(d,0,0,d,0,0);makeNebula()}
function makeNebula(){const c=document.createElement('canvas');c.width=1000;c.height=660;const x=c.getContext('2d');const spots=[
 [510,330,370,'rgba(85,105,220,.20)'],[620,360,250,'rgba(60,111,227,.18)'],[425,310,240,'rgba(127,86,204,.12)'],[720,260,160,'rgba(63,169,215,.12)'],[325,390,180,'rgba(214,138,171,.07)']];
 for(const [cx,cy,r,color] of spots){const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,color);g.addColorStop(.7,color.replace(/,[0-9.]+\)$/,',0.02)'));g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(cx-r,cy-r,r*2,r*2)}nebula=c}
function halo(x,y,r,color,alpha=1){let g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color.replace('ALPHA',String(.43*alpha)));g.addColorStop(.28,color.replace('ALPHA',String(.15*alpha)));g.addColorStop(1,color.replace('ALPHA','0'));ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
function drawCosmos(t){if(t-lastDraw<((window.innerWidth<650)?42:29)){state.animationRaf=requestAnimationFrame(drawCosmos);return}lastDraw=t;resizeCanvas();frameCount++;const scene=state.scene;ctx.fillStyle='#02040c';ctx.fillRect(0,0,W,H);
  for(const s of farStars){const tw=.5+.33*Math.sin(t*.0003+s.x*22);ctx.fillStyle=s.c>.88?`rgba(255,217,184,${tw*.8})`:`rgba(189,206,248,${tw*.7})`;ctx.fillRect(s.x*W,s.y*H,s.s,s.s)}
  if(scene==='hero'||scene==='galaxy'){
    const isG=scene==='galaxy',centreX=W*(isG?.60:.71),centreY=H*(isG?.51:.54),s=Math.min(W,H)*(isG?.48:.51)*state.zoom;
    const theta=(reduceMotion?0:t*.000018)+state.yaw,cos=Math.cos(theta),sin=Math.sin(theta),inc=state.tilt+(isG?.17:.04),tiltCos=Math.cos(inc),tiltSin=Math.sin(inc);
    if(nebula){ctx.save();ctx.globalAlpha=isG?.7:.51;ctx.translate(centreX,centreY);ctx.rotate(-.4+theta*.14);ctx.scale(s/330,s/680);ctx.drawImage(nebula,-500,-330);ctx.restore()}
    for(let i=0;i<stars.length;i++){const st=stars[i],xx=st.x*cos-st.y*sin,yy=st.x*sin+st.y*cos,py=yy*tiltSin+st.z*tiltCos,depth=yy*tiltCos-st.z*tiltSin,persp=1/(1+.18*depth);const x=centreX+xx*s*persp,y=centreY+py*s*persp;if(x<-10||x>W+10||y<-10||y>H+10)continue;
      const alpha=(.15+.57*st.lum)*(.55+.45*persp),size=clamp(st.r*(.36+.7*persp),.35,2.7);ctx.fillStyle=st.hot>.92?`rgba(255,206,170,${alpha})`:st.hot>.5?`rgba(182,199,255,${alpha})`:`rgba(156,176,249,${alpha})`;ctx.beginPath();ctx.arc(x,y,size,0,6.283);ctx.fill();}
    halo(centreX,centreY,Math.min(W,H)*.17,'rgba(192,208,255,ALPHA)',.67);halo(centreX,centreY,Math.min(W,H)*.043,'rgba(243,222,211,ALPHA)',1);
    ctx.save();ctx.globalAlpha=.36;ctx.strokeStyle='#8294db';ctx.lineWidth=.6;for(let r=1;r<=4;r++){ctx.beginPath();ctx.ellipse(centreX,centreY,s*r/4,s*r/12,theta*.17,0,Math.PI*2);ctx.stroke()}ctx.restore();
  }else if(scene==='sunScene'){halo(W*.66,H*.52,Math.min(W,H)*.58,'rgba(238,135,50,ALPHA)',.48)}
  else if(scene==='earthScene'){halo(W*.30,H*.53,Math.min(W,H)*.48,'rgba(58,128,247,ALPHA)',.39)}
  else{halo(W*.78,H*.43,Math.min(W,H)*.45,'rgba(89,93,209,ALPHA)',.18)}
  state.animationRaf=requestAnimationFrame(drawCosmos)}
const stellar=window.StellarEngine?.create(document.querySelector('#stellarGL'),()=>state);
if(stellar){
  can.style.display='none';
  stellar.start();
}else{
  document.querySelector('#stellarGL').style.display='none';
  requestAnimationFrame(drawCosmos);
}
function setScene(key){if(key!=='story'&&typeof window.stopSongAtlasBeats==='function')window.stopSongAtlasBeats();state.scene=key;$$('.scene').forEach(e=>{e.classList.toggle('active',e.id===key);e.classList.toggle('fade-in',e.id===key)});setLabel(key==='galaxy'?'EXPLORING THE MILKY WAY':key==='sunScene'?'FOLLOWING OUR STAR':key==='earthScene'?'WELCOME TO EARTH':key==='story'?'THE UNIVERSE INSIDE A NOTE':'AN EXPERIMENT IN MUSIC, TIME & SPACE');if(key==='story'){$('#story').scrollTop=0;}document.body.dataset.scene=key}
function flashTo(next){$('#transitionFlash').classList.add('show');setTimeout(()=>{setScene(next);$('#transitionFlash').classList.remove('show')},reduceMotion?80:340)}
function startIntro(){if(location.hash==='#story'){$('#intro').remove();setScene('story');showSlide(0);return}setTimeout(()=>$('#intro')?.classList.add('split'),reduceMotion?100:950);setTimeout(()=>{$('#intro')?.classList.add('done');setTimeout(()=>$('#intro')?.remove(),900)},reduceMotion?150:2100)}
$('#skipIntro').addEventListener('click',()=>{$('#intro')?.remove()});startIntro();
$('#beginVoyage').addEventListener('click',()=>{
  state.zoom=1;setScene('galaxy');
});
function updateStarHud(){
  const z=state.zoom*Math.pow(22,state.flight?.progress||0),near=z>3.0;
  const stage=state.flight?.progress>.60?'APPROACHING SOL':near?'NEARBY STELLAR NEIGHBORHOOD':'THE MILKY WAY';
  const phase=$('#hudPhase'),dist=$('#hudDistance');
  if(phase)phase.textContent=stage;
  if(dist)dist.textContent=z<2?'GALACTIC VIEW · ARTISTIC VISUALIZATION':z<6?'FROM THE GALAXY TO THE LOCAL STARS':z<14?'STAR SYSTEMS · ARTISTIC LOCATIONS':'OUR SUN IS GETTING CLOSER';
  document.body.classList.toggle('show-nearby',near);
}
function travelToSun(){
  if(state.flying)return;
  state.flying=true;
  const from=state.zoom;
  const duration=reduceMotion?400:6600;
  const t0=performance.now();
  const layer=$('#hyperTravel');layer.classList.add('active');
  $('#toSun').disabled=true;
  const animate=t=>{
    const p=clamp((t-t0)/duration,0,1),ease=p*p*(3-2*p);
    state.flight={progress:ease};
    state.yaw+=reduceMotion?0:.0025;
    if(p<.28){$('#travelCaption').textContent='LEAVING THE GALACTIC PLANE';}
    else if(p<.63){$('#travelCaption').textContent='THROUGH THE NEARBY STARS';}
    else{$('#travelCaption').textContent='CLOSING IN ON SOL';}
    $('#travelDistance').textContent=`THE JOURNEY TO OUR SUN · ${Math.round(p*100)}%`;
    updateStarHud();
    if(p<1)requestAnimationFrame(animate);
    else{
      state.flight=null;state.flying=false;state.zoom=1;
      layer.classList.remove('active');$('#toSun').disabled=false;
      document.body.classList.remove('show-nearby');setScene('sunScene');
    }
  };requestAnimationFrame(animate);
}
$('#toSun').addEventListener('click',travelToSun);
$('#autoTour').addEventListener('click',travelToSun);
function travelToEarth(){
  if(state.flying)return;
  state.flying=true;
  document.body.classList.add('solar-approach');
  setTimeout(()=>{document.body.classList.remove('solar-approach');state.flying=false;setScene('earthScene')},reduceMotion?100:2300);
}
$('#toEarth').addEventListener('click',travelToEarth);$('#sunEarth').addEventListener('click',travelToEarth);
function enterStory(){flashTo('story');state.slide=0;showSlide(0)}
$('#earthButton').addEventListener('click',enterStory);$('#enterStory').addEventListener('click',enterStory);
$('#goHome').addEventListener('click',()=>{stopMic();stopCamera();setScene('hero')});
const interactionCanvas=stellar?document.querySelector('#stellarGL'):can;
interactionCanvas.addEventListener('pointerdown',e=>{if(state.scene!=='galaxy')return;state.drag=true;state.lastX=e.clientX;state.lastY=e.clientY;interactionCanvas.setPointerCapture(e.pointerId)});
interactionCanvas.addEventListener('pointermove',e=>{if(!state.drag)return;state.yaw+=(e.clientX-state.lastX)*.005;state.tilt=clamp(state.tilt+(e.clientY-state.lastY)*.003,-.4,.95);state.lastX=e.clientX;state.lastY=e.clientY});
interactionCanvas.addEventListener('pointerup',()=>state.drag=false);interactionCanvas.addEventListener('pointercancel',()=>state.drag=false);
window.addEventListener('wheel',e=>{if(state.scene==='galaxy'){e.preventDefault();state.zoom=clamp(state.zoom*(e.deltaY<0?1.22:.82),.55,28);updateStarHud()}},{passive:false});
$('#zoomPlus').addEventListener('click',()=>{state.zoom=clamp(state.zoom*1.35,.55,28);updateStarHud()});$('#zoomMinus').addEventListener('click',()=>{state.zoom=clamp(state.zoom*.74,.55,28);updateStarHud()});
/* -------- Scenes & slideshow -------- */
function showSlide(n){if(state.slide===5&&n!==5&&typeof window.stopSongAtlasBeats==='function')window.stopSongAtlasBeats();state.slide=clamp(n,0,6);$$('.slide').forEach(x=>x.classList.toggle('active',+x.dataset.slide===state.slide));$('#chapterCounter').textContent=`0${state.slide+1} / 07`;$('#progressFill').style.width=((state.slide+1)/7*100)+'%';$('#backSlide').disabled=state.slide===0;$('#nextSlide').style.display=state.slide===6?'none':'';$('#nextSlide span').textContent=state.slide===3?'SEE THE REVEAL':'NEXT';if(state.slide===4&&!state.session)msg('Choose an example or record a phrase first to see real musical measurements.');$('#story').scrollTop=0}
$('#nextSlide').addEventListener('click',()=>{if(state.slide===3&&!state.session){msg('First record your voice, upload audio, or try an example.');return}showSlide(state.slide+1)});
$('#backSlide').addEventListener('click',()=>showSlide(state.slide-1));$('#goStudio').addEventListener('click',()=>showSlide(3));$('#newTake').addEventListener('click',()=>showSlide(3));
$('#restartJourney').addEventListener('click',()=>{setScene('galaxy');state.zoom=1;state.yaw=.2;updateStarHud()});
$('#historyMore').addEventListener('click',()=>openInfo(`<p class="overline">HISTORY / MUSIC PEDAGOGY</p><h2>Why learn with patterns?</h2><p>Purandara Dasa is traditionally credited with helping organize graded beginner exercises. Sarali Varisai introduces stepwise pitch movements; Jantai Varisai practises repeated notes; Dhatu Varisai introduces leaps; Alankaras combine patterns and rhythmic cycles.</p><p>This approach gives beginners a progression of listening, timing and vocal-control challenges. It isn't possible to verify the private intentions behind every historical note choice.</p><p><a href="${LINKS.practice}" target="_blank" rel="noopener">Read the teaching reference ↗</a> · <a href="${LINKS.history}" target="_blank" rel="noopener">Music Theory Online ↗</a></p>`));
function renderConstellation(){const root=$('#soundConstellation');for(let i=0;i<8;i++){const a=-Math.PI/2+i*2*Math.PI/8,x=50+39*Math.cos(a),y=50+39*Math.sin(a),b=document.createElement('button');b.className='note-star';b.textContent=NAMES[i];b.style.left=`calc(${x}% - 24px)`;b.style.top=`calc(${y}% - 24px)`;b.title=`Hear ${NAMES[i]}`;b.addEventListener('click',()=>tone(state.sa*2**(SEMIS[i]/12),.55));root.append(b)}}renderConstellation();
$('#playSeven').addEventListener('click',()=>playNotes([0,1,2,3,4,5,6,7],.42));
/* -------- Audio synth & controlled recording -------- */
async function audio(){if(!state.audio)state.audio=new (window.AudioContext||window.webkitAudioContext)();if(state.audio.state==='suspended')await state.audio.resume();return state.audio}
async function tone(hz,len=.5){const a=await audio(),o=a.createOscillator(),g=a.createGain(),now=a.currentTime;o.type='sine';o.frequency.value=hz;g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.19,now+.04);g.gain.exponentialRampToValueAtTime(.0001,now+len);o.connect(g);g.connect(a.destination);o.start(now);o.stop(now+len+.02)}
async function playNotes(notes,dur=.42,scale=state.scale){const a=await audio();notes.forEach((i,k)=>{const t=a.currentTime+k*dur+.04,o=a.createOscillator(),g=a.createGain();o.type='triangle';o.frequency.setValueAtTime(state.sa*2**(scaleSemis(scale)[i]/12),t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.13,t+.03);g.gain.setValueAtTime(.13,t+dur*.55);g.gain.exponentialRampToValueAtTime(.0001,t+dur*.96);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+dur)});return notes.length*dur}
$('#saControl').addEventListener('input',e=>{state.sa=+e.target.value;$('#saValue').textContent=`${state.sa} Hz`});
function changeReferenceScale(value){
 state.scale=value;
 $('#swaraScale').value=value;$('#resultScalePicker').value=value;
 $('#swaraScaleExplain').textContent=SCALE_HELP[value];
 if(state.session&&state.session.source!=='sample'){
   const old=state.session;
   state.session=makeSession(old.frames,old.duration,old.source,{buffer:old.buffer,recordUrl:old.recordUrl,forceSa:old.sa});
   state.selectedNote=Math.min(state.selectedNote,Math.max(0,state.session.segments.length-1));
   renderResults();msg('Swara labels recalculated with '+TaraPitch.SCALES[value].name+'.');
 }else if(state.session?.source==='sample'){ $('#resultScalePicker').value=state.session.scale;msg('Guided samples retain their original Mayamalavagowla reference. Sing or upload to compare scales.'); }
}
$('#swaraScale').addEventListener('change',e=>changeReferenceScale(e.target.value));
$('#resultScalePicker').addEventListener('change',e=>changeReferenceScale(e.target.value));
$('#hearSa').addEventListener('click',()=>tone(state.sa,.8));
const fmt=(v,p=1)=>Number.isFinite(v)?v.toFixed(p):'—';
function median(a){return TaraPitch.median(a)}
function pitchYIN(buf,sr){return TaraPitch.pitchYIN(buf,sr)}
function findSwara(hz,sa=state.sa,scale=state.scale){return TaraPitch.findSwara(hz,sa,scale)}
function tonicFromFirst(frames){return TaraPitch.tonicFromFirst(frames)}
function smoothPitchFrames(raw){return TaraPitch.smoothPitchFrames(raw)}
function makeSession(originalFrames,duration,source,extra={}){
 const raw=smoothPitchFrames(originalFrames);
 let sa=extra.forceSa||state.sa;
 if(!extra.forceSa&&source!=='sample'&&$('#assumeFirstSa').checked){
   const first=tonicFromFirst(raw);
   if(first){sa=first;state.sa=Math.round(first);$('#saControl').value=state.sa;$('#saValue').textContent=`${state.sa} Hz`;state.pitchMode='first sustained note'}
   else state.pitchMode='manual Sa';
 }else state.pitchMode=extra.forceSa?'preserved reference':'manual Sa';
 const scale=extra.scale||(source==='sample'?'mayamalavagowla':state.scale);
 const frames=raw.map(({t,hz,clarity})=>({t,hz:hz||0,clarity:clarity||null,swara:findSwara(hz,sa,scale)}));
 const segments=TaraPitch.segmentSwaras(frames,sa,scale);
 const good=frames.filter(x=>x.hz>0);
 const quality=TaraPitch.assess(frames,segments,sa,scale);
 return {frames,segments,sa,scale,quality,duration,source,avg:median(good.map(x=>x.hz)),example:extra.example||null,
   buffer:extra.buffer||null,recordUrl:extra.recordUrl||null,beats:[...state.beatTimes],time:new Date().toISOString()};
}
function showSession(s){if(s.source!=='sample')window.taraTribute?.pauseForRecording();state.session=s;state.selectedNote=Math.min(2,Math.max(0,s.segments.length-1));renderResults();showSlide(4)}
function loadExample(key){const ex=EXAMPLES[key],frames=[];for(let k=0;k<ex.notes.length;k++){const hz=state.sa*2**(SEMIS[ex.notes[k]]/12);for(let j=0;j<5;j++)frames.push({t:k*ex.dur+(j+.5)*ex.dur/5,hz})}state.activeExample=key;const session=makeSession(frames,ex.notes.length*ex.dur,'sample',{example:key,scale:'mayamalavagowla'});window.taraTribute?.pauseForRecording();playNotes(ex.notes,ex.dur,'mayamalavagowla');showSession(session)}
$('#examples').innerHTML=Object.entries(EXAMPLES).map(([key,val])=>`<button class="example" data-example="${key}"><span>♪</span><strong>${val.name}</strong><small>PLAY + DECODE ↗</small></button>`).join('');$$('[data-example]').forEach(el=>el.addEventListener('click',()=>loadExample(el.dataset.example)));
function stopMic(){if(state.micLoop){cancelAnimationFrame(state.micLoop);state.micLoop=null}try{state.micStream?.getTracks().forEach(x=>x.stop());state.micSource?.disconnect();state.analyser?.disconnect()}catch{}state.micStream=null;state.micSource=null;state.analyser=null}
function recordUI(on){$('#mainRecordCTA').classList.toggle('recording',on);$('#mainRecordCTA').textContent=on?'■ STOP & DECODE THE UNIVERSE':'● SING INTO THE UNIVERSE';document.body.classList.toggle('voice-active',on);$('#observatoryStatus').textContent=on?'RECORDING / SIGNAL ACTIVE':'AWAITING YOUR VOICE';$('#recordBtn').classList.toggle('recording',on);$('#recordBtn').textContent=on?'■ STOP & DISCOVER':'● RECORD VOICE';$('#recordStatus').innerHTML=`<span class="dot ${on?'live':''}"></span> ${on?'RECORDING YOUR VOICE':'READY TO LISTEN'}`}
async function startMic(){window.taraTribute?.pauseForRecording();const localHost=/^(localhost|127\.0\.0\.1)$/i.test(location.hostname)||location.hostname.endsWith('.localhost');if((!window.isSecureContext&&!localHost)||!navigator.mediaDevices?.getUserMedia){msg('Microphone access requires localhost or HTTPS in a supported browser. Open the site from the local server, not as a file.');return false}try{const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});const a=await audio(),src=a.createMediaStreamSource(stream),an=a.createAnalyser();an.fftSize=4096;src.connect(an);state.micStream=stream;state.micSource=src;state.analyser=an;return true}catch(e){msg('Microphone access failed: '+(e.name||e.message));return false}}
function drawLiveWave(values){const c=$('#liveWave'),context=c.getContext('2d'),w=c.width,h=c.height;context.clearRect(0,0,w,h);context.fillStyle='rgba(92,125,220,.025)';context.fillRect(0,0,w,h);context.strokeStyle='#bbc5ff';context.lineWidth=1.8;context.beginPath();for(let i=0;i<w;i++){const idx=Math.floor(i*values.length/w);const y=h/2+values[idx]*(h*.40);i?context.lineTo(i,y):context.moveTo(i,y)}context.stroke()}
function recordLoop(){if(!state.analyser||(!state.recording&&!state.calibrating))return;const data=new Float32Array(state.analyser.fftSize);state.analyser.getFloatTimeDomainData(data);drawLiveWave(data);const t=(performance.now()-state.micStart)/1000,estimate=TaraPitch.yinDetail(data,state.audio.sampleRate),hz=estimate.hz;if(state.recording&&(!state.micFrames.length||t-state.micFrames.at(-1).t>.075))state.micFrames.push({t,hz,clarity:estimate.clarity});if(state.calibrating&&hz)state.micFrames.push({t,hz,clarity:estimate.clarity});if((state.recording||state.calibrating)&&typeof updateObservatory==='function')updateObservatory(hz,data,t);if(hz){const n=findSwara(hz);$('#liveName').textContent=(n&&Math.abs(n.cents)<=125)?n.label:'≈' ;$('#liveFrequency').textContent=`${fmt(hz)} Hz · ${n?fmt(n.cents,0)+'¢ from nearest swara':''}`}$('#recordTimer').textContent=`${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;state.micLoop=requestAnimationFrame(recordLoop)}
async function beginRecord(){if(state.recording)return finishRecord();cosmicMeasure.history=[];if(!(await startMic()))return;state.recording=true;state.micFrames=[];state.micStart=performance.now();state.chunks=[];recordUI(true);$('#studioHint').textContent='Sing a clear monophonic phrase. When done, press Stop & Discover.';try{const types=['audio/webm;codecs=opus','audio/mp4','audio/webm'],mime=types.find(x=>MediaRecorder.isTypeSupported(x));state.mediaRecorder=new MediaRecorder(state.micStream,mime?{mimeType:mime}:undefined);state.mediaRecorder.ondataavailable=e=>{if(e.data.size)state.chunks.push(e.data)};state.mediaRecorder.start(250)}catch(e){state.mediaRecorder=null}recordLoop()}
async function finishRecord(){state.recording=false;recordUI(false);const captured=[...state.micFrames],dur=(performance.now()-state.micStart)/1000;let recorder=state.mediaRecorder;const output=new Promise(resolve=>{if(recorder&&recorder.state!=='inactive'){recorder.onstop=()=>{if(state.recordUrl)URL.revokeObjectURL(state.recordUrl);state.recordUrl=URL.createObjectURL(new Blob(state.chunks,{type:recorder.mimeType||'audio/webm'}));resolve()};recorder.stop()}else resolve()});stopMic();await output;if(captured.filter(x=>x.hz).length<5){msg('Not enough clear singing detected. Try a quieter room and sustain each note.');return}let decoded=null;try{if(state.chunks.length){decoded=await (await audio()).decodeAudioData(await new Blob(state.chunks,{type:recorder?.mimeType||'audio/webm'}).arrayBuffer())}}catch{}showSession(makeSession(captured,dur,'microphone',{recordUrl:state.recordUrl,buffer:decoded}))}
$('#recordBtn').addEventListener('click',beginRecord);
$('#calibrateSa').addEventListener('click',async()=>{if(state.recording){msg('Stop recording before calibrating Sa.');return}if(!(await startMic()))return;state.calibrating=true;state.micFrames=[];state.micStart=performance.now();$('#studioHint').textContent='Sing and sustain your comfortable Sa for about two seconds…';recordLoop();setTimeout(()=>{if(!state.calibrating)return;state.calibrating=false;const vs=state.micFrames.map(x=>x.hz).filter(Boolean),m=median(vs);stopMic();if(vs.length>=8&&m>=110&&m<=400){state.sa=Math.round(m);$('#saControl').value=state.sa;$('#saValue').textContent=`${state.sa} Hz`;msg(`Calibrated: Sa ≈ ${fmt(m)} Hz. Your notes will be mapped relative to this pitch.`);$('#studioHint').textContent='Great! Now sing your phrase and press Stop & Discover.'}else msg('Could not determine a steady Sa. Sing a longer, clear sustained tone and try again.')},2400)});
$('#audioFile').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;window.taraTribute?.pauseForRecording();const ac=await audio();msg('Reading your audio and estimating the pitch…');try{const buf=await ac.decodeAudioData(await file.arrayBuffer());let raw=await analyzeBuffer(buf);if(raw.filter(x=>x.hz).length<4)throw Error('Not enough clear melody detected');state.activeExample=null;showSession(makeSession(raw,buf.duration,'upload',{buffer:buf}));}catch(err){msg('Could not analyze this file: '+err.message)}finally{e.target.value=''}});
async function analyzeBuffer(buffer){const source=buffer.getChannelData(0),sr=buffer.sampleRate,skip=Math.max(1,Math.round(sr/11025)),rate=sr/skip,win=2048,hop=Math.max(250,Math.floor(rate*.075)),length=Math.floor(source.length/skip);const reduced=new Float32Array(length);for(let i=0;i<length;i++)reduced[i]=source[Math.min(source.length-1,i*skip)];const out=[];for(let j=0;j+win<length;j+=hop){{const estimate=TaraPitch.yinDetail(reduced.subarray(j,j+win),rate);out.push({t:j/rate,hz:estimate.hz,clarity:estimate.clarity})};if(out.length%110===0)await new Promise(res=>setTimeout(res,0));if(out.length>2000)break}return out}
/* -------- Taala video and manual beat alignment -------- */
$('#beatOrbit').innerHTML=Array.from({length:8},(_,i)=>`<span data-beat="${i+1}">${i+1}</span>`).join('');
$('#syncOffset').addEventListener('input',e=>{state.syncOffset=+e.target.value;$('#syncLabel').textContent=state.syncOffset.toFixed(1)+' s';if(state.session)$('#pitchGraph').innerHTML=pitchSVG(state.session)});
function beatMark(){const video=$('#talaVideo');const time=!video.hidden&&video.readyState>0&&video.srcObject===null?video.currentTime:(state.recording?(performance.now()-state.micStart)/1000:performance.now()/1000);state.beatTimes.push(time);state.beatCount=(state.beatCount%8)+1;$('#beatCount').textContent=`BEAT ${state.beatCount} / 8`;$$('[data-beat]').forEach(el=>el.classList.toggle('active',+el.dataset.beat===state.beatCount));$('#beatStats').textContent=`${state.beatTimes.length} BEATS MARKED`;if(state.beatTimes.length>1){const ds=state.beatTimes.slice(1).map((v,i)=>v-state.beatTimes[i]).filter(x=>x>.12&&x<4),period=median(ds);if(period)$('#beatStats').textContent=`${state.beatTimes.length} MARKS · ${Math.round(60/period)} BPM EST.`}tone(state.sa*2,.1).catch(()=>{})}
$('#tapBeat').addEventListener('click',beatMark);
window.addEventListener('keydown',e=>{if(e.code==='Space'&&state.scene==='story'&&state.slide===3&&!['INPUT','BUTTON','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();beatMark()}});
$('#talaVideoFile').addEventListener('change',e=>{const file=e.target.files?.[0];if(!file)return;if(state.taalaVideoUrl)URL.revokeObjectURL(state.taalaVideoUrl);stopCamera();$('#cameraToggle').textContent='◉ LIVE CAMERA';state.taalaVideoUrl=URL.createObjectURL(file);const video=$('#talaVideo');video.srcObject=null;video.src=state.taalaVideoUrl;video.hidden=false;video.controls=true;video.muted=true;video.play().catch(()=>{});state.beatTimes=[];state.beatCount=0;$('#beatCount').textContent='BEAT 1 / 8';$('#beatStats').textContent='VIDEO READY · TAP TO ANNOTATE';msg('Video loaded. Press Mark Beat (or Space) each time you see a taala beat. This is manual annotation, not automatic gesture recognition.')});
function stopCamera(){try{state.cameraStream?.getTracks().forEach(t=>t.stop())}catch{}state.cameraStream=null}
$('#cameraToggle').addEventListener('click',async()=>{if(state.cameraStream){stopCamera();$('#talaVideo').hidden=true;$('#cameraToggle').textContent='◉ LIVE CAMERA';return}const localHost=/^(localhost|127\.0\.0\.1)$/i.test(location.hostname)||location.hostname.endsWith('.localhost');if((!isSecureContext&&!localHost)||!navigator.mediaDevices?.getUserMedia){msg('Camera needs localhost or HTTPS.');return}try{state.cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false});const v=$('#talaVideo');v.srcObject=state.cameraStream;v.hidden=false;v.controls=false;v.muted=true;await v.play();$('#cameraToggle').textContent='◼ STOP CAMERA';msg('Camera preview ready. Use Mark Beat to tag gestures; automated visual gesture recognition is not enabled in this build.')}catch(e){msg('Could not open camera: '+e.message)}});
/* -------- Actual pitch graphs and scientific explanations -------- */
function makePattern(segs){const xs=segs.map(x=>x.label);let best=null;for(let length=Math.min(5,Math.floor(xs.length/2));length>=2;length--){for(let i=0;i<=xs.length-length;i++){const v=xs.slice(i,i+length).join(' '),matches=[];for(let j=0;j<=xs.length-length;j++)if(xs.slice(j,j+length).join(' ')===v&&(!matches.length||j-matches.at(-1)>=length))matches.push(j);if(matches.length>1&&(!best||length*matches.length>best.score))best={phrase:v,count:matches.length,score:length*matches.length}}}return best}
function pitchSVG(s){const w=900,h=310,padX=48,padY=25,voiced=s.frames.filter(x=>x.hz>0);if(!voiced.length)return '<p>Not enough voiced samples.</p>';const hs=voiced.map(x=>x.hz).sort((a,b)=>a-b),lo=clamp(hs[Math.floor(.03*hs.length)]*.83,75,1200),hi=clamp(hs[Math.floor(.97*hs.length)]*1.16,lo+50,1500),x=t=>padX+(w-padX*1.4)*t/Math.max(.2,s.duration),y=f=>h-padY-(h-2*padY)*((Math.log(f)-Math.log(lo))/(Math.log(hi)-Math.log(lo)));let grid='',path='',prev=null;for(let i=0;i<5;i++){const yy=padY+(h-2*padY)*i/4;grid+=`<line x1="${padX}" y1="${yy}" x2="${w-15}" y2="${yy}" stroke="#465579" stroke-opacity=".48" stroke-dasharray="4 7"/>`;const f=hi*(lo/hi)**(i/4);grid+=`<text x="4" y="${yy+4}" fill="#9bafcf" font-size="12">${Math.round(f)} Hz</text>`}
 for(const f of s.frames){if(!f.hz){prev=null;continue}const xx=x(f.t),yy=clamp(y(f.hz),-40,h+40);path+=(prev?'L':'M')+xx.toFixed(2)+' '+yy.toFixed(2)+' ';prev=f}
 let guides='';for(let n=0;n<8;n++){const f=s.sa*2**(scaleSemis(s.scale)[n]/12);if(f<lo||f>hi)continue;guides+=`<line x1="${padX}" x2="${w-15}" y1="${y(f)}" y2="${y(f)}" stroke="#c7aa77" stroke-opacity=".2"/><text x="${w-58}" y="${y(f)-5}" fill="#deb985" font-size="12">${NAMES[n]}</text>`}
 let beatGuides='';for(let i=0;i<Math.min(120,state.beatTimes.length);i++){const t=state.beatTimes[i]+state.syncOffset;if(t<0||t>s.duration)continue;const xx=x(t);beatGuides+=`<line x1="${xx}" x2="${xx}" y1="${padY}" y2="${h-padY}" stroke="#eacb95" stroke-opacity=".32" stroke-width="1"/><circle cx="${xx}" cy="${h-padY}" r="3.8" fill="#d7bc90"/>`}let points='';for(let j=0;j<s.segments.length;j++){const n=s.segments[j],xx=x((n.start+n.end)/2),yy=clamp(y(n.frequency),8,h-8);if(j>80)break;points+=`<circle class="pitch-hit ${j===state.selectedNote?'is-selected':''}" data-graph-note="${j}" cx="${xx}" cy="${yy}" r="11" fill="#e9d3a3" fill-opacity=".13" stroke="#e8d5ab" stroke-width="1.5" role="button" tabindex="0" aria-label="Select ${n.label} at ${fmt(n.frequency)} hertz"/>`}
 return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Pitch curve over time, labeled by approximate musical swaras"><defs><linearGradient id="pitchFill" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#b9bffb"/><stop offset=".5" stop-color="#92e2e8"/><stop offset="1" stop-color="#f4c79c"/></linearGradient><filter id="pitchGlow"><feGaussianBlur stdDeviation="2.5"/></filter></defs>${grid}${guides}${beatGuides}<path d="${path}" stroke="#78a3ff" stroke-width="9" opacity=".23" filter="url(#pitchGlow)" fill="none"/><path d="${path}" stroke="url(#pitchFill)" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>${points}<text x="${w-15}" y="${h-5}" fill="#8b9cbd" text-anchor="end" font-size="11">${fmt(s.duration)} SECONDS →</text></svg>`}
function renderResults(){const s=state.session;if(!s)return;$('#resultDescriptor').textContent=s.source==='sample'?'This is a synthesized reference example (not a recording of your voice). Click a note to explore its equation.':`Analyzed ${s.source==='upload'?'an uploaded audio file':'your microphone recording'}; labels are estimated relative to Sa ≈ ${fmt(s.sa)} Hz.`;$('#pitchGraph').innerHTML=pitchSVG(s);$('#noteEvents').innerHTML=s.segments.slice(0,55).map((seg,i)=>`<button data-index="${i}" class="${i===state.selectedNote?'selected':''}" title="${fmt(seg.frequency)} Hz">${seg.label}</button>`).join('')||'<small>No clear swara events detected.</small>';$$('[data-index]').forEach(b=>b.addEventListener('click',()=>{state.selectedNote=+b.dataset.index;renderSelectedNote()}));$('#statSa').textContent=`${fmt(s.sa)} Hz`;$('#statDuration').textContent=`${fmt(s.duration)}s`;$('#statNotes').textContent=String(s.segments.length);renderSignalAudit(s);renderSelectedNote();selectScience(state.selectedScience);$$('[data-graph-note]').forEach(el=>{const activate=()=>{state.selectedNote=+el.dataset.graphNote;renderSelectedNote()};el.addEventListener('click',activate);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate()}})})}
function renderSignalAudit(s){
 const q=s.quality||{coverage:0,nearScale:0,rating:'LOW'};
 $('#auditBadge').textContent=s.source==='sample'?'GUIDED MODEL':q.rating==='GOOD'?'CLEAR ENOUGH TO EXPLORE':q.rating==='CHECK'?'CHECK YOUR SETTINGS':'LOW CONFIDENCE';
 $('#auditBadge').dataset.quality=q.rating;
 $('#auditVoiced').textContent=Math.round(q.coverage*100)+'%';
 $('#auditOnScale').textContent=Math.round(q.nearScale*100)+'%';
 $('#auditScale').textContent=TaraPitch.SCALES[s.scale]?.name||s.scale;$('#resultScalePicker').value=s.scale;$('#resultScalePicker').disabled=s.source==='sample';
 $('#auditTonic').textContent=fmt(s.sa,1)+' Hz';
 $('#auditAdvice').textContent=s.source==='sample'?'Generated swaras and illustrative harmonics; this example is not a measurement of human singing.':
   q.rating==='GOOD'?'A useful solo-voice estimate. Tap any note to inspect the actual calculated ratio; exact swara identity still depends on the chosen Sa and raga.':
   q.rating==='CHECK'?'Some frames sit between this scale’s note positions. Verify your Sa, try a different swara reference, and sustain each note clearly.':
   'Not enough stable pitch or too many off-reference frames. Sing solo in a quieter room, calibrate Sa, and select the scale you are practising.';
}
function renderSelectedNote(){const s=state.session,seg=s?.segments[state.selectedNote];if(!seg)return;$$('[data-graph-note]').forEach(e=>e.classList.toggle('is-selected',+e.dataset.graphNote===state.selectedNote));$$('[data-index]').forEach(b=>b.classList.toggle('selected',+b.dataset.index===state.selectedNote));const ratio=seg.frequency/s.sa,cents=1200*Math.log2(ratio);$('#equationLive').textContent=`${fmt(seg.frequency)} ÷ ${fmt(s.sa)} = ${fmt(ratio,3)}`;$('#equationExplain').innerHTML=`<strong>${seg.label}</strong> was approximately <strong>${fmt(seg.frequency)} Hz</strong>. Relative to Sa, its ratio is <strong>${fmt(ratio,3)}:1</strong>; its distance is <strong>1200 × log₂(${fmt(ratio,3)}) = ${fmt(cents,0)} cents</strong>. These are measured or synthesized values, not a fixed universal tuning law.`;selectScience(state.selectedScience);if(typeof renderResultScience==='function')renderResultScience(seg);window.renderMathVoice?.(s,seg);
 const motif=makePattern(s.segments),ratioText=fmt(ratio,3)+' × Sa';
 $('#mathDiscovery').textContent=ratioText;
 $('#mathDiscoveryCopy').textContent=`${fmt(seg.frequency,1)} Hz ÷ ${fmt(s.sa,1)} Hz = ${fmt(ratio,3)}. ${fmt(cents,0)} cents from Sa.`;
 $('#physicsDiscovery').textContent=fmt(1000/seg.frequency,2)+' ms';
 $('#physicsDiscoveryCopy').textContent=`T = 1000 / ${fmt(seg.frequency,1)} Hz. Wavelength ≈ ${fmt(343/seg.frequency,2)} m in air at 20°C.`;
 $('#motifDiscovery').textContent=motif?motif.count+' × '+motif.phrase:'No verified motif';
 $('#motifDiscoveryCopy').textContent=motif?'This exact detected note pattern appears multiple times in the estimated swara sequence.':'A repeated phrase was not confidently found in this short recording.';
} 
function beatExplain(){const marks=state.beatTimes;if(marks.length<2)return 'Add hand-marked beats in the studio to measure your timing. A video alone does not establish automatic gesture labels.';const ds=marks.slice(1).map((b,i)=>b-marks[i]).filter(v=>v>.12&&v<4);return ds.length?`You marked ${marks.length} beats; the median gap was ${fmt(median(ds),2)} seconds (about ${Math.round(60/median(ds))} BPM). For standard chatusra-jati Adi Taala: 4 + 2 + 2 = 8 aksharas.`:'Beat intervals were too irregular to estimate a useful tempo.'}
const SCIENCE={
 physics:()=>{const s=state.session,k=s?.segments[state.selectedNote],f=k?.frequency||state.sa;return `<strong>Physics:</strong> Your fundamental frequency is about <strong>${fmt(f)} Hz</strong>. A voiced sound also contains harmonics near ${fmt(f,0)}, ${fmt(2*f,0)}, ${fmt(3*f,0)} and ${fmt(4*f,0)} Hz. <strong>fₙ ≈ n·f₀.</strong> The octave occurs when frequency doubles; the higher Sa is approximately 2 × the lower Sa. Harmonic strengths vary with the voice and vocal tract.`},
 voice:()=>`<strong>Biology:</strong> Airflow sets the vocal folds vibrating; muscles help control pitch and your tongue, lips and vocal tract shape the resonances. An “Aa” and “Ee” can sound different at the same fundamental frequency because of formants. Microphone audio cannot tell us the actual physical shape of your vocal folds.`,
 math:()=>{const s=state.session,pattern=makePattern(s?.segments||[]);return `<strong>Mathematics:</strong> Musical distance can be measured as <strong>cents = 1200 log₂(f₂/f₁)</strong>. One octave = 1200 cents. ${pattern?`A repeated motif was found: <strong>${pattern.phrase}</strong> appears approximately <strong>${pattern.count} times</strong>.`:'No confident repeated multi-note motif was found in this short phrase.'} This is a pattern calculation, not automatic identification of a composition.`},
 tala:()=>`<strong>Rhythm:</strong> In standard Adi Taala, a 4-count laghu and two 2-count drutams give <strong>4 + 2 + 2 = 8</strong> aksharas. In chatusra nadai, <strong>8 × 4 = 32</strong> subdivision positions. A phrase lands on a chosen cycle position using <strong>(start + length × repeats) mod 32</strong>. ${beatExplain()}`,
 history:()=>{const ex=EXAMPLES[state.session?.example];return `<strong>History:</strong> ${ex?ex.history:'No inventor or composer can be identified from a short melody recording alone.'} Purandara Dasa is traditionally credited with systematizing graded Carnatic lessons; he did not invent the seven swaras or the entire musical tradition. <a href="${LINKS.history}" target="_blank" rel="noopener">Historical reference ↗</a>`},
 learning:()=>`<strong>Learning:</strong> Sarali Varisai trains stepwise pitch awareness, Jantai Varisai repeats notes, and Dhatu Varisai introduces leaps. Repetition can improve auditory feedback, controlled pitch transitions, breath–voice coordination and rhythmic accuracy. This is skill acquisition, not proof of permanent anatomical reshaping. <a href="${LINKS.practice}" target="_blank" rel="noopener">Teaching reference ↗</a>`
};
function selectScience(key){state.selectedScience=key;$$('[data-science]').forEach(b=>b.classList.toggle('selected',b.dataset.science===key));$('#scienceCopy').innerHTML=SCIENCE[key]()}$$('[data-science]').forEach(b=>b.addEventListener('click',()=>selectScience(b.dataset.science)));selectScience('physics');
$('#hearSelectedNote').addEventListener('click',()=>{
 const n=state.session?.segments[state.selectedNote];if(!n)return;
 window.taraTribute?.pauseForRecording();tone(n.frequency,.8);
});
$('#playResult').addEventListener('click',()=>{const s=state.session;if(!s)return;if(s.example){playNotes(EXAMPLES[s.example].notes,EXAMPLES[s.example].dur,'mayamalavagowla');return}if(s.recordUrl){new Audio(s.recordUrl).play().catch(()=>msg('Your browser blocked the audio playback.'));return}const arr=s.segments.slice(0,35).map(n=>n.i);if(arr.length)playNotes(arr,.26,s.scale);else msg('There are no stable notes to play.');});
$('#exportJson').addEventListener('click',()=>{if(!state.session)return;const s=state.session;const out={project:'TĀRA',source:s.source,recordedAt:s.time,tonicHz:s.sa,tonicMethod:state.pitchMode,scaleReference:s.scale,analysisQuality:s.quality,measuredPitchFrames:s.frames.map(x=>({time:x.t,frequency:x.hz})),estimatedSwaraEvents:s.segments,beatMarkers:state.beatTimes,disclaimer:'The user-selected raga/reference provides equal-tempered pitch targets, not universal Carnatic tuning. Pitch and swaras are estimates; sample audio is synthesized; composer identification is not provided.'};const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='TARA-musical-discovery.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
/* -------- Tiny original science toys & documentation -------- */
function openInfo(html){$('#dialogContent').innerHTML=html;$('#infoDialog').showModal()}$('#dialogClose').addEventListener('click',()=>$('#infoDialog').close());$('#infoDialog').addEventListener('click',e=>{if(e.target===$('#infoDialog'))$('#infoDialog').close()});
$('#helpBtn').addEventListener('click',()=>openInfo(`<p class="overline">ABOUT TĀRA</p><h2>What are we actually measuring?</h2><p>This is an original artistic starfield inspired by the interactive exploration of 100,000 Stars. Star positions and distances here are decorative, not astronomical records. Our solar scene is not to scale.</p><p>Pitch is measured with a YIN-inspired periodicity algorithm. Since swaras are relative, the singer should calibrate Sa, or enable the “first note is Sa” option if that's true. The app does <b>not</b> understand syllables like speech recognition, identify arbitrary ragas/composers, or view the physical vocal folds.</p><p>The taala-video upload provides video playback with manual beat annotation; it does not automatically identify hand gestures.</p><p>History and science: <a href="${LINKS.history}" target="_blank">Musical theory</a>, <a href="${LINKS.practice}" target="_blank">Carnatic practice</a>, <a href="${LINKS.voice}" target="_blank">Voice care</a>.</p><p>Visual references: <a href="${LINKS.stars}" target="_blank">100,000 Stars</a> and <a href="${LINKS.rave}" target="_blank">Retina Rave</a>. No visual assets or code were copied from either site.</p>`));
async function syntheticVowel(kind){const ac=await audio(),start=ac.currentTime,osc=ac.createOscillator(),master=ac.createGain(),end=start+.70;osc.type='sawtooth';osc.frequency.value=180;master.gain.setValueAtTime(.0001,start);master.gain.exponentialRampToValueAtTime(.065,start+.06);master.gain.exponentialRampToValueAtTime(.0001,end);const formants=kind==='aa'?[760,1180,2700]:[290,2250,3020];const weights=kind==='aa'?[.7,.44,.26]:[.35,.48,.24];osc.connect(master);formants.forEach((f,i)=>{const bp=ac.createBiquadFilter(),gain=ac.createGain();bp.type='bandpass';bp.frequency.value=f;bp.Q=5;gain.gain.value=weights[i];master.connect(bp);bp.connect(gain);gain.connect(ac.destination)});osc.start(start);osc.stop(end+.03)}
$('#vowelExperiment').addEventListener('click',()=>{openInfo(`<p class="overline">A LITTLE EXPERIMENT / FORMANTS</p><h2>Same pitch. Different vowel.</h2><p>Sing “Aa” and then “Ee” on the same note. The fundamental frequency can stay almost unchanged while the vowel sounds different.</p><div style="display:flex;gap:12px;margin:20px 0"><button class="mini-action" id="playAa">▶ LISTEN TO AA</button><button class="mini-action" id="playEe">▶ LISTEN TO EE</button></div><p>These are <strong>illustrative synthesized vowels</strong> with the same 180 Hz fundamental and different resonance filters.</p><p><strong>Why?</strong> Your tongue, lips, jaw and vocal tract change the resonances called formants. The model is <strong>voice ≈ source (vocal folds) × filter (vocal tract)</strong>.</p><p><a href="${LINKS.voice}" target="_blank" rel="noopener">Learn about voice physiology ↗</a></p>`);$('#playAa').addEventListener('click',()=>syntheticVowel('aa'));$('#playEe').addEventListener('click',()=>syntheticVowel('ee'))});
$('#rhythmExperiment').addEventListener('click',()=>{openInfo(`<p class="overline">THE EIGHT-BEAT ORBIT</p><h2>Let's count to eight.</h2><p>Standard Adi Taala has eight aksharas: 4 (laghu) + 2 (drutam) + 2 (drutam).</p><div id="orbitBeats" style="display:flex;flex-wrap:wrap;gap:8px;margin:20px 0">${Array.from({length:8},(_,i)=>`<button class="mini-action" data-orbit="${i}">${i+1}</button>`).join('')}</div><p><strong>Exercise:</strong> click consecutive beats while counting. In chatusra nadai, eight beats give thirty-two subdivisions.</p><p><strong>Landing math:</strong> (starting position + pattern length × repetitions) mod 32. A result of zero lands at the beginning of a cycle.</p>`);$$('[data-orbit]').forEach(b=>b.addEventListener('click',()=>{tone(state.sa*(+b.dataset.orbit===0?2:1.5),.16);b.style.background='#eacb95';b.style.color='#071323'}))});
window.addEventListener('pagehide',()=>{stopMic();stopCamera();try{state.ambient?.forEach(x=>x.stop?.())}catch{}if(state.taalaVideoUrl)URL.revokeObjectURL(state.taalaVideoUrl)});

/* Soundtrack is controlled by tribute.js. */
$('#mainRecordCTA').addEventListener('click',()=>$('#recordBtn').click());
$('#mainUploadCTA').addEventListener('click',()=>$('#audioFile').click());
$('#mainExampleCTA').addEventListener('click',()=>loadExample('motif'));
const cosmicMeasure={hz:0,amp:0,t:0,profile:[],history:[],lastUpdate:0};
function createCanvasContext(id){const canvas=document.getElementById(id);return canvas?.getContext('2d')||null}
const universeCanvas=$('#voiceUniverse'),uniContext=createCanvasContext('voiceUniverse');
const melodyCanvas=$('#liveMelody'),melodyCtx=createCanvasContext('liveMelody');
const obsHCanvas=$('#obsHarmonics'),obsHCtx=createCanvasContext('obsHarmonics');
const resultHCanvas=$('#resultHarmonics'),resultHCtx=createCanvasContext('resultHarmonics');
const rand01=(x)=>{let a=Math.sin(x*138.937+4.341)*45231.928;return a-Math.floor(a)};
const universeStars=Array.from({length:210},(_,i)=>({a:rand01(i+2)*Math.PI*2,r:Math.sqrt(rand01(i+300)),s:.5+rand01(i+911)*2.2,o:.25+rand01(i+1500)*.55,z:rand01(i+2700)}));
let lastUniverseFrame=0;
function drawCosmicVoice(ts){requestAnimationFrame(drawCosmicVoice);if(ts-lastUniverseFrame<32)return;lastUniverseFrame=ts;
  const c=uniContext;if(!c)return;const w=universeCanvas.width,h=universeCanvas.height,cx=w*.5,cy=h*.49;
  const time=ts/1000,live=state.recording&&cosmicMeasure.amp>.008;
  const amp=live?cosmicMeasure.amp:0,glow=.6+amp*3;
  const f=live?cosmicMeasure.hz:state.sa,off=12*Math.log2(Math.max(1,f)/state.sa);
  const hue=210+clamp(off*5,-38,72);
  c.clearRect(0,0,w,h);const bg=c.createRadialGradient(cx,cy,10,cx,cy,w*.68);bg.addColorStop(0,`hsla(${hue},70%,22%,${live?.40:.19})`);bg.addColorStop(.43,'#06102a');bg.addColorStop(1,'#01040c');c.fillStyle=bg;c.fillRect(0,0,w,h);
  for(const star of universeStars){const a=star.a+time*.008*(.3+star.z),rad=star.r*530;const x=cx+Math.cos(a)*rad,y=cy+Math.sin(a)*rad*.65;c.fillStyle=`rgba(194,214,255,${star.o*(.7+.3*Math.sin(time*.8+star.a))})`;c.beginPath();c.arc(x,y,star.s*(live?1+amp*1.4:1),0,Math.PI*2);c.fill()}
  c.save();c.translate(cx,cy);c.rotate(time*.042+(live?off*.06:0));
  for(let i=0;i<6;i++){const r=67+i*33+(live?amp*35:0);c.save();c.rotate(i*.25+Math.sin(time*.12+i)*.06);c.beginPath();c.ellipse(0,0,r,r*(.32+i*.057),0,0,Math.PI*2);c.strokeStyle=`hsla(${hue+i*8},86%,${70-i*4}%,${.20+i*.038+amp*.23})`;c.lineWidth=i===0?2:1.15;c.stroke();c.restore()}
  for(let j=0;j<12;j++){const i=j%8,angle=j/12*Math.PI*2+time*.022;const rr=110+j%3*58+(live?amp*50:0);const x=Math.cos(angle)*rr,y=Math.sin(angle)*rr*.58;const g=c.createRadialGradient(x,y,0,x,y,15+amp*12);g.addColorStop(0,`rgba(252,225,186,${.6+Math.min(amp, .35)})`);g.addColorStop(1,'rgba(252,225,186,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,16+amp*12,0,Math.PI*2);c.fill();c.fillStyle='#fbe6bf';c.beginPath();c.arc(x,y,2.7+(live?amp*4:0),0,Math.PI*2);c.fill()}
  c.restore();
  const halo=c.createRadialGradient(cx,cy,2,cx,cy,126+amp*100);halo.addColorStop(0,`rgba(242,208,163,${.2+amp})`);halo.addColorStop(.3,'rgba(89,126,225,.08)');halo.addColorStop(1,'rgba(20,40,95,0)');c.fillStyle=halo;c.beginPath();c.arc(cx,cy,130+amp*100,0,Math.PI*2);c.fill();
}
requestAnimationFrame(drawCosmicVoice);
function drawMeasuredHarmonics(ctx,canvas,profile,f,kind){if(!ctx)return;const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='rgba(9,19,40,.38)';ctx.fillRect(0,0,w,h);
 const n=8,baseY=h-27,gridY=[25,50,75,100];for(const i of [0,1,2,3]){const y=20+i*(baseY-26)/3;ctx.strokeStyle='rgba(150,183,238,.13)';ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
 if(!f||!profile?.length){ctx.textAlign='center';ctx.fillStyle='#8096bb';ctx.font='13px monospace';ctx.fillText('Awaiting a clear sung note…',w/2,h/2);return}
 const max=Math.max(...profile,.000001);for(let i=0;i<n;i++){const x=26+i*(w-52)/n,bw=(w-52)/n*.48,p=clamp(profile[i]/max,0,1),value=Math.pow(p,.55)*(baseY-22);const grad=ctx.createLinearGradient(0,baseY-value,0,baseY);grad.addColorStop(0,`hsla(${40+i*18},82%,76%,.98)`);grad.addColorStop(1,`hsla(${205+i*3},84%,61%,.33)`);ctx.fillStyle=grad;ctx.fillRect(x,baseY-value,bw,value);ctx.fillStyle='#b6c7df';ctx.textAlign='center';ctx.font='11px monospace';ctx.fillText(`${i+1}f`,x+bw/2,baseY+17);}
}
function getHarmonicsFromLive(analyser,hz){if(!analyser||!hz)return [];const n=analyser.frequencyBinCount,arr=new Float32Array(n);analyser.getFloatFrequencyData(arr);const binsize=state.audio.sampleRate/analyser.fftSize;const out=[];for(let k=1;k<=8;k++){const center=Math.round(k*hz/binsize),rad=Math.max(2,Math.round(hz*.09/binsize));let strongest=-110;for(let b=Math.max(1,center-rad);b<=Math.min(n-1,center+rad);b++)strongest=Math.max(strongest,arr[b]);out.push(Math.pow(10,clamp(strongest,-110,0)/20))}return out}
function updateObservatory(hz,data,t){if(performance.now()-cosmicMeasure.lastUpdate<100)return;cosmicMeasure.lastUpdate=performance.now();let sum=0;for(let i=0;i<data.length;i++)sum+=data[i]*data[i];const rms=Math.sqrt(sum/data.length);cosmicMeasure.amp=clamp(rms*3,0,1);cosmicMeasure.hz=hz||0;cosmicMeasure.t=t;
 const sw=hz?findSwara(hz,state.sa):null;const validSw=sw&&Math.abs(sw.cents)<=125?sw:null;$('#observatoryStatus').textContent=hz?'SIGNAL RECEIVED':'LISTENING FOR A STEADY NOTE';$('#orbitalSwara').textContent=validSw?.label||(hz?'≈':'♪');$('#orbitalReadout').textContent=hz?`${fmt(hz)} Hz · ${fmt(1200*Math.log2(hz/state.sa),0)} CENTS FROM SA`:'MAKE A SOUND TO ACTIVATE THE STARS';$('#obsHz').innerHTML=hz?`${fmt(hz,1)} <small>Hz</small>`:'— <small>Hz</small>';
 $('#obsPeriod').textContent=hz?`${fmt(1000/hz,2)} ms`:'— ms';$('#obsLambda').textContent=hz?`${fmt(343/hz,2)} m`:'— m';$('#obsRatio').textContent=hz?`${fmt(hz,1)} / ${fmt(state.sa,0)} = ${fmt(hz/state.sa,3)}`:'f / fₛₐ = —';
 $('#obsEquationDetail').textContent=hz?`Measured pitch: ${fmt(hz,1)} Hz. Musical interval from Sa: ${fmt(1200*Math.log2(hz/state.sa),0)} cents. Relative pitch depends on your chosen tonic.`:'Frequency ratio from your selected Sa. A musical note has no fixed absolute pitch in Carnatic music.';
 $('#mathsChallenge').textContent=hz?`At ${fmt(hz,0)} Hz, your folds vibrate about ${fmt(hz,0)} times per second. The corresponding sound wave has an approximate wavelength of ${fmt(343/hz,2)} m in air at 20°C.¹`:'Try singing Sa, then Pa. Can you get close to the 3:2 relationship?';
 cosmicMeasure.profile=hz?getHarmonicsFromLive(state.analyser,hz):[];drawMeasuredHarmonics(obsHCtx,obsHCanvas,cosmicMeasure.profile,hz,'live');$('#obsHarmonicStatus').textContent=hz?'MEASURED SPECTRAL ENERGY':'SOUND → SPECTRUM';
}
let lastMelodyFrame=0;
function drawLiveMelody(ts){requestAnimationFrame(drawLiveMelody);if(ts-lastMelodyFrame<80)return;lastMelodyFrame=ts;const c=melodyCtx;if(!c)return;const w=melodyCanvas.width,h=melodyCanvas.height;c.clearRect(0,0,w,h);c.fillStyle='#050b1a';c.fillRect(0,0,w,h);
 const frames=(state.recording?state.micFrames:cosmicMeasure.history).filter(v=>v&&v.t!==undefined);
 const shown=frames.slice(-440);const last=shown.at(-1)?.t||5,start=Math.max(0,last-24),end=Math.max(8,last+1);
 for(let n=0;n<8;n++){const f=state.sa*2**(scaleSemis()[n]/12),logPos=Math.log2(f/state.sa),y=h-23-logPos*(h-43);if(y<12||y>h-22)continue;c.beginPath();c.moveTo(52,y);c.lineTo(w-18,y);c.strokeStyle='rgba(198,168,120,.18)';c.setLineDash([5,7]);c.stroke();c.setLineDash([]);c.fillStyle='#dfbd8b';c.font='15px monospace';c.fillText(NAMES[n],7,y+5)}
 const yOf=hz=>h-23-Math.log2(hz/state.sa)*(h-43);c.lineWidth=4;c.strokeStyle='#a0cbff';c.shadowBlur=17;c.shadowColor='#6c9fff';let started=false;c.beginPath();for(const f of shown){if(!f.hz||f.t<start){started=false;continue}const x=52+(w-74)*(f.t-start)/(end-start),y=yOf(f.hz);if(y<-25||y>h+25){started=false;continue}if(!started){c.moveTo(x,y);started=true}else c.lineTo(x,y)}c.stroke();c.shadowBlur=0;if(!shown.length){c.font='15px monospace';c.fillStyle='#7790b5';c.textAlign='center';c.fillText('Your melody will draw itself here as you sing.',w/2,h/2);c.textAlign='left'}
}
requestAnimationFrame(drawLiveMelody);
function harmonicProfileAt(buffer,startTime,f0){if(!buffer||!f0||f0<=0)return null;const data=buffer.getChannelData(0),sr=buffer.sampleRate,mid=Math.floor((startTime+.09)*sr),win=Math.min(4096,data.length),begin=clamp(mid-Math.floor(win/2),0,Math.max(0,data.length-win));const out=[];for(let k=1;k<=8;k++){let re=0,im=0;const step=2*Math.PI*(k*f0)/sr;for(let i=0;i<win;i++){const v=data[begin+i]*(.5-.5*Math.cos(2*Math.PI*i/(win-1)));re+=v*Math.cos(step*i);im+=v*Math.sin(step*i)}out.push(Math.sqrt(re*re+im*im))}return out}
function renderResultScience(seg){const s=state.session;if(!s||!seg)return;const ratio=seg.frequency/s.sa,cents=1200*Math.log2(ratio);$('#resultHeroFormula').textContent=`${fmt(seg.frequency,1)} / ${fmt(s.sa,1)} = ${fmt(ratio,3)}`;
 $('#resultHeroExplain').textContent=`You sang ${seg.label} at about ${fmt(seg.frequency,1)} Hz. That's ${fmt(cents,0)} cents from your tonic Sa. This ratio comes from ${s.source==='sample'?'synthesized':'estimated'} pitch values.`;
 const values=s.buffer?harmonicProfileAt(s.buffer,(seg.start+seg.end)/2,seg.frequency):[1,.6,.36,.26,.20,.16,.11,.08];drawMeasuredHarmonics(resultHCtx,resultHCanvas,values,seg.frequency,'result');$('#resultPhysicsLine').textContent=s.buffer?`Measured spectral energy near multiples of ${fmt(seg.frequency,0)} Hz in your audio. The fundamental is the first harmonic.`:`Expected harmonic positions for a note near ${fmt(seg.frequency,0)} Hz. Heights are illustrative because this source has no analyzable audio buffer.`;
}

