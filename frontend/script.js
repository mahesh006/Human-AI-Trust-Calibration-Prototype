const CONDITIONS = {
  A: {
    label: "Formal / Neutral",
    agentName: "System AI",
    agentRole: "Decision Support Module v2.1",
    avatarLabel: "SYS",
    tone: "formal",
    confidenceStyle: "calibrated",
    intro: (s) =>
      `Analysis complete. Based on a multi-factor evaluation across ${s.factors.length} variables, the recommendation below was generated at ${s.accuracy}% estimated accuracy.`,
  },
  B: {
    label: "Social / Humanlike",
    agentName: "Alex",
    agentRole: "Your AI assistant",
    avatarLabel: "A",
    tone: "social",
    confidenceStyle: "certain",
    intro: (s) =>
      `Hey! I looked into this carefully and I'm ${s.accuracy}% confident about what you should do here — here's my recommendation.`,
  },
};

const SCENARIOS = [
  {
    id: "loan",
    title: "Business Loan Review",
    context:
      "A regional bank is evaluating a small business loan application. The applicant has operated for 3 years, holds a credit score of 678, and is requesting $85,000 for equipment expansion. Revenue trends and sector benchmark data are available.",
    recommendation: "Approve the loan application.",
    factors: [
      "credit score",
      "business age",
      "revenue trend",
      "sector risk",
      "collateral value",
    ],
    accuracy: 73,
    tags: ["Finance", "Credit Risk", "$85K Request"],
  },
  {
    id: "hire",
    title: "Hiring Decision",
    context:
      "A tech company is reviewing a candidate for a senior engineer role. The applicant has 6 years of experience, a strong open-source portfolio, and passed the technical screen — but has no direct team-lead experience.",
    recommendation: "Advance candidate to final-round interviews.",
    factors: [
      "experience",
      "portfolio quality",
      "technical assessment",
      "growth indicators",
    ],
    accuracy: 68,
    tags: ["Talent", "Engineering", "Senior Role"],
  },
  {
    id: "supply",
    title: "Logistics Re-routing",
    context:
      "A logistics manager must decide whether to re-route a time-sensitive shipment due to a weather advisory on the primary corridor. The alternative route adds 18 hours and $2,400 in additional cost.",
    recommendation: "Maintain the original route.",
    factors: [
      "model confidence",
      "delay cost",
      "cargo sensitivity",
      "route alternatives",
    ],
    accuracy: 61,
    tags: ["Logistics", "Weather Risk", "$2.4K Delta"],
  },
];

/* ════════════ STATE ════════════ */
const S = {
  screen: "consent",
  pid: genId(),
  cond: Math.random() < 0.5 ? "A" : "B",
  ti: 0,
  ts: null,
  sc: 50,
  log: [],
};

function genId() {
  return (
    "P" +
    Math.random().toString(36).slice(2, 5).toUpperCase() +
    Date.now().toString(36).slice(-3).toUpperCase()
  );
}

/* ════════════ RENDER ════════════ */
function render() {
  document.getElementById("pidChip").innerHTML =
    `PID <strong>${S.pid}</strong>`;
  const m = document.getElementById("main");
  m.innerHTML = "";
  const el = document.createElement("div");
  el.className = "screen";
  if (S.screen === "consent") rConsent(el);
  else if (S.screen === "task") rTask(el);
  else rComplete(el);
  m.appendChild(el);
}

/* ── CONSENT ── */
function rConsent(el) {
  el.innerHTML = `
<div class="consent-layout">
  <div>
    <div class="eyebrow"><span class="eyebrow-line"></span>Research Study</div>
    <h1 class="consent-title">How do we <em>trust</em> artificial intelligence?</h1>
    <p class="consent-desc">You are invited to take part in a short study on how interface design shapes human decision-making alongside AI. This session involves <strong>3 realistic decision scenarios</strong> and takes roughly 5–8 minutes.</p>
    <div class="meta-grid">
      <div class="meta-item"><div class="mi-label">Duration</div><div class="mi-val">5–8 min</div></div>
      <div class="meta-item"><div class="mi-label">Scenarios</div><div class="mi-val">3</div></div>
      <div class="meta-item"><div class="mi-label">Data type</div><div class="mi-val">Behavioral</div></div>
      <div class="meta-item"><div class="mi-label">Anonymity</div><div class="mi-val">100%</div></div>
    </div>
  </div>
  <div class="consent-right">
    <h3>What will happen</h3>
    <div class="step-list">
      ${[
        [
          "Read the scenario",
          "A realistic professional decision context will be presented.",
        ],
        [
          "Review the AI recommendation",
          "An AI assistant provides a recommendation with supporting context.",
        ],
        [
          "Accept or override",
          "Choose to follow the AI's advice or use your own judgment.",
        ],
        [
          "Rate your confidence",
          "Optionally indicate how confident you feel in your choice.",
        ],
      ]
        .map(
          (s, i) =>
            `<div class="step-item"><div class="step-num">${i + 1}</div><div><div class="step-title">${s[0]}</div><div class="step-desc">${s[1]}</div></div></div>`,
        )
        .join("")}
    </div>
    <button class="btn-consent" onclick="startStudy()">
      I agree — begin study
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
  </div>
</div>`;
}

