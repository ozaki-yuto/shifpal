import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ShiftRequirements } from './components/ShiftRequirements';
import { ShiftPreferences } from './components/ShiftPreferences';
import { ShiftSchedule } from './components/ShiftSchedule';
import { Communication } from './components/Communication';
import { 
  useUsers, 
  useShiftRequirements, 
  useShiftPreferences, 
  useShiftAssignments, 
  useMessages 
} from './hooks/useDatabase';
import { generateShifts } from './utils/shiftAlgorithm';
import {
  User,
  UserRole,
  ShiftPreference,
  Message,
} from './types';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  // Database hooks
  const { users } = useUsers();
  const { requirements, updateRequirements } = useShiftRequirements();
  const { preferences, updatePreferences } = useShiftPreferences();
  const { assignments, createAssignments } = useShiftAssignments();
  const { messages, createMessage } = useMessages();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const handleGenerateShifts = () => {
    console.log('handleGenerateShifts called');
    console.log('Requirements:', requirements);
    console.log('Preferences:', preferences);
    
    const generatedShifts = generateShifts(requirements, preferences);
    console.log('Generated shifts:', generatedShifts);
    
    createAssignments(generatedShifts);
  };

  const handleSendMessage = async (message: Omit<Message, 'id' | 'timestamp'>) => {
    await createMessage(message);
  };

  const handleUpdatePreferences = async (newPreferences: ShiftPreference[]) => {
    await updatePreferences(user.id, newPreferences);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            userRole={user.role}
            userId={user.id}
            shifts={assignments}
          />
        );
      case 'requirements':
        return (
          <ShiftRequirements
            requirements={requirements}
            onUpdateRequirements={updateRequirements}
          />
        );
      case 'preferences':
        return (
          <ShiftPreferences
            preferences={preferences.filter(p => p.staffId === user.id)}
            staffId={user.id}
            onUpdatePreferences={handleUpdatePreferences}
          />
        );
      case 'schedule':
        return (
          <ShiftSchedule
            shifts={assignments}
            userRole={user.role}
            userId={user.id}
            onGenerateShifts={handleGenerateShifts}
            requirements={requirements}
            preferences={preferences}
          />
        );
      case 'staff':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">スタッフ管理</h2>
            <div className="space-y-4">
              {users.filter(u => u.role === 'staff').map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    アクティブ
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'communication':
        return (
          <Communication
            messages={messages}
            userRole={user.role}
            userName={user.name}
            onSendMessage={handleSendMessage}
          />
        );
      default:
        return <Dashboard userRole={user.role} userId={user.id} shifts={assignments} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Layout
        currentView={currentView}
        onViewChange={setCurrentView}
        userRole={user.role}
        userName={user.name}
      >
        {renderCurrentView()}
      </Layout>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;