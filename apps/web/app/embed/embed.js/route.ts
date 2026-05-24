import { NextResponse } from "next/server";

export const runtime = "edge";

/**
 * One-liner embed script. Site authors include:
 *   <div id="promptforge"></div>
 *   <script src="https://promptforge.dev/embed/embed.js"></script>
 *
 * The script finds #promptforge (or [data-promptforge] elements) and
 * mounts our /embed page inside as a sized iframe.
 */
const SCRIPT = `(function () {
  var APP = '${process.env.NEXT_PUBLIC_APP_URL ?? "https://promptforge.dev"}';

  function mount(target) {
    if (target.dataset.promptforgeMounted === '1') return;
    target.dataset.promptforgeMounted = '1';

    var iframe = document.createElement('iframe');
    iframe.src = APP + '/embed';
    iframe.title = 'PromptForge';
    iframe.style.cssText = 'width:100%;max-width:680px;height:520px;border:0;border-radius:12px;display:block;margin:0 auto;';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    target.innerHTML = '';
    target.appendChild(iframe);
  }

  function init() {
    var byId = document.getElementById('promptforge');
    if (byId) mount(byId);
    var byAttr = document.querySelectorAll('[data-promptforge]');
    for (var i = 0; i < byAttr.length; i++) mount(byAttr[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
`;

export async function GET() {
  return new NextResponse(SCRIPT, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
