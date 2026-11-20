/* ==========================================================================
   DCARD V70 — ZERO-EMOJI ENFORCER & CUSTOM ICON GUARD
   Повна заборона системних емодзі iOS / Android / Windows / macOS.
   Будь-який випадковий або введений користувачем Unicode-емодзі миттєво
   перехоплюється й замінюється на фірмову векторну SVG-іконку DCARD (UI_IC).
   ========================================================================== */

(function () {
  "use strict";

  const cp = (...codes) => String.fromCodePoint(...codes);

  const EMOJI_TO_UI_IC = {
    [cp(0x1F3A8)]: "palette",
    [cp(0x1F50A)]: "sndOn",
    [cp(0x1F509)]: "sndOn",
    [cp(0x1F508)]: "sndOn",
    [cp(0x1F507)]: "sndOff",
    [cp(0x1F3AE)]: "gamepad",
    [cp(0x1F579)]: "gamepad",
    [cp(0x1F6E1)]: "shield",
    [cp(0x1F50B)]: "eco",
    [cp(0x1FAAB)]: "eco",
    [cp(0x26A1)]: "bolt",
    [cp(0x2728)]: "sparkle",
    [cp(0x1F451)]: "crown",
    [cp(0x1F39B)]: "sliders",
    [cp(0x1F3A5)]: "camera",
    [cp(0x1F6E0)]: "wrench",
    [cp(0x1F50D)]: "search",
    [cp(0x1F4C8)]: "chart",
    [cp(0x2694)]: "swords",
    [cp(0x1F5E1)]: "swords",
    [cp(0x1F49A)]: "heartGreen",
    [cp(0x2764)]: "heart",
    [cp(0x1F494)]: "brokenHeart",
    [cp(0x1F3DB)]: "pillar",
    [cp(0x1F4DC)]: "scroll",
    [cp(0x1F441)]: "eye",
    [cp(0x1F6AA)]: "exit",
    [cp(0x23E9)]: "skip",
    [cp(0x2692)]: "anvil",
    [cp(0x1F3C6)]: "trophy",
    [cp(0x1F512)]: "lock",
    [cp(0x1F525)]: "fire",
    [cp(0x1F381)]: "chest",
    [cp(0x1F3FA)]: "urn",
    [cp(0x1F0CF)]: "card",
    [cp(0x1F5FA)]: "map",
    [cp(0x1F319)]: "moon",
    [cp(0x2600)]: "sun",
    [cp(0x2620)]: "skull",
    [cp(0x1F480)]: "skull",
    [cp(0x2744)]: "snow",
    [cp(0x1F339)]: "rose",
    [cp(0x1F3AD)]: "mask",
    [cp(0x2699)]: "gear",
    [cp(0x1F9ED)]: "compass",
    [cp(0x2795)]: "plus",
    [cp(0x1F333)]: "forest",
    [cp(0x23F3)]: "hourglass",
    [cp(0x26D3)]: "chain",
    [cp(0x1FAA8)]: "stone",
    [cp(0x1F377)]: "chalice",
    [cp(0x1F4A1)]: "bulb",
    [cp(0x1F3B2)]: "dice",
    [cp(0x1F30C)]: "astral",
    [cp(0x1F7E2)]: "orbGreen",
    [cp(0x1F535)]: "orbBlue",
    [cp(0x1F7E3)]: "orbPurple",
    [cp(0x1F534)]: "orbRed",
    [cp(0x1F7E1)]: "orbGold",
    [cp(0x2660)]: "suitSpade",
    [cp(0x2665)]: "suitHeart",
    [cp(0x2666)]: "suitDiamond",
    [cp(0x2663)]: "suitClub",
    [cp(0x2605)]: "star",
    [cp(0x2B50)]: "star",
    [cp(0x2726)]: "diamond",
    [cp(0x266A)]: "note",
    [cp(0x266B)]: "note",
    [cp(0x266C)]: "note"
  };

  const EMOJI_TEST_RE = /\p{Extended_Pictographic}|\uFE0F/u;
  const EMOJI_SPLIT_RE = /(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*|\uFE0F)/gu;
  const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "SVG", "TITLE"]);

  function resolveIconSvg(rawCluster) {
    const clean = rawCluster.replace(/\uFE0F/g, "");
    const key = EMOJI_TO_UI_IC[clean] || EMOJI_TO_UI_IC[rawCluster];
    if (key && typeof UI_IC !== "undefined" && UI_IC[key]) {
      return UI_IC[key];
    }
    return null;
  }

  function sanitizeTextNode(node) {
    if (!node || node.nodeType !== 3 || !node.nodeValue) return;
    if (!EMOJI_TEST_RE.test(node.nodeValue)) return;
    const parent = node.parentNode;
    if (!parent || SKIP_TAGS.has(parent.nodeName.toUpperCase())) return;
    if (parent.closest && parent.closest("svg")) return;

    const text = node.nodeValue;
    const frag = document.createDocumentFragment();
    let lastIndex = 0;
    let changed = false;

    EMOJI_SPLIT_RE.lastIndex = 0;
    let m;
    while ((m = EMOJI_SPLIT_RE.exec(text)) !== null) {
      const cluster = m[0];
      const idx = m.index;
      if (idx > lastIndex) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex, idx)));
      }
      if (cluster !== "\uFE0F") {
        const svg = resolveIconSvg(cluster);
        if (svg) {
          const holder = document.createElement("span");
          holder.className = "dcard-guard-ico";
          holder.setAttribute("aria-hidden", "true");
          holder.innerHTML = svg;
          frag.appendChild(holder);
        }
      }
      changed = true;
      lastIndex = idx + cluster.length;
    }

    if (!changed) return;
    if (lastIndex < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
    parent.replaceChild(frag, node);
  }

  function sanitizeTree(root) {
    if (!root) return;
    if (root.nodeType === 3) {
      sanitizeTextNode(root);
      return;
    }
    if (root.nodeType !== 1 || SKIP_TAGS.has(root.nodeName.toUpperCase())) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const list = [];
    let cur;
    while ((cur = walker.nextNode())) {
      if (cur.nodeValue && EMOJI_TEST_RE.test(cur.nodeValue)) {
        list.push(cur);
      }
    }
    for (let i = 0; i < list.length; i++) {
      sanitizeTextNode(list[i]);
    }
  }

  function stripSystemEmojis(str) {
    if (typeof str !== "string") return "";
    return str.replace(EMOJI_SPLIT_RE, "").trim();
  }

  window.DCARD_EMOJI_GUARD = {
    sanitizeTree,
    stripSystemEmojis,
    icon(name) {
      return (typeof UI_IC !== "undefined" && UI_IC[name]) ? UI_IC[name] : "";
    }
  };

  function bootGuard() {
    if (!document.body) return;
    sanitizeTree(document.body);

    const observer = new MutationObserver((mutations) => {
      for (let i = 0; i < mutations.length; i++) {
        const mut = mutations[i];
        if (mut.type === "characterData") {
          sanitizeTextNode(mut.target);
        } else if (mut.addedNodes && mut.addedNodes.length) {
          for (let j = 0; j < mut.addedNodes.length; j++) {
            sanitizeTree(mut.addedNodes[j]);
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    document.addEventListener("input", (ev) => {
      const el = ev.target;
      if (!el || (el.tagName !== "INPUT" && el.tagName !== "TEXTAREA")) return;
      if (el.type === "range" || el.type === "checkbox") return;
      if (EMOJI_TEST_RE.test(el.value)) {
        const pos = el.selectionStart;
        el.value = el.value.replace(EMOJI_SPLIT_RE, "");
        if (typeof pos === "number") {
          try { el.setSelectionRange(Math.max(0, pos - 1), Math.max(0, pos - 1)); } catch (_) {}
        }
      }
    }, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootGuard);
  } else {
    bootGuard();
  }
})();
