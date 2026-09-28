/* Everything Remote Job · Capacity Audit report, true client-side PDF.
   Same construction as diagnose/report-pdf.js (hand-written PDF, standard
   Helvetica, the official light lockup as a JPEG) but paginated, because a
   capacity report carries ten answers and an action plan. Nothing is sent
   anywhere: the file is assembled in this tab and handed to the browser. */
(function(){
  'use strict';

  var W=595, H=842, L=54, R=541, TOP=780, BOTTOM=78;
  var ORANGE='1 0.341 0.133', INK='0.078 0.067 0.055', SOFT='0.36 0.34 0.32', FAINT='0.55 0.53 0.50';

  function ascii(v){
    return String(v==null?'':v)
      .replace(/[‘’]/g,"'").replace(/[“”]/g,'"')
      .replace(/[–—−]/g,'-').replace(/…/g,'...')
      .replace(/·/g,'-').replace(/→/g,'->').replace(/ /g,' ')
      .replace(/[^\x20-\x7E\n]/g,'');
  }
  function esc(v){return ascii(v).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');}
  /* Width-aware wrap. Helvetica averages ~0.5em per character; bold a little
     wider. Conservative so a line never runs past the right margin. */
  function wrap(text,size,width,bold){
    var max=Math.max(10,Math.floor(width/(size*(bold?0.56:0.51))));
    var words=ascii(text).replace(/\s+/g,' ').trim().split(' ').filter(Boolean), out=[], line='';
    words.forEach(function(w){var n=line?line+' '+w:w;if(n.length>max&&line){out.push(line);line=w;}else line=n;});
    if(line)out.push(line);return out.length?out:[''];
  }
  function bytes(s){return new TextEncoder().encode(s);}
  function concat(parts){
    var len=parts.reduce(function(n,p){return n+p.length;},0), out=new Uint8Array(len), o=0;
    parts.forEach(function(p){out.set(p,o);o+=p.length;});return out;
  }

  function layout(r,imgW,imgH){
    var pages=[], c=null, y=0;
    function newPage(first){
      c=[]; pages.push(c);
      if(first){
        var logoW=230, logoH=logoW*(imgH/imgW);
        c.push('q '+logoW+' 0 0 '+logoH.toFixed(2)+' '+L+' '+(TOP-logoH+14).toFixed(2)+' cm /Im1 Do Q');
        y=TOP-logoH-14;
      }else{
        text('ERJ CAPACITY AUDIT - '+(r.family||''),L,TOP+6,8,true,FAINT);
        rule(TOP-4); y=TOP-28;
      }
    }
    function text(t,x,yy,size,bold,color){
      c.push((color||INK)+' rg BT /'+(bold?'F2':'F1')+' '+size+' Tf '+x+' '+yy.toFixed(2)+' Td ('+esc(t)+') Tj ET');
    }
    function rule(yy,x1,x2){c.push('0.85 0.83 0.80 RG 0.8 w '+(x1||L)+' '+yy.toFixed(2)+' m '+(x2||R)+' '+yy.toFixed(2)+' l S');}
    function need(h){if(y-h<BOTTOM)newPage(false);}
    function block(t,o){
      o=o||{};var size=o.size||10, lead=o.leading||size+4, x=o.x||L, width=(o.width||(R-x));
      var lines=wrap(t,size,width,o.bold);
      lines.forEach(function(line){need(lead);text(line,x,y,size,!!o.bold,o.color);y-=lead;});
      y-=o.after||0;
    }
    function label(t,keep){need(keep||70);y-=6;block(t,{size:8,bold:true,color:ORANGE,after:5});}

    newPage(true);
    text('CAPACITY AUDIT REPORT',L,y,20,true);y-=22;
    text('Can you do the work? The first of five checkpoints.',L,y,10,true,ORANGE);y-=16;
    rule(y);y-=26;

    /* Score block */
    text(String(r.score),L,y-8,40,true);
    text('out of 10',L+(String(r.score).length*23)+8,y-8,11,false,SOFT);
    text(r.tag.toUpperCase(),L+175,y+6,9,true,ORANGE);
    text('Capacity gate: '+(r.pass?'PASSED':'NOT YET PASSED'),L+175,y-10,11,true);
    y-=36;
    block('Role family assessed: '+r.family,{size:9,color:SOFT,after:10});
    block(r.head,{size:13,bold:true,leading:17,after:4});
    block(r.body,{size:10,leading:14,color:SOFT,after:6});
    block(r.gate,{size:9,leading:13,color:SOFT,after:4});

    label('WHERE THE SCORE CAME FROM');
    r.dims.forEach(function(d){
      need(18);
      text(d.label,L,y,10,false);
      var bx=L+190, bw=180;
      c.push('0.90 0.88 0.85 rg '+bx+' '+(y-1)+' '+bw+' 7 re f');
      if(d.value>0)c.push((d.value<=1?ORANGE:INK)+' rg '+bx+' '+(y-1)+' '+(bw*d.value/2).toFixed(2)+' 7 re f');
      text(d.shown+' / 2',bx+bw+14,y,10,true);
      text(d.value<=1?'gap':'',bx+bw+62,y,8,true,ORANGE);
      y-=18;
    });

    label('YOUR ACTION PLAN');
    r.plan.forEach(function(p,i){
      need(34);
      text(String(i+1),L,y,14,true,ORANGE);
      var yy=y;
      block(p.title,{x:L+22,size:10.5,bold:true,leading:14,after:1});
      block(p.body,{x:L+22,size:9.5,leading:13,color:SOFT,after:8});
      if(y>yy-16)y=yy-16;
    });

    if(r.gaps.length){
      label('WHAT TO BUILD, QUESTION BY QUESTION',130);
      block('Every answer below "Independently" (or "Real work" for evidence) is listed here, the central task first, then lowest first.',{size:9,color:SOFT,leading:12,after:8});
      r.gaps.forEach(function(g){
        need(60);
        block((g.core?'CENTRAL TASK - ':'')+g.dim+'  |  your answer: '+g.answer,{size:8,bold:true,color:g.core?ORANGE:FAINT,after:2});
        block(g.q,{size:10,bold:true,leading:13,after:3});
        block('Do this: '+g.fix,{x:L+12,size:9.5,leading:13,color:SOFT,after:10});
      });
    }

    if(r.strong.length){
      label('WHAT YOU ALREADY HAVE');
      block(r.strong.join(', ')+'.',{size:10,leading:14,after:4});
    }

    label('YOUR ANSWERS');
    r.answers.forEach(function(a,i){
      var lines=wrap(a.q,9,R-L-130,false);
      need(lines.length*12+6);
      var yy=y;
      text(String(i+1<10?'0'+(i+1):i+1),L,y,8,true,FAINT);
      lines.forEach(function(line){text(line,L+20,y,9,false,SOFT);y-=12;});
      text(a.answer,R-100,yy,9,true,a.v===2?INK:ORANGE);
      y-=5;
    });

    label('NEXT');
    block(r.next,{size:10,leading:14,after:6});
    block('Want a human to check the claim rather than the self-report? Send this report on WhatsApp with the word CAPACITY for a Level 2 evidence check.',{size:10,bold:true,leading:14,after:6});
    block('WhatsApp: +234 803 292 5957',{size:9,bold:true,color:ORANGE});

    /* footers on every page */
    pages.forEach(function(pc,i){
      c=pc;
      rule(59);
      text('Everything Remote Job  |  Work Beyond Borders.',L,40,8,true);
      text('everythingremotejob.com/capacityscan/  |  Generated: '+ascii(r.date)+'  |  Self-scan: only as honest as the answers given.',L,27,7,false,SOFT);
      text('Page '+(i+1)+' of '+pages.length,R-48,40,7,false,FAINT);
    });
    return pages.map(function(p){return p.join('\n')+'\n';});
  }

  function makePdf(r,jpeg,imgW,imgH){
    var streams=layout(r,imgW,imgH), n=streams.length;
    /* 1 catalog · 2 pages · 3 F1 · 4 F2 · 5 image · then (page, content) pairs */
    var objs=[];
    var kids=[];for(var k=0;k<n;k++)kids.push((6+k*2)+' 0 R');
    objs[1]=bytes('<< /Type /Catalog /Pages 2 0 R >>');
    objs[2]=bytes('<< /Type /Pages /Kids ['+kids.join(' ')+'] /Count '+n+' >>');
    objs[3]=bytes('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    objs[4]=bytes('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    objs[5]=concat([bytes('<< /Type /XObject /Subtype /Image /Width '+imgW+' /Height '+imgH+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+jpeg.length+' >>\nstream\n'),jpeg,bytes('\nendstream')]);
    streams.forEach(function(s,i){
      var sb=bytes(s), pid=6+i*2, cid=pid+1;
      objs[pid]=bytes('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+W+' '+H+'] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << /Im1 5 0 R >> >> /Contents '+cid+' 0 R >>');
      objs[cid]=concat([bytes('<< /Length '+sb.length+' >>\nstream\n'),sb,bytes('endstream')]);
    });
    var total=objs.length-1, parts=[bytes('%PDF-1.4\n%ERJ\n')], offsets=[], pos=parts[0].length;
    for(var i=1;i<=total;i++){
      offsets[i]=pos;
      var head=bytes(i+' 0 obj\n'), tail=bytes('\nendobj\n');
      parts.push(head,objs[i],tail);pos+=head.length+objs[i].length+tail.length;
    }
    var xr='xref\n0 '+(total+1)+'\n0000000000 65535 f \n';
    for(var j=1;j<=total;j++)xr+=String(offsets[j]).padStart(10,'0')+' 00000 n \n';
    xr+='trailer\n<< /Size '+(total+1)+' /Root 1 0 R >>\nstartxref\n'+pos+'\n%%EOF';
    parts.push(bytes(xr));
    return new Blob(parts,{type:'application/pdf'});
  }

  async function download(r){
    try{
      var res=await fetch('../diagnose/erj-official-logo-light.jpg?v=126');
      if(!res.ok)throw new Error('logo');
      var jpeg=new Uint8Array(await res.arrayBuffer());
      var blob=makePdf(r,jpeg,1400,380);
      var url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;
      a.download='ERJ-Capacity-Audit-'+ascii(r.familyShort||'Report').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'')+'-'+String(r.score).replace('.','-')+'-of-10.pdf';
      document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},4000);
      return true;
    }catch(err){
      console.error('ERJ capacity PDF export failed',err);
      alert('The PDF could not be generated on this device. Refresh once and try again, or use your browser’s Print → Save as PDF.');
      return false;
    }
  }
  window.ERJCapacityPDF={download:download,makePdf:makePdf};
})();
