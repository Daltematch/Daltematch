"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("비밀번호는 6자 이상 입력해주세요.");
      return;
    }

    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError("비밀번호 변경에 실패했습니다. 재설정 링크를 다시 요청해주세요.");
      setSaving(false);
      return;
    }

    setDone(true);
    setSaving(false);
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand">
          <strong>STMS</strong>
          <span>Sweet Tennis Management System</span>
        </div>

        <div className="auth-heading">
          <p className="eyebrow">ACCOUNT</p>
          <h1>비밀번호 변경</h1>
          <p>새로운 비밀번호를 설정해주세요.</p>
        </div>

        {done ? (
          <div className="auth-form">
            <p className="auth-success">비밀번호가 변경되었습니다.</p>
            <button className="auth-submit" type="button" onClick={() => router.push("/")}>
              STMS로 이동
            </button>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="password">새 비밀번호</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <label htmlFor="confirm">새 비밀번호 확인</label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              required
            />

            {error ? <p className="auth-error" role="alert">{error}</p> : null}

            <button className="auth-submit" type="submit" disabled={saving}>
              {saving ? "변경 중..." : "비밀번호 변경"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
