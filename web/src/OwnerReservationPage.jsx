import { useEffect, useRef, useState } from "react";
import { apiRequest, authHeaders } from "./api";

const filters = [
  { status: "PENDING", label: "확인 대기" },
  { status: "CONFIRMED", label: "확정" },
  { status: "REJECTED", label: "거절" },
  { status: "CANCELED", label: "취소" }
];

const dateTime = (value) => new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "long", timeStyle: "short"
}).format(new Date(value));

export default function OwnerReservationPage({ session, navigate, header }) {
  const [stores, setStores] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [storeId, setStoreId] = useState("all");
  const [status, setStatus] = useState("PENDING");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [rejectTarget, setRejectTarget] = useState(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (session?.user?.role !== "OWNER") return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const load = async () => {
      try {
        const allStores = await apiRequest("/api/stores", { signal: controller.signal });
        const ownedStores = allStores.filter((store) => String(store.ownerId) === String(session.user.id));
        const lists = await Promise.all(ownedStores.map((store) => apiRequest(
          `/api/stores/${store.id}/reservations`,
          { headers: authHeaders(session), signal: controller.signal }
        )));
        if (controller.signal.aborted) return;
        setStores(ownedStores);
        setReservations(lists.flat().sort((a, b) => new Date(a.reservationTime) - new Date(b.reservationTime)));
      } catch (requestError) {
        if (!controller.signal.aborted) setError(requestError instanceof TypeError ? "서버에 연결할 수 없습니다." : requestError.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [session?.accessToken, session?.user?.id, session?.user?.role, reloadKey]);

  useEffect(() => {
    if (!rejectTarget) return;
    const previousFocus = document.activeElement;
    dialogRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape" && busyId === null) setRejectTarget(null);
      if (event.key !== "Tab") return;
      const buttons = dialogRef.current?.querySelectorAll("button:not([disabled])");
      if (!buttons?.length) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (document.activeElement === dialogRef.current || (event.shiftKey && document.activeElement === first)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("keydown", onKeyDown); previousFocus?.focus?.(); };
  }, [rejectTarget, busyId]);

  const updateReservation = async (reservation, action) => {
    if (busyId !== null) return;
    setBusyId(reservation.id);
    setActionError("");
    setNotice("");
    try {
      const updated = await apiRequest(`/api/reservations/${reservation.id}/${action}`, {
        method: "PUT", headers: authHeaders(session)
      });
      setReservations((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice(`${reservation.customerName}님의 예약을 ${action === "confirm" ? "확정" : "거절"}했습니다.`);
      setRejectTarget(null);
    } catch (requestError) {
      setActionError(requestError instanceof TypeError ? "서버에 연결할 수 없습니다." : requestError.message);
    } finally {
      setBusyId(null);
    }
  };

  const selectedReservations = reservations.filter((item) => storeId === "all" || String(item.storeId) === storeId);
  const visibleReservations = selectedReservations.filter((item) => item.status === status);

  return (
    <div className="min-h-screen bg-[#fffaf6] text-stone-900">
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-5 sm:px-6 lg:px-8">
        {header}
        <main className="mt-5">
          <section className="rounded-[2rem] border border-[#efd8c7] bg-[linear-gradient(135deg,#fff8ef_0%,#f4dacd_100%)] p-6 sm:p-9">
            <p className="text-sm font-semibold tracking-[0.14em] text-[#a94444]">OWNER DESK</p>
            <h1 className="mt-3 font-['Cormorant_Garamond'] text-4xl font-semibold sm:text-5xl">예약 관리</h1>
            <p className="mt-3 text-sm leading-6 text-stone-700">들어온 예약을 확인하고, 손님에게 확정 또는 거절 결과를 알려주세요.</p>
          </section>

          {!session ? (
            <section className="mt-5 rounded-[2rem] bg-white p-8 text-center shadow-sm">
              <h2 className="text-xl font-semibold">점주 로그인이 필요합니다</h2>
              <p className="mt-2 text-sm text-stone-500">내 식당의 예약은 로그인 후 확인할 수 있어요.</p>
              <button type="button" onClick={() => { window.sessionStorage.setItem("matgourmand-return-to", "/owner/reservations"); navigate("/login"); }} className="mt-5 rounded-full bg-[#dd6b6b] px-6 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f]">로그인</button>
            </section>
          ) : session.user?.role !== "OWNER" ? (
            <section role="alert" className="mt-5 rounded-[2rem] bg-white p-8 text-center shadow-sm">점주 계정으로만 예약을 관리할 수 있습니다.</section>
          ) : loading ? (
            <p role="status" className="mt-5 rounded-[2rem] bg-white p-8 text-center text-stone-600">예약을 불러오는 중입니다...</p>
          ) : error ? (
            <section role="alert" className="mt-5 rounded-[2rem] bg-white p-8 text-center"><p>{error}</p><button type="button" onClick={() => setReloadKey((key) => key + 1)} className="mt-4 rounded-full bg-[#dd6b6b] px-5 py-2.5 text-sm font-semibold text-white">다시 시도</button></section>
          ) : stores.length === 0 ? (
            <section className="mt-5 rounded-[2rem] bg-white p-8 text-center"><h2 className="text-xl font-semibold">등록된 식당이 없습니다</h2><p className="mt-2 text-sm text-stone-500">식당을 등록하면 이곳에서 예약을 관리할 수 있습니다.</p></section>
          ) : (
            <>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {filters.slice(0, 3).map((item) => <div key={item.status} className="rounded-[1.5rem] border border-[#f0dfcf] bg-white p-5"><p className="text-sm text-stone-500">{item.label}</p><p className="mt-2 text-3xl font-semibold text-[#a94444]">{selectedReservations.filter((reservation) => reservation.status === item.status).length}<span className="ml-1 text-base font-normal text-stone-500">건</span></p></div>)}
              </div>
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div><h2 className="text-xl font-semibold">예약 목록</h2><p className="mt-1 text-sm text-stone-500">확인 대기 예약을 먼저 처리해 주세요.</p></div>
                {stores.length > 1 && <label className="text-sm font-semibold text-stone-700">식당 선택<select value={storeId} onChange={(event) => setStoreId(event.target.value)} className="mt-2 block w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f] sm:min-w-56"><option value="all">전체 식당</option>{stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}</select></label>}
              </div>
              <div role="group" aria-label="예약 상태" className="mt-4 flex flex-wrap gap-2">
                {filters.map((item) => <button key={item.status} type="button" aria-pressed={status === item.status} onClick={() => { setStatus(item.status); setActionError(""); }} className={`rounded-full px-4 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f] ${status === item.status ? "bg-[#dd6b6b] text-white" : "bg-white text-stone-600 hover:bg-[#fff1ef]"}`}>{item.label} <span className="ml-1 opacity-70">{selectedReservations.filter((reservation) => reservation.status === item.status).length}</span></button>)}
              </div>
              {notice && <p role="status" className="mt-4 rounded-2xl bg-[#fff1ef] p-4 text-sm font-semibold text-[#a94444]">{notice}</p>}
              {actionError && <p role="alert" className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{actionError}</p>}
              {visibleReservations.length === 0 ? <section className="mt-5 rounded-[2rem] bg-white p-8 text-center"><h3 className="text-lg font-semibold">{status === "PENDING" ? "확인할 예약이 없습니다" : `${filters.find((item) => item.status === status)?.label} 예약이 없습니다`}</h3><p className="mt-2 text-sm text-stone-500">새 예약이 들어오면 이곳에 표시됩니다.</p></section> : (
                <div className="mt-5 grid gap-4 lg:grid-cols-2">{visibleReservations.map((reservation) => <article key={reservation.id} className="min-w-0 rounded-[2rem] border border-[#f0dfcf] bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-semibold text-[#a94444]">예약 #{reservation.id} · {reservation.storeName}</p><h3 className="mt-2 text-xl font-semibold">{reservation.customerName} 님</h3></div><span className="rounded-full bg-[#fff1ef] px-3 py-1.5 text-xs font-semibold text-[#a94444]">{filters.find((item) => item.status === reservation.status)?.label}</span></div><dl className="mt-5 grid grid-cols-2 gap-4 border-t border-stone-100 pt-5 text-sm"><div><dt className="text-stone-500">방문 일시</dt><dd className="mt-1 font-semibold">{dateTime(reservation.reservationTime)}</dd></div><div><dt className="text-stone-500">인원</dt><dd className="mt-1 font-semibold">{reservation.partySize}명</dd></div></dl><div className="mt-4 rounded-2xl bg-[#fbf6f0] p-4 text-sm"><p className="font-semibold text-stone-600">요청 사항</p><p className="mt-1 break-words text-stone-700">{reservation.requestNote || "요청 사항이 없습니다."}</p></div>{reservation.status === "PENDING" && <div className="mt-5 flex flex-col gap-2 sm:flex-row"><button type="button" disabled={busyId !== null} onClick={() => updateReservation(reservation, "confirm")} className="rounded-full bg-[#dd6b6b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#c85858] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f] disabled:cursor-wait disabled:opacity-60">{busyId === reservation.id ? "처리 중..." : "예약 확정"}</button><button type="button" disabled={busyId !== null} onClick={() => { setActionError(""); setRejectTarget(reservation); }} className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f] disabled:opacity-60">예약 거절</button></div>}</article>)}</div>
              )}
            </>
          )}
        </main>
      </div>
      {rejectTarget && <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button type="button" aria-label="거절 확인 창 닫기" onClick={() => busyId === null && setRejectTarget(null)} className="absolute inset-0 bg-stone-950/60" /><section ref={dialogRef} tabIndex={-1} role="alertdialog" aria-modal="true" aria-labelledby="reject-title" aria-describedby="reject-description" className="relative w-full max-w-md rounded-[2rem] bg-white p-6 shadow-[0_30px_100px_rgba(28,20,16,0.35)] outline-none"><h2 id="reject-title" className="text-xl font-semibold">예약을 거절할까요?</h2><p id="reject-description" className="mt-3 text-sm leading-6 text-stone-600">{rejectTarget.customerName}님의 {dateTime(rejectTarget.reservationTime)} 예약을 거절합니다. 이 시간대는 다시 예약 가능해집니다.</p>{actionError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}<div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={busyId !== null} onClick={() => setRejectTarget(null)} className="rounded-full bg-stone-100 px-5 py-3 text-sm font-semibold text-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f]">돌아가기</button><button type="button" disabled={busyId !== null} onClick={() => updateReservation(rejectTarget, "reject")} className="rounded-full bg-[#dd6b6b] px-5 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f] disabled:opacity-60">{busyId !== null ? "처리 중..." : "거절하기"}</button></div></section></div>}
    </div>
  );
}
