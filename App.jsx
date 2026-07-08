import React, { useState, useMemo, useEffect } from "react";
import { Plus, Flame, ChefHat, User, Home, Trash2, Check, ArrowLeft, Clock, ShoppingBag, AlertTriangle, Sparkles, LogOut } from "lucide-react";

// ---------- Design tokens ----------
// Meesho-inspired design tokens: magenta primary, pink accent, blush surfaces
const T = {
  bg: "#FBF4F9", ink: "#3B1E4E", sub: "#8A6E99",
  green: "#9F2089", greenSoft: "#F8E3F3",
  turmeric: "#F43397", turmericSoft: "#FDE4F0",
  over: "#D93025", overSoft: "#FBE3E1",
  card: "#FFFFFF", line: "#F0D9EA",
};

// ---------- Pantry model: quantities measured in servings ----------
const PANTRY_ITEMS = [
  { id: "atta", name: "Atta", e: "🌾", unit: "rotis worth", qty: 14, cap: 30 },
  { id: "rice", name: "Rice", e: "🍚", unit: "katoris worth", qty: 10, cap: 20 },
  { id: "dal", name: "Dal (toor/moong)", e: "🟡", unit: "katoris worth", qty: 8, cap: 15 },
  { id: "rajma", name: "Rajma", e: "🫘", unit: "katoris worth", qty: 4, cap: 8 },
  { id: "chole", name: "Chole (chana)", e: "🟤", unit: "katoris worth", qty: 4, cap: 8 },
  { id: "paneer", name: "Paneer", e: "🧀", unit: "servings", qty: 2, cap: 6 },
  { id: "eggs", name: "Eggs", e: "🥚", unit: "pieces", qty: 6, cap: 12 },
  { id: "chicken", name: "Chicken", e: "🍗", unit: "servings", qty: 3, cap: 6 },
  { id: "oats", name: "Oats", e: "🌾", unit: "bowls worth", qty: 5, cap: 10 },
  { id: "protein", name: "Protein powder", e: "🥤", unit: "scoops", qty: 12, cap: 30 },
  { id: "pasta", name: "Pasta", e: "🍝", unit: "plates worth", qty: 2, cap: 4 },
  { id: "potato", name: "Potatoes", e: "🥔", unit: "servings", qty: 6, cap: 12 },
  { id: "veggies", name: "Fresh vegetables", e: "🥬", unit: "servings", qty: 4, cap: 10 },
  { id: "milk", name: "Milk", e: "🥛", unit: "glasses", qty: 4, cap: 8 },
  { id: "curd", name: "Curd", e: "🥛", unit: "katoris", qty: 3, cap: 6 },
  { id: "dosabatter", name: "Dosa/idli batter", e: "🥞", unit: "servings", qty: 0, cap: 8 },
];

// Simulated Zepto/Instamart order (v2 would parse real order emails/SMS)
const DEMO_SOURCES = {
  zepto: { label: "Zepto", source: "Zepto · order #ZP48291", items: [
    { id: "eggs", add: 12 }, { id: "milk", add: 6 }, { id: "paneer", add: 4 },
    { id: "veggies", add: 6 }, { id: "dosabatter", add: 8 }, { id: "atta", add: 20 },
  ]},
  blinkit: { label: "Blinkit", source: "Blinkit · order #BL77102", items: [
    { id: "chicken", add: 4 }, { id: "rice", add: 10 }, { id: "oats", add: 5 },
    { id: "protein", add: 15 }, { id: "pasta", add: 2 }, { id: "potato", add: 8 },
  ]},
  bill: { label: "your bill (demo OCR)", source: "Bill photo · demo OCR", items: [
    { id: "dal", add: 8 }, { id: "rajma", add: 4 }, { id: "chole", add: 4 },
    { id: "curd", add: 4 }, { id: "milk", add: 4 },
  ]},
};

