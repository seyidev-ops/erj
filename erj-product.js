/* Shared product-page behaviour: scroll reveals, countdown timers, PWA register.
   Path-aware via window.ERJ_NAV.base. */
(function(){
  var base=(window.ERJ_NAV&&typeof window.ERJ_NAV.base==='string')?window.ERJ_NAV.base:'';
  /* reveals */
  var els=document.querySelectorAll('.reveal');
  var obs=null;
  function showNow(e){
    e.style.transitionDelay='0s';
    e.classList.add('in');
    if(obs)obs.unobserve(e);
  }
  /* Reveal on APPROACH, not on arrival.

     The old settings were threshold:0.14 with rootMargin '0px 0px 120px 0px'.
     Against a flick of roughly 2000px/s that is 60ms of warning for a fade
     that takes 700ms, so tall blocks -- the "Four Problem" cards are ~400px
     each, two of them a full phone screen -- were still near-invisible well
     after they arrived. Empty black space in the night theme; a white blank in
     the day theme.

     700px of margin on the top AND bottom gives about a third of a second of
     lead in both scroll directions (the old margin extended downwards only, so
     scrolling back up had none at all). threshold:0 because with a margin that
     size the margin should decide, not a percentage of an element whose height
     varies eightfold down the page. */
  function revealIn(el, idx){
    /* stagger capped at three steps: the fourth card in a group should not
       still be waiting 150ms after the first has finished. */
    el.style.transitionDelay = (Math.min(Math.max(0, idx), 3) * 0.05) + 's';
    el.classList.add('in');
    if (obs) obs.unobserve(el);
  }
  if('IntersectionObserver' in window){
    obs=new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting){
        var sibs=[].slice.call(e.target.parentNode.querySelectorAll(':scope > .reveal'));
        revealIn(e.target, sibs.indexOf(e.target));
      }});},{threshold:0,rootMargin:'700px 0px 700px 0px'});
    els.forEach(function(e){obs.observe(e);});

    /* Anything already on screen when this runs has no reason to animate --
       the reader is looking at it now. */
    els.forEach(function(e){
      var b=e.getBoundingClientRect();
      if(b.top < (window.innerHeight||0) && b.bottom > 0) showNow(e);
    });

    /* Safety net. A transition is decoration; the content underneath is not.
       If anything is still hidden 1.2s after load -- a stalled observer, a
       throttled background tab, a device that coalesced the callbacks -- show
       it and stop waiting. */
    setTimeout(function(){
      els.forEach(function(e){ if(!e.classList.contains('in')) showNow(e); });
    }, 1200);
  } else { els.forEach(function(e){e.classList.add('in');}); }
  /* Jumping straight into a section — the nav's "quick tour" links, any
     in-page anchor (#joints etc.), or a URL that already carries a #hash on
     load — moves the viewport in a single instant frame. The observer above
     only sees whatever is on-screen at that instant, so a card further down
     a tall section (e.g. the 3rd/4th "Four Problem · Fix It" card) is left
     sitting at opacity:0 until the reader scrolls again. On the night theme
     that just reads as empty space; on the day theme it is a plain blank
     white gap. Force-reveal the target section, and everything the reader
     has effectively skipped past above it, the moment a hash is present. */
  function revealThroughHash(){
    var hash=location.hash;
    if(!hash||hash.length<2)return;
    var target=document.getElementById(hash.slice(1));
    if(!target)return;
    if(target.classList&&target.classList.contains('reveal'))showNow(target);
    target.querySelectorAll&&target.querySelectorAll('.reveal').forEach(showNow);
    document.querySelectorAll('.reveal').forEach(function(e){
      if(e!==target&&(target.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_PRECEDING)){
        showNow(e);
      }
    });
  }
  revealThroughHash();
  window.addEventListener('hashchange',revealThroughHash);
  /* countdown */
  var pad=function(n){return String(n).padStart(2,'0');};
  /* ── ROLLING GATES ────────────────────────────────────────────────
     A countdown that hits zero and sits there says the business has
     nothing open. When one cohort's gate closes the next one is already
     selling, so a panel may carry a second deadline and roll onto it the
     moment the first expires — label, subject line and date line with it.

       data-deadline        the gate now
       data-next-deadline   the gate after it
       data-next-label      what the heading becomes    (optional)
       data-next-for        what the subject line becomes (optional)
       data-next-date       what the date line becomes  (optional)

     Only when there is no next gate does it show the closed state. ── */
  var findUp=function(el,sel){
    var lbl=el.querySelector(sel);
    var scope=el.parentNode;
    while(scope&&scope!==document.body&&!lbl){lbl=scope.querySelector(sel);scope=scope.parentNode;}
    return lbl;
  };
  var panels=[].slice.call(document.querySelectorAll('[data-deadline]')).map(function(p){
    return {el:p,closedLabel:p.dataset.closedLabel||'',done:false,
      nextDeadline:p.dataset.nextDeadline||'',
      nextLabel:p.dataset.nextLabel||'',
      nextFor:p.dataset.nextFor||'',
      nextDate:p.dataset.nextDate||'',
      deadline:new Date(p.dataset.deadline),nodes:{
      d:p.querySelector('[data-k="d"]'),h:p.querySelector('[data-k="h"]'),
      m:p.querySelector('[data-k="m"]'),s:p.querySelector('[data-k="s"]')}};
  }).filter(function(p){return p.nodes.d;});
  if(panels.length){
    var tick=function(){panels.forEach(function(p){
      var diff=p.deadline-new Date();
      if(diff<=0&&p.nextDeadline){
        /* Roll onto the next gate instead of dying at zero. */
        p.deadline=new Date(p.nextDeadline);
        p.nextDeadline='';
        p.el.classList.remove('is-closed');
        if(p.nextLabel){var l1=findUp(p.el,'[data-lbl]'); if(l1)l1.textContent=p.nextLabel;}
        if(p.nextFor){var l2=findUp(p.el,'.timer-for'); if(l2)l2.textContent=p.nextFor;}
        if(p.nextDate){var l3=findUp(p.el,'.timer-date,.urg-date'); if(l3)l3.innerHTML=p.nextDate;}
        diff=p.deadline-new Date();
      }
      if(diff<=0){
        diff=0;
        if(!p.done){
          p.done=true;
          p.el.classList.add('is-closed');
          if(p.closedLabel){
            var lbl=findUp(p.el,'[data-lbl]');
            if(lbl)lbl.textContent=p.closedLabel;
          }
        }
      }
      var d=Math.floor(diff/86400000),h=Math.floor((diff%86400000)/3600000),
          m=Math.floor((diff%3600000)/60000),s=Math.floor((diff%60000)/1000);
      if(p.nodes.d)p.nodes.d.textContent=pad(d); if(p.nodes.h)p.nodes.h.textContent=pad(h);
      if(p.nodes.m)p.nodes.m.textContent=pad(m); if(p.nodes.s)p.nodes.s.textContent=pad(s);
    });};
    tick(); setInterval(tick,1000);
  }
  /* PWA */
  if('serviceWorker' in navigator){
    window.addEventListener('load',function(){navigator.serviceWorker.register(base+'sw.js').then(function(reg){reg.update();}).catch(function(){});});
    /* NO controllerchange -> location.reload() HERE. That listener is what made
       the home page white out for a few seconds mid-scroll: the worker takes
       control shortly after first load, controllerchange fires, and the page
       reloads under the reader — restoring scroll position, so it looks like a
       rendering glitch at whatever section they had reached rather than a
       reload. It was removed from all 16 HTML pages in v88, but this shared
       module carried its own duplicate and kept firing on the 12 pages that
       load it. The fetch handler is network-first for HTML, so a published
       change is already live on the next page view without any reload. */
  }
})();
