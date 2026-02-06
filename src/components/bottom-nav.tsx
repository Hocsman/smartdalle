"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, Refrigerator, CalendarDays, User } from "lucide-react";

const NAV_ITEMS = [
    { href: "/dashboard", icon: Home, label: "Accueil" },
    { href: "/planning", icon: CalendarDays, label: "Semaine" },
    { href: "/shopping-list", icon: ShoppingCart, label: "Courses" },
    { href: "/pantry", icon: Refrigerator, label: "Frigo" },
    { href: "/profile", icon: User, label: "Profil" },
];

// Pages where the bottom nav should NOT be shown
const HIDDEN_PAGES = ["/", "/login", "/onboarding", "/premium"];

export function BottomNav() {
    const pathname = usePathname();

    // Hide on public/auth pages
    if (HIDDEN_PAGES.includes(pathname)) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-input safe-area-bottom">
            <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-lg transition-colors ${
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-white"
                            }`}
                        >
                            <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5px]" : ""}`} />
                            <span className={`text-[10px] font-bold uppercase ${isActive ? "text-primary" : ""}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <div className="w-1 h-1 rounded-full bg-primary" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
