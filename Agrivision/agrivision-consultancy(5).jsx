import { useState, useEffect, useCallback } from "react";

// ─── THEME ────────────────────────────────────────────────────
// ─── PALETTE ─────────────────────────────────────────────────
// Deep Forest (professionalism + development sector credibility)
// Harvest Gold (enterprise + prosperity + economic results)
// Warm Ivory (human-centred, approachable, not cold corporate)
// Charcoal (authoritative body text, calm confidence)
// Earth Sienna (field implementation, practical grounding)
const T = {
  forest:    "#1A3329",   // deep forest — primary dark
  forestMid: "#24472E",   // nav, headers
  green:     "#2D6A4F",   // primary green — mature, not bright
  greenL:    "#3D8B6A",   // interactive green
  greenPale: "#E8F4EE",   // tint backgrounds
  gold:      "#B8860B",   // dark gold — enterprise, measured
  goldL:     "#D4A017",   // lighter gold for hover/highlights
  goldPale:  "#FBF5E0",   // gold tint backgrounds
  ivory:     "#F5F0E8",   // warm ivory — primary background
  ivoryDark: "#ECE6D8",   // section dividers
  charcoal:  "#2C3A30",   // body text — calm authority
  earth:     "#7A5C3A",   // earth accent — field reality
  earthPale: "#F2EBE0",   // earth tint
  slate:     "#5A6E62",   // secondary text
  red:       "#B83232",
  redPale:   "#FDECEA",
  blue:      "#2563EB",
  border:    "rgba(26,51,41,0.12)",
};