// ---------- Food database: kcal/macros per serving, cook time (min), pantry consumed per serving ----------
const BASE_FOODS = [
  { id: "dal", name: "Dal", unit: "katori", kcal: 150, p: 9, c: 20, f: 4, time: 30, pantry: ["dal"], e: "🥣" },
  { id: "roti", name: "Roti / Chapati", unit: "piece", kcal: 100, p: 3, c: 18, f: 2.5, time: 15, pantry: ["atta"], e: "🫓" },
  { id: "sabzi", name: "Mixed veg sabzi", unit: "katori", kcal: 120, p: 3, c: 12, f: 7, time: 25, pantry: ["veggies"], e: "🥬" },
  { id: "alooparatha", name: "Aloo paratha", unit: "piece", kcal: 290, p: 6, c: 40, f: 12, time: 25, pantry: ["atta", "potato"], e: "🥔" },
  { id: "paneerparatha", name: "Paneer paratha", unit: "piece", kcal: 320, p: 11, c: 36, f: 15, time: 25, pantry: ["atta", "paneer"], e: "🧀" },
  { id: "dosa", name: "Plain dosa", unit: "piece", kcal: 170, p: 4, c: 28, f: 5, time: 10, pantry: ["dosabatter"], e: "🥞" },
  { id: "masaladosa", name: "Masala dosa", unit: "piece", kcal: 260, p: 5, c: 38, f: 9, time: 20, pantry: ["dosabatter", "potato"], e: "🥞" },
  { id: "idli", name: "Idli", unit: "piece", kcal: 60, p: 2, c: 12, f: 0.5, time: 15, pantry: ["dosabatter"], e: "⚪" },
  { id: "sambar", name: "Sambar", unit: "katori", kcal: 130, p: 6, c: 18, f: 4, time: 30, pantry: ["dal", "veggies"], e: "🍲" },
  { id: "pasta", name: "Pasta (veg)", unit: "plate", kcal: 400, p: 12, c: 60, f: 12, time: 25, pantry: ["pasta", "veggies"], e: "🍝" },
  { id: "oats", name: "Oats with milk", unit: "bowl", kcal: 250, p: 9, c: 40, f: 6, time: 10, pantry: ["oats", "milk"], e: "🥣" },
  { id: "shake", name: "Protein shake", unit: "scoop", kcal: 130, p: 25, c: 3, f: 1.5, time: 2, pantry: ["protein"], e: "🥤" },
  { id: "chickencurry", name: "Chicken curry", unit: "katori", kcal: 220, p: 22, c: 6, f: 12, time: 40, pantry: ["chicken"], e: "🍗" },
  { id: "biryani", name: "Chicken biryani", unit: "plate", kcal: 600, p: 25, c: 75, f: 22, time: 60, pantry: ["chicken", "rice"], e: "🍛" },
  { id: "puri", name: "Puri", unit: "piece", kcal: 110, p: 2, c: 12, f: 6, time: 30, pantry: ["atta"], e: "🫓" },
  { id: "chole", name: "Chole", unit: "katori", kcal: 210, p: 10, c: 30, f: 6, time: 40, pantry: ["chole"], e: "🍛" },
  { id: "rajma", name: "Rajma", unit: "katori", kcal: 190, p: 9, c: 28, f: 4, time: 45, pantry: ["rajma"], e: "🫘" },
  { id: "rice", name: "Steamed rice", unit: "katori", kcal: 130, p: 3, c: 28, f: 0.5, time: 20, pantry: ["rice"], e: "🍚" },
  { id: "egg", name: "Boiled egg", unit: "piece", kcal: 78, p: 6, c: 0.6, f: 5, time: 10, pantry: ["eggs"], e: "🥚" },
  { id: "omelette", name: "Omelette (2 eggs)", unit: "serving", kcal: 190, p: 13, c: 1, f: 15, time: 8, pantry: ["eggs", "eggs"], e: "🍳" },
  { id: "curd", name: "Curd", unit: "katori", kcal: 60, p: 3, c: 4, f: 3, time: 0, pantry: ["curd"], e: "🥛" },
  { id: "milk", name: "Milk", unit: "glass", kcal: 150, p: 8, c: 12, f: 8, time: 1, pantry: ["milk"], e: "🥛" },
  { id: "banana", name: "Banana", unit: "piece", kcal: 105, p: 1.3, c: 27, f: 0.4, time: 0, pantry: [], e: "🍌" },
  { id: "chai", name: "Chai (milk + sugar)", unit: "cup", kcal: 60, p: 2, c: 8, f: 2, time: 5, pantry: ["milk"], e: "🍵" },
];

const MEALS = ["Breakfast", "Lunch", "Snacks", "Dinner"];
const mealByHour = () => {
  const h = new Date().getHours();
  if (h < 11) return "Breakfast";
  if (h < 16) return "Lunch";
  if (h < 19) return "Snacks";
  return "Dinner";
};

const calcTarget = (p) => {
  const { sex, age, weight, height, activity } = p;
  if (!age || !weight || !height) return null;
  const bmr = 10 * weight + 6.25 * height - 5 * age + (sex === "male" ? 5 : -161);
  return Math.round((bmr * activity) / 50) * 50;
};

// How many servings of a food the pantry can currently make
const canMake = (food, pantry) => {
  if (food.pantry.length === 0) return 99;
  const need = {};
  food.pantry.forEach((k) => (need[k] = (need[k] || 0) + 1));
  return Math.min(...Object.keys(need).map((k) => Math.floor((pantry[k]?.qty || 0) / need[k])));
};

