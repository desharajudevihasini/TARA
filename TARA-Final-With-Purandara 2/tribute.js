(()=>{
  'use strict';
  const $=(id)=>document.getElementById(id);
  const topButton=$('soundBtn');
  const pill=$('msNowPlaying');
  const pauseBtn=$('msPauseBtn');
  const closeBtn=$('msCloseBtn');
  const host=$('msAudioHost');
  const officialUrl='https://www.youtube.com/watch?v=zmHsP1CN_aA';
  const VIDEO_ID='zmHsP1CN_aA';
  if(!topButton || !host) return;
  let iframe=null, player=null, apiReady=false, apiLoading=false, playerState=-1;
  let userWantedPlayback=false;

  function updateTopButton(){
    topButton.textContent = playerState===1 ? '♫ PAUSE M. S. SUBBULAKSHMI' : '♫ HEAR M. S. SUBBULAKSHMI';
    topButton.setAttribute('aria-pressed', String(playerState===1));
  }
  function showPill(on){ pill.hidden=!on; }
  function createFrame(){
    if(iframe) return iframe;
    const frame=document.createElement('iframe');
    frame.id='msAudioFrame';
    frame.title='Bhagyada Lakshmi Baramma — M. S. Subbulakshmi';
    frame.allow='autoplay; encrypted-media; picture-in-picture';
    frame.referrerPolicy='strict-origin-when-cross-origin';
    frame.src=`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&playsinline=1&controls=0&enablejsapi=1&rel=0&modestbranding=1`;
    host.replaceChildren(frame);
    iframe=frame;
    return frame;
  }
  function loadApi(){
    if(apiLoading) return;
    apiLoading=true;
    if(window.YT?.Player){ apiReady=true; attachPlayer(); return; }
    const previous=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=()=>{ apiReady=true; if(typeof previous==='function') try{previous();}catch{} attachPlayer(); };
    const s=document.createElement('script');
    s.src='https://www.youtube.com/iframe_api'; s.async=true;
    document.head.appendChild(s);
  }
  function attachPlayer(){
    if(!apiReady || !iframe || player) return;
    try{
      player = new window.YT.Player(iframe, {
        events: {
          onReady(){ if(userWantedPlayback){ try{ player.playVideo(); }catch{} } },
          onStateChange(e){
            playerState=e.data;
            if(e.data===1){ showPill(true); }
            if(e.data===0 || e.data===2){ /* keep pill visible unless fully stopped */ }
            updateTopButton();
          },
          onError(){
            stop();
            window.open(officialUrl, '_blank', 'noopener');
          }
        }
      });
    }catch(err){
      window.open(officialUrl, '_blank', 'noopener');
    }
  }
  function play(){
    userWantedPlayback=true;
    createFrame();
    loadApi();
    attachPlayer();
    showPill(true);
    if(player){ try{ player.playVideo(); }catch{} }
    updateTopButton();
  }
  function pause(){
    userWantedPlayback=false;
    if(player){ try{ player.pauseVideo(); }catch{} }
    playerState=2;
    updateTopButton();
  }
  function stop(){
    userWantedPlayback=false;
    if(player){ try{ player.stopVideo(); }catch{} try{ player.destroy(); }catch{} }
    player=null; playerState=-1;
    if(iframe){ try{ iframe.src='about:blank'; }catch{} iframe.remove(); }
    iframe=null;
    host.replaceChildren();
    showPill(false);
    updateTopButton();
  }
  function toggle(){ if(playerState===1) pause(); else play(); }
  topButton.addEventListener('click', toggle);
  pauseBtn?.addEventListener('click', ()=>{ if(playerState===1) pause(); else play(); });
  closeBtn?.addEventListener('click', stop);
  window.taraTribute={
    pauseForRecording(){ stop(); },
    stop,
    play,
    openOfficial(){ window.open(officialUrl,'_blank','noopener'); }
  };
  updateTopButton();
})();