const ADMIN_CREDENTIALS = {
  username: "agrivision.admin",
  password: "AgriVision@KE25!",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Inter',sans-serif;background:#F5F0E8;color:#2C3A30;min-height:100vh}
input,textarea,select,button{font-family:'Inter',sans-serif}
.pf{font-family:'Playfair Display',serif}
.fade{animation:fadeIn .35s ease}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.toast{position:fixed;bottom:28px;right:28px;background:#1B2F1A;color:#F4F1E8;padding:.8rem 1.4rem;border-radius:8px;font-size:.84rem;z-index:9999;animation:slideUp .3s ease;box-shadow:0 8px 32px rgba(0,0,0,.28);display:flex;align-items:center;gap:.6rem;border-left:3px solid #B8860B}
@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:800;display:flex;align-items:center;justify-content:center;padding:1rem}
.modal{background:#fff;border-radius:12px;padding:2rem;width:100%;max-width:520px;max-height:92vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,.18)}
.star{color:#C8962A}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:#F5F0E8}
::-webkit-scrollbar-thumb{background:#B8860B;border-radius:3px}
.field-label{font-size:.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#607A5C;margin-bottom:.35rem;display:block}
.field-input{width:100%;padding:.65rem .9rem;border:1.5px solid rgba(27,47,26,0.2);border-radius:8px;font-size:.88rem;color:#1B2F1A;background:#fff;outline:none;transition:border .18s}
.field-input:focus{border-color:#3D7A35}
.pro-card{background:#fff;border-radius:12px;padding:1.5rem;position:relative;transition:box-shadow .2s,transform .2s;border:1.5px solid transparent}
.pro-card:hover{box-shadow:0 8px 28px rgba(27,47,26,.13);transform:translateY(-2px);border-color:rgba(200,150,42,.3)}
.nav-btn{background:none;border:none;cursor:pointer;transition:all .18s;border-radius:6px;font-family:'Inter',sans-serif}
.hero-wave{position:absolute;inset:0;width:100%;height:100%;opacity:.07}
.chat-bubble-user{background:#1B2F1A;color:#F4F1E8;border-radius:16px 16px 4px 16px;padding:.75rem 1rem;font-size:.85rem;max-width:80%;line-height:1.6;align-self:flex-end}
.chat-bubble-bot{background:#fff;color:#1B2F1A;border-radius:16px 16px 16px 4px;padding:.75rem 1rem;font-size:.85rem;max-width:85%;line-height:1.6;align-self:flex-start;border:1.5px solid rgba(27,47,26,0.1)}
.chat-window{position:fixed;bottom:90px;right:24px;width:360px;max-height:520px;background:#F8FAF6;border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.22);display:flex;flex-direction:column;z-index:700;border:1.5px solid rgba(27,47,26,0.12);overflow:hidden;animation:slideUp .3s ease}
.chat-fab{position:fixed;bottom:24px;right:24px;width:58px;height:58px;border-radius:50%;background:#1B2F1A;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.4rem;z-index:700;box-shadow:0 6px 24px rgba(0,0,0,.25);transition:transform .2s,background .2s}
.chat-fab:hover{transform:scale(1.08);background:#27553E}
@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:640px){.chat-window{width:calc(100vw - 32px);right:16px;bottom:80px}}
`;

// ─── STORAGE ──────────────────────────────────────────────────
function useStorage(key, fallback) {
  const [data, setData] = useState(fallback);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (async () => {
      try { const r = await window.storage.get(key); if (r?.value) setData(JSON.parse(r.value)); }
      catch (_) {}
      setReady(true);
    })();
  }, [key]);
  const save = useCallback(async (val) => {
    const next = typeof val === "function" ? val(data) : val;
    setData(next);
    try { await window.storage.set(key, JSON.stringify(next)); } catch (_) {}
  }, [key, data]);
  return [data, save, ready];
}

// ─── TOAST ────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return <div className="toast">✓ {msg}</div>;
}

// ─── SHARED UI ────────────────────────────────────────────────
const Btn = ({ children, onClick, variant = "primary", small, style = {}, disabled }) => {
  const base = {
    border: "none", borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 600, fontSize: small ? "0.78rem" : "0.875rem",
    padding: small ? "0.38rem 0.9rem" : "0.72rem 1.5rem",
    transition: "all .18s", letterSpacing: "0.01em", opacity: disabled ? 0.6 : 1, ...style
  };
  const variants = {
    primary: { background: T.forest, color: T.ivory },
    gold: { background: T.gold, color: T.forest },
    green: { background: T.green, color: "#fff" },
    outline: { background: "transparent", border: `1.5px solid ${T.border}`, color: T.earth },
    danger: { background: T.red, color: "#fff" },
    ghost: { background: "transparent", color: T.greenL, fontWeight: 600, padding: small ? "0" : "0.7rem 0" },
  };
  return <button style={{ ...base, ...variants[variant] }} onClick={disabled ? undefined : onClick}>{children}</button>;
};

const Badge = ({ label, color = T.greenL }) => (
  <span style={{
    display: "inline-block", fontSize: "0.67rem", fontWeight: 700,
    letterSpacing: "0.06em", textTransform: "uppercase", padding: "3px 9px",
    borderRadius: 20, background: color + "1A", color
  }}>{label}</span>
);

const StatCard = ({ icon, value, label, sub, accent = T.greenL }) => (
  <div style={{
    background: "#fff", borderRadius: 12, padding: "1.3rem 1.4rem",
    borderTop: `3px solid ${accent}`, flex: "1 1 140px",
    boxShadow: "0 2px 12px rgba(27,47,26,.07)"
  }}>
    <div style={{ fontSize: "1.3rem", marginBottom: ".4rem" }}>{icon}</div>
    <div className="pf" style={{ fontSize: "1.9rem", fontWeight: 700, color: T.forest, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>{label}</div>
    {sub && <div style={{ fontSize: "0.7rem", color: T.slate, marginTop: 2 }}>{sub}</div>}
  </div>
);

const ProgressBar = ({ value, max, color = T.gold }) => (
  <div style={{ height: 7, background: "rgba(27,47,26,0.08)", borderRadius: 4, overflow: "hidden" }}>
    <div style={{ height: "100%", width: `${Math.min(100, (value / max) * 100)}%`, background: color, borderRadius: 4, transition: "width .6s" }} />
  </div>
);

function Stars({ n = 5 }) {
  return <span className="star">{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;
}

// ─── DATA ─────────────────────────────────────────────────────
const FIELDS = ["All Fields", "Agribusiness & Market Linkage", "Agronomy", "Livestock & Veterinary", "Farm Finance & SACCO", "Data & M&E", "Farm Management", "Conservation Agriculture", "Post-Harvest & Value Chain", "Farm Mechanization"];

const DEFAULT_PROS = [
  {
    id: 1, name: "Jackson Irungu Ngenye", init: "JIN", field: "Agribusiness & Market Linkage",
    title: "Founder & Lead Consultant — Agrivision Consultancy",
    location: "Nakuru / Nyandarua", bio: "Founder of Agrivision Consultancy. 5+ years driving sustainable agribusiness growth across Nakuru and Nyandarua. Specialist in revolving input fund design, market linkage, digital platforms, and smallholder farmer mobilisation. Former Syngenta Foundation Project Officer and CoAmana Account Manager.",
    skills: ["Market Linkage", "Revolving Input Funds", "Digital Platforms", "Farmer Training", "KPI Management", "SurveyCTO", "Value Chains", "ASAL Programming"],
    available: true, rate: "By quotation", rating: 5, reviews: 74, exp: "5+", role: "founder", photo: null,
  },
];

// Engagement types shown on the "Engage Us" page
const ENGAGEMENT_TYPES = [
  { id: "govt",       icon: "🏛️", label: "Government & County Authorities",    desc: "Policy implementation, extension systems, county-level programme design, and value chain development." },
  { id: "ngo",        icon: "🤝", label: "NGOs & Development Organisations",   desc: "Programme implementation, M&E frameworks, technical advisory, and field data collection." },
  { id: "donor",      icon: "🌍", label: "Development Partners & Donors",      desc: "Technical assistance, research, impact evaluation, and results-based programme support." },
  { id: "agribiz",    icon: "🏢", label: "Agribusinesses & Private Sector",    desc: "Market systems strengthening, supply chain development, and agri-enterprise advisory." },
  { id: "coop",       icon: "🤲", label: "Cooperatives & Financial Institutions", desc: "Institutional strengthening, revolving fund design, SACCO advisory, and governance capacity building." },
  { id: "farmer",     icon: "🌾", label: "Farmer Organisations & Cooperatives", desc: "Capacity building, market access, input financing, and smallholder enterprise development." },
];

const SERVICE_AREAS = [
  "Agribusiness & Market Linkage", "Agronomy & Crop Production", "Livestock & Veterinary Services",
  "Farm Finance & SACCO Advisory", "Data Collection & M&E", "Farm Management & Operations",
  "Conservation Agriculture", "Post-Harvest & Value Chain", "Farm Mechanization",
  "Revolving Input Fund Advisory", "Stakeholder & Partner Liaison", "Capacity Building & Training", "Other",
];

// ─── PARTNER LOGOS ────────────────────────────────────────────
// Organizations founder & associates have collaborated with
const PARTNER_DATA = [
  { name: "GIZ", abbr: "GIZ", color: "#003087", bg: "#e8f0fb", desc: "German Dev. Cooperation" },
  { name: "Syngenta Foundation", abbr: "SFSA", color: "#00833f", bg: "#e6f5ec", desc: "Agriservices Programme" },
  { name: "KALRO", abbr: "KALRO", color: "#B8860B", bg: "#fdf6e3", desc: "Agricultural Research" },
  { name: "KCSAP", abbr: "KCSAP", color: "#2D6A4F", bg: "#eaf3e8", desc: "Climate Smart Agri" },
  { name: "Twiga Foods", abbr: "TF", color: "#f97316", bg: "#fff7ed", desc: "Market Linkage" },
  { name: "Tower SACCO", abbr: "TS", color: "#2563eb", bg: "#eff6ff", desc: "Financial Services" },
  { name: "CoAmana", abbr: "CA", color: "#2D6A4F", bg: "#eaf3ef", desc: "Digital Market Platform" },
  { name: "CIP", abbr: "CIP", color: "#dc2626", bg: "#fef2f2", desc: "International Potato Centre" },
];

// ─── NAV ──────────────────────────────────────────────────────
// Public-facing nav — Dashboard is NOT listed here
const NAV_ITEMS = [
  { id: "home",          label: "Home" },
  { id: "portfolio",     label: "Impact" },
  { id: "professionals", label: "Our Team" },
  { id: "fund",          label: "Methodologies" },
  { id: "engage",        label: "Engage Us" },
];

function Nav({ page, setPage, isAdmin, onAdmin, onLogout }) {
  const [mob, setMob] = useState(false);
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 600,
      background: "rgba(26,51,41,0.97)", backdropFilter: "blur(12px)",
      height: 60, display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "0 5%",
      borderBottom: "1px solid rgba(184,134,11,0.12)"
    }}>
      <div onClick={() => setPage("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: ".6rem" }}>
        <div style={{ width: 32, height: 32, borderRadius: 6, background: T.gold, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: ".75rem", color: T.forest, letterSpacing: ".02em" }}>AV</div>
        <div className="pf" style={{ color: T.ivory, fontSize: "1rem", letterSpacing: ".01em" }}>
          Agri<span style={{ color: T.gold }}>vision</span>
          <span style={{ fontSize: ".62rem", color: "rgba(245,240,232,0.4)", fontFamily: "Inter,sans-serif", fontWeight: 400, marginLeft: ".5rem", letterSpacing: ".04em", textTransform: "uppercase" }}>Consultancy</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: ".2rem", alignItems: "center" }}>
        {NAV_ITEMS.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} className="nav-btn" style={{
            color: page === n.id ? T.goldL : "rgba(245,240,232,0.65)",
            fontWeight: page === n.id ? 600 : 400,
            fontSize: ".8rem", padding: ".4rem .85rem",
            background: page === n.id ? "rgba(184,134,11,0.14)" : "none",
            borderRadius: 6, letterSpacing: ".01em",
          }}>{n.label}</button>
        ))}
        {isAdmin && (
          <button onClick={onLogout} className="nav-btn" style={{
            marginLeft: ".5rem", fontSize: ".75rem", fontWeight: 600,
            padding: ".38rem .85rem", background: "rgba(184,50,50,0.15)",
            color: "#FF8888", borderRadius: 6,
          }}>Logout</button>
        )}
      </div>
    </nav>
  );
}


function AdminLogin({ onSuccess, onClose }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [show, setShow] = useState(false);

  function attempt() {
    if (u === ADMIN_CREDENTIALS.username && p === ADMIN_CREDENTIALS.password) {
      onSuccess();
    } else {
      setErr("Invalid credentials. Check username and password.");
    }
  }

  return (
    <div className="overlay">
      <div className="modal fade" style={{ maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: "1.6rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: ".5rem" }}>🌾</div>
          <h2 className="pf" style={{ fontSize: "1.5rem", color: T.forest }}>Admin Access</h2>
          <p style={{ fontSize: ".82rem", color: T.slate, marginTop: ".3rem" }}>Agrivision Consultancy — Secure Portal</p>
        </div>
        {err && (
          <div style={{ background: T.redPale, color: T.red, padding: ".75rem 1rem", borderRadius: 8, fontSize: ".83rem", marginBottom: "1rem", border: `1px solid ${T.red}33` }}>
            ⚠ {err}
          </div>
        )}
        <div style={{ marginBottom: "1rem" }}>
          <label className="field-label">Username</label>
          <input className="field-input" value={u} onChange={e => setU(e.target.value)} placeholder="Admin username" autoComplete="off" />
        </div>
        <div style={{ marginBottom: "1.4rem" }}>
          <label className="field-label">Password</label>
          <div style={{ position: "relative" }}>
            <input className="field-input" type={show ? "text" : "password"} value={p}
              onChange={e => setP(e.target.value)}
              onKeyDown={e => e.key === "Enter" && attempt()}
              placeholder="Admin password" />
            <button onClick={() => setShow(s => !s)} style={{
              position: "absolute", right: ".9rem", top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: T.slate, fontSize: ".85rem"
            }}>{show ? "🙈" : "👁"}</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: ".8rem" }}>
          <Btn variant="outline" onClick={onClose} style={{ flex: 1 }}>Cancel</Btn>
          <Btn variant="primary" onClick={attempt} style={{ flex: 2 }}>Sign In</Btn>
        </div>
        <div style={{ marginTop: "1.2rem", padding: ".8rem", background: T.greenPale, borderRadius: 8, fontSize: ".72rem", color: T.earth }}>
          <strong>Admin credentials are confidential.</strong> Only authorised personnel may access this portal. All actions are logged.
        </div>
      </div>
    </div>
  );
}

// ─── CHAT WIDGET ──────────────────────────────────────────────
function ChatWidget({ inquiries, setInquiries, toast }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("chat"); // chat | form
  const [msgs, setMsgs] = useState([
    { from: "bot", text: "👋 Hello! Welcome to Agrivision Consultancy. How can we help you today? You can ask about our services, or submit a formal inquiry below." }
  ]);
  const [input, setInput] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const ref = { current: null };

  const QUICK = ["Tell me about your services", "Mechanization support", "How does the Input Fund work?", "Submit a formal inquiry"];

  function sendMsg(text) {
    if (!text.trim()) return;
    const userMsg = { from: "user", text };
    const botReply = getBotReply(text);
    setMsgs(m => [...m, userMsg, { from: "bot", text: botReply, isInquiry: text === "Submit a formal inquiry" }]);
    setInput("");
  }

  function getBotReply(text) {
    const t = text.toLowerCase();
    if (t.includes("mechaniz")) return "We provide comprehensive farm mechanization services — from tractor hire and mechanized planting to last-mile delivery of inputs. Our model has been tested and proven under the last-mile inputs and services delivery system. Ask us for a tailored quote!";
    if (t.includes("input fund") || t.includes("revolving")) return "The Revolving Input Fund allows farmers to access certified seeds and fertilisers worth double their deposit. Co-designed with banking partners, it removes the financial barrier to timely planting. Navigate to the 'Input Fund' page for full details.";
    if (t.includes("service")) return "We offer: Agronomy, Market Linkage, Livestock & Veterinary, Farm Finance, Data & M&E, Post-Harvest Value Chain, Conservation Agriculture, and Farm Mechanization. Each service is delivered by verified field specialists.";
    if (t.includes("inquiry") || t.includes("contact") || t.includes("formal")) return "___INQUIRY_PROMPT___";
    if (t.includes("partner") || t.includes("giz") || t.includes("syngenta")) return "We've worked with renowned development and agri organisations including GIZ, Syngenta Foundation, KALRO, KCSAP, CIP, Twiga Foods, and others. These partnerships allow us to deliver impact at scale. Visit the Portfolio page to learn more.";
    if (t.includes("price") || t.includes("cost") || t.includes("plan")) return "Our plans start from KES 2,500/month for individual farmers (Starter), KES 6,500/month for groups and cooperatives (Growth), and KES 18,000/month for NGOs and commercial farms (Enterprise). See the Subscriptions page for full details.";
    return "Thank you for reaching out! For detailed information, please browse our website or submit a formal inquiry and our team will respond within 24 hours.";
  }

  async function submitInquiry() {
    if (!form.name || !form.email || !form.phone || !form.message) { return; }
    const newInquiry = {
      id: Date.now(), ...form,
      date: new Date().toLocaleDateString("en-KE"),
      status: "New",
      assignedTo: null,
    };
    await setInquiries(prev => [...prev, newInquiry]);
    toast("Inquiry submitted — we'll be in touch within 24 hours!");
    setSubmitted(true);
    setMsgs(m => [...m, { from: "bot", text: `✅ Thank you, ${form.name}! Your inquiry has been received. Our team will contact you at ${form.email} within 24 hours.` }]);
    setStep("chat");
    setForm({ name: "", email: "", phone: "", service: "", message: "" });
  }

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen(o => !o)} title="Chat with us">
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="chat-window">
          {/* Header */}
          <div style={{ background: T.forest, padding: "1rem 1.2rem", display: "flex", alignItems: "center", gap: ".8rem" }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: T.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>🌾</div>
            <div>
              <div style={{ color: T.ivory, fontWeight: 700, fontSize: ".88rem" }}>Agrivision Support</div>
              <div style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80" }} />
                <span style={{ color: "rgba(244,241,232,0.6)", fontSize: ".7rem" }}>Online — typically replies in minutes</span>
              </div>
            </div>
          </div>

          {step === "form" ? (
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
              <p style={{ fontSize: ".82rem", color: T.earth, marginBottom: "1rem", fontWeight: 600 }}>Submit a Formal Inquiry</p>
              {[["Your Name *", "name", "text"], ["Email *", "email", "email"], ["Phone *", "phone", "tel"]].map(([lbl, k, t]) => (
                <div key={k} style={{ marginBottom: ".7rem" }}>
                  <label className="field-label">{lbl}</label>
                  <input className="field-input" type={t} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                </div>
              ))}
              <div style={{ marginBottom: ".7rem" }}>
                <label className="field-label">Service of Interest</label>
                <select className="field-input" value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))}>
                  <option value="">Select a service…</option>
                  {["Agronomy", "Market Linkage", "Livestock & Veterinary", "Farm Finance", "Mechanization", "Post-Harvest & Value Chain", "Data & M&E", "Revolving Input Fund", "Other"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label className="field-label">Message *</label>
                <textarea className="field-input" rows={3} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Describe your need…" style={{ resize: "none" }} />
              </div>
              <div style={{ display: "flex", gap: ".6rem" }}>
                <Btn variant="outline" small onClick={() => setStep("chat")} style={{ flex: 1 }}>← Back</Btn>
                <Btn variant="primary" small onClick={submitInquiry} style={{ flex: 2 }}>Submit Inquiry</Btn>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: ".7rem" }}>
                {msgs.map((m, i) => (
                  <div key={i} className={m.from === "user" ? "chat-bubble-user" : "chat-bubble-bot"}>
                    {m.text === "___INQUIRY_PROMPT___" ? (
                      <span>To submit a formal inquiry, please <button onClick={() => setStep("form")} style={{ color: T.greenL, background: "none", border: "none", cursor: "pointer", fontWeight: 700, textDecoration: "underline", padding: 0, fontSize: ".85rem" }}>click here</button>.</span>
                    ) : m.text}
                    {m.isInquiry && m.from === "bot" && m.text !== "___INQUIRY_PROMPT___" && (
                      <div style={{ marginTop: ".5rem" }}>
                        <button onClick={() => setStep("form")} style={{ background: T.greenL, color: "#fff", border: "none", borderRadius: 6, padding: ".35rem .8rem", fontSize: ".75rem", fontWeight: 600, cursor: "pointer" }}>Open Inquiry Form →</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick replies */}
              <div style={{ padding: ".6rem 1rem", borderTop: `1px solid ${T.border}`, display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
                {QUICK.map(q => (
                  <button key={q} onClick={() => { if (q === "Submit a formal inquiry") setStep("form"); else sendMsg(q); }} style={{
                    background: T.greenPale, border: `1px solid ${T.greenL}44`, borderRadius: 20,
                    padding: ".28rem .7rem", fontSize: ".7rem", color: T.earth, fontWeight: 600, cursor: "pointer"
                  }}>{q}</button>
                ))}
              </div>

              {/* Input */}
              <div style={{ padding: ".8rem 1rem", borderTop: `1px solid ${T.border}`, display: "flex", gap: ".5rem" }}>
                <input
                  className="field-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMsg(input)}
                  placeholder="Type your message…"
                  style={{ flex: 1, padding: ".55rem .8rem", fontSize: ".83rem" }}
                />
                <button onClick={() => sendMsg(input)} style={{
                  background: T.forest, border: "none", borderRadius: 8,
                  padding: ".55rem .9rem", color: T.gold, cursor: "pointer", fontSize: "1rem"
                }}>➤</button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

// ─── PARTNER LOGO CARD ────────────────────────────────────────
function PartnerLogo({ p }) {
  return (
    <div style={{
      background: p.bg, borderRadius: 12, padding: "1rem 1.4rem",
      display: "flex", flexDirection: "column", alignItems: "center", gap: ".5rem",
      border: `1.5px solid ${p.color}22`, minWidth: 120,
      boxShadow: "0 2px 8px rgba(0,0,0,.05)"
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: "50%", background: p.color,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontWeight: 800, fontSize: p.abbr.length > 3 ? ".65rem" : ".82rem",
        letterSpacing: ".04em"
      }}>{p.abbr}</div>
      <div style={{ fontWeight: 700, fontSize: ".8rem", color: "#1a1a1a", textAlign: "center" }}>{p.name}</div>
      <div style={{ fontSize: ".65rem", color: "#666", textAlign: "center", lineHeight: 1.4 }}>{p.desc}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════════════════════════
function HomePage({ setPage }) {

  const practiceAreas = [
    { icon: "🌾", area: "Agriculture & Food Systems", items: ["Agronomy & Crop Production", "Livestock & Animal Health", "Farm Mechanization", "Conservation Farming"] },
    { icon: "📈", area: "Market Systems & Enterprise", items: ["Market Linkage", "Value Chain Strengthening", "Agribusiness Advisory", "Supply Chain Development"] },
    { icon: "📊", area: "Research, Data & Learning", items: ["Field Surveys & Data Collection", "M&E Frameworks", "Impact Evaluation", "PMEAL Systems"] },
    { icon: "🎓", area: "Capacity Development", items: ["Institutional Strengthening", "Training & Facilitation", "Organisational Capacity", "Stakeholder Engagement"] },
    { icon: "💡", area: "Digital Agriculture", items: ["Digital Market Platforms", "eHub Systems", "Digital Market Access", "AgriTech Integration"] },
    { icon: "💰", area: "Rural Finance & Access", items: ["Revolving Input Funds", "SACCO Advisory", "Input Credit Design", "RIAM™ Implementation"] },
  ];

  const whoWeServe = [
    { icon: "🏛️", label: "Governments", desc: "Policy implementation, extension systems, value chain programme design" },
    { icon: "🤝", label: "NGOs", desc: "Programme implementation, M&E, capacity building and technical advisory" },
    { icon: "🌍", label: "Development Partners", desc: "Technical assistance, research, and results-based programme support" },
    { icon: "🏢", label: "Agribusinesses", desc: "Market systems strengthening, supply chain and enterprise development" },
    { icon: "🤲", label: "Cooperatives", desc: "Institutional strengthening, revolving fund design and governance" },
    { icon: "🌾", label: "Farmer Organisations", desc: "Capacity building, market access and smallholder enterprise growth" },
  ];

  const glance = [
    { value: "24,000+", label: "Farmers Reached", sub: "Across 6+ counties" },
    { value: "390+",    label: "Enterprise Hubs", sub: "Supported & mobilised" },
    { value: "270+",    label: "Digital Hubs",    sub: "eHub enabled" },
    { value: "6+",      label: "Counties",        sub: "Kenya coverage" },
    { value: "5+",      label: "Years",           sub: "Field experience" },
    { value: "3",       label: "Methodologies",   sub: "REH™ · RIAM™ · DMAM™" },
  ];

  const challenges = [
    { icon: "🔗", title: "Broken Market Linkages", desc: "Smallholders produce but cannot access reliable buyers, fair prices, or formal markets. We bridge that gap." },
    { icon: "💸", title: "Input Access Barriers", desc: "Quality seeds and fertiliser remain out of reach without credit. Our RIAM™ model solves this structurally." },
    { icon: "📉", title: "Weak M&E Systems", desc: "Donor-funded programmes lack rigorous data and learning loops. We design and implement PMEAL frameworks that work." },
    { icon: "🌵", title: "ASAL Vulnerability", desc: "Semi-arid and arid communities face compounding risks. We bring food security expertise grounded in direct ASAL field experience." },
  ];

  const methodologies = [
    { code: "REH™", name: "Rural Enterprise Hub Model", color: T.green, desc: "Our flagship approach for mobilising and strengthening farmer enterprise hubs — building governance, market access, and financial resilience from the ground up. Tested across 390+ hubs." },
    { code: "RIAM™", name: "Revolving Input Access Model", color: T.gold, desc: "A co-designed financing mechanism enabling farmers to access certified inputs worth double their deposit. After harvest, the fund revolves — creating compounding community benefit." },
    { code: "DMAM™", name: "Digital Market Access Model", color: T.earth, desc: "A structured approach to enabling enterprise hubs and agri-SMEs to participate in digital commodity markets, reducing intermediaries and improving income predictability." },
  ];

  const insights = [
    { tag: "Market Systems", title: "Why Rural Enterprise Hubs Matter for Kenya's Agricultural Transformation", date: "May 2025" },
    { tag: "Input Financing", title: "Sustainable Input Financing: Lessons from 390+ Enterprise Hubs", date: "March 2025" },
    { tag: "Digital Agriculture", title: "Digital Agriculture Beyond Mobile Apps: The eHub Experience", date: "January 2025" },
  ];

  return (
    <div className="fade">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div style={{
        minHeight: "100vh", background: T.forest,
        position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", padding: "100px 6% 80px"
      }}>
        {/* Geometric SVG — professional, not agricultural-kitsch */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .06 }}
          viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke={T.gold} strokeWidth=".8"/>
            </pattern>
          </defs>
          <rect width="1200" height="800" fill="url(#grid)" />
          <circle cx="850" cy="400" r="320" fill="none" stroke={T.goldL} strokeWidth="1.5" opacity=".4"/>
          <circle cx="850" cy="400" r="220" fill="none" stroke={T.goldL} strokeWidth="1" opacity=".3"/>
          <circle cx="850" cy="400" r="120" fill={T.gold} opacity=".06"/>
        </svg>

        <div style={{ position: "relative", zIndex: 2, maxWidth: 700 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: ".5rem",
            background: "rgba(184,134,11,0.15)", border: "1px solid rgba(184,134,11,0.3)",
            borderRadius: 24, padding: ".38rem 1.1rem", marginBottom: "1.6rem"
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "block" }}/>
            <span style={{ fontSize: ".68rem", color: T.goldL, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>
              Development Consulting · Rural Enterprise · Market Systems
            </span>
          </div>

          <h1 className="pf" style={{ fontSize: "clamp(2.2rem,4.5vw,3.6rem)", color: T.ivory, lineHeight: 1.12, marginBottom: "1.1rem" }}>
            Delivering Sustainable<br/>
            <em style={{ color: T.goldL }}>Agricultural Impact</em><br/>
            Across Africa
          </h1>

          <p style={{ color: "rgba(245,240,232,0.72)", fontSize: ".98rem", maxWidth: 540, lineHeight: 1.9, marginBottom: ".7rem", fontWeight: 300 }}>
            Supporting Governments, NGOs, Development Partners, and Agribusinesses with expert consultancy in rural enterprise development, market systems strengthening, and agricultural transformation.
          </p>
          <p style={{ color: "rgba(184,134,11,0.75)", fontSize: ".82rem", fontStyle: "italic", maxWidth: 480, lineHeight: 1.7, marginBottom: "2.2rem" }}>
            Serving Kenya and East Africa — grounded in field reality, driven by measurable impact.
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Btn variant="gold" onClick={() => setPage("engage")}>Request a Consultation</Btn>
            <button onClick={() => setPage("portfolio")} style={{
              border: "1.5px solid rgba(245,240,232,0.3)", color: T.ivory,
              background: "transparent", borderRadius: 8, padding: ".72rem 1.5rem",
              fontWeight: 600, cursor: "pointer", fontSize: ".875rem", transition: "all .18s"
            }}>View Our Impact →</button>
          </div>

          {/* Capability statement download */}
          <div style={{ marginTop: "1.8rem", display: "inline-flex", alignItems: "center", gap: ".6rem",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8, padding: ".55rem 1rem", cursor: "pointer" }}
            onClick={() => alert("Capability Statement — download feature coming soon. Contact: consultancyagrivision@gmail.com")}>
            <span style={{ fontSize: ".9rem" }}>📄</span>
            <span style={{ fontSize: ".75rem", color: "rgba(245,240,232,0.7)", fontWeight: 600, letterSpacing: ".04em" }}>
              Download Capability Statement
            </span>
          </div>
        </div>

        {/* Hero stats — bottom right */}
        <div style={{ position: "absolute", bottom: 52, right: "6%", display: "flex", gap: "2.5rem", zIndex: 2 }}>
          {[["24,000+","Farmers Reached"],["390+","Enterprise Hubs"],["6+","Counties"]].map(([v,l]) => (
            <div key={l} style={{ textAlign: "right" }}>
              <div className="pf" style={{ fontSize: "1.7rem", color: T.gold, fontWeight: 700, lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: ".6rem", color: "rgba(245,240,232,0.45)", textTransform: "uppercase", letterSpacing: ".1em", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── AT A GLANCE ──────────────────────────────────────── */}
      <div style={{ padding: "60px 6%", background: T.forest, borderTop: "1px solid rgba(184,134,11,0.15)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: ".68rem", letterSpacing: ".18em", textTransform: "uppercase", color: T.gold, fontWeight: 700, textAlign: "center", marginBottom: ".5rem" }}>Agrivision At A Glance</p>
          <h2 className="pf" style={{ fontSize: "clamp(1.4rem,2.5vw,1.9rem)", color: T.ivory, textAlign: "center", marginBottom: "2rem" }}>
            Evidence of <em style={{ color: T.goldL }}>Impact</em>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "1rem" }}>
            {glance.map(g => (
              <div key={g.label} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(184,134,11,0.2)", borderRadius: 12, padding: "1.4rem 1rem", textAlign: "center" }}>
                <div className="pf" style={{ fontSize: "2rem", fontWeight: 700, color: T.gold, lineHeight: 1 }}>{g.value}</div>
                <div style={{ fontSize: ".72rem", fontWeight: 700, color: T.ivory, textTransform: "uppercase", letterSpacing: ".06em", marginTop: ".4rem" }}>{g.label}</div>
                <div style={{ fontSize: ".65rem", color: "rgba(245,240,232,0.45)", marginTop: ".2rem" }}>{g.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHO WE SERVE ─────────────────────────────────────── */}
      <div style={{ padding: "64px 6%", background: T.ivory }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: ".68rem", letterSpacing: ".18em", textTransform: "uppercase", color: T.gold, fontWeight: 700, marginBottom: ".5rem" }}>Who We Serve</p>
          <h2 className="pf" style={{ fontSize: "clamp(1.6rem,2.8vw,2.2rem)", color: T.charcoal, marginBottom: ".6rem" }}>
            Our <em style={{ color: T.green }}>Clients</em>
          </h2>
          <p style={{ color: T.slate, fontSize: ".88rem", maxWidth: 580, marginBottom: "2rem", lineHeight: 1.8 }}>
            We work with a broad range of development actors — from county governments and international donors to farmer organisations and agribusinesses.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1rem" }}>
            {whoWeServe.map(w => (
              <div key={w.label} style={{
                background: "#fff", borderRadius: 12, padding: "1.5rem",
                border: "1.5px solid " + T.border, transition: "all .2s",
                boxShadow: "0 2px 8px rgba(26,51,41,.05)"
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ fontSize: "1.8rem", marginBottom: ".6rem" }}>{w.icon}</div>
                <div style={{ fontWeight: 700, color: T.charcoal, fontSize: ".92rem", marginBottom: ".4rem" }}>{w.label}</div>
                <div style={{ fontSize: ".78rem", color: T.slate, lineHeight: 1.65 }}>{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CHALLENGES WE ADDRESS ────────────────────────────── */}
      <div style={{ padding: "64px 6%", background: T.greenPale }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: ".68rem", letterSpacing: ".18em", textTransform: "uppercase", color: T.gold, fontWeight: 700, marginBottom: ".5rem" }}>Why Clients Engage Us</p>
          <h2 className="pf" style={{ fontSize: "clamp(1.6rem,2.8vw,2.2rem)", color: T.charcoal, marginBottom: "2rem" }}>
            Challenges We <em style={{ color: T.green }}>Resolve</em>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "1.2rem" }}>
            {challenges.map(c => (
              <div key={c.title} style={{ background: "#fff", borderRadius: 12, padding: "1.6rem" }}>
                <div style={{ fontSize: "1.6rem", marginBottom: ".8rem" }}>{c.icon}</div>
                <div style={{ fontWeight: 700, color: T.charcoal, fontSize: ".92rem", marginBottom: ".5rem" }}>{c.title}</div>
                <div style={{ fontSize: ".82rem", color: T.slate, lineHeight: 1.7 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SIGNATURE METHODOLOGIES ──────────────────────────── */}
      <div style={{ padding: "64px 6%", background: T.forest }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: ".68rem", letterSpacing: ".18em", textTransform: "uppercase", color: T.gold, fontWeight: 700, marginBottom: ".5rem" }}>Proprietary Frameworks</p>
          <h2 className="pf" style={{ fontSize: "clamp(1.6rem,2.8vw,2.2rem)", color: T.ivory, marginBottom: ".6rem" }}>
            Signature <em style={{ color: T.goldL }}>Methodologies</em>
          </h2>
          <p style={{ color: "rgba(245,240,232,0.6)", fontSize: ".88rem", maxWidth: 560, marginBottom: "2rem", lineHeight: 1.8 }}>
            These are Agrivision's own intellectual frameworks — developed and field-tested across Kenya. They differentiate our approach from general advisory services.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.2rem" }}>
            {methodologies.map(m => (
              <div key={m.code} style={{ background: "rgba(255,255,255,0.05)", border: `1.5px solid ${m.color}44`, borderRadius: 12, padding: "1.8rem" }}>
                <div style={{ display: "inline-block", background: m.color, color: "#fff", fontWeight: 800, fontSize: ".85rem", letterSpacing: ".08em", padding: ".35rem .9rem", borderRadius: 6, marginBottom: "1rem" }}>{m.code}</div>
                <div className="pf" style={{ fontSize: "1.05rem", color: T.ivory, marginBottom: ".7rem" }}>{m.name}</div>
                <div style={{ fontSize: ".82rem", color: "rgba(245,240,232,0.65)", lineHeight: 1.75 }}>{m.desc}</div>
                <div style={{ marginTop: "1.2rem" }}>
                  <button onClick={() => setPage("fund")} style={{ background: "none", border: `1px solid ${m.color}66`, color: m.color === T.gold ? T.goldL : m.color, padding: ".4rem .9rem", borderRadius: 6, fontSize: ".75rem", fontWeight: 600, cursor: "pointer" }}>
                    Learn More →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRACTICE AREAS ───────────────────────────────────── */}
      <div style={{ padding: "64px 6%", background: T.ivory }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: ".68rem", letterSpacing: ".18em", textTransform: "uppercase", color: T.gold, fontWeight: 700, marginBottom: ".5rem" }}>Consulting Divisions</p>
          <h2 className="pf" style={{ fontSize: "clamp(1.6rem,2.8vw,2.2rem)", color: T.charcoal, marginBottom: ".6rem" }}>
            Practice <em style={{ color: T.green }}>Areas</em>
          </h2>
          <p style={{ color: T.slate, fontSize: ".88rem", maxWidth: 560, marginBottom: "2.2rem", lineHeight: 1.8 }}>
            Organised as consulting divisions — each area draws on deep specialist expertise.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "1rem" }}>
            {practiceAreas.map(p => (
              <div key={p.area} style={{ background: "#fff", borderRadius: 12, padding: "1.5rem", border: "1.5px solid " + T.border }}>
                <div style={{ fontSize: "1.6rem", marginBottom: ".6rem" }}>{p.icon}</div>
                <div style={{ fontWeight: 700, color: T.charcoal, fontSize: ".9rem", marginBottom: ".8rem" }}>{p.area}</div>
                {p.items.map(i => (
                  <div key={i} style={{ display: "flex", gap: ".5rem", fontSize: ".78rem", color: T.slate, marginBottom: ".35rem" }}>
                    <span style={{ color: T.green, fontWeight: 700, flexShrink: 0 }}>›</span>{i}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHY AGRIVISION ───────────────────────────────────── */}
      <div style={{ padding: "64px 6%", background: T.earthPale }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "3rem", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: ".68rem", letterSpacing: ".18em", textTransform: "uppercase", color: T.gold, fontWeight: 700, marginBottom: ".5rem" }}>Why Agrivision</p>
            <h2 className="pf" style={{ fontSize: "clamp(1.6rem,2.8vw,2.2rem)", color: T.charcoal, lineHeight: 1.25, marginBottom: "1.2rem" }}>
              A Consultancy <em style={{ color: T.green }}>Grounded in<br/>Field Reality</em>
            </h2>
            <p style={{ color: T.earth, lineHeight: 1.85, fontSize: ".9rem", marginBottom: "1.4rem" }}>
              Agrivision is not a boardroom consultancy. Every methodology we deploy has been tested in the field — in semi-arid Nyandarua, across Nakuru's smallholder cooperatives, and through Kenya's complex agricultural value chains.
            </p>
            {[
              "Proprietary methodologies — REH™, RIAM™, DMAM™",
              "5+ years of verifiable field implementation",
              "Certified ASAL and semi-arid environment experience",
              "Deep partner and stakeholder networks across Kenya",
              "Founder experience in SFSA, GIZ, and CoAmana programmes",
            ].map(f => (
              <div key={f} style={{ display: "flex", gap: ".6rem", alignItems: "flex-start", fontSize: ".84rem", color: T.charcoal, marginBottom: ".6rem" }}>
                <span style={{ color: T.green, fontWeight: 700, flexShrink: 0, marginTop: ".1rem" }}>✓</span>{f}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { label: "Founder Experience", val: "Syngenta Foundation, GIZ, CoAmana", color: T.green },
              { label: "Geographic Reach", val: "Nakuru · Nyandarua · Bungoma · Busia · Migori · Homa Bay", color: T.gold },
              { label: "Target Clients", val: "Governments · NGOs · Donors · Agribusinesses · Cooperatives", color: T.earth },
              { label: "Registration", val: "Agrivision Consultancy — Kenya", color: T.green },
            ].map(r => (
              <div key={r.label} style={{ background: "#fff", borderRadius: 10, padding: "1rem 1.2rem", borderLeft: `3px solid ${r.color}` }}>
                <div style={{ fontSize: ".68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: r.color, marginBottom: ".3rem" }}>{r.label}</div>
                <div style={{ fontSize: ".82rem", color: T.charcoal, fontWeight: 500 }}>{r.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── THOUGHT LEADERSHIP ───────────────────────────────── */}
      <div style={{ padding: "64px 6%", background: T.ivory }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
            <div>
              <p style={{ fontSize: ".68rem", letterSpacing: ".18em", textTransform: "uppercase", color: T.gold, fontWeight: 700, marginBottom: ".4rem" }}>Knowledge Centre</p>
              <h2 className="pf" style={{ fontSize: "clamp(1.5rem,2.5vw,2rem)", color: T.charcoal }}>Thought <em style={{ color: T.green }}>Leadership</em></h2>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1rem" }}>
            {insights.map(a => (
              <div key={a.title} style={{ background: "#fff", borderRadius: 12, padding: "1.5rem", border: "1.5px solid " + T.border, cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = T.gold}
                onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
              >
                <Badge label={a.tag} color={T.green} />
                <div className="pf" style={{ fontSize: ".95rem", color: T.charcoal, margin: ".8rem 0 .5rem", lineHeight: 1.45 }}>{a.title}</div>
                <div style={{ fontSize: ".72rem", color: T.slate }}>{a.date}</div>
                <div style={{ marginTop: ".9rem", fontSize: ".75rem", color: T.green, fontWeight: 600 }}>Read Insight →</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PARTNERS ─────────────────────────────────────────── */}
      <div style={{ padding: "56px 6%", background: T.ivoryDark }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: ".68rem", letterSpacing: ".18em", textTransform: "uppercase", color: T.slate, fontWeight: 600, marginBottom: ".5rem" }}>
            Organisations Our Founder &amp; Associates Have Collaborated With
          </p>
          <p style={{ fontSize: ".83rem", color: T.earth, maxWidth: 600, margin: "0 auto 2rem", lineHeight: 1.75, fontStyle: "italic" }}>
            These are not Agrivision's clients — they are organisations through which our founder and team members have delivered development work over their careers.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
            {PARTNER_DATA.map(p => <PartnerLogo key={p.name} p={p} />)}
          </div>
        </div>
      </div>

      {/* ── OPPORTUNITIES ────────────────────────────────────── */}
      <div style={{ padding: "60px 6%", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: ".68rem", letterSpacing: ".18em", textTransform: "uppercase", color: T.gold, fontWeight: 700, marginBottom: ".5rem" }}>Join Our Network</p>
          <h2 className="pf" style={{ fontSize: "clamp(1.5rem,2.5vw,2rem)", color: T.charcoal, marginBottom: ".6rem" }}>Current Opportunities</h2>
          <p style={{ color: T.slate, fontSize: ".85rem", maxWidth: 540, marginBottom: "1.8rem", lineHeight: 1.8 }}>
            We are building a network of associate consultants, researchers, and field professionals. Join us as we grow.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "1rem" }}>
            {[
              { role: "M&E Specialist", type: "Associate Consultant", status: "Open", icon: "📊" },
              { role: "Agronomist", type: "Associate Consultant", status: "Open", icon: "🌱" },
              { role: "Field Enumerator", type: "Freelance / Project", status: "Rolling", icon: "📋" },
              { role: "Livestock Specialist", type: "Associate Consultant", status: "Coming Soon", icon: "🐄" },
            ].map(o => (
              <div key={o.role} style={{ background: T.greenPale, borderRadius: 12, padding: "1.4rem", border: "1.5px solid " + T.border }}>
                <div style={{ fontSize: "1.4rem", marginBottom: ".5rem" }}>{o.icon}</div>
                <div style={{ fontWeight: 700, color: T.charcoal, fontSize: ".9rem" }}>{o.role}</div>
                <div style={{ fontSize: ".75rem", color: T.slate, marginTop: ".2rem", marginBottom: ".7rem" }}>{o.type}</div>
                <Badge label={o.status} color={o.status === "Open" ? T.green : o.status === "Rolling" ? T.gold : T.slate} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: "1.5rem" }}>
            <Btn variant="outline" onClick={() => setPage("engage")} style={{ borderColor: T.green, color: T.green }}>
              Express Interest →
            </Btn>
          </div>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <div style={{ padding: "72px 6%", background: T.green, textAlign: "center" }}>
        <h2 className="pf" style={{ fontSize: "clamp(1.8rem,3.5vw,2.5rem)", color: "#fff", marginBottom: "1rem" }}>
          Ready to Deliver Sustainable<br/><em style={{ color: T.goldL }}>Agricultural Impact?</em>
        </h2>
        <p style={{ color: "rgba(255,255,255,0.75)", maxWidth: 520, margin: "0 auto 2rem", lineHeight: 1.85, fontSize: ".92rem" }}>
          Whether you're a government programme, an international donor, an NGO, or an agribusiness — Agrivision has the expertise, methodologies, and field presence to support your objectives.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Btn variant="gold" onClick={() => setPage("engage")}>Request a Consultation</Btn>
          <button onClick={() => setPage("portfolio")} style={{
            background: "rgba(255,255,255,0.15)", color: "#fff",
            border: "1px solid rgba(255,255,255,0.35)", borderRadius: 8,
            padding: ".72rem 1.5rem", fontWeight: 600, cursor: "pointer", fontSize: ".875rem"
          }}>View Our Impact</button>
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <div style={{ background: T.forest, padding: "48px 6%", borderTop: "1px solid rgba(184,134,11,0.15)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "2.5rem" }}>
          <div>
            <div className="pf" style={{ color: T.ivory, fontSize: "1.05rem", marginBottom: ".5rem" }}>
              Agri<span style={{ color: T.gold }}>vision</span>
            </div>
            <p style={{ fontSize: ".72rem", color: T.gold, fontStyle: "italic", marginBottom: ".7rem" }}>
              Development Consulting for Rural Enterprise,<br/>Market Systems &amp; Agricultural Transformation
            </p>
            <p style={{ fontSize: ".75rem", color: "rgba(245,240,232,0.45)", lineHeight: 1.7 }}>
              Serving Kenya and East Africa
            </p>
          </div>
          <div>
            <div style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: T.gold, marginBottom: ".9rem" }}>Contact</div>
            {[["📞","+254 723 565 425"],["✉️","consultancyagrivision@gmail.com"],["📍","Nakuru, Kenya"]].map(([i,v]) => (
              <div key={v} style={{ fontSize: ".78rem", color: "rgba(245,240,232,0.58)", marginBottom: ".45rem" }}>{i} {v}</div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: T.gold, marginBottom: ".9rem" }}>Services</div>
            {["Agriculture & Food Systems","Market Systems & Enterprise","Research, Data & Learning","Capacity Development","Digital Agriculture","Rural Finance & Access"].map(s => (
              <div key={s} style={{ fontSize: ".75rem", color: "rgba(245,240,232,0.5)", marginBottom: ".4rem" }}>› {s}</div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: T.gold, marginBottom: ".9rem" }}>Quick Links</div>
            {NAV_ITEMS.map(n => (
              <div key={n.id} onClick={() => {}} style={{ fontSize: ".75rem", color: "rgba(245,240,232,0.5)", marginBottom: ".4rem", cursor: "default" }}>› {n.label}</div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: "2rem", paddingTop: "1.2rem", borderTop: "1px solid rgba(245,240,232,0.07)", textAlign: "center", fontSize: ".68rem", color: "rgba(245,240,232,0.25)" }}>
          © 2025 Agrivision Consultancy · Development Consulting · Kenya &amp; East Africa · All rights reserved
        </div>
      </div>

    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// PORTFOLIO PAGE
// ═══════════════════════════════════════════════════════════════
function PortfolioPage({ setPage }) {
  const [activeProject, setActiveProject] = useState(null);

  const projects = [
    {
      id: 1,
      title: "Syngenta Foundation Agriservices Programme",
      category: "Agribusiness & Input Access",
      period: "2020–2024",
      region: "Nakuru & Nyandarua",
      partners: ["Syngenta Foundation", "Tower SACCO", "KALRO"],
      icon: "🌱",
      color: T.greenL,
      summary: "A 4-year programme providing smallholder farmers with structured access to certified inputs, agronomic support, and revolving credit through an innovative SACCO-linked fund model.",
      outcomes: [
        "500+ farmers enrolled across Nakuru and Nyandarua counties",
        "Revolving Input Fund co-designed and operationalised",
        "94% average loan repayment rate across all cycles",
        "Certified KALRO bean and AGRICO potato varieties introduced",
        "Demonstration plots established in 12 sub-locations",
        "Farmer groups linked to Amana Market as off-takers",
      ],
      detail: "Agrivision's lead consultant served as the primary field implementation officer for the Syngenta Foundation Agriservices programme in the Central Highlands region. The programme developed a model that paired agronomic advisory with a revolving input fund, enabling farmers to access inputs worth double their SACCO deposit at zero interest for the first cycle. The model has since been adopted as a replicable framework for similar programmes."
    },
    {
      id: 2,
      title: "GIZ Agricultural Development Support",
      category: "Capacity Building & M&E",
      period: "2022–2023",
      region: "Rift Valley",
      partners: ["GIZ"],
      icon: "📊",
      color: "#003087",
      summary: "Advisory and monitoring support for GIZ-funded interventions targeting smallholder farmer productivity and market access in the Rift Valley region.",
      outcomes: [
        "Baseline and end-line surveys conducted across 4 counties",
        "PMEAL framework designed for programme compliance",
        "Farmer household data collected using ODK and KoboCollect",
        "Capacity building workshops for 30 frontline extension officers",
        "Programme impact report produced for donor reporting",
      ],
      detail: "In collaboration with GIZ's agricultural development portfolio in Kenya, Agrivision provided monitoring, evaluation, and capacity-building support. Our M&E specialists designed data collection tools, trained enumerators, and produced actionable reports that informed programme adaptations mid-cycle — directly improving farmer outcomes."
    },
    {
      id: 3,
      title: "KCSAP Climate Smart Agriculture Scale-Up",
      category: "Conservation Agriculture",
      period: "2021–2023",
      region: "Central Highlands",
      partners: ["KCSAP", "KALRO"],
      icon: "♻️",
      color: T.green,
      summary: "Deployment of conservation agriculture practices and climate-resilient crop varieties under the Kenya Climate Smart Agriculture Programme.",
      outcomes: [
        "300+ farmers trained on minimum tillage and mulching",
        "High-iron bean varieties (Nyota, Angaza) introduced to 150 households",
        "Soil health demonstration trials run across 3 sub-counties",
        "Water harvesting structures established on 40 farms",
        "40% average yield improvement reported after first season",
      ],
      detail: "Agrivision worked alongside KCSAP and KALRO to roll out climate-smart agricultural practices in the Central Highlands. Our agronomists ran hands-on training, established demonstration plots, and introduced certified drought-tolerant and high-nutrition crop varieties — contributing directly to food security and household income resilience."
    },
    {
      id: 4,
      title: "Twiga Foods Market Linkage Initiative",
      category: "Market Linkage & Value Chain",
      period: "2022–Present",
      region: "Nakuru & Surrounds",
      partners: ["Twiga Foods", "Amana Market"],
      icon: "🤝",
      color: "#f97316",
      summary: "Connecting organised farmer groups to structured market off-takers, ensuring predictable demand and fair pricing for smallholder produce.",
      outcomes: [
        "15 farmer groups formalised and registered as suppliers",
        "KES 4.5M+ in produce sold through Twiga Foods and Amana Market",
        "Post-harvest handling training reduced losses by 28%",
        "Standardised grading and packaging protocols introduced",
        "Weekly market data shared with farmer groups for planning",
      ],
      detail: "Agrivision facilitated the aggregation and formalisation of farmer groups for structured market linkage. Our value chain advisors negotiated off-take agreements with Twiga Foods and Amana Market, introduced post-harvest handling protocols to maintain produce quality, and built the capacity of group leaders to sustain these market relationships independently."
    },
    {
      id: 5,
      title: "Last-Mile Mechanization Deployment",
      category: "Farm Mechanization",
      period: "2023–Present",
      region: "Nyandarua & Nakuru",
      partners: ["Agrivision Internal Programme"],
      icon: "🚜",
      color: T.gold,
      summary: "Piloting and scaling mechanized agricultural services — from land preparation to input delivery — directly to smallholder farmers in areas previously unserved by commercial mechanization providers.",
      outcomes: [
        "Mechanized soil preparation delivered to 80+ farms",
        "Input delivery logistics reduced lead times by 3 days on average",
        "Operator training programme developed for 12 local technicians",
        "Integrated mechanization with revolving input fund to reduce farmer cost",
        "Model documented and ready for replication in 3 new counties",
      ],
      detail: "Recognising that mechanization access remains a critical barrier for smallholders, Agrivision developed and tested a last-mile mechanization delivery model. The programme deploys machinery directly to farm level, coordinates input delivery with planting windows, and trains local operators — creating a sustainable local economy around farm mechanization while dramatically improving smallholder productivity."
    },
    {
      id: 6,
      title: "CIP Potato Programme Support",
      category: "Agronomy & Research",
      period: "2020–2022",
      region: "Nyandarua",
      partners: ["CIP", "AGRICO"],
      icon: "🥔",
      color: "#dc2626",
      summary: "Supporting the International Potato Centre and AGRICO in the introduction and scaling of certified potato seed varieties among smallholder farmers in Nyandarua.",
      outcomes: [
        "Markies certified potato seed introduced to 120 farm households",
        "Demo plots established comparing certified vs. uncertified seed performance",
        "Average yield increase of 35% with certified variety",
        "Seed multiplication programme initiated with 5 lead farmers",
        "Post-harvest training on storage and market linkage provided",
      ],
      detail: "Agrivision partnered with CIP and AGRICO to support the introduction of high-yielding, disease-resistant potato varieties in the Nyandarua highlands. Our agronomists facilitated farmer field days, managed demonstration plots, and linked farmers to certified seed sources through the revolving input fund — making quality seed accessible regardless of upfront capital."
    },
  ];

  return (
    <div className="fade" style={{ paddingTop: 62, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${T.forest} 0%, ${T.green} 100%)`, padding: "60px 6% 50px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Badge label="Our Work" color={T.gold} />
          <h1 className="pf" style={{ fontSize: "clamp(2rem,4vw,3rem)", color: T.ivory, margin: "1rem 0 .8rem", lineHeight: 1.2 }}>
            Portfolio & Impact
          </h1>
          <p style={{ color: "rgba(244,241,232,0.75)", maxWidth: 640, lineHeight: 1.8, fontSize: ".95rem" }}>
            Over six years, Agrivision Consultancy has delivered measurable impact across Kenya — partnering with development organisations, research institutions, and market platforms to transform smallholder agriculture. Below is a selection of our key programmes and outcomes.
          </p>
        </div>
      </div>

      {/* Impact summary */}
      <div style={{ background: T.gold, padding: "28px 6%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "space-around", alignItems: "center" }}>
          {[["600+", "Farmers Directly Reached"], ["6", "Major Programmes"], ["8+", "Partner Organisations"], ["KES 4.5M+", "Produce Marketed"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div className="pf" style={{ fontSize: "2rem", color: T.forest, fontWeight: 700 }}>{v}</div>
              <div style={{ fontSize: ".7rem", color: T.forestMid, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects grid */}
      <div style={{ padding: "52px 6%", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "1.4rem" }}>
          {projects.map(proj => (
            <div key={proj.id} style={{
              background: "#fff", borderRadius: 14, overflow: "hidden",
              boxShadow: "0 3px 14px rgba(27,47,26,.08)",
              border: `1.5px solid ${T.border}`,
              transition: "transform .2s, box-shadow .2s",
              cursor: "pointer",
            }}
              onClick={() => setActiveProject(proj)}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(27,47,26,.14)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 3px 14px rgba(27,47,26,.08)"; }}
            >
              <div style={{ background: proj.color + "18", borderBottom: `3px solid ${proj.color}`, padding: "1.4rem 1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "2rem" }}>{proj.icon}</span>
                  <Badge label={proj.period} color={proj.color} />
                </div>
                <h3 style={{ fontWeight: 700, color: T.forest, fontSize: ".95rem", marginTop: ".7rem", lineHeight: 1.4 }}>{proj.title}</h3>
                <div style={{ fontSize: ".7rem", color: proj.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginTop: ".3rem" }}>{proj.category}</div>
              </div>
              <div style={{ padding: "1.2rem 1.5rem" }}>
                <p style={{ fontSize: ".83rem", color: T.earth, lineHeight: 1.7, marginBottom: "1rem" }}>{proj.summary}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem", marginBottom: "1rem" }}>
                  {proj.partners.map(p => (
                    <span key={p} style={{ fontSize: ".67rem", fontWeight: 600, background: T.ivory, color: T.slate, padding: "3px 8px", borderRadius: 20, border: `1px solid ${T.border}` }}>{p}</span>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: ".3rem", color: proj.color, fontWeight: 600, fontSize: ".78rem" }}>
                  View outcomes & details <span>→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Partner logos section */}
      <div style={{ padding: "48px 6%", background: T.ivory, borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: ".68rem", letterSpacing: ".2em", textTransform: "uppercase", color: T.slate, fontWeight: 600, marginBottom: ".5rem" }}>Organisations We've Partnered With</p>
          <p style={{ fontSize: ".85rem", color: T.earth, maxWidth: 660, margin: "0 auto 2rem", lineHeight: 1.75 }}>
            We have established working relationships with leading development, research, and agri-business organisations across Kenya and the region. These partnerships demonstrate our credibility and capacity to deliver — and we continue to build new collaborations aligned with our mission.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
            {PARTNER_DATA.map(p => <PartnerLogo key={p.name} p={p} />)}
          </div>
        </div>
      </div>

      {/* Project Detail Modal */}
      {activeProject && (
        <div className="overlay" onClick={() => setActiveProject(null)}>
          <div className="modal fade" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.2rem" }}>
              <div>
                <Badge label={activeProject.category} color={activeProject.color} />
                <h2 className="pf" style={{ fontSize: "1.3rem", color: T.forest, marginTop: ".5rem" }}>{activeProject.title}</h2>
                <div style={{ fontSize: ".75rem", color: T.slate, marginTop: ".2rem" }}>📍 {activeProject.region} · {activeProject.period}</div>
              </div>
              <button onClick={() => setActiveProject(null)} style={{ background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", color: T.slate, flexShrink: 0 }}>✕</button>
            </div>
            <p style={{ fontSize: ".88rem", color: T.earth, lineHeight: 1.8, marginBottom: "1.2rem" }}>{activeProject.detail}</p>
            <h3 style={{ fontSize: ".85rem", fontWeight: 700, color: T.forest, marginBottom: ".8rem" }}>Key Outcomes</h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: ".5rem", marginBottom: "1.4rem" }}>
              {activeProject.outcomes.map(o => (
                <li key={o} style={{ display: "flex", gap: ".6rem", alignItems: "flex-start", fontSize: ".83rem", color: T.earth }}>
                  <span style={{ color: activeProject.color, fontWeight: 700, flexShrink: 0 }}>✓</span> {o}
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem", marginBottom: "1.2rem" }}>
              <span style={{ fontSize: ".7rem", color: T.slate, fontWeight: 600 }}>Partners:</span>
              {activeProject.partners.map(p => (
                <span key={p} style={{ fontSize: ".7rem", fontWeight: 600, background: T.greenPale, color: T.earth, padding: "3px 9px", borderRadius: 20 }}>{p}</span>
              ))}
            </div>
            <Btn variant="primary" onClick={() => { setActiveProject(null); setPage("engage"); }}>Work With Us</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// INPUT FUND PAGE
// ═══════════════════════════════════════════════════════════════
function FundPage({ setPage }) {
  const faqs = [
    { q: "Who is eligible?", a: "Any registered farmer or farmer group with an active account at a partner financial institution in Nakuru or Nyandarua can apply. Groups of at least 5 members are prioritised." },
    { q: "What inputs can I access?", a: "Certified seeds (high-iron beans: Nyota & Angaza; AGRICO Potatoes: Markies), fertilisers, and recommended agrochemicals from approved input suppliers." },
    { q: "How is repayment structured?", a: "Repayment is due after the primary harvest season. There is no interest in the first cycle. Repeat cycles may attract a small facilitation fee reviewed with the group." },
    { q: "Can my group benefit collectively?", a: "Yes. Group revolving means one member's repayment enables another to access inputs — maximising the fund's reach within the group." },
    { q: "What support is provided during the season?", a: "Each participant receives agronomic follow-up visits, access to demo plots, and training on Good Agricultural Practices aligned with the crop planted." },
    { q: "Are mechanization services available through the fund?", a: "Yes — the fund has been integrated with our mechanization services programme. Qualifying farmers can access mechanized soil preparation and planting support as part of their input package." },
  ];

  return (
    <div className="fade" style={{ paddingTop: 62, minHeight: "100vh" }}>
      <div style={{ background: T.green, padding: "60px 6% 50px", position: "relative", overflow: "hidden" }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .08 }} viewBox="0 0 800 400">
          <circle cx="600" cy="200" r="220" fill={T.gold} />
        </svg>
        <div style={{ position: "relative", zIndex: 2, maxWidth: 760 }}>
          <Badge label="Flagship Programme" color={T.gold} />
          <h1 className="pf" style={{ fontSize: "clamp(2rem,4vw,3rem)", color: "#fff", margin: "1rem 0 1rem", lineHeight: 1.2 }}>
            Revolving Input Fund
          </h1>
          <p style={{ color: "rgba(255,255,255,0.78)", fontSize: ".95rem", lineHeight: 1.8, maxWidth: 580 }}>
            A proven programme that enables farmers to access certified agricultural inputs worth double their deposit — removing the financial barrier that prevents timely planting. Co-designed with trusted financial partners and tested in the field over multiple seasons.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 5%" }}>
        <div style={{ marginBottom: "3rem" }}>
          <h2 className="pf" style={{ fontSize: "1.6rem", color: T.forest, marginBottom: "1.5rem" }}>How It Works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1rem" }}>
            {[
              { icon: "🏦", title: "Open a Partner Account", desc: "Register with a vetted financial partner and make your initial deposit — any amount from KES 500." },
              { icon: "📦", title: "Select Your Inputs", desc: "Work with our agronomist to select certified seeds, fertiliser, or chemicals suited to your farm." },
              { icon: "🌾", title: "Farm with Support", desc: "Receive seasonal agronomic visits, demo plot access, and Good Agricultural Practices training." },
              { icon: "💸", title: "Sell, Repay & Revolve", desc: "After harvest, repay through the partner. Others in your group can immediately access the fund." },
            ].map(s => (
              <div key={s.title} style={{ background: "#fff", borderRadius: 12, padding: "1.5rem", boxShadow: "0 2px 10px rgba(27,47,26,.07)", borderTop: `3px solid ${T.gold}` }}>
                <div style={{ fontSize: "1.8rem", marginBottom: ".6rem" }}>{s.icon}</div>
                <div style={{ fontWeight: 700, color: T.forest, marginBottom: ".4rem", fontSize: ".92rem" }}>{s.title}</div>
                <div style={{ fontSize: ".8rem", color: T.slate, lineHeight: 1.65 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: T.greenPale, borderRadius: 14, padding: "2rem", marginBottom: "2.5rem", border: `1.5px solid ${T.greenL}33` }}>
          <h3 style={{ fontWeight: 700, color: T.forest, marginBottom: "1rem" }}>Eligible Inputs (Current Cycle)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: ".8rem" }}>
            {[
              { name: "Nyota Beans", type: "High-Iron Bean", partner: "KALRO" },
              { name: "Angaza Beans", type: "High-Iron Bean", partner: "KALRO" },
              { name: "Markies Potatoes", type: "Certified Potato Seed", partner: "AGRICO" },
              { name: "DAP / CAN Fertiliser", type: "Fertiliser", partner: "Approved Agro-dealers" },
            ].map(c => (
              <div key={c.name} style={{ background: "#fff", borderRadius: 10, padding: "1rem", border: `1px solid ${T.border}` }}>
                <div style={{ fontWeight: 700, color: T.forest, fontSize: ".88rem" }}>{c.name}</div>
                <div style={{ fontSize: ".72rem", color: T.greenL, fontWeight: 600, margin: ".2rem 0 .3rem" }}>{c.type}</div>
                <div style={{ fontSize: ".7rem", color: T.slate }}>via {c.partner}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "2.5rem" }}>
          <h2 className="pf" style={{ fontSize: "1.4rem", color: T.forest, marginBottom: "1.2rem" }}>Frequently Asked Questions</h2>
          {faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
        </div>

        <div style={{ textAlign: "center" }}>
          <p style={{ color: T.slate, marginBottom: "1rem", fontSize: ".88rem" }}>Interested in joining the revolving fund programme?</p>
          <Btn variant="primary" onClick={() => setPage("engage")}>Subscribe to Unlock Access</Btn>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `1.5px solid ${T.border}`, borderRadius: 10, marginBottom: ".6rem", overflow: "hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", background: open ? T.greenPale : "#fff", border: "none", padding: "1rem 1.2rem",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        cursor: "pointer", textAlign: "left", fontWeight: 600, color: T.forest, fontSize: ".88rem",
      }}>
        {q}
        <span style={{ color: T.greenL, fontWeight: 700, fontSize: "1.1rem", marginLeft: "1rem" }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div style={{ padding: ".9rem 1.2rem 1rem", background: T.greenPale, fontSize: ".83rem", color: T.earth, lineHeight: 1.75 }}>
          {a}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PROFESSIONALS PAGE — with photo upload & founder separation
// ═══════════════════════════════════════════════════════════════
function ProfessionalsPage({ toast, isAdmin, pros, setPros }) {
  const ready = pros !== null && pros !== undefined;
  const [filter, setFilter] = useState("All Fields");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [del, setDel] = useState(null);

  const blank = {
    name: "", init: "", field: "Agronomy", title: "", location: "",
    bio: "", skills: "", available: true, rate: "", rating: 5,
    reviews: 0, exp: "", photo: null, // photo = base64 string or null
    role: "associate", // "founder" | "associate"
  };
  const [form, setForm] = useState(blank);
  const fld = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── Photo upload handler ──────────────────────────────────
  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast("Photo must be under 2 MB"); return; }
    const reader = new FileReader();
    reader.onload = ev => fld("photo", ev.target.result);
    reader.readAsDataURL(file);
  }

  const list = (pros || []).filter(p => {
    const mf = filter === "All Fields" || p.field === filter;
    const s = search.toLowerCase();
    const ms = !s || [p.name, p.field, p.title, p.location].some(x => (x || "").toLowerCase().includes(s));
    return mf && ms;
  });

  const founder = list.filter(p => p.role === "founder" || p.id === 1);
  const associates = list.filter(p => p.role !== "founder" && p.id !== 1);

  function openAdd() { setForm(blank); setEditing(null); setShowForm(true); }
  function openEdit(p) {
    setForm({ ...p, skills: Array.isArray(p.skills) ? p.skills.join(", ") : p.skills });
    setEditing(p.id); setShowForm(true);
  }

  async function save() {
    if (!form.name.trim() || !form.title.trim()) { toast("Name and title are required"); return; }
    const skills = String(form.skills).split(",").map(s => s.trim()).filter(Boolean);
    const init = form.init || form.name.split(" ").map(w => w[0]).join("").slice(0, 3).toUpperCase();
    const entry = { ...form, skills, init };
    if (editing !== null) {
      await setPros(ps => ps.map(p => p.id === editing ? { ...entry, id: editing } : p));
      toast("Profile updated");
    } else {
      await setPros(ps => [...ps, { ...entry, id: Date.now() }]);
      toast("Team member added");
    }
    setShowForm(false);
  }

  async function remove(id) {
    await setPros(ps => ps.filter(p => p.id !== id));
    setDel(null); toast("Team member removed");
  }

  // ── Avatar component (photo or initials fallback) ─────────
  function Avatar({ p, size = 80 }) {
    if (p.photo) return (
      <img src={p.photo} alt={p.name} style={{
        width: size, height: size, borderRadius: "50%", objectFit: "cover",
        border: `3px solid ${p.role === "founder" || p.id === 1 ? T.gold : T.green}`,
        display: "block", margin: "0 auto",
      }} />
    );
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: p.role === "founder" || p.id === 1
          ? `linear-gradient(135deg, ${T.gold}, ${T.goldL})`
          : `linear-gradient(135deg, ${T.green}, ${T.greenL})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto", fontWeight: 800,
        fontSize: size > 60 ? "1.3rem" : "1rem",
        color: "#fff", letterSpacing: ".02em",
        border: `3px solid ${p.role === "founder" || p.id === 1 ? T.gold+"44" : T.green+"44"}`,
      }}>{p.init || p.name.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
    );
  }

  // ── Team card ─────────────────────────────────────────────
  function TeamCard({ p, isFounder }) {
    return (
      <div className="pro-card" style={{
        background: "#fff", borderRadius: 14, padding: "1.8rem 1.5rem",
        position: "relative", textAlign: "center",
        border: isFounder ? `2px solid ${T.gold}33` : `1.5px solid ${T.border}`,
        boxShadow: isFounder ? `0 4px 24px ${T.gold}18` : "0 2px 10px rgba(26,51,41,.06)",
      }}>
        {isFounder && (
          <div style={{
            position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
            background: T.gold, color: T.forest, fontSize: ".6rem", fontWeight: 800,
            letterSpacing: ".1em", textTransform: "uppercase",
            padding: "3px 14px", borderRadius: "0 0 8px 8px",
          }}>Founder & Lead Consultant</div>
        )}
        {isAdmin && (
          <div style={{ position: "absolute", top: ".8rem", right: ".8rem", display: "flex", gap: ".3rem" }}>
            <Btn small variant="outline" onClick={() => openEdit(p)}>✏️</Btn>
            {p.id !== 1 && <Btn small variant="outline" onClick={() => setDel(p.id)} style={{ color: T.red, borderColor: T.red+"44" }}>✕</Btn>}
          </div>
        )}

        <div style={{ marginTop: isFounder ? "1rem" : 0, marginBottom: "1rem" }}>
          <Avatar p={p} size={isFounder ? 90 : 72} />
        </div>

        <div className="pf" style={{ fontSize: isFounder ? "1.1rem" : "1rem", color: T.forest, fontWeight: 700, marginBottom: ".25rem" }}>
          {p.name}
        </div>
        <div style={{ fontSize: ".75rem", color: T.slate, marginBottom: ".6rem", lineHeight: 1.4 }}>{p.title}</div>

        <div style={{ display: "flex", justifyContent: "center", gap: ".4rem", flexWrap: "wrap", marginBottom: ".9rem" }}>
          <Badge label={p.field} color={T.greenL} />
          <Badge label={p.available ? "Available" : "Busy"} color={p.available ? T.green : T.slate} />
        </div>

        {p.location && (
          <div style={{ fontSize: ".72rem", color: T.slate, marginBottom: ".8rem" }}>📍 {p.location}</div>
        )}

        <p style={{ fontSize: ".8rem", color: T.earth, lineHeight: 1.7, marginBottom: ".9rem", textAlign: "left" }}>{p.bio}</p>

        {Array.isArray(p.skills) && p.skills.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".3rem", marginBottom: ".9rem", justifyContent: "center" }}>
            {p.skills.map(sk => (
              <span key={sk} style={{
                fontSize: ".62rem", background: T.ivory, color: T.earth,
                padding: "2px 7px", borderRadius: 10,
                border: `1px solid ${T.border}`, fontWeight: 500,
              }}>{sk}</span>
            ))}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: ".8rem", borderTop: `1px solid ${T.border}` }}>
          <div>
            <Stars n={p.rating || 5} />
            <div style={{ fontSize: ".65rem", color: T.slate, marginTop: ".1rem" }}>
              {p.reviews || 0} reviews · {p.exp || "—"} yrs
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: ".7rem", color: T.slate, marginBottom: ".1rem" }}>Day Rate</div>
            <div style={{ fontWeight: 700, color: T.forest, fontSize: ".82rem" }}>{p.rate || "By quotation"}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade" style={{ minHeight: "100vh", background: T.ivory }}>

      {/* ── PAGE HEADER ─────────────────────────────────────── */}
      <div style={{ background: T.forest, padding: "78px 6% 48px", position: "relative", overflow: "hidden" }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .05 }}
          viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice">
          <defs><pattern id="pg" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke={T.gold} strokeWidth=".8"/>
          </pattern></defs>
          <rect width="1200" height="300" fill="url(#pg)" />
        </svg>
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <p style={{ fontSize: ".68rem", letterSpacing: ".18em", textTransform: "uppercase", color: T.gold, fontWeight: 700, marginBottom: ".4rem" }}>Our Team</p>
              <h1 className="pf" style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", color: T.ivory, marginBottom: ".6rem" }}>
                Meet Our <em style={{ color: T.goldL }}>Consultants</em>
              </h1>
              <p style={{ color: "rgba(245,240,232,0.65)", fontSize: ".88rem", maxWidth: 540, lineHeight: 1.8 }}>
                Our founder and associate consultants bring deep specialist expertise across agriculture, rural enterprise, market systems, and development programme delivery.
              </p>
            </div>
            {isAdmin && (
              <Btn variant="gold" onClick={openAdd}>+ Add Team Member</Btn>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 5% 60px" }}>

        {/* ── SEARCH + FILTER ─────────────────────────────────── */}
        <div style={{ display: "flex", gap: ".8rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
          <div style={{ flex: "1 1 260px", position: "relative" }}>
            <span style={{ position: "absolute", left: ".9rem", top: "50%", transform: "translateY(-50%)", color: T.slate }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, specialisation, or location…"
              className="field-input" style={{ paddingLeft: "2.4rem" }} />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="field-input" style={{ minWidth: 200, width: "auto", flex: "0 0 auto" }}>
            {FIELDS.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>

        {!ready ? (
          <p style={{ textAlign: "center", color: T.slate, padding: "3rem" }}>Loading team…</p>
        ) : list.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: T.slate }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👥</div>
            <p style={{ marginBottom: "1rem" }}>No team members match your search.</p>
            {isAdmin && <Btn variant="gold" onClick={openAdd}>Add the first member</Btn>}
          </div>
        ) : (
          <>
            {/* ── FOUNDER ─────────────────────────────────────── */}
            {founder.length > 0 && (
              <div style={{ marginBottom: "3rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.4rem" }}>
                  <div style={{ height: 1, flex: 1, background: T.border }} />
                  <span style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: T.gold }}>Founder</span>
                  <div style={{ height: 1, flex: 1, background: T.border }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.2rem", maxWidth: 660, margin: "0 auto" }}>
                  {founder.map(p => <TeamCard key={p.id} p={p} isFounder={true} />)}
                </div>
              </div>
            )}

            {/* ── ASSOCIATES ──────────────────────────────────── */}
            {associates.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.4rem" }}>
                  <div style={{ height: 1, flex: 1, background: T.border }} />
                  <span style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: T.slate }}>Associate Consultants</span>
                  <div style={{ height: 1, flex: 1, background: T.border }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1.1rem" }}>
                  {associates.map(p => <TeamCard key={p.id} p={p} isFounder={false} />)}
                </div>
              </div>
            )}

            {/* Coming Soon placeholder when only founder exists */}
            {associates.length === 0 && isAdmin && (
              <div style={{ textAlign: "center", padding: "2.5rem", background: T.greenPale, borderRadius: 14, border: `1.5px dashed ${T.green}44` }}>
                <div style={{ fontSize: "1.8rem", marginBottom: ".6rem" }}>👥</div>
                <div style={{ fontWeight: 600, color: T.green, marginBottom: ".4rem" }}>No associate consultants yet</div>
                <p style={{ fontSize: ".82rem", color: T.slate, marginBottom: "1rem" }}>Click "+ Add Team Member" to onboard your first associate consultant.</p>
                <Btn variant="outline" onClick={openAdd} style={{ borderColor: T.green, color: T.green }}>Add Associate Consultant</Btn>
              </div>
            )}
            {associates.length === 0 && !isAdmin && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "1rem" }}>
                {["M&E Specialist","Agronomist","Livestock Specialist","Value Chain Expert","Climate Change Advisor","Economist"].map(role => (
                  <div key={role} style={{ background: "#fff", borderRadius: 12, padding: "1.5rem", textAlign: "center", border: `1.5px dashed ${T.border}` }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.ivoryDark, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: "1.2rem" }}>?</div>
                    <div style={{ fontWeight: 600, color: T.charcoal, fontSize: ".88rem" }}>{role}</div>
                    <Badge label="Coming Soon" color={T.slate} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── ADD / EDIT MODAL ────────────────────────────────── */}
      {showForm && (
        <div className="overlay" onClick={() => setShowForm(false)}>
          <div className="modal fade" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.4rem" }}>
              <h2 className="pf" style={{ fontSize: "1.25rem", color: T.forest }}>
                {editing !== null ? "Edit Team Member" : "Add Team Member"}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", color: T.slate }}>✕</button>
            </div>

            {/* Photo upload */}
            <div style={{ marginBottom: "1.2rem", textAlign: "center" }}>
              <label htmlFor="photo-upload" style={{ cursor: "pointer", display: "inline-block" }}>
                {form.photo ? (
                  <img src={form.photo} alt="Preview" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: `3px solid ${T.gold}`, display: "block", margin: "0 auto .5rem" }} />
                ) : (
                  <div style={{ width: 80, height: 80, borderRadius: "50%", background: T.greenPale, border: `2px dashed ${T.green}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto .5rem", flexDirection: "column", gap: ".2rem" }}>
                    <span style={{ fontSize: "1.4rem" }}>📷</span>
                    <span style={{ fontSize: ".55rem", color: T.slate, fontWeight: 600 }}>Upload</span>
                  </div>
                )}
                <div style={{ fontSize: ".72rem", color: T.green, fontWeight: 600, marginTop: ".4rem" }}>
                  {form.photo ? "Change Photo" : "Upload Profile Photo"}
                </div>
              </label>
              <input id="photo-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
              {form.photo && (
                <button onClick={() => fld("photo", null)} style={{ display: "block", margin: ".3rem auto 0", background: "none", border: "none", fontSize: ".7rem", color: T.red, cursor: "pointer" }}>
                  Remove photo
                </button>
              )}
            </div>

            {/* Role selector */}
            <div style={{ marginBottom: ".9rem" }}>
              <label className="field-label">Role in Team</label>
              <div style={{ display: "flex", gap: ".6rem" }}>
                {[["founder","Founder"],["associate","Associate Consultant"]].map(([val, lbl]) => (
                  <button key={val} onClick={() => fld("role", val)} style={{
                    flex: 1, padding: ".55rem", borderRadius: 8, fontWeight: 600, fontSize: ".8rem", cursor: "pointer",
                    background: form.role === val ? T.forest : "#fff",
                    color: form.role === val ? T.ivory : T.slate,
                    border: `1.5px solid ${form.role === val ? T.forest : T.border}`,
                  }}>{lbl}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".8rem", marginBottom: ".8rem" }}>
              <div>
                <label className="field-label">Full Name *</label>
                <input className="field-input" value={form.name} onChange={e => fld("name", e.target.value)} placeholder="e.g. Jackson Irungu Ngenye" />
              </div>
              <div>
                <label className="field-label">Initials</label>
                <input className="field-input" value={form.init} onChange={e => fld("init", e.target.value)} placeholder="Auto from name" />
              </div>
            </div>

            {[["Job Title *","title","e.g. Lead Consultant — Market Systems"],["Location","location","e.g. Nakuru / Nyandarua"],["Day Rate (internal reference)","rate","e.g. KES 8,000/day or By quotation"],["Years Experience","exp","e.g. 5+"]].map(([lbl,key,ph]) => (
              <div key={key} style={{ marginBottom: ".8rem" }}>
                <label className="field-label">{lbl}</label>
                <input className="field-input" value={form[key]} onChange={e => fld(key, e.target.value)} placeholder={ph} />
              </div>
            ))}

            <div style={{ marginBottom: ".8rem" }}>
              <label className="field-label">Field / Specialisation</label>
              <select className="field-input" value={form.field} onChange={e => fld("field", e.target.value)}>
                {FIELDS.slice(1).map(f => <option key={f}>{f}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: ".8rem" }}>
              <label className="field-label">Bio / Profile</label>
              <textarea className="field-input" rows={3} value={form.bio}
                onChange={e => fld("bio", e.target.value)}
                placeholder="Brief professional background and key expertise…"
                style={{ resize: "vertical" }} />
            </div>

            <div style={{ marginBottom: ".8rem" }}>
              <label className="field-label">Skills (comma-separated)</label>
              <input className="field-input" value={form.skills} onChange={e => fld("skills", e.target.value)} placeholder="e.g. Market Linkage, Value Chains, SurveyCTO" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".8rem", marginBottom: "1rem" }}>
              <div>
                <label className="field-label">Star Rating</label>
                <select className="field-input" value={form.rating} onChange={e => fld("rating", Number(e.target.value))}>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n>1?"s":""}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Reviews Count</label>
                <input className="field-input" type="number" min="0" value={form.reviews} onChange={e => fld("reviews", Number(e.target.value))} />
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: ".6rem", cursor: "pointer", marginBottom: "1.4rem" }}>
              <input type="checkbox" checked={form.available} onChange={e => fld("available", e.target.checked)} style={{ width: 16, height: 16, accentColor: T.green }} />
              <span style={{ fontSize: ".85rem", color: T.forest, fontWeight: 500 }}>Currently available for new engagements</span>
            </label>

            <div style={{ display: "flex", gap: ".8rem" }}>
              <Btn variant="outline" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</Btn>
              <Btn variant="primary" onClick={save} style={{ flex: 2 }}>
                {editing !== null ? "Save Changes" : "Add to Team"}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM DELETE ───────────────────────────────────── */}
      {del && (
        <div className="overlay" onClick={() => setDel(null)}>
          <div className="modal fade" style={{ maxWidth: 380, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚠️</div>
            <h3 className="pf" style={{ color: T.forest, marginBottom: ".6rem" }}>Remove Team Member?</h3>
            <p style={{ color: T.slate, fontSize: ".85rem", marginBottom: "1.5rem" }}>This will permanently remove their profile.</p>
            <div style={{ display: "flex", gap: ".8rem" }}>
              <Btn variant="outline" onClick={() => setDel(null)} style={{ flex: 1 }}>Cancel</Btn>
              <Btn variant="danger" onClick={() => remove(del)} style={{ flex: 1 }}>Remove</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ENGAGE US PAGE (Quote-on-Request — replaces Subscriptions)
// ═══════════════════════════════════════════════════════════════
function EngagePage({ inquiries, setInquiries, toast }) {
  const EMPTY_FORM = { name: "", email: "", phone: "", org: "", county: "", clientType: "", services: [], message: "", budget: "" };
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});
  const fld = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: false })); };

  function toggleService(s) {
    setForm(f => ({ ...f, services: f.services.includes(s) ? f.services.filter(x => x !== s) : [...f.services, s] }));
  }

  async function submit() {
    // Validate and show per-field errors
    const newErrors = {};
    if (!form.name.trim())      newErrors.name = true;
    if (!form.email.trim())     newErrors.email = true;
    if (!form.phone.trim())     newErrors.phone = true;
    if (!form.message.trim())   newErrors.message = true;
    if (!form.clientType)       newErrors.clientType = true;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast("Please fill in all required fields marked in red");
      return;
    }

    setSending(true);
    const inq = {
      id: Date.now(),
      ...form,
      date: new Date().toLocaleDateString("en-KE"),
      status: "New",
      assignedTo: null,
      quote: null,
    };

    try {
      await setInquiries(prev => [...(prev || []), inq]);
    } catch (_) {
      // storage may not be available in preview — still show success
    }

    setSending(false);
    setSubmitted(true);
    // Scroll to top so success screen is visible
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (_) {}
    toast("Inquiry received — we will respond within 24–48 hours!");
  }

  function reset() {
    setSubmitted(false);
    setSending(false);
    setErrors({});
    setForm(EMPTY_FORM);
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (_) {}
  }

  const inputStyle = (field) => ({
    width: "100%", padding: ".68rem .9rem",
    border: `1.5px solid ${errors[field] ? T.red : T.border}`,
    borderRadius: 8, fontSize: ".88rem", color: T.charcoal,
    background: errors[field] ? "#FFF5F5" : "#fff",
    outline: "none", fontFamily: "Inter,sans-serif",
    transition: "border .18s",
  });

  if (submitted) return (
    <div className="fade" style={{
      paddingTop: 62, minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", textAlign: "center", padding: "100px 5% 60px",
      background: T.ivory,
    }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: T.greenPale, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", margin: "0 auto 1.5rem", border: `2px solid ${T.green}33` }}>✅</div>
      <h1 className="pf" style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", color: T.forest, marginBottom: ".8rem" }}>Inquiry Received!</h1>
      <p style={{ color: T.slate, maxWidth: 480, lineHeight: 1.85, marginBottom: "2rem", fontSize: ".93rem" }}>
        Thank you, <strong style={{ color: T.forest }}>{form.name}</strong>. Our team will review your request and send a personalised quotation within <strong>24–48 hours</strong> to <strong style={{ color: T.green }}>{form.email}</strong>.
      </p>
      <div style={{ background: "#fff", border: `1.5px solid ${T.border}`, borderRadius: 12, padding: "1.4rem 1.8rem", maxWidth: 420, marginBottom: "2rem", textAlign: "left", width: "100%" }}>
        <div style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: T.gold, marginBottom: ".7rem" }}>Contact Us Directly</div>
        <div style={{ fontSize: ".85rem", color: T.earth, lineHeight: 2 }}>
          📞 <strong>+254 723 565 425</strong><br />
          ✉️ <strong>consultancyagrivision@gmail.com</strong><br />
          📍 Nakuru, Kenya
        </div>
      </div>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Btn variant="primary" onClick={reset}>Submit Another Inquiry</Btn>
        <Btn variant="outline" onClick={() => window.location.reload?.()}>Back to Home</Btn>
      </div>
    </div>
  );

  return (
    <div className="fade" style={{ paddingTop: 62, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${T.forest} 0%, ${T.green} 100%)`, padding: "52px 6% 44px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Badge label="Work With Us" color={T.gold} />
          <h1 className="pf" style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)", color: T.ivory, margin: "1rem 0 .8rem" }}>Engage Agrivision Consultancy</h1>
          <p style={{ color: "rgba(245,240,232,0.72)", maxWidth: 600, lineHeight: 1.8, fontSize: ".92rem" }}>
            We serve governments, NGOs, development partners, and agribusinesses. Describe your need — we will review the scope, discuss it with you, and issue a formal quotation on our own terms. Tell us about your need and we will prepare a tailored consultancy quotation based on the scope and nature of your work.
          </p>
        </div>
      </div>

      {/* Who We Serve */}
      <div style={{ background: T.ivory, padding: "40px 6% 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: ".68rem", letterSpacing: ".18em", textTransform: "uppercase", color: T.gold, fontWeight: 700, marginBottom: "1rem" }}>Who We Serve</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1rem" }}>
            {ENGAGEMENT_TYPES.map(e => (
              <div key={e.id} onClick={() => { fld("clientType", e.id); setErrors(err => ({...err, clientType: false})); }} style={{
                background: "#fff", borderRadius: 12, padding: "1.3rem",
                border: `2px solid ${form.clientType === e.id ? T.greenL : errors.clientType ? T.red : T.border}`,
                cursor: "pointer", transition: "all .18s",
                boxShadow: form.clientType === e.id ? `0 4px 18px ${T.greenL}22` : "0 2px 8px rgba(27,47,26,.05)",
              }}>
                <div style={{ fontSize: "1.8rem", marginBottom: ".5rem" }}>{e.icon}</div>
                <div style={{ fontWeight: 700, color: T.forest, fontSize: ".88rem", marginBottom: ".35rem" }}>{e.label}</div>
                <div style={{ fontSize: ".75rem", color: T.slate, lineHeight: 1.6 }}>{e.desc}</div>
                {form.clientType === e.id && (
                  <div style={{ marginTop: ".6rem", fontSize: ".7rem", color: T.greenL, fontWeight: 700 }}>✓ Selected</div>
                )}
              </div>
            ))}
          </div>
          {errors.clientType && <p style={{ fontSize: ".72rem", color: T.red, marginTop: ".5rem", fontWeight: 600 }}>⚠ Please select who you are</p>}
        </div>
      </div>

      {/* Inquiry Form */}
      <div style={{ padding: "40px 6% 60px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h2 className="pf" style={{ fontSize: "1.4rem", color: T.forest, marginBottom: ".4rem" }}>Submit Your Inquiry</h2>
          <p style={{ fontSize: ".83rem", color: T.slate, marginBottom: "1.8rem", lineHeight: 1.7 }}>
            Fill in the form below. We'll review your request, discuss the scope with you, and send a personalised quote — there is no fixed price list. Each engagement is priced on its own terms.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            {[["Full Name *", "name"], ["Email Address *", "email"]].map(([l, k]) => (
              <div key={k}>
                <label className="field-label" style={{ color: errors[k] ? T.red : undefined }}>{l}</label>
                <input style={inputStyle(k)} value={form[k]} onChange={e => fld(k, e.target.value)} />
                {errors[k] && <span style={{ fontSize: ".68rem", color: T.red, marginTop: ".2rem", display: "block" }}>This field is required</span>}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            {[["Phone Number *", "phone"], ["Organisation / Farm Name", "org"]].map(([l, k]) => (
              <div key={k}>
                <label className="field-label" style={{ color: errors[k] ? T.red : undefined }}>{l}</label>
                <input style={inputStyle(k)} value={form[k]} onChange={e => fld(k, e.target.value)} />
                {errors[k] && <span style={{ fontSize: ".68rem", color: T.red, marginTop: ".2rem", display: "block" }}>This field is required</span>}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label className="field-label">County / Region</label>
              <input className="field-input" value={form.county} onChange={e => fld("county", e.target.value)} placeholder="e.g. Nakuru, Nyandarua" />
            </div>
            <div>
              <label className="field-label">Approximate Budget (optional)</label>
              <input className="field-input" value={form.budget} onChange={e => fld("budget", e.target.value)} placeholder="e.g. KES 50,000 or Open" />
            </div>
          </div>

          <div style={{ marginBottom: "1.2rem" }}>
            <label className="field-label">Services of Interest (select all that apply)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", marginTop: ".5rem" }}>
              {SERVICE_AREAS.map(s => (
                <button key={s} onClick={() => toggleService(s)} style={{
                  background: form.services.includes(s) ? T.greenL : "#fff",
                  color: form.services.includes(s) ? "#fff" : T.earth,
                  border: `1.5px solid ${form.services.includes(s) ? T.greenL : T.border}`,
                  borderRadius: 20, padding: ".3rem .85rem", fontSize: ".72rem",
                  fontWeight: 600, cursor: "pointer", transition: "all .15s",
                }}>{s}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label className="field-label" style={{ color: errors.message ? T.red : undefined }}>Describe Your Need *</label>
            <textarea
              rows={5} value={form.message}
              onChange={e => fld("message", e.target.value)}
              placeholder="Tell us about your farm, project, or programme. What challenge are you facing? What outcome do you want? The more detail you provide, the more accurate our quotation will be."
              style={{ ...inputStyle("message"), resize: "vertical" }} />
            {errors.message && <span style={{ fontSize: ".68rem", color: T.red, marginTop: ".2rem", display: "block" }}>Please describe your need</span>}
          </div>

          <div style={{ background: T.goldPale, border: `1.5px solid ${T.gold}33`, borderRadius: 10, padding: "1rem 1.2rem", marginBottom: "1.5rem", fontSize: ".8rem", color: T.earth, lineHeight: 1.7 }}>
            💡 <strong>How our pricing works:</strong> We do not publish a fixed price list. Once we receive your inquiry, our lead consultant will review the scope of work, discuss it with you, and send a formal quotation tailored to your engagement. This allows us to be fair, flexible, and transparent.
          </div>

          <button
            onClick={submit}
            disabled={sending}
            style={{
              width: "100%", padding: ".9rem 1.5rem", borderRadius: 8,
              background: sending ? T.slate : T.forest,
              color: T.ivory, border: "none", fontWeight: 700,
              fontSize: ".92rem", cursor: sending ? "not-allowed" : "pointer",
              transition: "all .2s", letterSpacing: ".01em",
              display: "flex", alignItems: "center", justifyContent: "center", gap: ".6rem",
            }}
          >
            {sending ? (
              <><span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(245,240,232,0.3)", borderTopColor: T.ivory, borderRadius: "50%", animation: "spin .7s linear infinite" }} /> Submitting…</>
            ) : (
              "Submit Inquiry — Request a Quote →"
            )}
          </button>
          <p style={{ fontSize: ".72rem", color: T.slate, textAlign: "center", marginTop: ".8rem" }}>We respond within 24–48 hours. No commitment required at this stage.</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD PAGE (Admin)
// ═══════════════════════════════════════════════════════════════
function DashboardPage({ pros, isAdmin, setPage, inquiries, setInquiries }) {
  const [tab, setTab] = useState("overview");
  const TABS = ["overview", "inquiries", "professionals", "fund"];
  const [quoteModal, setQuoteModal] = useState(null); // holds inquiry id being quoted
  const [quoteForm, setQuoteForm] = useState({ amount: "", currency: "KES", scope: "", validity: "14 days", notes: "" });
  const [replyModal, setReplyModal] = useState(null);

  const availPros = (pros || []).filter(p => p.available);
  const fields = [...new Set((pros || []).map(p => p.field))];
  const inqList = inquiries || [];

  const totalRevenue = inqList
    .filter(i => i.quote && i.status === "Accepted")
    .reduce((acc, i) => acc + (parseInt((i.quote.amount || "0").toString().replace(/[^0-9]/g, "")) || 0), 0);

  async function sendQuote(id) {
    if (!quoteForm.amount) { return; }
    await setInquiries(prev => prev.map(inq => inq.id === id ? {
      ...inq,
      status: "Quoted",
      quote: { ...quoteForm, sentOn: new Date().toLocaleDateString("en-KE") }
    } : inq));
    setQuoteModal(null);
    setQuoteForm({ amount: "", currency: "KES", scope: "", validity: "14 days", notes: "" });
  }

  async function markAccepted(id) {
    await setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: "Accepted" } : inq));
  }

  async function markDeclined(id) {
    await setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: "Declined" } : inq));
  }

  const [assignModal, setAssignModal] = useState(null);
  const [assignPro, setAssignPro] = useState("");

  async function updateInquiryStatus(id, status) {
    await setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status } : inq));
  }

  async function assignToPro(id) {
    await setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, assignedTo: assignPro, status: "Assigned" } : inq));
    setAssignModal(null);
    setAssignPro("");
  }

  const tabStyle = (t) => ({
    background: "none", border: "none", cursor: "pointer",
    fontSize: ".82rem", fontWeight: tab === t ? 700 : 400,
    color: tab === t ? T.goldL : "rgba(244,241,232,0.65)",
    borderBottom: `2.5px solid ${tab === t ? T.goldL : "transparent"}`,
    padding: ".6rem 1rem", transition: "all .18s",
  });

  const statusColor = (s) => ({ "New": T.greenL, "In Progress": T.gold, "Quoted": T.blue, "Accepted": T.green, "Declined": T.red, "Resolved": T.slate, "Assigned": T.blue }[s] || T.slate);

  if (!isAdmin) return (
    <div className="fade" style={{ paddingTop: 62, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 5%", flexDirection: "column", textAlign: "center" }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔐</div>
      <h2 className="pf" style={{ fontSize: "1.8rem", color: T.forest, marginBottom: ".8rem" }}>Admin Access Required</h2>
      <p style={{ color: T.slate, maxWidth: 420, lineHeight: 1.8, marginBottom: "1.5rem" }}>The dashboard is restricted to authorised administrators. Please sign in to view analytics and manage the platform.</p>
      <p style={{ fontSize: ".78rem", color: T.slate }}>Use the <strong>🔐 Admin</strong> button in the top navigation to sign in.</p>
    </div>
  );

  return (
    <div className="fade" style={{ paddingTop: 62, minHeight: "100vh", background: T.ivory }}>
      <div style={{ background: T.forest, padding: "32px 5% 0", borderBottom: `3px solid ${T.gold}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.4rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <p style={{ fontSize: ".68rem", letterSpacing: ".2em", textTransform: "uppercase", color: T.gold, fontWeight: 700 }}>Admin Dashboard</p>
              <h1 className="pf" style={{ fontSize: "1.6rem", color: T.ivory, marginTop: ".2rem" }}>Agrivision — Control Centre</h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {inqList.filter(i => i.status === "New").length > 0 && (
                <div style={{ background: T.red, color: "#fff", borderRadius: 20, padding: ".25rem .7rem", fontSize: ".72rem", fontWeight: 700 }}>
                  {inqList.filter(i => i.status === "New").length} new inquiries
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4ade80" }} />
                <span style={{ fontSize: ".78rem", color: "rgba(244,241,232,0.65)" }}>All Systems Operational</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 0, borderTop: "1px solid rgba(244,241,232,0.08)" }}>
            {TABS.map(t => (
              <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
                {t === "inquiries"
                  ? `💬 Inquiries${inqList.filter(i => i.status === "New").length > 0 ? ` (${inqList.filter(i => i.status === "New").length})` : ""}`
                  : t === "fund" ? "🌱 Input Fund"
                  : t === "professionals" ? "👥 Professionals"
                  : "📊 Overview"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 5% 4rem" }}>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="fade">
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
              <StatCard icon="👥" value={(pros || []).length} label="Professionals" sub={`${availPros.length} available`} accent={T.greenL} />
              <StatCard icon="💬" value={inqList.length} label="Total Inquiries" sub={`${inqList.filter(i => i.status === "New").length} new · ${inqList.filter(i => i.status === "Quoted").length} quoted`} accent={T.gold} />
              <StatCard icon="✅" value={inqList.filter(i => i.status === "Accepted").length} label="Accepted Quotes" sub="Confirmed engagements" accent={T.green} />
              <StatCard icon="💰" value={totalRevenue > 0 ? `KES ${totalRevenue.toLocaleString()}` : "—"} label="Revenue Pipeline" sub="Accepted engagements" accent={T.gold} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.2rem" }}>
              <div style={{ background: "#fff", borderRadius: 12, padding: "1.4rem", boxShadow: "0 2px 10px rgba(27,47,26,.06)" }}>
                <h3 style={{ fontSize: ".88rem", fontWeight: 700, color: T.forest, marginBottom: "1rem" }}>Professionals by Field</h3>
                {fields.map(f => {
                  const count = (pros || []).filter(p => p.field === f).length;
                  return (
                    <div key={f} style={{ marginBottom: ".75rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".74rem", color: T.slate, marginBottom: ".25rem" }}>
                        <span>{f}</span><span style={{ fontWeight: 700, color: T.forest }}>{count}</span>
                      </div>
                      <ProgressBar value={count} max={(pros || []).length} color={T.greenL} />
                    </div>
                  );
                })}
              </div>

              <div style={{ background: "#fff", borderRadius: 12, padding: "1.4rem", boxShadow: "0 2px 10px rgba(27,47,26,.06)" }}>
                <h3 style={{ fontSize: ".88rem", fontWeight: 700, color: T.forest, marginBottom: "1rem" }}>Inquiries by Client Type</h3>
                {[
                  { label: "Farmer / Cooperative", id: "farmer", color: T.greenL },
                  { label: "NGO / Dev. Organisation", id: "ngo", color: T.gold },
                  { label: "Public-Private Partnership", id: "ppp", color: T.green },
                  { label: "Commercial Farm / Agribusiness", id: "commercial", color: T.blue },
                  { label: "Other / Unspecified", id: "", color: T.slate },
                ].map(ct => {
                  const count = inqList.filter(i => i.clientType === ct.id || (ct.id === "" && !ct.id && !["farmer","ngo","ppp","commercial"].includes(i.clientType))).length;
                  return (
                    <div key={ct.id || "other"} style={{ marginBottom: ".75rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".74rem", color: T.slate, marginBottom: ".25rem" }}>
                        <span>{ct.label}</span><span style={{ fontWeight: 700, color: T.forest }}>{count}</span>
                      </div>
                      <ProgressBar value={count} max={Math.max(inqList.length, 1)} color={ct.color} />
                    </div>
                  );
                })}
                {inqList.length === 0 && <p style={{ fontSize: ".8rem", color: T.slate }}>No inquiries yet.</p>}
              </div>

              <div style={{ background: "#fff", borderRadius: 12, padding: "1.4rem", boxShadow: "0 2px 10px rgba(27,47,26,.06)" }}>
                <h3 style={{ fontSize: ".88rem", fontWeight: 700, color: T.forest, marginBottom: "1rem" }}>Engagement Pipeline</h3>
                {[
                  { label: "🟢 New Inquiries", val: inqList.filter(i => i.status === "New").length, color: T.greenL },
                  { label: "🔄 In Review", val: inqList.filter(i => i.status === "In Progress").length, color: T.gold },
                  { label: "📋 Quote Sent", val: inqList.filter(i => i.status === "Quoted").length, color: T.blue },
                  { label: "✅ Quote Accepted", val: inqList.filter(i => i.status === "Accepted").length, color: T.green },
                  { label: "❌ Declined", val: inqList.filter(i => i.status === "Declined").length, color: T.red },
                  { label: "✔ Resolved / Closed", val: inqList.filter(i => i.status === "Resolved").length, color: T.slate },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: ".5rem 0", borderBottom: `1px solid rgba(27,47,26,.06)`, fontSize: ".82rem" }}>
                    <span style={{ color: T.slate }}>{s.label}</span>
                    <span style={{ fontWeight: 700, color: s.color }}>{s.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* INQUIRIES TAB — with full quotation workflow */}
        {tab === "inquiries" && (
          <div className="fade">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem", flexWrap: "wrap", gap: ".8rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: T.forest }}>Client Inquiries & Quotations ({inqList.length})</h2>
              <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
                {["New","In Progress","Quoted","Accepted","Declined","Resolved"].map(s => (
                  <span key={s} style={{ fontSize: ".68rem", background: statusColor(s) + "18", color: statusColor(s), padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>
                    {s}: {inqList.filter(i => i.status === s).length}
                  </span>
                ))}
              </div>
            </div>

            {inqList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: T.slate }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>💬</div>
                <p style={{ marginBottom: ".5rem" }}>No inquiries yet.</p>
                <p style={{ fontSize: ".82rem" }}>Clients submit inquiries via the <strong>Engage Us</strong> page or the chat widget.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {inqList.slice().reverse().map(inq => (
                  <div key={inq.id} style={{
                    background: "#fff", borderRadius: 12, padding: "1.4rem",
                    boxShadow: "0 2px 10px rgba(27,47,26,.06)",
                    border: `1.5px solid ${inq.status === "New" ? T.greenL + "44" : inq.status === "Accepted" ? T.gold + "55" : T.border}`
                  }}>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: ".8rem", marginBottom: ".8rem" }}>
                      <div>
                        <div style={{ fontWeight: 700, color: T.forest, fontSize: ".95rem" }}>{inq.name}</div>
                        <div style={{ fontSize: ".73rem", color: T.slate, marginTop: ".15rem" }}>
                          {inq.email} · {inq.phone} · {inq.date}
                          {inq.org && <span> · {inq.org}</span>}
                          {inq.county && <span> · 📍 {inq.county}</span>}
                        </div>
                        <div style={{ marginTop: ".5rem", display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
                          {inq.clientType && <Badge label={ENGAGEMENT_TYPES.find(e => e.id === inq.clientType)?.label || inq.clientType} color={T.greenL} />}
                          {(inq.services || []).map(s => <Badge key={s} label={s} color={T.green} />)}
                        </div>
                      </div>
                      <Badge label={inq.status} color={statusColor(inq.status)} />
                    </div>

                    {/* Message */}
                    <div style={{ background: T.ivory, borderRadius: 8, padding: ".8rem 1rem", fontSize: ".83rem", color: T.earth, lineHeight: 1.75, marginBottom: ".9rem", borderLeft: `3px solid ${T.greenL}` }}>
                      {inq.message}
                    </div>
                    {inq.budget && (
                      <div style={{ fontSize: ".75rem", color: T.slate, marginBottom: ".7rem" }}>
                        💰 Client budget indication: <strong>{inq.budget}</strong>
                      </div>
                    )}

                    {/* Sent quote display */}
                    {inq.quote && (
                      <div style={{ background: T.goldPale, border: `1.5px solid ${T.gold}44`, borderRadius: 10, padding: "1rem 1.2rem", marginBottom: ".9rem" }}>
                        <div style={{ fontWeight: 700, color: T.forest, fontSize: ".82rem", marginBottom: ".5rem" }}>📋 Quote Sent ({inq.quote.sentOn})</div>
                        <div style={{ fontSize: "1.3rem", fontWeight: 800, color: T.forest, fontFamily: "'Playfair Display',serif" }}>
                          {inq.quote.currency} {parseInt(inq.quote.amount || 0).toLocaleString()}
                        </div>
                        {inq.quote.scope && <div style={{ fontSize: ".78rem", color: T.earth, marginTop: ".4rem" }}><strong>Scope:</strong> {inq.quote.scope}</div>}
                        {inq.quote.validity && <div style={{ fontSize: ".73rem", color: T.slate, marginTop: ".25rem" }}>Valid for: {inq.quote.validity}</div>}
                        {inq.quote.notes && <div style={{ fontSize: ".73rem", color: T.slate, marginTop: ".25rem", fontStyle: "italic" }}>{inq.quote.notes}</div>}
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                      {inq.status === "New" && (
                        <>
                          <Btn small variant="gold" onClick={() => updateInquiryStatus(inq.id, "In Progress")}>Mark In Review</Btn>
                          <Btn small variant="primary" onClick={() => { setQuoteModal(inq.id); setQuoteForm({ amount: "", currency: "KES", scope: inq.services?.join(", ") || "", validity: "14 days", notes: "" }); }}>Send Quote →</Btn>
                        </>
                      )}
                      {inq.status === "In Progress" && (
                        <>
                          <Btn small variant="primary" onClick={() => { setQuoteModal(inq.id); setQuoteForm({ amount: "", currency: "KES", scope: inq.services?.join(", ") || "", validity: "14 days", notes: "" }); }}>Send Quote →</Btn>
                          {(pros || []).filter(p => p.available).length > 1 && <Btn small variant="outline" onClick={() => { setAssignModal(inq.id); }}>Assign Professional</Btn>}
                        </>
                      )}
                      {inq.status === "Quoted" && (
                        <>
                          <Btn small variant="green" onClick={() => markAccepted(inq.id)}>Mark Accepted ✓</Btn>
                          <Btn small variant="outline" onClick={() => markDeclined(inq.id)} style={{ color: T.red, borderColor: T.red + "44" }}>Mark Declined</Btn>
                          <Btn small variant="outline" onClick={() => { setQuoteModal(inq.id); setQuoteForm(inq.quote || { amount: "", currency: "KES", scope: "", validity: "14 days", notes: "" }); }}>Revise Quote</Btn>
                        </>
                      )}
                      {(inq.status === "Accepted" || inq.status === "Declined") && (
                        <Btn small variant="outline" onClick={() => updateInquiryStatus(inq.id, "Resolved")}>Close / Resolved</Btn>
                      )}
                      {inq.status === "Resolved" && <span style={{ fontSize: ".75rem", color: T.slate, padding: ".35rem 0" }}>✔ Closed</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFESSIONALS TAB */}
        {tab === "professionals" && (
          <div className="fade">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: ".8rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: T.forest }}>All Professionals ({(pros || []).length})</h2>
              <Btn variant="primary" small onClick={() => setPage("professionals")}>Manage Professionals</Btn>
            </div>
            <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: `1.5px solid ${T.border}` }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: T.forest }}>
                    {["Professional", "Field", "Location", "Rate", "Status"].map(h => (
                      <th key={h} style={{ padding: ".75rem 1rem", textAlign: "left", fontSize: ".67rem", letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(244,241,232,0.65)", fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(pros || []).map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${T.border}`, background: i % 2 === 0 ? "#fff" : "rgba(27,47,26,0.015)" }}>
                      <td style={{ padding: ".8rem 1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: T.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".72rem", fontWeight: 800, color: T.forest, flexShrink: 0 }}>{p.init}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: ".85rem", color: T.forest }}>{p.name}</div>
                            <div style={{ fontSize: ".7rem", color: T.slate }}>{p.title}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: ".8rem 1rem", fontSize: ".8rem", color: T.slate }}>{p.field}</td>
                      <td style={{ padding: ".8rem 1rem", fontSize: ".8rem", color: T.slate }}>📍 {p.location}</td>
                      <td style={{ padding: ".8rem 1rem", fontSize: ".8rem", fontWeight: 600, color: T.forest }}>{p.rate}</td>
                      <td style={{ padding: ".8rem 1rem" }}><Badge label={p.available ? "Available" : "Busy"} color={p.available ? T.greenL : T.slate} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBSCRIPTIONS TAB */}
        {tab === "subscriptions" && (
          <div className="fade">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: ".8rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: T.forest }}>Subscriptions ({activeSubs.length})</h2>
              <Btn variant="gold" small onClick={() => setPage("engage")}>View Plans</Btn>
            </div>
            {activeSubs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: T.slate }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>💳</div>
                <p>No subscriptions yet. Share the platform to get your first subscriber!</p>
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: `1.5px solid ${T.border}` }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: T.forest }}>
                      {["Name", "Email", "Phone", "Plan", "County", "Date"].map(h => (
                        <th key={h} style={{ padding: ".75rem 1rem", textAlign: "left", fontSize: ".67rem", letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(244,241,232,0.65)", fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeSubs.map((s, i) => (
                      <tr key={s.id} style={{ borderBottom: `1px solid ${T.border}`, background: i % 2 === 0 ? "#fff" : "rgba(27,47,26,0.015)" }}>
                        <td style={{ padding: ".8rem 1rem", fontWeight: 600, color: T.forest, fontSize: ".85rem" }}>{s.name}</td>
                        <td style={{ padding: ".8rem 1rem", fontSize: ".8rem", color: T.slate }}>{s.email}</td>
                        <td style={{ padding: ".8rem 1rem", fontSize: ".8rem", color: T.slate }}>{s.phone}</td>
                        <td style={{ padding: ".8rem 1rem" }}><Badge label={s.planName} color={T.gold} /></td>
                        <td style={{ padding: ".8rem 1rem", fontSize: ".8rem", color: T.slate }}>{s.county || "—"}</td>
                        <td style={{ padding: ".8rem 1rem", fontSize: ".78rem", color: T.slate }}>{s.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* FUND TAB */}
        {tab === "fund" && (
          <div className="fade">
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: T.forest, marginBottom: "1.2rem" }}>Revolving Input Fund Tracker</h2>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
              <StatCard icon="🌱" value="47" label="Active Beneficiaries" sub="Current cycle" accent={T.greenL} />
              <StatCard icon="💸" value="KES 940K" label="Total Input Value Deployed" sub="Since 2020" accent={T.gold} />
              <StatCard icon="♻️" value="94%" label="Repayment Rate" sub="All cycles" accent={T.green} />
              <StatCard icon="🤝" value="Active" label="Financial Partner" sub="Nakuru & Nyandarua" accent={T.earth} />
            </div>
            <div style={{ background: "#fff", borderRadius: 12, padding: "1.5rem", boxShadow: "0 2px 10px rgba(27,47,26,.06)" }}>
              <h3 style={{ fontSize: ".88rem", fontWeight: 700, color: T.forest, marginBottom: ".8rem" }}>Programme Notes</h3>
              <p style={{ fontSize: ".83rem", color: T.earth, lineHeight: 1.8 }}>
                The revolving input fund was co-designed during the Syngenta Foundation Agriservices programme (2020–2024) in partnership with a trusted SACCO partner. Farmers deposit any amount and access inputs valued at double their deposit — certified Nyota and Angaza beans (KALRO) and Markies potatoes (AGRICO). Repayment after the harvest season replenishes the fund, enabling the next group member to access inputs. The model has since been integrated with our mechanization services programme.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* QUOTE MODAL */}
      {quoteModal && (
        <div className="overlay" onClick={() => setQuoteModal(null)}>
          <div className="modal fade" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.3rem" }}>
              <h3 className="pf" style={{ color: T.forest, fontSize: "1.3rem" }}>📋 Send Quotation</h3>
              <button onClick={() => setQuoteModal(null)} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: T.slate }}>✕</button>
            </div>
            <div style={{ background: T.greenPale, borderRadius: 8, padding: ".75rem 1rem", marginBottom: "1.2rem", fontSize: ".78rem", color: T.earth, lineHeight: 1.7 }}>
              💡 Set your own price based on the scope of work discussed with the client. This quote will be recorded in the dashboard. You communicate the actual figure directly with the client.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: ".8rem", marginBottom: ".9rem", alignItems: "end" }}>
              <div>
                <label className="field-label">Currency</label>
                <select className="field-input" value={quoteForm.currency} onChange={e => setQuoteForm(f => ({...f, currency: e.target.value}))} style={{ minWidth: 80 }}>
                  <option>KES</option><option>USD</option><option>EUR</option>
                </select>
              </div>
              <div>
                <label className="field-label">Amount *</label>
                <input className="field-input" type="number" value={quoteForm.amount} onChange={e => setQuoteForm(f => ({...f, amount: e.target.value}))} placeholder="e.g. 85000" style={{ fontSize: "1.1rem", fontWeight: 700 }} />
              </div>
            </div>
            <div style={{ marginBottom: ".9rem" }}>
              <label className="field-label">Scope of Work</label>
              <textarea className="field-input" rows={2} value={quoteForm.scope} onChange={e => setQuoteForm(f => ({...f, scope: e.target.value}))} placeholder="e.g. Market linkage advisory + 2 field visits over 4 weeks" style={{ resize: "none" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".8rem", marginBottom: ".9rem" }}>
              <div>
                <label className="field-label">Quote Validity</label>
                <select className="field-input" value={quoteForm.validity} onChange={e => setQuoteForm(f => ({...f, validity: e.target.value}))}>
                  <option>7 days</option><option>14 days</option><option>30 days</option><option>Until further notice</option>
                </select>
              </div>
              <div>
                <label className="field-label">Internal Notes</label>
                <input className="field-input" value={quoteForm.notes} onChange={e => setQuoteForm(f => ({...f, notes: e.target.value}))} placeholder="Optional internal note" />
              </div>
            </div>
            <div style={{ display: "flex", gap: ".8rem" }}>
              <Btn variant="outline" onClick={() => setQuoteModal(null)} style={{ flex: 1 }}>Cancel</Btn>
              <Btn variant="primary" onClick={() => sendQuote(quoteModal)} style={{ flex: 2 }}>Record Quote → Mark as Quoted</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN MODAL */}
      {assignModal && (
        <div className="overlay">
          <div className="modal fade" style={{ maxWidth: 420 }}>
            <h3 className="pf" style={{ color: T.forest, marginBottom: "1rem" }}>Assign Inquiry to Professional</h3>
            <p style={{ fontSize: ".82rem", color: T.slate, marginBottom: "1.2rem" }}>Select a professional to handle this client inquiry.</p>
            <label className="field-label">Select Professional</label>
            <select className="field-input" value={assignPro} onChange={e => setAssignPro(e.target.value)} style={{ marginBottom: "1.2rem" }}>
              <option value="">Choose…</option>
              {(pros || []).filter(p => p.available).map(p => (
                <option key={p.id} value={p.name}>{p.name} — {p.field}</option>
              ))}
            </select>
            <div style={{ display: "flex", gap: ".8rem" }}>
              <Btn variant="outline" onClick={() => { setAssignModal(null); setAssignPro(""); }} style={{ flex: 1 }}>Cancel</Btn>
              <Btn variant="primary" onClick={() => assignToPro(assignModal)} disabled={!assignPro} style={{ flex: 2 }}>Assign Professional</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════
// ── Access Denied (shown if someone navigates to /dashboard without auth) ──
function AccessDenied({ onLogin }) {
  return (
    <div className="fade" style={{ paddingTop: 62, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", padding: "80px 5%" }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌾</div>
      <h2 className="pf" style={{ fontSize: "1.8rem", color: T.forest, marginBottom: ".8rem" }}>Page Not Found</h2>
      <p style={{ color: T.slate, maxWidth: 400, lineHeight: 1.8 }}>The page you are looking for does not exist or has been moved.</p>
      <div style={{ marginTop: "1.5rem" }}>
        <Btn variant="primary" onClick={() => window.location.hash = ""}>Go Home</Btn>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [pros, setPros] = useStorage("pros_v4", DEFAULT_PROS);
  const [inquiries, setInquiries] = useStorage("inquiries_v2", []);

  function toast(msg) { setToastMsg(msg); }

  // ── Secret admin route ──────────────────────────────────────
  // Typing ?admin or navigating to page "__admin" triggers login.
  // Nothing in the public nav points here.
  useEffect(() => {
    function checkSecret() {
      const hash = window.location.hash;
      const search = window.location.search;
      if (hash === "#agrivision-admin" || search.includes("agrivision-admin")) {
        setShowLogin(true);
        // clean URL so it doesn't stay visible
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
    checkSecret();
    window.addEventListener("hashchange", checkSecret);
    return () => window.removeEventListener("hashchange", checkSecret);
  }, []);

  // Key combo: Ctrl+Shift+A opens admin login silently
  useEffect(() => {
    function handleKey(e) {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        setShowLogin(true);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <Nav page={page} setPage={setPage} isAdmin={isAdmin} onAdmin={() => setShowLogin(true)} onLogout={() => { setIsAdmin(false); setPage("home"); toast("Logged out"); }} />

      {page === "home"          && <HomePage setPage={setPage} />}
      {page === "portfolio"     && <PortfolioPage setPage={setPage} />}
      {page === "professionals" && <ProfessionalsPage toast={toast} isAdmin={isAdmin} pros={pros} setPros={setPros} />}
      {page === "fund"          && <FundPage setPage={setPage} />}
      {page === "engage"        && <EngagePage inquiries={inquiries} setInquiries={setInquiries} toast={toast} />}
      {page === "dashboard"     && isAdmin && <DashboardPage pros={pros} isAdmin={isAdmin} setPage={setPage} inquiries={inquiries} setInquiries={setInquiries} />}
      {page === "dashboard"     && !isAdmin && <AccessDenied onLogin={() => setShowLogin(true)} />}

      {showLogin && (
        <AdminLogin
          onSuccess={() => {
            setIsAdmin(true);
            setShowLogin(false);
            setPage("dashboard");
            toast("Welcome back, Jackson — Admin portal active");
          }}
          onClose={() => setShowLogin(false)}
        />
      )}

      <ChatWidget inquiries={inquiries} setInquiries={setInquiries} toast={toast} />
      {toastMsg && <Toast msg={toastMsg} onDone={() => setToastMsg("")} />}
    </>
  );
}
