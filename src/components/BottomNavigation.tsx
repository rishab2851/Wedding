import React from 'react';
import {
  Wallet,
  CheckSquare,
  Building2,
  Settings,
  Sparkles,
} from 'lucide-react';

export type ActiveTab = 'budget' | 'tasks' | 'guests' | 'settings';

interface BottomNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingTasksCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  pendingTasksCount = 0,
}) => {
  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    {
      id: 'budget',
      label: 'Budget Tracker',
      icon: <Wallet className="w-5 h-5" />,
    },
    {
      id: 'tasks',
      label: 'Task Manager',
      icon: <CheckSquare className="w-5 h-5" />,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    {
      id: 'guests',
      label: 'Guests & Travel',
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 inset-x-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#E8D7C3] shadow-[0_-4px_25px_rgba(44,36,32,0.06)] px-2 sm:px-6 py-2"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => {
                onTabChange(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-3 sm:px-5 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-[#B2503A] font-semibold scale-105'
                  : 'text-[#8C7A6B] hover:text-[#2C2420]'
              }`}
            >
              {/* Active Indicator bar */}
              {isActive && (
                <span className="absolute -top-2 w-8 h-1 bg-[#B2503A] rounded-full shadow-xs" />
              )}

              <div className="relative">
                {item.icon}
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-[#B2503A] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] sm:text-xs mt-1 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
