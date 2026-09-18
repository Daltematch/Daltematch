import Link from "next/link";

const navItems = [
  { href: "/", label: "홈", icon: "⌂" },
  { href: "/schedule", label: "일정", icon: "▣" },
  { href: "/ranking", label: "랭킹", icon: "♛" },
  { href: "/members", label: "회원", icon: "●" },
  { href: "/more", label: "더보기", icon: "☰" },
];

export default function BottomNav({ active }: { active: string }) {
  return (
    <nav className="bottom-nav" aria-label="주요 메뉴">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={item.label === active ? "nav-item active" : "nav-item"}
        >
          <span>{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
