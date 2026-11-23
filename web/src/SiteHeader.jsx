export default function SiteHeader({ navigate, session, onLogout }) {
  return (
    <header className="flex items-center justify-between gap-2 rounded-3xl border border-stone-100 bg-white px-3 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:gap-3 sm:px-5">
      <button
        type="button"
        onClick={() => navigate("/")}
        className="flex min-w-0 items-center gap-2 rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#bf4f4f] sm:gap-3"
        aria-label="MatGourmand 홈으로 이동"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#dd6b6b] font-['Cormorant_Garamond'] text-xl font-semibold text-white sm:h-11 sm:w-11 sm:rounded-2xl sm:text-2xl">
          M
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-semibold tracking-tight sm:text-sm">MatGourmand</span>
          <span className="hidden truncate text-xs text-stone-500 sm:block">맛있는 순간을 위한 예약</span>
        </span>
      </button>

      {session ? (
        <div className="flex items-center gap-1 sm:gap-3">
          <span className="hidden text-sm font-medium text-stone-600 sm:inline">
            {session.user?.name}님
          </span>
          {session.user?.role === "CUSTOMER" && <button type="button" onClick={() => navigate("/reservations")} className="rounded-full px-2 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f] sm:px-4 sm:text-sm">내 예약</button>}
          {session.user?.role === "OWNER" && <button type="button" onClick={() => navigate("/owner/reservations")} className="rounded-full px-2 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f] sm:px-4 sm:text-sm">예약 관리</button>}
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full bg-[#fbe7e5] px-3 py-2 text-xs font-semibold text-[#a94444] hover:bg-[#f8d8d5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f] sm:px-4 sm:text-sm"
          >
            로그아웃
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="rounded-full px-2 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f] sm:px-4 sm:text-sm"
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="rounded-full bg-[#dd6b6b] px-2 py-2 text-xs font-semibold text-white hover:bg-[#c85858] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f] sm:px-4 sm:text-sm"
          >
            회원가입
          </button>
        </div>
      )}
    </header>
  );
}
