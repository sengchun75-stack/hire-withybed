/* Runs in the head, before first paint. Marks the page as scripted, and as
   animated unless the visitor has asked for reduced motion. common.js removes
   "motion" again if the animation libraries do not arrive. */
(function () {
  var d = document.documentElement;
  d.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) d.classList.add('motion');
})();
