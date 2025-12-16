"use client";

import Image from "next/image";
import * as React from "react";

import { Header } from "./header";
import { SearchForm } from "./search-form";
import { useSearchTours } from "../hooks/use-search-tours";

type GeoType = "country" | "city" | "hotel";

type SelectedGeo = {
  readonly id: string;
  readonly type: GeoType;
  readonly countryId: string;
};

type HotelDto = {
  readonly id: number | string;
  readonly cityId: number | string;
};

export const HomeClient = () => {
  const { status, tours, resultCountryId, error, searchTours } = useSearchTours();
  const [draftGeo, setDraftGeo] = React.useState<SelectedGeo | null>(null);
  const [appliedGeo, setAppliedGeo] = React.useState<SelectedGeo | null>(null);
  const [pendingGeo, setPendingGeo] = React.useState<SelectedGeo | null>(null);
  const [hotelIdsForCity, setHotelIdsForCity] = React.useState<readonly string[] | null>(null);
  const hotelsLoadIdRef = React.useRef<number>(0);
  const loadHotelsForCity = React.useCallback(async ({ countryId, cityId }: { readonly countryId: string; readonly cityId: string }): Promise<void> => {
    const loadId: number = hotelsLoadIdRef.current + 1;
    hotelsLoadIdRef.current = loadId;
    const { getHotels } = await import("../app/api/api");
    const res: Response = await getHotels(countryId);
    const data = (await res.json()) as Record<string, HotelDto>;
    const ids: readonly string[] = Object.values(data)
      .filter((h: HotelDto) => String(h.cityId) === cityId)
      .map((h: HotelDto) => String(h.id));
    if (hotelsLoadIdRef.current !== loadId) return;
    setHotelIdsForCity(ids);
  }, []);
  React.useEffect(() => {
    if (!appliedGeo) return;
    if (appliedGeo.type === "city") {
      setHotelIdsForCity(null);
      void loadHotelsForCity({ countryId: appliedGeo.countryId, cityId: appliedGeo.id });
      return;
    }
    setHotelIdsForCity(null);
  }, [appliedGeo, loadHotelsForCity]);
  React.useEffect(() => {
    if (!pendingGeo) return;
    if (status === "loading") return;
    if (status === "success" && resultCountryId === pendingGeo.countryId) {
      setAppliedGeo(pendingGeo);
      setPendingGeo(null);
      return;
    }
    if (status === "error") {
      setPendingGeo(null);
    }
  }, [pendingGeo, resultCountryId, status]);
  const filteredTours = React.useMemo(() => {
    if (!appliedGeo) return tours;
    if (appliedGeo.type === "hotel") {
      return tours.filter((t) => t.hotelId === appliedGeo.id);
    }
    if (appliedGeo.type === "city") {
      if (hotelIdsForCity === null) return [];
      const allowed = new Set<string>(hotelIdsForCity);
      return tours.filter((t) => allowed.has(t.hotelId));
    }
    return tours;
  }, [appliedGeo, hotelIdsForCity, tours]);
  const isCityFilterLoading: boolean = Boolean(appliedGeo && appliedGeo.type === "city" && hotelIdsForCity === null);
  const isEmptyResult: boolean = status === "success" && !isCityFilterLoading && filteredTours.length === 0;
  const handleSearchTours = React.useCallback((countryId: string): void => {
    const nextPendingGeo: SelectedGeo | null = draftGeo && draftGeo.countryId === countryId ? draftGeo : appliedGeo;
    if (nextPendingGeo) setPendingGeo(nextPendingGeo);
    searchTours(countryId);
  }, [appliedGeo, draftGeo, searchTours]);
  return (
    <div className="min-h-screen bg-background">
      <Header
        logo={(
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Image
              src="/vercel.svg"
              alt="TestApp logo"
              width={20}
              height={20}
            />
            <span>TestApp</span>
          </div>
        )}
        actions={<SearchForm onSearchTours={handleSearchTours} onSelectedGeoChange={setDraftGeo} />}
      />
      <main className="mx-auto max-w-7xl px-4 py-8">
        {status === "loading" && (
          <div className="mb-4 text-sm text-muted-foreground">Завантаження...</div>
        )}
        {status === "success" && isCityFilterLoading && (
          <div className="mb-4 text-sm text-muted-foreground">Фільтруємо за містом...</div>
        )}
        {status === "error" && (
          <div className="mb-4 text-sm text-red-500">{error ?? "Помилка"}</div>
        )}
        {isEmptyResult ? (
          <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
            <span>За вашим запитом турів не знайдено</span>
          </div>
        ) : filteredTours.length === 0 ? (
          <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
            <span>Немає доступних турів</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTours.map((tour) => (
              <div key={tour.id} className="rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]">
                <div className="text-sm text-muted-foreground">Hotel ID: {tour.hotelId}</div>
                <div className="mt-2 text-lg font-semibold">{tour.priceText}</div>
                <div className="mt-2 text-sm">{tour.dateText}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
