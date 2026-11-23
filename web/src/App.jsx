import { useEffect, useMemo, useRef, useState } from "react";
import AuthPage from "./AuthPage";
import StoreDetailPage from "./StoreDetailPage";
import SiteHeader from "./SiteHeader";
import ReservationPage from "./ReservationPage";
import ReservationListPage from "./ReservationListPage";
import OwnerReservationPage from "./OwnerReservationPage";
import { apiRequest } from "./api";
import { mapStore } from "./storeData";

const priceRanges = [
  { key: "under-20000", label: "2만원 미만", min: 0, max: 20000 },
  { key: "20000-39999", label: "2~4만원", min: 20000, max: 40000 },
  { key: "40000-59999", label: "4~6만원", min: 40000, max: 60000 },
  { key: "over-60000", label: "6만원 이상", min: 60000, max: Infinity }
];

const filters = [
  { key: "available-now", label: "예약 접수 중" }
];

const sortOptions = [
  { key: "recommended", label: "추천순" },
  { key: "price-low", label: "가격 낮은 순" },
  { key: "price-high", label: "가격 높은 순" }
];

const partySizes = [1, 2, 3, 4, 5, 6];

const highlightBullets = [
  "지역별로 발견하기",
  "음식 취향으로 좁히기",
  "예산에 맞춰 선택하기"
];

function tomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getReservationDraft() {
  try {
    return JSON.parse(window.sessionStorage.getItem("matgourmand-reservation-draft"));
  } catch {
    return null;
  }
}

function getRoute() {
  const route = window.location.hash.slice(1) || "/";
  return route.startsWith("/") ? route : "/";
}

