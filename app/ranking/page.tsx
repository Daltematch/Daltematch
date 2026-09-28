import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/server";

type RankingRow = {
  member_id: string;
  scope: "OVERALL" | "CLUB" | "CREW";
  game_type: "MIXED_DOUBLES" | "MEN_DOUBLES" | "WOMEN_DOUBLES" | "SINGLES";
  rank: number;
  points: number;
};

type MemberRow = {
  member_id: string;
  display_name: string;
  is_club_member: boolean;
  is_crew_member: boolean;
  is_guest: boolean;
};

function groupLabel(member: MemberRow | undefined) {
  if (!member) return "회원";
  if (member.is_guest) return "게스트";
  if (member.is_club_member && member.is_crew_member) return "클럽 / 크루";
  if (member.is_crew_member) return "크루";
  if (member.is_club_member) return "클럽";
  return "회원";
}

export default async function RankingPage() {
  const supabase = await createClient();

  const { data: rankingRows, error: rankingError } = await supabase
    .from("rankings")
    .select("member_id, scope, game_type, rank, points")
    .eq("scope", "OVERALL")
    .order("rank", { ascending: true });

  const memberIds = (rankingRows ?? []).map((row) => row.member_id);
  const { data: memberRows, error: memberError } = memberIds.length
    ? await supabase
        .from("member_directory")
        .select("member_id, display_name, is_club_member, is_crew_member, is_guest")
        .in("member_id", memberIds)
    : { data: [], error: null };

  const members = new Map(
    (memberRows ?? []).map((member) => [member.member_id, member as MemberRow]),
  );

  const rankings = (rankingRows ?? [])
    .filter((row) => !members.get(row.member_id)?.is_guest)
    .map((row) => ({
      ...row,
      member: members.get(row.member_id),
    }));

  const error = rankingError ?? memberError;

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

        {error ? (
          <section className="info-card">
            <strong>랭킹 정보를 불러오지 못했습니다.</strong>
            <p>{error.message}</p>
          </section>
        ) : rankings.length ? (
          <section className="ranking-list">
            {rankings.map((row) => (
              <div className="ranking-row" key={`${row.member_id}-${row.game_type}`}>
                <strong>{row.rank}</strong>
                <span className="member-link">
                  {row.member?.display_name ?? "알 수 없는 회원"}
                </span>
                <span>{Number(row.points).toLocaleString("ko-KR")} P</span>
              </div>
            ))}
          </section>
        ) : (
          <section className="info-card">
            <strong>등록된 랭킹 데이터가 없습니다.</strong>
            <p>경기 결과가 반영되면 실제 랭킹이 이곳에 표시됩니다.</p>
          </section>
        )}

        <div className="info-card">
          <strong>게스트는 랭킹에서 제외됩니다.</strong>
          <p>게스트의 경기 전적은 전적 메뉴에서 확인할 수 있습니다.</p>
        </div>
      </div>

      <BottomNav active="랭킹" />
    </main>
  );
}
