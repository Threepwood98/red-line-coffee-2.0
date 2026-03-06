import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import {
  FlashlightIcon,
  FlashlightOffIcon,
  PowerIcon,
  RefreshCwIcon,
  ScanLineIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL =
  "https://pokemon-identifier-production.up.railway.app/api/identify-pokemon";

// ── Tipos ────────────────────────────────────────────────────────────

interface PokemonType {
  slot: number;
  name: string;
}

interface PokemonDetails {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonType[];
  stats: { hp: number; attack: number; defense: number; speed: number };
  sprite_url: string | null;
  pokeapi_url: string;
}

interface APIResponse {
  success: boolean;
  pokemon_name: string;
  confidence: number;
  detection_method: string;
  matched_keywords: string[];
  details: PokemonDetails | null;
}

type Phase = "idle" | "scanning" | "result" | "error";
type FacingMode = "environment" | "user";

// ── Helpers ──────────────────────────────────────────────────────────

function formatLabel(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1).replace(/-/g, " ");
}

function base64ToBlob(base64: string): Blob {
  // "data:image/jpeg;base64,/9j/..." → Blob
  const [header, data] = base64.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

const METHOD_LABELS: Record<string, string> = {
  vit_direct: "IA Directa",
  gemini_vision: "Gemini Flash",
  vit_fallback: "IA Fallback",
};

const TYPE_COLORS: Record<string, string> = {
  fire: "bg-orange-400 text-white",
  water: "bg-blue-400 text-white",
  grass: "bg-green-400 text-white",
  electric: "bg-yellow-300 text-yellow-900",
  psychic: "bg-pink-400 text-white",
  ice: "bg-cyan-300 text-cyan-900",
  dragon: "bg-indigo-600 text-white",
  dark: "bg-gray-700 text-white",
  fairy: "bg-pink-300 text-pink-900",
  normal: "bg-gray-300 text-gray-700",
  fighting: "bg-red-600 text-white",
  flying: "bg-sky-300 text-sky-900",
  poison: "bg-purple-400 text-white",
  ground: "bg-yellow-600 text-white",
  rock: "bg-stone-400 text-white",
  bug: "bg-lime-400 text-lime-900",
  ghost: "bg-violet-700 text-white",
  steel: "bg-slate-400 text-white",
};

// ════════════════════════════════════════════════════════════════════
export default function PokeScan() {
  const webcamRef = useRef<Webcam>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const [facingMode, setFacingMode] = useState<FacingMode>("environment");
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [frozenSrc, setFrozenSrc] = useState<string | null>(null);
  const [result, setResult] = useState<APIResponse | null>(null);
  const [camError, setCamError] = useState<string | null>(null);
  const [camReady, setCamReady] = useState<boolean>(false);

  // react-webcam llama esto cuando el stream está listo
  const handleUserMedia = useCallback(() => {
    setCamReady(true);
    setCamError(null);
  }, []);

  const handleUserMediaError = useCallback(() => {
    setCamError("Sin acceso a la cámara. Revisa los permisos del navegador.");
    setCamReady(false);
  }, []);

  // ── Toggle torch ────────────────────────────────────────────────────
  // react-webcam no expone el track directamente — accedemos via el stream
  const toggleTorch = useCallback(async () => {
    const stream = webcamRef.current?.stream;
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    const caps = track.getCapabilities() as MediaTrackCapabilities & {
      torch?: boolean;
    };
    if (!caps.torch) return;
    const next = !torchOn;
    try {
      await track.applyConstraints({
        advanced: [
          { torch: next } as MediaTrackConstraintSet & { torch: boolean },
        ],
      });
      setTorchOn(next);
    } catch {}
  }, [torchOn]);

  const torchSupported = useCallback(() => {
    const stream = webcamRef.current?.stream;
    if (!stream) return false;
    const track = stream.getVideoTracks()[0];
    if (!track) return false;
    const caps = track.getCapabilities() as MediaTrackCapabilities & {
      torch?: boolean;
    };
    return !!caps.torch;
  }, []);

  // ── Cambiar cámara ──────────────────────────────────────────────────
  const toggleFacing = useCallback(() => {
    setTorchOn(false);
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }, []);

  // ── Capturar + enviar a la API ──────────────────────────────────────
  const handleScan = useCallback(async () => {
    if (showResult) {
      handleRetry();
    } else {
      if (!camReady || phase === "scanning") return;

      // Flash visual
      if (flashRef.current) {
        flashRef.current.style.opacity = "1";
        setTimeout(() => {
          if (flashRef.current) flashRef.current.style.opacity = "0";
        }, 200);
      }

      // getScreenshot() → base64 string directamente, sin canvas manual
      const screenshot = webcamRef.current?.getScreenshot({
        width: 1280,
        height: 960,
      });

      if (!screenshot) {
        setPhase("error");
        return;
      }

      setFrozenSrc(screenshot);
      setPhase("scanning");
      setResult(null);
      if (barRef.current) barRef.current.style.width = "0%";

      try {
        // base64 → Blob → FormData (mismo formato que espera la API)
        const blob = base64ToBlob(screenshot);
        const form = new FormData();
        form.append("file", blob, "foto.jpg");

        const res = await fetch(API_URL, { method: "POST", body: form });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error("API error:", errData.error ?? `HTTP ${res.status}`);
          setPhase("error");
          return;
        }

        const data: APIResponse = await res.json();
        setResult(data);
        setPhase("result");

        setTimeout(() => {
          if (barRef.current)
            barRef.current.style.width = `${Math.round(data.confidence)}%`;
        }, 80);
      } catch (err) {
        console.error("Fetch error:", err);
        setPhase("error");
      }
    }
  }, [camReady, phase]);

  // ── Reintentar ──────────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    setFrozenSrc(null);
    setResult(null);
    setPhase("idle");
    if (barRef.current) barRef.current.style.width = "0%";
  }, []);

  // ── Constraints para react-webcam ───────────────────────────────────
  const videoConstraints = {
    facingMode,
    width: { ideal: 960 },
    height: { ideal: 960 },
  };

  const isScanning = phase === "scanning";
  const showResult = phase === "result" || phase === "error";
  const pct = result ? Math.round(result.confidence) : 0;

  // ════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-dvh w-full bg-red-700/80 border-4 border-red-950 rounded-4xl overflow-hidden">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="flex gap-4 h-20 border-b-8 border-r-8 border-red-950 rounded-br-full -mx-1 -mt-1 px-4 py-2 bg-red-700/85 shadow-lg">
        <span className="relative flex aspect-square h-full">
          <span className="relative aspect-square h-full rounded-full border-4 border-neutral-400 bg-cyan-900 shadow-[inset_0_3px_6px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <span className="absolute top-[18%] left-[18%] w-[28%] h-[22%] rounded-full bg-white/15 blur-[1px]" />
          </span>
          {(isScanning || showResult) && (
            <span
              className={`absolute aspect-square h-full rounded-full border-4 border-neutral-400 bg-cyan-300
              shadow-[0_0_12px_4px_rgba(0,255,255,0.5),inset_0_2px_3px_rgba(255,255,255,0.7),inset_0_-3px_6px_rgba(0,150,150,0.5)]
              ${isScanning ? "animate-pulse" : ""}`}
            >
              <span className="absolute top-[18%] left-[18%] w-[28%] h-[22%] rounded-full bg-white/40 blur-[1px]" />
            </span>
          )}
        </span>

        <span className="flex flex-1 items-center justify-center font-rajdhani-700 text-3xl text-red-950">
          PokéDex
        </span>

        <div className="flex justify-end gap-2">
          {[
            !camReady && camError
              ? "bg-red-400 shadow-[0_0_8px_2px_rgba(255,0,0,1)]"
              : "bg-red-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]",
            isScanning
              ? "bg-yellow-300 shadow-[0_0_10px_4px_rgba(250,204,21,0.6)]"
              : "bg-amber-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]",
            camReady && !camError
              ? "bg-green-400 shadow-[0_0_8px_2px_rgba(0,255,0,0.5)]"
              : "bg-green-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]",
          ].map((cls, i) => (
            <span
              key={i}
              className={`h-1/3 aspect-square rounded-full relative ${cls}`}
            >
              <span className="absolute top-[20%] left-[20%] w-[30%] h-[25%] rounded-full bg-white/40 blur-[1px]" />
            </span>
          ))}
        </div>
      </div>

      {/* ── Viewfinder ──────────────────────────────────────────── */}
      <div className="relative aspect-square bg-indigo-100 border-4 border-red-950 rounded-3xl mx-4 mt-4 overflow-hidden">
        {/* react-webcam — reemplaza video + canvas + getUserMedia manual */}
        {!frozenSrc && (
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.92}
            videoConstraints={videoConstraints}
            mirrored={
              facingMode === "user"
            } /* espejo automático en cámara frontal */
            onUserMedia={handleUserMedia}
            onUserMediaError={handleUserMediaError}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Frame congelado mientras se procesa */}
        {frozenSrc && (
          <img
            src={frozenSrc}
            alt="captura"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Flash overlay */}
        <div
          ref={flashRef}
          className="absolute inset-0 bg-white pointer-events-none z-20"
          style={{ opacity: 0, transition: "opacity 0.15s ease" }}
        />

        {/* Sprite en esquina */}
        {phase === "result" && result?.details?.sprite_url && (
          <img
            src={result.details.sprite_url}
            alt={result.pokemon_name}
            className="absolute top-2 right-2 w-16 h-16 object-contain z-10 drop-shadow-lg"
            style={{ imageRendering: "pixelated" }}
          />
        )}

        {/* Scan overlay */}
        {isScanning && (
          <div className="absolute inset-0 bg-black/40 z-10 flex flex-col items-center justify-center">
            <div
              className="absolute left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-cyan-400 to-transparent"
              style={{
                boxShadow: "0 0 10px #00ffcc",
                animation: "pokeScanLine 1.4s ease-in-out infinite",
              }}
            />
            <span
              className="z-10 font-bold text-cyan-400 text-sm tracking-widest uppercase"
              style={{
                textShadow: "0 0 10px #00ffcc",
                animation: "pokePulse 0.9s ease-in-out infinite",
              }}
            >
              ANALIZANDO...
            </span>
          </div>
        )}

        {/* Esquinas de retícula */}
        {(["tl", "tr", "bl", "br"] as const).map((pos) => (
          <div
            key={pos}
            className={cn(
              `absolute w-8 h-8 pointer-events-none z-10 ${isScanning ? "border-cyan-300" : "border-white/50"} `,
              pos.startsWith("t") &&
                `border-t-2 top-4 ${pos === "tl" ? "border-l-2 left-4" : "border-r-2 right-4"}`,
              pos.startsWith("b") &&
                `border-b-2 bottom-4 ${pos === "bl" ? "border-l-2 left-4" : "border-r-2 right-4"}`,
            )}
          />
        ))}

        {(["tl", "tr", "bl", "br"] as const).map((pos) => (
          <div
            key={pos}
            className={cn(
              `absolute w-8 h-8 pointer-events-none z-10 ${isScanning ? "border-cyan-300" : "border-white/50"} `,
              pos.startsWith("t") &&
                `border-t-2 top-1/4 ${pos === "tl" ? "border-l-2 left-1/4" : "border-r-2 right-1/4"}`,
              pos.startsWith("b") &&
                `border-b-2 bottom-1/4 ${pos === "bl" ? "border-l-2 left-1/4" : "border-r-2 right-1/4"}`,
            )}
          />
        ))}

        {camError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-red-950 z-10 bg-indigo-100">
            <span className="text-3xl">📷</span>
            <span className="text-sm font-bold text-center px-4">
              {camError}
            </span>
          </div>
        )}
      </div>

      {/* ── Panel de resultados ──────────────────────────────────── */}
      <div className="aspect-video bg-indigo-100 border-4 border-red-950 rounded-3xl mx-4 my-4 overflow-hidden flex flex-col justify-center p-4">
        {phase === "idle" && (
          <div className="flex flex-col items-center justify-center gap-1 text-red-950/30 h-full">
            <ScanLineIcon size={32} />
            <span className="text-sm font-bold tracking-widest uppercase">
              Apunta y escanea
            </span>
          </div>
        )}

        {isScanning && (
          <div className="flex flex-col items-center justify-center gap-2 h-full">
            <div className="w-8 h-8 border-4 border-red-950/20 border-t-red-950 rounded-full animate-spin" />
            <span className="text-sm font-bold text-red-950/50 tracking-widest uppercase animate-pulse">
              Identificando...
            </span>
          </div>
        )}

        {phase === "error" && (
          <div className="flex flex-col items-center justify-center gap-1 h-full text-red-700">
            <span className="text-3xl">⚠️</span>
            <span className="text-sm font-bold">
              No se identificó ningún Pokémon
            </span>
            <span className="text-xs text-red-950/40">
              Pulsa RETRY para intentarlo de nuevo
            </span>
          </div>
        )}

        {phase === "result" && result && (
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-red-950/40 mb-0.5">
                  Pokémon detectado
                </p>
                <p className="text-2xl font-black text-red-950 uppercase leading-tight">
                  {formatLabel(result.pokemon_name)}
                </p>
                {result.details?.types && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {result.details.types.map((t) => (
                      <span
                        key={t.slot}
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${TYPE_COLORS[t.name] ?? "bg-gray-300 text-gray-700"}`}
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wide bg-red-950/10 text-red-950/50 px-2 py-1 rounded-full whitespace-nowrap">
                {METHOD_LABELS[result.detection_method] ??
                  result.detection_method}
              </span>
            </div>

            <div>
              <div className="w-full bg-red-950/10 rounded-full h-2 overflow-hidden border border-red-950/10 mb-1">
                <div
                  ref={barRef}
                  className="h-full bg-red-600 rounded-full"
                  style={{ width: "0%", transition: "width 0.9s ease-out" }}
                />
              </div>
              <p className="text-xs font-bold text-red-950/50">
                {pct}% de confianza
              </p>
            </div>

            {result.details && (
              <div className="flex gap-2">
                {[
                  { label: "HP", value: result.details.stats.hp },
                  { label: "ATK", value: result.details.stats.attack },
                  { label: "DEF", value: result.details.stats.defense },
                  { label: "SPD", value: result.details.stats.speed },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex-1 bg-red-950/5 rounded-xl px-2 py-1 border border-red-950/10 text-center"
                  >
                    <p className="text-[10px] font-bold text-red-950/30 uppercase tracking-wider">
                      {label}
                    </p>
                    <p className="text-sm font-black text-red-950/70">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Botones ─────────────────────────────────────────────── */}
      <div className="flex mx-4 gap-4 justify-center">
        <button
          onClick={toggleTorch}
          disabled={isScanning}
          title={torchOn ? "Apagar flash" : "Encender flash"}
          className={`flex aspect-square rounded-xl items-center justify-center border-b-4 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-0.5 active:border-b-2 ${
            torchOn
              ? "border-yellow-600 bg-yellow-300 text-yellow-800 shadow-[0_0_14px_4px_rgba(250,204,21,0.5)]"
              : "border-amber-500 bg-amber-300 text-red-950"
          }`}
        >
          <FlashlightIcon className="stroke-3" />
        </button>
        <button
          onClick={handleScan}
          disabled={!camReady || isScanning}
          className="flex aspect-square rounded-xl px-4 py-2 border-b-4 border-amber-500 bg-amber-300 text-red-950 font-bold text-xl items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-0.5 active:border-b-2"
        >
          <ScanLineIcon className="stroke-3" />
        </button>
        <button
          onClick={toggleFacing}
          disabled={!camReady || isScanning}
          title="Cambiar cámara"
          className="flex aspect-square rounded-xl px-4 py-2 border-b-4 border-amber-500 bg-amber-300 text-red-950 font-bold text-xl items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-0.5 active:border-b-2"
        >
          <RefreshCwIcon className="stroke-3" />
        </button>
        <button
          title="Cerrar"
          className="flex aspect-square rounded-xl px-4 py-2 border-b-4 border-amber-500 bg-amber-300 text-red-950 font-bold text-xl items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-0.5 active:border-b-2"
        >
          <PowerIcon className="stroke-3" />
        </button>
      </div>

      <style>{`
        @keyframes pokeScanLine {
          0%   { top: 0%; }
          100% { top: 100%; }
        }
        @keyframes pokePulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
