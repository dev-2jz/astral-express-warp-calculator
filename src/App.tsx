import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Star, Sparkles, History, Target, Ticket } from 'lucide-react';
import { calculateWarpProbabilities, type BannerType } from './lib/warp-calc';
import { cn } from './lib/utils';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0a0c16]/95 backdrop-blur-md border border-[#e2b659]/30 p-3 rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm shadow-[0_0_15px_rgba(226,182,89,0.15)]">
        <p className="text-[#8b95c9] mb-1 text-sm font-medium">Pulls: <span className="text-white">{label}</span></p>
        <p className="text-[#e2b659] font-bold text-lg drop-shadow-[0_0_8px_rgba(226,182,89,0.5)]">
          {payload[0].value.toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
};

export default function App() {
  const [bannerType, setBannerType] = useState<BannerType>('character');
  const [pity, setPity] = useState<number>(0);
  const [guaranteed, setGuaranteed] = useState<boolean>(false);
  const [pulls, setPulls] = useState<number>(90);
  const [targetCopies, setTargetCopies] = useState<number>(1);

  const handleBannerChange = (type: BannerType) => {
    setBannerType(type);
    if (type === 'lightcone') {
      if (pity > 79) setPity(79);
      if (targetCopies > 5) setTargetCopies(5);
    }
  };

  const maxPullsCalc = Math.max(pulls + 100, 1000);
  const probs = useMemo(() => calculateWarpProbabilities(pity, guaranteed, targetCopies, maxPullsCalc, bannerType), [pity, guaranteed, targetCopies, maxPullsCalc, bannerType]);

  const currentProb = pulls < probs.length ? probs[pulls] : probs[probs.length - 1];

  const getPullsForProb = (targetProb: number) => {
    const index = probs.findIndex(p => p >= targetProb);
    return index === -1 ? ">" + maxPullsCalc : index;
  };

  const chartData = useMemo(() => {
    const maxChartPulls = Math.min(
      Math.max(pulls + 50, getPullsForProb(0.999) === ">" + maxPullsCalc ? 1000 : (getPullsForProb(0.999) as number) + 20),
      probs.length - 1
    );

    const data = [];
    for (let i = 0; i <= maxChartPulls; i++) {
      data.push({
        pulls: i,
        probability: probs[i] * 100
      });
    }
    return data;
  }, [probs, pulls, maxPullsCalc]);

  return (
    <div className="min-h-screen bg-[#05050a] text-slate-200 font-sans selection:bg-[#e2b659]/30 pb-20 relative">
      <div className="stars" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#1a1941]/40 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#302b63]/30 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-8">
        <header className="flex items-center justify-between gap-4 flex-wrap border-b border-[#30365d]/50 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm bg-gradient-to-br from-[#e2b659] to-[#b8860b] flex items-center justify-center shadow-[0_0_20px_rgba(226,182,89,0.3)] shrink-0 border border-[#fff]/20">
              <Ticket className="text-[#05050a] w-8 h-8" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white drop-shadow-md">Astral Express <span className="text-[#e2b659]">Warp</span></h1>
              <p className="text-sm md:text-base text-[#8b95c9] tracking-wide uppercase mt-1 text-xs">Probability Calculator Terminal</p>
            </div>
          </div>
          
          <div className="flex bg-[#0a0c16]/80 backdrop-blur-md border border-[#30365d] rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm p-1 shadow-xl">
            <button
              onClick={() => handleBannerChange('character')}
              className={cn("px-6 py-2.5 text-sm font-semibold tracking-wide uppercase transition-all rounded-tl-lg rounded-br-lg rounded-tr-sm rounded-bl-sm", bannerType === 'character' ? "bg-gradient-to-r from-[#e2b659]/20 to-transparent text-[#e2b659] shadow-[inset_2px_0_0_#e2b659]" : "text-[#8b95c9] hover:text-white hover:bg-[#ffffff05]")}
            >
              Character
            </button>
            <button
              onClick={() => handleBannerChange('lightcone')}
              className={cn("px-6 py-2.5 text-sm font-semibold tracking-wide uppercase transition-all rounded-tl-sm rounded-br-sm rounded-tr-lg rounded-bl-lg", bannerType === 'lightcone' ? "bg-gradient-to-l from-[#e2b659]/20 to-transparent text-[#e2b659] shadow-[inset_-2px_0_0_#e2b659]" : "text-[#8b95c9] hover:text-white hover:bg-[#ffffff05]")}
            >
              Light Cone
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inputs Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-gradient-to-b from-[#111326]/90 to-[#0a0c16]/90 backdrop-blur-xl border border-[#30365d] rounded-tl-3xl rounded-br-3xl rounded-tr-md rounded-bl-md p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#30365d]/30 to-transparent pointer-events-none" />
              
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 uppercase tracking-wide text-sm">
                <History className="w-5 h-5 text-[#e2b659]" />
                Current Status
              </h2>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-[#8b95c9] flex justify-between">
                  <span>Pity Count</span>
                  <span className="text-[#e2b659] font-mono text-lg">{pity}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max={bannerType === 'character' ? "89" : "79"}
                  value={pity}
                  onChange={(e) => setPity(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-[#5c6694] font-mono">
                  <span>0</span>
                  <span>Soft Pity ({bannerType === 'character' ? '74' : '64'})</span>
                  <span>{bannerType === 'character' ? '89' : '79'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-[#8b95c9]">{bannerType === 'character' ? '50/50' : '75/25'} Status</label>
                <div className="flex bg-[#05050a] rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm p-1 border border-[#30365d]/50">
                  <button
                    onClick={() => setGuaranteed(false)}
                    className={cn("flex-1 py-2.5 text-sm font-medium transition-all rounded-tl-lg rounded-br-sm rounded-tr-sm rounded-bl-sm", !guaranteed ? "bg-[#1a1d36] text-white shadow-[0_0_10px_rgba(0,0,0,0.5)] border border-[#30365d]" : "text-[#5c6694] hover:text-[#8b95c9]")}
                  >
                    {bannerType === 'character' ? '50/50' : '75/25'}
                  </button>
                  <button
                    onClick={() => setGuaranteed(true)}
                    className={cn("flex-1 py-2.5 text-sm font-medium transition-all rounded-tl-sm rounded-br-lg rounded-tr-sm rounded-bl-sm", guaranteed ? "bg-[#e2b659]/10 text-[#e2b659] shadow-[0_0_10px_rgba(226,182,89,0.1)] border border-[#e2b659]/30" : "text-[#5c6694] hover:text-[#8b95c9]")}
                  >
                    Guaranteed
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-b from-[#111326]/90 to-[#0a0c16]/90 backdrop-blur-xl border border-[#30365d] rounded-tl-3xl rounded-br-3xl rounded-tr-md rounded-bl-md p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#30365d]/30 to-transparent pointer-events-none" />

              <h2 className="text-lg font-semibold text-white flex items-center gap-2 uppercase tracking-wide text-sm">
                <Target className="w-5 h-5 text-[#e2b659]" />
                Goals & Resources
              </h2>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-[#8b95c9]">Target {bannerType === 'character' ? 'Eidolon' : 'Superimposition'}</label>
                <select
                  value={targetCopies}
                  onChange={(e) => setTargetCopies(Number(e.target.value))}
                  className="w-full bg-[#05050a] border border-[#30365d] rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm px-4 py-3 appearance-none focus:ring-1 focus:ring-[#e2b659] focus:border-[#e2b659] outline-none text-white font-medium"
                >
                  {bannerType === 'character' ? (
                    <>
                      <option value={1}>E0 (1 Copy)</option>
                      <option value={2}>E1 (2 Copies)</option>
                      <option value={3}>E2 (3 Copies)</option>
                      <option value={4}>E3 (4 Copies)</option>
                      <option value={5}>E4 (5 Copies)</option>
                      <option value={6}>E5 (6 Copies)</option>
                      <option value={7}>E6 (7 Copies)</option>
                    </>
                  ) : (
                    <>
                      <option value={1}>S1 (1 Copy)</option>
                      <option value={2}>S2 (2 Copies)</option>
                      <option value={3}>S3 (3 Copies)</option>
                      <option value={4}>S4 (4 Copies)</option>
                      <option value={5}>S5 (5 Copies)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-[#8b95c9] flex justify-between">
                  <span>Available Pulls</span>
                  <span className="text-[#e2b659] font-mono text-lg">{pulls}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="2000"
                  value={pulls}
                  onChange={(e) => setPulls(Number(e.target.value))}
                  className="w-full bg-[#05050a] border border-[#30365d] rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm px-4 py-3 focus:ring-1 focus:ring-[#e2b659] focus:border-[#e2b659] outline-none text-[#e2b659] font-mono text-lg"
                />
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={Math.min(pulls, 500)}
                  onChange={(e) => setPulls(Number(e.target.value))}
                  className="w-full mt-2"
                />
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-gradient-to-br from-[#111326]/90 via-[#0a0c16]/90 to-[#1a1941]/80 backdrop-blur-xl border border-[#30365d] rounded-tl-3xl rounded-br-3xl rounded-tr-md rounded-bl-md p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transition-opacity duration-700 group-hover:opacity-10">
                <Sparkles className="w-48 h-48 text-[#e2b659]" />
              </div>
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-[#e2b659]/5 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h3 className="text-[#8b95c9] font-medium mb-2 uppercase tracking-widest text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#e2b659] animate-pulse" />
                    Success Probability
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-7xl md:text-8xl font-bold text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                      {(currentProb * 100).toFixed(1)}
                    </span>
                    <span className="text-4xl md:text-5xl text-[#e2b659] font-light">%</span>
                  </div>
                  <p className="text-[#5c6694] mt-4 text-sm font-mono">
                    {pulls} PULLS • {pity} PITY • {guaranteed ? 'GUARANTEED' : (bannerType === 'character' ? '50/50' : '75/25')}
                  </p>
                </div>
                
                <div className="flex flex-col gap-2 text-right">
                  <div className="bg-[#05050a]/50 border border-[#30365d]/50 rounded-tl-lg rounded-br-lg rounded-tr-sm rounded-bl-sm px-4 py-2">
                    <span className="text-[#8b95c9] text-xs uppercase tracking-wider block mb-1">Target</span>
                    <span className="text-white font-bold">{bannerType === 'character' ? `E${targetCopies - 1}` : `S${targetCopies}`}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: '50% Chance', prob: 0.5 },
                { label: '75% Chance', prob: 0.75 },
                { label: '90% Chance', prob: 0.9 },
                { label: '99% Chance', prob: 0.99 },
              ].map((m) => (
                <div key={m.label} className="bg-[#111326]/80 backdrop-blur-md border border-[#30365d] rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm p-4 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-[#e2b659]/50 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-[#8b95c9] text-xs uppercase tracking-wider font-semibold mb-2 z-10">{m.label}</span>
                  <span className="text-2xl font-bold text-white z-10 font-mono">
                    {getPullsForProb(m.prob)} <span className="text-xs font-sans font-normal text-[#5c6694] ml-1">pulls</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-b from-[#111326]/90 to-[#0a0c16]/90 backdrop-blur-xl border border-[#30365d] rounded-tl-3xl rounded-br-3xl rounded-tr-md rounded-bl-md p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] h-[400px] flex flex-col relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#e2b659]" />
                  Probability Curve
                </h3>
              </div>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e2b659" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#e2b659" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#30365d" vertical={false} opacity={0.5} />
                    <XAxis
                      dataKey="pulls"
                      stroke="#5c6694"
                      fontSize={12}
                      fontFamily="monospace"
                      tickLine={false}
                      axisLine={false}
                      minTickGap={30}
                      dy={10}
                    />
                    <YAxis
                      stroke="#5c6694"
                      fontSize={12}
                      fontFamily="monospace"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${val}%`}
                      dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2b659', strokeWidth: 1, strokeDasharray: '5 5' }} />
                    {chartData.length > 0 && pulls <= chartData[chartData.length - 1].pulls && (
                      <ReferenceLine x={pulls} stroke="#8b95c9" strokeDasharray="3 3" label={{ position: 'top', value: 'Current', fill: '#8b95c9', fontSize: 10, fontFamily: 'monospace' }} />
                    )}
                    <Area
                      type="monotone"
                      dataKey="probability"
                      stroke="#e2b659"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorProb)"
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

