import { useRef } from "react";

export function useElementRefs<T extends { id: string }>() {
  const mapRef = useRef<Map<string, HTMLElement | null>>(new Map());

  const setRef = (id: string) => (el: HTMLElement | null) => {
    mapRef.current.set(id, el);
  };

  const getRect = (id: string): DOMRect | null => {
    const el = mapRef.current.get(id);
    return el?.getBoundingClientRect() ?? null;
  };

  return { setRef, getRect, refs: mapRef.current };
}
