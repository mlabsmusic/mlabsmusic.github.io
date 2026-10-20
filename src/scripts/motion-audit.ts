// Local diagnostics only; excluded from the production build by ProductLayout.
if (new URLSearchParams(location.search).has('motion-audit')) {
  const panel = document.createElement('aside');
  panel.style.cssText = 'position:fixed;bottom:8px;left:8px;right:8px;z-index:1000;padding:12px;background:#102326;color:white;font:11px monospace;border-radius:10px;max-height:28vh;overflow:auto';
  const start = document.createElement('button'); start.textContent = 'Medir interacciones (15 s)';
  const output = document.createElement('pre'); output.id = 'motion-report'; output.style.whiteSpace = 'pre-wrap';
  panel.append(start, output); document.body.append(panel);
  start.addEventListener('click', () => {
    start.disabled = true; output.textContent = 'Midiendo: abra/cierre el menú o cambie pestañas.';
    const frames: {time:number; delta:number; interaction:boolean}[] = [];
    const clicks: number[] = []; const tasks: {start:number;duration:number}[] = [];
    const begin = performance.now(); let previous = begin; let activeUntil = 0;
    const track = (event: Event) => {
      if ((event.target as Element).closest('.menu-toggle, [data-tool], [data-filter], .widget-collapse')) {
        const now = performance.now(); clicks.push(now); activeUntil = now + 550;
      }
    };
    document.addEventListener('click', track, true);
    const observer = new PerformanceObserver(list => list.getEntries().forEach(entry => tasks.push({start:entry.startTime,duration:entry.duration})));
    if (PerformanceObserver.supportedEntryTypes.includes('longtask')) observer.observe({type:'longtask'});
    function frame(now: number) {
      frames.push({time:now,delta:now-previous,interaction:now<=activeUntil}); previous=now;
      if (now-begin < 15000) { requestAnimationFrame(frame); return; }
      document.removeEventListener('click', track, true); observer.disconnect(); start.disabled = false;
      const all = frames.slice(1).map(f=>f.delta).sort((a,b)=>a-b);
      const active = frames.slice(1).filter(f=>f.interaction).map(f=>f.delta).sort((a,b)=>a-b);
      const percentile = (a:number[], p:number) => a.length ? +a[Math.min(a.length-1,Math.floor(a.length*p))].toFixed(2) : null;
      const cadence = percentile(all,.5) || 16.67;
      const report = {durationMs:+(now-begin).toFixed(1),clicks:clicks.length,frames:all.length,medianFrameMs:cadence,observedHz:+(1000/cadence).toFixed(1),interactionFrames:active.length,interactionP95Ms:percentile(active,.95),interactionMaxMs:active.length?+Math.max(...active).toFixed(2):null,interactionOver1_5Frames:active.filter(d=>d>cadence*1.5).length,longTasks:tasks,menuExpanded:document.querySelector('.menu-toggle')?.getAttribute('aria-expanded')};
      output.textContent = JSON.stringify(report,null,2);
    }
    requestAnimationFrame(frame);
  });
}
