import BottomNav from "@/components/BottomNav";

export default function Page() {
  return (
    <main className="stms-shell">
      <header className="topbar">
        <div>
          <div className="brand">STMS</div>
          <div className="brand-subtitle">Sweet Tennis Management System</div>
        </div>
      </header>
      <div className="page-main">
        <div className="page-heading">
          <p className="eyebrow">RECORD</p>
          <h1>전적</h1>
          <p>단식·복식 경기 기록을 확인하는 화면입니다.</p>
        </div>
        <div className="info-card">
          <strong>기본 화면 구조 연결 완료</strong>
          <p>이 화면은 다음 구현 단계에서 실제 데이터와 기능을 연결합니다.</p>
        </div>
      </div>
      <BottomNav active="더보기" />
    </main>
  );
}
