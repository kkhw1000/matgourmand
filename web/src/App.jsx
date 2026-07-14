import { useEffect, useState } from "react";

const quickFilters = ["전체", "데이트", "브런치", "한식", "와인바", "혼밥"];

const categoryItems = [
  { emoji: "🍝", label: "파스타", route: "#/category/pasta" },
  { emoji: "🥐", label: "브런치", route: "#/category/brunch" },
  { emoji: "🥩", label: "스테이크", route: "#/category/steak" },
  { emoji: "🍷", label: "와인바", route: "#/category/wine" },
  { emoji: "🍣", label: "일식", route: "#/category/japanese" },
  { emoji: "☕", label: "카페", route: "#/category/cafe" }
];

const featuredRestaurants = [
  {
    id: "french-dining",
    badge: "오늘의 추천",
    name: "한남동 프렌치 다이닝",
    detail: "조용한 저녁 · 데이트 · 예약 가능",
    area: "한남동",
    mood: "차분한 데이트",
    price: "1인 45,000원대",
    time: "오늘 19:30 가능"
  },
  {
    id: "brunch-bistro",
    badge: "지금 인기",
    name: "성수 브런치 비스트로",
    detail: "밝은 분위기 · 친구 모임 · 주말 인기",
    area: "성수동",
    mood: "가벼운 브런치",
    price: "1인 22,000원대",
    time: "오늘 14:00 가능"
  },
  {
    id: "wine-bar",
    badge: "분위기 맛집",
    name: "연남동 내추럴 와인 바",
    detail: "와인바 · 데이트 · 저녁 추천",
    area: "연남동",
    mood: "무드 있는 저녁",
    price: "1인 30,000원대",
    time: "오늘 20:00 가능"
  }
];

const nearbyPlaces = [
  {
    id: "monte-brunch",
    name: "몽트 브런치",
    area: "성수동",
    meta: "브런치 · 도보 12분",
    slot: "오늘 14:00 가능"
  },
  {
    id: "oak-steak",
    name: "오크 스테이크 하우스",
    area: "한남동",
    meta: "스테이크 · 예약 많음",
    slot: "오늘 19:30 가능"
  },
  {
    id: "yuja-izakaya",
    name: "유자 이자카야",
    area: "연남동",
    meta: "일식 · 저녁 추천",
    slot: "오늘 20:00 가능"
  }
];

const situationSections = [
  {
    title: "데이트할 때",
    text: "너무 시끄럽지 않고 분위기 좋은 곳 위주로 골랐어요.",
    route: "#/collection/date",
    items: [
      { id: "french-dining", name: "한남동 프렌치 다이닝" },
      { id: "wine-bar", name: "연남동 와인바" },
      { id: "small-bistro", name: "서촌 작은 비스트로" }
    ]
  },
  {
    title: "친구 만날 때",
    text: "편하게 오래 앉아있기 좋고 메뉴 고르기 쉬운 곳이에요.",
    route: "#/collection/friends",
    items: [
      { id: "brunch-bistro", name: "성수 브런치 비스트로" },
      { id: "taco-bar", name: "합정 타코 바" },
      { id: "pub-dining", name: "을지로 펍 다이닝" }
    ]
  },
  {
    title: "혼자 가볍게",
    text: "부담 없이 들어가기 좋고 혼밥하기 편한 곳만 모았어요.",
    route: "#/collection/solo",
    items: [
      { id: "ramen", name: "망원 라멘집" },
      { id: "sandwich", name: "용산 샌드위치 바" },
      { id: "rice-bowl", name: "서교동 덮밥집" }
    ]
  }
];

const reservationItems = [
  { name: "르블랑", time: "18:00", seats: "2인 가능" },
  { name: "모노 키친", time: "18:30", seats: "4인 가능" },
  { name: "비노테카", time: "20:00", seats: "2인 가능" }
];

function navigateTo(hash) {
  window.location.hash = hash;
}

function getCurrentHash() {
  return window.location.hash || "#/";
}

const hoverLiftCard =
  "transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(122,73,34,0.12)]";

const hoverSoftButton =
  "transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(122,73,34,0.12)]";

