import { login } from "./actions";
import PasswordResetForm from "@/components/PasswordResetForm";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  const errorMessage =
    error === "missing"
      ? "이메일과 비밀번호를 입력해주세요."
      : error === "invalid"
        ? "이메일 또는 비밀번호를 확인해주세요."
        : null;

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand">
          <strong>STMS</strong>
          <span>Sweet Tennis Management System</span>
        </div>

        <div className="auth-heading">
          <p className="eyebrow">SWEET TENNIS</p>
          <h1>로그인</h1>
          <p>달콤한테니스 운영 시스템에 로그인해주세요.</p>
        </div>

        <form className="auth-form">
          <label htmlFor="email">이메일</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="이메일 주소"
            required
          />

          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="비밀번호"
            required
          />

          {errorMessage ? (
            <p className="auth-error" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <button className="auth-submit" formAction={login}>
            로그인
          </button>
        </form>

        <PasswordResetForm />

        <p className="auth-note">
          계정 생성 및 권한 설정은 운영진이 관리합니다.
        </p>
      </section>
    </main>
  );
}
