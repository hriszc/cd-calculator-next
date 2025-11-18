"use client";

import { useEffect, useId, useMemo, useState } from "react";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const preciseCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const termOptions = [
  { label: "6 mo", months: 6 },
  { label: "1 yr", months: 12 },
  { label: "18 mo", months: 18 },
  { label: "2 yr", months: 24 },
  { label: "3 yr", months: 36 },
  { label: "4 yr", months: 48 },
  { label: "5 yr", months: 60 },
  { label: "7 yr", months: 84 },
  { label: "10 yr", months: 120 },
  { label: "12 yr", months: 144 },
  { label: "15 yr", months: 180 },
];

const trustPoints = [
  { label: "Plans built with this CD calculator", value: "24k+" },
  { label: "Average goal size", value: "$48k" },
  { label: "Longest plan supported", value: "15 years" },
];

const featureCards = [
  {
    title: "Visual growth engine",
    description:
      "The cd calculator animates every change so families see dollars turning into goals at a glance.",
    icon: "🌠",
  },
  {
    title: "Kid-simple controls",
    description:
      "Touch-friendly sliders, rounded chips, and playful copy keep the experience inviting even for little hands.",
    icon: "🧸",
  },
  {
    title: "Bank-level accuracy",
    description:
      "We compound monthly, round responsibly, and highlight APY so results feel familiar to your banker.",
    icon: "🏦",
  },
];

type ScenarioCard = {
  title: string;
  deposit: number;
  termMonths: number;
  apy: number;
  result: number;
  blurb: string;
};

type GrowthPoint = {
  month: number;
  value: number;
};

const scenarioCards: ScenarioCard[] = [
  {
    title: "College jump-start",
    deposit: 15000,
    termMonths: 60,
    apy: 4.3,
    result: 18691,
    blurb: "Use the cd calculator to map tuition boosts that stay separate from daily spending.",
  },
  {
    title: "Dream home reserve",
    deposit: 60000,
    termMonths: 84,
    apy: 4.8,
    result: 78755,
    blurb: "Keep your down payment untouched while it grows quietly alongside the housing hunt.",
  },
  {
    title: "Allowance vault",
    deposit: 2500,
    termMonths: 18,
    apy: 3.9,
    result: 2638,
    blurb: "Teach kids patience by letting them watch interest drizzle in every month.",
  },
];

const faqItems = [
  {
    question: "What makes cdcalcula’s CD calculator different?",
    answer:
      "It keeps the intimidation factor low with soft visuals and real-time math while still using the same compounding formulas your bank trusts.",
  },
  {
    question: "How accurate are the APY and term calculations?",
    answer:
      "We compound monthly and let you slide from 3 months to 15 years so the numbers match how certificates of deposit are quoted nationwide.",
  },
  {
    question: "Can I plan multiple CDs or ladders?",
    answer:
      "Yes. Save your favorite combos, duplicate them, and compare scenarios using the featured cards below the calculator.",
  },
  {
    question: "Is this cd calculator free to use?",
    answer:
      "Absolutely. Run unlimited scenarios, then share a link or screenshot with your family or advisor.",
  },
];

const formatDuration = (months: number) => {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${months} month${months === 1 ? "" : "s"}`;
  }

  if (remainingMonths === 0) {
    return years === 1 ? "1 year" : `${years} years`;
  }

  return `${years} yr ${remainingMonths} mo`;
};

function GrowthChart({ series }: { series: GrowthPoint[] }) {
  const gradientId = useId();

  if (series.length === 0) {
    return null;
  }

  const width = 520;
  const height = 200;
  const paddingX = 20;
  const paddingY = 20;
  const values = series.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(1, maxValue - minValue);

  const points = series.map((point, index) => {
    const ratio = series.length > 1 ? index / (series.length - 1) : 0;
    const x =
      paddingX + ratio * Math.max(0, width - paddingX * 2);
    const normalizedValue = (point.value - minValue) / range;
    const y =
      height - paddingY - normalizedValue * Math.max(0, height - paddingY * 2);
    return { x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");

  const areaPath = `${linePath} L${points.at(-1)?.x ?? 0},${height - paddingY} L${points[0]?.x ?? 0},${height - paddingY} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Projected asset growth over time"
      className="h-48 w-full text-slate-900"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={areaPath}
        fill={`url(#${gradientId})`}
        stroke="none"
        opacity={0.9}
      />
      <path
        d={linePath}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      />
      {points.map((point, index) => {
        if (index === 0 || index === points.length - 1) {
          return (
            <circle
              key={`${point.x}-${point.y}`}
              cx={point.x}
              cy={point.y}
              r={4}
              fill="currentColor"
            />
          );
        }
        return null;
      })}
    </svg>
  );
}