function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-white text-stone-900">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-3xl bg-white px-4 py-3 shadow-sm sm:px-5">
          <button
            className={`flex items-center gap-3 rounded-2xl px-1 py-1 text-left ${hoverSoftButton}`}
            onClick={() => navigateTo("#/")}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d97745] font-['Cormorant_Garamond'] text-2xl font-semibold text-white">
              M
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold tracking-tight">MatGourmand</p>
              <p className="text-xs text-stone-500">오늘 갈 맛집 찾기</p>
            </div>
          </button>

          <div className="hidden items-center gap-3 md:flex">
            <button
              className={`rounded-full bg-[#f6eee4] px-4 py-2 text-sm font-medium text-stone-600 ${hoverSoftButton}`}
            >
              서울
            </button>
            <button
              className={`rounded-full bg-[#d97745] px-4 py-2 text-sm font-semibold text-white ${hoverSoftButton}`}
              onClick={() => navigateTo("#/login")}
            >
              로그인
            </button>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <main className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_0.9fr]">
      <section className="space-y-5">
        <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#fff8ef_0%,#f8e4cd_100%)] p-5 shadow-[0_24px_60px_rgba(122,73,34,0.08)] sm:p-7">
          <p className="text-sm font-semibold text-[#d97745]">오늘 뭐 먹을지 고민될 때</p>
          <h1 className="mt-3 font-['Cormorant_Garamond'] text-4xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-5xl">
            검색하고,
            <br />
            바로 괜찮은 곳만
            <br />
            골라보세요.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
            분위기, 메뉴, 지역에 맞는 맛집을 빠르게 보고 예약까지 이어서 갈 수 있게
            만든 메인 홈 화면입니다.
          </p>

          <div className="mt-6 rounded-[1.6rem] bg-white p-3 shadow-sm">
            <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_auto]">
              <button
                className={`rounded-2xl bg-[#f8f3ed] px-4 py-3 text-left ${hoverSoftButton}`}
                onClick={() => navigateTo("#/search")}
              >
                <p className="text-xs text-stone-400">어떤 메뉴 찾고 있어요?</p>
                <p className="mt-1 text-sm font-medium text-stone-700">
                  파스타, 브런치, 와인바
                </p>
              </button>
              <button
                className={`rounded-2xl bg-[#f8f3ed] px-4 py-3 text-left ${hoverSoftButton}`}
                onClick={() => navigateTo("#/search")}
              >
                <p className="text-xs text-stone-400">분위기</p>
                <p className="mt-1 text-sm font-medium text-stone-700">데이트</p>
              </button>
              <button
                className={`rounded-2xl bg-[#f8f3ed] px-4 py-3 text-left ${hoverSoftButton}`}
                onClick={() => navigateTo("#/search")}
              >
                <p className="text-xs text-stone-400">지역</p>
                <p className="mt-1 text-sm font-medium text-stone-700">성수, 한남</p>
              </button>
              <button
                className={`rounded-2xl bg-[#d97745] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#c96a3a] ${hoverSoftButton}`}
                onClick={() => navigateTo("#/search")}
              >
                검색
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => navigateTo(`#/collection/${encodeURIComponent(filter)}`)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === "전체"
                    ? "bg-[#d97745] text-white"
                    : "bg-white text-stone-600 hover:bg-[#f3e7d8]"
                } ${hoverSoftButton}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <section className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-stone-900">카테고리</p>
              <p className="text-sm text-stone-500">원하는 메뉴부터 바로 골라보세요</p>
            </div>
            <button
              className="text-sm font-medium text-[#d97745] transition hover:text-[#c96a3a]"
              onClick={() => navigateTo("#/search")}
            >
              전체 보기
            </button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {categoryItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigateTo(item.route)}
                className={`rounded-[1.4rem] bg-[#fbf6f0] px-3 py-4 text-center transition hover:bg-[#f3e7d8] ${hoverLiftCard}`}
              >
                <div className="text-2xl">{item.emoji}</div>
                <p className="mt-2 text-sm font-medium text-stone-700">{item.label}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-stone-900">상황별 추천</p>
              <p className="text-sm text-stone-500">지금 필요한 상황에 맞춰 골라봤어요</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {situationSections.map((section) => (
              <article
                key={section.title}
                className={`rounded-[1.6rem] bg-[#fbf6f0] p-5 ${hoverLiftCard}`}
              >
                <button
                  className="text-left transition hover:text-[#c96a3a]"
                  onClick={() => navigateTo(section.route)}
                >
                  <h3 className="text-lg font-semibold text-stone-900">{section.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{section.text}</p>
                </button>
                <div className="mt-4 space-y-2">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(`#/restaurant/${item.id}`)}
                      className={`block w-full rounded-2xl bg-white px-4 py-3 text-left text-sm font-medium text-stone-700 ${hoverSoftButton}`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <aside className="space-y-5">
        <section className="rounded-[2rem] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-stone-900">지금 추천</p>
              <p className="text-sm text-stone-500">바로 보기 좋은 곳</p>
            </div>
            <button className="text-sm font-medium text-[#d97745]">새로고침</button>
          </div>

          <div className="mt-4 space-y-3">
            {featuredRestaurants.slice(0, 2).map((card, index) => (
              <button
                key={card.name}
                onClick={() => navigateTo(`#/restaurant/${card.id}`)}
                className={`block w-full overflow-hidden rounded-[1.6rem] p-4 text-left ${
                  index === 0
                    ? "bg-[linear-gradient(135deg,#d97745_0%,#e9a56f_100%)] text-white"
                    : "bg-[#fbf6f0] text-stone-900"
                } ${hoverLiftCard}`}
              >
                <p
                  className={`text-xs font-semibold ${
                    index === 0 ? "text-orange-100" : "text-[#d97745]"
                  }`}
                >
                  {card.badge}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{card.name}</h3>
                <p
                  className={`mt-2 text-sm ${
                    index === 0 ? "text-orange-50" : "text-stone-600"
                  }`}
                >
                  {card.detail}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-5 shadow-sm">
          <div>
            <p className="text-lg font-semibold text-stone-900">근처에서 바로 갈 수 있는 곳</p>
            <p className="text-sm text-stone-500">예약 가능한 시간도 같이 보여줘요</p>
          </div>

          <div className="mt-4 space-y-3">
            {nearbyPlaces.map((place) => (
              <button
                key={place.name}
                onClick={() => navigateTo(`#/restaurant/${place.id}`)}
                className={`block w-full rounded-[1.4rem] bg-[#fbf6f0] p-4 text-left ${hoverLiftCard}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-stone-900">{place.name}</h3>
                    <p className="mt-1 text-sm text-stone-500">{place.area}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#d97745]">
                    {place.slot}
                  </span>
                </div>
                <p className="mt-3 text-sm text-stone-600">{place.meta}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] bg-[#2f241f] p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">오늘 예약 가능</p>
              <p className="text-sm text-stone-300">지금 바로 잡을 수 있는 시간</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {reservationItems.map((item) => (
              <div
                key={`${item.name}-${item.time}`}
                className="flex items-center justify-between rounded-[1.2rem] bg-white/10 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-stone-300">{item.seats}</p>
                </div>
                <button
                  className={`rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-900 ${hoverSoftButton}`}
                  onClick={() => navigateTo("#/reserve")}
                >
                  {item.time}
                </button>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </main>
  );
}

function PageHeader({ eyebrow, title, description, actionLabel, onAction }) {
  return (
    <div className="rounded-[2rem] bg-[#fff8ef] p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold text-[#d97745]">{eyebrow}</p>
      <h1 className="mt-3 font-['Cormorant_Garamond'] text-4xl font-semibold text-stone-900 sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600 sm:text-base">
        {description}
      </p>
      {actionLabel ? (
        <button
          onClick={onAction}
          className={`mt-5 rounded-full bg-[#d97745] px-5 py-2.5 text-sm font-semibold text-white ${hoverSoftButton}`}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function SearchDemoPage() {
  return (
    <main className="mt-5 space-y-5">
      <PageHeader
        eyebrow="검색 데모"
        title="검색 결과 화면 데모"
        description="홈에서 검색 버튼을 눌렀을 때 이동하는 예시 페이지입니다. 실제 서비스에서는 필터, 정렬, 지도, 리뷰 수가 여기에 붙게 됩니다."
        actionLabel="홈으로 돌아가기"
        onAction={() => navigateTo("#/")}
      />

      <section className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap gap-2">
          {["데이트", "한남동", "와인바", "예약 가능"].map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#fbf6f0] px-4 py-2 text-sm font-medium text-stone-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {featuredRestaurants.map((restaurant) => (
            <button
              key={restaurant.id}
              onClick={() => navigateTo(`#/restaurant/${restaurant.id}`)}
              className={`rounded-[1.6rem] border border-stone-100 p-5 text-left transition hover:border-[#d97745] ${hoverLiftCard}`}
            >
              <p className="text-xs font-semibold text-[#d97745]">{restaurant.badge}</p>
              <h3 className="mt-2 text-xl font-semibold text-stone-900">{restaurant.name}</h3>
              <p className="mt-2 text-sm text-stone-600">{restaurant.detail}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-500">
                <span>{restaurant.area}</span>
                <span>{restaurant.mood}</span>
                <span>{restaurant.price}</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function CategoryDemoPage({ slug }) {
  const category = categoryItems.find((item) => item.route.endsWith(slug));
  const title = category ? `${category.label} 카테고리` : "카테고리";

  return (
    <main className="mt-5 space-y-5">
      <PageHeader
        eyebrow="카테고리 데모"
        title={`${title} 결과 페이지`}
        description="카테고리 버튼을 눌렀을 때 보이는 예시 화면입니다. 이 페이지에는 해당 메뉴에 맞는 리스트와 필터 조합을 넣을 수 있습니다."
        actionLabel="홈으로 돌아가기"
        onAction={() => navigateTo("#/")}
      />

      <section className="grid gap-4 lg:grid-cols-3">
        {featuredRestaurants.map((restaurant) => (
          <button
            key={restaurant.id}
            onClick={() => navigateTo(`#/restaurant/${restaurant.id}`)}
            className={`rounded-[1.6rem] bg-white p-5 text-left shadow-sm ${hoverLiftCard}`}
          >
            <div className="h-36 rounded-[1.2rem] bg-[linear-gradient(135deg,#f3d5ba_0%,#e9a56f_100%)]" />
            <h3 className="mt-4 text-lg font-semibold text-stone-900">{restaurant.name}</h3>
            <p className="mt-2 text-sm text-stone-600">{restaurant.detail}</p>
          </button>
        ))}
      </section>
    </main>
  );
}

function RestaurantDemoPage({ id }) {
  const restaurant =
    featuredRestaurants.find((item) => item.id === id) ||
    nearbyPlaces.find((item) => item.id === id) || {
      name: "데모 레스토랑",
      area: "서울",
      detail: "상세 페이지 데모",
      mood: "편안한 식사",
      price: "1인 25,000원대",
      time: "오늘 예약 가능"
    };

  return (
    <main className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-5">
        <PageHeader
          eyebrow="맛집 상세 데모"
          title={restaurant.name}
          description={`${restaurant.area}에 있는 맛집 상세 예시 화면입니다. 사진, 메뉴, 리뷰, 위치, 예약 버튼이 들어가는 자리를 데모용으로 구성했습니다.`}
          actionLabel="예약 화면 보기"
          onAction={() => navigateTo("#/reserve")}
        />

        <section className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-6">
          <div className="h-64 rounded-[1.6rem] bg-[linear-gradient(135deg,#f2d2b3_0%,#d97745_100%)]" />
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.4rem] bg-[#fbf6f0] p-4">
              <p className="text-xs text-stone-400">분위기</p>
              <p className="mt-1 font-medium text-stone-800">{restaurant.mood || restaurant.meta}</p>
            </div>
            <div className="rounded-[1.4rem] bg-[#fbf6f0] p-4">
              <p className="text-xs text-stone-400">가격대</p>
              <p className="mt-1 font-medium text-stone-800">{restaurant.price || "1인 30,000원대"}</p>
            </div>
            <div className="rounded-[1.4rem] bg-[#fbf6f0] p-4">
              <p className="text-xs text-stone-400">예약 가능</p>
              <p className="mt-1 font-medium text-stone-800">{restaurant.time || restaurant.slot}</p>
            </div>
          </div>
        </section>
      </section>

      <aside className="space-y-5">
        <section className="rounded-[2rem] bg-white p-5 shadow-sm">
          <p className="text-lg font-semibold text-stone-900">메뉴 미리보기</p>
          <div className="mt-4 space-y-3">
            {["시그니처 파스타", "스테이크 플레이트", "하우스 와인"].map((menu) => (
              <div key={menu} className="rounded-[1.2rem] bg-[#fbf6f0] px-4 py-3 text-sm font-medium">
                {menu}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] bg-[#2f241f] p-5 text-white shadow-sm">
          <p className="text-lg font-semibold">예약 액션 데모</p>
          <p className="mt-2 text-sm text-stone-300">보통 여기서 날짜, 시간, 인원을 고르게 됩니다.</p>
          <button
            className={`mt-5 w-full rounded-full bg-white px-4 py-3 text-sm font-semibold text-stone-900 ${hoverSoftButton}`}
            onClick={() => navigateTo("#/reserve")}
          >
            예약하러 가기
          </button>
        </section>
      </aside>
    </main>
  );
}

function CollectionDemoPage({ slug }) {
  const match = situationSections.find(
    (section) => section.route === `#/collection/${slug}` || section.title === slug
  );
  const title = match ? match.title : decodeURIComponent(slug);
  const items = match ? match.items : featuredRestaurants.map((item) => ({ id: item.id, name: item.name }));

  return (
    <main className="mt-5 space-y-5">
      <PageHeader
        eyebrow="상황별 모음"
        title={`${title} 추천`}
        description="홈에서 필터나 상황별 추천 섹션을 눌렀을 때 열리는 모음 페이지 예시입니다."
        actionLabel="홈으로 돌아가기"
        onAction={() => navigateTo("#/")}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => navigateTo(`#/restaurant/${item.id}`)}
            className={`rounded-[1.6rem] bg-white p-5 text-left shadow-sm ${hoverLiftCard}`}
          >
            <div className="h-36 rounded-[1.2rem] bg-[linear-gradient(135deg,#fff0de_0%,#efb27d_100%)]" />
            <h3 className="mt-4 text-lg font-semibold text-stone-900">{item.name}</h3>
            <p className="mt-2 text-sm text-stone-600">이 상황에 어울리는 맛집으로 노출되는 예시 카드입니다.</p>
          </button>
        ))}
      </section>
    </main>
  );
}

function ReserveDemoPage() {
  return (
    <main className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
      <section className="space-y-5">
        <PageHeader
          eyebrow="예약 데모"
          title="예약 단계 예시 화면"
          description="시간 선택, 인원 선택, 요청사항 입력처럼 실제 예약 프로세스로 이어질 화면의 데모입니다."
          actionLabel="홈으로 돌아가기"
          onAction={() => navigateTo("#/")}
        />

        <section className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.4rem] bg-[#fbf6f0] p-4">
              <p className="text-sm text-stone-500">날짜</p>
              <p className="mt-2 font-semibold text-stone-900">2026년 7월 14일</p>
            </div>
            <div className="rounded-[1.4rem] bg-[#fbf6f0] p-4">
              <p className="text-sm text-stone-500">인원</p>
              <p className="mt-2 font-semibold text-stone-900">2명</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {["18:00", "18:30", "19:00", "19:30", "20:00", "20:30"].map((time) => (
              <button
                key={time}
                className={`rounded-2xl bg-[#f8f3ed] px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-[#f0dfcb] ${hoverSoftButton}`}
              >
                {time}
              </button>
            ))}
          </div>
        </section>
      </section>

      <aside className="rounded-[2rem] bg-[#2f241f] p-5 text-white shadow-sm">
        <p className="text-lg font-semibold">예약 요약</p>
        <div className="mt-4 space-y-3 text-sm text-stone-300">
          <p>레스토랑: 한남동 프렌치 다이닝</p>
          <p>날짜: 2026년 7월 14일</p>
          <p>인원: 2명</p>
          <p>요청사항: 창가 자리 우선</p>
        </div>
        <button className={`mt-6 w-full rounded-full bg-white px-4 py-3 text-sm font-semibold text-stone-900 ${hoverSoftButton}`}>
          예약 요청하기
        </button>
      </aside>
    </main>
  );
}

function LoginDemoPage() {
  return (
    <main className="mt-5 flex justify-center">
      <section className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold text-[#d97745]">로그인 데모</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">다시 만나서 반가워요</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          홈 상단의 로그인 버튼을 눌렀을 때 열리는 예시 화면입니다.
        </p>
        <div className="mt-6 space-y-3">
          <div className="rounded-2xl bg-[#fbf6f0] px-4 py-3 text-sm text-stone-500">이메일</div>
          <div className="rounded-2xl bg-[#fbf6f0] px-4 py-3 text-sm text-stone-500">비밀번호</div>
        </div>
        <button className={`mt-5 w-full rounded-full bg-[#d97745] px-4 py-3 text-sm font-semibold text-white ${hoverSoftButton}`}>
          로그인
        </button>
        <button
          className={`mt-3 w-full rounded-full bg-[#f8f3ed] px-4 py-3 text-sm font-semibold text-stone-700 ${hoverSoftButton}`}
          onClick={() => navigateTo("#/")}
        >
          홈으로 돌아가기
        </button>
      </section>
    </main>
  );
}

export default function App() {
  const [hash, setHash] = useState(getCurrentHash());

  useEffect(() => {
    const handleHashChange = () => setHash(getCurrentHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const path = hash.replace(/^#/, "");

  let content = <HomePage />;

  if (path === "/search") {
    content = <SearchDemoPage />;
  } else if (path === "/reserve") {
    content = <ReserveDemoPage />;
  } else if (path === "/login") {
    content = <LoginDemoPage />;
  } else if (path.startsWith("/restaurant/")) {
    content = <RestaurantDemoPage id={path.split("/")[2]} />;
  } else if (path.startsWith("/category/")) {
    content = <CategoryDemoPage slug={path.split("/")[2]} />;
  } else if (path.startsWith("/collection/")) {
    content = <CollectionDemoPage slug={decodeURIComponent(path.split("/")[2])} />;
  }

  return <AppShell>{content}</AppShell>;
}
