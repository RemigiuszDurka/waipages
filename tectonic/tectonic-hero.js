/* The globe uses catalog coordinates. Expanding rings are a conceptual motion
   treatment, not measured wave travel, arrival time, or affected area. */
(() => {
  "use strict";
  const source = window.QUAKE_DATA;
  const canvas = document.getElementById("hero-seismo");
  const button = document.getElementById("hero-motion");
  if (!source?.events?.length || !canvas || !button) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const rad = Math.PI / 180;
  const focus = source.events.filter(e => e[0] === 2011 && e[1] === 3 && e[2] === 11)
    .sort((a, b) => b[5] - a[5])[0];
  const major = source.events.filter(e => e[5] >= 8);
  const march = Array.from({length: 31}, (_, i) =>
    source.events.filter(e => e[0] === 2011 && e[1] === 3 && e[2] === i + 1).length);
  const peak = Math.max(...march);
  document.querySelector(".hero-instrument strong").textContent = `${focus[2]} MAR ${focus[0]}`;
  document.querySelector(".hero-instrument small").textContent = `Epicentre: CSV row ${focus[6]} · pulse timing illustrative`;
  document.querySelector(".hero-seismogram b").innerHTML = `${peak} <small>PEAK DAY</small>`;
  const landRings = source.land.features.flatMap(feature =>
    feature.geometry.type === "Polygon"
      ? feature.geometry.coordinates
      : feature.geometry.coordinates.flat());
  const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
  let enabled = !motionPreference.matches;
  let inView = true;
  let frame = 0;
  let last = 0;
  let elapsed = 0;

  function project(lon, lat, centerLon, centerLat, x0, y0, radius) {
    const phi = lat * rad, delta = (lon - centerLon) * rad, phi0 = centerLat * rad;
    const z = Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(delta);
    return {
      x: x0 + radius * Math.cos(phi) * Math.sin(delta),
      y: y0 - radius * (Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(delta)),
      visible: z > 0
    };
  }

  function drawPolyline(points, projection) {
    ctx.beginPath();
    let open = false;
    for (const point of points) {
      const p = projection(point[0], point[1]);
      if (!p.visible) { open = false; continue; }
      if (!open) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
      open = true;
    }
    ctx.stroke();
  }

  function waveRing(lon, lat, angularRadius, projection) {
    const phi = lat * rad, lambda = lon * rad;
    const points = [];
    for (let i = 0; i <= 180; i++) {
      const bearing = i / 180 * Math.PI * 2;
      const lat2 = Math.asin(Math.sin(phi) * Math.cos(angularRadius) +
        Math.cos(phi) * Math.sin(angularRadius) * Math.cos(bearing));
      const lon2 = lambda + Math.atan2(
        Math.sin(bearing) * Math.sin(angularRadius) * Math.cos(phi),
        Math.cos(angularRadius) - Math.sin(phi) * Math.sin(lat2));
      points.push([lon2 / rad, lat2 / rad]);
    }
    drawPolyline(points, projection);
  }

  function draw(time) {
    const box = canvas.getBoundingClientRect(), w = box.width, h = box.height;
    if (!w || !h) return;
    const dpr = Math.min(devicePixelRatio || 1, 1.75);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const cx = w * .54, cy = h * .46, radius = Math.min(w * .36, h * .33);
    const centerLon = focus[4] + Math.sin(time * .00013) * 12;
    const centerLat = 22 + Math.sin(time * .00010) * 4;
    const projection = (lon, lat) => project(lon, lat, centerLon, centerLat, cx, cy, radius);
    const epicentre = projection(focus[4], focus[3]);

    // Outer instrument rings and latitude/longitude hairlines.
    ctx.save();
    ctx.translate(cx, cy);
    for (const factor of [1.08, 1.28, 1.52]) {
      ctx.beginPath(); ctx.arc(0, 0, radius * factor, 0, Math.PI * 2);
      ctx.strokeStyle = factor === 1.08 ? "#9dbdb226" : "#bd735826";
      ctx.lineWidth = 1; ctx.stroke();
    }
    for (let a = 0; a < 360; a += 10) {
      const angle = a * rad, r0 = radius * 1.09, r1 = radius * (a % 30 ? 1.115 : 1.15);
      ctx.beginPath(); ctx.moveTo(Math.cos(angle) * r0, Math.sin(angle) * r0);
      ctx.lineTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
      ctx.strokeStyle = a % 30 ? "#b6c6b04d" : "#f5a5769a"; ctx.stroke();
    }
    ctx.restore();

    const atmosphere = ctx.createRadialGradient(cx - radius * .4, cy - radius * .25, radius * .15, cx, cy, radius * 1.14);
    atmosphere.addColorStop(0, "#5e5446");
    atmosphere.addColorStop(.38, "#253d3b");
    atmosphere.addColorStop(.79, "#112727");
    atmosphere.addColorStop(1, "#e97b5140");
    ctx.save();
    ctx.shadowColor = "#ef855773"; ctx.shadowBlur = 42;
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = atmosphere; ctx.fill(); ctx.restore();

    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2); ctx.clip();
    ctx.strokeStyle = "#92b4a83c"; ctx.lineWidth = .8;
    for (let lon = -180; lon <= 180; lon += 20) {
      const points = [];
      for (let lat = -90; lat <= 90; lat += 3) points.push([lon, lat]);
      drawPolyline(points, projection);
    }
    for (let lat = -80; lat <= 80; lat += 20) {
      const points = [];
      for (let lon = -180; lon <= 180; lon += 3) points.push([lon, lat]);
      drawPolyline(points, projection);
    }
    ctx.strokeStyle = "#e1cfaa9a"; ctx.lineWidth = 1.15;
    for (const ring of landRings) drawPolyline(ring, projection);
    for (const e of major) {
      const p = projection(e[4], e[3]);
      if (!p.visible) continue;
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(1.5, (e[5] - 7) * 1.4), 0, Math.PI * 2);
      ctx.fillStyle = "#f7b98b8c"; ctx.fill();
    }
    for (let i = 0; i < 4; i++) {
      const phase = ((time / 6500 + i / 4) % 1);
      ctx.strokeStyle = `rgba(255,167,110,${(.83 * (1 - phase)).toFixed(3)})`;
      ctx.lineWidth = 3.5 - phase * 2;
      ctx.shadowColor = "#f47e52"; ctx.shadowBlur = 15;
      waveRing(focus[4], focus[3], .04 + phase * 1.5, projection);
    }
    ctx.restore();

    const light = ctx.createRadialGradient(epicentre.x, epicentre.y, 0, epicentre.x, epicentre.y, 36);
    light.addColorStop(0, "#fff4d9bd"); light.addColorStop(.18, "#ffb17797"); light.addColorStop(1, "#f2764800");
    ctx.fillStyle = light; ctx.beginPath(); ctx.arc(epicentre.x, epicentre.y, 36, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff3d8"; ctx.beginPath(); ctx.arc(epicentre.x, epicentre.y, 3.8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#ffc59d"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(epicentre.x + 8, epicentre.y - 8);
    ctx.lineTo(Math.min(w - 96, epicentre.x + 54), epicentre.y - 47); ctx.stroke();
    ctx.fillStyle = "#fbe9d2"; ctx.font = "700 11px 'Space Mono',monospace";
    ctx.fillText("M" + focus[5].toFixed(1), Math.min(w - 92, epicentre.x + 59), epicentre.y - 47);

    // This lower strip is observed daily record count, not a waveform.
    const left = w * .06, right = w * .94, base = h * .88, top = h * .76;
    ctx.strokeStyle = "#9fae9b46"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(left, base); ctx.lineTo(right, base); ctx.stroke();
    ctx.beginPath();
    march.forEach((n, i) => {
      const x = left + (right - left) * i / 30;
      const y = base - (top - base) * -Math.sqrt(n / peak);
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    });
    ctx.strokeStyle = "#ffa978"; ctx.lineWidth = 2; ctx.shadowColor = "#ed774d"; ctx.shadowBlur = 12; ctx.stroke(); ctx.shadowBlur = 0;
    const peakX = left + (right - left) * 10 / 30;
    ctx.fillStyle = "#fff2d4"; ctx.beginPath(); ctx.arc(peakX, top, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#e1baa0"; ctx.font = "10px 'Space Mono',monospace";
    ctx.fillText("11 MAR", peakX + 9, top - 4);
  }

  function syncButton() {
    button.setAttribute("aria-pressed", String(enabled));
    button.setAttribute("aria-label", enabled ? "Pause banner animation" : "Play banner animation");
    button.textContent = enabled ? "Ⅱ PAUSE MOTION" : "▶ PLAY MOTION";
  }
  function tick(now) {
    frame = 0;
    if (!enabled || !inView || document.hidden) return;
    if (!last || now - last >= 32) {
      elapsed += last ? Math.min(64, now - last) : 0;
      last = now;
      draw(elapsed);
    }
    frame = requestAnimationFrame(tick);
  }
  function schedule() {
    if (enabled && inView && !document.hidden && !frame) {
      last = 0;
      frame = requestAnimationFrame(tick);
    }
  }
  button.addEventListener("click", () => {
    enabled = !enabled;
    if (!enabled) { cancelAnimationFrame(frame); frame = 0; }
    syncButton(); schedule();
  });
  motionPreference.addEventListener("change", e => {
    enabled = !e.matches;
    if (!enabled) { cancelAnimationFrame(frame); frame = 0; }
    syncButton(); draw(elapsed); schedule();
  });
  document.addEventListener("visibilitychange", schedule);
  new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    if (!inView) { cancelAnimationFrame(frame); frame = 0; }
    schedule();
  }).observe(canvas);
  new ResizeObserver(() => draw(elapsed)).observe(canvas);
  syncButton();
  draw(0); schedule();
})();
