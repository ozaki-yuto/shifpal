import React, { useState } from 'react';
import { Save, Plus, Trash2, CheckCircle } from 'lucide-react';
import { ShiftRequirement, DayOfWeek, TimeSlot } from '../types';

interface ShiftRequirementsProps {
  requirements: ShiftRequirement[];
  onUpdateRequirements: (requirements: ShiftRequirement[]) => void;
}

export function ShiftRequirements({ requirements, onUpdateRequirements }: ShiftRequirementsProps) {
  const [localRequirements, setLocalRequirements] = useState<ShiftRequirement[]>(requirements);
  const [maxConsecutiveDays, setMaxConsecutiveDays] = useState(5);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const daysOfWeek: { value: DayOfWeek; label: string }[] = [
    { value: 'monday', label: '月曜日' },
    { value: 'tuesday', label: '火曜日' },
    { value: 'wednesday', label: '水曜日' },
    { value: 'thursday', label: '木曜日' },
    { value: 'friday', label: '金曜日' },
    { value: 'saturday', label: '土曜日' },
    { value: 'sunday', label: '日曜日' },
  ];

  const timeSlots: { value: TimeSlot; label: string }[] = [
    { value: 'morning', label: '朝 (9:00-13:00)' },
    { value: 'afternoon', label: '昼 (13:00-17:00)' },
    { value: 'evening', label: '夜 (17:00-21:00)' },
  ];

  const updateRequirement = (dayOfWeek: DayOfWeek, timeSlot: TimeSlot, requiredStaff: number) => {
    const existingIndex = localRequirements.findIndex(
      req => req.dayOfWeek === dayOfWeek && req.timeSlot === timeSlot
    );

    if (existingIndex >= 0) {
      const updated = [...localRequirements];
      updated[existingIndex] = { dayOfWeek, timeSlot, requiredStaff };
      setLocalRequirements(updated);
    } else {
      setLocalRequirements([...localRequirements, { dayOfWeek, timeSlot, requiredStaff }]);
    }
  };

  const getRequirement = (dayOfWeek: DayOfWeek, timeSlot: TimeSlot): number => {
    const req = localRequirements.find(
      r => r.dayOfWeek === dayOfWeek && r.timeSlot === timeSlot
    );
    return req ? req.requiredStaff : 0;
  };

  const handleSave = () => {
    setSaveStatus('saving');
    onUpdateRequirements(localRequirements);
    
    // Show success feedback
    setTimeout(() => {
      setSaveStatus('saved');
      
      // Show alert with summary
      const totalSlots = localRequirements.length;
      const totalStaffNeeded = localRequirements.reduce((sum, req) => sum + req.requiredStaff, 0);
      const weekdaySlots = localRequirements.filter(req => 
        !['saturday', 'sunday'].includes(req.dayOfWeek)
      ).length;
      const weekendSlots = localRequirements.filter(req => 
        ['saturday', 'sunday'].includes(req.dayOfWeek)
      ).length;
      
      alert(`✅ シフト要件設定が保存されました！\n\n📊 設定サマリー:\n• 設定済みシフト枠: ${totalSlots}枠\n• 必要スタッフ総数: ${totalStaffNeeded}人\n• 平日シフト枠: ${weekdaySlots}枠\n• 休日シフト枠: ${weekendSlots}枠\n• 最大連勤日数: ${maxConsecutiveDays}日`);
      
      // Reset status after showing feedback
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">シフト要件設定</h1>
          <p className="text-gray-600 mt-1">曜日・時間帯別の必要人数と勤務制限を設定します</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
            saveStatus === 'saved'
              ? 'bg-green-600 text-white'
              : saveStatus === 'saving'
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {saveStatus === 'saved' ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              保存完了
            </>
          ) : saveStatus === 'saving' ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
              保存中...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              設定を保存
            </>
          )}
        </button>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本設定</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              最大連勤日数
            </label>
            <input
              type="number"
              value={maxConsecutiveDays}
              onChange={(e) => setMaxConsecutiveDays(parseInt(e.target.value))}
              min="1"
              max="7"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">スタッフが連続で勤務できる最大日数</p>
          </div>
        </div>
      </div>

      {/* Save Status Banner */}
      {saveStatus === 'saved' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">設定が正常に保存されました</h3>
              <p className="text-sm text-green-700 mt-1">
                シフト自動生成時に、この設定が適用されます。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Shift Requirements Matrix */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">必要人数設定</h2>
          <p className="text-sm text-gray-600 mt-1">各曜日・時間帯の必要人数を設定してください</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  曜日
                </th>
                {timeSlots.map(slot => (
                  <th key={slot.value} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {slot.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {daysOfWeek.map(day => (
                <tr key={day.value} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {day.label}
                  </td>
                  {timeSlots.map(slot => (
                    <td key={slot.value} className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="number"
                        value={getRequirement(day.value, slot.value)}
                        onChange={(e) => updateRequirement(day.value, slot.value, parseInt(e.target.value) || 0)}
                        min="0"
                        max="10"
                        className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Current Settings Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">現在の設定サマリー</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {localRequirements.length}
            </p>
            <p className="text-sm text-gray-600">設定済みシフト枠</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {localRequirements.reduce((sum, req) => sum + req.requiredStaff, 0)}
            </p>
            <p className="text-sm text-gray-600">必要スタッフ総数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {localRequirements.filter(req => !['saturday', 'sunday'].includes(req.dayOfWeek)).length}
            </p>
            <p className="text-sm text-gray-600">平日シフト枠</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {localRequirements.filter(req => ['saturday', 'sunday'].includes(req.dayOfWeek)).length}
            </p>
            <p className="text-sm text-gray-600">休日シフト枠</p>
          </div>
        </div>
      </div>

      {/* Rules Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">シフト作成ルール</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• 1日に3連続（朝・昼・夜）の勤務は禁止されます</p>
          <p>• 「朝・昼」または「昼・夜」の2連続勤務は許可されます</p>
          <p>• 「朝・夜」のような間が空く変則勤務は禁止されます</p>
          <p>• 最大連勤日数を超える連続勤務は自動的に回避されます</p>
          <p>• 希望者が必要人数以下の場合は全員確定、超過時は充足率で調整されます</p>
        </div>
      </div>
    </div>
  );
}