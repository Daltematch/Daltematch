import BottomNav from "@/components/BottomNav";

const rankings = [
  ["1", "91양민지(여)", "1,240"],
  ["2", "90박혜연(여)", "1,180"],
  ["3", "88최기태(남)", "1,120"],
  ["4", "92김민수(남)", "1,060"],
];

export default function RankingPage() {
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
          <p className="eyebrow">RANKING</p>
          <h1>랭킹</h1>
          <p>기준에 따라 전체 랭킹을 확인합니다.</p>
        </div>

        <div className="filter-row">
          <button className="filter-chip active">전체</button>
          <button className="filter-chip">클럽</button>
          <button className="filter-chip">크루</button>
          <button className="filter-chip">게스트</button>
        </div>

        <div className="filter-row">
          <button className="filter-chip active">전체</button>
          <button className="filter-chip">단식</button>
          <button className="filter-chip">복식</button>
          <button className="filter-chip">남</button>
          <button className="filter-chip">여</button>
        </div>

        <section className="ranking-list">
          {rankings.map(([rank, name, points]) => (
            <div className="ranking-row" key={name}>
              <strong>{rank}</strong>
              <span className="member-link">{name}</span>
              <span>{points} P</span>
            </div>
          ))}
        </section>

        <div className="info-card">
          <strong>게스트는 랭킹에서 제외됩니다.</strong>
          <p>게스트의 경기 전적은 전적 메뉴에서 확인할 수 있습니다.</p>
        </div>
      </div>

      <BottomNav active="랭킹" />
    </main>
  );
}
