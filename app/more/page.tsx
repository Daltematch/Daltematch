import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const menus = [
  ["공지사항", "운영 공지와 중요 안내를 확인합니다.", "/notice"],
  ["전적", "단식·복식 경기 기록을 확인합니다.", "/record"],
  ["커뮤니티", "사진·영상·라켓마켓·명예의 전당·행사 기록", "/community"],
  ["설정", "계정과 앱 설정을 확인합니다.", "/settings"],
];

export default function MorePage() {
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
          <p className="eyebrow">MORE</p>
          <h1>더보기</h1>
          <p>운영과 기록에 필요한 메뉴를 확인합니다.</p>
        </div>

        <section className="page-stack">
          {menus.map(([title, description, href]) => (
            <Link className="menu-card" href={href} key={title}>
              <div>
                <strong>{title}</strong>
                <span>{description}</span>
              </div>
              <b>›</b>
            </Link>
          ))}
        </section>
      </div>

      <BottomNav active="더보기" />
    </main>
  );
}
