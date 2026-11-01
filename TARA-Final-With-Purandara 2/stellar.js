/* TĀRA Stellar Edition — original WebGL particle universe.
 * Inspired by the interactions of Google's 100,000 Stars, but uses
 * procedurally generated, NON-astronomical star locations.
 * No source code, star catalogue, music, images, or assets are copied.
 */
(() => {
  'use strict';
  const VS=`
  attribute vec3 aPos;
  attribute vec3 aCol;
  attribute float aSize;
  uniform float uYaw,uTilt,uScale,uAlpha,uTime,uMode,uDensity,uAspect,uPixel;
  uniform vec2 uCenter;
  varying vec3 vColor;
  varying float vAlpha;
  void main(){
    float cy=cos(uYaw),sy=sin(uYaw),ct=cos(uTilt),st=sin(uTilt);
    vec3 p=vec3(aPos.x*cy-aPos.y*sy,aPos.x*sy+aPos.y*cy,aPos.z);
    p=vec3(p.x,p.y*st+p.z*ct,p.y*ct-p.z*st);
    float perspective = uMode > 0.5 ? 1.7/(1.7+max(-1.35,p.z)*0.46) : 1.4/(1.4+p.z*.19);
    vec2 xy = vec2(p.x*uAspect,p.y)*uScale*perspective + uCenter;
    gl_Position=vec4(xy,0.,1.);
    float halo=sin(uTime*.0004+aPos.x*83.+aPos.y*39.)*.15+.85;
    vColor=aCol;
    vAlpha=uAlpha*halo * step(0.1,perspective);
    gl_PointSize=max(1.,min(24.,aSize*uPixel*(uMode>.5 ? 1.4 : 1.0)*perspective*uDensity));
  }`;
  const FS=`
  precision mediump float;
  varying vec3 vColor;
  varying float vAlpha;
  void main(){
    vec2 p=gl_PointCoord-vec2(.5); float r=length(p);
    float glimmer=exp(-r*r*65.)*.88 + exp(-r*r*10.)*.17;
    if(r>.5)discard;
    gl_FragColor=vec4(vColor*glimmer*vAlpha,glimmer*vAlpha);
  }`;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const smooth=(a,b,v)=>{let x=clamp((v-a)/(b-a),0,1);return x*x*(3-2*x)};
  let seed=61092;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const gauss=()=>((rand()+rand()+rand()+rand()+rand()+rand())-3)*.78;
  function makeCatalog(n,mode){
    let verts=new Float32Array(n*7);
    for(let i=0;i<n;i++){
      const off=i*7;let x,y,z;
      if(mode==='galaxy'){
        const arm=i%4;
        const r=.015+Math.pow(rand(),.74)*1.08;
        const theta=arm*Math.PI/2+r*6.2+gauss()*(.07+.22*r);
        x=r*Math.cos(theta);y=r*Math.sin(theta);
        z=gauss()*(.022+.038*r);
        if(rand()<.13){x=gauss()*.105;y=gauss()*.105;z=gauss()*.055;}
      } else if(mode==='local') {
        const rad=.035+Math.pow(rand(),.45)*1.13;
        const ang=rand()*6.283;const h=rand()*2-1;
        const q=Math.sqrt(1-h*h);
        x=rad*q*Math.cos(ang);y=rad*q*Math.sin(ang);z=rad*h*.65;
      } else {
        x=(rand()*2-1)*2.3;y=(rand()*2-1)*2.1;z=rand()*2-1;
      }
      verts[off]=x;verts[off+1]=y;verts[off+2]=z;
      const hot=rand();
      if(hot<.055){verts[off+3]=1;verts[off+4]=.66;verts[off+5]=.38;}
      else if(hot<.18){verts[off+3]=1;verts[off+4]=.85;verts[off+5]=.69;}
      else if(hot<.68){verts[off+3]=.62;verts[off+4]=.71;verts[off+5]=1;}
      else{verts[off+3]=.84;verts[off+4]=.88;verts[off+5]=1;}
      verts[off+6]=mode==='back'?rand()*1.1+.5:rand()<.018?3.7+rand()*2:1.2+rand()*2.1;
    }
    return verts;
  }
  function makeShader(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
  function makeProgram(gl){const p=gl.createProgram();gl.attachShader(p,makeShader(gl,gl.VERTEX_SHADER,VS));gl.attachShader(p,makeShader(gl,gl.FRAGMENT_SHADER,FS));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;}
  function create(canvas,getState){
    let gl=canvas.getContext('webgl',{antialias:false,alpha:true,powerPreference:'high-performance',preserveDrawingBuffer:false});
    if(!gl)return null;
    let program;
    try{program=makeProgram(gl)}catch(err){console.warn('Stellar shader unavailable',err);return null;}
    gl.useProgram(program);
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    const attr={pos:gl.getAttribLocation(program,'aPos'),col:gl.getAttribLocation(program,'aCol'),size:gl.getAttribLocation(program,'aSize')};
    const loc={};for(const key of ['uYaw','uTilt','uScale','uAlpha','uTime','uMode','uDensity','uAspect','uPixel','uCenter'])loc[key]=gl.getUniformLocation(program,key);
    const catalogs={galaxy:makeCatalog(102400,'galaxy'),local:makeCatalog(18200,'local'),back:makeCatalog(5000,'back')};
    const buffers={};
    for(const [key,a] of Object.entries(catalogs)){
      const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,a,gl.STATIC_DRAW);buffers[key]={b,n:a.length/7};
    }
    let width=0,height=0,dpr=1,raf=0,lastT=0;
    function resize(){
      const w=window.innerWidth,h=window.innerHeight,p=Math.min(window.devicePixelRatio||1,window.innerWidth<650?1.35:1.7);
      if(w===width&&h===height&&p===dpr)return;
      width=w;height=h;dpr=p;canvas.width=Math.round(w*p);canvas.height=Math.round(h*p);gl.viewport(0,0,canvas.width,canvas.height);
    }
    function renderBatch(key,{zoom=1,alpha=1,yaw=0,tilt=.18,mode=0,centreX=0,centreY=0,size=1}){
      const {b,n}=buffers[key];gl.bindBuffer(gl.ARRAY_BUFFER,b);
      gl.enableVertexAttribArray(attr.pos);gl.vertexAttribPointer(attr.pos,3,gl.FLOAT,false,28,0);
      gl.enableVertexAttribArray(attr.col);gl.vertexAttribPointer(attr.col,3,gl.FLOAT,false,28,12);
      gl.enableVertexAttribArray(attr.size);gl.vertexAttribPointer(attr.size,1,gl.FLOAT,false,28,24);
      gl.uniform1f(loc.uYaw,yaw);gl.uniform1f(loc.uTilt,tilt);
      gl.uniform1f(loc.uScale,zoom);gl.uniform1f(loc.uAlpha,alpha);
      gl.uniform1f(loc.uMode,mode);gl.uniform1f(loc.uDensity,size);
      gl.uniform2f(loc.uCenter,centreX,centreY);
      gl.drawArrays(gl.POINTS,0,n);
    }
    function frame(t){
      raf=requestAnimationFrame(frame);
      const isMobile=width<650;
      if(t-lastT<(isMobile?33:16))return;
      lastT=t;resize();const s=getState(),scene=s.scene;
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform1f(loc.uTime,t);
      gl.uniform1f(loc.uPixel,dpr*(isMobile?.8:1));
      gl.uniform1f(loc.uAspect,height/width);
      const moving=s.flight?.progress||0;
      const galaxy=scene==='galaxy'||scene==='hero'||(moving>0);
      const interactiveZoom=scene==='hero'?.78:Math.max(.55,s.zoom||1);
      const zoom=interactiveZoom*Math.pow(22,moving);
      const near=smooth(2.7,12,zoom);
      const yaw=(s.yaw||0)+(s.drag?0:t*.000006);const tilt=(s.tilt||.18)+.18;
      renderBatch('back',{zoom:.46,alpha:scene==='story'?.13:.48,yaw:t*.000002,tilt:.85,mode:1,size:.75});
      if(galaxy){
        renderBatch('galaxy',{zoom:(scene==='hero'?.78:1.06)*Math.min(20,zoom),alpha:1-near*.96,yaw,tilt,centreX:scene==='hero'?.36:.08,centreY:-.015,size:scene==='hero'?.68:1});
        if(near>.015)renderBatch('local',{zoom:.61+Math.pow(Math.max(0,zoom-1),.45)*.32,alpha:near*(.6+.35*(1-moving)),yaw:yaw*.7,tilt:.55,centreX:.07,centreY:0,mode:1,size:1.17});
      }else if(scene==='sunScene'||scene==='earthScene'){
        renderBatch('local',{zoom:.75,alpha:.48,yaw:t*.000007,tilt:.5,centreX:0,centreY:0,mode:1,size:.87});
      }
    }
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);console.warn('WebGL context lost. Refresh to restore stellar scene.')});
    return{start(){resize();raf=requestAnimationFrame(frame)},stop(){cancelAnimationFrame(raf)}};
  }
  window.StellarEngine={create};
})();
