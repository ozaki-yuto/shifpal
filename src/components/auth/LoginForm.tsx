import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, Mail, Lock, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  onToggleMode: () => void;
  onForgotPassword: () => void;
}

export function LoginForm({ onToggleMode, onForgotPassword }: LoginFormProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    setError(null);

    try {
      await signIn(demoEmail, demoPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'デモログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const clearStorageAndReload = () => {
    // Clear all local storage and session storage
    localStorage.clear();
    sessionStorage.clear();
    // Reload the page to start fresh
    window.location.reload();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">シフパルにログイン</h2>
          <p className="text-gray-600 mt-2">アカウントにサインインしてください</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-700 text-sm">{error}</p>
                {error.includes('認証') || error.includes('token') || error.includes('session') ? (
                  <button
                    onClick={clearStorageAndReload}
                    className="mt-2 text-xs text-red-600 hover:text-red-800 underline flex items-center"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    セッションをリセットして再読み込み
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="パスワードを入力"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">ログイン状態を保持</span>
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              パスワードを忘れた方
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                ログイン中...
              </div>
            ) : (
              'ログイン'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            アカウントをお持ちでない方は{' '}
            <button
              onClick={onToggleMode}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              新規登録
            </button>
          </p>
        </div>

        {/* Demo accounts */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3">デモアカウント</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-600">
                <div>管理者: tanaka@store.com</div>
                <div>パスワード: password123</div>
              </div>
              <button
                onClick={() => handleDemoLogin('tanaka@store.com', 'password123')}
                disabled={loading}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                ログイン
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-600">
                <div>スタッフ: sato@example.com</div>
                <div>パスワード: password123</div>
              </div>
              <button
                onClick={() => handleDemoLogin('sato@example.com', 'password123')}
                disabled={loading}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
              >
                ログイン
              </button>
            </div>
          </div>
        </div>

        {/* Troubleshooting section */}
        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-xs font-medium text-yellow-800 mb-2">ログインできない場合</h4>
          <button
            onClick={clearStorageAndReload}
            className="text-xs text-yellow-700 hover:text-yellow-900 underline flex items-center"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            ブラウザデータをクリアして再読み込み
          </button>
        </div>
      </div>
    </div>
  );
}