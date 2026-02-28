import { IconBolt } from "@tabler/icons-react";
import { RefreshCwIcon, ScanLineIcon } from "lucide-react";

export default function PokeScan() {
  return (
    <div className="h-dvh w-full bg-red-500 border-4 border-red-950">
      <div className="flex flex-1 gap-4 h-20 border-4 border-r-4 border-red-950 rounded-br-full -mx-1 -mt-1 px-4 py-2">
        <div className="h-full bg-blue-300 aspect-square rounded-full border-6 border-neutral-400" />
        <span className="flex flex-1 items-center justify-center text-xl font-bold text-red-950">
          POKESCAN
        </span>
        <div className="flex justify-end gap-1">
          <div className="h-1/3 bg-red-700 aspect-square rounded-full" />
          <div className="h-1/3 bg-amber-600 aspect-square rounded-full" />
          <div className="h-1/3 bg-green-700 aspect-square rounded-full" />
        </div>
      </div>
      <div className="aspect-square bg-indigo-100 border-4 border-red-950 rounded-4xl m-4">
        {/* imagen de la camara */}
      </div>
      <div className="flex mx-4 gap-4 justify-center">
        <button className="flex aspect-square rounded-full px-4 py-2 border-b-4 border-amber-500 bg-amber-300 text-red-950 font-bold text-xl items-center gap-2">
          <IconBolt className="stroke-3" />
          {/* logica del flash */}
        </button>
        <button className="flex rounded-xl px-4 py-2 border-b-4 border-amber-500 bg-amber-300 text-red-950 font-bold text-xl items-center gap-2">
          <ScanLineIcon className="stroke-3" />
          SCAN
          {/* logica del scan */}
        </button>
        <button className="flex aspect-square rounded-full px-4 py-2 border-b-4 border-amber-500 bg-amber-300 text-red-950 font-bold text-xl items-center gap-2">
          <RefreshCwIcon className="stroke-3" />
          {/* logica de usar la camara frontal o tracera en dispositivos moviles */}
        </button>
      </div>
      <div className="aspect-video bg-indigo-100 border-4 border-red-950 rounded-4xl m-4">
        {/* resultado del analisis */}
      </div>
    </div>
  );
}
