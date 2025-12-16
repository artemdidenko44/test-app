"use client";

import Image from "next/image";
import * as React from "react";

import { Header } from "./header";
import { SearchForm } from "./search-form";
import { Card } from "./ui/card";
import { useSearchTours } from "../hooks/use-search-tours";

import { useFilteredTours } from "../hooks/use-filtered-tours";
import { useHotelsData } from "../hooks/use-hotels-data";

type TourViewModel = {
  readonly id: string;
  readonly hotelId: string;
  readonly priceText: string;
  readonly dateText: string;
};

export const HomeClient = () => {
  const { status, tours, resultCountryId, error, isSearchDisabled, onSearchParamsChange, searchTours } = useSearchTours();
  const toursViewModels: readonly TourViewModel[] = tours;
  const { filteredTours, isEmptyResult, onDraftGeoChange, onSearchConfirm } = useFilteredTours(toursViewModels, status, resultCountryId);
  const hotelsCountryIdParam: string | null = status === "success" ? resultCountryId : null;
  const { hotelsIndex, hotelDetailsById, renderServiceIcons } = useHotelsData(filteredTours, hotelsCountryIdParam);
  const handleSearchTours = React.useCallback((countryId: string): void => {
    onSearchConfirm(countryId);
    searchTours(countryId);
  }, [onSearchConfirm, searchTours]);
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
        actions={<SearchForm onSearchTours={handleSearchTours} onSelectedGeoChange={onDraftGeoChange} onSearchParamsChange={onSearchParamsChange} isSearchDisabled={isSearchDisabled} />}
      />
      <main className="mx-auto max-w-7xl px-4 py-8">
        {status === "loading" && (
          <div className="mb-4 text-sm text-muted-foreground">Завантаження...</div>
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
          <div className="mx-auto grid w-full max-w-[500px] grid-cols-1 gap-4 sm:grid-cols-[repeat(2,minmax(250px,1fr))]">
            {filteredTours.map((tour, index) => {
              const hotel = hotelsIndex?.[tour.hotelId] ?? null;
              const hotelDetails = hotelDetailsById.get(tour.hotelId);
              const services = hotelDetails?.services;
              const isWideCard: boolean = index === 0;
              const cardClassName: string = isWideCard ? "sm:col-span-2" : "";
              const imageSrc: string | undefined = hotel?.img;
              const imageAlt: string = hotel?.name ?? `Hotel ${tour.hotelId}`;
              const hotelName: string = hotel?.name ?? `Hotel ${tour.hotelId}`;
              const countryName: string = hotel?.countryName ?? "—";
              const cityName: string = hotel?.cityName ?? "—";
              return (
                <Card key={tour.id} imageSrc={imageSrc} imageAlt={imageAlt} className={cardClassName}>
                  <div className="text-base font-semibold leading-tight">{hotelName}</div>
                  <div className="text-sm text-muted-foreground">{countryName} · {cityName}</div>
                  {renderServiceIcons(services)}
                  <div className="text-sm">{tour.dateText}</div>
                  <div className="text-lg font-semibold">{tour.priceText}</div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
