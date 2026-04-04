"use client";

import { useEffect, useState } from "react";

export default function IronManLoader() {
  const [phase, setPhase] = useState<"suiting" | "launching" | "done">("suiting");

  useEffect(() => {
    // Suit-up takes ~4s, then launch
    const launchTimer = setTimeout(() => setPhase("launching"), 4000);
    const doneTimer = setTimeout(() => setPhase("done"), 6800);
    return () => {
      clearTimeout(launchTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <div style={styles.page}>
      <style>{css}</style>
      <div className={`im-wrapper ${phase}`}>
        {/* Tony Stark (visible before suit-up) */}
        <div className="tony-stark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/651105/Tony_Stark.svg"
            alt="Tony Stark"
            width={150}
          />
        </div>

        {/* Arc Reactor */}
        <div className="arc-reactor">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/651105/Arc_Reactor.svg"
            alt=""
            width={17}
          />
        </div>

        {/* Suit parts */}
        <div className="im-helmet">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/651105/Iron_Man_Helmet.svg" alt="" />
        </div>

        <div className="im-left-arm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/651105/Iron_Man_Left_Arm.svg" alt="" />
          <div className="flame flame-left-hand" />
        </div>

        <div className="im-right-arm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/651105/Iron_Man_Right_Arm.svg" alt="" />
          <div className="flame flame-right-hand" />
        </div>

        <div className="im-left-leg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/651105/Iron_Man_Left_Leg.svg" alt="" />
          <div className="flame flame-left-leg" />
        </div>

        <div className="im-right-leg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/651105/Iron_Man_Right_Leg.svg" alt="" />
          <div className="flame flame-right-leg" />
        </div>

        <div className="im-chest">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/651105/Iron_Man_Chest.svg" alt="" />
        </div>
      </div>

      {/* Ground shadow */}
      <div className={`im-shadow ${phase}`} />

      {/* Loading text */}
      <p className={`loading-text ${phase === "done" ? "fade-out" : ""}`}>
        {phase === "suiting" ? "Suiting up…" : phase === "launching" ? "Engaging repulsors…" : ""}
      </p>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────── */

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "#0a0a0f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    position: "relative",
    flexDirection: "column",
    gap: "2rem",
  },
};

const css = `
/* ── Base positioning ── */
.im-wrapper {
  position: relative;
  width: 161px;
  height: 198px;
}

/* ── Tony Stark ── */
.tony-stark {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 150px;
  transition: opacity 0.3s;
}
.im-wrapper.suiting .tony-stark { opacity: 1; animation: tonyFade 4s forwards; }
.im-wrapper.launching .tony-stark,
.im-wrapper.done .tony-stark { opacity: 0; }

@keyframes tonyFade {
  0%   { opacity: 1; }
  60%  { opacity: 1; }
  80%  { opacity: 0; }
  100% { opacity: 0; }
}

/* ── Arc Reactor ── */
.arc-reactor {
  position: absolute;
  left: 0; right: 0; margin: auto;
  top: 132px;
  width: 17px;
  height: 17px;
  animation: pulse 1.6s ease-in-out infinite;
  z-index: 5;
}
@keyframes pulse {
  0%, 100% { transform: scale(0.85); opacity: 0.7; }
  50%       { transform: scale(1.1);  opacity: 1; }
}

/* ── Suit parts shared ── */
.im-helmet,
.im-left-arm, .im-right-arm,
.im-left-leg, .im-right-leg,
.im-chest {
  position: absolute;
}

/* All suit images: fill their container, don't use position:absolute */
.im-helmet img,
.im-left-arm img, .im-right-arm img,
.im-left-leg img, .im-right-leg img,
.im-chest img {
  display: block;
  width: 120%;
  height: 120%;
  object-fit: contain;
}

/* Helmet */
.im-helmet {
  top: -25px; left: 0; right: 0; margin: auto;
  width: 158px; height: 158px; z-index: 4;
  animation: slideDown 4s ease-out forwards;
}
@keyframes slideDown {
  0%   { opacity: 0; transform: translateY(-200%); }
  10%  { opacity: 0; transform: translateY(-200%); }
  35%  { opacity: 1; transform: translateY(2%); }
  40%  { opacity: 1; transform: translateY(0%); }
  100% { opacity: 1; transform: translateY(0%); }
}

/* Chest — centered horizontally, sits at lower half */
.im-chest {
  top: 100px; left: 0; right: 0; margin: auto;
  width: 118px; height: 70px; z-index: 3;
  animation: slideUp 4s ease-out forwards;
}
@keyframes slideUp {
  0%   { opacity: 0; transform: translateY(200%); }
  10%  { opacity: 0; transform: translateY(200%); }
  35%  { opacity: 1; transform: translateY(-2%); }
  40%  { opacity: 1; transform: translateY(0%); }
  100% { opacity: 1; transform: translateY(0%); }
}

/* Left arm */
.im-left-arm {
  top: 120px; left: 6px;
  width: 43px; height: 41px; z-index: 2;
  animation: slideRight 4s ease-out forwards;
}
@keyframes slideRight {
  0%   { opacity: 0; transform: translateX(-200%); }
  10%  { opacity: 0; transform: translateX(-200%); }
  35%  { opacity: 1; transform: translateX(2%); }
  40%  { opacity: 1; transform: translateX(0%); }
  100% { opacity: 1; transform: translateX(0%); }
}

/* Right arm */
.im-right-arm {
  top: 120px; right: 6px;
  width: 43px; height: 41px; z-index: 2;
  animation: slideLeft 4s ease-out forwards;
}
@keyframes slideLeft {
  0%   { opacity: 0; transform: translateX(200%); }
  10%  { opacity: 0; transform: translateX(200%); }
  35%  { opacity: 1; transform: translateX(-2%); }
  40%  { opacity: 1; transform: translateX(0%); }
  100% { opacity: 1; transform: translateX(0%); }
}

/* Left leg */
.im-left-leg {
  bottom: -11px; left: 38px;
  width: 34px; height: 54px; z-index: 2;
  transform: rotate(24deg);
  animation: slideUpRotateLeft 4s ease-out forwards;
}
@keyframes slideUpRotateLeft {
  0%   { opacity: 0; transform: translateY(200%) rotate(24deg); }
  10%  { opacity: 0; transform: translateY(200%) rotate(24deg); }
  35%  { opacity: 1; transform: translateY(-2%) rotate(24deg); }
  40%  { opacity: 1; transform: translateY(0%) rotate(24deg); }
  70%  { transform: translateY(0%) rotate(24deg); }
  80%  { transform: translateY(0%) translateX(3px) rotate(0deg); }
  100% { transform: translateY(0%) translateX(3px) rotate(0deg); }
}

/* Right leg */
.im-right-leg {
  bottom: -11px; right: 38px;
  width: 34px; height: 54px; z-index: 2;
  transform: rotate(-24deg);
  animation: slideUpRotateRight 4s ease-out forwards;
}
@keyframes slideUpRotateRight {
  0%   { opacity: 0; transform: translateY(200%) rotate(-24deg); }
  10%  { opacity: 0; transform: translateY(200%) rotate(-24deg); }
  35%  { opacity: 1; transform: translateY(-2%) rotate(-24deg); }
  40%  { opacity: 1; transform: translateY(0%) rotate(-24deg); }
  70%  { transform: translateY(0%) rotate(-24deg); }
  80%  { transform: translateY(0%) translateX(-3px) rotate(0deg); }
  100% { transform: translateY(0%) translateX(-3px) rotate(0deg); }
}

/* ── Launch ── */
.im-wrapper.launching,
.im-wrapper.done {
  animation: flyUp 2.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
@keyframes flyUp {
  0%   { transform: translateY(0) scale(1); opacity: 1; }
  20%  { transform: translateY(10px) scale(1.02); }
  100% { transform: translateY(-160vh) scale(0.5); opacity: 0; }
}

/* ── Flames ── */
.flame {
  background-color: #1AA3FF;
  border-bottom-right-radius: 50% 75%;
  border-bottom-left-radius:  50% 75%;
  border-top-left-radius:    20% 20%;
  border-top-right-radius:   20% 20%;
  box-shadow: 0 0 6px 2px #1AA3FF, 0 0 12px 4px #60cfff;
  width: 7px; height: 12px;
  position: absolute;
  opacity: 0;
  z-index: 1;
}

.flame-left-hand  { left: 8px;  top: 38px; }
.flame-right-hand { right: 8px; top: 38px; }
.flame-left-leg   { left: 14px; bottom: -9px; }
.flame-right-leg  { right: 14px; bottom: -9px; }

/* Flames appear only during & after suit-up (launching phase) */
.im-wrapper.launching .flame,
.im-wrapper.done .flame {
  animation: flicker 0.12s ease-in-out infinite alternate;
  opacity: 1;
}
@keyframes flicker {
  0%   { transform: scaleY(0.8) rotate(-4deg); opacity: 0.85; }
  50%  { transform: scaleY(1.3) rotate(0deg);  opacity: 1; }
  100% { transform: scaleY(0.9) rotate(4deg);  opacity: 0.9; }
}
.flame-left-hand  { animation-delay: 0s !important; }
.flame-right-hand { animation-delay: 0.05s !important; }
.flame-left-leg   { animation-delay: 0.02s !important; }
.flame-right-leg  { animation-delay: 0.07s !important; }

/* ── Shadow ── */
.im-shadow {
  position: absolute;
  bottom: calc(50% - 115px);
  left: 0; right: 0;
  margin: auto;
  width: 161px; height: 30px;
  background: radial-gradient(ellipse, rgba(26,163,255,0.25) 0%, transparent 70%);
  border-radius: 50%;
  transition: transform 0.3s, opacity 0.3s;
}
.im-shadow.suiting  { transform: scale(1); opacity: 1; }
.im-shadow.launching { animation: shadowShrink 2.8s forwards; }
.im-shadow.done     { opacity: 0; }
@keyframes shadowShrink {
  0%   { transform: scale(1); opacity: 1; }
  100% { transform: scale(0); opacity: 0; }
}

/* ── Loading text ── */
.loading-text {
  color: #60cfff;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin: 0;
  opacity: 1;
  transition: opacity 0.5s;
}
.loading-text.fade-out { opacity: 0; }
`;