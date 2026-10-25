import { useEffect, useState } from "react";
import { apiRequest } from "./api";
import { mapStore } from "./storeData";

export default function StoreDetailPage({ storeId, navigate, header }) {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    apiRequest(`/api/stores/${encodeURIComponent(storeId)}`, { signal: controller.signal })
      .then((data) => setStore(mapStore(data)))
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError instanceof TypeError ? "서버에 연결할 수 없습니다." : requestError.message);
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [storeId, reloadKey]);

  if (loading || error) {
    return <div className="min-h-screen bg-[#fffaf6] text-stone-900"><div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">{header}<main className="mx-auto mt-16 max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-sm"><p role={error ? "alert" : "status"} className="text-stone-600">{error || "식당 정보를 불러오는 중입니다..."}</p>{error && <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="mt-5 rounded-full bg-[#dd6b6b] px-6 py-3 text-sm font-semibold text-white">다시 시도</button>}</main></div></div>;
  }
  if (!store) {
    return (
      <div className="min-h-screen bg-[#fffaf6] text-stone-900">
        <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
          {header}
          <main className="mx-auto mt-16 max-w-xl rounded-[2rem] border border-stone-100 bg-white p-8 text-center shadow-sm">
            <p className="font-['Cormorant_Garamond'] text-6xl text-[#dd6b6b]">404</p>
            <h1 className="mt-3 text-2xl font-semibold">식당을 찾을 수 없어요</h1>
            <p className="mt-3 text-sm text-stone-500">목록에서 다른 식당을 선택해 주세요.</p>
            <button type="button" onClick={() => navigate("/")} className="mt-7 rounded-full bg-[#dd6b6b] px-6 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f]">
              식당 목록으로
            </button>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf6] text-stone-900">
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-5 sm:px-6 lg:px-8">
        {header}
        <main className="mt-5">
          <button type="button" onClick={() => navigate(`/?store=${encodeURIComponent(store.id)}`)} className="rounded-lg py-2 text-sm font-semibold text-stone-600 hover:text-[#a94444] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f]">
            ← 식당 목록으로
          </button>

          <div className="mt-4 grid gap-5 lg:grid-cols-[1.45fr_0.85fr]">
            <div className="space-y-5">
              <section className="overflow-hidden rounded-[2rem] border border-[#f0dfcf] bg-white shadow-[0_24px_60px_rgba(122,73,34,0.08)]">
                <div className={`relative h-56 sm:h-72 ${store.thumbnail}`}>
                  <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(45,27,20,0.32),transparent_60%)]" />
                  <span className="absolute bottom-5 left-5 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-stone-700 backdrop-blur-sm sm:left-7">
                    {store.region} · MatGourmand 추천 식당
                  </span>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[#a94444]">RESTAURANT</p>
                      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{store.name}</h1>
                      <p className="mt-3 text-base text-stone-600">{store.summary}</p>
                    </div>
                    {store.theme && <span className="rounded-full bg-[#fff1ef] px-4 py-2 text-sm font-semibold text-[#a94444]">{store.theme}</span>}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#fbf6f0] px-4 py-2 text-sm font-medium text-stone-700">{store.address}</span>
                    {store.phone && <span className="rounded-full bg-[#fbf6f0] px-4 py-2 text-sm font-medium text-stone-700">{store.phone}</span>}
                  </div>
                </div>
              </section>

              <section className="rounded-[2rem] border border-stone-100 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.05)] sm:p-8">
                <h2 className="text-xl font-semibold">이런 시간을 보내기 좋아요</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
                  {store.summary} 분위기를 찾고 있다면 살펴보세요. 마음에 드는 날짜와 시간대를 고른 뒤 예약 내용을 확인할 수 있습니다.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.4rem] bg-[#fbf6f0] p-5">
                    <p className="text-xs font-semibold text-stone-500">지역</p>
                    <p className="mt-2 font-semibold">{store.region || store.address}</p>
                  </div>
                  <div className="rounded-[1.4rem] bg-[#fbf6f0] p-5">
                    <p className="text-xs font-semibold text-stone-500">1인 예상 가격</p>
                    <p className="mt-2 font-semibold">{store.averagePrice != null ? `약 ${store.averagePrice.toLocaleString("ko-KR")}원` : "식당에 문의해 주세요"}</p>
                  </div>
                </div>
              </section>
            </div>

            <aside className="self-start rounded-[2rem] bg-[#f7f1e8] p-4 sm:p-5 lg:sticky lg:top-5">
              <section className="rounded-[1.7rem] bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                <p className="text-sm font-semibold text-[#a94444]">RESERVATION</p>
                <h2 className="mt-2 text-xl font-semibold">예약 시간 확인</h2>
                <p className="mt-2 text-sm leading-6 text-stone-500">날짜와 인원수를 선택하면 남은 시간대를 확인할 수 있습니다.</p>
                <button type="button" onClick={() => navigate(`/?store=${encodeURIComponent(store.id)}`)} disabled={!store.availableNow} className="mt-7 w-full rounded-full bg-[#dd6b6b] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#c85858] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600">
                  예약 시간 선택하기
                </button>
                {!store.availableNow && <p className="mt-4 text-center text-xs leading-5 text-stone-500">이 식당은 현재 예약을 받지 않습니다.</p>}
              </section>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
