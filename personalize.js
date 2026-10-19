/* Service Momentum demo: client-side personalization from URL params.
   ?biz=&owner=&town=&state=&trade=  — all text is inserted with textContent (never innerHTML). */
(function(){
  var KEY='smPreview',root=document.documentElement;
  function done(){root.classList.remove('sm-pending');}
  try{
  function clean(v,max){if(v==null)return'';v=String(v).replace(/[\u0000-\u001f\u007f<>{}\[\]\\`]/g,'').replace(/\s+/g,' ').trim();return v.length>max?v.slice(0,max).trim():v;}
  var q=new URLSearchParams(location.search),p=null;
  if(q.has('biz')||q.has('owner')||q.has('town')){
    p={biz:clean(q.get('biz'),48),owner:clean(q.get('owner'),24),town:clean(q.get('town'),32),
       state:(clean(q.get('state'),2).match(/^[A-Za-z]{2}$/)||[''])[0].toUpperCase(),
       trade:({'mini-split':'mini-split','minisplit':'mini-split','hvac':'hvac','plumbing':'plumbing'})[clean(q.get('trade'),16).toLowerCase()]||''};
    p.owner=p.owner.split(' ')[0];
    if(!p.biz&&!p.owner&&!p.town)p=null;
    try{if(p)sessionStorage.setItem(KEY,JSON.stringify(p));}catch(e){}
  }else{try{var s=JSON.parse(sessionStorage.getItem(KEY)||'null');if(s&&typeof s==='object')p={biz:clean(s.biz,48),owner:clean(s.owner,24),town:clean(s.town,32),state:/^[A-Z]{2}$/.test(s.state||'')?s.state:'',trade:/^(mini-split|hvac|plumbing)$/.test(s.trade||'')?s.trade:''};}catch(e){}}
  if(!p){done();return;}
  window.SM_PREVIEW=p;
  var biz=p.biz||'Your Company',owner=p.owner,town=p.town;
  root.classList.add('sm-personal');

  // ---- link carry-over ----
  var carry=new URLSearchParams();['biz','owner','town','state','trade'].forEach(function(k){if(p[k])carry.set(k,p[k]);});
  document.querySelectorAll('a[href]').forEach(function(a){
    var h=a.getAttribute('href');if(!h||/^(#|[a-z]+:|\/\/)/i.test(h)||!/\.html(\?|#|$)/.test(h))return;
    var hash='',i=h.indexOf('#');if(i>=0){hash=h.slice(i);h=h.slice(0,i);}
    var base=h,qs='';i=h.indexOf('?');if(i>=0){base=h.slice(0,i);qs=h.slice(i+1);}
    var u=new URLSearchParams(qs);carry.forEach(function(v,k){u.set(k,v);});
    a.setAttribute('href',base+'?'+u.toString()+hash);
  });

  // ---- identity ----
  var slug=(biz.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g,'')||'yourcompany').slice(0,32);
  var email=(owner?owner.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g,''):'')||'owner';
  email=email.slice(0,16)+'@'+slug+'.com';
  var STOP=/^(llc|l\.l\.c\.|inc\.?|co\.?|corp\.?|company|the|and|&|of|services?)$/i;
  var words=biz.replace(/[^\p{L}\p{N}&\s'-]/gu,' ').split(/\s+/).filter(function(w){return w&&!STOP.test(w);});
  if(words.length<2){var all=biz.replace(/[^\p{L}\p{N}&\s'-]/gu,' ').split(/\s+/).filter(Boolean);if(all.length>1)words=all.filter(function(w){return !/^(llc|inc\.?|the|and|&|of)$/i.test(w);});if(!words.length)words=all;}
  var initials=(words.length>1?words[0][0]+words[1][0]:(words[0]||'S')[0]).toUpperCase();
  var hsh=0;for(var k=0;k<biz.length;k++)hsh=(hsh*31+biz.charCodeAt(k))>>>0;
  var hue=[198,212,168,226,186,250,152,204][hsh%8];
  root.style.setProperty('--sm-h',hue);
  function mono(cls){var m=document.createElement('span');m.className='sm-mono '+(cls||'');m.setAttribute('aria-hidden','true');m.textContent=initials;return m;}
  document.querySelectorAll('.workspace-name,.workspace-topline strong').forEach(function(el){el.textContent=biz;el.title=biz;});
  var top=document.querySelector('.workspace-topline>div:first-child');
  if(top){top.classList.add('sm-id');var wrap=document.createElement('div');wrap.className='sm-id__text';while(top.firstChild)wrap.appendChild(top.firstChild);top.appendChild(mono());top.appendChild(wrap);}
  var card=document.querySelector('.workspace-card');if(card){card.classList.add('sm-card');card.insertBefore(mono('sm-mono--lg'),card.firstChild);}
  document.querySelectorAll('.mobile-signed-in').forEach(function(el){el.textContent=email;});
  document.querySelectorAll('.identity-label').forEach(function(el){if(el.firstChild&&el.firstChild.nodeType===3)el.firstChild.nodeValue=email;});
  document.querySelectorAll('.profile-avatar').forEach(function(el){el.textContent=(owner||biz)[0].toUpperCase();});
  document.title=document.title.replace(/\s+—\s+Service Momentum Command Center$/,'')+' — '+biz+' · Command Center';
  var badge=document.querySelector('.demo-badge');if(badge){badge.textContent='Demo preview for '+biz;badge.setAttribute('aria-label','Demo preview for '+biz);}

  // ---- greeting (home) ----
  var dateH=document.querySelector('.today-date');
  if(dateH&&owner){var hr=new Date().getHours(),g=document.createElement('p');g.className='sm-greet';g.textContent=(hr<12?'Good morning, ':hr<17?'Good afternoon, ':'Good evening, ')+owner;dateH.parentNode.insertBefore(g,dateH);}

  // ---- towns: ~40% of the fake book (Portsmouth 14 + Hampton 10 + Exeter 10 + Rye 7 = 41 of 100 weight) ----
  if(town){
    var st=p.state;
    var re=/\b(Portsmouth(?! Ave)|(?<!North )Hampton|Exeter|Rye)(, (?:NH|MA)(?: \d{5})?)?\b/g;
    var rep=function(m,t,tail){return town+(tail?(st?', '+st:''):'');};
    var tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(n){return n.parentNode.closest('script,style,.sm-banner')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}}),n,list=[];
    while((n=tw.nextNode()))list.push(n);
    list.forEach(function(n){var v=n.nodeValue;re.lastIndex=0;if(re.test(v)){re.lastIndex=0;n.nodeValue=v.replace(re,rep);}});
    var only=/^(Portsmouth|Hampton|Exeter|Rye)$/;
    document.querySelectorAll('[data-town]').forEach(function(el){if(only.test(el.dataset.town))el.dataset.town=town;});
    var sel=document.querySelector('select[name=town]');
    if(sel){var seen={};[].slice.call(sel.options).forEach(function(o){if(only.test(o.value)||o.value===town){if(seen[town])o.remove();else{seen[town]=1;o.value=town;o.textContent=town;}}});}
  }

  // ---- trade wording ----
  if(p.trade==='hvac'||p.trade==='plumbing'){
    var lbl=p.trade==='hvac'?'HVAC maintenance':'Plumbing service';
    document.querySelectorAll('.cell-title').forEach(function(el){var t=el.firstChild;if(t&&t.nodeType===3&&t.nodeValue==='Mini-split cleaning')t.nodeValue=lbl;});
  }

  // ---- welcome banner (first page of the session) ----
  var main=document.querySelector('main');
  var seenKey='smPreviewWelcomed:'+biz;
  var shown=false;try{shown=sessionStorage.getItem(seenKey)==='1';}catch(e){}
  if(main&&!shown){
    var poss=/s$/i.test(biz)?biz+'’':biz+'’s';
    var b=document.createElement('section');b.className='sm-banner';b.setAttribute('aria-label','Welcome');
    var kick=document.createElement('p');kick.className='sm-banner__kick';kick.appendChild(mono('sm-mono--sm'));var kt=document.createElement('span');kt.textContent='Preview built for '+(owner||biz);kick.appendChild(kt);
    var h=document.createElement('h2');h.className='sm-banner__title';h.textContent='Here’s what '+poss+' Command Center could look like';
    var what=p.trade==='plumbing'?'who’s due for service':p.trade==='hvac'?'who’s due for a tune-up':'who’s due for a cleaning';
    var d=document.createElement('p');d.className='sm-banner__body';d.textContent='One screen every morning: '+what+', new leads, and where the month stands.'+(town?' Sample customers around '+town+'.':'')+' Tap around, nothing here is real.';
    var btn=document.createElement('button');btn.type='button';btn.className='sm-banner__btn';btn.textContent='Take a look';
    var x=document.createElement('button');x.type='button';x.className='sm-banner__x';x.setAttribute('aria-label','Dismiss');x.textContent='×';
    function close(){b.classList.add('is-leaving');setTimeout(function(){b.remove();},220);try{sessionStorage.setItem(seenKey,'1');}catch(e){}}
    btn.addEventListener('click',close);x.addEventListener('click',close);
    b.appendChild(x);b.appendChild(kick);b.appendChild(h);b.appendChild(d);b.appendChild(btn);
    var anchor=main.querySelector('#page-progress');main.insertBefore(b,anchor?anchor.nextSibling:main.firstChild);
    try{sessionStorage.setItem(seenKey,'1');}catch(e){}
  }
  }catch(err){if(window.console)console.warn('preview personalization skipped',err);}
  done();
})();
