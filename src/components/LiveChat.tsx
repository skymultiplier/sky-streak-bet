import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Smile } from "lucide-react";

interface ChatMsg {
  id: number;
  user: string;
  text: string;
  color: string;
  time: string;
  self?: boolean;
}

const SEED_MESSAGES: Omit<ChatMsg, "id" | "time">[] = [
  { user: "Pay***k_King", text: "Cashed out at 2.3x — Pay***k credited in 2 mins 🔥", color: "text-yellow-300" },
  { user: "MidnightPilot", text: "Playing at midnight always feels luckier 😅 just hit 3.1x", color: "text-cyan-300" },
  { user: "LagosFlyer", text: "Pay***k deposit > USDT for me. Instant ⚡", color: "text-green-300" },
  { user: "AfternoonAce", text: "Trick: small bets around 2pm, collect early 🤫", color: "text-pink-300" },
  { user: "SkyHunter22", text: "Won $48 this morning 🛫 buying lunch with it lol", color: "text-orange-300" },
  { user: "Pay***f_Queen", text: "3 wins in a row 🥳 collected before the bomb box appeared", color: "text-purple-300" },
  { user: "NaijaBettor", text: "Pay***k withdrawal hit my GTB in 90 seconds 👏", color: "text-emerald-300" },
  { user: "RocketRider", text: "Don't be greedy — collect at 1.5x 💸", color: "text-blue-300" },
  { user: "QuietWinner", text: "Best time? Late night after 11pm 🌙", color: "text-indigo-300" },
  { user: "TurboGirl", text: "Pay***k is the easiest method for Naija players 🇳🇬", color: "text-rose-300" },
  { user: "AlphaPilot", text: "Just hit 4.2x 🚀🚀 daily target done", color: "text-lime-300" },
  { user: "DawnBettor", text: "Morning flights = lucky boxes 🌅 try it", color: "text-amber-300" },
  { user: "StealthAce", text: "Pay***k 👉 deposit 👉 collect 👉 repeat ♻️", color: "text-teal-300" },
];

const EMOJIS = ["🚀", "🔥", "💸", "🎉", "✈️", "🤑", "🙌", "🌙", "⚡", "😅", "💯", "🥳"];

export const LiveChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);

  const fmtTime = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  // Seed initial messages
  useEffect(() => {
    const initial = SEED_MESSAGES.slice(0, 5).map((m) => ({
      ...m,
      id: idRef.current++,
      time: fmtTime(),
    }));
    setMessages(initial);
  }, []);

  // Drip in new fake messages
  useEffect(() => {
    const iv = setInterval(() => {
      const pool = SEED_MESSAGES[Math.floor(Math.random() * SEED_MESSAGES.length)];
      setMessages((prev) => [
        ...prev.slice(-40),
        { ...pool, id: idRef.current++, time: fmtTime() },
      ]);
    }, 9000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: idRef.current++, user: "You", text, color: "text-white", time: fmtTime(), self: true },
    ]);
    setInput("");
    setShowEmojis(false);
  };

  return (
    <>
      {/* Trigger button — top-right floating */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed top-20 right-4 z-40 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full shadow-lg p-3 flex items-center gap-2 transition-transform hover:scale-105"
        aria-label="Open live chat"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline text-sm font-semibold">Live Chat</span>
        <span className="bg-green-400 w-2 h-2 rounded-full animate-pulse" />
      </button>

      {open && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[520px] bg-slate-900 border border-cyan-500/40 rounded-xl shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800 rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white font-semibold">Live Lounge Chat</span>
              <span className="text-xs text-gray-400">· {Math.floor(120 + Math.random() * 40)} online</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2 bg-slate-900">
            {messages.map((m) => (
              <div key={m.id} className="text-sm">
                <div className="flex items-baseline gap-2">
                  <span className={`font-semibold ${m.self ? "text-cyan-300" : m.color}`}>{m.user}</span>
                  <span className="text-[10px] text-gray-500">{m.time}</span>
                </div>
                <div className="text-gray-200 leading-snug pl-1">{m.text}</div>
              </div>
            ))}
          </div>

          {showEmojis && (
            <div className="flex flex-wrap gap-1 px-2 py-2 bg-slate-800 border-t border-slate-700">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setInput((v) => v + e)}
                  className="text-xl hover:scale-125 transition-transform"
                >
                  {e}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 p-2 border-t border-slate-700 bg-slate-800 rounded-b-xl">
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-300 hover:text-white px-2"
              onClick={() => setShowEmojis((s) => !s)}
            >
              <Smile className="h-4 w-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Say hi to the lounge…"
              className="flex-1 bg-slate-900 border-slate-600 text-white placeholder:text-gray-500"
              maxLength={140}
            />
            <Button size="sm" onClick={send} className="bg-cyan-600 hover:bg-cyan-500 text-white">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
