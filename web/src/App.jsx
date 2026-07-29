import { useEffect, useMemo, useState } from "react";

const allRegions = [
  "성수",
  "성수동",
  "서울숲",
  "한남",
  "한남동",
  "연남",
  "연남동",
  "망원",
  "망원동",
  "강남",
  "역삼",
  "압구정",
  "을지로",
  "서촌",
  "합정"
];

const filters = [
  { key: "top-rated", label: "평점 높은 순" },
  { key: "available-now", label: "지금 예약 가능" },
  { key: "date", label: "데이트" },
  { key: "group", label: "모임" }
];

const stores = [
  {
    id: "seongsu-brunch",
    region: "성수",
    name: "몽트 브런치",
    rating: 4.8,
    reviewCount: 128,
    summary: "햇살 좋은 브런치 · 친구 모임",
    availableNow: true,
    vibeTags: ["브런치", "모임"],
    thumbnail: "bg-[linear-gradient(135deg,#f7d6c2_0%,#df8f67_100%)]",
    reservationTimes: ["11:30", "12:00", "13:30", "14:00"]
  },
  {
    id: "seongsu-pasta",
    region: "성수",
    name: "로사 파스타바",
    rating: 4.6,
    reviewCount: 94,
    summary: "조용한 파스타바 · 데이트 추천",
    availableNow: false,
    vibeTags: ["데이트"],
    thumbnail: "bg-[linear-gradient(135deg,#ead8d1_0%,#c9733c_100%)]",
    reservationTimes: ["18:00", "19:30", "20:30"]
  },
  {
    id: "hannam-french",
    region: "한남",
    name: "한남동 프렌치 다이닝",
    rating: 4.9,
    reviewCount: 211,
    summary: "차분한 저녁 · 코스 중심",
    availableNow: true,
    vibeTags: ["데이트"],
    thumbnail: "bg-[linear-gradient(135deg,#f1d4cd_0%,#b74141_100%)]",
    reservationTimes: ["17:30", "18:30", "19:30"]
  },
  {
    id: "hannam-steak",
    region: "한남",
    name: "오크 스테이크 하우스",
    rating: 4.7,
    reviewCount: 87,
    summary: "스테이크 · 기념일 저녁",
    availableNow: true,
    vibeTags: ["데이트", "모임"],
    thumbnail: "bg-[linear-gradient(135deg,#f2ddd8_0%,#8b3d3d_100%)]",
    reservationTimes: ["18:00", "19:00", "20:00"]
  },
  {
    id: "yeonnam-wine",
    region: "연남",
    name: "노을 와인바",
    rating: 4.8,
    reviewCount: 156,
    summary: "와인바 · 감도 높은 분위기",
    availableNow: false,
    vibeTags: ["데이트"],
    thumbnail: "bg-[linear-gradient(135deg,#f5d9d2_0%,#cc6262_100%)]",
    reservationTimes: ["18:30", "20:00", "21:00"]
  },
  {
    id: "gangnam-group",
    region: "강남",
    name: "모노 키친",
    rating: 4.5,
    reviewCount: 73,
    summary: "단체 모임 · 메뉴 고르기 쉬운 곳",
    availableNow: true,
    vibeTags: ["모임"],
    thumbnail: "bg-[linear-gradient(135deg,#f3e0da_0%,#d07171_100%)]",
    reservationTimes: ["17:00", "18:30", "19:00", "20:30"]
  }
];

const partySizes = [1, 2, 3, 4, 5, "6+"];

const highlightBullets = [
  "지역 먼저 고르기",
  "필터로 빠르게 정리",
  "바로 예약 신청"
];

