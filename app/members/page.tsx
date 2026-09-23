import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/server";

type MemberDirectoryRow = {
  member_id: string;
  display_name: string;
  experience_category: string | null;
  is_club_member: boolean;
  is_crew_member: boolean;
  is_guest: boolean;
  status: string;
};

function groupLabel(member: MemberDirectoryRow) {
  if (member.is_guest) return "게스트";
  if (member.is_club_member && member.is_crew_member) return "클럽 / 크루";
  if (member.is_crew_member) return "크루";
  if (member.is_club_member) return "클럽";
  return "회원";
}

export default async function MembersPage() {
  const supabase = await createClient();

  const { data: members, error } = await supabase
    .from("member_directory")
    .select(
      "member_id, display_name, experience_category, is_club_member, is_crew_member, is_guest, status",
    )
    .eq("status", "ACTIVE")
    .order("display_name", { ascending: true });

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

        <div className="filter-row" aria-label="회원 구분">
          <span className="filter-chip active">전체</span>
          <span className="filter-chip">클럽</span>
          <span className="filter-chip">크루</span>
          <span className="filter-chip">게스트</span>
        </div>

        {error ? (
          <section className="info-card">
            <strong>회원 정보를 불러오지 못했습니다.</strong>
            <p>{error.message}</p>
          </section>
        ) : members?.length ? (
          <section className="member-list" aria-label="회원 목록">
            {members.map((member) => (
              <div className="member-row" key={member.member_id}>
                <div>
                  <strong>{member.display_name}</strong>
                  <span>{groupLabel(member)}</span>
                </div>
                <span>{member.experience_category ?? "경력 정보 없음"}</span>
              </div>
            ))}
          </section>
        ) : (
          <section className="info-card">
            <strong>등록된 회원이 없습니다.</strong>
            <p>활성 상태의 회원이 등록되면 이곳에 표시됩니다.</p>
          </section>
        )}
      </div>

      <BottomNav active="회원" />
    </main>
  );
}