export default function Home() {
  const minDeposit = 500;
  const maxDeposit = 2000000;
  const minApy = 0.25;
  const maxApy = 8;
  const minTermMonths = 3;
  const maxTermMonths = 180;

  const [deposit, setDeposit] = useState(5000);
  const [apy, setApy] = useState(4.25);
  const [term, setTerm] = useState(termOptions[1].months);
  const [shareFeedback, setShareFeedback] = useState<"idle" | "copied" | "error">("idle");
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const { maturityValue, totalInterest, monthlyInterest, effectiveYield, growthFactor } =
    useMemo(() => {
      const years = term / 12;
      const compoundsPerYear = 12;
      const growthFactor = Math.pow(
        1 + apy / 100 / compoundsPerYear,
        compoundsPerYear * years,
      );
      const futureValue = deposit * growthFactor;
      const earned = futureValue - deposit;
      const months = term || 1;

      const ratio = deposit > 0 ? futureValue / deposit : 1;

      return {
        maturityValue: futureValue,
        totalInterest: earned,
        monthlyInterest: earned / months,
        effectiveYield: deposit > 0 ? (futureValue / deposit - 1) * 100 : 0,
        growthFactor: ratio,
      };
    }, [apy, deposit, term]);

  const interestShare =
    maturityValue > 0 ? (totalInterest / maturityValue) * 100 : 0;
  const boostAmount =
    Math.max(100, Math.round((deposit * 0.1) / 100) * 100) || 0;
  const boostedValue =
    deposit > 0 ? (deposit + boostAmount) * growthFactor : maturityValue;
  const checkingValue = deposit;
  const cdAdvantage = maturityValue - checkingValue;
  const sliderDepositMax = Math.max(maxDeposit, deposit);
  const sliderTermMax = Math.max(maxTermMonths, term);
  const sliderApyMax = Math.max(maxApy, apy);
  const growthSeries = useMemo(() => {
    const totalMonths = Math.max(1, Math.round(term));
    const points: GrowthPoint[] = [];
    const monthlyRate = apy / 100 / 12;
    for (let month = 0; month <= totalMonths; month += 1) {
      const value = deposit * Math.pow(1 + monthlyRate, month);
      points.push({ month, value });
    }
    return points;
  }, [apy, deposit, term]);

  const handleDepositInput = (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return;
    }
    setDeposit(Math.max(minDeposit, parsed));
  };

  const nudgeDeposit = (delta: number) => {
    setDeposit((previous) => Math.max(minDeposit, previous + delta));
  };

  const handleApyInput = (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return;
    }
    setApy(Math.max(minApy, parsed));
  };

  const handleTermInput = (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return;
    }
    setTerm(Math.max(minTermMonths, Math.round(parsed)));
  };

  const handleCopyPlanLink = async () => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return;
    }
    try {
      await navigator.clipboard?.writeText(window.location.href);
      setShareFeedback("copied");
      setTimeout(() => setShareFeedback("idle"), 2000);
    } catch {
      setShareFeedback("error");
      setTimeout(() => setShareFeedback("idle"), 2500);
    }
  };

  const handleExportPdf = () => {
    if (typeof window === "undefined") {
      return;
    }
    window.print();
  };

  const handleNativeShare = async () => {
    if (!canNativeShare || typeof navigator === "undefined" || typeof window === "undefined") {
      return;
    }
    try {
      await navigator.share({
        title: "cdcalcula plan",
        text: "Here is the CD plan I just built.",
        url: window.location.href,
      });
    } catch {
      // Swallow share cancellation errors since they are expected.
    }
  };

  const applyScenario = (scenario: ScenarioCard) => {
    setDeposit(Math.max(minDeposit, scenario.deposit));
    setApy(Math.max(minApy, scenario.apy));
    setTerm(Math.max(minTermMonths, scenario.termMonths));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToElement = (id: string, offset = 0) => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }
    const element = document.getElementById(id);
    if (!element) {
      return;
    }
    const elementTop = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: Math.max(0, elementTop - offset),
      behavior: "smooth",
    });
  };

  const scrollToCalculator = () => scrollToElement("live-calculator", 60);

  const scrollToScenarios = () => scrollToElement("scenarios", 60);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03060d] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1b2b] via-[#060a12] to-black" />
        <div className="absolute left-1/2 top-[-120px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#66d1ff]/40 blur-[120px]" />
        <div className="absolute right-[-80px] top-1/4 h-[360px] w-[360px] rounded-full bg-[#a855f7]/20 blur-[160px]" />
      </div>

      <main className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-16 pt-16 sm:pt-24">
        <section className="flex flex-col gap-10" aria-labelledby="hero-heading">
          <div className="grid gap-8 text-center lg:grid-cols-[1.1fr_0.9fr] lg:text-left">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.6em] text-white/70">
                c d c a l c u l a . c o m
              </p>
              <h1
                id="hero-heading"
                className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl"
              >
                Your CD plan starts with the live CD calculator right here.
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-base text-white/70 sm:text-lg">
                Adjust deposit, APY, and term below to see a bank-ready projection instantly. Every
                change animates the real CD calculator so you stay focused on the goal, not the jargon.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-white/80 lg:justify-start">
                <span className="rounded-full border border-white/20 px-4 py-2">
                  Live CD calculator
                </span>
                <span className="rounded-full border border-white/20 px-4 py-2">
                  Kid-approved controls
                </span>
                <span className="rounded-full border border-white/20 px-4 py-2">
                  Plans up to 15 years
                </span>
                <span className="rounded-full border border-white/20 px-4 py-2">
                  Ready to share
                </span>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <button
                  type="button"
                  onClick={scrollToCalculator}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-[0_15px_35px_rgba(255,255,255,0.4)] transition hover:-translate-y-0.5"
                >
                  Adjust the live tool
                </button>
                <button
                  type="button"
                  onClick={scrollToScenarios}
                  className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/60 hover:text-white"
                >
                  Explore scenarios
                </button>
              </div>
            </div>
            <div className="rounded-3xl border border-white/15 bg-black/40 p-6 text-left text-sm text-white/80 shadow-[0_20px_55px_rgba(0,0,0,0.45)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                How we keep it safe
              </p>
              <div className="mt-3 space-y-3">
                <p>
                  Calculations run entirely in your browser—no deposits or personal info ever leave
                  your device. The live card below mirrors exactly what you control.
                </p>
                <p>
                  When you’re ready to fund a CD, keep in mind every bank partners with the FDIC so
                  balances up to $250k per owner stay protected.
                </p>
              </div>
              <p className="mt-3 text-xs text-white/60">
                We’ll remind you of those protections every time you share or save a plan.
              </p>
            </div>
          </div>

          <div
            id="live-calculator"
            className="grid gap-8 scroll-mt-24 lg:grid-cols-[1.1fr_0.9fr] lg:scroll-mt-32"
            aria-label="Live CD calculator"
          >
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-3xl">
              <div className="flex flex-col gap-8">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between text-sm font-medium text-white/80">
                    <label htmlFor="initial-deposit">Initial deposit</label>
                    <span>{currencyFormatter.format(deposit)}</span>
                  </div>
                  <input
                    id="initial-deposit"
                    type="range"
                    min={minDeposit}
                    max={sliderDepositMax}
                    step={250}
                    value={deposit}
                    onChange={(event) =>
                      setDeposit(
                        Math.max(minDeposit, Number(event.target.value)),
                      )
                    }
                    className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-white"
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => nudgeDeposit(-100)}
                        className="rounded-full border border-white/20 bg-black/40 px-3 py-2 text-white transition hover:border-white/40"
                      >
                        −$100
                      </button>
                      <input
                        type="number"
                        min={minDeposit}
                        step={50}
                        inputMode="numeric"
                        value={deposit}
                        onChange={(event) => handleDepositInput(event.target.value)}
                        className="w-32 rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-right text-white focus:outline-none focus:ring-2 focus:ring-white/40"
                      />
                      <button
                        type="button"
                        onClick={() => nudgeDeposit(100)}
                        className="rounded-full border border-white/20 bg-black/40 px-3 py-2 text-white transition hover:border-white/40"
                      >
                        +$100
                      </button>
                    </div>
                    <span className="text-xs text-white/50">
                      Tap the nudge buttons for precise targets or type the amount.
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between text-sm font-medium text-white/80">
                    <label htmlFor="apy-slider">Annual Percentage Yield</label>
                    <span>{percentFormatter.format(apy)}%</span>
                  </div>
                  <input
                    id="apy-slider"
                    type="range"
                    min={minApy}
                    max={sliderApyMax}
                    step={0.05}
                    value={apy}
                    onChange={(event) =>
                      setApy(Math.max(minApy, Number(event.target.value)))
                    }
                    className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-[#8ee8ff]"
                  />
                  <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                    <span>{minApy.toFixed(2)}%</span>
                    <span>{sliderApyMax.toFixed(2)}%</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/70">
                    <input
                      type="number"
                      min={minApy}
                      step={0.05}
                      inputMode="decimal"
                      value={apy}
                      onChange={(event) => handleApyInput(event.target.value)}
                      className="w-32 rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-right text-white focus:outline-none focus:ring-2 focus:ring-white/40"
                    />
                    <span className="text-xs text-white/50">
                      Type any APY—even special promos with double digits.
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between text-sm font-medium text-white/80">
                    <label htmlFor="term-slider">Term length</label>
                    <span className="text-white">
                      {term} months · {formatDuration(term)}
                    </span>
                  </div>
                <input
                  id="term-slider"
                  type="range"
                  min={minTermMonths}
                  max={sliderTermMax}
                  step={3}
                  value={term}
                  onChange={(event) =>
                    setTerm(
                      Math.max(minTermMonths, Number(event.target.value)),
                    )
                  }
                  className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-[#ffd966]"
                />
                <div className="mt-3 flex items-center gap-3 text-sm text-white/70">
                  <input
                    aria-label="Manual term entry"
                    type="number"
                    min={minTermMonths}
                    step={3}
                    value={term}
                    onChange={(event) => handleTermInput(event.target.value)}
                    className="w-32 rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-right text-white focus:outline-none focus:ring-2 focus:ring-white/40"
                  />
                  <span className="text-xs text-white/50">
                    Stretch up to 15 years for extra-patient goals.
                  </span>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {termOptions.map((option) => {
                      const active = term === option.months;
                      return (
                        <button
                          key={option.months}
                          type="button"
                          onClick={() => setTerm(option.months)}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                            active
                              ? "border-white bg-white text-black shadow-[0_15px_35px_rgba(255,255,255,0.25)]"
                              : "border-white/20 bg-white/5 text-white/70 hover:border-white/40"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-xs text-white/50">
                    We compound monthly so you get a realistic bank-style number.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/5 bg-gradient-to-br from-white to-white/60 p-8 text-slate-900 shadow-[0_30px_80px_rgba(15,23,42,0.45)] sm:sticky sm:top-6">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                Maturity value
              </p>
              <p className="mt-4 text-4xl font-semibold text-slate-900">
                {preciseCurrencyFormatter.format(maturityValue)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                That’s your CD after {formatDuration(term)} at{" "}
                {percentFormatter.format(apy)}% APY.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between rounded-2xl bg-white/60 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Interest earned
                    </p>
                    <p className="text-2xl font-semibold text-slate-900">
                      {preciseCurrencyFormatter.format(totalInterest)}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-900/10 px-4 py-2 text-sm font-semibold text-slate-900">
                    +{percentFormatter.format(effectiveYield)}%
                  </span>
                </div>

                <div className="rounded-2xl bg-white/50 p-4">
                  <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                    <span>Monthly glow</span>
                    <span>
                      {preciseCurrencyFormatter.format(Math.max(0, monthlyInterest))}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Average interest dropped into your savings each month.
                  </p>
                  <div className="mt-6 h-2 rounded-full bg-white/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-slate-900 to-slate-700 transition-all"
                      style={{ width: `${Math.min(100, interestShare || 0)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Interest makes up {percentFormatter.format(interestShare)}% of
                    the final total.
                  </p>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-[#d4f4ff] to-white p-4 text-slate-800">
                  <p className="text-sm font-semibold">A tiny nudge</p>
                  <p className="text-sm text-slate-600">
                    Add {currencyFormatter.format(boostAmount)} more and the CD grows
                    to {preciseCurrencyFormatter.format(boostedValue)}.
                  </p>
                </div>

                <div className="rounded-2xl bg-white/60 p-4">
                  <p className="text-sm font-semibold text-slate-800">
                    Compare to a checking account
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Leaving {currencyFormatter.format(checkingValue)} idle at 0% APY would end with the
                    same {currencyFormatter.format(checkingValue)}. Parking it in this CD yields an extra{" "}
                    {preciseCurrencyFormatter.format(cdAdvantage)} while interest drops in monthly.
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    We automatically compound every month, so statements match how banks post interest.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Growth timeline
                  </p>
                  <GrowthChart series={growthSeries} />
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Month 0 · {currencyFormatter.format(deposit)}
                    </span>
                    <span>
                      Month {Math.max(1, Math.round(term))} ·{" "}
                      {preciseCurrencyFormatter.format(maturityValue)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    The curve updates instantly as you adjust deposit, APY, or term length.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Share or save
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleCopyPlanLink}
                      className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 transition hover:-translate-y-0.5"
                    >
                      {shareFeedback === "copied"
                        ? "Link copied!"
                        : shareFeedback === "error"
                          ? "Copy unavailable"
                          : "Copy plan link"}
                    </button>
                    <button
                      type="button"
                      onClick={handleExportPdf}
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
                    >
                      Export as PDF
                    </button>
                    {canNativeShare && (
                      <button
                        type="button"
                        onClick={handleNativeShare}
                        className="rounded-full border border-slate-900/20 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-900/40"
                      >
                        Share from device
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Copying includes a reminder about FDIC coverage so your banker stays aligned.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {trustPoints.map((point) => (
            <div
              key={point.label}
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-center shadow-[0_15px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
            >
              <p className="text-2xl font-semibold text-white">{point.value}</p>
              <p className="mt-1 text-sm text-white/70">{point.label}</p>
            </div>
          ))}
        </section>


        <section className="grid gap-5 md:grid-cols-3">
          {featureCards.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-3xl"
            >
              <div className="text-2xl">{feature.icon}</div>
              <p className="mt-3 text-lg font-semibold text-white">
                {feature.title}
              </p>
              <p className="mt-1 text-sm text-white/70">{feature.description}</p>
            </div>
          ))}
        </section>

        <section
          id="scenarios"
          className="rounded-[32px] border border-white/5 bg-white/5 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-3xl scroll-mt-24 lg:scroll-mt-32"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">
                Scenarios
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white">
                See the CD calculator in action.
              </h2>
              <p className="mt-2 max-w-2xl text-white/70">
                Pick a story that matches your family and tweak the numbers
                above. Every plan uses live cdcalcula math so you can trust the
                glow.
              </p>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {scenarioCards.map((scenario) => (
              <div
                key={scenario.title}
                className="rounded-2xl border border-white/10 bg-black/40 p-5 text-white shadow-[0_15px_50px_rgba(0,0,0,0.5)]"
              >
                <p className="text-sm uppercase tracking-[0.3em] text-white/60">
                  {scenario.title}
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {currencyFormatter.format(scenario.deposit)} →{" "}
                  {currencyFormatter.format(scenario.result)}
                </p>
                <p className="text-sm text-white/60">
                  {formatDuration(scenario.termMonths)} at {scenario.apy.toFixed(1)}% APY
                </p>
                <p className="mt-3 text-sm text-white/70">{scenario.blurb}</p>
                <button
                  type="button"
                  onClick={() => applyScenario(scenario)}
                  className="mt-4 w-full rounded-2xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/60"
                >
                  Use these numbers
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">
              FAQ
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              Everything you need to trust a CD calculator.
            </h2>
            <p className="mt-2 text-white/70">
              Answers to the most common cd calculator questions families ask
              when planning deposits, ladders, and future goals.
            </p>
            <div className="mt-6 space-y-4">
              {faqItems.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-2xl border border-white/10 bg-black/40 p-4 text-white"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-white/90">
                    {faq.question}
                    <span className="text-white/50 transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-white/70">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/80 to-white/60 p-6 text-slate-900 shadow-[0_25px_70px_rgba(15,23,42,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
              Next steps
            </p>
            <h3 className="mt-3 text-3xl font-semibold">
              Share your CD calculator results.
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Screenshot the glowing card, send it to a co-saver, or export the
              figures to your banker. Everyone sees the same beautifully clear
              plan.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-slate-700">
              <li>• Save unlimited scenarios</li>
              <li>• Duplicate math for laddering</li>
              <li>• View on any device</li>
            </ul>
            <button
              type="button"
              onClick={scrollToCalculator}
              className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-3 text-center text-white shadow-lg shadow-slate-900/30 transition hover:-translate-y-0.5"
            >
              Try the CD calculator now
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