// ---------- Calorie ring ----------
function ThaliRing({ consumed, target }) {
  const size = 210, stroke = 15, r = (size - stroke) / 2, C = 2 * Math.PI * r;
  const pct = Math.min(consumed / target, 1);
  const remaining = target - consumed;
  const color = consumed > target ? T.over : pct > 0.85 ? T.turmeric : T.green;
  const ticks = Array.from({ length: 24 }, (_, i) => (i * 360) / 24);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {ticks.map((deg) => (
          <line key={deg} x1={size / 2} y1={stroke + 5} x2={size / 2} y2={stroke + 11}
            stroke={T.line} strokeWidth="2" transform={`rotate(${deg} ${size / 2} ${size / 2})`} />
        ))}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.greenSoft} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${C * pct} ${C}`} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dasharray 600ms ease, stroke 300ms ease" }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span style={{ fontFamily: "Poppins, system-ui, sans-serif", fontSize: 42, fontWeight: 600, color: T.ink, lineHeight: 1 }}>
          {Math.abs(Math.round(remaining))}
        </span>
        <span className="text-xs mt-1" style={{ color: remaining < 0 ? T.over : T.sub }}>
          {remaining < 0 ? "kcal over" : "kcal left"}
        </span>
        <span className="text-xs mt-1" style={{ color: T.sub }}>{Math.round(consumed)} / {target}</span>
      </div>
    </div>
  );
}

function MacroBar({ label, val, goal, color }) {
  const pct = Math.min((val / goal) * 100, 100);
  return (
    <div className="flex-1">
      <div className="flex justify-between text-xs mb-1" style={{ color: T.sub }}>
        <span>{label}</span><span>{Math.round(val)}/{goal}g</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: T.greenSoft }}>
        <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: color, transition: "width 500ms ease" }} />
      </div>
    </div>
  );
}

// ---------- User accounts (passwordless, demo-grade) ----------
// OPTIONAL: paste your Google Apps Script web app URL below to log signups
// (name, email, timestamp) to a Google Sheet. Leave "" to skip.
const SHEET_WEBHOOK_URL = "";

const todayKey = () => new Date().toISOString().slice(0, 10);
const userStorageKey = (name) => "pk-user-" + name.trim().toLowerCase();

const loadUserData = (name) => {
  try {
    const raw = localStorage.getItem(userStorageKey(name));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const loadKnownUsers = () => {
  try { return JSON.parse(localStorage.getItem("pk-users") || "[]"); }
  catch { return []; }
};

const logSignupToSheet = (name, email) => {
  if (!SHEET_WEBHOOK_URL) return;
  try {
    fetch(SHEET_WEBHOOK_URL, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ name, email: email || "", ts: new Date().toISOString() }),
    });
  } catch { /* non-blocking */ }
};

function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const known = loadKnownUsers();
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4" style={{ background: T.bg }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap');`}</style>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: T.card, border: `1px solid ${T.line}` }}>
        <h1 className="text-center" style={{ fontFamily: "Poppins, system-ui, sans-serif", fontSize: 30, fontWeight: 600, color: T.green }}>PantryKal</h1>
        <p className="text-center text-xs mt-1 mb-5" style={{ color: T.sub }}>Eat smart from what you have</p>
        {known.length > 0 && (
          <div className="mb-4">
            <p className="text-xs mb-2" style={{ color: T.sub }}>Welcome back — tap your name:</p>
            <div className="flex flex-wrap gap-2">
              {known.map((u) => (
                <button key={u} onClick={() => onLogin(u, "")} className="text-sm px-3 py-1.5 rounded-full"
                  style={{ background: T.greenSoft, color: T.green, border: `1px solid ${T.line}` }}>
                  {u}
                </button>
              ))}
            </div>
            <p className="text-xs my-3 text-center" style={{ color: T.sub }}>— or —</p>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
            className="rounded-lg px-3 py-2.5 text-sm w-full" style={{ border: `1px solid ${T.line}`, background: T.bg, color: T.ink }} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" type="email"
            className="rounded-lg px-3 py-2.5 text-sm w-full" style={{ border: `1px solid ${T.line}`, background: T.bg, color: T.ink }} />
          <button onClick={() => name.trim() && onLogin(name.trim(), email.trim())}
            className="rounded-lg py-2.5 text-sm font-semibold mt-1" style={{ background: T.green, color: "#fff", opacity: name.trim() ? 1 : 0.5 }}>
            Continue
          </button>
        </div>
        <p className="text-xs text-center mt-4" style={{ color: T.sub }}>
          No password needed. Your food log and pantry save on this device under your name.
        </p>
      </div>
    </div>
  );
}

function StepBanner({ step, total, title, sub }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: T.greenSoft, border: `1px solid ${T.line}` }}>
      <p className="text-xs font-semibold tracking-wide" style={{ color: T.green }}>STEP {step} OF {total}</p>
      <p className="text-sm font-semibold mt-1" style={{ color: T.ink }}>{title}</p>
      <p className="text-xs mt-0.5" style={{ color: T.sub }}>{sub}</p>
    </div>
  );
}

