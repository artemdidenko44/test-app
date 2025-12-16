"use client";

import * as React from "react";

import { getCountries, getHotels, searchGeo } from "../app/api/api";

type GeoType = "country" | "city" | "hotel";

type GeoItem = {
  readonly id: string;
  readonly name: string;
  readonly type: GeoType;
  readonly countryId?: string;
};

type CountryDto = {
  readonly id: string;
  readonly name: string;
};

type HotelInfoDto = {
  readonly id: number | string;
  readonly cityId: number | string;
  readonly cityName: string;
  readonly name: string;
  readonly countryId: string;
};

type SearchGeoItemDto = {
  readonly id: number | string;
  readonly name: string;
  readonly type: GeoType;
  readonly countryId?: string;
};

type UseGeoComboboxResult = {
  readonly items: readonly GeoItem[];
  readonly inputValue: string;
  readonly selectedItem: GeoItem | null;
  readonly setInputValue: (value: string) => void;
  readonly setSelectedItem: (value: GeoItem | null) => void;
  readonly handleSearch: (value: string) => Promise<void>;
  readonly handleOpenChange: (open: boolean) => void;
};

export function useGeoCombobox(): UseGeoComboboxResult {
  const [inputValue, setInputValueState] = React.useState<string>("");
  const [items, setItems] = React.useState<readonly GeoItem[]>([]);
  const [selectedItem, setSelectedItemState] = React.useState<GeoItem | null>(null);
  const allHotelsCacheRef = React.useRef<readonly HotelInfoDto[] | null>(null);
  const allHotelsPromiseRef = React.useRef<Promise<readonly HotelInfoDto[]> | null>(null);
  const geoLoadIdRef = React.useRef<number>(0);
  const setInputValue = React.useCallback((value: string): void => {
    setInputValueState(value);
  }, []);
  const setSelectedItem = React.useCallback((value: GeoItem | null): void => {
    setSelectedItemState(value);
  }, []);
  const loadCountries = React.useCallback(async (): Promise<void> => {
    const res: Response = await getCountries();
    const data = (await res.json()) as Record<string, CountryDto>;
    const countries: readonly GeoItem[] = Object.values(data).map((c: CountryDto) => ({ id: c.id, name: c.name, type: "country", countryId: c.id }));
    setItems(countries);
  }, []);
  const ensureAllHotels = React.useCallback(async (): Promise<readonly HotelInfoDto[]> => {
    const cached: readonly HotelInfoDto[] | null = allHotelsCacheRef.current;
    if (cached) return cached;
    const inFlight: Promise<readonly HotelInfoDto[]> | null = allHotelsPromiseRef.current;
    if (inFlight) return inFlight;
    const promise: Promise<readonly HotelInfoDto[]> = (async (): Promise<readonly HotelInfoDto[]> => {
      const countriesResp: Response = await getCountries();
      const countriesData = (await countriesResp.json()) as Record<string, CountryDto>;
      const countryIds: readonly string[] = Object.values(countriesData).map((c: CountryDto) => c.id);
      const hotelsByCountry: readonly (readonly HotelInfoDto[])[] = await Promise.all(countryIds.map(async (countryId: string): Promise<readonly HotelInfoDto[]> => {
        const hotelsResp: Response = await getHotels(countryId);
        const hotelsData = (await hotelsResp.json()) as Record<string, HotelInfoDto>;
        return Object.values(hotelsData);
      }));
      const allHotels: readonly HotelInfoDto[] = hotelsByCountry.flatMap((chunk: readonly HotelInfoDto[]) => chunk);
      allHotelsCacheRef.current = allHotels;
      allHotelsPromiseRef.current = null;
      return allHotels;
    })();
    allHotelsPromiseRef.current = promise;
    return promise;
  }, []);
  const loadCitiesAll = React.useCallback(async (): Promise<void> => {
    const loadId: number = geoLoadIdRef.current + 1;
    geoLoadIdRef.current = loadId;
    try {
      const hotels: readonly HotelInfoDto[] = await ensureAllHotels();
      if (geoLoadIdRef.current !== loadId) return;
      const citiesIndex: Map<string, GeoItem> = new Map<string, GeoItem>();
      hotels.forEach((hotel: HotelInfoDto) => {
        const cityId: string = String(hotel.cityId);
        if (citiesIndex.has(cityId)) return;
        citiesIndex.set(cityId, { id: cityId, name: hotel.cityName, type: "city", countryId: hotel.countryId });
      });
      setItems(Array.from(citiesIndex.values()));
    } catch {
      if (geoLoadIdRef.current !== loadId) return;
      setItems([]);
    }
  }, [ensureAllHotels]);
  const loadHotelsAll = React.useCallback(async (): Promise<void> => {
    const loadId: number = geoLoadIdRef.current + 1;
    geoLoadIdRef.current = loadId;
    try {
      const hotels: readonly HotelInfoDto[] = await ensureAllHotels();
      if (geoLoadIdRef.current !== loadId) return;
      const hotelsItems: readonly GeoItem[] = hotels.map((h: HotelInfoDto) => ({ id: String(h.id), name: h.name, type: "hotel", countryId: h.countryId }));
      setItems(hotelsItems);
    } catch {
      if (geoLoadIdRef.current !== loadId) return;
      setItems([]);
    }
  }, [ensureAllHotels]);
  const handleSearch = React.useCallback(async (value: string): Promise<void> => {
    if (!value) {
      await loadCountries();
      return;
    }
    try {
      const res: Response = await searchGeo(value);
      const data = (await res.json()) as Record<string, SearchGeoItemDto>;
      const results: readonly GeoItem[] = Object.values(data).map((item: SearchGeoItemDto) => {
        const countryId: string | undefined = item.type === "country" ? String(item.id) : item.countryId;
        return { id: String(item.id), name: item.name, type: item.type, countryId };
      });
      setItems(results);
    } catch {
      setItems([]);
    }
  }, [loadCountries]);
  React.useEffect(() => {
    void loadCountries();
  }, [loadCountries]);
  const handleOpenChange = React.useCallback((open: boolean): void => {
    if (!open) return;
    if (!inputValue) {
      void loadCountries();
      return;
    }
    if (selectedItem?.type === "country") {
      void loadCountries();
      return;
    }
    if (selectedItem?.type === "city") {
      void loadCitiesAll();
      return;
    }
    if (selectedItem?.type === "hotel") {
      void loadHotelsAll();
      return;
    }
    void handleSearch(inputValue);
  }, [handleSearch, inputValue, loadCitiesAll, loadCountries, loadHotelsAll, selectedItem]);
  return { items, inputValue, selectedItem, setInputValue, setSelectedItem, handleSearch, handleOpenChange };
}
