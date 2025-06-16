import React, { useState } from 'react';
import { Send, MessageSquare, AlertTriangle, RefreshCw } from 'lucide-react';
import { Message, UserRole } from '../types';

interface CommunicationProps {
  messages: Message[];
  userRole: UserRole;
  userName: string;
  onSendMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
}

export function Communication({ messages, userRole, userName, onSendMessage }: CommunicationProps) {
  const [activeTab, setActiveTab] = useState<'board' | 'absence' | 'exchange'>('board');
  const [newMessage, setNewMessage] = useState({ title: '', content: '', to: 'all' });
  const [absenceDate, setAbsenceDate] = useState('');
  const [absenceReason, setAbsenceReason] = useState('');

  const handleSendAnnouncement = () => {
    if (newMessage.title.trim() && newMessage.content.trim()) {
      onSendMessage({
        from: userName,
        to: newMessage.to,
        title: newMessage.title,
        content: newMessage.content,
        type: 'announcement'
      });
      setNewMessage({ title: '', content: '', to: 'all' });
    }
  };

  const handleAbsenceRequest = () => {
    if (absenceDate && absenceReason.trim()) {
      onSendMessage({
        from: userName,
        to: '田中店長', // In a real app, this would be dynamic
        title: `${absenceDate} 欠勤申請`,
        content: absenceReason,
        type: 'absence'
      });
      setAbsenceDate('');
      setAbsenceReason('');
    }
  };

  const filteredMessages = messages.filter(msg => {
    switch (activeTab) {
      case 'board':
        return msg.type === 'announcement';
      case 'absence':
        return msg.type === 'absence';
      case 'exchange':
        return msg.type === 'exchange';
      default:
        return true;
    }
  });

  const tabs = [
    { id: 'board', label: '掲示板', icon: MessageSquare },
    { id: 'absence', label: '欠勤連絡', icon: AlertTriangle },
    { id: 'exchange', label: 'シフト交換', icon: RefreshCw },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">コミュニケーション</h1>
        <p className="text-gray-600 mt-1">スタッフ間の連絡とシフト調整を行います</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="h-5 w-5 mr-2" />
                {tab.label}
                {tab.id === 'absence' && filteredMessages.length > 0 && (
                  <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                    {filteredMessages.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredMessages.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredMessages.map((message) => (
                    <div key={message.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{message.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              message.type === 'announcement' 
                                ? 'bg-blue-100 text-blue-800'
                                : message.type === 'absence'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {message.type === 'announcement' ? 'お知らせ' : 
                               message.type === 'absence' ? '欠勤' : '交換'}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3">{message.content}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <span>差出人: {message.from}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(message.timestamp).toLocaleString('ja-JP')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">メッセージがありません</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-4">
          {activeTab === 'board' && userRole === 'admin' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">新しいお知らせ</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    タイトル
                  </label>
                  <input
                    type="text"
                    value={newMessage.title}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="お知らせのタイトル"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    宛先
                  </label>
                  <select
                    value={newMessage.to}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, to: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">全員</option>
                    <option value="staff">スタッフのみ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メッセージ
                  </label>
                  <textarea
                    value={newMessage.content}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="お知らせの内容を入力してください"
                  />
                </div>
                <button
                  onClick={handleSendAnnouncement}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="h-4 w-4 mr-2" />
                  送信
                </button>
              </div>
            </div>
          )}

          {activeTab === 'absence' && userRole === 'staff' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">欠勤申請</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    欠勤日
                  </label>
                  <input
                    type="date"
                    value={absenceDate}
                    onChange={(e) => setAbsenceDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    理由
                  </label>
                  <textarea
                    value={absenceReason}
                    onChange={(e) => setAbsenceReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="欠勤理由を入力してください"
                  />
                </div>
                <button
                  onClick={handleAbsenceRequest}
                  className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  欠勤申請
                </button>
              </div>
            </div>
          )}

          {activeTab === 'exchange' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">シフト交換</h3>
              <div className="text-center py-8">
                <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">
                  シフト交換機能は開発中です。<br />
                  交換希望がある場合は、直接管理者にご連絡ください。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}