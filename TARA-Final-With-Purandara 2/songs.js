/* TĀRA / SONG ATLAS — researched composition metadata + transparent mathematical examples.
   Synthesizers play newly generated scale illustrations, NEVER recordings of these compositions.
   The source describes the raga positions; it does not transcribe an entire kriti. */
(()=>{
'use strict';
const SONGS=[
 {id:'bhagyada',title:'Bhagyada Lakshmi Baramma',local:'ಭಾಗ್ಯದ ಲಕ್ಷ್ಮೀ ಬಾರಮ್ಮ',composer:'Purandara Dasa',language:'Kannada',raga:'Madhyamavati',tala:'Adi · 8 aksharas',year:'16th-century tradition',desc:'A familiar invitation to Lakshmi, connected to the composer traditionally associated with foundational Carnatic teaching.',source:'https://www.purandaradasa.co.in/assets/images/songs_lyrics/ly-11750426903.pdf',story:'This devotional song is attributed to Purandara Dasa, a key figure in Carnatic teaching history. Recordings and teaching traditions use more than one melodic setting, including Madhyamavati and Sri. We should not claim to know a precise reason why each later performer chose a particular tune.',practice:'Follow the raga’s five-tone ascent, hold a clear Sa, and listen to how Ri, Ma, Pa, and Ni relate to it. Compare two renditions: same lyrics, different melodic choices. This develops pitch awareness and attentive listening.',notes:[{n:'Sa',s:0},{n:'Ri₂',s:2},{n:'Ma₁',s:5},{n:'Pa',s:7},{n:'Ni₂',s:10},{n:'Sa′',s:12}]},
 {id:'vatapi',title:'Vatapi Ganapatim',local:'वातापि गणपतिं',composer:'Muthuswami Dikshitar',language:'Sanskrit',raga:'Hamsadhwani',tala:'Adi · 8 aksharas',year:'18th–19th century',desc:'An exuberant composition commonly heard at the beginning of Carnatic performances.',source:'https://www.karnatik.com/c1048.shtml',story:'Muthuswami Dikshitar composed this celebrated kriti in Hamsadhwani. The raga ascends through five swaras, leaving out Ma and Dha in its basic scale; that distinctive arrangement helps create its musical identity.',practice:'Compare the interval from Ri to Ga and the larger step from Ga to Pa. Practising this contour can strengthen interval recognition, but actual musical phrasing also involves ornamentation.',notes:[{n:'Sa',s:0},{n:'Ri₂',s:2},{n:'Ga₃',s:4},{n:'Pa',s:7},{n:'Ni₃',s:11},{n:'Sa′',s:12}]},
 {id:'nagumomu',title:'Nagumomu Ganaleni',local:'నగుమోము గనలేని',composer:'Tyagaraja',language:'Telugu',raga:'Abheri',tala:'Adi · 8 aksharas',year:'18th–19th century',desc:'A reflective composition whose expressive shape goes far beyond a bare list of notes.',source:'https://www.karnatik.com/c31170.shtml',story:'Tyagaraja’s Telugu kriti is widely associated with Abheri. The ascending scale in a common modern treatment uses Sa, Ga, Ma, Pa and Ni, while the descent includes additional pitches. Different schools and renditions vary in their interpretations.',practice:'Listen for the distance from Sa to Ga and practise smooth movement rather than jumping between fixed pitch targets. Gamakas and phrasing are central to the musical expression.',notes:[{n:'Sa',s:0},{n:'Ga₂',s:3},{n:'Ma₁',s:5},{n:'Pa',s:7},{n:'Ni₂',s:10},{n:'Sa′',s:12}]},
 {id:'endaro',title:'Endaro Mahanubhavulu',local:'ఎందరో మహానుభావులు',composer:'Tyagaraja',language:'Telugu',raga:'Sri',tala:'Adi · 8 aksharas',year:'18th–19th century',desc:'One of Tyagaraja’s five Pancharatna kritis, performed at major commemorative gatherings.',source:'https://chicagotyagarajautsavam.org/classes/pancharatna-krithis',story:'This composition honors great souls and is one of the celebrated Pancharatna kritis. Its Sri raga setting is more complex in real performance than its simplified upward set of swaras; some characteristic descending phrases use extra pitches.',practice:'Try connecting Sa–Ri–Ma–Pa–Ni without losing tonic stability, then compare the ascending and descending phrases from a documented performance. The scale sketch is a starting point, not a replacement for learning the kriti.',notes:[{n:'Sa',s:0},{n:'Ri₂',s:2},{n:'Ma₁',s:5},{n:'Pa',s:7},{n:'Ni₂',s:10},{n:'Sa′',s:12}]}
];
const SRI=[{n:'Sa',s:0},{n:'Ri₂',s:2},{n:'Ma₁',s:5},{n:'Pa',s:7},{n:'Ni₂',s:10},{n:'Sa′',s:12}];
let chosen='bhagyada',sel=0,talaTimer=null,beat=-1;
const $=s=>document.querySelector(s);
const intervalNames=new Map([[0,'Unison'],[2,'Major second'],[3,'Minor third'],[4,'Major third'],[5,'Perfect fourth'],[7,'Perfect fifth'],[10,'Minor seventh'],[11,'Major seventh'],[12,'Octave']]);
const fm=(n,dec=1)=>Number(n).toFixed(dec).replace(/\.0$/,'');
const song=()=>SONGS.find(s=>s.id===chosen);
const notes=()=>chosen==='bhagyada'&&$('#songVariation').value==='sri'?SRI:song().notes;
const DESCENT={
 bhagyada:{madhyamavati:'Sa′ → Ni₂ → Pa → Ma₁ → Ri₂ → Sa',sri:'Sa′ → Ni₂ → Pa → Dha₂ → Ni₂ → Pa → Ma₁ → Ri₂ → Ga₂ → Ri₂ → Sa'},
 vatapi:'Sa′ → Ni₃ → Pa → Ga₃ → Ri₂ → Sa',
 nagumomu:'Sa′ → Ni₂ → Dha₂ → Pa → Ma₁ → Ga₂ → Ri₂ → Sa',
 endaro:'Sa′ → Ni₂ → Pa → Dha₂ → Ni₂ → Pa → Ma₁ → Ri₂ → Ga₂ → Ri₂ → Sa'
};

const escapeHtml=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
function renderPicker(){
 $('#songPicker').innerHTML=SONGS.map((s,i)=>`<button class="song-choice ${s.id===chosen?'is-selected':''}" data-song="${s.id}" aria-pressed="${s.id===chosen}"><span class="song-choice-index">0${i+1}</span><span class="song-choice-title">${escapeHtml(s.title)}</span><span class="song-choice-sub">${escapeHtml(s.composer)} · ${escapeHtml(s.language)}</span><span class="song-choice-arrow">↗</span></button>`).join('');
 $('#songPicker').querySelectorAll('[data-song]').forEach(btn=>btn.addEventListener('click',()=>{chosen=btn.dataset.song;sel=0;stopBeats();render()}));
}
function renderGraph(){
 const arr=notes(),w=820,h=245,pad=50;
 const coords=arr.map((n,i)=>({x:pad+i*(w-pad*2)/(arr.length-1),y:194-n.s*10.6,n}));
 const grid=Array.from({length:5},(_,i)=>`<line x1="30" y1="${29+i*42}" x2="790" y2="${29+i*42}" stroke="rgba(163,193,247,.12)" stroke-dasharray="4 8"/>`).join('');
 const path=coords.map(({x,y},i)=>`${i?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
 $('#songScale').innerHTML=`<defs><linearGradient id="songPitchGlow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8ce6df"/><stop offset="1" stop-color="#e5b577"/></linearGradient><filter id="songHalo"><feGaussianBlur stdDeviation="5"/></filter></defs>${grid}<path d="${path}" stroke="rgba(143,205,229,.4)" stroke-width="16" fill="none" filter="url(#songHalo)"/><path d="${path}" stroke="url(#songPitchGlow)" stroke-width="2.7" fill="none"/>${coords.map(({x,y,n},i)=>`<g class="song-point ${i===sel?'is-picked':''}" data-note="${i}" role="button" tabindex="0" aria-label="Explore ${escapeHtml(n.n)}"><circle cx="${x}" cy="${y}" r="${i===sel?19:12}" fill="rgba(235,196,135,.13)"/><circle cx="${x}" cy="${y}" r="${i===sel?7.5:5.5}" fill="${i===sel?'#fff0bb':'#8bcfd5'}"/><text x="${x}" y="${y-24}" text-anchor="middle" fill="${i===sel?'#ffe9bb':'#bbd0e9'}" font-size="14">${escapeHtml(n.n)}</text><text x="${x}" y="${y+32}" text-anchor="middle" fill="#8da5bc" font-size="11">${n.s} st</text></g>`).join('')}`;
 $('#songScale').querySelectorAll('[data-note]').forEach(g=>{g.addEventListener('click',()=>selectNote(+g.dataset.note,true));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectNote(+g.dataset.note,true)}})});
 $('#songSwaraButtons').innerHTML=arr.map((n,i)=>`<button data-notebtn="${i}" class="${i===sel?'selected':''}" aria-pressed="${i===sel}">${escapeHtml(n.n)}</button>`).join('');
 $('#songSwaraButtons').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>selectNote(+b.dataset.notebtn,true)));
}
function selectNote(index,sound){sel=index;renderGraph();const n=notes()[sel],sa=state.sa||240,ratio=2**(n.s/12),f=sa*ratio,cents=n.s*100;
 $('#songEquation').textContent=`${fm(sa,0)} × 2^(${n.s}/12) = ${fm(f,1)} Hz`;
 $('#songEquationDetail').textContent=`${n.n} · ${intervalNames.get(n.s)||`${n.s} semitones`} above Sa · ratio ${fm(ratio,4)} : 1 · ${cents} cents. Equal-tempered comparison model; Carnatic intonation can differ.`;
 $('#songHz').textContent=`${fm(f,1)} Hz`;$('#songPeriod').textContent=`${fm(1000/f,2)} ms`;$('#songWavelength').textContent=`${fm(343/f,2)} m`;
 window.renderMathSong?.({note:n,sa,ratio,f,cents,model:true});if(sound&&typeof tone==='function')tone(f,.55).catch(()=>{});
}
function drawBeats(){const el=$('#songBeatOrbit');el.innerHTML='<div class="song-beat-center"><strong>8</strong><span>AKSHARAS</span></div>'+Array.from({length:8},(_,i)=>{const ang=(-90+i*45)*Math.PI/180;const x=50+39*Math.cos(ang),y=50+39*Math.sin(ang);return `<div class="song-beat ${i===beat?'playing':''}" style="left:${x}%;top:${y}%" data-songbeat="${i}">${i+1}</div>`}).join('');}
function updateNadai(){const val=Number($('#songNadai').value);$('#songTalaCount').textContent=`8 × ${val} = ${8*val}`;$('#songTalaDescription').textContent=`Eight aksharas × ${val} subdivisions = ${8*val} pulse units per cycle. The beat pattern repeats: 4 + 2 + 2.`;}
function stopBeats(){if(talaTimer){clearInterval(talaTimer);talaTimer=null}beat=-1;drawBeats();$('#songPlayBeats').textContent='▶ HEAR THE CYCLE';}
function advanceBeat(){beat=(beat+1)%8;drawBeats();if(typeof tone==='function')tone(beat===0?state.sa*2:state.sa*1.5,.11).catch(()=>{});}
function playBeats(){if(talaTimer){stopBeats();return;}$('#songPlayBeats').textContent='■ STOP THE CYCLE';advanceBeat();talaTimer=setInterval(advanceBeat,570);}
async function playRaga(){const ar=notes(),seq=ar.concat(ar.slice(0,-1).reverse().slice(1));const dur=.43;if(typeof audio!=='function')return;const a=await audio();seq.forEach((n,i)=>{const t=a.currentTime+.07+i*dur,osc=a.createOscillator(),g=a.createGain();osc.type='sine';osc.frequency.value=(state.sa||240)*2**(n.s/12);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.125,t+.04);g.gain.setValueAtTime(.115,t+.28);g.gain.exponentialRampToValueAtTime(.0001,t+dur-.015);osc.connect(g).connect(a.destination);osc.start(t);osc.stop(t+dur)});}
function render(){const s=song(),index=SONGS.indexOf(s);renderPicker();$('#songTitle').textContent=s.title;$('#songSubtitle').textContent=`${s.local} · ${s.language} · ${s.desc}`;$('#songCounter').textContent=`0${index+1} / 04`;$('#songComposer').textContent=s.composer;$('#songRaga').textContent=(chosen==='bhagyada'&&$('#songVariation').value==='sri')?'Sri (selected rendition) ':s.raga;$('#songTala').textContent=s.tala;$('#songVariationWrap').hidden=chosen!=='bhagyada';$('#featuredRecording').hidden=chosen!=='bhagyada';if(chosen!=='bhagyada')window.closeTaraOfficial?.();$('#songStory').textContent=s.story;$('#songPractice').textContent=s.practice;$('#songSource').href=s.source;
 const which=chosen==='bhagyada'?$('#songVariation').value:null,down=chosen==='bhagyada'?DESCENT.bhagyada[which]:DESCENT[chosen];
 $('#songDescent').innerHTML=`<span>DESCENDING PHRASE / AVAROHANAM</span><strong>${escapeHtml(down)}</strong><p>${chosen==='bhagyada'?(which==='sri'?'Sri includes characteristic Ga₂ and Dha₂ movements in its descending outline, even though the basic upward notes resemble Madhyamavati. This is why two arrangements can differ without different ascending swaras.':'Madhyamavati has a symmetrical five-note scale. Compare Sri: its characteristic descent includes additional swara positions.'):'A raga is identified by characteristic movement, ornamentation and musical usage, not only the ascending and descending sets.'}</p>`;
 $('#songTonic').value=Math.round(state.sa);$('#songTonicValue').textContent=`${Math.round(state.sa)} Hz`;
sel=Math.min(sel,notes().length-1);selectNote(sel,false);updateNadai();drawBeats();}
$('#songVariation').addEventListener('change',()=>{sel=0;render()});
$('#songTonic').addEventListener('input',e=>{state.sa=Number(e.target.value);$('#songTonicValue').textContent=`${state.sa} Hz`;$('#saControl').value=state.sa;$('#saValue').textContent=`${state.sa} Hz`;selectNote(sel,false);});
$('#songNadai').addEventListener('change',updateNadai);
$('#songPlayBeats').addEventListener('click',playBeats);
$('#songPlayScale').addEventListener('click',playRaga);
$('#songGoRecord').addEventListener('click',()=>{stopBeats();showSlide(3);$('#studioHint').textContent=`You chose ${song().title}. Sing a short excerpt, or upload your recording. We measure pitch and intervals; we do not automatically identify the composition.`;document.querySelector('#recordBtn')?.focus({preventScroll:true});});
$('#exploreFamousIntro')?.addEventListener('click',()=>showSlide(5));
$('#exploreFamousResults')?.addEventListener('click',()=>showSlide(5));
// Avoid rhythmic tick playback continuing while users visit another slide.
const nextButton=$('#nextSlide'),backButton=$('#backSlide');nextButton?.addEventListener('click',()=>{if(state.slide!==5)stopBeats()});backButton?.addEventListener('click',()=>{if(state.slide!==5)stopBeats()});
window.stopSongAtlasBeats=stopBeats;
render();
})();
