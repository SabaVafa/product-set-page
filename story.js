/* Beschreibung scrollytelling controller.
   Ported (minimally) from the single-product PDP's pdp-b.js, which is intentionally
   omitted on the set page. The .psx-story scenes are dimmed to opacity 0.4 by CSS and
   only become sharp when they carry `.is-current`; the pinned media column cross-fades
   to the `.psx-story__img[data-scene]` carrying `.is-active`. With no controller present
   nothing ever gets those classes, so on desktop every scene stays faint. This restores
   the focus behaviour: the scene nearest the viewport centre is marked current (the rest
   stay softly dimmed by design) and the matching media image fades in.
   Mobile (≤56.25rem) and prefers-reduced-motion force opacity:1 in CSS, so this is a
   no-op there. Purely additive — no markup, copy, image, layout or colour is changed. */
(function () {
  var story = document.querySelector('.psx-story');
  if (!story) return;
  var scenes = Array.prototype.slice.call(story.querySelectorAll('.psx-story__scene'));
  var media = Array.prototype.slice.call(story.querySelectorAll('.psx-story__img'));
  if (!scenes.length) return;

  var current = null;
  function setCurrent(scene) {
    if (!scene || scene === current) return;
    current = scene;
    for (var i = 0; i < scenes.length; i++) {
      scenes[i].classList.toggle('is-current', scenes[i] === scene);
    }
    if (media.length) {
      var id = scene.getAttribute('data-scene');
      for (var j = 0; j < media.length; j++) {
        media[j].classList.toggle('is-active', media[j].getAttribute('data-scene') === id);
      }
    }
  }

  /* No IntersectionObserver (old browser) → give up the focus effect but keep every
     scene fully readable. */
  if (!('IntersectionObserver' in window) || !window.requestAnimationFrame) {
    for (var k = 0; k < scenes.length; k++) scenes[k].classList.add('is-current');
    return;
  }

  /* Choose the scene whose vertical centre is closest to the viewport centre. */
  function pick() {
    var mid = window.innerHeight / 2, best = null, bestDist = Infinity;
    for (var i = 0; i < scenes.length; i++) {
      var r = scenes[i].getBoundingClientRect();
      var dist = Math.abs((r.top + r.bottom) / 2 - mid);
      if (dist < bestDist) { bestDist = dist; best = scenes[i]; }
    }
    setCurrent(best);
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { ticking = false; pick(); });
  }

  /* IntersectionObserver only wakes the rAF-throttled picker as scenes cross the
     viewport; pick() does the actual nearest-centre decision. */
  var io = new IntersectionObserver(onScroll, { threshold: [0, 0.5, 1] });
  for (var m = 0; m < scenes.length; m++) io.observe(scenes[m]);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  pick();   /* set an initial current scene so nothing starts fully dimmed */
})();
