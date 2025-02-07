import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { MessageSquare, Settings, User, LogOut, Users } from 'lucide-react';
import CreateGroupModal from './CreateGroupModal';

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  return (
    <>
      <header className="fixed w-full top-0 z-40 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 border-b border-gray-600">
        <div className="container mx-auto px-6 h-16">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="size-5 text-primary" />
                </div>
                <h1 className="text-lg font-bold text-white">Chatterly</h1>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {authUser && (
                <>
                  <button
                    className="btn btn-sm gap-2 bg-gray-700 text-white hover:bg-gray-600"
                    onClick={() => setIsGroupModalOpen(true)}
                  >
                    <Users className="size-4" />
                    <span className="sm:inline">Create Group</span>
                  </button>
                  <Link to="/profile" className="btn btn-sm gap-2 bg-gray-700 text-white hover:bg-gray-600">
                    <User className="size-5" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>
                  <Link to="/settings" className="btn btn-sm gap-2 bg-gray-700 text-white hover:bg-gray-600">
                    <Settings className="size-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </Link>
                  <button
                    className="flex gap-2 items-center text-gray-200 hover:text-gray-400 transition-colors"
                    onClick={logout}
                  >
                    <LogOut className="size-5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {isGroupModalOpen && (
        <CreateGroupModal 
          isOpen={isGroupModalOpen} 
          onClose={() => setIsGroupModalOpen(false)} 
        />
      )}
    </>
  );
};

export default Navbar;