// ---------- App ----------
export default function PantryKal() {
  const [user, setUser] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [onboarded, setOnboarded] = useState(false);
  const [remindersOn, setRemindersOn] = useState(false);
  const [screen, setScreen] = useState("today");
  const [log, setLog] = useState([]);
  const [foods, setFoods] = useState(BASE_FOODS);
  const [pantry, setPantry] = useState(() =>
    Object.fromEntries(PANTRY_ITEMS.map((i) => [i.id, { ...i }]))
  );
  const [profile, setProfile] = useState({ mode: "manual", target: 3000, sex: "male", age: "", weight: "", height: "", activity: 1.55 });
  const [addMeal, setAddMeal] = useState(mealByHour());
  const [qty, setQty] = useState({});
  const [custom, setCustom] = useState({ name: "", kcal: "", p: "", time: "", save: true });
  const [importDone, setImportDone] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const notifyUser = (title, body) => {
    try {
      if (remindersOn && typeof Notification !== "undefined" && Notification.permission === "granted") new Notification(title, { body });
    } catch {}
  };

  const toggleReminders = async () => {
    if (remindersOn) { setRemindersOn(false); showToast("Reminders off"); return; }
    try {
      if (typeof Notification === "undefined") { showToast("Notifications not supported on this browser"); return; }
      const perm = await Notification.requestPermission();
      if (perm === "granted") { setRemindersOn(true); showToast("Reminders on — we'll ping you on shortages"); }
      else showToast("Permission denied — enable notifications in browser settings");
    } catch { showToast("Couldn't enable notifications"); }
  };

  const finishOnboarding = () => {
    setOnboarded(true);
    setScreen("today");
    showToast(`You're all set, ${user}! Log your first meal 🍽️`);
  };

  // ---- Login / logout / persistence ----
  const handleLogin = (name, email) => {
    const saved = loadUserData(name);
    if (saved) {
      if (saved.profile) setProfile(saved.profile);
      if (saved.pantry) setPantry(saved.pantry);
      setFoods([...(saved.customFoods || []), ...BASE_FOODS]);
      setLog(saved.date === todayKey() ? (saved.log || []) : []);
      setImportDone(saved.importDone || false);
      setRemindersOn(!!saved.remindersOn);
      setUserEmail(saved.email || email || "");
    } else {
      // brand-new user: register + optionally log to Google Sheet
      const known = loadKnownUsers();
      if (!known.includes(name)) {
        try { localStorage.setItem("pk-users", JSON.stringify([...known, name])); } catch {}
      }
      setUserEmail(email || "");
      logSignupToSheet(name, email);
    }
    try { localStorage.setItem("pk-current", name); } catch {}
    setUser(name);
    const done = !!(saved && saved.onboarded !== false);
    setOnboarded(done);
    setScreen(done ? "today" : "ob-profile");
  };

  const handleLogout = () => {
    try { localStorage.removeItem("pk-current"); } catch {}
    setUser(null);
    setLog([]);
    setPantry(Object.fromEntries(PANTRY_ITEMS.map((i) => [i.id, { ...i }])));
    setFoods(BASE_FOODS);
    setProfile({ mode: "manual", target: 3000, sex: "male", age: "", weight: "", height: "", activity: 1.55 });
    setImportDone(false);
    setOnboarded(false);
    setRemindersOn(false);
  };

  // Auto-login if this device already has a session
  useEffect(() => {
    try {
      const current = localStorage.getItem("pk-current");
      if (current) handleLogin(current, "");
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save everything whenever it changes
  useEffect(() => {
    if (!user) return;
    try {
      localStorage.setItem(userStorageKey(user), JSON.stringify({
        profile, pantry, log,
        customFoods: foods.filter((f) => f.custom),
        importDone, onboarded, remindersOn, email: userEmail, date: todayKey(),
      }));
    } catch {}
  }, [user, profile, pantry, log, foods, importDone, onboarded, remindersOn, userEmail]);

  const target = profile.mode === "auto" ? (calcTarget(profile) || 3000) : Number(profile.target) || 3000;
  const totals = useMemo(() => log.reduce((a, x) => ({
    kcal: a.kcal + x.kcal * x.qty, p: a.p + x.p * x.qty, c: a.c + x.c * x.qty, f: a.f + x.f * x.qty,
  }), { kcal: 0, p: 0, c: 0, f: 0 }), [log]);

  const proteinGoal = profile.weight ? Math.round(profile.weight * 1.6) : Math.round(target * 0.03);
  const carbGoal = Math.round((target * 0.5) / 4);
  const fatGoal = Math.round((target * 0.25) / 9);
  const remaining = target - totals.kcal;

  const lowItems = Object.values(pantry).filter((i) => i.qty > 0 && i.qty <= Math.max(2, i.cap * 0.2));
  const outItems = Object.values(pantry).filter((i) => i.qty <= 0);

  const suggestions = useMemo(() => {
    if (remaining <= 0) return [];
    return foods
      .filter((f) => f.kcal <= remaining && canMake(f, pantry) >= 1)
      .sort((a, b) => b.p / b.kcal - a.p / a.kcal)
      .slice(0, 3);
  }, [remaining, pantry, foods]);

  const guidance = () => {
    const pGap = proteinGoal - totals.p;
    if (remaining < 0) return { tone: "over", msg: `You're ${Math.abs(Math.round(remaining))} kcal over target. Keep the rest of today light.` };
    if (log.length === 0) return { tone: "ok", msg: `Fresh day. ${target} kcal budget, ~${proteinGoal}g protein to hit.` };
    if (pGap > 25 && remaining > 200) return { tone: "nudge", msg: `${Math.round(remaining)} kcal left but ${Math.round(pGap)}g short on protein — pick something protein-heavy.` };
    if (remaining < target * 0.15) return { tone: "nudge", msg: `Only ${Math.round(remaining)} kcal left — go light from here.` };
    return { tone: "ok", msg: `On track: ${Math.round(remaining)} kcal left, protein ${Math.round(totals.p)}g of ${proteinGoal}g.` };
  };

  // Log a food AND deduct its ingredients from the pantry
  const addFood = (f, n = null) => {
    const count = n ?? (qty[f.id] || 1);
    setLog((l) => [...l, { uid: Date.now() + Math.random(), name: f.name, e: f.e, kcal: f.kcal, p: f.p, c: f.c, f: f.f, qty: count, meal: addMeal, time: f.time }]);
    if (f.pantry && f.pantry.length) {
      setPantry((p) => {
        const next = { ...p };
        f.pantry.forEach((k) => {
          if (next[k]) next[k] = { ...next[k], qty: Math.max(0, next[k].qty - count) };
        });
        const nowLow = f.pantry.filter((k) => next[k] && next[k].qty > 0 && next[k].qty <= Math.max(2, next[k].cap * 0.2));
        const nowOut = f.pantry.filter((k) => next[k] && next[k].qty <= 0);
        if (nowOut.length) {
          const m = `${nowOut.map((k) => next[k].name).join(", ")} finished — added to shopping list`;
          showToast("⚠️ " + m); notifyUser("PantryKal reminder", m);
        } else if (nowLow.length) {
          const m = `Running low: ${nowLow.map((k) => next[k].name).join(", ")}`;
          showToast(m); notifyUser("PantryKal reminder", m);
        }
        return next;
      });
    }
    setQty((q) => ({ ...q, [f.id]: 1 }));
    setScreen("today");
  };

  // Custom dish: log it, and optionally consolidate into the food database
  const addCustom = () => {
    if (!custom.name || !custom.kcal) return;
    const dish = {
      id: "custom-" + Date.now(), name: custom.name, unit: "serving",
      kcal: +custom.kcal, p: +custom.p || 0, c: 0, f: 0,
      time: +custom.time || 15, pantry: [], e: "✨", custom: true,
    };
    setLog((l) => [...l, { uid: Date.now(), ...dish, qty: 1, meal: addMeal }]);
    if (custom.save) {
      setFoods((fs) => [dish, ...fs]);
      showToast(`"${dish.name}" saved to My dishes — it'll appear in your food list and suggestions from now on`);
    }
    setCustom({ name: "", kcal: "", p: "", time: "", save: true });
    setScreen("today");
  };

  const importOrder = (key) => {
    const srcOrder = DEMO_SOURCES[key];
    if (!srcOrder) return;
    setPantry((p) => {
      const next = { ...p };
      srcOrder.items.forEach(({ id, add }) => {
        if (next[id]) next[id] = { ...next[id], qty: next[id].qty + add, cap: Math.max(next[id].cap, next[id].qty + add) };
      });
      return next;
    });
    setImportDone(key);
    showToast(`Added ${srcOrder.items.length} items from ${srcOrder.label}`);
  };

  const handleBillUpload = (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    showToast("Reading your bill…");
    setTimeout(() => importOrder("bill"), 1200);
    e.target.value = "";
  };

  const g = guidance();
  const toneColors = { over: [T.over, T.overSoft], nudge: [T.turmeric, T.turmericSoft], ok: [T.green, T.greenSoft] };

  const Card = ({ children, className = "", style = {} }) => (
    <div className={`rounded-2xl p-4 ${className}`} style={{ background: T.card, border: `1px solid ${T.line}`, ...style }}>{children}</div>
  );

  // ---------- Today ----------
  const Today = () => (
    <div className="flex flex-col gap-4 items-stretch">
      <div className="flex flex-col items-center pt-1">
        <ThaliRing consumed={totals.kcal} target={target} />
        <div className="flex gap-4 w-full mt-2">
          <MacroBar label="Protein" val={totals.p} goal={proteinGoal} color={T.green} />
          <MacroBar label="Carbs" val={totals.c} goal={carbGoal} color={T.turmeric} />
          <MacroBar label="Fat" val={totals.f} goal={fatGoal} color={T.sub} />
        </div>
      </div>

      <Card>
        <div className="flex items-start gap-2">
          <Flame size={18} style={{ color: toneColors[g.tone][0], marginTop: 2, flexShrink: 0 }} />
          <p className="text-sm" style={{ color: T.ink }}>{g.msg}</p>
        </div>
        {suggestions.length > 0 && (
          <div className="mt-3 pt-3" style={{ borderTop: `1px dashed ${T.line}` }}>
            <p className="text-xs mb-2" style={{ color: T.sub }}>Cookable right now from your pantry:</p>
            <div className="flex flex-col gap-2">
              {suggestions.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: T.bg }}>
                  <div>
                    <p className="text-sm" style={{ color: T.ink }}>{s.e} {s.name}</p>
                    <p className="text-xs flex items-center gap-1" style={{ color: T.sub }}>
                      <Clock size={11} /> {s.time} min · {s.kcal} kcal · {s.p}g protein
                      {canMake(s, pantry) < 3 && canMake(s, pantry) < 90 && <span style={{ color: T.turmeric }}> · {canMake(s, pantry)} left</span>}
                    </p>
                  </div>
                  <button onClick={() => { setAddMeal(mealByHour()); addFood(s, 1); }}
                    className="text-xs px-3 py-1.5 rounded-full" style={{ background: T.green, color: "#fff" }}>
                    I ate this
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => { setAddMeal(mealByHour()); setScreen("add"); }}
              className="text-xs mt-2 w-full py-2 rounded-lg" style={{ color: T.green, border: `1px dashed ${T.green}` }}>
              Ate something else? Add it manually →
            </button>
          </div>
        )}
      </Card>

      {(lowItems.length > 0 || outItems.length > 0) && (
        <Card style={{ borderColor: T.turmeric, background: T.turmericSoft }}>
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} style={{ color: T.turmeric, marginTop: 2, flexShrink: 0 }} />
            <p className="text-sm" style={{ color: T.ink }}>
              {outItems.length > 0 && <>Out of: <b>{outItems.map((i) => i.name).join(", ")}</b>. </>}
              {lowItems.length > 0 && <>Running low: <b>{lowItems.map((i) => i.name).join(", ")}</b>. </>}
              <button onClick={() => setScreen("pantry")} className="underline" style={{ color: T.green }}>See shopping list</button>
            </p>
          </div>
        </Card>
      )}

      {MEALS.map((m) => {
        const items = log.filter((x) => x.meal === m);
        if (!items.length) return null;
        const mk = items.reduce((a, x) => a + x.kcal * x.qty, 0);
        return (
          <Card key={m}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-semibold" style={{ color: T.ink }}>{m}</span>
              <span className="text-xs" style={{ color: T.sub }}>{Math.round(mk)} kcal</span>
            </div>
            {items.map((x) => (
              <div key={x.uid} className="flex items-center justify-between py-1.5" style={{ borderTop: `1px solid ${T.line}` }}>
                <span className="text-sm" style={{ color: T.ink }}>{x.e} {x.name} <span style={{ color: T.sub }}>× {x.qty}</span></span>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: T.sub }}>{Math.round(x.kcal * x.qty)} kcal</span>
                  <button onClick={() => setLog((l) => l.filter((y) => y.uid !== x.uid))} aria-label="Remove">
                    <Trash2 size={14} style={{ color: T.sub }} />
                  </button>
                </div>
              </div>
            ))}
          </Card>
        );
      })}
      {log.length === 0 && (
        <p className="text-center text-sm py-4" style={{ color: T.sub }}>Nothing logged yet. Tap a suggestion above or + to add.</p>
      )}
    </div>
  );

  // ---------- Add ----------
  const Add = () => (
    <div className="flex flex-col gap-4">
      <button onClick={() => setScreen("today")} className="flex items-center gap-1 text-sm self-start" style={{ color: T.sub }}>
        <ArrowLeft size={16} /> Back
      </button>
      <div className="flex gap-2">
        {MEALS.map((m) => (
          <button key={m} onClick={() => setAddMeal(m)} className="text-xs px-2 py-1.5 rounded-full flex-1"
            style={addMeal === m ? { background: T.green, color: "#fff" } : { background: T.card, color: T.sub, border: `1px solid ${T.line}` }}>
            {m}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {foods.map((f) => {
          const makeable = canMake(f, pantry);
          return (
            <div key={f.id} className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ background: T.card, border: `1px solid ${f.custom ? T.turmeric : T.line}` }}>
              <div>
                <p className="text-sm" style={{ color: T.ink }}>
                  {f.e} {f.name}
                  {f.custom && <span className="text-xs ml-1" style={{ color: T.turmeric }}>my dish</span>}
                </p>
                <p className="text-xs flex items-center gap-1" style={{ color: T.sub }}>
                  {f.kcal} kcal · {f.p}g P · <Clock size={10} /> {f.time}m
                  {f.pantry.length > 0 && makeable === 0 && <span style={{ color: T.over }}> · not in pantry</span>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setQty((q) => ({ ...q, [f.id]: Math.max(1, (q[f.id] || 1) - 1) }))}
                  className="w-7 h-7 rounded-full text-sm" style={{ background: T.greenSoft, color: T.green }}>−</button>
                <span className="text-sm w-4 text-center" style={{ color: T.ink }}>{qty[f.id] || 1}</span>
                <button onClick={() => setQty((q) => ({ ...q, [f.id]: (q[f.id] || 1) + 1 }))}
                  className="w-7 h-7 rounded-full text-sm" style={{ background: T.greenSoft, color: T.green }}>+</button>
                <button onClick={() => addFood(f)} className="ml-1 px-3 py-1.5 rounded-full text-xs" style={{ background: T.green, color: "#fff" }}>Add</button>
              </div>
            </div>
          );
        })}
      </div>
      <Card>
        <p className="text-sm font-semibold mb-2 flex items-center gap-1" style={{ color: T.ink }}>
          <Sparkles size={14} style={{ color: T.turmeric }} /> New dish (not in the list?)
        </p>
        <div className="flex flex-col gap-2">
          <input value={custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value })} placeholder="Name (e.g. Poha)"
            className="rounded-lg px-3 py-2 text-sm w-full" style={{ border: `1px solid ${T.line}`, background: T.bg, color: T.ink }} />
          <div className="flex gap-2">
            <input value={custom.kcal} onChange={(e) => setCustom({ ...custom, kcal: e.target.value })} placeholder="kcal" type="number"
              className="rounded-lg px-3 py-2 text-sm w-full" style={{ border: `1px solid ${T.line}`, background: T.bg, color: T.ink }} />
            <input value={custom.p} onChange={(e) => setCustom({ ...custom, p: e.target.value })} placeholder="protein g" type="number"
              className="rounded-lg px-3 py-2 text-sm w-full" style={{ border: `1px solid ${T.line}`, background: T.bg, color: T.ink }} />
            <input value={custom.time} onChange={(e) => setCustom({ ...custom, time: e.target.value })} placeholder="cook min" type="number"
              className="rounded-lg px-3 py-2 text-sm w-full" style={{ border: `1px solid ${T.line}`, background: T.bg, color: T.ink }} />
          </div>
          <button onClick={() => setCustom({ ...custom, save: !custom.save })} className="flex items-center gap-2 text-xs py-1" style={{ color: T.sub }}>
            <span className="w-4 h-4 rounded flex items-center justify-center" style={{ background: custom.save ? T.green : T.bg, border: `1px solid ${T.line}` }}>
              {custom.save && <Check size={11} color="#fff" />}
            </span>
            Save to My dishes (appears in food list & suggestions from now on)
          </button>
          <button onClick={addCustom} className="rounded-lg py-2 text-sm" style={{ background: T.turmeric, color: "#fff" }}>Log this dish</button>
        </div>
      </Card>
    </div>
  );

  // ---------- Pantry ----------
  const Pantry = () => (
    <div className="flex flex-col gap-4">
      <Card style={!importDone ? { borderColor: T.green } : {}}>
        <div className="flex items-start gap-2">
          <ShoppingBag size={18} style={{ color: T.green, marginTop: 2, flexShrink: 0 }} />
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: T.ink }}>Fill your pantry, your way</p>
            <p className="text-xs mt-0.5" style={{ color: T.sub }}>
              {importDone && DEMO_SOURCES[importDone]
                ? `Last import: ${DEMO_SOURCES[importDone].source}`
                : "Import a grocery order, snap your bill, or adjust the list below by hand."}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <button onClick={() => importOrder("zepto")} className="text-xs px-3 py-1.5 rounded-full" style={{ background: T.green, color: "#fff" }}>Import Zepto order</button>
              <button onClick={() => importOrder("blinkit")} className="text-xs px-3 py-1.5 rounded-full" style={{ background: T.turmeric, color: "#fff" }}>Import Blinkit order</button>
              <label className="text-xs px-3 py-1.5 rounded-full cursor-pointer" style={{ border: `1px solid ${T.green}`, color: T.green }}>
                Upload bill photo
                <input type="file" accept="image/*" className="hidden" onChange={handleBillUpload} />
              </label>
            </div>
            <p className="text-xs mt-2" style={{ color: T.sub }}>(Demo imports — production parses real order emails & bill OCR)</p>
          </div>
        </div>
      </Card>

      {(outItems.length > 0 || lowItems.length > 0) && (
        <Card style={{ background: T.turmericSoft, borderColor: T.turmeric }}>
          <p className="text-xs font-semibold mb-1" style={{ color: T.sub }}>SHOPPING LIST · auto-built from your consumption</p>
          {[...outItems, ...lowItems].map((i) => (
            <p key={i.id} className="text-sm py-0.5" style={{ color: T.ink }}>
              {i.e} {i.name} — {i.qty <= 0 ? <b style={{ color: T.over }}>finished</b> : <span style={{ color: T.turmeric }}>{i.qty} {i.unit} left</span>}
            </p>
          ))}
        </Card>
      )}

      <div className="flex flex-col gap-2">
        {Object.values(pantry).map((i) => {
          const low = i.qty > 0 && i.qty <= Math.max(2, i.cap * 0.2);
          const out = i.qty <= 0;
          const pct = Math.min((i.qty / i.cap) * 100, 100);
          return (
            <div key={i.id} className="rounded-xl px-3 py-2.5" style={{ background: T.card, border: `1px solid ${out ? T.over : low ? T.turmeric : T.line}` }}>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: T.ink }}>{i.e} {i.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPantry((p) => ({ ...p, [i.id]: { ...i, qty: Math.max(0, i.qty - 1) } }))}
                    className="w-6 h-6 rounded-full text-xs" style={{ background: T.greenSoft, color: T.green }}>−</button>
                  <span className="text-xs w-14 text-center" style={{ color: out ? T.over : low ? T.turmeric : T.sub }}>
                    {i.qty} {i.unit.split(" ")[0]}
                  </span>
                  <button onClick={() => setPantry((p) => ({ ...p, [i.id]: { ...i, qty: i.qty + 1, cap: Math.max(i.cap, i.qty + 1) } }))}
                    className="w-6 h-6 rounded-full text-xs" style={{ background: T.greenSoft, color: T.green }}>+</button>
                </div>
              </div>
              <div className="h-1.5 rounded-full mt-2" style={{ background: T.bg }}>
                <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: out ? T.over : low ? T.turmeric : T.green, transition: "width 400ms ease" }} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-center px-4" style={{ color: T.sub }}>
        Quantities are in servings. Logging a meal automatically deducts its ingredients here.
      </p>
    </div>
  );

  // ---------- Profile ----------
  const Profile = () => (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="text-sm font-semibold mb-3" style={{ color: T.ink }}>Daily calorie target</p>
        <div className="flex gap-2 mb-3">
          {["manual", "auto"].map((m) => (
            <button key={m} onClick={() => setProfile({ ...profile, mode: m })} className="flex-1 text-xs py-2 rounded-lg"
              style={profile.mode === m ? { background: T.green, color: "#fff" } : { background: T.bg, color: T.sub, border: `1px solid ${T.line}` }}>
              {m === "manual" ? "Set manually" : "Calculate for me"}
            </button>
          ))}
        </div>
        {profile.mode === "manual" ? (
          <input type="number" value={profile.target} onChange={(e) => setProfile({ ...profile, target: e.target.value })}
            className="rounded-lg px-3 py-2 text-sm w-full" style={{ border: `1px solid ${T.line}`, background: T.bg, color: T.ink }} />
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              {["male", "female"].map((s) => (
                <button key={s} onClick={() => setProfile({ ...profile, sex: s })} className="flex-1 text-xs py-2 rounded-lg capitalize"
                  style={profile.sex === s ? { background: T.greenSoft, color: T.green, border: `1px solid ${T.green}` } : { background: T.bg, color: T.sub, border: `1px solid ${T.line}` }}>
                  {s}
                </button>
              ))}
            </div>
            {[["age", "Age (years)"], ["weight", "Weight (kg)"], ["height", "Height (cm)"]].map(([k, ph]) => (
              <input key={k} type="number" placeholder={ph} value={profile[k]}
                onChange={(e) => setProfile({ ...profile, [k]: +e.target.value || "" })}
                className="rounded-lg px-3 py-2 text-sm w-full" style={{ border: `1px solid ${T.line}`, background: T.bg, color: T.ink }} />
            ))}
            <select value={profile.activity} onChange={(e) => setProfile({ ...profile, activity: +e.target.value })}
              className="rounded-lg px-3 py-2 text-sm w-full" style={{ border: `1px solid ${T.line}`, background: T.bg, color: T.ink }}>
              <option value={1.2}>Mostly sitting (desk job)</option>
              <option value={1.375}>Light activity (walks, 1–2 workouts/wk)</option>
              <option value={1.55}>Moderate (3–5 workouts/wk)</option>
              <option value={1.725}>Very active (daily training)</option>
            </select>
            <div className="rounded-lg px-3 py-2 text-sm" style={{ background: T.turmericSoft, color: T.ink }}>
              {calcTarget(profile)
                ? <>Estimated maintenance: <b>{calcTarget(profile)} kcal/day</b> (Mifflin–St Jeor)</>
                : "Fill age, weight and height to calculate."}
            </div>
          </div>
        )}
      </Card>
      <Card>
        <p className="text-sm font-semibold mb-1" style={{ color: T.ink }}>Protein goal</p>
        <p className="text-xs" style={{ color: T.sub }}>
          {profile.weight ? `1.6 g per kg bodyweight → ${proteinGoal} g/day` : `Default ${proteinGoal} g/day — add your weight for a personalised goal (1.6 g/kg).`}
        </p>
      </Card>
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex-1 pr-3">
            <p className="text-sm font-semibold" style={{ color: T.ink }}>Shortage reminders</p>
            <p className="text-xs" style={{ color: T.sub }}>Get notified when a pantry item runs low or finishes.</p>
          </div>
          <button onClick={toggleReminders} className="text-xs px-4 py-2 rounded-full flex-shrink-0"
            style={remindersOn ? { background: T.green, color: "#fff" } : { border: `1px solid ${T.green}`, color: T.green }}>
            {remindersOn ? "On" : "Enable"}
          </button>
        </div>
      </Card>
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: T.ink }}>Signed in as {user}</p>
            <p className="text-xs" style={{ color: T.sub }}>{userEmail || "Data saved on this device"}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg"
            style={{ color: T.over, border: `1px solid ${T.line}` }}>
            <LogOut size={14} /> Log out
          </button>
        </div>
      </Card>
      <p className="text-xs text-center px-4" style={{ color: T.sub }}>
        Estimates are approximate and for general awareness, not medical advice.
      </p>
    </div>
  );

  const tabs = [
    { id: "today", label: "Today", icon: Home },
    { id: "pantry", label: "Pantry", icon: ChefHat },
    { id: "profile", label: "Profile", icon: User },
  ];

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen w-full flex justify-center" style={{ background: T.bg }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap');`}</style>
      <div className="w-full max-w-md flex flex-col min-h-screen">
        <header className="px-4 pt-5 pb-2 flex items-baseline justify-between">
          <h1 style={{ fontFamily: "Poppins, system-ui, sans-serif", fontSize: 22, fontWeight: 600, color: T.green }}>PantryKal</h1>
          <span className="text-xs" style={{ color: T.sub }}>
            Hi {user.split(" ")[0]} · {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
          </span>
        </header>

        <main className="flex-1 px-4 pb-28 pt-1">
          {screen === "ob-profile" && (
            <div className="flex flex-col gap-4">
              <StepBanner step={1} total={2} title="Set your daily calorie target" sub="Type it in yourself, or let us calculate it from your stats." />
              <Profile />
              <button onClick={() => setScreen("ob-pantry")} className="rounded-xl py-3 text-sm font-semibold" style={{ background: T.green, color: "#fff" }}>
                Continue → Stock my pantry
              </button>
            </div>
          )}
          {screen === "ob-pantry" && (
            <div className="flex flex-col gap-4">
              <StepBanner step={2} total={2} title="Stock your pantry" sub="Import a Zepto/Blinkit order, upload a bill photo, or tweak the pre-filled list below." />
              <Pantry />
              <button onClick={finishOnboarding} className="rounded-xl py-3 text-sm font-semibold" style={{ background: T.green, color: "#fff" }}>
                Finish setup → Start tracking
              </button>
            </div>
          )}
          {screen === "today" && <Today />}
          {screen === "add" && <Add />}
          {screen === "pantry" && <Pantry />}
          {screen === "profile" && <Profile />}
        </main>

        {toast && (
          <div className="fixed bottom-32 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl text-xs shadow-lg z-50 w-11/12 max-w-sm text-center"
            style={{ background: T.ink, color: "#fff" }}>
            {toast}
          </div>
        )}

        {onboarded && screen !== "add" && (
          <button onClick={() => { setAddMeal(mealByHour()); setScreen("add"); }}
            aria-label="Log food"
            className="fixed bottom-20 rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
            style={{ background: T.turmeric, color: "#fff", right: "max(calc(50% - 13rem), 1rem)" }}>
            <Plus size={26} />
          </button>
        )}

        {onboarded && (
        <nav className="fixed bottom-0 w-full max-w-md flex justify-around py-2"
          style={{ background: T.card, borderTop: `1px solid ${T.line}` }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setScreen(t.id)} className="flex flex-col items-center gap-0.5 px-4 py-1"
              style={{ color: screen === t.id ? T.green : T.sub }}>
              <t.icon size={20} />
              <span className="text-xs">{t.label}</span>
            </button>
          ))}
        </nav>
        )}
      </div>
    </div>
  );
}
