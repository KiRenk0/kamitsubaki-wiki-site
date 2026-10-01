import gsap from "gsap";

// Utility: Split text content into individual spans for character-level animation
function splitText(selector: string) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    const text = el.textContent || "";
    el.innerHTML = "";
    text.split("").forEach((char) => {
      const span = document.createElement("span");
      span.innerHTML = char === " " ? "&nbsp;" : char;
      el.appendChild(span);
    });
  });
}

// Simulated YAML configuration files from the real wiki site data
const yamlCodeLines = [
  '# YAML Indexing: src/content/artists/vwp/kaf/zh.md',
  '---',
  'locale: "zh"',
  'translationKey: "kaf"',
  'code: "01"',
  'romanizedName: "KAF"',
  'categoryOrder: 1',
  'itemOrder: 1',
  'meta: "DEBUT: 2018.10.18"',
  'statusLabel: "STATUS"',
  'status: "ACTIVE"',
  'name: "花谱"',
  'categoryTitle: "虚拟世代的魔女们"',
  'categorySubtitle: "VIRTUAL WITCH PHENOMENON"',
  '---',
  '',
  '# YAML Indexing: src/content/artists/vwp/rim/zh.md',
  '---',
  'locale: "zh"',
  'translationKey: "rim"',
  'code: "02"',
  'romanizedName: "RIM"',
  'meta: "DEBUT: 2019.10.18"',
  'status: "ACTIVE"',
  'name: "理芽"',
  '---',
  '',
  '# YAML Indexing: src/content/projects/arg/kamitsubaki-city/zh.md',
  '---',
  'locale: "zh"',
  'translationKey: "kamitsubaki-city"',
  'kind: "PROJECT_ARG"',
  'title: "神椿市建设中。"',
  'order: 1',
  '---',
  '',
  '# YAML Indexing: src/content/site/zh.json',
  '{',
  '  "locale": "zh",',
  '  "hero": {',
  '    "brandLines": ["Kamitsubaki", "Studio", "Fan Wiki"],',
  '    "systemVersion": "SYS.VER_2.4.1",',
  '    "coordinates": "COORD: 35.6620° N, 139.7038° E",',
  '    "status": "STATUS: OBSERVING",',
  '    "leftVertical": "以音乐与故事，让世界稍稍改变。"',
  '  }',
  '}',
  '',
  '# YAML Indexing: src/content/contribute/edit-guide/zh.md',
  '---',
  'translationKey: "edit-guide"',
  'title: "编辑指南"',
  'intro: "观测神椿的旅程，欢迎你的加入。"',
  '---'
];

let currentLineIndex = 0;
const displayedLines: string[] = [];

// Appends next line of YAML to the background waterfall to simulate active parsing
function updateCodeWaterfall() {
  const waterfallEl = document.getElementById("code-waterfall");
  if (!waterfallEl) return;

  const line = yamlCodeLines[currentLineIndex];
  displayedLines.push(line);
  if (displayedLines.length > 25) {
    displayedLines.shift(); // Keep it clean and fit to viewport
  }

  waterfallEl.textContent = displayedLines.join("\n");
  currentLineIndex = (currentLineIndex + 1) % yamlCodeLines.length;
}

