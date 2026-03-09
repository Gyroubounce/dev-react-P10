// src/components/layout/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/lib/utils/initials";
import Logo from "@/app/assets/Union.png";
import DashboardIcon from "@/components/ui/icons/DashboardIcon";
import FolderNavIcon from "@/components/ui/icons/FolderIcon";

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isDashboard = pathname === "/dashboard";
  const isProjets = pathname.startsWith("/dashboard/projects");
  const isProfile = pathname === "/dashboard/account";

  return (
    <header className="w-full bg-white flex justify-center">
      <div className="max-w-303.75 w-full h-23.5 flex items-center justify-between px-4">

        {/* Logo */}
        <Link
          href="/dashboard"
          className="text-2xl"
          aria-label="Retour au tableau de bord"
        >
           <Image src={Logo} alt="Logo- Accueil" width={147}  priority style={{ height: "auto" }} />
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          <Link
            href="/dashboard"
            aria-current={isDashboard ? "page" : undefined}
            className={`
              group relative
              w-62 h-19.5
              flex items-center justify-center gap-3
              rounded-md text-sm
              transition-colors
              ${isDashboard
                ? "bg-black text-white hover:border border-brand-dark"
                : "bg-white text-brand-dark hover:border border-brand-dark"
              }
            `}
          >
        <DashboardIcon className="w-5 h-5" aria-hidden="true" />
            
            Tableau de bord
          </Link>

          <Link
            href="/dashboard/projects"
            aria-current={isProjets ? "page" : undefined}
            className={`
              group relative
              w-62 h-19.5
              flex items-center justify-center gap-3
              rounded-md text-sm
              transition-colors
              ${isProjets
                ? "bg-black text-white hover:border border-brand-dark"
                : "bg-white text-brand-dark hover:border border-brand-dark"
              }
            `}
          >
        <FolderNavIcon className="w-6 h-6" aria-hidden="true" />
            Projets
          </Link>
        </nav>

        {/* Avatar utilisateur */}
        <Link
          href="/dashboard/account"
          aria-label="Accéder à mon profil"
          aria-current={isProfile ? "page" : undefined}
          className={`w-16.25 h-16.25 rounded-full flex items-center justify-center font-semibold text-sm transition
            ${isProfile
              ? "bg-brand-dark text-white"
              : "bg-brand-light text-brand-dark hover:ring-1 hover:ring-brand-dark"
            }`}
                  >
          {user ? getInitials(user.name) : "?"}
        </Link>

      </div>
    </header>
  );
}