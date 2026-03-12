import { useEffect, useRef, useState, useCallback } from "react";
import { IconBolt } from "@tabler/icons-react";
import {
  FlashlightIcon,
  FlashlightOffIcon,
  RefreshCwIcon,
  ScanLineIcon,
} from "lucide-react";

const API_URL =
  "https://pokemon-api-production-be3a.up.railway.app/identificar";

interface Prediction {
  label: string;
  score: number;
}

type Phase = "idle" | "scanning" | "result" | "error";

// `torch` no existe en los tipos estándar del navegador — se extienden
interface ExtendedCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
}
interface ExtendedConstraints extends MediaTrackConstraintSet {
  torch?: boolean;
}

function formatLabel(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1).replace(/-/g, " ");
}

export default function PokeScan() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const [isReady, setIsReady] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment",
  );
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [torchOk, setTorchOk] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [frozenSrc, setFrozenSrc] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [camError, setCamError] = useState<string | null>(null);

  // ── Detectar cuántas cámaras tiene el dispositivo ───────────────────────
  const detectCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === "videoinput");
      setHasMultipleCameras(videoInputs.length > 1);
    } catch {
      setHasMultipleCameras(false);
    }
  }, []);

  // ── Iniciar cámara ──────────────────────────────────────────────────────
  const startCamera = useCallback(
    async (facing: "environment" | "user") => {
      try {
        trackRef.current?.stop();
        setIsReady(false);
        setTorchOn(false);

        let stream: MediaStream;

        // Estrategia en cascada para máxima compatibilidad:
        // 1. Intenta con facingMode exacto
        // 2. Si falla, intenta sin restricción de facingMode
        // 3. Si falla, intenta con constraints mínimos (compatibilidad máxima)
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: facing }, // `ideal` en lugar de exacto — no falla si no está disponible
              width: { ideal: 1280 },
              height: { ideal: 960 },
            },
          });
        } catch {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
          } catch {
            stream = await navigator.mediaDevices.getUserMedia({ video: {} });
          }
        }

        const track = stream.getVideoTracks()[0];
        trackRef.current = track;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // `play()` puede fallar en Safari si no hay gesto del usuario
          // — se intenta silenciosamente, el atributo autoPlay del elemento lo retoma
          await videoRef.current.play().catch(() => {});
        }

        const caps = track.getCapabilities() as ExtendedCapabilities;
        setTorchOk(!!caps.torch);
        setIsReady(true);
        setCamError(null);

        // Redetectar cámaras después de obtener permisos
        // (antes del permiso enumerateDevices no devuelve labels)
        await detectCameras();
      } catch {
        setCamError(
          "Sin acceso a la cámara. Revisa los permisos del navegador.",
        );
      }
    },
    [detectCameras],
  );

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      trackRef.current?.stop();
    };
  }, []);

  // ── Toggle torch ────────────────────────────────────────────────────────
  const toggleTorch = async () => {
    if (!torchOk || !trackRef.current) return;
    const next = !torchOn;
    try {
      await trackRef.current.applyConstraints({
        advanced: [{ torch: next } as ExtendedConstraints],
      });
      setTorchOn(next);
    } catch {}
  };

  // ── Cambiar cámara (solo si hay más de una) ─────────────────────────────
  const toggleFacing = () => {
    const next: "environment" | "user" =
      facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    startCamera(next);
  };

  // ── Capturar + enviar a la API ──────────────────────────────────────────
  const handleScan = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !isReady) return;

    // Flash visual
    if (flashRef.current) {
      flashRef.current.style.opacity = "1";
      setTimeout(() => {
        if (flashRef.current) flashRef.current.style.opacity = "0";
      }, 200);
    }

    // Capturar frame (espejado si es cámara frontal)
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    setFrozenSrc(canvas.toDataURL("image/jpeg", 0.9));
    setPhase("scanning");
    setPredictions([]);

    canvas.toBlob(
      async (blob: Blob | null) => {
        if (!blob) {
          setPhase("error");
          return;
        }
        try {
          const form = new FormData();
          form.append("file", blob, "foto.jpg");

          const res = await fetch(API_URL, { method: "POST", body: form });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const data: { predicciones: Prediction[] } = await res.json();

          setPredictions(data.predicciones);
          setPhase("result");

          setTimeout(() => {
            if (barRef.current) {
              barRef.current.style.width = `${Math.round(data.predicciones[0].score * 100)}%`;
            }
          }, 80);
        } catch {
          setPhase("error");
        }
      },
      "image/jpeg",
      0.9,
    );
  };

  // ── Reintentar ──────────────────────────────────────────────────────────
  const handleRetry = () => {
    setFrozenSrc(null);
    setPredictions([]);
    setPhase("idle");
    if (barRef.current) barRef.current.style.width = "0%";
  };

  const isScanning = phase === "scanning";
  const showResult = phase === "result" || phase === "error";
  const top = predictions[0] as Prediction | undefined;
  const others = predictions.slice(1, 3);
  const pct = top ? Math.round(top.score * 100) : 0;

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
        ${isScanning && !showResult ? "animate-pulse shadow-[0_0_28px_10px_rgba(0,255,255,0.8),inset_0_2px_3px_rgba(255,255,255,0.7),inset_0_-3px_6px_rgba(0,150,150,0.5)]" : ""}
      `}
            >
              <span className="absolute top-[18%] left-[18%] w-[28%] h-[22%] rounded-full bg-white/40 blur-[1px]" />
            </span>
          )}
        </span>
        <span className="flex flex-1 items-center justify-center text-xl font-bold text-red-950">
          POKESCAN
        </span>
        <div className="flex justify-end gap-2">
          <span
            className={`h-1/3 aspect-square rounded-full transition-all duration-300 relative ${
              !isReady && camError
                ? "bg-red-400 shadow-[0_0_8px_2px_rgba(255,0,0,1),inset_0_1px_2px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(180,0,0,0.4)]"
                : "bg-red-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.05)]"
            }`}
          >
            <span className="absolute top-[20%] left-[20%] w-[30%] h-[25%] rounded-full bg-white/40 blur-[1px]" />
          </span>
          <span
            className={`h-1/3 aspect-square rounded-full transition-all duration-300 relative ${
              isScanning
                ? "bg-yellow-300 shadow-[0_0_10px_4px_rgba(250,204,21,0.6),inset_0_1px_2px_rgba(255,255,255,0.7),inset_0_-2px_4px_rgba(180,130,0,0.4)]"
                : "bg-amber-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.05)]"
            }`}
          >
            <span className="absolute top-[20%] left-[20%] w-[30%] h-[25%] rounded-full bg-white/40 blur-[1px]" />
          </span>
          <span
            className={`h-1/3 aspect-square rounded-full transition-all duration-300 relative ${
              isReady && !camError
                ? "bg-green-400 shadow-[0_0_8px_2px_rgba(0,255,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(0,100,0,0.4)]"
                : "bg-green-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.05)]"
            }`}
          >
            <span className="absolute top-[20%] left-[20%] w-[30%] h-[25%] rounded-full bg-white/40 blur-[1px]" />
          </span>
        </div>
      </div>

      {/* ── Viewfinder ──────────────────────────────────────────── */}
      <div className="relative aspect-square bg-indigo-100 border-4 border-red-950 rounded-3xl mx-4 mt-4 overflow-hidden">
        {/* 
          autoPlay  → necesario en Safari iOS para iniciar sin gesto 
          playsInline → evita que iOS abra el video en pantalla completa
          muted     → requerido para autoPlay en la mayoría de navegadores
        */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: frozenSrc ? 0 : 1,
            transform: facingMode === "user" ? "scaleX(-1)" : "none",
          }}
        />

        {frozenSrc && (
          <img
            src={frozenSrc}
            alt="captura"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Flash overlay */}
        <div
          ref={flashRef}
          className="absolute inset-0 bg-white pointer-events-none z-20"
          style={{ opacity: 0, transition: "opacity 0.15s ease" }}
        />

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
            className={`absolute w-6 h-6 pointer-events-none z-10 transition-[border-color] duration-300 ${
              pos === "tl"
                ? "top-3 left-3"
                : pos === "tr"
                  ? "top-3 right-3"
                  : pos === "bl"
                    ? "bottom-3 left-3"
                    : "bottom-3 right-3"
            }`}
            style={{
              borderColor: isScanning ? "#00ffcc" : "rgba(255,255,255,0.7)",
              borderStyle: "solid",
              borderWidth: 0,
              borderTopWidth: pos.startsWith("t") ? 2 : 0,
              borderBottomWidth: pos.startsWith("b") ? 2 : 0,
              borderLeftWidth: pos.endsWith("l") ? 2 : 0,
              borderRightWidth: pos.endsWith("r") ? 2 : 0,
            }}
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

      {/* ── Botones ─────────────────────────────────────────────── */}
      <div className="flex mx-4 mt-4 gap-4 justify-center">
        {/* Flash — oculto si el dispositivo no lo soporta (laptops, tablets sin torch) */}
        <button
          onClick={toggleTorch}
          disabled={!torchOk || isScanning}
          title={
            !torchOk
              ? "Flash no disponible en este dispositivo"
              : torchOn
                ? "Apagar flash"
                : "Encender flash"
          }
          className={`flex aspect-square rounded-full items-center justify-center border-b-4 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-0.5 active:border-b-2 ${
            torchOn
              ? "border-yellow-600 bg-yellow-300 text-yellow-800 shadow-[0_0_14px_4px_rgba(250,204,21,0.5)]"
              : "border-amber-500 bg-amber-300 text-red-950"
          }`}
        >
          {torchOn ? (
            <FlashlightOffIcon className="stroke-3" />
          ) : (
            <FlashlightIcon className="stroke-3" />
          )}
        </button>

        {/* Scan / Retry */}
        {showResult ? (
          <button
            onClick={handleRetry}
            className="flex rounded-xl px-4 py-2 border-b-4 border-amber-500 bg-amber-300 text-red-950 font-bold text-xl items-center gap-2 active:translate-y-0.5 active:border-b-2"
          >
            <RefreshCwIcon className="stroke-3" />
            RETRY
          </button>
        ) : (
          <button
            onClick={handleScan}
            disabled={!isReady || isScanning}
            className="flex rounded-xl px-4 py-2 border-b-4 border-amber-500 bg-amber-300 text-red-950 font-bold text-xl items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-0.5 active:border-b-2"
          >
            <ScanLineIcon
              className={`stroke-3 ${isScanning ? "animate-pulse" : ""}`}
            />
            {isScanning ? "..." : "SCAN"}
          </button>
        )}

        {/* 
          Cambiar cámara — deshabilitado si el dispositivo solo tiene una cámara.
          En laptops con webcam única este botón queda en opacity-40 con cursor not-allowed.
        */}
        <button
          onClick={toggleFacing}
          disabled={!isReady || isScanning || !hasMultipleCameras}
          title={
            !hasMultipleCameras
              ? "Este dispositivo solo tiene una cámara"
              : "Cambiar cámara"
          }
          className="flex aspect-square rounded-full px-4 py-2 border-b-4 border-amber-500 bg-amber-300 text-red-950 font-bold text-xl items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-0.5 active:border-b-2"
        >
          <RefreshCwIcon className="stroke-3" />
        </button>
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
            <span className="text-sm font-bold">Error de conexión</span>
            <span className="text-xs text-red-950/40">
              Pulsa RETRY para intentarlo de nuevo
            </span>
          </div>
        )}

        {phase === "result" && top && (
          <div className="flex flex-col h-full justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-red-950/40 mb-0.5">
                Pokémon detectado
              </p>
              <p className="text-2xl font-black text-red-950 uppercase leading-tight">
                {formatLabel(top.label)}
              </p>
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

            {others.length > 0 && (
              <div className="flex gap-2">
                {others.map((p, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-red-950/5 rounded-xl px-2 py-1 border border-red-950/10"
                  >
                    <p className="text-[10px] font-bold text-red-950/30 uppercase tracking-wider">
                      #{i + 2}
                    </p>
                    <p className="text-xs font-bold text-red-950/60 capitalize">
                      {formatLabel(p.label)}
                    </p>
                    <p className="text-[10px] text-red-950/40">
                      {Math.round(p.score * 100)}%
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
