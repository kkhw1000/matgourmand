import { useEffect, useState } from "react";
import { apiRequest, authHeaders } from "./api";

const tabs = [
  { id: "upcoming", label: "예정" },
  { id: "past", label: "지난 예약" },
  { id: "canceled", label: "취소" }
];

const statusLabels = { PENDING: "신청 접수", CONFIRMED: "예약 확정", CANCELED: "예약 취소" };

export default function ReservationListPage({ session, navigate, header }) {
  const [reservations, setReservations] = useState([]);
  const [tab, setTab] = useState("upcoming");
  const [loading, setLoading] = useState(Boolean(session));
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!session?.accessToken) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    apiRequest("/api/reservations/me", { headers: authHeaders(session), signal: controller.signal })
      .then(setReservations)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError instanceof TypeError ? "서버에 연결할 수 없습니다." : requestError.message);
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [session?.accessToken, reloadKey]);

  const now = new Date();
  const visibleReservations = reservations.filter((reservation) => {
    if (tab === "canceled") return reservation.status === "CANCELED";
    if (reservation.status === "CANCELED") return false;
    return tab === "upcoming" ? new Date(reservation.reservationTime) >= now : new Date(reservation.reservationTime) < now;
  });

  return (
    <div className="min-h-screen bg-[#fffaf6] text-stone-900">
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-5 sm:px-6 lg:px-8">
        {header}
        <main className="mt-5">
          <section className="rounded-[2rem] border border-[#f0dfcf] bg-[linear-gradient(135deg,#fff8ef_0%,#f4dacd_100%)] p-6 sm:p-9">
            <p className="text-sm font-semibold tracking-[0.14em] text-[#a94444]">MY RESERVATIONS</p>
            <h1 className="mt-3 font-['Cormorant_Garamond'] text-4xl font-semibold sm:text-5xl">내 예약</h1>
            <p className="mt-3 text-sm text-stone-700">방문 예정과 지난 예약을 한곳에서 확인하세요.</p>
          </section>

          {!session ? (
            <section className="mt-5 rounded-[2rem] bg-white p-8 text-center shadow-sm">
              <h2 className="text-xl font-semibold">로그인이 필요합니다</h2>
              <p className="mt-2 text-sm text-stone-500">내 예약은 로그인 후 확인할 수 있어요.</p>
              <button type="button" onClick={() => { window.sessionStorage.setItem("matgourmand-return-to", "/reservations"); navigate("/login"); }} className="mt-5 rounded-full bg-[#dd6b6b] px-6 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f]">로그인</button>
            </section>
          ) : (
            <>
              <div role="group" aria-label="예약 분류" className="mt-5 flex flex-wrap gap-2">
                {tabs.map((item) => <button key={item.id} type="button" aria-pressed={tab === item.id} onClick={() => setTab(item.id)} className={`rounded-full px-5 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f] ${tab === item.id ? "bg-[#dd6b6b] text-white" : "bg-white text-stone-600 hover:bg-[#fff1ef]"}`}>{item.label}</button>)}
              </div>
              {loading ? <p role="status" className="mt-5 rounded-[2rem] bg-white p-8 text-center text-stone-600">예약을 불러오는 중입니다...</p>
                : error ? <div role="alert" className="mt-5 rounded-[2rem] bg-white p-8 text-center"><p>{error}</p><button type="button" onClick={() => setReloadKey((key) => key + 1)} className="mt-4 rounded-full bg-[#dd6b6b] px-5 py-2.5 text-sm font-semibold text-white">다시 시도</button></div>
                  : visibleReservations.length === 0 ? <section className="mt-5 rounded-[2rem] bg-white p-8 text-center"><h2 className="text-lg font-semibold">{tab === "upcoming" ? "예정된 예약이 없어요" : tab === "past" ? "지난 예약이 없어요" : "취소한 예약이 없어요"}</h2><button type="button" onClick={() => navigate("/")} className="mt-5 rounded-full bg-[#fff1ef] px-5 py-2.5 text-sm font-semibold text-[#a94444]">식당 둘러보기</button></section>
                    : <div className="mt-5 grid gap-4 sm:grid-cols-2">{visibleReservations.map((reservation) => <article key={reservation.id} className="rounded-[2rem] border border-stone-100 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.05)]"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-xs font-semibold text-[#a94444]">예약 #{reservation.id}</p><h2 className="mt-2 text-xl font-semibold">{reservation.storeName}</h2></div><span className="rounded-full bg-[#fff1ef] px-3 py-1.5 text-xs font-semibold text-[#a94444]">{statusLabels[reservation.status] || reservation.status}</span></div><p className="mt-4 text-sm text-stone-600">{new Intl.DateTimeFormat("ko-KR", { dateStyle: "long", timeStyle: "short" }).format(new Date(reservation.reservationTime))} · {reservation.partySize}명</p><button type="button" onClick={() => navigate(`/reservations/${reservation.id}`)} className="mt-5 rounded-full bg-[#dd6b6b] px-5 py-2.5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f]">예약 상세 보기 →</button></article>)}</div>}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
