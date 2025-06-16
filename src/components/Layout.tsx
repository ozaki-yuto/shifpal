import React from 'react';
import { Calendar, Users, MessageSquare, Settings, User, LogOut } from 'lucide-react';
import { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  userRole: UserRole;
  userName: string;
}

export function Layout({ children, currentView, onViewChange, userRole, userName }: LayoutProps) {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const adminMenuItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: Calendar },
    { id: 'requirements', label: 'シフト要件設定', icon: Settings },
    { id: 'schedule', label: 'シフト表', icon: Calendar },
    { id: 'staff', label: 'スタッフ管理', icon: Users },
    { id: 'communication', label: 'コミュニケーション', icon: MessageSquare },
  ];

  const staffMenuItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: Calendar },
    { id: 'preferences', label: 'シフト希望提出', icon: User },
    { id: 'schedule', label: 'シフト表', icon: Calendar },
    { id: 'communication', label: 'コミュニケーション', icon: MessageSquare },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : staffMenuItems;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-xl font-bold text-gray-900">シフパル</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">{userName}</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {userRole === 'admin' ? '管理者' : 'スタッフ'}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center px-3 py-4 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                    currentView === item.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}