document.addEventListener("DOMContentLoaded", () => {
  // Pre-process all elements marked for split-characters kinetic animation
  splitText(".split-chars");

  const playBtn = document.getElementById("play-btn");
  if (!playBtn) return;

  playBtn.addEventListener("click", () => {
    // Hide startup control panel
    gsap.set("#controls", { display: "none" });

    // Hide default cursor to look like a recording video playback
    document.body.style.cursor = "none";

    // Start background YAML waterfall interval (ticks every 180ms)
    setInterval(updateCodeWaterfall, 180);

    // Background Mega Text horizontal crawl
    gsap.fromTo("#bg-text", 
      { xPercent: -20 }, 
      { xPercent: -80, duration: 60, ease: "none" }
    );

    const tl = gsap.timeline();

    // ==========================================
    // SCENE 1: Initialization / Boot (0s - 9.5s)
    // ==========================================
    tl.set(".scene", { display: "none", opacity: 0 });
    tl.set("#scene-1", { display: "flex", opacity: 1 });

    // Boot lines console stagger
    tl.from("#boot-title", { opacity: 0, duration: 0.1 }, 0.5);
    tl.from("#boot-ver", { opacity: 0, duration: 0.1 }, 1.0);
    tl.from("#boot-status", { opacity: 0, duration: 0.1 }, 1.5);
    tl.from("#boot-coord", { opacity: 0, duration: 0.1 }, 2.0);

    // Coordinates Scramble/Ticker (from center to Tokyo Shibuya Coordinates)
    const coordVal = { lat: 35.0000, lng: 139.0000 };
    tl.to(coordVal, {
      lat: 35.6620,
      lng: 139.7038,
      duration: 3.5,
      ease: "power1.out",
      onUpdate: () => {
        const coordEl = document.getElementById("boot-coord");
        if (coordEl) {
          coordEl.textContent = `COORD: ${coordVal.lat.toFixed(4)}° N, ${coordVal.lng.toFixed(4)}° E`;
        }
      }
    }, 2.2);

    // Sidebar text slide-in
    tl.from("#sidebar-left", { opacity: 0, y: -50, duration: 1, ease: "power2.out" }, 1.5)
      .from("#sidebar-right", { opacity: 0, y: 50, duration: 1, ease: "power2.out" }, 1.5);

    // Quick glitch flash at boot complete
    tl.call(() => document.body.classList.add("glitch-active"), undefined, 4.0)
      .call(() => document.body.classList.remove("glitch-active"), undefined, 4.3);

    // Huge titles stagger in
    tl.from("#s1-t1 span", {
      opacity: 0, scale: 3, duration: 0.1, stagger: 0.08, ease: "steps(1)"
    }, 4.4);
    tl.from("#s1-t2 span", {
      opacity: 0, y: 50, duration: 0.1, stagger: 0.05, ease: "steps(1)"
    }, 5.0);

    // Scene 1 Exit (Zoom & blur)
    tl.to("#scene-1", { scale: 1.3, opacity: 0, filter: "blur(10px)", duration: 0.6, ease: "power2.in" }, 8.9);
    tl.set("#scene-1", { display: "none" }, 9.5);

    // ==========================================
    // SCENE 2: Database Indexing (9.5s - 24.5s)
    // ==========================================
    tl.set("#scene-2", { display: "flex", opacity: 0 }, 9.5);
    tl.to("#scene-2", { opacity: 1, duration: 0.2 }, 9.6);
    tl.set("#bg-text", { textContent: "DATABASE" }, 9.6);

    // Title sequence
    tl.from("#s2-title span", {
      opacity: 0, scale: 2, stagger: 0.04, duration: 0.08, ease: "steps(1)"
    }, 10.0);

    // Columns entries loading
    tl.from("#db-col-witches", { opacity: 0, y: 40, duration: 0.3, ease: "steps(1)" }, 11.2);
    tl.from("#db-col-witches .db-item", {
      opacity: 0, x: -20, stagger: 0.12, duration: 0.08, ease: "steps(1)"
    }, 11.6);

    tl.from("#db-col-isotopes", { opacity: 0, y: 40, duration: 0.3, ease: "steps(1)" }, 14.5);
    tl.from("#db-col-isotopes .db-item", {
      opacity: 0, x: -20, stagger: 0.12, duration: 0.08, ease: "steps(1)"
    }, 14.9);

    tl.from("#db-col-protocols", { opacity: 0, y: 40, duration: 0.3, ease: "steps(1)" }, 17.5);
    tl.from("#db-col-protocols .db-item", {
      opacity: 0, x: -20, stagger: 0.12, duration: 0.08, ease: "steps(1)"
    }, 17.9);

    // Glitch before scene 2 exits
    tl.call(() => document.body.classList.add("glitch-active"), undefined, 22.8)
      .call(() => document.body.classList.remove("glitch-active"), undefined, 23.2);

    tl.to("#scene-2", { opacity: 0, scale: 0.9, filter: "blur(5px)", duration: 0.5, ease: "power2.in" }, 24.0);
    tl.set("#scene-2", { display: "none" }, 24.5);

    // ==========================================
    // SCENE 3: The Spark / Concert Echo (24.5s - 44.5s)
    // ==========================================
    tl.set("#scene-3", { display: "flex", opacity: 0 }, 24.5);
    tl.to("#scene-3", { opacity: 1, duration: 0.2 }, 24.6);
    tl.set("#bg-text", { textContent: "ECHOES" }, 24.6);

    // Poetic/Concert log monologue. Highly staggered and emotional.
    tl.from("#s3-t1 span", { opacity: 0, scale: 2, stagger: 0.08, duration: 0.05, ease: "steps(1)" }, 25.5);
    
    tl.from("#s3-t2 span", { opacity: 0, y: 15, stagger: 0.06, duration: 0.05, ease: "steps(1)" }, 27.5);
    tl.from("#s3-sub2 span", { opacity: 0, y: 10, stagger: 0.03, duration: 0.05, ease: "steps(1)" }, 28.5);

    tl.from("#s3-t3 span", { opacity: 0, scale: 3, stagger: 0.08, duration: 0.1, ease: "steps(1)" }, 30.8);
    tl.from("#s3-sub3 span", { opacity: 0, y: 10, stagger: 0.03, duration: 0.05, ease: "steps(1)" }, 31.8);
    
    // Invert flash highlight on "struck by Kaf's voice"
    tl.call(() => document.body.classList.add("glitch-active"), undefined, 31.0)
      .call(() => document.body.classList.remove("glitch-active"), undefined, 31.5);

    tl.from("#s3-t4 span", { opacity: 0, y: 15, stagger: 0.05, duration: 0.05, ease: "steps(1)" }, 34.0);
    tl.from("#s3-sub4 span", { opacity: 0, y: 10, stagger: 0.03, duration: 0.05, ease: "steps(1)" }, 35.0);

    tl.from("#s3-t5 span", { opacity: 0, y: 15, stagger: 0.04, duration: 0.05, ease: "steps(1)" }, 37.0);
    tl.from("#s3-sub5 span", { opacity: 0, y: 10, stagger: 0.02, duration: 0.05, ease: "steps(1)" }, 38.0);

    // Climax quote of building the site
    tl.from("#s3-t6 span", { opacity: 0, scale: 2.2, stagger: 0.1, duration: 0.15, ease: "steps(1)" }, 40.5);
    tl.from("#s3-sub6 span", { opacity: 0, y: 10, stagger: 0.04, duration: 0.1, ease: "steps(1)" }, 41.5);

    tl.to("#scene-3", { opacity: 0, y: -50, filter: "blur(8px)", duration: 0.6, ease: "power2.in" }, 44.0);
    tl.set("#scene-3", { display: "none" }, 44.5);

    // ==========================================
    // SCENE 4: Collaboration / Co-Observe (44.5s - 53s)
    // ==========================================
    tl.set("#scene-4", { display: "flex", opacity: 0 }, 44.5);
    tl.to("#scene-4", { opacity: 1, duration: 0.2 }, 44.6);
    tl.set("#bg-text", { textContent: "OBSERVE" }, 44.6);

    tl.from("#s4-eyebrow span", { opacity: 0, scale: 1.5, stagger: 0.04, duration: 0.05, ease: "steps(1)" }, 45.2);
    tl.from(".lang-card", { opacity: 0, scale: 0, stagger: 0.15, duration: 0.2, ease: "back.out(1.5)" }, 46.2);
    tl.from("#s4-stmt1 span", { opacity: 0, x: -20, stagger: 0.05, duration: 0.05, ease: "steps(1)" }, 48.0);
    tl.from("#s4-stmt2 span", { opacity: 0, x: 20, stagger: 0.05, duration: 0.05, ease: "steps(1)" }, 49.5);
    
    // Callout
    tl.from("#s4-callout span", { opacity: 0, scale: 4, stagger: 0.06, duration: 0.1, ease: "steps(1)" }, 50.8);

    tl.to("#scene-4", { opacity: 0, filter: "blur(6px)", duration: 0.5, ease: "power2.in" }, 52.5);
    tl.set("#scene-4", { display: "none" }, 53.0);

    // ==========================================
    // SCENE 5: Climax Outro / Brand (53s - 60s)
    // ==========================================
    tl.set("#scene-5", { display: "flex", opacity: 0 }, 53.0);
    tl.to("#scene-5", { opacity: 1, duration: 0.1 }, 53.1);
    tl.set("#bg-text", { textContent: "KAMITSUBAKI" }, 53.1);

    // Pure white flashbang
    tl.set("#invert-flash", { autoAlpha: 1 }, 53.2);
    tl.to("#invert-flash", { autoAlpha: 0, duration: 1.2, ease: "power2.out" }, 53.3);

    // Logo drops with chaotic rotations
    tl.from("#s5-brand span", {
      opacity: 0, scale: 4, rotationZ: () => Math.random() * 80 - 40,
      stagger: 0.03, duration: 0.08, ease: "steps(1)"
    }, 53.4);

    tl.from("#s5-title span", {
      opacity: 0, scale: 5, stagger: 0.06, duration: 0.08, ease: "steps(1)"
    }, 54.0);

    tl.from("#s5-sub span", {
      opacity: 0, y: 30, stagger: 0.05, duration: 0.05, ease: "steps(1)"
    }, 54.8);

    tl.from("#s5-tagline span", {
      opacity: 0, scale: 3, stagger: 0.12, duration: 0.15, ease: "steps(1)"
    }, 56.0);

    // Footer credits
    tl.from("#s5-copy", { opacity: 0, y: 15, duration: 0.4 }, 57.5);
    tl.from("#s5-disclaimer", { opacity: 0, y: 15, duration: 0.4 }, 58.0);

    // Start recording blinking badge
    tl.to("#recording-badge", { opacity: 1, duration: 0.1 }, 53.5);
    tl.to("#recording-badge", { opacity: 0.2, duration: 0.6, repeat: -1, yoyo: true }, 53.6);

  });
});
