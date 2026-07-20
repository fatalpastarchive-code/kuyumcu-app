import React from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { 
  Home, 
  BookOpen, 
  Plus, 
  Bell, 
  Settings as SettingsIcon 
} from "lucide-react";

interface BottomNavigationProps {
  onQuickAddClick?: () => void;
  overdueCount?: number;
}

export function BottomNavigation({ onQuickAddClick, overdueCount = 0 }: BottomNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Panel" },
    { path: "/ledger", icon: BookOpen, label: "Defter" },
    { path: "/deadlines", icon: Bell, label: "Vadeler", badge: overdueCount },
    { path: "/logs", icon: SettingsIcon, label: "Loglar" },
    { path: "/settings", icon: SettingsIcon, label: "Ayarlar" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-900/60 safe-area-bottom">
      <div className="max-w-4xl mx-auto px-2 py-2">
        <div className="flex items-center justify-around relative">
          {/* Regular Nav Items */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => navigate({ to: item.path as any })}
                className="flex flex-col items-center justify-center py-2 px-4 min-w-16 relative"
              >
                <div className="relative">
                  <Icon 
                    className={`w-6 h-6 transition-colors ${
                      active ? "text-amber-500" : "text-zinc-500"
                    }`}
                  />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                <span 
                  className={`text-[10px] font-medium mt-1 transition-colors ${
                    active ? "text-amber-500" : "text-zinc-500"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Quick Add FAB - Centered and elevated */}
          <button
            onClick={onQuickAddClick}
            className="absolute left-1/2 -translate-x-1/2 -top-6 w-14 h-14 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-full shadow-lg shadow-amber-500/30 flex items-center justify-center hover:shadow-xl hover:shadow-amber-500/40 active:scale-95 transition-all"
          >
            <Plus className="w-7 h-7 text-zinc-950 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
}
