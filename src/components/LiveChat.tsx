import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Smile, CornerDownRight } from "lucide-react";

interface ChatMsg {
  id: number;
  user: string;
  text: string;
  color: string;
  time: string;
  self?: boolean;
  replyTo?: number;
  replyToUser?: string;
}

// Mix: wins, losses, near-misses, doubts, jokes, advice, replies — keep it real
const SEED_MESSAGES: Omit<ChatMsg, "id" | "time">[] = [
  { user: "Pay***k_King", text: "Cashed at 2.1x. Small win is still a win 👌", color: "text-yellow-300" },
  { user: "MidnightPilot", text: "Lost 3 in a row 😩 walking away for an hour", color: "text-cyan-300" },
  { user: "LagosFlyer", text: "Bro why I dey greedy. Should have collected at 1.8x", color: "text-green-300" },
  { user: "AfternoonAce", text: "Anyone else seeing more bombs today? feels rigged sometimes", color: "text-pink-300" },
  { user: "SkyHunter22", text: "Made $30 then lost $20 back lol. Net $10 lunch money 🍔", color: "text-orange-300" },
  { user: "Pay***f_Queen", text: "Hit 3.4x finally! after 6 losses 🥲", color: "text-purple-300" },
  { user: "NaijaBettor", text: "Withdrawal hit GTB in 2 mins. So no scam", color: "text-emerald-300" },
  { user: "RocketRider", text: "Honestly don't bet more than you can lose. it's just a game", color: "text-blue-300" },
  { user: "QuietWinner", text: "Down $40 today. Tomorrow is another day", color: "text-indigo-300" },
  { user: "TurboGirl", text: "First time playing. confused but having fun 😅", color: "text-rose-300" },
  { user: "AlphaPilot", text: "1.5x collect strategy keeps me alive. boring but it works", color: "text-lime-300" },
  { user: "DawnBettor", text: "Bomb box 3 times in a row 💀 i'm done for today", color: "text-amber-300" },
  { user: "StealthAce", text: "Anyone else nervous when the plane gets to box 5? 😬", color: "text-teal-300" },
  { user: "BankrollBen", text: "Started with $20, now at $73. Not bad for 30 mins", color: "text-yellow-200" },
  { user: "ChillFlyer", text: "Lost my deposit 😭 only do small bets next time", color: "text-rose-200" },
  { user: "Realist77", text: "It can make you a fortune OR clean you out. respect the game", color: "text-cyan-200" },
  { user: "LuckyJay", text: "4.7x! biggest hit yet 🚀🚀🚀", color: "text-green-200" },
  { user: "AbujaAce", text: "you guys make it look easy. i've lost 5 in a row", color: "text-orange-200" },
];

// Reply chains — replies reference earlier messages by index in SEED_MESSAGES
const SEED_REPLIES: { toIdx: number; user: string; text: string; color: string }[] = [
  { toIdx: 2, user: "RocketRider", text: "story of my life 😂 always one more box", color: "text-blue-300" },
  { toIdx: 4, user: "Pay***k_King", text: "small wins compound bro keep at it", color: "text-yellow-300" },
  { toIdx: 3, user: "Realist77", text: "it's random. some days are just cold", color: "text-cyan-200" },
  { toIdx: 11, user: "ChillFlyer", text: "felt that. take a break, come back fresh", color: "text-rose-200" },
  { toIdx: 8, user: "AlphaPilot", text: "respect for being honest. most people only post wins", color: "text-lime-300" },
  { toIdx: 14, user: "QuietWinner", text: "same here. small bets only from now on", color: "text-indigo-300" },
  { toIdx: 16, user: "TurboGirl", text: "congrats!! what was your bet?", color: "text-rose-300" },
];

const EMOJIS = ["🚀", "🔥", "💸", "🎉", "✈️", "🤑", "🙌", "😩", "💀", "😅", "💯", "🥲"];

