import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const schedules = [
  {
    type: "클럽",
    title: "금요일 정기모임",
    date: "2026.09.18",
    time: "21:00–23:00",
    venue: "심플테니스장",
    court: "4·5번 코트",
    status: "12명 / 12명",
  },
  {
    type: "크루",
    title: "CREW 정기모임",
    date: "2026.09.20",
    time: "19:00–21:00",
    venue: "심플테니스장",
    court: "4·5번 코트",
    status: "8명 / 12명",
  },
];

export default function SchedulePage() {
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
          <p className="eyebrow">SCHEDULE</p>
          <h1>일정</h1>
          <p>클럽과 크루의 예정된 일정을 확인합니다.</p>
        </div>

        <div className="filter-row">
          <button className="filter-chip active">전체</button>
          <button className="filter-chip">클럽</button>
          <button className="filter-chip">크루</button>
          <button className="filter-chip">번개</button>
        </div>

        <section className="page-stack">
          {schedules.map((schedule) => (
            <article className="list-card" key={schedule.title}>
              <div className="list-card-top">
                <span className="type-pill">{schedule.type}</span>
                <span className="date">{schedule.date}</span>
              </div>
              <h2>{schedule.title}</h2>
              <p>{schedule.time} · {schedule.venue}</p>
              <p>{schedule.court}</p>
              <div className="list-card-bottom">
                <span>{schedule.status}</span>
                <Link href="#" className="text-link">상세보기 →</Link>
              </div>
            </article>
          ))}
        </section>
      </div>

      <button className="floating-action" aria-label="새 일정 또는 번개 만들기">+</button>
      <BottomNav active="일정" />
    </main>
  );
}
