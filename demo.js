(function(){
  var toast=document.querySelector('.demo-toast'),t;
  function say(msg){if(!toast)return;toast.textContent=msg;toast.hidden=false;clearTimeout(t);t=setTimeout(function(){toast.hidden=true},2200);}
  document.addEventListener('click',function(ev){
    var a=ev.target.closest('a');if(!a)return;var h=a.getAttribute('href')||'';
    if(h==='#call'){ev.preventDefault();say('Opens your phone to call them');}
    else if(h==='#text'){ev.preventDefault();say('Opens your texts with their number filled in');}
    else if(h==='#map'){ev.preventDefault();say('Opens directions in Maps');}
    else if(h==='#refresh'){ev.preventDefault();say('Marked done. Next cleaning due in 12 months');}
    else if(h==='#add-lead'){ev.preventDefault();say('Add a lead: name, phone, town, units');}
    else if(h==='#'){ev.preventDefault();}
  });
  // Due Service: Contacted turns the row green.
  document.querySelectorAll('form.inline-form').forEach(function(f){
    f.addEventListener('submit',function(ev){ev.preventDefault();var li=f.closest('li');if(!li)return;
      var undo=!!f.querySelector('[name=undo]');
      li.className=li.className.replace(/due-row--\w+/,undo?'due-row--red':'due-row--green');
      var when=li.querySelector('.due-row__when');
      if(when&&!undo){when.innerHTML='<span class="due-dot" aria-hidden="true"></span>Contacted just now';}
      var b=f.querySelector('button');if(b&&!undo){b.textContent='Undo';b.className='act act--ghost';f.insertAdjacentHTML('beforeend','<input type="hidden" name="undo" value="1">');}
      say(undo?'Moved back to the call list':'Marked contacted');
    });
  });
  document.querySelectorAll('form[data-demo-refresh]').forEach(function(f){f.addEventListener('submit',function(ev){ev.preventDefault();say('Visit recorded. Next due moves out 12 months');});});
  document.querySelectorAll('form.signout,form.more-signout').forEach(function(f){f.addEventListener('submit',function(ev){ev.preventDefault();say('Demo account: sign out is turned off');});});
  document.querySelectorAll('form.goal-form').forEach(function(f){f.addEventListener('submit',function(ev){ev.preventDefault();say('Goal saved');});});
  // Customers: live search + filters.
  var form=document.querySelector('form[data-demo-search]');
  if(form){
    var grid=document.querySelector('.record-grid'),cards=[].slice.call(grid.children),total=document.querySelector('[data-customer-total]');
    var params=new URLSearchParams(location.search);if(params.get('show')==='due')form.show.value='due';
    function apply(ev){if(ev)ev.preventDefault();
      var q=form.search.value.trim().toLowerCase(),show=form.show.value,town=form.town.value,sort=form.sort.value,n=0;
      var list=cards.slice();
      if(sort==='due')list.sort(function(a,b){return a.querySelectorAll('dd')[1].textContent.localeCompare(b.querySelectorAll('dd')[1].textContent)});
      if(sort==='recent')list.sort(function(a,b){return b.querySelector('dd').textContent.localeCompare(a.querySelector('dd').textContent)});
      list.forEach(function(c){grid.appendChild(c);
        var ok=(!q||c.dataset.name.indexOf(q)>=0||c.dataset.town.toLowerCase().indexOf(q)>=0||c.dataset.phone.indexOf(q.replace(/\D/g,'')||'~')>=0)&&(show!=='due'||c.dataset.due==='1')&&(!town||c.dataset.town===town);
        c.style.display=ok?'':'none';if(ok)n++;});
      total.textContent=n+' in this view, one row per person. Recorded job value is not proof of payment.';
    }
    form.addEventListener('submit',apply);form.search.addEventListener('input',apply);[form.show,form.town,form.sort].forEach(function(s){s.addEventListener('change',apply)});
    if(params.get('show'))apply();
  }
})();
