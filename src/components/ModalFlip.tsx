import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  motion,
  type Transition,
  type Variants,
} from "framer-motion";
import { useEffect, useMemo, useState, type ReactNode } from "react";

interface Props {
  productId: string;
  faceA: ReactNode;
  faceB: ReactNode;
  originRect: DOMRect | null;
  animate: "open" | "close";
  setAnimate: React.Dispatch<React.SetStateAction<"open" | "close">>;
  onClose: () => void;
}

export default function ModalFlip({
  productId,
  faceA,
  faceB,
  originRect,
  animate,
  setAnimate,
  onClose,
}: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (animate === "close") setIsOpen(false);
  }, [animate]);

  // ─── Bloquear scroll del body ─────────────────────────────────────────────
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.classList.add("overflow-hidden");
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.classList.remove("overflow-hidden");
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  // ─── Historial del browser → soporte botón "Atrás" ───────────────────────
  useEffect(() => {
    const hash = `#product=${productId}`;
    window.history.pushState(
      { modal: true },
      "",
      `${window.location.pathname}${window.location.search}${hash}`,
    );

    const handlePopState = () => setAnimate("close");
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [productId, setAnimate]);

  // ─── Rect de destino en px numéricos puros ────────────────────────────────
  const targetRect = useMemo(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(vw * 0.85, 380);
    const height = Math.min(vh * 0.85, width * 1.55);
    return {
      x: (vw - width) / 2,
      y: (vh - height) / 2,
      width,
      height,
    };
  }, []);

  if (!originRect) return null;

  const spring: Transition = { type: "spring", damping: 15 };

  const flipVariants: Variants = {
    initial: {
      x: animate === "open" ? originRect.left : targetRect.x,
      y: animate === "open" ? originRect.top : targetRect.y,
      width: animate === "open" ? originRect.width : targetRect.width,
      height: animate === "open" ? originRect.height : targetRect.height,
      rotateY: animate === "open" ? 0 : 180,
    },
    open: {
      x: targetRect.x,
      y: targetRect.y,
      width: targetRect.width,
      height: targetRect.height,
      rotateY: 180,
    },
    close: {
      x: originRect.left,
      y: originRect.top,
      width: originRect.width,
      height: originRect.height,
      rotateY: 0,
    },
  };

  const handleAnimationComplete = (def: string) => {
    if (def === "open") {
      setIsOpen(true);
    }
    if (def === "close") {
      if (window.location.hash.includes(`product=${productId}`)) {
        window.history.back();
      }
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50" initial={false} exit="close">
        {/* ── Backdrop fullscreen ──────────────────────────────────────────── */}
        <motion.div
          className="absolute inset-0 bg-background/90 backdrop-blur-xs"
          initial={{ opacity: animate === "open" ? 0 : 1 }}
          animate={{ opacity: animate === "open" ? 1 : 0 }}
          exit={{ opacity: animate === "open" ? 0 : 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={() => setAnimate("close")}
        />

        {/* ── Contenedor del flip ───────────────────────────────────────────── */}
        <motion.div
          className="absolute transform-3d will-change-transform pointer-events-auto perspective-distant"
          variants={flipVariants}
          initial="initial"
          animate={animate}
          transition={spring}
          onAnimationComplete={handleAnimationComplete}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Face A: carta original ─────────────────────────────────────── */}
          <div className="absolute inset-0 backface-hidden">{faceA}</div>

          {/* ── Face B: carta expandida ────────────────────────────────────── */}
          <div className="absolute inset-0 rotate-y-180 backface-hidden">
            {faceB}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
