import { useEffect, useState } from "react";
import { loadFacilities, FACILITIES_KEY, type Facility } from "@/lib/hospitals";

export function useFacilities(): Facility[] {
  const [list, setList] = useState<Facility[]>([]);

  useEffect(() => {
    setList(loadFacilities());
    const refresh = () => setList(loadFacilities());
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<Facility[]>).detail;
      if (Array.isArray(detail)) setList(detail);
      else refresh();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === FACILITIES_KEY) refresh();
    };
    window.addEventListener("nivaranai:facilities", onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("nivaranai:facilities", onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return list;
}