/* ── TASK ── */
function rTask(el) {
  const s = SCENARIOS[S.ti];
  const c = CONDITIONS[S.cond];
  const pct = Math.round(((S.ti + 1) / SCENARIOS.length) * 100);
  const R = 2 * Math.PI * 16;
  const arc = (s.accuracy / 100) * R;

  el.innerHTML = `
<div class="prog-header">
  <div class="prog-track"><div class="prog-fill" style="width:${pct}%"></div></div>
  <div class="prog-lbl">Scenario ${S.ti + 1} / ${SCENARIOS.length}</div>
</div>
<div class="task-layout">
  <div>
    <div class="scenario-card">
      <div class="scen-top">
        <div class="scen-eyebrow">Scenario ${S.ti + 1} · Decision Context</div>
        <div class="scen-title">${s.title}</div>
      </div>
      <div class="scen-body">
        <p class="scen-text">${s.context}</p>
        <div class="scen-tags">${s.tags.map((t) => `<span class="scen-tag">${t}</span>`).join("")}</div>
      </div>
    </div>
    <div class="self-conf">
      <div class="sc-label"><span>Your decision confidence</span><strong id="scv">${S.sc}%</strong></div>
      <input type="range" min="0" max="100" value="${S.sc}" oninput="S.sc=+this.value;document.getElementById('scv').textContent=this.value+'%'"/>
      <div class="range-ticks"><span>Not sure</span><span>Somewhat</span><span>Very sure</span></div>
    </div>
  </div>
  <div>
    <div class="agent-card">
      <div class="agent-top">
        <div class="agent-avatar ${c.tone}">${c.avatarLabel}</div>
        <div>
          <div class="agent-name">${c.agentName}</div>
          <div class="agent-role">${c.agentRole}</div>
        </div>
        <div class="agent-status"><span class="s-dot"></span>Active</div>
      </div>
      <div class="rec-body">
        <div class="intro-msg">${c.intro(s)}</div>
        <div class="rec-block">
          <div class="rec-lbl">Recommendation</div>
          <div class="rec-text">${s.recommendation}</div>
        </div>
        ${
          c.confidenceStyle === "calibrated"
            ? `
        <div class="conf-widget calibrated">
          <div class="conf-arc">
            <svg viewBox="0 0 40 40"><circle class="arc-bg" cx="20" cy="20" r="16"/><circle class="arc-v" cx="20" cy="20" r="16" stroke="var(--teal)" stroke-dasharray="${arc} ${R}"/></svg>
            <div class="arc-num">${s.accuracy}%</div>
          </div>
          <div class="conf-txt">Estimated accuracy: ${s.accuracy}%</div>
        </div>`
            : `
        <div class="conf-widget certain">
          <div style="font-size:26px;flex-shrink:0">✦</div>
          <div class="conf-txt">I'm about ${s.accuracy}% sure about this one — go for it!</div>
        </div>`
        }
        <div class="dec-btns">
          <button class="btn-dec btn-acc" onclick="decide('accept',event)">
            <div class="rip"></div>
            <div class="btn-ico">✓</div>
            <div class="btn-lbl"><div class="btn-lbl-t">Accept recommendation</div><div class="btn-lbl-s">Follow the AI's advice</div></div>
            <span class="btn-arr">→</span>
          </button>
          <button class="btn-dec btn-ov" onclick="decide('override',event)">
            <div class="rip"></div>
            <div class="btn-ico">✕</div>
            <div class="btn-lbl"><div class="btn-lbl-t">Override recommendation</div><div class="btn-lbl-s">Use your own judgment</div></div>
            <span class="btn-arr">→</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>`;
  S.ts = Date.now();
}

