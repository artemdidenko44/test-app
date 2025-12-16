"use client";

import * as React from "react";

type Status = "idle" | "loading" | "success" | "error";

type StartSearchResponseDto = {
  readonly token: string;
  readonly waitUntil?: string;
  readonly delay?: number;
};

type PendingResponseDto = {
  readonly code?: number;
  readonly error?: boolean;
  readonly message?: string;
  readonly waitUntil?: string;
  readonly delay?: number;
  readonly status?: "pending";
};

type TourDto = {
  readonly id: string;
  readonly amount: number;
  readonly currency: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly hotelID: number | string;
};

type TourViewModel = {
  readonly id: string;
  readonly hotelId: string;
  readonly priceText: string;
  readonly dateText: string;
};

type DoneResponseDto = {
  readonly status?: "done";
  readonly prices: Record<string, TourDto>;
};

type PollResponseDto = PendingResponseDto | DoneResponseDto;

type UseSearchToursResult = {
  readonly status: Status;
  readonly tours: readonly TourViewModel[];
  readonly resultCountryId: string | null;
  readonly error?: string;
  readonly searchTours: (countryId: string) => void;
};

const DEFAULT_DELAY_MS = 1000;
const MAX_RETRIES = 2;

const isResponse = (value: unknown): value is Response => value instanceof Response;

const getDelayMs = ({ delay, waitUntil }: { readonly delay?: number; readonly waitUntil?: string }): number => {
  if (typeof delay === "number" && Number.isFinite(delay)) return Math.max(0, delay);
  if (!waitUntil) return DEFAULT_DELAY_MS;
  const ts: number = Date.parse(waitUntil);
  if (Number.isNaN(ts)) return DEFAULT_DELAY_MS;
  const diff: number = ts - Date.now();
  if (diff <= 0) return 0;
  return diff;
};

const getErrorMessage = (value: unknown): string => {
  if (value instanceof Error) return value.message;
  if (typeof value === "string") return value;
  return "Unexpected error";
};

type CachedSearchResult = {
  readonly countryId: string;
  readonly toursRaw: readonly TourDto[];
};

const mapTourDtoToViewModel = (tour: TourDto): TourViewModel => {
  const hotelId: string = String(tour.hotelID);
  const priceText: string = `${tour.amount} ${tour.currency.toUpperCase()}`;
  const dateText: string = `${tour.startDate} - ${tour.endDate}`;
  return { id: tour.id, hotelId, priceText, dateText };
};

const selectToursViewModels = (toursRaw: readonly TourDto[]): readonly TourViewModel[] => toursRaw.map(mapTourDtoToViewModel);

