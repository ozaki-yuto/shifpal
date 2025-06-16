import React from 'react';
import { Calendar, Clock, Users, AlertCircle } from 'lucide-react';
import { UserRole, ShiftAssignment } from '../types';

interface DashboardProps {
  userRole: UserRole;
  userId: string;
  shifts: ShiftAssignment[];
}

export function Dashboard({ userRole, userId, shifts }: DashboardProps) {
  const today = new Date();
  const thisWeekShifts = shifts.filter(shift => {
    const shiftDate = new Date(shift.date);
    const daysDiff = Math.ceil((shiftDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysDiff >= 0 && daysDiff <= 7;
  });

  const myShifts = userRole === 'staff' 
    ? thisWeekShifts.filter(shift => shift.staffId === userId)
    : thisWeekShifts;

  const upcomingShifts = myShifts.slice(0, 5);

  const stats = [
    {
      title: '今週のシフト',
      value: userRole === 'admin' ? thisWeekShifts.length : myShifts.length,
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      title: '今日のシフト',
      value: userRole === 'admin' 
        ? shifts.filter(s => s.date === today.toISOString().split('T')[0]).length
        : shifts.filter(s => s.date === today.toISOString().split('T')[0] && s.staffId === userId).length,
      icon: Clock,
      color: 'bg-indigo-500'
    },
    {
      title: userRole === 'admin' ? 'アクティブスタッフ' : '交換可能シフト',
      value: userRole === 'admin' 
        ? new Set(shifts.map(s => s.staffId)).size
        : shifts.filter(s => s.staffId !== userId && s.status === 'confirmed').length,
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: '要注意事項',
      value: shifts.filter(s => s.status === 'absent' || s.status === 'exchange-requested').length,
      icon: AlertCircle,
      color: 'bg-amber-500'
    }
  ];

  const getTimeSlotLabel = (timeSlot: string) => {
    const labels = {
      morning: '朝',
      afternoon: '昼',
      evening: '夜'
    };
    return labels[timeSlot as keyof typeof labels] || timeSlot;
  };

  const getDayLabel = (dayOfWeek: string) => {
    const labels = {
      monday: '月',
      tuesday: '火',
      wednesday: '水',
      thursday: '木',
      friday: '金',
      saturday: '土',
      sunday: '日'
    };
    return labels[dayOfWeek as keyof typeof labels] || dayOfWeek;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {userRole === 'admin' ? '管理者ダッシュボード' : 'スタッフダッシュボード'}
        </h1>
        <p className="text-gray-600 mt-1">
          {userRole === 'admin' 
            ? 'シフト管理の概要と重要な情報を確認できます' 
            : 'あなたのシフト情報と重要なお知らせを確認できます'
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Shifts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {userRole === 'admin' ? '今週の予定' : '今週のシフト'}
          </h2>
        </div>
        <div className="p-6">
          {upcomingShifts.length > 0 ? (
            <div className="space-y-3">
              {upcomingShifts.map((shift) => (
                <div key={shift.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {getDayLabel(shift.dayOfWeek)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {userRole === 'admin' ? shift.staffName : getTimeSlotLabel(shift.timeSlot)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(shift.date).toLocaleDateString('ja-JP')} - {getTimeSlotLabel(shift.timeSlot)}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      shift.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800'
                        : shift.status === 'absent'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {shift.status === 'confirmed' ? '確定' : 
                       shift.status === 'absent' ? '欠勤' : '交換申請中'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">今週のシフトはありません</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}