export default function App() {
  const [route, setRoute] = useState(getRoute);
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [storesError, setStoresError] = useState("");
  const [storesReloadKey, setStoresReloadKey] = useState(0);
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(window.sessionStorage.getItem("matgourmand-session")) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleHashChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setStoresLoading(true);
    setStoresError("");
    apiRequest("/api/stores", { signal: controller.signal })
      .then((data) => setStores(data.filter((store) => store.status !== "HIDDEN").map(mapStore)))
      .catch((error) => {
        if (error.name !== "AbortError") setStoresError(error instanceof TypeError ? "서버에 연결할 수 없습니다." : error.message);
      })
      .finally(() => { if (!controller.signal.aborted) setStoresLoading(false); });
    return () => controller.abort();
  }, [storesReloadKey]);

  const navigate = (path) => {
    window.location.hash = path;
    setRoute(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAuthenticated = (auth) => {
    const nextSession = { accessToken: auth.accessToken, user: auth.user };
    window.sessionStorage.setItem("matgourmand-session", JSON.stringify(nextSession));
    setSession(nextSession);
    const returnTo = window.sessionStorage.getItem("matgourmand-return-to") || "/";
    window.sessionStorage.removeItem("matgourmand-return-to");
    navigate(returnTo);
  };

  const handleLogout = () => {
    window.sessionStorage.removeItem("matgourmand-session");
    setSession(null);
  };

  const header = (
    <SiteHeader navigate={navigate} session={session} onLogout={handleLogout} />
  );

  if (route === "/login" || route === "/signup") {
    return (
      <AuthPage
        key={route}
        mode={route === "/login" ? "login" : "signup"}
        navigate={navigate}
        onAuthenticated={handleAuthenticated}
        header={header}
      />
    );
  }

  if (route.startsWith("/stores/")) {
    const storeId = decodeURIComponent(route.slice("/stores/".length));
    return (
      <StoreDetailPage
        storeId={storeId}
        navigate={navigate}
        header={header}
      />
    );
  }

  if (route === "/reservations") {
    return <ReservationListPage session={session} navigate={navigate} header={header} />;
  }

  if (route === "/owner/reservations") {
    return <OwnerReservationPage session={session} navigate={navigate} header={header} />;
  }

  if (route.startsWith("/reservations/")) {
    const reservationId = decodeURIComponent(route.slice("/reservations/".length).replace(/\/complete$/, ""));
    return (
      <ReservationPage
        reservationId={reservationId}
        isComplete={route.endsWith("/complete")}
        draft={getReservationDraft()}
        session={session}
        navigate={navigate}
        header={header}
      />
    );
  }

  const requestedStoreId = new URLSearchParams(route.split("?")[1] || "").get("store");
  return <HomePage navigate={navigate} header={header} initialStoreId={requestedStoreId} stores={stores} loading={storesLoading} error={storesError} retry={() => setStoresReloadKey((key) => key + 1)} />;
}

function HomePage({ navigate, header, initialStoreId, stores, loading, error, retry }) {
  const initialStore = stores.find((store) => store.id === initialStoreId);
  const initialDraft = getReservationDraft();
  const matchingDraft = String(initialDraft?.storeId) === initialStoreId ? initialDraft : null;
  const [regionQuery, setRegionQuery] = useState(initialStore?.region || "");
  const [selectedRegion, setSelectedRegion] = useState(initialStore?.region || "");
  const [selectedTheme, setSelectedTheme] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [sortBy, setSortBy] = useState("recommended");
  const [selectedStoreId, setSelectedStoreId] = useState(initialStoreId || "");
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState(matchingDraft?.partySize ? matchingDraft.time || "" : "");
  const [selectedPartySize, setSelectedPartySize] = useState(matchingDraft?.partySize || null);
  const [selectedDate, setSelectedDate] = useState(matchingDraft?.date >= tomorrowDate() ? matchingDraft.date : tomorrowDate);
  const [requestNote, setRequestNote] = useState(matchingDraft?.requestNote || "");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [timesLoading, setTimesLoading] = useState(false);
  const [timesError, setTimesError] = useState("");
  const [timesReloadKey, setTimesReloadKey] = useState(0);
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const store = stores.find((item) => item.id === initialStoreId);
    if (store) {
      setRegionQuery(store.region);
      setSelectedRegion(store.region);
      setSelectedStoreId(store.id);
      setShowReservationModal(true);
    }
  }, [initialStoreId, stores]);

  useEffect(() => {
    if (!showReservationModal || !selectedStoreId || !selectedDate || !selectedPartySize) {
      setAvailableTimes([]);
      setTimesError("");
      return;
    }
    const controller = new AbortController();
    setTimesLoading(true);
    setTimesError("");
    apiRequest(`/api/stores/${encodeURIComponent(selectedStoreId)}/available-times?date=${encodeURIComponent(selectedDate)}&partySize=${selectedPartySize}`, { signal: controller.signal })
      .then((times) => {
        setAvailableTimes(times);
        setSelectedTime((current) => times.includes(current) ? current : "");
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setAvailableTimes([]);
          setSelectedTime("");
          setTimesError(requestError instanceof TypeError ? "서버에 연결할 수 없습니다." : requestError.message);
        }
      })
      .finally(() => { if (!controller.signal.aborted) setTimesLoading(false); });
    return () => controller.abort();
  }, [showReservationModal, selectedStoreId, selectedDate, selectedPartySize, timesReloadKey]);

  useEffect(() => {
    if (!showReservationModal) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowReservationModal(false);
      }
      if (event.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])'
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (document.activeElement === dialogRef.current) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      (triggerRef.current || previousFocus)?.focus?.();
    };
  }, [showReservationModal]);

  const allRegions = useMemo(() => [...new Set(stores.map((store) => store.region).filter(Boolean))], [stores]);
  const foodThemes = useMemo(() => [...new Set(stores.map((store) => store.theme).filter(Boolean))], [stores]);
  const regionSuggestions = useMemo(() => {
    const query = regionQuery.trim().toLowerCase();
    if (!query) {
      return allRegions.slice(0, 6);
    }
    return allRegions.filter((region) => region.toLowerCase().includes(query)).slice(0, 6);
  }, [allRegions, regionQuery]);

  const visibleStores = useMemo(() => {
    let result = stores.filter((store) => !selectedRegion || store.region === selectedRegion);

    if (!selectedRegion && regionQuery.trim()) {
      const query = regionQuery.trim().toLowerCase();
      result = result.filter((store) => `${store.region} ${store.address}`.toLowerCase().includes(query));
    }

    if (selectedTheme) {
      result = result.filter((store) => store.theme === selectedTheme);
    }

    if (selectedPrice) {
      const range = priceRanges.find((item) => item.key === selectedPrice);
      result = result.filter((store) => store.averagePrice != null && store.averagePrice >= range.min && store.averagePrice < range.max);
    }

    if (selectedFilters.includes("available-now")) {
      result = result.filter((store) => store.availableNow);
    }

    if (sortBy === "price-low") result = [...result].sort((a, b) => (a.averagePrice ?? Infinity) - (b.averagePrice ?? Infinity));
    if (sortBy === "price-high") result = [...result].sort((a, b) => (b.averagePrice ?? -1) - (a.averagePrice ?? -1));

    return result;
  }, [stores, regionQuery, selectedFilters, selectedPrice, selectedRegion, selectedTheme, sortBy]);

  const selectedStore = stores.find((store) => store.id === selectedStoreId) ?? null;

  const toggleFilter = (key) => {
    setSelectedFilters((prev) => {
      if (prev.includes(key)) {
        return prev.filter((item) => item !== key);
      }
      return [...prev, key];
    });
  };

  const handleSelectRegion = (region) => {
    setSelectedRegion(region);
    setRegionQuery(region);
  };

  const handleResetRegion = () => {
    setRegionQuery("");
    setSelectedRegion("");
  };

  const handleResetFilters = () => {
    setSelectedRegion("");
    setRegionQuery("");
    setSelectedTheme("");
    setSelectedPrice("");
    setSelectedFilters([]);
  };

  const handleSelectStore = (store, trigger) => {
    triggerRef.current = trigger;
    if (store.id !== selectedStoreId) {
      setRequestNote("");
      setSelectedPartySize(null);
      setSelectedTime("");
    }
    setSelectedStoreId(store.id);
    setShowReservationModal(true);
  };

  const handleSelectPartySize = (size) => {
    if (size !== selectedPartySize) setSelectedTime("");
    setSelectedPartySize(size);
  };

  const hasVisibleStores = visibleStores.length > 0;

  const handleReservationPreview = () => {
    if (!selectedStore || !selectedPartySize || !selectedDate || timesLoading || timesError || !availableTimes.includes(selectedTime)) return;
    window.sessionStorage.setItem(
      "matgourmand-reservation-draft",
      JSON.stringify({
        storeId: selectedStore.id,
        storeName: selectedStore.name,
        region: selectedStore.region,
        theme: selectedStore.theme,
        date: selectedDate,
        time: selectedTime,
        partySize: selectedPartySize,
        requestNote: requestNote.trim()
      })
    );
    navigate("/reservations/preview");
  };

  return (
    <div className="min-h-screen bg-white text-stone-900">
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-5 sm:px-6 lg:px-8">
        {header}

        <main className="mt-5 space-y-5">
          <section className="space-y-5">
            <section className="rounded-[2rem] border border-[#f0dfcf] bg-[linear-gradient(135deg,#fff8ef_0%,#f8e4cd_100%)] p-5 shadow-[0_24px_60px_rgba(122,73,34,0.08)] sm:p-7">
              <p className="text-sm font-semibold text-stone-900">오늘의 식당 찾기</p>
              <h1 className="mt-3 font-['Cormorant_Garamond'] text-4xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-5xl">
                지역을 고르고,
                <br />
                취향을 더하고,
                <br />
                예산에 맞게.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
                가고 싶은 동네, 먹고 싶은 음식, 생각한 가격대를 자유롭게 골라보세요.
                조건에 맞는 식당을 바로 살펴볼 수 있습니다.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {highlightBullets.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-stone-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-stone-100 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] sm:p-6">
              <div>
                <p className="text-lg font-semibold text-stone-900">나에게 맞는 식당 찾기</p>
                <p className="text-sm text-stone-500">
                  지역·음식 테마·가격대는 각각 선택할 수 있어요.
                </p>
              </div>

              <div className="mt-5">
                <label htmlFor="region-search" className="mb-2 block text-sm font-semibold text-stone-700">지역</label>
                <div className="flex items-center gap-3 rounded-[1.4rem] border border-stone-200 bg-white px-4 py-3 shadow-sm">
                  <input
                    id="region-search"
                    value={regionQuery}
                    onChange={(event) => {
                      setRegionQuery(event.target.value);
                      setSelectedRegion("");
                    }}
                    placeholder="예: 성수, 한남, 연남"
                    className="min-w-0 flex-1 border-0 bg-transparent p-0 text-base font-medium text-stone-900 outline-none placeholder:text-stone-400 focus-visible:ring-2 focus-visible:ring-[#dd6b6b]"
                  />
                  <button
                    type="button"
                    onClick={handleResetRegion}
                    className="shrink-0 rounded-full bg-[#fff1ef] px-3 py-1.5 text-xs font-semibold text-[#bf4f4f] transition hover:bg-[#ffe4e1]"
                  >
                    지우기
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleResetRegion}
                    aria-pressed={!selectedRegion}
                    className={`rounded-full px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f] ${!selectedRegion ? "bg-[#dd6b6b] text-white" : "bg-[#fbf6f0] text-stone-700 hover:bg-[#f3e7d8]"}`}
                  >
                    전체 지역
                  </button>
                  {regionSuggestions.map((region) => (
                    <button
                      key={region}
                      type="button"
                      onClick={() => handleSelectRegion(region)}
                      aria-pressed={selectedRegion === region}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        selectedRegion === region
                          ? "bg-[#dd6b6b] text-white"
                          : "bg-[#fbf6f0] text-stone-700 hover:bg-[#f3e7d8]"
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-stone-100 pt-5">
                <p className="text-sm font-semibold text-stone-700">음식 테마</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["전체", ...foodThemes].map((theme) => {
                    const value = theme === "전체" ? "" : theme;
                    const active = selectedTheme === value;
                    return (
                      <button key={theme} type="button" onClick={() => setSelectedTheme(value)} aria-pressed={active} className={`rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f] ${active ? "bg-[#dd6b6b] text-white" : "bg-[#fbf6f0] text-stone-700 hover:bg-[#f3e7d8]"}`}>
                        {theme}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 border-t border-stone-100 pt-5">
                <p className="text-sm font-semibold text-stone-700">1인 예상 가격대</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[{ key: "", label: "전체 가격" }, ...priceRanges].map((range) => {
                    const active = selectedPrice === range.key;
                    return (
                      <button key={range.key || "all"} type="button" onClick={() => setSelectedPrice(range.key)} aria-pressed={active} className={`rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f] ${active ? "bg-[#dd6b6b] text-white" : "bg-[#fbf6f0] text-stone-700 hover:bg-[#f3e7d8]"}`}>
                        {range.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 border-t border-stone-100 pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-stone-700">추가 조건</p>
                  <button type="button" onClick={handleResetFilters} className="rounded-full bg-[#fff1ef] px-3 py-1.5 text-xs font-semibold text-[#a94444] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f]">전체 초기화</button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {filters.map((filter) => {
                    const active = selectedFilters.includes(filter.key);
                    return (
                      <button key={filter.key} type="button" onClick={() => toggleFilter(filter.key)} aria-pressed={active} className={`rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f] ${active ? "bg-[#fff1ef] text-[#a94444] ring-1 ring-[#eab0aa]" : "bg-[#fbf6f0] text-stone-700 hover:bg-[#f3e7d8]"}`}>
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-stone-100 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-stone-900">조건에 맞는 식당</p>
                  <p className="text-sm text-stone-500">
                    식당을 누르면 예약 창이 열립니다. 상세 정보도 확인해 보세요.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <p aria-live="polite" className="text-sm font-medium text-stone-500">
                    {visibleStores.length}개 결과
                  </p>
                  <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                    정렬
                    <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f]">
                      {sortOptions.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
                    </select>
                  </label>
                </div>
              </div>

              {loading ? (
                <p role="status" className="mt-5 rounded-[1.6rem] bg-[#fbf6f0] px-5 py-8 text-center text-sm text-stone-600">식당을 불러오는 중입니다...</p>
              ) : error ? (
                <div role="alert" className="mt-5 rounded-[1.6rem] bg-[#fbf6f0] px-5 py-8 text-center text-sm text-stone-700">
                  <p>{error}</p>
                  <button type="button" onClick={retry} className="mt-4 rounded-full bg-[#dd6b6b] px-5 py-2.5 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f]">다시 시도</button>
                </div>
              ) : hasVisibleStores ? (
                <div className="fade-slide-up mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visibleStores.map((store) => {
                    return (
                      <div
                        key={store.id}
                        className="rounded-[1.6rem] border border-stone-100 bg-white p-4 text-left transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
                      >
                        <button
                          type="button"
                          onClick={(event) => handleSelectStore(store, event.currentTarget)}
                          aria-label={`${store.name} 예약 창 열기`}
                          className="block w-full rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f]"
                        >
                        <div className={`h-36 rounded-[1.2rem] ${store.thumbnail}`} />
                        <div className="mt-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-lg font-semibold text-stone-900">
                                {store.name}
                              </h3>
                              <p className="mt-1 text-sm text-stone-500">{store.summary}</p>
                            </div>
                            {store.theme && <span className="rounded-full bg-[#fff1ef] px-3 py-1 text-xs font-semibold text-[#bf4f4f]">{store.theme}</span>}
                          </div>

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                            <span className="text-stone-500">{store.region || store.address}{store.averagePrice != null ? ` · 약 ${store.averagePrice.toLocaleString("ko-KR")}원/인` : ""}</span>
                            <span
                              className={`font-semibold ${
                                store.availableNow ? "text-[#bf4f4f]" : "text-stone-400"
                              }`}
                            >
                              {store.availableNow ? "예약 접수 중" : "예약 접수 중지"}
                            </span>
                          </div>
                        </div>
                        <span className="mt-4 inline-block text-sm font-semibold text-[#a94444]">예약하기 →</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/stores/${store.id}`)}
                          className="mt-4 rounded-lg text-sm font-semibold text-[#a94444] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f]"
                        >
                          상세 보기 →
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-5 rounded-[1.6rem] bg-[#fbf6f0] px-5 py-8 text-center text-sm text-stone-500">
                  {stores.length === 0 ? "등록된 식당이 아직 없어요." : "현재 선택한 조건에 맞는 식당이 없어요. 조건을 바꾸거나 초기화해 보세요."}
                </div>
              )}
            </section>
          </section>

          {showReservationModal && selectedStore && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
              <button type="button" aria-label="예약 창 닫기" onClick={() => setShowReservationModal(false)} className="absolute inset-0 bg-stone-950/60" />
              <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="reservation-dialog-title" tabIndex={-1} className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-[#f7f1e8] p-4 shadow-[0_30px_100px_rgba(28,20,16,0.35)] outline-none sm:max-h-[calc(100dvh-3rem)] sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-4 px-1">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.14em] text-[#a94444]">RESERVATION</p>
                    <h2 id="reservation-dialog-title" className="mt-1 text-2xl font-semibold text-stone-900">{selectedStore.name} 예약하기</h2>
                    <p className="mt-1 text-sm text-stone-600">날짜와 인원수를 고른 뒤 시간대를 선택해 보세요.</p>
                  </div>
                  <button type="button" onClick={() => setShowReservationModal(false)} aria-label="예약 창 닫기" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl text-stone-700 hover:bg-[#fff1ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f]">×</button>
                </div>
                <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
                <section className="order-2 rounded-[2rem] border border-stone-100 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] lg:order-1">
                  <p className="text-sm font-semibold text-stone-900">선택한 가게</p>
                  <div className={`mt-4 h-44 rounded-[1.4rem] ${selectedStore.thumbnail}`} />
                  <h2 className="mt-4 text-2xl font-semibold text-stone-900">
                    {selectedStore.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {selectedStore.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedStore.region && <span className="rounded-full bg-[#fbf6f0] px-3 py-1 text-xs font-medium text-stone-600">{selectedStore.region}</span>}
                    {selectedStore.theme && <span className="rounded-full bg-[#fbf6f0] px-3 py-1 text-xs font-medium text-stone-600">{selectedStore.theme}</span>}
                    <span className="rounded-full bg-[#fbf6f0] px-3 py-1 text-xs font-medium text-stone-600">{selectedStore.address}</span>
                  </div>
                </section>

                <section className="order-1 rounded-[2rem] border border-stone-100 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] lg:order-2">
                  <p className="text-lg font-semibold text-stone-900">예약 내용 선택</p>
                  <p className="mt-1 text-sm text-stone-500">
                    날짜와 인원수를 고른 뒤 시간대를 선택해 보세요.
                  </p>

                  <div className="mt-5">
                    <label htmlFor="reservation-date" className="text-sm font-medium text-stone-700">예약 날짜</label>
                    <input id="reservation-date" type="date" min={tomorrowDate()} value={selectedDate} onChange={(event) => { setSelectedDate(event.target.value); setSelectedTime(""); }} className="mt-3 block w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f]" />
                  </div>

                  <div className="mt-5">
                    <p className="text-sm font-medium text-stone-700">인원수</p>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {partySizes.map((size) => (
                        <button
                          type="button"
                          key={size}
                          onClick={() => handleSelectPartySize(size)}
                          aria-pressed={selectedPartySize === size}
                          className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                            selectedPartySize === size
                              ? "bg-[#dd6b6b] text-white"
                              : "bg-[#fbf6f0] text-stone-700 hover:bg-[#f3e7d8]"
                          }`}
                        >
                          {size}명
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <label htmlFor="reservation-time" className="text-sm font-medium text-stone-700">예약 시간대</label>
                    <select
                      id="reservation-time"
                      value={selectedTime}
                      onChange={(event) => setSelectedTime(event.target.value)}
                      disabled={!selectedPartySize || timesLoading || Boolean(timesError) || availableTimes.length === 0}
                      className="mt-3 block w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f] disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500"
                    >
                      <option value="" disabled>
                        {!selectedPartySize ? "먼저 인원수를 선택하세요" : timesLoading ? "시간대를 확인하는 중입니다" : timesError ? "시간대를 불러오지 못했어요" : availableTimes.length ? "시간대를 선택하세요" : "선택 가능한 시간대가 없습니다"}
                      </option>
                      {availableTimes.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    {timesError && <div role="alert" className="mt-2 flex items-center gap-3 text-xs text-[#a94444]"><span>{timesError}</span><button type="button" onClick={() => setTimesReloadKey((key) => key + 1)} className="font-semibold underline">다시 시도</button></div>}
                    {selectedPartySize && !timesLoading && !timesError && <p className="mt-2 text-xs text-stone-500">영업시간과 잔여석을 기준으로 표시합니다. 예약 접수 시 다시 확인합니다.</p>}
                  </div>

                  <div className="mt-5">
                    <label htmlFor="reservation-note" className="text-sm font-medium text-stone-700">요청 사항 <span className="font-normal text-stone-400">(선택)</span></label>
                    <textarea id="reservation-note" maxLength={500} rows={3} value={requestNote} onChange={(event) => setRequestNote(event.target.value)} placeholder="예: 조용한 자리 부탁드립니다" className="mt-3 block w-full resize-none rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f]" />
                  </div>

                  <div className="mt-6 rounded-[1.4rem] bg-[#fbf6f0] p-4">
                    <p className="text-sm text-stone-500">예약 요약</p>
                    <p className="mt-2 font-semibold text-stone-900">{selectedStore.name}</p>
                    <p className="mt-1 text-sm text-stone-600">
                      {selectedStore.region} · {selectedDate || "날짜 미선택"} · {selectedPartySize ? `${selectedPartySize}명` : "인원 미선택"} · {selectedTime || "시간 미선택"}
                    </p>
                  </div>

                  <button type="button" onClick={handleReservationPreview} disabled={!selectedDate || !selectedPartySize || timesLoading || Boolean(timesError) || !availableTimes.includes(selectedTime)} className="mt-5 w-full rounded-full bg-[#dd6b6b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#d15c5c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600">
                    예약 내용 확인
                  </button>
                  <p className="mt-3 text-center text-xs leading-5 text-stone-500">다음 화면에서 내용을 확인한 뒤 예약을 접수할 수 있습니다.</p>
                </section>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
