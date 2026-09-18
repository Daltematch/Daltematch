import BottomNav from "@/components/BottomNav";

const members = [
  { name: "91양민지(여)", group: "클럽 / 크루", experience: "1년 미만" },
  { name: "90박혜연(여)", group: "클럽 / 크루", experience: "2년 이상" },
  { name: "88최기태(남)", group: "크루", experience: "2년 이상" },
  { name: "92김민수(남)", group: "클럽", experience: "1~2년" },
  { name: "95이서윤(여)", group: "게스트", experience: "1~2년" },
];

export default function MembersPage() {
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
          <p className="eyebrow">MEMBERS</p>
          <h1>회원</h1>
          <p>클럽·크루·게스트 회원을 구분해 확인합니다.</p>
        </div>

        <div className="filter-row">
          <button className="filter-chip active">전체</button>
          <button className="filter-chip">클럽</button>
          <button className="filter-chip">크루</button>
          <button className="filter-chip">게스트</button>
        </div>

        <section className="member-list">
          {members.map((member) => (
            <button className="member-row" key={member.name}>
              <div>
                <strong>{member.name}</strong>
                <span>{member.group}</span>
              </div>
              <span>{member.experience}</span>
            </button>
          ))}
        </section>
      </div>

      <BottomNav active="회원" />
    </main>
  );
}