export const LiveChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMsg | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);
  const tickRef = useRef(0);

  const fmtTime = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const initial: ChatMsg[] = [];
    [0, 2, 4, 8, 11].forEach((i) => {
      initial.push({ ...SEED_MESSAGES[i], id: idRef.current++, time: fmtTime() });
    });
    setMessages(initial);
  }, []);

  // Drip in messages — mix of new posts and replies
  useEffect(() => {
    const iv = setInterval(() => {
      tickRef.current += 1;
      setMessages((prev) => {
        const next = [...prev.slice(-50)];
        // Every 3rd tick try a reply to a recent message
        if (tickRef.current % 3 === 0 && next.length > 0) {
          const target = next[Math.max(0, next.length - 1 - Math.floor(Math.random() * 4))];
          const reply = SEED_REPLIES[Math.floor(Math.random() * SEED_REPLIES.length)];
          next.push({
            id: idRef.current++,
            user: reply.user,
            text: reply.text,
            color: reply.color,
            time: fmtTime(),
            replyTo: target.id,
            replyToUser: target.user,
          });
        } else {
          const m = SEED_MESSAGES[Math.floor(Math.random() * SEED_MESSAGES.length)];
          next.push({ ...m, id: idRef.current++, time: fmtTime() });
        }
        return next;
      });
    }, 7500);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: idRef.current++,
        user: "You",
        text,
        color: "text-white",
        time: fmtTime(),
        self: true,
        replyTo: replyTo?.id,
        replyToUser: replyTo?.user,
      },
    ]);
    setInput("");
    setReplyTo(null);
    setShowEmojis(false);

    // Simulate someone replying back to user after a few seconds
    setTimeout(() => {
      const reply = SEED_REPLIES[Math.floor(Math.random() * SEED_REPLIES.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: idRef.current++,
          user: reply.user,
          text: reply.text,
          color: reply.color,
          time: fmtTime(),
          replyTo: idRef.current - 2,
          replyToUser: "You",
        },
      ]);
    }, 4000 + Math.random() * 3000);
  };

  return (
    <>
      {/* Trigger — placed just below the top demo/real action bar */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed top-32 right-4 z-30 bg-cyan-700 hover:bg-cyan-600 text-white rounded-full shadow-lg px-3 py-2 flex items-center gap-2"
        aria-label="Open live chat"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="text-xs font-semibold">Lounge</span>
        <span className="bg-green-400 w-2 h-2 rounded-full animate-pulse" />
      </button>

      {open && (
        <div className="fixed top-44 right-2 sm:right-6 z-40 w-[92vw] max-w-sm h-[60vh] max-h-[480px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col">

          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800 rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white font-semibold">Lounge Chat</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2 bg-slate-900">
            {messages.map((m) => (
              <div
                key={m.id}
                className="text-sm group cursor-pointer hover:bg-slate-800/50 rounded p-1 -mx-1"
                onClick={() => setReplyTo(m)}
              >
                {m.replyToUser && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 pl-1">
                    <CornerDownRight className="h-3 w-3" />
                    <span>replying to <span className="text-gray-400">{m.replyToUser}</span></span>
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <span className={`font-semibold ${m.self ? "text-cyan-300" : m.color}`}>{m.user}</span>
                  <span className="text-[10px] text-gray-500">{m.time}</span>
                </div>
                <div className="text-gray-200 leading-snug pl-1">{m.text}</div>
              </div>
            ))}
          </div>

          {replyTo && (
            <div className="px-3 py-1.5 bg-slate-800/80 border-t border-slate-700 text-xs flex items-center justify-between">
              <span className="text-gray-400 truncate">
                Replying to <span className="text-cyan-300">{replyTo.user}</span>
              </span>
              <button onClick={() => setReplyTo(null)} className="text-gray-500 hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {showEmojis && (
            <div className="flex flex-wrap gap-1 px-2 py-2 bg-slate-800 border-t border-slate-700">
              {EMOJIS.map((e) => (
                <button key={e} onClick={() => setInput((v) => v + e)} className="text-xl hover:scale-125 transition-transform">
                  {e}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 p-2 border-t border-slate-700 bg-slate-800 rounded-b-xl">
            <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white px-2" onClick={() => setShowEmojis((s) => !s)}>
              <Smile className="h-4 w-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={replyTo ? `Reply to ${replyTo.user}…` : "Say something…"}
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
