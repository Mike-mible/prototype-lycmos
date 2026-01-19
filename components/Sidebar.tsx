
import React from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Bus, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'trips', label: 'Trips & Segments', icon: MapPin },
  { id: 'branches', label: 'Branches', icon: ChevronRight },
  { id: 'vehicles', label: 'Vehicles', icon: Bus },
  { id: 'crew', label: 'Crew Members', icon: Users },
  { id: 'revenue', label: 'Revenue & Trust', icon: TrendingUp },
  { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
  { id: 'sms', label: 'SMS Tickets', icon: MessageSquare },
];

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isCollapsed, onToggle }) => {
  return (
    <div 
      className={`bg-slate-900 text-white flex flex-col h-full fixed left-0 top-0 z-50 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className={`p-6 border-b border-slate-800 flex items-center justify-between gap-3 overflow-hidden h-20`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">L</div>
          {!isCollapsed && (
            <h1 className="text-xl font-bold tracking-tight truncate whitespace-nowrap animate-in fade-in zoom-in duration-300">
              LyncApp <span className="text-blue-500">SACCO</span>
            </h1>
          )}
        </div>
        {!isCollapsed && (
          <button 
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <PanelLeftClose size={20} />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="flex justify-center py-4">
          <button 
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <PanelLeftOpen size={20} />
          </button>
        </div>
      )}
      
      <nav className={`flex-1 p-4 space-y-1 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            title={isCollapsed ? item.label : undefined}
            className={`flex items-center transition-all duration-200 ${
              isCollapsed 
                ? 'w-12 h-12 justify-center p-0 rounded-xl' 
                : 'w-full gap-3 px-4 py-3 rounded-xl'
            } ${
              activePage === item.id 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} className="shrink-0" />
            {!isCollapsed && (
              <span className="font-medium truncate whitespace-nowrap animate-in fade-in slide-in-from-left-1 duration-200">
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className={`p-4 border-t border-slate-800 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <button 
          className={`flex items-center text-slate-400 hover:text-red-400 transition-colors ${
            isCollapsed ? 'w-12 h-12 justify-center' : 'w-full gap-3 px-4 py-3'
          }`}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="font-medium truncate animate-in fade-in duration-200">Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
