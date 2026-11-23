import { useState } from "react";

const inputClass =
  "mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#dd6b6b] focus:ring-2 focus:ring-[#dd6b6b]/20";

export default function AuthPage({ mode, navigate, onAuthenticated, header }) {
  const isSignup = mode === "signup";
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    role: "CUSTOMER"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const update = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (isSignup && form.password !== form.confirmPassword) {
      setError("비밀번호가 서로 다릅니다. 다시 확인해 주세요.");
      return;
    }

    setPending(true);
    setError("");
    const payload = isSignup
      ? {
          email: form.email.trim(),
          password: form.password,
          name: form.name.trim(),
          phone: form.phone.trim(),
          role: form.role
        }
      : { email: form.email.trim(), password: form.password };

    try {
      const response = await fetch(isSignup ? "/api/auth/signup" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || !result.success || !result.data?.accessToken) {
        throw new Error(result.message || "요청을 처리하지 못했습니다. 다시 시도해 주세요.");
      }
      onAuthenticated(result.data);
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요."
          : requestError.message
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf6] text-stone-900">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        {header}
        <main className="mt-5 grid overflow-hidden rounded-[2rem] border border-[#f0dfcf] bg-white shadow-[0_24px_60px_rgba(122,73,34,0.08)] lg:min-h-[650px] lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="relative flex flex-col justify-between overflow-hidden bg-[linear-gradient(145deg,#f8e4cd_0%,#f6d9ce_55%,#e6a89c_100%)] p-7 sm:p-10 lg:p-12">
            <div className="relative z-10">
              <p className="text-sm font-semibold tracking-[0.18em] text-[#a94444]">MATGOURMAND</p>
              <h1 className="mt-8 max-w-md font-['Cormorant_Garamond'] text-4xl font-semibold leading-tight sm:text-5xl">
                좋은 식사의 시작은
                <br />
                좋은 선택에서.
              </h1>
              <p className="mt-5 max-w-sm text-sm leading-7 text-stone-700">
                마음에 드는 공간을 발견하고, 편안하게 예약해 보세요.
              </p>
            </div>
            <div className="relative z-10 mt-16 rounded-[1.7rem] border border-white/70 bg-white/65 p-5 backdrop-blur-sm">
              <p className="font-['Cormorant_Garamond'] text-3xl font-semibold text-[#a94444]">A table worth sharing.</p>
              <p className="mt-2 text-sm text-stone-700">오늘의 취향이 내일의 단골이 되도록.</p>
            </div>
            <div className="pointer-events-none absolute -bottom-28 -right-24 h-80 w-80 rounded-full border-[42px] border-white/25" />
            <div className="pointer-events-none absolute -left-20 top-48 h-64 w-64 rounded-full border-[32px] border-white/20" />
          </aside>

          <section className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
            <div className="w-full max-w-md">
              <p className="text-sm font-semibold text-[#a94444]">{isSignup ? "새로운 시작" : "다시 만나 반가워요"}</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                {isSignup ? "회원가입" : "로그인"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone-500">
                {isSignup ? "몇 가지 정보만 입력하면 바로 시작할 수 있어요." : "계정에 로그인하고 마음에 드는 식당을 찾아보세요."}
              </p>

              <form onSubmit={submit} className="mt-8 space-y-4">
                {isSignup && (
                  <>
                    <fieldset>
                      <legend className="text-sm font-semibold text-stone-700">가입 유형</legend>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {[
                          { value: "CUSTOMER", label: "일반 회원" },
                          { value: "OWNER", label: "식당 점주" }
                        ].map((role) => (
                          <button
                            key={role.value}
                            type="button"
                            onClick={() => update("role", role.value)}
                            aria-pressed={form.role === role.value}
                            className={`rounded-2xl border px-4 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f] ${
                              form.role === role.value
                                ? "border-[#dd6b6b] bg-[#fff1ef] text-[#a94444]"
                                : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                            }`}
                          >
                            {role.label}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                    <label className="block text-sm font-semibold text-stone-700">
                      이름
                      <input className={inputClass} value={form.name} onChange={(event) => update("name", event.target.value)} autoComplete="name" placeholder="이름을 입력해 주세요" required />
                    </label>
                  </>
                )}
                <label className="block text-sm font-semibold text-stone-700">
                  이메일
                  <input className={inputClass} type="email" value={form.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" placeholder="name@example.com" required />
                </label>
                {isSignup && (
                  <label className="block text-sm font-semibold text-stone-700">
                    휴대전화 <span className="font-normal text-stone-400">(선택)</span>
                    <input className={inputClass} type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} autoComplete="tel" placeholder="010-1234-5678" />
                  </label>
                )}
                <label className="block text-sm font-semibold text-stone-700">
                  비밀번호
                  <span className="relative block">
                    <input className={`${inputClass} pr-16`} type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => update("password", event.target.value)} autoComplete={isSignup ? "new-password" : "current-password"} placeholder="비밀번호를 입력해 주세요" required />
                    <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-4 top-1/2 mt-1 -translate-y-1/2 rounded text-xs font-semibold text-[#a94444] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f]" aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}>
                      {showPassword ? "숨기기" : "보기"}
                    </button>
                  </span>
                </label>
                {isSignup && (
                  <label className="block text-sm font-semibold text-stone-700">
                    비밀번호 확인
                    <input className={inputClass} type="password" value={form.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} autoComplete="new-password" placeholder="비밀번호를 다시 입력해 주세요" required />
                  </label>
                )}

                {error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

                <button type="submit" disabled={pending} className="w-full rounded-full bg-[#dd6b6b] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#c85858] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f] disabled:cursor-wait disabled:opacity-60">
                  {pending ? "처리 중..." : isSignup ? "회원가입하기" : "로그인하기"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-stone-500">
                {isSignup ? "이미 계정이 있으신가요?" : "아직 계정이 없으신가요?"}{" "}
                <button type="button" onClick={() => navigate(isSignup ? "/login" : "/signup")} className="font-semibold text-[#a94444] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf4f4f]">
                  {isSignup ? "로그인" : "회원가입"}
                </button>
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
