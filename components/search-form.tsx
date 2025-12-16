"use client";

import * as React from "react";
import { Hotel, Earth, Building2, Search } from 'lucide-react';

import { Combobox } from "./ui/combobox/combobox";
import { ComboboxTrigger } from "./ui/combobox/combobox-trigger";
import { ComboboxContent } from "./ui/combobox/combobox-content";
import { ComboboxInput } from "./ui/combobox/combobox-input";
import { ComboboxOption } from "./ui/combobox/combobox-option";

import { List } from "./ui/list";
import { Button } from "./ui/button";

import {
  getCountries,
  getCities,
  getHotelsAll,
  searchGeo,
} from "../app/api/api"; // mock api entry

type GeoType = "country" | "city" | "hotel";

type GeoItem = {
  id: string;
  name: string;
  type: GeoType;
};

type CountryDto = {
  readonly id: string;
  readonly name: string;
};

type CityDto = {
  readonly id: number | string;
  readonly name: string;
};

type HotelDto = {
  readonly id: number | string;
  readonly name: string;
};

export function SearchForm() {
  const [inputValue, setInputValue] = React.useState("");
  const [items, setItems] = React.useState<GeoItem[]>([]);
  const [selectedItem, setSelectedItem] = React.useState<GeoItem | null>(null);

  const loadCountries = React.useCallback(async () => {
    const res = await getCountries();
    const data = (await res.json()) as Record<string, CountryDto>;
    const countries: GeoItem[] = Object.values(data).map((c: CountryDto) => ({
      id: c.id,
      name: c.name,
      type: "country",
    }));

    setItems(countries);
  }, []);

  const loadCities = React.useCallback(async () => {
    const res = await getCities();
    const data = (await res.json()) as Record<string, CityDto>;
    const cities: GeoItem[] = Object.values(data).map((c: CityDto) => ({
      id: String(c.id),
      name: c.name,
      type: "city",
    }));
    setItems(cities);
  }, []);

  const loadHotels = React.useCallback(async () => {
    const res = await getHotelsAll();
    const data = (await res.json()) as Record<string, HotelDto>;
    const hotels: GeoItem[] = Object.values(data).map((h: HotelDto) => ({
      id: String(h.id),
      name: h.name,
      type: "hotel",
    }));
    setItems(hotels);
  }, []);

  const handleSearch = React.useCallback(
    async (value: string) => {
      if (!value) {
        loadCountries();
        return;
      }

      try {
        const res = await searchGeo(value);
        const data = await res.json();

        const results: GeoItem[] = Object.values(data).map(
          (item: any) => ({
            id: item.id,
            name: item.name,
            type: item.type,
          })
        );

        setItems(results);
      } catch {
        setItems([]);
      }
    },
    [loadCountries]
  );

  React.useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  const handleComboboxOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) return;
      if (!inputValue) {
        loadCountries();
        return;
      }
      if (selectedItem?.type === "country") {
        loadCountries();
        return;
      }
      if (selectedItem?.type === "city") {
        loadCities();
        return;
      }
      if (selectedItem?.type === "hotel") {
        loadHotels();
        return;
      }
      handleSearch(inputValue);
    },
    [handleSearch, inputValue, loadCities, loadCountries, loadHotels, selectedItem]
  );

  return (
    <Combobox onOpenChange={handleComboboxOpenChange}>
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          console.log("Search submit:", inputValue);
        }}
      >
        <ComboboxTrigger>
          <ComboboxInput
            placeholder="Країна, місто або готель"
            className="min-w-[280px]"
            onValueChange={(value) => {
              setInputValue(value);
              setSelectedItem(null);
              handleSearch(value);
            }}
            onSubmit={(value) => {
              console.log("Search submit:", value);
            }}
          />
        </ComboboxTrigger>

        <Button
          type="submit"
          aria-label="Search"
          icon={<Search />}
        />
      </form>

      <ComboboxContent>
        <List empty={items.length === 0}>
          {items.map((item) => (
            <ComboboxOption
              key={item.id}
              value={item.id}
              displayValue={item.name}
              onSelect={() => {
                setSelectedItem(item);
                setInputValue(item.name);
              }}
            >
              <span className="flex items-center gap-2">
                <span>
                  {item.type === "country" && <Earth />}
                  {item.type === "city" && <Building2 />}
                  {item.type === "hotel" && <Hotel />}
                </span>
                <span>{item.name}</span>
              </span>
            </ComboboxOption>
          ))}
        </List>
      </ComboboxContent>
    </Combobox>
  );
}
