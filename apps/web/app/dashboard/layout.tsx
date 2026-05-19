import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

const NAV = [
  { href: "/dashboard", label: "Dashboard", emoji: "📊" },
  { href: "/dashboard/library", label: "Library", emoji: "📚" },
  { href: "/dashboard/history", label: "History", emoji: "🕐" },
  { href: "/dashboard/team", label: "Team", emoji: "👥" },
  { href: "/dashboard/api", label: "API", emoji: "⚙️" },
  { href: "/dashboard/settings", label: "Settings", emoji: "⚙" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-56 bg-white border-r flex flex-col">
        <div className="px-4 py-5 font-bold text-lg border-b">
          ⚡ PromptForge
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
            >
              <span>{item.emoji}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <UserButton afterSignOutUrl="/" showName />
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
