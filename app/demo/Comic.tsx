// Hand-drawn style panels (stick figures, ink lines, a handwriting font) for the story player.
// Each scene is a small SVG built from a few primitives, so adding one is a dozen lines.

import type { ReactNode } from "react";

const INK = "#1d1d1f";
const stroke = { stroke: INK, strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };

type Pose = "stand" | "sit" | "phone" | "pen" | "wave" | "suitcase" | "headset" | "relax";

function Figure({ x, y, pose = "stand", flip = false }: { x: number; y: number; pose?: Pose; flip?: boolean }) {
  const s = flip ? -1 : 1;
  const sitting = pose === "sit" || pose === "pen" || pose === "phone" || pose === "relax";
  const legY = sitting ? 62 : 80;
  return (
    <g transform={`translate(${x} ${y}) scale(${s} 1)`}>
      <circle cx="0" cy="0" r="13" {...stroke} />
      <line x1="0" y1="13" x2="0" y2={sitting ? 55 : 62} {...stroke} />
      {pose === "stand" && (
        <>
          <line x1="0" y1="26" x2="-18" y2="48" {...stroke} />
          <line x1="0" y1="26" x2="18" y2="48" {...stroke} />
        </>
      )}
      {pose === "wave" && (
        <>
          <line x1="0" y1="26" x2="-18" y2="48" {...stroke} />
          <line x1="0" y1="26" x2="22" y2="6" {...stroke} />
        </>
      )}
      {pose === "phone" && (
        <>
          <line x1="0" y1="26" x2="-16" y2="46" {...stroke} />
          <line x1="0" y1="26" x2="18" y2="10" {...stroke} />
          <rect x="16" y="-2" width="9" height="16" rx="2" {...stroke} />
        </>
      )}
      {pose === "pen" && (
        <>
          <line x1="0" y1="26" x2="-18" y2="44" {...stroke} />
          <line x1="0" y1="26" x2="22" y2="42" {...stroke} />
          <line x1="22" y1="42" x2="30" y2="50" {...stroke} />
        </>
      )}
      {pose === "sit" && (
        <>
          <line x1="0" y1="26" x2="-16" y2="42" {...stroke} />
          <line x1="0" y1="26" x2="18" y2="42" {...stroke} />
        </>
      )}
      {pose === "relax" && (
        <>
          <line x1="0" y1="26" x2="-22" y2="30" {...stroke} />
          <line x1="0" y1="26" x2="22" y2="30" {...stroke} />
        </>
      )}
      {pose === "suitcase" && (
        <>
          <line x1="0" y1="26" x2="-18" y2="50" {...stroke} />
          <line x1="0" y1="26" x2="16" y2="44" {...stroke} />
          <rect x="10" y="44" width="22" height="18" rx="2" {...stroke} />
        </>
      )}
      {pose === "headset" && (
        <>
          <path d="M-13 -2 a13 13 0 0 1 26 0" {...stroke} />
          <rect x="-16" y="-4" width="5" height="9" rx="1" fill={INK} />
          <rect x="11" y="-4" width="5" height="9" rx="1" fill={INK} />
          <line x1="0" y1="26" x2="-18" y2="44" {...stroke} />
          <line x1="0" y1="26" x2="18" y2="44" {...stroke} />
        </>
      )}
      {sitting ? (
        <>
          <line x1="0" y1="55" x2="18" y2="55" {...stroke} />
          <line x1="18" y1="55" x2="18" y2="80" {...stroke} />
          <line x1="0" y1="55" x2="-4" y2="80" {...stroke} />
        </>
      ) : (
        <>
          <line x1="0" y1={legY - 18} x2="-14" y2={legY + 16} {...stroke} />
          <line x1="0" y1={legY - 18} x2="14" y2={legY + 16} {...stroke} />
        </>
      )}
    </g>
  );
}

function Table({ x, y, w = 160 }: { x: number; y: number; w?: number }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x + w} y2={y} {...stroke} />
      <line x1={x + 12} y1={y} x2={x + 12} y2={y + 60} {...stroke} />
      <line x1={x + w - 12} y1={y} x2={x + w - 12} y2={y + 60} {...stroke} />
    </g>
  );
}

