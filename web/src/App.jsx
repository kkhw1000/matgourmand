import { useMemo, useState } from "react";

const regions = ["성수", "한남", "연남", "강남"];

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
    thumbnail:
      "bg-[linear-gradient(135deg,#f7d6c2_0%,#df8f67_100%)]",
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
    thumbnail:
      "bg-[linear-gradient(135deg,#ead8d1_0%,#c9733c_100%)]",
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
    thumbnail:
      "bg-[linear-gradient(135deg,#f1d4cd_0%,#b74141_100%)]",
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
    thumbnail:
      "bg-[linear-gradient(135deg,#f2ddd8_0%,#8b3d3d_100%)]",
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
    thumbnail:
      "bg-[linear-gradient(135deg,#f5d9d2_0%,#cc6262_100%)]",
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
    thumbnail:
      "bg-[linear-gradient(135deg,#f3e0da_0%,#d07171_100%)]",
    reservationTimes: ["17:00", "18:30", "19:00", "20:30"]
  }
];

const partySizes = [1, 2, 3, 4, 5, "6+"];

export default function App() {
  const [selectedRegion, setSelectedRegion] = useState("성수");
  const [selectedFilters, setSelectedFilters] = useState(["top-rated"]);

  const visibleStores = useMemo(() => {
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
  }, [selectedRegion, selectedFilters]);

  const [selectedStoreId, setSelectedStoreId] = useState(stores[0].id);
  const selectedStore =
    visibleStores.find((store) => store.id === selectedStoreId) ??
    visibleStores[0] ??
    null;

  const [selectedTime, setSelectedTime] = useState("18:30");
  const [selectedPartySize, setSelectedPartySize] = useState(2);

  const toggleFilter = (key) => {
    setSelectedFilters((prev) => {
      if (prev.includes(key)) {
        if (key === "top-rated") {
          return prev;
        }
        return prev.filter((item) => item !== key);
      }
      return [...prev, key];
    });
  };

  const handleSelectStore = (store) => {
    setSelectedStoreId(store.id);
    setSelectedTime(store.reservationTimes[0]);
  };

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
              <p className="text-xs text-stone-500">지역 고르고 바로 예약하는 MVP</p>
            </div>
          </div>

          <button className="rounded-full bg-[#fbe7e5] px-4 py-2 text-sm font-semibold text-[#bf4f4f]">
            로그인
          </button>
        </header>

        <main className="mt-5 grid gap-5 lg:grid-cols-[1.45fr_0.85fr]">
          <section className="space-y-5">
            <section className="rounded-[2rem] border border-[#f0dfcf] bg-[linear-gradient(135deg,#fff8ef_0%,#f8e4cd_100%)] p-5 shadow-[0_24px_60px_rgba(122,73,34,0.08)] sm:p-7">
              <p className="text-sm font-semibold text-stone-900">오늘 어디서 먹을지부터 고르기</p>
              <h1 className="mt-3 font-['Cormorant_Garamond'] text-4xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-5xl">
                지역 고르고,
                <br />
                필터 보고,
                <br />
                바로 예약까지.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
                생활권 저장 없이도 그날 갈 지역을 먼저 고르고, 평점이나 예약 가능 여부를
                기준으로 맛집을 빠르게 보는 형태의 홈 화면입니다.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      selectedRegion === region
                        ? "bg-[#dd6b6b] text-white"
                        : "bg-white text-stone-700 hover:bg-[#f6eee4]"
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
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
            </section>

            <section className="rounded-[2rem] border border-stone-100 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] sm:p-6">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-stone-900">
                    {selectedRegion} 가게 리스트
                  </p>
                  <p className="text-sm text-stone-500">
                    썸네일, 가게명, 평점, 예약 가능 여부만 먼저 빠르게 봅니다
                  </p>
                </div>
                <p className="text-sm font-medium text-stone-500">
                  {visibleStores.length}개 결과
                </p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
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
                  <p className="text-lg font-semibold text-stone-900">예약 신청</p>
                  <p className="mt-1 text-sm text-stone-500">
                    시간대와 인원만 고르면 신청할 수 있는 MVP 흐름입니다
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
                  왼쪽 리스트에서 가게를 누르면 예약 패널이 열립니다.
                </p>
              </section>
            )}
          </aside>
        </main>
      </div>
    </div>
  );
}
