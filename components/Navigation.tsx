import React from 'react';
import { Camera, MessageCircle, BookOpen, User } from 'lucide-react';
import { ViewState } from '../types';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: ViewState.SNAP, icon: Camera, label: 'Snap' },
    { id: ViewState.TRANSLATE, icon: MessageCircle, label: 'Speak' },
    { id: ViewState.DOJO, icon: BookOpen, label: 'Dojo' },
    { id: ViewState.SENSEI, icon: User, label: 'Sensei' },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 pb-6 z-50 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
              isActive ? 'text-indigo-600 -translate-y-2' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-2 rounded-full ${isActive ? 'bg-indigo-50' : 'bg-transparent'}`}>
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default Navigation;
