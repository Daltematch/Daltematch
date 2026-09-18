const schedule = {
  title: "금요일 정기모임",
  time: "21:00–23:00",
  venue: "심플테니스장",
  court: "4·5번 코트",
  status: "12명 / 12명",
};

const navItems = ["홈", "일정", "랭킹", "회원", "더보기"];

export default function HomePage() {
  return (
    <main className="stms-shell">
      <header className="topbar">
        <div>
          <div className="brand">STMS</div>
          <div className="brand-subtitle">Sweet Tennis Management System</div>
        </div>
        <button className="icon-button" aria-label="알림">♡</button>
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
          <span className="badge">2</span>
        </div>
        <div className="notice-card">
          <strong>9월 운영 안내</strong>
          <span>새로운 공지사항을 확인해주세요.</span>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div><p className="eyebrow">TODAY</p><h2>오늘 일정</h2></div>
          <span className="date">2026.09.18</span>
        </div>
        <article className="schedule-card">
          <div className="schedule-main">
            <span className="type-pill">클럽</span>
            <h3>{schedule.title}</h3>
            <p>{schedule.time} · {schedule.venue}</p>
            <p>{schedule.court}</p>
          </div>
          <div className="schedule-status">{schedule.status}</div>
        </article>
      </section>

      <section className="section two-column">
        <article className="mini-card">
          <p className="eyebrow">RANKING</p>
          <h3>랭킹</h3>
          <p>나의 순위와 전체 랭킹 확인</p>
        </article>
        <article className="mini-card">
          <p className="eyebrow">RACKET MARKET</p>
          <h3>라켓마켓</h3>
          <p>회원 간 라켓 거래 게시글</p>
        </article>
      </section>

      <button className="floating-action" aria-label="새 일정 또는 번개 만들기">+</button>

      <nav className="bottom-nav" aria-label="주요 메뉴">
        {navItems.map((item, index) => (
          <button key={item} className={index === 0 ? "nav-item active" : "nav-item"}>
            <span>{["⌂", "▣", "♛", "●", "☰"][index]}</span>
            {item}
          </button>
        ))}
      </nav>
    </main>
  );
}
