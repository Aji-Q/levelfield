export const CURSOR_OVERLAY_ID = "levelfield-capture-cursor";

export function cursorInitScript() {
  return `(() => {
  const id = ${JSON.stringify(CURSOR_OVERLAY_ID)};
  const apiKey = "__levelFieldCaptureCursor";

  function install() {
    if (document.getElementById(id)) return document.getElementById(id);
    const host = document.createElement("div");
    host.id = id;
    host.setAttribute("aria-hidden", "true");
    host.style.cssText = [
      "position:fixed", "left:0", "top:0", "width:24px", "height:24px",
      "margin:-3px 0 0 -3px", "pointer-events:none", "z-index:2147483647",
      "transform:translate(-100px,-100px)", "transition:transform 110ms linear"
    ].join(";");
    const pointer = document.createElement("div");
    pointer.style.cssText = "width:13px;height:13px;border:2px solid #f2c14e;border-radius:50%;background:rgba(15,15,12,.72);box-shadow:0 0 0 2px rgba(0,0,0,.45)";
    host.append(pointer);
    (document.documentElement || document.body).append(host);
    return host;
  }

  window[apiKey] = {
    move({ x, y, click }) {
      const host = install();
      host.style.transform = "translate(" + x + "px," + y + "px)";
      if (!click) return;
      const pulse = document.createElement("span");
      pulse.style.cssText = "position:absolute;left:-8px;top:-8px;width:28px;height:28px;border:2px solid #f2c14e;border-radius:50%;opacity:.9;animation:levelfield-capture-pulse .42s ease-out forwards";
      host.append(pulse);
      pulse.addEventListener("animationend", () => pulse.remove(), { once: true });
      window.setTimeout(() => pulse.remove(), 500);
    }
  };

  if (!document.getElementById("levelfield-capture-cursor-style")) {
    const style = document.createElement("style");
    style.id = "levelfield-capture-cursor-style";
    style.textContent = "@keyframes levelfield-capture-pulse{from{transform:scale(.3);opacity:1}to{transform:scale(1.35);opacity:0}}";
    (document.head || document.documentElement).append(style);
  }
})();`;
}

export async function installVisibleCursor(page) {
  if (!page || typeof page.addInitScript !== "function") {
    throw new Error("installVisibleCursor expects a Playwright Page.");
  }
  await page.addInitScript({ content: cursorInitScript() });
}

export async function moveVisibleCursor(page, { x, y, click = false }) {
  if (!page || typeof page.evaluate !== "function") {
    throw new Error("moveVisibleCursor expects a Playwright Page.");
  }
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new Error("Cursor coordinates must be finite numbers.");
  }
  await page.evaluate((payload) => {
    const cursor = globalThis.__levelFieldCaptureCursor;
    if (!cursor) throw new Error("Capture cursor was not installed before the page navigation.");
    cursor.move(payload);
  }, { x, y, click: Boolean(click) });
}