export const useSearchTours = (): UseSearchToursResult => {
  const [status, setStatus] = React.useState<Status>("idle");
  const [toursRaw, setToursRaw] = React.useState<readonly TourDto[]>([]);
  const [cachedSearchResult, setCachedSearchResult] = React.useState<CachedSearchResult | null>(null);
  const [resultCountryId, setResultCountryId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const sessionIdRef = React.useRef<number>(0);
  const tokenRef = React.useRef<string | null>(null);
  const timeoutIdRef = React.useRef<number | null>(null);
  const activeCountryIdRef = React.useRef<string | null>(null);
  const tours: readonly TourViewModel[] = React.useMemo(() => selectToursViewModels(toursRaw), [toursRaw]);

  const cancelPolling = React.useCallback((): void => {
    if (timeoutIdRef.current === null) return;
    window.clearTimeout(timeoutIdRef.current);
    timeoutIdRef.current = null;
  }, []);

  React.useEffect(() => {
    return () => {
      cancelPolling();
      sessionIdRef.current += 1;
      tokenRef.current = null;
    };
  }, [cancelPolling]);

  const schedule = React.useCallback(
    ({ delayMs, run }: { readonly delayMs: number; readonly run: () => void }): void => {
      cancelPolling();
      timeoutIdRef.current = window.setTimeout(run, delayMs);
    },
    [cancelPolling]
  );

  const pollToken = React.useCallback(
    async ({ token, sessionId, delayMs, retries, countryId }: { readonly token: string; readonly sessionId: number; readonly delayMs: number; readonly retries: number; readonly countryId: string }): Promise<void> => {
      if (tokenRef.current !== token) return;
      if (sessionIdRef.current !== sessionId) return;
      try {
        const { getSearchPrices } = await import("../app/api/api");
        const resp: Response = await getSearchPrices(token);
        if (tokenRef.current !== token) return;
        if (sessionIdRef.current !== sessionId) return;
        const data = (await resp.json()) as PollResponseDto;
        const donePrices: Record<string, TourDto> | undefined = (data as DoneResponseDto).prices;
        if ((data as PendingResponseDto).status === "pending") {
          const nextDelayMs: number = getDelayMs({ delay: (data as PendingResponseDto).delay, waitUntil: (data as PendingResponseDto).waitUntil }) || delayMs;
          schedule({ delayMs: nextDelayMs, run: () => { void pollToken({ token, sessionId, delayMs: nextDelayMs, retries: 0, countryId }); } });
          return;
        }
        const nextToursRaw: readonly TourDto[] = Object.values(donePrices ?? {});
        setToursRaw(nextToursRaw);
        setCachedSearchResult({ countryId, toursRaw: nextToursRaw });
        setResultCountryId(countryId);
        setStatus("success");
        setError(undefined);
      } catch (err: unknown) {
        if (tokenRef.current !== token) return;
        if (sessionIdRef.current !== sessionId) return;
        if (isResponse(err) && err.status === 425) {
          const body = (await err.json().catch(() => null)) as PendingResponseDto | null;
          const nextDelayMs: number = getDelayMs({ delay: body?.delay, waitUntil: body?.waitUntil }) || delayMs;
          schedule({ delayMs: nextDelayMs, run: () => { void pollToken({ token, sessionId, delayMs: nextDelayMs, retries: 0, countryId }); } });
          return;
        }
        const nextRetries: number = retries + 1;
        if (nextRetries >= MAX_RETRIES) {
          setStatus("error");
          setError(isResponse(err) ? `HTTP ${err.status}` : getErrorMessage(err));
          return;
        }
        schedule({ delayMs, run: () => { void pollToken({ token, sessionId, delayMs, retries: nextRetries, countryId }); } });
      }
    },
    [schedule]
  );

  const searchTours = React.useCallback(
    (countryId: string): void => {
      if (cachedSearchResult?.countryId === countryId) {
        cancelPolling();
        sessionIdRef.current += 1;
        tokenRef.current = null;
        setToursRaw(cachedSearchResult.toursRaw);
        setResultCountryId(countryId);
        setStatus("success");
        setError(undefined);
        activeCountryIdRef.current = countryId;
        return;
      }
      if (status === "loading" && activeCountryIdRef.current === countryId) return;
      const sessionId: number = sessionIdRef.current + 1;
      sessionIdRef.current = sessionId;
      tokenRef.current = null;
      cancelPolling();
      setStatus("loading");
      setError(undefined);
      activeCountryIdRef.current = countryId;
      void (async (): Promise<void> => {
        try {
          const { startSearchPrices } = await import("../app/api/api");
          const resp: Response = await startSearchPrices(countryId);
          if (sessionIdRef.current !== sessionId) return;
          const data = (await resp.json()) as StartSearchResponseDto;
          const token: string = data.token;
          const delayMs: number = getDelayMs({ delay: data.delay, waitUntil: data.waitUntil });
          tokenRef.current = token;
          schedule({ delayMs, run: () => { void pollToken({ token, sessionId, delayMs, retries: 0, countryId }); } });
        } catch (err: unknown) {
          if (sessionIdRef.current !== sessionId) return;
          setStatus("error");
          setError(getErrorMessage(err));
        }
      })();
    },
    [cachedSearchResult, cancelPolling, pollToken, schedule, status]
  );
  return { status, tours, resultCountryId, error, searchTours };
};
