import React from 'react';
import { Music, LogOut, Inbox, User, Wallet } from 'lucide-react';

export type ColorScheme = 'slate' | 'zinc' | 'amber';

interface LayoutProps {
  children: React.ReactNode;
  userMode: string;
  colorScheme?: ColorScheme;
  onLogout?: () => void;
  onNavigateToInbox?: () => void;
  onNavigateToHome?: () => void;
  notificationCount?: number;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  userMode, 
  colorScheme = 'slate', 
  onLogout,
  onNavigateToInbox,
  onNavigateToHome,
  notificationCount = 0
}) => {
  // Theme definitions
  const themes = {
    slate: {
      bg: 'bg-slate-900',
      header: 'bg-slate-900/80 border-slate-800',
      logoGradient: 'from-indigo-600 to-purple-600',
      badge: 'bg-indigo-900/50 text-indigo-300 border-indigo-500/30'
    },
    zinc: {
      bg: 'bg-neutral-900',
      header: 'bg-neutral-900/80 border-neutral-800',
      logoGradient: 'from-emerald-600 to-teal-600',
      badge: 'bg-emerald-900/50 text-emerald-300 border-emerald-500/30'
    },
    amber: {
      bg: 'bg-stone-900',
      header: 'bg-stone-900/80 border-stone-800',
      logoGradient: 'from-amber-600 to-orange-600',
      badge: 'bg-amber-900/50 text-amber-300 border-amber-500/30'
    }
  };

  const theme = themes[colorScheme];

  const getRoleLabel = () => {
    switch(userMode) {
      case 'DJ': return 'Artist';
      case 'PROMOTER': return 'Promoter';
      default: return 'Client';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg} transition-colors duration-500`}>
      <header className={`${theme.header} backdrop-blur-md border-b sticky top-0 z-50 transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div 
              className="flex items-center gap-3 cursor-pointer" 
              onClick={onNavigateToHome}
            >
              <div className={`bg-gradient-to-tr ${theme.logoGradient} p-2 rounded-lg shadow-lg`}>
                <Music className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">GigFlow</span>
            </div>

            {userMode !== 'LOGIN' && onNavigateToInbox && (
              <nav className="hidden md:flex gap-4">
                 <button 
                  onClick={onNavigateToHome}
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  {userMode === 'DJ' ? 'Editor' : userMode === 'PROMOTER' ? 'Dashboard' : 'Book Artist'}
                </button>
                <button 
                  onClick={onNavigateToInbox}
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  Inbox
                  {notificationCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{notificationCount}</span>
                  )}
                </button>
              </nav>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium flex items-center">
              <span className={`px-2 py-1 rounded border ${theme.badge} uppercase text-xs tracking-wide font-bold flex items-center gap-2`}>
                {userMode === 'PROMOTER' ? <Wallet size={12} /> : <User size={12} />}
                {getRoleLabel()}
              </span>
            </div>
            
            {userMode !== 'LOGIN' && (
               <>
                 <button onClick={onNavigateToInbox} className="md:hidden text-slate-400 hover:text-white relative">
                    <Inbox size={20} />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full"></span>
                    )}
                 </button>
                 <div className="h-6 w-px bg-slate-700 mx-2"></div>
               </>
            )}

            {onLogout && (
              <button 
                onClick={onLogout}
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 pt-8 px-4 sm:px-0">
        {children}
      </main>
    </div>
  );
};