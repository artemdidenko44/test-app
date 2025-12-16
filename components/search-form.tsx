"use client";

import * as React from "react";
import { Hotel, Earth, Building2, Search } from 'lucide-react';

import { useGeoCombobox } from "../hooks/use-geo-combobox";

import { Combobox } from "./ui/combobox/combobox";
import { ComboboxTrigger } from "./ui/combobox/combobox-trigger";
import { ComboboxContent } from "./ui/combobox/combobox-content";
import { ComboboxInput } from "./ui/combobox/combobox-input";
import { ComboboxOption } from "./ui/combobox/combobox-option";

import { List } from "./ui/list";
import { Button } from "./ui/button";

type GeoType = "country" | "city" | "hotel";

type GeoItem = {
  id: string;
  name: string;
  type: GeoType;
  countryId?: string;
};

type SelectedGeo = {
  readonly id: string;
  readonly type: GeoType;
  readonly countryId: string;
};

type SearchFormProps = {
  readonly onSearchTours?: (countryId: string) => void;
  readonly onSelectedGeoChange?: (geo: SelectedGeo | null) => void;
  readonly onSearchParamsChange?: (countryId: string | null) => void;
  readonly isSearchDisabled?: boolean;
};

export function SearchForm({ onSearchTours, onSelectedGeoChange, onSearchParamsChange, isSearchDisabled = false }: SearchFormProps) {
  const { items, inputValue, selectedItem, setInputValue, setSelectedItem, handleSearch, handleOpenChange } = useGeoCombobox();
  const formRef = React.useRef<HTMLFormElement | null>(null);
  return (
    <Combobox onOpenChange={handleOpenChange}>
      <form
        ref={formRef}
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const countryId: string | undefined = selectedItem?.countryId;
          if (!countryId) return;
          onSearchTours?.(countryId);
        }}
      >
        <ComboboxTrigger>
          <ComboboxInput
            placeholder="Країна, місто або готель"
            className="min-w-[280px]"
            onValueChange={(value) => {
              setInputValue(value);
              setSelectedItem(null);
              onSelectedGeoChange?.(null);
              onSearchParamsChange?.(null);
              handleSearch(value);
            }}
            onSubmit={(value) => {
              formRef.current?.requestSubmit();
            }}
          />
        </ComboboxTrigger>

        <Button
          type="submit"
          aria-label="Search"
          icon={<Search />}
          disabled={isSearchDisabled}
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
                if (!item.countryId) {
                  onSelectedGeoChange?.(null);
                  onSearchParamsChange?.(null);
                  return;
                }
                onSearchParamsChange?.(item.countryId);
                onSelectedGeoChange?.({ id: item.id, type: item.type, countryId: item.countryId });
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
