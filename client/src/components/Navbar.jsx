import React from 'react';
import { MessageSquare, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { authUser, logout } = useAuth();

  return (
    <header className="h-16 bg-[#202c33] border-b border-[#222d34] px-4 flex items-center justify-between z-10 select-none">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white">
          <MessageSquare className="w-6 h-6" />
        </div>
        <span className="font-semibold text-lg text-[#e9edef]">WhatsApp Web</span>
      </div>

      {authUser && (
        <div className="flex items-center space-x-3">
          <img
            src={authUser.avatar}
            alt={authUser.username}
            className="w-9 h-9 rounded-full object-cover border border-[#00a884]"
          />
          <span className="text-sm font-medium text-[#e9edef] hidden sm:inline">
            {authUser.username}
          </span>
          <button
            onClick={logout}
            title="Logout"
            className="p-2 text-[#8696a0] hover:text-red-400 hover:bg-[#2a3942] rounded-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