/* ── COMPLETE ── */
function rComplete(el) {
  const accepts = S.log.filter((e) => e.decision === "accept").length;
  const overrides = S.log.filter((e) => e.decision === "override").length;
  const avgLat = Math.round(
    S.log.reduce((a, e) => a + e.latency_ms, 0) / S.log.length,
  );
  const hl = syntaxHL(JSON.stringify(S.log, null, 2));
  el.innerHTML = `
<div class="cpl-layout">
  <div>
    <div class="cpl-badge">◈</div>
    <h2 class="cpl-title">Study complete — thank you!</h2>
    <p class="cpl-sub">Your <strong>${S.log.length} decisions</strong> have been logged under participant <strong>${S.pid}</strong>, Condition <strong>${S.cond}</strong>. Download your session data below.</p>
    <div class="sum-grid">
      <div class="sum-item"><div class="sum-lbl">Accepted</div><div class="sum-val">${accepts}</div><div class="sum-sub">AI followed</div></div>
      <div class="sum-item"><div class="sum-lbl">Overridden</div><div class="sum-val">${overrides}</div><div class="sum-sub">AI overruled</div></div>
      <div class="sum-item"><div class="sum-lbl">Avg. Latency</div><div class="sum-val">${(avgLat / 1000).toFixed(1)}s</div><div class="sum-sub">Decision speed</div></div>
      <div class="sum-item"><div class="sum-lbl">Condition</div><div class="sum-val">${S.cond}</div><div class="sum-sub">${CONDITIONS[S.cond].label}</div></div>
    </div>
    <div class="exp-btns">
      <button class="btn-exp js" onclick="exportJSON()">⬇ Export JSON</button>
      <button class="btn-exp cv" onclick="exportCSV()">⬇ Export CSV</button>
    </div>
  </div>
  <div>
    <div class="log-panel">
      <div class="log-tbar">
        <div class="log-dots"><span></span><span></span><span></span></div>
        <span class="log-fname">${S.pid}_log.json</span>
      </div>
      <div class="log-code">${hl}</div>
    </div>
  </div>
</div>`;
}

/* ════════════ UTILS ════════════ */
function syntaxHL(j) {
  return j
    .replace(/([{}[\],])/g, '<span class="tk-b">$1</span>')
    .replace(/"([\w_]+)":/g, '<span class="tk-k">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="tk-s">"$1"</span>')
    .replace(/: (-?\d+\.?\d*)/g, ': <span class="tk-n">$1</span>');
}

/* ════════════ ACTIONS ════════════ */
window.startStudy = () => {
  S.screen = "task";
  S.ti = 0;
  render();
};

window.decide = (decision, e) => {
  if (e) {
    const btn = e.currentTarget,
      rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left,
      y = e.clientY - rect.top;
    const c = document.createElement("div");
    c.className = "rip-c";
    const sz = Math.max(rect.width, rect.height) * 2;
    c.style.cssText = `width:${sz}px;height:${sz}px;top:${y - sz / 2}px;left:${x - sz / 2}px;background:${decision === "accept" ? "rgba(13,125,107,.2)" : "rgba(181,55,74,.15)"}`;
    btn.querySelector(".rip").appendChild(c);
    setTimeout(() => c.remove(), 700);
  }
  S.log.push({
    participant_id: S.pid,
    condition: S.cond,
    scenario_id: SCENARIOS[S.ti].id,
    decision,
    timestamp: new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    latency_ms: Date.now() - S.ts,
    self_confidence: S.sc,
    confidence_frame: CONDITIONS[S.cond].confidenceStyle,
    ai_accuracy: SCENARIOS[S.ti].accuracy,
  });
  S.sc = 50;
  setTimeout(() => {
    if (S.ti + 1 < SCENARIOS.length) {
      S.ti++;
      render();
    } else {
      S.screen = "complete";
      render();
    }
  }, 280);
};

window.exportJSON = () =>
  dl(
    new Blob([JSON.stringify(S.log, null, 2)], {
      type: "application/json",
    }),
    `${S.pid}_log.json`,
  );
window.exportCSV = () => {
  if (!S.log.length) return;
  const k = Object.keys(S.log[0]);
  dl(
    new Blob(
      [
        [
          k.join(","),
          ...S.log.map((r) =>
            k.map((k2) => JSON.stringify(r[k2] ?? "")).join(","),
          ),
        ].join("\n"),
      ],
      { type: "text/csv" },
    ),
    `${S.pid}_log.csv`,
  );
};
function dl(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

render();