export default function App() {
  const [regionQuery, setRegionQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPartySize, setSelectedPartySize] = useState(2);

  const regionSuggestions = useMemo(() => {
    const query = regionQuery.trim().toLowerCase();
    if (!query) {
      return allRegions.slice(0, 6);
    }
    return allRegions.filter((region) => region.toLowerCase().includes(query)).slice(0, 6);
  }, [regionQuery]);

  const visibleStores = useMemo(() => {
    if (!selectedRegion || selectedFilters.length === 0) {
      return [];
    }

    let result = stores.filter((store) => store.region === selectedRegion);

    if (selectedFilters.includes("available-now")) {
      result = result.filter((store) => store.availableNow);
    }

    if (selectedFilters.includes("date")) {
      result = result.filter((store) => store.vibeTags.includes("데이트"));
    }

    if (selectedFilters.includes("group")) {
      result = result.filter((store) => store.vibeTags.includes("모임"));
    }

    if (selectedFilters.includes("top-rated")) {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [selectedFilters, selectedRegion]);

  useEffect(() => {
    if (!visibleStores.length) {
      setSelectedStoreId("");
      setSelectedTime("");
      return;
    }

    const stillVisible = visibleStores.find((store) => store.id === selectedStoreId);
    const nextStore = stillVisible ?? visibleStores[0];
    setSelectedStoreId(nextStore.id);
    setSelectedTime((prev) =>
      prev && nextStore.reservationTimes.includes(prev) ? prev : nextStore.reservationTimes[0]
    );
  }, [selectedStoreId, visibleStores]);

  const selectedStore =
    visibleStores.find((store) => store.id === selectedStoreId) ?? null;

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
    setSelectedFilters([]);
    setSelectedStoreId("");
    setSelectedTime("");
    setSelectedPartySize(2);
  };

  const handleResetFilters = () => {
    setSelectedFilters([]);
    setSelectedStoreId("");
    setSelectedTime("");
  };

  const handleSelectStore = (store) => {
    setSelectedStoreId(store.id);
    setSelectedTime(store.reservationTimes[0]);
  };

  const hasSelectedRegion = Boolean(selectedRegion);
  const hasSelectedFilters = selectedFilters.length > 0;
  const hasVisibleStores = visibleStores.length > 0;

  return (
    <div className="min-h-screen bg-white text-stone-900">
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-3xl border border-stone-100 bg-white px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#dd6b6b] font-['Cormorant_Garamond'] text-2xl font-semibold text-white">
              M
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">MatGourmand</p>
              <p className="text-xs text-stone-500">지역 검색부터 시작하는 예약 MVP</p>
            </div>
          </div>

          <button className="rounded-full bg-[#fbe7e5] px-4 py-2 text-sm font-semibold text-[#bf4f4f]">
            로그인
          </button>
        </header>

        <main className="mt-5 grid gap-5 lg:grid-cols-[1.45fr_0.85fr]">
          <section className="space-y-5">
            <section className="rounded-[2rem] border border-[#f0dfcf] bg-[linear-gradient(135deg,#fff8ef_0%,#f8e4cd_100%)] p-5 shadow-[0_24px_60px_rgba(122,73,34,0.08)] sm:p-7">
              <p className="text-sm font-semibold text-stone-900">오늘 갈 지역부터 고르기</p>
              <h1 className="mt-3 font-['Cormorant_Garamond'] text-4xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-5xl">
                지역 찾고,
                <br />
                필터로 좁히고,
                <br />
                바로 예약까지.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
                지역을 먼저 검색해서 선택한 뒤, 평점이나 지금 예약 가능 여부로 빠르게
                걸러보고 원하는 가게를 예약하는 흐름의 메인 화면입니다.
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
                <p className="text-lg font-semibold text-stone-900">1. 지역 선택</p>
                <p className="text-sm text-stone-500">
                  지역을 검색하면 자동완성처럼 후보가 나오고, 선택 후 필터를 고를 수 있어요
                </p>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-sm font-medium text-stone-700">지역 검색</p>
                <div className="flex items-center gap-3 rounded-[1.4rem] border border-stone-200 bg-white px-4 py-3 shadow-sm">
                  <input
                    value={regionQuery}
                    onChange={(event) => setRegionQuery(event.target.value)}
                    placeholder="예: 성수, 한남, 연남"
                    className="min-w-0 flex-1 border-0 bg-transparent p-0 text-base font-medium text-stone-900 outline-none placeholder:text-stone-400"
                  />
                  <button
                    type="button"
                    onClick={handleResetRegion}
                    className="shrink-0 rounded-full bg-[#fff1ef] px-3 py-1.5 text-xs font-semibold text-[#bf4f4f] transition hover:bg-[#ffe4e1]"
                  >
                    초기화
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {regionSuggestions.map((region) => (
                    <button
                      key={region}
                      onClick={() => handleSelectRegion(region)}
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

              {selectedRegion ? (
                <div className="fade-slide-up mt-6 border-t border-stone-100 pt-5">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-stone-900">2. 필터 선택</p>
                      <p className="text-sm text-stone-500">
                        선택한 지역 안에서 필요한 조건으로 바로 좁혀보세요
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#fff1ef] px-3 py-1 text-xs font-semibold text-[#bf4f4f]">
                        선택 지역: {selectedRegion}
                      </span>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="rounded-full bg-[#fbf6f0] px-3 py-1 text-xs font-semibold text-stone-600 transition hover:bg-[#f3e7d8]"
                      >
                        필터 초기화
                      </button>
                    </div>
                  </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {filters.map((filter) => {
                    const active = selectedFilters.includes(filter.key);
                      return (
                        <button
                          key={filter.key}
                          onClick={() => toggleFilter(filter.key)}
                          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                            active
                              ? "bg-[#fff1ef] text-[#bf4f4f] ring-1 ring-[#f1b5b0]"
                              : "bg-white text-stone-600 hover:bg-[#f6eee4]"
                          }`}
                        >
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </section>

            <section className="rounded-[2rem] border border-stone-100 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] sm:p-6">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-stone-900">3. 가게 리스트</p>
                  <p className="text-sm text-stone-500">
                    썸네일, 가게명, 평점, 예약 가능 여부만 먼저 빠르게 확인합니다
                  </p>
                </div>
                <p className="text-sm font-medium text-stone-500">
                  {hasSelectedRegion && hasSelectedFilters
                    ? `${visibleStores.length}개 결과`
                    : selectedRegion
                      ? "필터를 먼저 선택해 주세요"
                      : "지역을 먼저 선택해 주세요"}
                </p>
              </div>

              {hasSelectedRegion && hasSelectedFilters && hasVisibleStores ? (
                <div className="fade-slide-up mt-5 grid gap-4 md:grid-cols-2">
                  {visibleStores.map((store) => {
                    const active = selectedStore?.id === store.id;
                    return (
                      <button
                        key={store.id}
                        onClick={() => handleSelectStore(store)}
                        className={`rounded-[1.6rem] border p-4 text-left transition ${
                          active
                            ? "border-[#eab0aa] bg-[#fff7f6] shadow-[0_16px_40px_rgba(191,79,79,0.10)]"
                            : "border-stone-100 bg-white hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
                        }`}
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
                            <span className="rounded-full bg-[#fff1ef] px-3 py-1 text-xs font-semibold text-[#bf4f4f]">
                              ★ {store.rating.toFixed(1)}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between text-sm">
                            <span className="text-stone-500">리뷰 {store.reviewCount}개</span>
                            <span
                              className={`font-semibold ${
                                store.availableNow ? "text-[#bf4f4f]" : "text-stone-400"
                              }`}
                            >
                              {store.availableNow ? "지금 예약 가능" : "조금 뒤 예약 가능"}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-5 rounded-[1.6rem] bg-[#fbf6f0] px-5 py-8 text-center text-sm text-stone-500">
                  {!selectedRegion
                    ? "지역을 검색해서 선택하면 해당 지역 가게 리스트가 여기 표시됩니다."
                    : selectedFilters.length === 0
                      ? "필터를 하나 이상 고르면 해당 지역 가게 리스트가 여기 표시됩니다."
                      : "현재 선택한 조건으로는 찾을 수 있는 가게가 없어요. 필터를 바꾸거나 초기화해 보세요."}
                </div>
              )}
            </section>
          </section>

          <aside className="rounded-[2rem] bg-[#f7f1e8] p-4 sm:p-5">
            {selectedStore ? (
              <div className="space-y-5">
                <section className="rounded-[2rem] border border-stone-100 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                  <p className="text-sm font-semibold text-stone-900">선택한 가게</p>
                  <div className={`mt-4 h-44 rounded-[1.4rem] ${selectedStore.thumbnail}`} />
                  <h2 className="mt-4 text-2xl font-semibold text-stone-900">
                    {selectedStore.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {selectedStore.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#fff1ef] px-3 py-1 text-xs font-semibold text-[#bf4f4f]">
                      ★ {selectedStore.rating.toFixed(1)}
                    </span>
                    <span className="rounded-full bg-[#fbf6f0] px-3 py-1 text-xs font-medium text-stone-600">
                      {selectedStore.region}
                    </span>
                    {selectedStore.vibeTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#fbf6f0] px-3 py-1 text-xs font-medium text-stone-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>

                <section className="rounded-[2rem] border border-stone-100 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                  <p className="text-lg font-semibold text-stone-900">4. 예약 신청</p>
                  <p className="mt-1 text-sm text-stone-500">
                    시간대와 인원수만 고르면 바로 예약 신청하는 MVP 흐름입니다
                  </p>

                  <div className="mt-5">
                    <p className="text-sm font-medium text-stone-700">예약 시간대</p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {selectedStore.reservationTimes.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                            selectedTime === time
                              ? "bg-[#dd6b6b] text-white"
                              : "bg-[#fff1ef] text-[#bf4f4f] hover:bg-[#ffe4e1]"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-sm font-medium text-stone-700">인원수</p>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {partySizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedPartySize(size)}
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

                  <div className="mt-6 rounded-[1.4rem] bg-[#fbf6f0] p-4">
                    <p className="text-sm text-stone-500">예약 요약</p>
                    <p className="mt-2 font-semibold text-stone-900">{selectedStore.name}</p>
                    <p className="mt-1 text-sm text-stone-600">
                      {selectedStore.region} · {selectedTime} · {selectedPartySize}명
                    </p>
                  </div>

                  <button className="mt-5 w-full rounded-full bg-[#dd6b6b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#d15c5c]">
                    예약 신청하기
                  </button>
                </section>
              </div>
            ) : (
              <section className="rounded-[2rem] border border-stone-100 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                <p className="text-lg font-semibold text-stone-900">가게를 선택해 주세요</p>
                <p className="mt-2 text-sm text-stone-500">
                  지역을 먼저 선택한 뒤 왼쪽 리스트에서 가게를 누르면 예약 패널이 열립니다.
                </p>
              </section>
            )}
          </aside>
        </main>
      </div>
    </div>
  );
}
