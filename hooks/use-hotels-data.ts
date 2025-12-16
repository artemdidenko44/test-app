"use client";

import * as React from "react";
import { Wifi, Car, Shirt, Trophy, Droplets } from "lucide-react";

type Tour = {
  readonly hotelId: string;
};

type HotelInfoDto = {
  readonly id: number | string;
  readonly name: string;
  readonly img: string;
  readonly cityId: number | string;
  readonly cityName: string;
  readonly countryId: string;
  readonly countryName: string;
};

type ServiceValue = "yes" | "no" | "none";

type HotelServicesDto = {
  readonly wifi?: ServiceValue;
  readonly aquapark?: ServiceValue;
  readonly tennis_court?: ServiceValue;
  readonly laundry?: ServiceValue;
  readonly parking?: ServiceValue;
};

type HotelDetailsDto = {
  readonly services?: HotelServicesDto;
};

type UseHotelsDataResult = {
  readonly hotelsIndex: Record<string, HotelInfoDto> | null;
  readonly hotelDetailsById: ReadonlyMap<string, HotelDetailsDto>;
  readonly renderServiceIcons: (services?: HotelServicesDto) => React.ReactNode;
};

const EMPTY_HOTEL_DETAILS: HotelDetailsDto = {};

export function useHotelsData(tours: readonly Tour[], resultCountryId?: string | null): UseHotelsDataResult {
  const [hotelsIndex, setHotelsIndex] = React.useState<Record<string, HotelInfoDto> | null>(null);
  const hotelsIndexCacheRef = React.useRef<Map<string, Record<string, HotelInfoDto>>>(new Map());
  const hotelDetailsCacheRef = React.useRef<Map<string, HotelDetailsDto>>(new Map());
  const hotelDetailsLoadIdRef = React.useRef<number>(0);
  const [, bumpHotelDetailsVersion] = React.useState<number>(0);
  const toHotelIdParam = React.useCallback((hotelId: string): number | string => {
    const asNumber: number = Number(hotelId);
    if (Number.isNaN(asNumber)) return hotelId;
    return asNumber;
  }, []);
  const renderServiceIcons = React.useCallback((services?: HotelServicesDto): React.ReactNode => {
    const createIcon = ({ key, title, Icon, ariaLabel }: { readonly key: string; readonly title: string; readonly Icon: React.ComponentType<{ readonly className?: string; readonly "aria-label"?: string }>; readonly ariaLabel: string }): React.ReactElement => React.createElement("span", { key, title }, React.createElement(Icon, { className: "h-4 w-4", "aria-label": ariaLabel }));
    const icons: React.ReactNode[] = [];
    if (services?.wifi === "yes") icons.push(createIcon({ key: "wifi", title: "Wi‑Fi", Icon: Wifi, ariaLabel: "Wi‑Fi" }));
    if (services?.parking === "yes") icons.push(createIcon({ key: "parking", title: "Парковка", Icon: Car, ariaLabel: "Парковка" }));
    if (services?.laundry === "yes") icons.push(createIcon({ key: "laundry", title: "Пральня", Icon: Shirt, ariaLabel: "Пральня" }));
    if (services?.tennis_court === "yes") icons.push(createIcon({ key: "tennis", title: "Теніс", Icon: Trophy, ariaLabel: "Теніс" }));
    if (services?.aquapark && services.aquapark !== "none" && services.aquapark !== "no") icons.push(createIcon({ key: "aquapark", title: "Аквапарк", Icon: Droplets, ariaLabel: "Аквапарк" }));
    if (icons.length === 0) return null;
    return React.createElement("div", { className: "flex flex-wrap gap-2 text-muted-foreground" }, icons);
  }, []);
  React.useEffect(() => {
    const uniqueIds: readonly string[] = Array.from(new Set<string>(tours.map((t: Tour) => t.hotelId)));
    const missing: readonly string[] = uniqueIds.filter((id: string) => !hotelDetailsCacheRef.current.has(id));
    if (missing.length === 0) return;
    const loadId: number = hotelDetailsLoadIdRef.current + 1;
    hotelDetailsLoadIdRef.current = loadId;
    void (async (): Promise<void> => {
      try {
        const { getHotel } = await import("../app/api/api");
        await Promise.all(missing.map(async (hotelId: string): Promise<void> => {
          try {
            const resp: Response = await getHotel(toHotelIdParam(hotelId));
            const data = (await resp.json()) as HotelDetailsDto;
            hotelDetailsCacheRef.current.set(hotelId, data);
          } catch {
            hotelDetailsCacheRef.current.set(hotelId, EMPTY_HOTEL_DETAILS);
          }
        }));
        if (hotelDetailsLoadIdRef.current !== loadId) return;
        bumpHotelDetailsVersion((v: number) => v + 1);
      } catch {
        if (hotelDetailsLoadIdRef.current !== loadId) return;
        bumpHotelDetailsVersion((v: number) => v + 1);
      }
    })();
  }, [toHotelIdParam, tours]);
  React.useEffect(() => {
    if (!resultCountryId) return;
    const cached: Record<string, HotelInfoDto> | undefined = hotelsIndexCacheRef.current.get(resultCountryId);
    if (cached) {
      setHotelsIndex(cached);
      return;
    }
    void (async (): Promise<void> => {
      try {
        const { getHotels } = await import("../app/api/api");
        const resp: Response = await getHotels(resultCountryId);
        const data = (await resp.json()) as Record<string, HotelInfoDto>;
        hotelsIndexCacheRef.current.set(resultCountryId, data);
        setHotelsIndex(data);
      } catch {
        setHotelsIndex(null);
      }
    })();
  }, [resultCountryId]);
  const hotelDetailsById: ReadonlyMap<string, HotelDetailsDto> = hotelDetailsCacheRef.current;
  return { hotelsIndex, hotelDetailsById, renderServiceIcons };
}
