import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/server";

type RankingScope = "OVERALL" | "CLUB" | "CREW";
type GameFilter = "ALL" | "SINGLES" | "DOUBLES";
type GenderFilter = "ALL" | "MALE" | "FEMALE";

type RankingRow = {
  ranking_id: string;
  member_id: string;
  scope: RankingScope;
  game_type: "MIXED_DOUBLES" | "MEN_DOUBLES" | "WOMEN_DOUBLES" | "SINGLES";
  rank: number;
  points: number;
};

type MemberRow = {
  member_id: string;
  display_name: string;
  gender: "MALE" | "FEMALE";
  is_club_member: boolean;
  is_crew_member: boolean;
  is_guest: boolean;
};

const scopeOptions = [
  ["ALL", "전체"],
  ["CLUB", "클럽"],
  ["CREW", "크루"],
] as const;

const gameOptions = [
  ["ALL", "전체"],
  ["SINGLES", "단식"],
  ["DOUBLES", "복식"],
] as const;

const genderOptions = [
  ["ALL", "전체"],
  ["MALE", "남"],
  ["FEMALE", "여"],
] as const;

function filterHref(
  scope: RankingScope | "ALL",
  game: GameFilter,
  gender: GenderFilter,
) {
  const params = new URLSearchParams();
  if (scope !== "ALL") params.set("scope", scope);
  if (game !== "ALL") params.set("game", game);
  if (gender !== "ALL") params.set("gender", gender);
  const query = params.toString();
  return query ? `/ranking?${query}` : "/ranking";
}

function gameLabel(gameType: RankingRow["game_type"]) {
  if (gameType === "SINGLES") return "단식";
  if (gameType === "MIXED_DOUBLES") return "혼복";
  if (gameType === "MEN_DOUBLES") return "남복";
  return "여복";
}

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{
    scope?: string;
    game?: string;
    gender?: string;
  }>;
}) {
  const params = await searchParams;
  const scope: RankingScope | "ALL" =
    params.scope === "CLUB" || params.scope === "CREW" ? params.scope : "ALL";
  const game: GameFilter =
    params.game === "SINGLES" || params.game === "DOUBLES" ? params.game : "ALL";
  const gender: GenderFilter =
    params.gender === "MALE" || params.gender === "FEMALE" ? params.gender : "ALL";

  const supabase = await createClient();

  let rankingQuery = supabase
    .from("rankings")
    .select("ranking_id, member_id, scope, game_type, rank, points")
    .order("rank", { ascending: true })
    .order("points", { ascending: false });

  if (scope !== "ALL") rankingQuery = rankingQuery.eq("scope", scope);
  if (game === "SINGLES") rankingQuery = rankingQuery.eq("game_type", "SINGLES");
  if (game === "DOUBLES") rankingQuery = rankingQuery.neq("game_type", "SINGLES");

  const { data: rankingRows, error: rankingError } = await rankingQuery;
  const rows = (rankingRows ?? []) as RankingRow[];
  const memberIds = [...new Set(rows.map((row) => row.member_id))];

  const { data: memberData, error: memberError } = memberIds.length
    ? await supabase
        .from("member_directory")
        .select(
          "member_id, display_name, gender, is_club_member, is_crew_member, is_guest",
        )
        .in("member_id", memberIds)
    : { data: [], error: null };

  const members = new Map(
    (memberData ?? []).map((member) => [member.member_id, member as MemberRow]),
  );

  const rankings = rows.filter((row) => {
    const member = members.get(row.member_id);
    if (!member || member.is_guest) return false;
    return gender === "ALL" || member.gender === gender;
  });

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

        <div className="filter-row" aria-label="회원 구분">
          {scopeOptions.map(([value, label]) => (
            <Link
              key={value}
              href={filterHref(value, game, gender)}
              className={`filter-chip ${scope === value ? "active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="filter-row" aria-label="경기 및 성별 구분">
          {gameOptions.map(([value, label]) => (
            <Link
              key={value}
              href={filterHref(scope, value, gender)}
              className={`filter-chip ${game === value ? "active" : ""}`}
            >
              {label}
            </Link>
          ))}
          {genderOptions.slice(1).map(([value, label]) => (
            <Link
              key={value}
              href={filterHref(scope, game, value)}
              className={`filter-chip ${gender === value ? "active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {error ? (
          <section className="info-card">
            <strong>랭킹 정보를 불러오지 못했습니다.</strong>
            <p>{error.message}</p>
          </section>
        ) : rankings.length ? (
          <section className="ranking-list" aria-label="랭킹 목록">
            {rankings.map((row, index) => {
              const member = members.get(row.member_id)!;
              return (
                <div className="ranking-row" key={row.ranking_id}>
                  <strong>{index + 1}</strong>
                  <span className="member-link">
                    {member.display_name}
                    <small>
                      {row.scope === "OVERALL" ? "전체" : row.scope === "CLUB" ? "클럽" : "크루"}
                      {" · "}
                      {gameLabel(row.game_type)}
                    </small>
                  </span>
                  <span>{Number(row.points).toLocaleString("ko-KR")} P</span>
                </div>
              );
            })}
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
