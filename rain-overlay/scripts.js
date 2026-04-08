(() => {
  const VIEWBOX_W = 1920;
  const VIEWBOX_H = 1080;
  const previewMode = new URLSearchParams(window.location.search).get('preview') === '1';

  const slotDefs = {
    cam: { x: 206, y: 128, w: 428, h: 376, r: 154, type: 'round' },
    chat: { x: 200, y: 652, w: 432, h: 302, r: 10, type: 'rect' },
    game: { x: 748, y: 578, w: 1048, h: 342, r: 10, type: 'rect' },
  };

  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');

  let width = 0;
  let height = 0;
  let dpr = 1;
  let time = 0;

  const marks = [];
  const beams = [];
  const streaks = [];
  const sparks = [];

  function scaleX(n) {
    return (n / VIEWBOX_W) * width;
  }

  function scaleY(n) {
    return (n / VIEWBOX_H) * height;
  }

  function scaledSlots() {
    return Object.fromEntries(
      Object.entries(slotDefs).map(([key, value]) => [
        key,
        {
          x: scaleX(value.x),
          y: scaleY(value.y),
          w: scaleX(value.w),
          h: scaleY(value.h),
          r: Math.min(scaleX(value.r), scaleY(value.r)),
          type: value.type,
        },
      ])
    );
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function makeQuestionMark(resetToTop = false) {
    return {
      x: random(0, width),
      y: resetToTop ? random(-height * 0.9, -30) : random(-height * 0.15, height),
      speed: random(height * 0.08, height * 0.22),
      drift: random(-width * 0.01, width * 0.01),
      size: random(height * 0.035, height * 0.13),
      alpha: random(0.16, 0.95),
      blur: random(4, 16),
      glow: random(0.4, 0.95),
      sway: random(-0.6, 0.6),
      phase: random(0, Math.PI * 2),
    };
  }

  function makeBeam() {
    return {
      x: random(0, width),
      width: random(width * 0.002, width * 0.012),
      alpha: random(0.08, 0.35),
      speed: random(0.02, 0.15),
      offset: random(0, 1000),
    };
  }

  function makeStreak(resetToTop = false) {
    const len = random(height * 0.025, height * 0.08);
    return {
      x: random(-width * 0.12, width),
      y: resetToTop ? random(-height, -20) : random(-20, height),
      len,
      speed: random(height * 0.35, height * 0.8),
      drift: random(width * 0.04, width * 0.11),
      alpha: random(0.08, 0.35),
      width: random(1, 3),
    };
  }

  function makeSpark() {
    return {
      x: random(0, width),
      y: random(0, height),
      speed: random(height * 0.15, height * 0.35),
      alpha: random(0.15, 0.5),
      radius: random(0.8, 2.8),
    };
  }

  function roundedRect(context, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    context.beginPath();
    context.moveTo(x + radius, y);
    context.arcTo(x + w, y, x + w, y + h, radius);
    context.arcTo(x + w, y + h, x, y + h, radius);
    context.arcTo(x, y + h, x, y, radius);
    context.arcTo(x, y, x + w, y, radius);
    context.closePath();
  }

  function initSceneData() {
    marks.length = 0;
    beams.length = 0;
    streaks.length = 0;
    sparks.length = 0;

    const markCount = Math.max(36, Math.floor(width / 32));
    const beamCount = Math.max(18, Math.floor(width / 80));
    const streakCount = Math.max(60, Math.floor(width / 18));
    const sparkCount = Math.max(70, Math.floor(width / 20));

    for (let i = 0; i < markCount; i += 1) marks.push(makeQuestionMark());
    for (let i = 0; i < beamCount; i += 1) beams.push(makeBeam());
    for (let i = 0; i < streakCount; i += 1) streaks.push(makeStreak());
    for (let i = 0; i < sparkCount; i += 1) sparks.push(makeSpark());
  }

  function resize() {
    dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initSceneData();
  }

  function drawBackground(dt) {
    ctx.clearRect(0, 0, width, height);

    const base = ctx.createLinearGradient(0, 0, width, height);
    base.addColorStop(0, 'rgba(8,0,0,0.98)');
    base.addColorStop(0.38, 'rgba(26,0,0,0.94)');
    base.addColorStop(0.72, 'rgba(14,0,0,0.94)');
    base.addColorStop(1, 'rgba(2,0,0,0.98)');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);

    const radial = ctx.createRadialGradient(width * 0.56, height * 0.2, width * 0.05, width * 0.56, height * 0.2, width * 0.65);
    radial.addColorStop(0, 'rgba(255,0,0,0.22)');
    radial.addColorStop(0.4, 'rgba(255,0,0,0.08)');
    radial.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    beams.forEach((beam, i) => {
      const pulse = 0.55 + Math.sin(time * beam.speed + beam.offset) * 0.45;
      const beamGradient = ctx.createLinearGradient(beam.x, 0, beam.x, height);
      beamGradient.addColorStop(0, `rgba(255,40,20,${beam.alpha * 0.08})`);
      beamGradient.addColorStop(0.18, `rgba(255,40,20,${beam.alpha * pulse})`);
      beamGradient.addColorStop(0.5, `rgba(255,0,0,${beam.alpha * 0.18})`);
      beamGradient.addColorStop(1, 'rgba(255,0,0,0)');
      ctx.fillStyle = beamGradient;
      ctx.fillRect(beam.x, 0, beam.width, height);

      if (i % 4 === 0) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,245,245,${beam.alpha * 0.95})`;
        ctx.shadowBlur = 18;
        ctx.shadowColor = 'rgba(255,0,0,0.95)';
        ctx.arc(beam.x + beam.width / 2, (time * 120 + beam.offset * 11) % (height + 120) - 40, beam.width * 0.85 + 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    streaks.forEach((streak) => {
      streak.y += streak.speed * dt;
      streak.x += streak.drift * dt * 0.18;
      if (streak.y - streak.len > height + 40 || streak.x > width + 60) {
        Object.assign(streak, makeStreak(true));
      }

      ctx.beginPath();
      ctx.moveTo(streak.x, streak.y);
      ctx.lineTo(streak.x + streak.len * 0.85, streak.y - streak.len);
      ctx.strokeStyle = `rgba(255,36,20,${streak.alpha})`;
      ctx.lineWidth = streak.width;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(255,0,0,0.55)';
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    sparks.forEach((spark) => {
      spark.y += spark.speed * dt;
      spark.x += Math.sin((time + spark.radius) * 1.5) * 0.12;
      if (spark.y > height + 8) {
        spark.x = random(0, width);
        spark.y = random(-60, -10);
      }

      ctx.beginPath();
      ctx.fillStyle = `rgba(255,110,110,${spark.alpha})`;
      ctx.arc(spark.x, spark.y, spark.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    marks.forEach((mark) => {
      mark.y += mark.speed * dt;
      mark.x += mark.drift * dt + Math.sin(time * 0.9 + mark.phase) * mark.sway;
      if (mark.y - mark.size > height + 30 || mark.x < -mark.size * 2 || mark.x > width + mark.size * 2) {
        Object.assign(mark, makeQuestionMark(true));
      }

      ctx.save();
      ctx.font = `900 ${mark.size}px Impact, Haettenschweiler, \"Arial Black\", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = mark.blur;
      ctx.shadowColor = `rgba(255,0,0,${mark.glow})`;
      ctx.fillStyle = `rgba(255,32,20,${mark.alpha})`;
      ctx.fillText('?', mark.x, mark.y);
      ctx.restore();
    });
  }

  function applyCutouts() {
    const slots = scaledSlots();

    if (previewMode) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
      roundedRect(ctx, slots.cam.x, slots.cam.y, slots.cam.w, slots.cam.h, slots.cam.r);
      ctx.fill();
      roundedRect(ctx, slots.chat.x, slots.chat.y, slots.chat.w, slots.chat.h, slots.chat.r);
      ctx.fill();
      roundedRect(ctx, slots.game.x, slots.game.y, slots.game.w, slots.game.h, slots.game.r);
      ctx.fill();

      ctx.lineWidth = 1.5;
      ctx.setLineDash([12, 10]);
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      roundedRect(ctx, slots.cam.x + 14, slots.cam.y + 14, slots.cam.w - 28, slots.cam.h - 28, Math.max(16, slots.cam.r - 14));
      ctx.stroke();
      roundedRect(ctx, slots.chat.x + 10, slots.chat.y + 10, slots.chat.w - 20, slots.chat.h - 20, Math.max(8, slots.chat.r));
      ctx.stroke();
      roundedRect(ctx, slots.game.x + 10, slots.game.y + 10, slots.game.w - 20, slots.game.h - 20, Math.max(8, slots.game.r));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    roundedRect(ctx, slots.cam.x, slots.cam.y, slots.cam.w, slots.cam.h, slots.cam.r);
    ctx.fill();
    roundedRect(ctx, slots.chat.x, slots.chat.y, slots.chat.w, slots.chat.h, slots.chat.r);
    ctx.fill();
    roundedRect(ctx, slots.game.x, slots.game.y, slots.game.w, slots.game.h, slots.game.r);
    ctx.fill();
    ctx.restore();
  }

  let last = performance.now();
  function animate(now) {
    const dt = Math.min((now - last) / 1000, 0.033);
    last = now;
    time += dt;
    drawBackground(dt);
    applyCutouts();
    requestAnimationFrame(animate);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(animate);
})();
