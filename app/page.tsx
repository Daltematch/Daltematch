import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function formatTime(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${year}.${month}.${day}`;
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const authUserId = claimsData?.claims?.sub;

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
  }).format(new Date());

  const [{ data: member }, { data: events }] = await Promise.all([
    authUserId
      ? supabase
          .from("members")
          .select("name, role")
          .eq("auth_user_id", authUserId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("events")
      .select("event_id, title, event_type, event_date, start_at, end_at, venue_name, court_names, capacity")
      .eq("event_date", today)
      .order("start_at", { ascending: true }),
  ]);

  const todayEvents = events ?? [];
  const firstEvent = todayEvents[0] ?? null;

  let participantCount = 0;

  if (firstEvent) {
    const { count } = await supabase
      .from("participants")
      .select("participant_id", { count: "exact", head: true })
      .eq("event_id", firstEvent.event_id)
      .in("registration_status", ["APPLIED", "CONFIRMED"]);

    participantCount = count ?? 0;
  }

  const displayName = member?.name ?? "회원";

  return (
    <main className="stms-shell">
      <header className="topbar">
        <div>
          <div className="brand">STMS</div>
          <div className="brand-subtitle">Sweet Tennis Management System</div>
        </div>
        <div className="home-user">{displayName}님</div>
      </header>

      <section className="hero-card">
        <p className="eyebrow">SWEET TENNIS</p>
        <h1>좋은 사람들과,<br />더 즐거운 테니스.</h1>
        <p>달콤한테니스의 일정과 기록을 한 곳에서 관리합니다.</p>
        <div className="tennis-ball" aria-hidden="true">●</div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div><p className="eyebrow">NOTICE</p><h2>공지사항</h2></div>
          <span className="badge">준비중</span>
        </div>
        <div className="notice-card">
          <strong>공지사항</strong>
          <span>공지 관리 기능을 연결하면 실제 공지가 표시됩니다.</span>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div><p className="eyebrow">TODAY</p><h2>오늘 일정</h2></div>
          <span className="date">{formatDate(today)}</span>
        </div>

        {firstEvent ? (
          <Link href="/schedule" className="schedule-card">
            <div className="schedule-main">
              <span className="type-pill">{firstEvent.event_type}</span>
              <h3>{firstEvent.title}</h3>
              <p>
                {formatTime(firstEvent.start_at)}–{formatTime(firstEvent.end_at)} · {firstEvent.venue_name}
              </p>
              <p>{firstEvent.court_names?.join(" · ") || "코트 미정"}</p>
            </div>
            <div className="schedule-status">
              {participantCount}명{firstEvent.capacity ? ` / ${firstEvent.capacity}명` : ""}
            </div>
          </Link>
        ) : (
          <div className="notice-card">
            <strong>오늘 일정이 없습니다.</strong>
            <span>등록된 일정이 생기면 이곳에 표시됩니다.</span>
          </div>
        )}
      </section>

      <section className="section two-column">
        <Link href="/ranking" className="mini-card">
          <p className="eyebrow">RANKING</p>
          <h3>랭킹</h3>
          <p>나의 순위와 전체 랭킹 확인</p>
        </Link>
        <Link href="/community" className="mini-card">
          <p className="eyebrow">RACKET MARKET</p>
          <h3>라켓마켓</h3>
          <p>회원 간 라켓 거래 게시글</p>
        </Link>
      </section>

      <button className="floating-action" aria-label="새 일정 또는 번개 만들기">+</button>
      <BottomNav active="홈" />
    </main>
  );
}
