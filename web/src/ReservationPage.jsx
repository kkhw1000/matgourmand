import { useEffect, useRef, useState } from "react";
import { apiRequest, authHeaders } from "./api";

const statusLabels = {
  PENDING: "예약 신청 접수",
  CONFIRMED: "예약 확정",
  REJECTED: "예약 거절",
  CANCELED: "예약 취소"
};

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(date);
}

export default function ReservationPage({ reservationId, isComplete = false, draft, session, navigate, header }) {
  const isPreview = reservationId === "preview";
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(!isPreview && Boolean(session?.accessToken));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const cancelDialogRef = useRef(null);
  const cancelingRef = useRef(false);
  cancelingRef.current = canceling;

  useEffect(() => {
    if (isPreview || !session?.accessToken) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch(`/api/reservations/${encodeURIComponent(reservationId)}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      signal: controller.signal
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "예약 정보를 불러오지 못했습니다.");
        }
        return result.data;
      })
      .then(setReservation)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError instanceof TypeError ? "서버에 연결할 수 없습니다." : requestError.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [isPreview, reservationId, session?.accessToken]);

  useEffect(() => {
    if (!showCancelDialog) return;
    const previousFocus = document.activeElement;
    cancelDialogRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !cancelingRef.current) setShowCancelDialog(false);
      if (event.key !== "Tab") return;
      const buttons = cancelDialogRef.current?.querySelectorAll('button:not([disabled])');
      if (!buttons?.length) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (document.activeElement === cancelDialogRef.current || event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => { document.removeEventListener("keydown", handleKeyDown); previousFocus?.focus?.(); };
  }, [showCancelDialog]);

  const submitReservation = async () => {
    if (!draft) return;
    if (!session?.accessToken) {
      window.sessionStorage.setItem("matgourmand-return-to", "/reservations/preview");
      navigate("/login");
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const result = await apiRequest("/api/reservations", {
        method: "POST",
        headers: { ...authHeaders(session), "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: Number(draft.storeId),
          reservationTime: `${draft.date}T${draft.time}:00`,
          partySize: draft.partySize,
          requestNote: draft.requestNote
        })
      });
      window.sessionStorage.removeItem("matgourmand-reservation-draft");
      navigate(`/reservations/${result.id}/complete`);
    } catch (requestError) {
      setSubmitError(requestError instanceof TypeError ? "서버에 연결할 수 없습니다." : requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const cancelReservation = async () => {
    if (!reservation || canceling) return;
    setCanceling(true);
    setCancelError("");
    try {
      const result = await apiRequest(`/api/reservations/${reservation.id}/cancel`, {
        method: "PUT",
        headers: authHeaders(session)
      });
      setReservation(result);
      setCancelSuccess(true);
      setShowCancelDialog(false);
    } catch (requestError) {
      setCancelError(requestError instanceof TypeError ? "서버에 연결할 수 없습니다." : requestError.message);
    } finally {
      setCanceling(false);
    }
  };

  const details = isPreview && draft
    ? {
        storeName: draft.storeName,
        region: draft.region,
        theme: draft.theme,
        dateTime: `${draft.date}T${draft.time}:00`,
        partySize: draft.partySize,
        requestNote: draft.requestNote
      }
    : reservation
      ? {
          storeName: reservation.storeName,
          dateTime: reservation.reservationTime,
          partySize: reservation.partySize,
          requestNote: reservation.requestNote,
          customerName: reservation.customerName
        }
      : null;
  const showCompletion = isComplete && reservation?.status !== "CANCELED" && reservation?.status !== "REJECTED";

  return (
    <div className="min-h-screen bg-[#fffaf6] text-stone-900">
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-5 sm:px-6 lg:px-8">
        {header}
        <main className="mt-5">
          <button type="button" onClick={() => navigate(isPreview ? "/" : "/reservations")} className="rounded-lg py-2 text-sm font-semibold text-stone-600 hover:text-[#a94444] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f]">← {isPreview ? "식당 찾기로 돌아가기" : "내 예약으로 돌아가기"}</button>

          <section className="mt-4 overflow-hidden rounded-[2rem] border border-[#f0dfcf] bg-[linear-gradient(135deg,#fff8ef_0%,#f4dacd_100%)] p-6 shadow-[0_24px_60px_rgba(122,73,34,0.08)] sm:p-9">
            <p className="text-sm font-semibold tracking-[0.14em] text-[#a94444]">RESERVATION</p>
            <h1 className="mt-3 font-['Cormorant_Garamond'] text-4xl font-semibold leading-tight sm:text-5xl">
              {isPreview ? "예약 내용을 확인해 주세요." : showCompletion ? "예약 신청이 접수됐어요." : "예약 상세"}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-700 sm:text-base">
              {isPreview
                ? "선택한 날짜와 인원, 요청 사항을 한 번 더 살펴보세요. 이 화면은 예약 접수 전 미리보기입니다."
                : showCompletion ? `예약 번호 #${reservationId} · 식당이 확인하면 상태가 변경됩니다.` : "식당 방문에 필요한 예약 정보와 현재 상태를 확인할 수 있습니다."}
            </p>
          </section>

          {!isPreview && !session ? (
            <section className="mt-5 rounded-[2rem] bg-white p-7 text-center shadow-sm">
              <h2 className="text-xl font-semibold">로그인이 필요합니다</h2>
              <p className="mt-2 text-sm text-stone-500">예약 상세는 본인 계정으로 로그인한 뒤 확인할 수 있어요.</p>
              <button type="button" onClick={() => navigate("/login")} className="mt-5 rounded-full bg-[#dd6b6b] px-6 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f]">로그인</button>
            </section>
          ) : loading ? (
            <p role="status" className="mt-5 rounded-[2rem] bg-white p-8 text-center text-stone-600">예약 정보를 불러오는 중입니다...</p>
          ) : error || !details ? (
            <section className="mt-5 rounded-[2rem] bg-white p-8 text-center shadow-sm">
              <h2 className="text-xl font-semibold">예약 정보를 표시할 수 없어요</h2>
              <p role="alert" className="mt-2 text-sm text-stone-500">{error || "확인할 예약 내용이 없습니다. 식당을 선택해 다시 진행해 주세요."}</p>
            </section>
          ) : (
            <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
              <section className="rounded-[2rem] border border-stone-100 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.05)] sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-6">
                  <div>
                    <p className="text-sm font-semibold text-[#a94444]">{isPreview ? "예약 전 확인" : `예약 번호 #${reservation.id}`}</p>
                    <h2 className="mt-2 text-2xl font-semibold">{details.storeName}</h2>
                    {details.region && <p className="mt-1 text-sm text-stone-500">서울 {details.region} · {details.theme}</p>}
                  </div>
                  <span className={`rounded-full px-4 py-2 text-sm font-semibold ${["CANCELED", "REJECTED"].includes(reservation?.status) ? "bg-stone-100 text-stone-600" : "bg-[#fff1ef] text-[#a94444]"}`}>
                    {isPreview ? "아직 접수 전" : statusLabels[reservation.status] || reservation.status}
                  </span>
                </div>

                <dl className="grid gap-5 py-6 sm:grid-cols-2">
                  <div><dt className="text-sm text-stone-500">방문 일시</dt><dd className="mt-2 font-semibold">{formatDateTime(details.dateTime)}</dd></div>
                  <div><dt className="text-sm text-stone-500">방문 인원</dt><dd className="mt-2 font-semibold">{details.partySize}명</dd></div>
                  {details.customerName && <div><dt className="text-sm text-stone-500">예약자</dt><dd className="mt-2 font-semibold">{details.customerName}</dd></div>}
                  {!isPreview && <div><dt className="text-sm text-stone-500">신청 일시</dt><dd className="mt-2 font-semibold">{formatDateTime(reservation.createdAt)}</dd></div>}
                </dl>
                <div className="border-t border-stone-100 pt-6">
                  <h3 className="text-sm font-semibold">요청 사항</h3>
                  <p className="mt-2 rounded-[1.4rem] bg-[#fbf6f0] p-4 text-sm leading-6 text-stone-700">{details.requestNote || "요청 사항이 없습니다."}</p>
                </div>
              </section>

              <aside className="self-start rounded-[2rem] bg-[#f7f1e8] p-4 sm:p-5">
                <div className="rounded-[1.7rem] bg-white p-6">
                  <p className="text-sm font-semibold text-[#a94444]">안내</p>
                  <h2 className="mt-2 text-lg font-semibold">{isPreview ? "아직 예약이 접수되지 않았어요" : "예약 상태를 확인해 주세요"}</h2>
                  <p className="mt-3 text-sm leading-6 text-stone-600">
                    {isPreview
                      ? "내용을 확인하고 예약 신청하기를 누르면 식당으로 예약이 접수됩니다."
                      : reservation.status === "PENDING"
                        ? "식당에서 예약을 확인하고 있습니다. 상태가 변경되면 이 페이지에서 다시 확인해 주세요."
                        : reservation.status === "CONFIRMED"
                          ? "예약이 확정되었습니다. 방문 일시를 다시 확인해 주세요."
                          : reservation.status === "REJECTED"
                            ? "식당에서 예약을 거절했습니다. 다른 시간대를 선택해 다시 예약해 주세요."
                            : "취소된 예약입니다."}
                  </p>
                  {isPreview && (
                    <button type="button" onClick={() => navigate(`/?store=${encodeURIComponent(draft.storeId)}`)} className="mt-6 w-full rounded-full bg-[#dd6b6b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#c85858] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f]">예약 내용 수정하기</button>
                  )}
                  {isPreview && <button type="button" onClick={submitReservation} disabled={submitting} className="mt-3 w-full rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f] disabled:cursor-wait disabled:opacity-60">{submitting ? "예약을 접수하는 중..." : session ? "예약 신청하기" : "로그인하고 예약 신청하기"}</button>}
                  {submitError && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{submitError}</p>}
                  {cancelSuccess && <p role="status" className="mt-4 rounded-xl bg-[#fff1ef] p-3 text-sm text-[#a94444]">예약이 취소되었습니다.</p>}
                  {!isPreview && !["CANCELED", "REJECTED"].includes(reservation?.status) && new Date(reservation.reservationTime) > new Date() && <button type="button" onClick={() => { setCancelError(""); setShowCancelDialog(true); }} className="mt-5 w-full rounded-full border border-[#dd6b6b] px-5 py-3 text-sm font-semibold text-[#a94444] hover:bg-[#fff1ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f]">예약 취소</button>}
                  {!isPreview && <button type="button" onClick={() => navigate("/reservations")} className="mt-3 w-full rounded-full bg-[#fbf6f0] px-5 py-3 text-sm font-semibold text-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f]">내 예약 목록</button>}
                </div>
              </aside>
            </div>
          )}
        </main>
      </div>
      {showCancelDialog && <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button type="button" aria-label="취소 확인 창 닫기" onClick={() => !canceling && setShowCancelDialog(false)} className="absolute inset-0 bg-stone-950/60" /><section ref={cancelDialogRef} tabIndex={-1} role="alertdialog" aria-modal="true" aria-labelledby="cancel-title" aria-describedby="cancel-description" className="relative w-full max-w-md rounded-[2rem] bg-white p-6 shadow-[0_30px_100px_rgba(28,20,16,0.35)] outline-none"><h2 id="cancel-title" className="text-xl font-semibold">예약을 취소할까요?</h2><p id="cancel-description" className="mt-3 text-sm leading-6 text-stone-600">{reservation?.storeName} · {formatDateTime(reservation?.reservationTime)} 예약이 취소됩니다.</p>{cancelError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{cancelError}</p>}<div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setShowCancelDialog(false)} disabled={canceling} className="rounded-full bg-stone-100 px-5 py-3 text-sm font-semibold text-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f]">돌아가기</button><button type="button" onClick={cancelReservation} disabled={canceling} className="rounded-full bg-[#dd6b6b] px-5 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f] disabled:cursor-wait disabled:opacity-60">{canceling ? "취소 처리 중..." : "예약 취소하기"}</button></div></section></div>}
    </div>
  );
}