function Doc({ x, y, label }: { x: number; y: number; label?: string }) {
  return (
    <g>
      <rect x={x} y={y} width="44" height="56" {...stroke} fill="#fff" />
      <line x1={x + 8} y1={y + 14} x2={x + 36} y2={y + 14} {...stroke} strokeWidth={2} />
      <line x1={x + 8} y1={y + 24} x2={x + 36} y2={y + 24} {...stroke} strokeWidth={2} />
      <line x1={x + 8} y1={y + 34} x2={x + 28} y2={y + 34} {...stroke} strokeWidth={2} />
      {label && (
        <text x={x + 22} y={y + 72} textAnchor="middle" fontSize="13" fontFamily="var(--font-hand)" fill={INK}>
          {label}
        </text>
      )}
    </g>
  );
}

function Bubble({ x, y, w, text, tail = "left" }: { x: number; y: number; w: number; text: string[]; tail?: "left" | "right" }) {
  const h = 16 + text.length * 18;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="10" {...stroke} fill="#fff" />
      <path d={tail === "left" ? `M${x + 24} ${y + h} l -8 14 l 20 -14` : `M${x + w - 24} ${y + h} l 8 14 l -20 -14`} {...stroke} fill="#fff" />
      {text.map((t, i) => (
        <text key={i} x={x + w / 2} y={y + 22 + i * 18} textAnchor="middle" fontSize="14" fontFamily="var(--font-hand)" fill={INK}>
          {t}
        </text>
      ))}
    </g>
  );
}

function Phone({ x, y, alert = false }: { x: number; y: number; alert?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width="30" height="52" rx="5" {...stroke} fill="#fff" />
      <line x1={x + 10} y1={y + 46} x2={x + 20} y2={y + 46} {...stroke} strokeWidth={2} />
      {alert && (
        <>
          <path d={`M${x - 8} ${y + 10} q -6 -12 0 -24`} {...stroke} strokeWidth={2} />
          <path d={`M${x + 38} ${y + 10} q 6 -12 0 -24`} {...stroke} strokeWidth={2} />
        </>
      )}
    </g>
  );
}

function House({ x, y, label }: { x: number; y: number; label?: string }) {
  return (
    <g>
      <path d={`M${x} ${y + 60} v -40 l 50 -40 l 50 40 v 40 z`} {...stroke} fill="#fff" />
      <rect x={x + 38} y={y + 28} width="24" height="32" {...stroke} />
      <rect x={x + 10} y={y + 26} width="18" height="16" {...stroke} />
      {label && (
        <g>
          <rect x={x + 62} y={y - 6} width="52" height="24" rx="4" {...stroke} fill="#fff" />
          <text x={x + 88} y={y + 11} textAnchor="middle" fontSize="13" fontFamily="var(--font-hand)" fill={INK}>{label}</text>
        </g>
      )}
    </g>
  );
}

