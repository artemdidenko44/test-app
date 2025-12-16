"use client";

import * as React from "react";

type GeoType = "country" | "city" | "hotel";

type SelectedGeo = {
  readonly id: string;
  readonly type: GeoType;
  readonly countryId: string;
};

type Tour = {
  readonly id: string;
  readonly hotelId: string;
  readonly priceText: string;
  readonly dateText: string;
};

type SearchStatus = "idle" | "loading" | "success" | "error";

type HotelDto = {
  readonly id: number | string;
  readonly cityId: number | string;
};

type UseFilteredToursResult = {
  readonly filteredTours: readonly Tour[];
  readonly isEmptyResult: boolean;
  readonly isCityFilterLoading: boolean;
  readonly onDraftGeoChange: (geo: SelectedGeo | null) => void;
  readonly onSearchConfirm: (countryId: string) => void;
};

export function useFilteredTours(tours: readonly Tour[], status: SearchStatus, resultCountryId?: string | null): UseFilteredToursResult {
  const [draftGeo, setDraftGeo] = React.useState<SelectedGeo | null>(null);
  const [appliedGeo, setAppliedGeo] = React.useState<SelectedGeo | null>(null);
  const [pendingGeo, setPendingGeo] = React.useState<SelectedGeo | null>(null);
  const [hotelIdsForCity, setHotelIdsForCity] = React.useState<readonly string[] | null>(null);
  const hotelsLoadIdRef = React.useRef<number>(0);
  const onDraftGeoChange = React.useCallback((geo: SelectedGeo | null): void => {
    setDraftGeo(geo);
  }, []);
  const onSearchConfirm = React.useCallback((countryId: string): void => {
    const nextPendingGeo: SelectedGeo | null = draftGeo && draftGeo.countryId === countryId ? draftGeo : appliedGeo;
    if (nextPendingGeo) setPendingGeo(nextPendingGeo);
  }, [appliedGeo, draftGeo]);
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
    if (status === "error") setPendingGeo(null);
  }, [pendingGeo, resultCountryId, status]);
  const filteredTours: readonly Tour[] = React.useMemo((): readonly Tour[] => {
    if (!appliedGeo) return tours;
    if (appliedGeo.type === "hotel") return tours.filter((t: Tour) => t.hotelId === appliedGeo.id);
    if (appliedGeo.type === "city") {
      if (hotelIdsForCity === null) return [];
      const allowed: ReadonlySet<string> = new Set<string>(hotelIdsForCity);
      return tours.filter((t: Tour) => allowed.has(t.hotelId));
    }
    return tours;
  }, [appliedGeo, hotelIdsForCity, tours]);
  const isCityFilterLoading: boolean = Boolean(appliedGeo && appliedGeo.type === "city" && hotelIdsForCity === null);
  const isEmptyResult: boolean = status === "success" && !isCityFilterLoading && filteredTours.length === 0;
  return { filteredTours, isEmptyResult, isCityFilterLoading, onDraftGeoChange, onSearchConfirm };
}
