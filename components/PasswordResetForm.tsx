"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PasswordResetForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });

    if (resetError) {
      console.error("[STMS] Password reset error:", resetError);
      setError(`재설정 메일 오류: ${resetError.message}`);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="auth-reset">
        <p>비밀번호 재설정 메일을 보냈습니다.</p>
        <span>메일의 링크를 눌러 새 비밀번호를 설정해주세요.</span>
      </div>
    );
  }

  return (
    <form className="auth-reset" onSubmit={handleSubmit}>
      <label htmlFor="reset-email">비밀번호를 잊으셨나요?</label>
      <input
        id="reset-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="이메일 주소"
        required
      />
      {error ? <p className="auth-error">오류: {error}</p> : null}
      <button className="auth-reset-button" type="submit">
        재설정 메일 보내기
      </button>
    </form>
  );
}