function Car({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x} ${y + 30} l 14 -20 h 50 l 18 20 h 14 v 18 h -96 z`} {...stroke} fill="#fff" />
      <circle cx={x + 22} cy={y + 50} r="8" {...stroke} fill="#fff" />
      <circle cx={x + 74} cy={y + 50} r="8" {...stroke} fill="#fff" />
    </g>
  );
}

function Laptop({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="54" height="34" rx="3" {...stroke} fill="#fff" />
      <path d={`M${x - 8} ${y + 34} h 70 l -6 8 h -58 z`} {...stroke} fill="#fff" />
    </g>
  );
}

const SCENES: Record<string, ReactNode> = {
  "lien-notary": (
    <>
      <Table x={90} y={150} w={240} />
      <Figure x={130} y={90} pose="pen" />
      <Figure x={190} y={90} pose="sit" />
      <Figure x={300} y={90} pose="sit" flip />
      <Doc x={218} y={118} label="compromis" />
      <Bubble x={290} y={20} w={150} text={["Sign here, here", "and here."]} tail="right" />
      <text x={30} y={40} fontSize="15" fontFamily="var(--font-hand)" fill={INK}>Notary Vermeulen, Tuesday 10:14</text>
    </>
  ),
  "lien-home": (
    <>
      <House x={60} y={100} label="label D by '32" />
      <Figure x={230} y={110} pose="wave" />
      <Figure x={270} y={110} pose="stand" />
      <Bubble x={300} y={30} w={150} text={["Insured for what", "it costs to rebuild."]} tail="left" />
    </>
  ),
  "marc-hr": (
    <>
      <Table x={100} y={150} w={200} />
      <Figure x={140} y={90} pose="sit" />
      <Figure x={270} y={90} pose="sit" flip />
      <Doc x={190} y={118} label="retirement: March" />
      <Bubble x={20} y={20} w={190} text={["So that's 1 March.", "Congratulations!"]} tail="right" />
      <text x={330} y={60} fontSize="14" fontFamily="var(--font-hand)" fill={INK}>(the group insurance</text>
      <text x={330} y={80} fontSize="14" fontFamily="var(--font-hand)" fill={INK}>ends that day too)</text>
    </>
  ),
  "marc-bench": (
    <>
      <line x1={60} y1={170} x2={300} y2={170} {...stroke} />
      <line x1={80} y1={170} x2={80} y2={200} {...stroke} />
      <line x1={280} y1={170} x2={280} y2={200} {...stroke} />
      <Figure x={170} y={110} pose="relax" />
      <Phone x={230} y={120} />
      <Bubble x={250} y={20} w={190} text={["March. Nothing broke.", "Nobody called."]} tail="left" />
    </>
  ),
  "ayse-cafe": (
    <>
      <Table x={200} y={140} w={120} />
      <Figure x={150} y={80} pose="phone" />
      <Figure x={330} y={90} pose="stand" flip />
      <Bubble x={20} y={20} w={200} text={["Tap. No fees abroad.", "(other app, again)"]} tail="right" />
      <text x={230} y={60} fontSize="16" fontFamily="var(--font-hand)" fill={INK}>Lisboa ☀</text>
      <text x={300} y={200} fontSize="13" fontFamily="var(--font-hand)" fill={INK}>25 in 38 days</text>
    </>
  ),
  "ayse-phone": (
    <>
      <Figure x={200} y={90} pose="phone" />
      <Bubble x={40} y={20} w={180} text={["€21 a year saved.", "Travel option on."]} tail="right" />
      <Bubble x={270} y={110} w={170} text={["…and the €340", "can come back."]} tail="left" />
    </>
  ),
  "jos-sms": (
    <>
      <Table x={110} y={150} w={200} />
      <Figure x={200} y={90} pose="phone" />
      <Phone x={296} y={100} alert />
      <Bubble x={20} y={14} w={230} text={["Your parcel is held.", "Pay €2.85 to release it.", "→ link"]} tail="right" />
      <text x={300} y={60} fontSize="14" fontFamily="var(--font-hand)" fill={INK}>12 minutes ago</text>
    </>
  ),
  "jos-call": (
    <>
      <Figure x={130} y={90} pose="phone" />
      <Figure x={330} y={90} pose="headset" flip />
      <Bubble x={20} y={14} w={180} text={["Cancel it. Please."]} tail="right" />
      <Bubble x={260} y={14} w={200} text={["Done. Nothing left", "your account, Jos."]} tail="left" />
      <text x={190} y={200} fontSize="14" fontFamily="var(--font-hand)" fill={INK}>€2,850 stays</text>
    </>
  ),
  "nadia-client": (
    <>
      <Table x={80} y={150} w={200} />
      <Figure x={130} y={90} pose="sit" />
      <Laptop x={170} y={112} />
      <Bubble x={250} y={20} w={200} text={["I'll pay next month,", "promise 🙏"]} tail="left" />
      <Car x={330} y={150} />
      <text x={20} y={40} fontSize="14" fontFamily="var(--font-hand)" fill={INK}>VAT due on the 20th</text>
    </>
  ),
  "nadia-desk": (
    <>
      <Table x={80} y={150} w={200} />
      <Figure x={130} y={90} pose="sit" />
      <Laptop x={170} y={112} />
      <Car x={330} y={150} />
      <Bubble x={230} y={20} w={220} text={["VAT paid. No overdraft.", "Car insured. Client paid", "(eventually)."]} tail="left" />
    </>
  ),
};

export function Comic({ scene, caption }: { scene: string; caption: string }) {
  return (
    <figure className="comic">
      <svg viewBox="0 0 480 220" className="h-auto w-full" role="img" aria-label={caption}>
        <rect x="1.5" y="1.5" width="477" height="217" rx="6" fill="#fff" stroke={INK} strokeWidth="3" />
        {SCENES[scene] ?? <text x="240" y="120" textAnchor="middle" fontFamily="var(--font-hand)" fill={INK}>{scene}</text>}
      </svg>
      <figcaption className="comic-caption">{caption}</figcaption>
    </figure>
  );
}
