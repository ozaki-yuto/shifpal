import React, { useState } from 'react';
import { Download, RefreshCw, Calendar, Users, AlertTriangle, BarChart3, CheckCircle, XCircle } from 'lucide-react';
import { ShiftAssignment, UserRole } from '../types';
import { generateShiftsWithDetails } from '../utils/shiftAlgorithm';

interface ShiftScheduleProps {
  shifts: ShiftAssignment[];
  userRole: UserRole;
  userId: string;
  onGenerateShifts: () => void;
  requirements: any[];
  preferences: any[];
}

export function ShiftSchedule({ shifts, userRole, userId, onGenerateShifts, requirements, preferences }: ShiftScheduleProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showGenerationDetails, setShowGenerationDetails] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);

  const handleGenerateWithDetails = () => {
    console.log('Starting shift generation...');
    console.log('Requirements:', requirements);
    console.log('Preferences:', preferences);
    
    // デバッグ情報を詳細に出力
    console.log('Requirements count:', requirements.length);
    console.log('Preferences count:', preferences.length);
    console.log('Current user:', userId);
    console.log('User role:', userRole);
    
    if (requirements.length === 0) {
      alert('⚠️ シフト要件が設定されていません。\n「シフト要件設定」で必要人数を設定してください。');
      return;
    }
    
    if (preferences.length === 0) {
      alert('⚠️ スタッフのシフト希望が提出されていません。\n「シフト希望提出」で希望を入力してください。');
      return;
    }
    
    const result = generateShiftsWithDetails(requirements, preferences);
    console.log('Generation result:', result);
    
    if (result.assignments.length === 0) {
      alert('⚠️ シフトを生成できませんでした。\n\n考えられる原因:\n• シフト要件と希望が一致しない\n• 制約により割り当てできない\n\nコンソールで詳細を確認してください。');
    } else {
      alert(`✅ ${result.assignments.length}件のシフトを生成しました！`);
    }
    
    setGenerationResult(result);
    setShowGenerationDetails(true);
    onGenerateShifts();
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'exchange-requested':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleExport = (format: 'pdf' | 'csv') => {
    // In a real app, this would generate and download the file
    alert(`${format.toUpperCase()}形式でエクスポートします`);
  };

  // Group shifts by date for calendar view
  const shiftsByDate = shifts.reduce((acc, shift) => {
    if (!acc[shift.date]) {
      acc[shift.date] = [];
    }
    acc[shift.date].push(shift);
    return acc;
  }, {} as Record<string, ShiftAssignment[]>);

  // Get current week dates
  const today = new Date();
  const currentWeek = [];
  
  // 今日を基準に今週の月曜日を計算
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay(); // 0=日曜, 1=月曜, ..., 6=土曜
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 日曜日の場合は6日前、それ以外は曜日-1
  startOfWeek.setDate(today.getDate() - daysFromMonday);

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    currentWeek.push(date.toISOString().split('T')[0]);
  }

  const timeSlots = ['morning', 'afternoon', 'evening'];
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">シフト表</h1>
          <p className="text-gray-600 mt-1">
            {userRole === 'admin' ? '全体のシフト状況を確認・管理できます' : 'あなたのシフト予定を確認できます'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {userRole === 'admin' && (
            <button
              onClick={handleGenerateWithDetails}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              シフト自動生成
            </button>
          )}
          {userRole === 'admin' && shifts.length > 0 && (
            <button
              onClick={() => setShowGenerationDetails(!showGenerationDetails)}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              生成詳細
            </button>
          )}
          <div className="flex rounded-lg border border-gray-300">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 text-sm font-medium rounded-l-lg ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              カレンダー
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium rounded-r-lg ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              リスト
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="h-4 w-4 mr-1" />
              PDF
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="h-4 w-4 mr-1" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Generation Details */}
      {showGenerationDetails && userRole === 'admin' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">シフト生成結果詳細</h2>
            <button
              onClick={() => setShowGenerationDetails(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          {generationResult ? (
            <>
              {/* Generation Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-blue-500" />
                    <div className="ml-3">
                      <p className="text-2xl font-bold text-blue-900">{generationResult.statistics.filledSlots}</p>
                      <p className="text-sm text-blue-700">割り当て済み</p>
                      <p className="text-xs text-blue-600">/ {generationResult.statistics.totalSlots} 総枠</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div className="ml-3">
                      <p className="text-2xl font-bold text-green-900">
                        {Math.round((generationResult.statistics.filledSlots / generationResult.statistics.totalSlots) * 100)}%
                      </p>
                      <p className="text-sm text-green-700">充足率</p>
                    </div>
                  </div>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                    <div className="ml-3">
                      <p className="text-2xl font-bold text-amber-900">{generationResult.statistics.warnings.length}</p>
                      <p className="text-sm text-amber-700">警告</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Staff Fulfillment */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-gray-900 mb-3">スタッフ別充足状況</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">スタッフ名</th>
                        <th className="px-4 py-2 text-center">希望コマ数</th>
                        <th className="px-4 py-2 text-center">割り当てコマ数</th>
                        <th className="px-4 py-2 text-center">充足率</th>
                        <th className="px-4 py-2 text-center">平日</th>
                        <th className="px-4 py-2 text-center">休日</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {generationResult.statistics.staffFulfillment.map((staff: any) => (
                        <tr key={staff.staffId}>
                          <td className="px-4 py-2 font-medium">{staff.staffName}</td>
                          <td className="px-4 py-2 text-center">{staff.totalDesiredHours}</td>
                          <td className="px-4 py-2 text-center">{staff.currentAssignedHours}</td>
                          <td className="px-4 py-2 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              staff.fulfillmentRate >= 0.8 
                                ? 'bg-green-100 text-green-800'
                                : staff.fulfillmentRate >= 0.5
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {Math.round(staff.fulfillmentRate * 100)}%
                            </span>
                          </td>
                          <td className="px-4 py-2 text-center">
                            {staff.weekdayAssigned}/{staff.weekdayDesiredHours}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {staff.weekendAssigned}/{staff.weekendDesiredHours}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="bg-blue-50 rounded-lg p-6 max-w-md mx-auto">
                <BarChart3 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">シフト生成詳細</h3>
                <p className="text-sm text-gray-600 mb-4">
                  現在のシフト配置の詳細分析を表示します
                </p>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>• スタッフ別充足状況</p>
                  <p>• 人員不足・制約違反の警告</p>
                  <p>• 生成統計とサマリー</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{shifts.length}</p>
              <p className="text-gray-600">総シフト数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {new Set(shifts.map(s => s.staffId)).size}
              </p>
              <p className="text-gray-600">アクティブスタッフ</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {shifts.filter(s => s.status !== 'confirmed').length}
              </p>
              <p className="text-gray-600">要注意シフト</p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule View */}
      {viewMode === 'calendar' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">週間カレンダー</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    時間帯
                  </th>
                  {daysOfWeek.map((day, index) => (
                    <th key={day} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      <div>
                        {getDayLabel(day)}
                      </div>
                      <div className="text-gray-400 font-normal">
                        {new Date(currentWeek[index]).getDate()}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeSlots.map(timeSlot => (
                  <tr key={timeSlot}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getTimeSlotLabel(timeSlot)}
                    </td>
                    {currentWeek.map((date, dayIndex) => {
                      const dayShifts = shiftsByDate[date]?.filter(s => s.timeSlot === timeSlot) || [];
                      const dayOfWeek = daysOfWeek[dayIndex];
                      const requirement = requirements.find(r => r.dayOfWeek === dayOfWeek && r.timeSlot === timeSlot);
                      const requiredStaff = requirement?.requiredStaff || 0;
                      const assignedStaff = dayShifts.length;
                      const remainingNeeded = Math.max(0, requiredStaff - assignedStaff);
                      
                      // 警告レベルの計算
                      const getWarningLevel = () => {
                        if (requiredStaff === 0) return 'none';
                        const fulfillmentRate = assignedStaff / requiredStaff;
                        if (fulfillmentRate >= 1) return 'fulfilled';
                        if (fulfillmentRate >= 0.5) return 'warning';
                        return 'critical';
                      };
                      
                      const warningLevel = getWarningLevel();
                      
                      const getCellBackgroundColor = () => {
                        switch (warningLevel) {
                          case 'fulfilled':
                            return 'bg-green-50';
                          case 'warning':
                            return 'bg-yellow-50';
                          case 'critical':
                            return 'bg-red-50';
                          default:
                            return 'bg-white';
                        }
                      };
                      
                      return (
                        <td key={date} className={`px-4 py-4 text-center min-h-[80px] ${getCellBackgroundColor()}`}>
                          <div className="space-y-1">
                            {/* 必要人数と残り人数の表示 */}
                            {requiredStaff > 0 && (
                              <div className="mb-2">
                                <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                                  warningLevel === 'fulfilled' 
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : warningLevel === 'warning'
                                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                    : warningLevel === 'critical'
                                    ? 'bg-red-100 text-red-700 border border-red-200'
                                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                                }`}>
                                  {assignedStaff}/{requiredStaff}人
                                  {remainingNeeded > 0 && (
                                    <span className="ml-1 font-semibold">
                                      (あと{remainingNeeded}人)
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* シフト割り当て表示 */}
                            {dayShifts.map(shift => (
                              <div
                                key={shift.id}
                                className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(shift.status)}`}
                              >
                                {userRole === 'admin' ? shift.staffName : getTimeSlotLabel(shift.timeSlot)}
                              </div>
                            ))}
                            
                            {/* 空の場合の表示 */}
                            {dayShifts.length === 0 && requiredStaff > 0 && (
                              <div className={`text-xs px-2 py-1 rounded border-2 border-dashed ${
                                warningLevel === 'critical'
                                  ? 'border-red-300 text-red-600 bg-red-50'
                                  : 'border-gray-300 text-gray-500 bg-gray-50'
                              }`}>
                                {warningLevel === 'critical' ? '緊急募集' : '募集中'}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* 凡例 */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-900 mb-2">凡例</h3>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-50 border border-green-200 rounded mr-2"></div>
                <span className="text-gray-700">充足済み (100%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded mr-2"></div>
                <span className="text-gray-700">注意 (50-99%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-50 border border-red-200 rounded mr-2"></div>
                <span className="text-gray-700">緊急 (50%未満)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-white border border-gray-200 rounded mr-2"></div>
                <span className="text-gray-700">設定なし</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">シフト一覧</h2>
          </div>
          <div className="overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {shifts.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {shifts
                    .filter(shift => userRole === 'admin' || shift.staffId === userId)
                    .map(shift => (
                      <div key={shift.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">
                                  {getDayLabel(shift.dayOfWeek)}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {userRole === 'admin' ? shift.staffName : `${getDayLabel(shift.dayOfWeek)}曜日`}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(shift.date).toLocaleDateString('ja-JP')} - {getTimeSlotLabel(shift.timeSlot)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
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
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">シフトがありません</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}