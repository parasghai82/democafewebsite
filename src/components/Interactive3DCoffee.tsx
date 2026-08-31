import React, { useState, useRef, useEffect } from "react";
import { Coffee, Sparkles, Flame, Droplets, RotateCw, Award, Heart } from "lucide-react";

export function Interactive3DCoffee() {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isBrewing, setIsBrewing] = useState(false);
  const [activeRoast, setActiveRoast] = useState<"light" | "medium" | "dark">("medium");
  const [sipCount, setSipCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse move 3D tilt calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Smooth 3D tilt angles
    const degX = -(y / (rect.height / 2)) * 18;
    const degY = (x / (rect.width / 2)) * 18;
    
    setRotateX(degX);
    setRotateY(degY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleBrew = () => {
    if (isBrewing) return;
    setIsBrewing(true);
    setSipCount(0);
    setTimeout(() => setIsBrewing(false), 2200);
  };

  const handleSip = () => {
    setSipCount((prev) => (prev < 4 ? prev + 1 : 0));
  };

  const roastDetails = {
    light: {
      name: "Ethiopia Yirgacheffe",
      notes: "Bergamot, Jasmine, White Peach & Meyer Lemon",
      altitude: "2,150 MASL",
      color: "#D97706",
      cremaBg: "radial-gradient(circle at 40% 40%, #F59E0B 0%, #D97706 60%, #92400E 100%)",
      body: "Delicate & Floral Silk",
    },
    medium: {
      name: "Baldwin Signature Blend",
      notes: "Dark Chocolate, Honey Glaze, Roasted Almond & Valencia Orange",
      altitude: "1,850 MASL",
      color: "#C97616",
      cremaBg: "radial-gradient(circle at 40% 40%, #FBBF24 0%, #C97616 55%, #78350F 100%)",
      body: "Velvety Crema & Caramel Balance",
    },
    dark: {
      name: "Heritage 1998 Roast",
      notes: "Smoked Cocoa, Toasted Walnut, Black Cherry & Molasses",
      altitude: "1,600 MASL",
      color: "#92400E",
      cremaBg: "radial-gradient(circle at 40% 40%, #B45309 0%, #78350F 65%, #381A05 100%)",
      body: "Full-Bodied & Rich Molasses",
    },
  };

  const current = roastDetails[activeRoast];

  return (
    <section className="py-20 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-[#FAF7F2] via-[#F3ECE0] to-[#FAF7F2] select-none">
      
      {/* 3D AMBIENT BACKGROUND GLOWS */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-300/20 via-butter/25 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-bl from-orange-400/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10 text-center">
        
        {/* SECTION HEADER */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-warm-brown/5 border border-warm-brown/15 text-warm-brown text-xs font-black uppercase tracking-widest shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-butter animate-spin-slow" />
            <span>Interactive 3D Sensory Lab</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-black text-warm-brown tracking-tight">
            Experience Specialty Coffee in <span className="gold-gradient-text">Real 3D</span>
          </h2>
          <p className="font-body text-sm sm:text-base text-warm-brown/70 leading-relaxed">
            Tilt your device or move your mouse to inspect our ceramic extraction in realistic 3D space. Dial in the single-origin roast profiles and watch the steam arise.
          </p>
        </div>

        {/* 3D INTERACTIVE STAGE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT: ROAST ATTRIBUTES & SENSORY DATA */}
          <div className="lg:col-span-4 space-y-4 text-left order-2 lg:order-1">
            
            <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-warm-brown/15 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-butter flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-amber-500" />
                  Origin Profile
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-warm-brown/10 text-warm-brown font-mono text-[10px] font-bold">
                  {current.altitude}
                </span>
              </div>

              <div>
                <h3 className="font-heading text-xl font-bold text-warm-brown">{current.name}</h3>
                <p className="text-xs text-warm-brown/60 mt-1 font-body">{current.body}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-warm-brown/10 space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-warm-brown/50">Tasting Notes:</p>
                <p className="text-xs font-bold text-warm-brown italic leading-snug">
                  "{current.notes}"
                </p>
              </div>

              {/* ROAST SELECTOR TABS */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-warm-brown/50">Select Single Origin Roast:</p>
                <div className="grid grid-cols-3 gap-2">
                  {(["light", "medium", "dark"] as const).map((roast) => (
                    <button
                      key={roast}
                      onClick={() => {
                        setActiveRoast(roast);
                        handleBrew();
                      }}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border ${
                        activeRoast === roast
                          ? "bg-warm-brown text-white border-warm-brown shadow-md scale-102 font-black"
                          : "bg-white text-warm-brown/70 border-warm-brown/15 hover:bg-warm-brown/5"
                      }`}
                    >
                      {roast}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="flex gap-3">
              <button
                onClick={handleBrew}
                disabled={isBrewing}
                className="flex-1 btn-3d-gold h-12 rounded-2xl text-warm-brown font-heading font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-102 transition-transform"
              >
                <RotateCw className={`h-4 w-4 ${isBrewing ? "animate-spin" : ""}`} />
                <span>{isBrewing ? "Extracting Shot..." : "Pull Fresh Shot"}</span>
              </button>

              <button
                onClick={handleSip}
                className="px-5 h-12 rounded-2xl bg-white border border-warm-brown/20 hover:bg-warm-brown/5 text-warm-brown font-heading font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <Heart className="h-4 w-4 text-terracotta fill-terracotta" />
                <span>Take Sip ({4 - sipCount})</span>
              </button>
            </div>

          </div>

          {/* CENTER / RIGHT: 3D INTERACTIVE CERAMIC CUP STAGE */}
          <div className="lg:col-span-8 flex justify-center order-1 lg:order-2">
            
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="relative w-full max-w-[480px] h-[460px] flex items-center justify-center cursor-grab active:cursor-grabbing perspective-1000 select-none group"
              style={{
                perspective: "1200px",
              }}
            >
              
              {/* 3D FLOATING PERSPECTIVE CONTAINER */}
              <div
                className="relative w-[340px] h-[340px] flex items-center justify-center transition-transform duration-150 ease-out"
                style={{
                  transformStyle: "preserve-3d",
                  transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                }}
              >
                
                {/* 3D ORBITING COFFEE BEANS */}
                {[
                  { deg: 0, rad: 170, z: 40, size: 22, delay: "0s", speed: "12s" },
                  { deg: 72, rad: 190, z: -30, size: 18, delay: "-2.4s", speed: "14s" },
                  { deg: 144, rad: 160, z: 60, size: 20, delay: "-4.8s", speed: "11s" },
                  { deg: 216, rad: 200, z: -20, size: 24, delay: "-7.2s", speed: "15s" },
                  { deg: 288, rad: 175, z: 50, size: 19, delay: "-9.6s", speed: "13s" },
                ].map((bean, idx) => (
                  <div
                    key={idx}
                    className="absolute pointer-events-none animate-float-3d"
                    style={{
                      transform: `rotateZ(${bean.deg}deg) translateX(${bean.rad}px) rotateZ(-${bean.deg}deg) translateZ(${bean.z}px)`,
                      animationDuration: bean.speed,
                      animationDelay: bean.delay,
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <div
                      className="rounded-full shadow-2xl relative overflow-hidden"
                      style={{
                        width: `${bean.size}px`,
                        height: `${bean.size * 1.3}px`,
                        background: "linear-gradient(135deg, #78350F 0%, #451A03 60%, #1E140E 100%)",
                        boxShadow: "0 8px 18px rgba(30, 20, 14, 0.4), inset 0 2px 4px rgba(255,255,255,0.2)",
                        transform: `rotate(35deg) scale(${isHovered ? 1.15 : 1})`,
                        transition: "transform 0.3s ease",
                      }}
                    >
                      {/* BEAN CREASE */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-[80%] bg-[#271307] rounded-full shadow-sm" />
                    </div>
                  </div>
                ))}

                {/* 3D CERAMIC SAUCER (BOTTOM LAYER) */}
                <div
                  className="absolute rounded-full border border-warm-brown/20 shadow-2xl flex items-center justify-center"
                  style={{
                    width: "320px",
                    height: "320px",
                    background: "radial-gradient(circle at 45% 45%, #FFFFFF 0%, #F5EDE2 65%, #DFD3C3 100%)",
                    boxShadow: "0 35px 60px -15px rgba(50, 30, 15, 0.28), inset 0 3px 6px rgba(255,255,255,0.9)",
                    transform: "translateZ(-30px)",
                  }}
                >
                  {/* INNER SAUCER RING */}
                  <div
                    className="w-[200px] h-[200px] rounded-full border border-warm-brown/15 shadow-inner"
                    style={{
                      background: "radial-gradient(circle, #FAF7F2 40%, #EFE5D6 100%)",
                    }}
                  />
                </div>

                {/* 3D CERAMIC CUP BODY */}
                <div
                  className="relative rounded-full border-4 border-white flex items-center justify-center transition-all duration-500 shadow-2xl"
                  style={{
                    width: "210px",
                    height: "210px",
                    background: "linear-gradient(145deg, #FFFFFF 0%, #F7EFE3 50%, #D8C9B5 100%)",
                    boxShadow: "0 25px 45px -10px rgba(50, 30, 15, 0.35), inset 0 -8px 15px rgba(180, 155, 130, 0.3)",
                    transform: "translateZ(30px)",
                  }}
                >
                  {/* CERAMIC CUP HANDLE */}
                  <div
                    className="absolute -right-7 top-1/2 -translate-y-1/2 rounded-r-3xl border-4 border-white shadow-xl"
                    style={{
                      width: "48px",
                      height: "85px",
                      background: "linear-gradient(135deg, #FFFFFF 0%, #EFE3D3 100%)",
                      boxShadow: "5px 10px 20px rgba(50,30,15,0.2), inset 0 2px 4px rgba(255,255,255,1)",
                      transform: "translateZ(10px) rotateY(-15deg)",
                    }}
                  />

                  {/* LIQUID CREMA SURFACE */}
                  <div
                    onClick={handleSip}
                    className="w-[175px] h-[175px] rounded-full relative overflow-hidden flex items-center justify-center cursor-pointer shadow-inner transition-all duration-700"
                    style={{
                      background: current.cremaBg,
                      boxShadow: "inset 0 10px 25px rgba(0,0,0,0.5), 0 0 15px rgba(201, 118, 22, 0.3)",
                      transform: `scale(${1 - sipCount * 0.08})`,
                    }}
                  >
                    
                    {/* LATTE ART ROSETTA MICRO-FOAM */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-90 transition-opacity">
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        {/* ROSETTA PETALS */}
                        <div className="w-16 h-16 rounded-full border-2 border-white/70 rotate-45 scale-90 shadow-sm" />
                        <div className="absolute w-12 h-12 rounded-full border-2 border-white/80 rotate-45 scale-75" />
                        <div className="absolute w-8 h-8 rounded-full border-2 border-white/90 rotate-45 scale-60" />
                        <div className="absolute w-4 h-4 rounded-full bg-white/90 shadow-md" />
                      </div>
                    </div>

                    {/* LIQUID SHIMMER GLAZE */}
                    <div
                      className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"
                      style={{
                        transform: `rotate(${rotateY * 2}deg)`,
                      }}
                    />

                    {/* BREWING PULSE WAVE */}
                    {isBrewing && (
                      <div className="absolute inset-0 bg-amber-400/40 rounded-full animate-ping pointer-events-none" />
                    )}

                  </div>

                  {/* RISING 3D STEAM WISPS */}
                  <div
                    className="absolute -top-16 pointer-events-none flex gap-2"
                    style={{
                      transform: "translateZ(60px)",
                    }}
                  >
                    <div className="w-4 h-16 rounded-full bg-gradient-to-t from-white/40 via-white/20 to-transparent blur-md animate-coffee-steam-1" />
                    <div className="w-5 h-20 rounded-full bg-gradient-to-t from-white/50 via-white/25 to-transparent blur-md animate-coffee-steam-2" />
                    <div className="w-4 h-14 rounded-full bg-gradient-to-t from-white/35 via-white/15 to-transparent blur-md animate-coffee-steam-1" />
                  </div>

                </div>

                {/* 3D FLOATING GOLD BADGE / SEAL */}
                <div
                  className="absolute -bottom-4 -left-4 p-3.5 rounded-2xl gold-gradient-bg border-2 border-white/80 shadow-2xl text-warm-brown flex items-center gap-2.5 transition-transform duration-300"
                  style={{
                    transform: `translateZ(${isHovered ? 80 : 50}px) rotateZ(-6deg)`,
                  }}
                >
                  <Award className="h-5 w-5 fill-warm-brown text-warm-brown" />
                  <div className="text-left leading-none">
                    <p className="font-heading font-black text-xs uppercase tracking-wider">Single Origin</p>
                    <p className="text-[9px] font-bold opacity-80 mt-0.5">Dialed at 9 Bar Extraction</p>
                  </div>
                </div>

                {/* INTERACTIVE HINT BADGE */}
                <div
                  className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white font-mono text-[10px] font-bold shadow-xl transition-all"
                  style={{
                    transform: `translateZ(${isHovered ? 70 : 40}px)`,
                  }}
                >
                  ✨ Move Cursor to Rotate 3D
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
