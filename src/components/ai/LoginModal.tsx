import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

interface User {
  id: string;
  email: string;
  name: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // TODO: 后续接入后端 API
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (mode === 'register') {
        if (!name.trim()) {
          throw new Error(isZh ? '请输入用户名' : 'Please enter your name');
        }
        if (password.length < 6) {
          throw new Error(isZh ? '密码至少6位' : 'Password must be at least 6 characters');
        }
        // 注册成功
        const newUser: User = {
          id: Date.now().toString(),
          email,
          name,
        };
        localStorage.setItem('user', JSON.stringify(newUser));
        onLoginSuccess(newUser);
      } else {
        // 登录验证（后续接入后端）
        if (!email || !password) {
          throw new Error(isZh ? '请填写所有字段' : 'Please fill in all fields');
        }
        // 模拟登录成功
        const user: User = {
          id: '1',
          email,
          name: email.split('@')[0],
        };
        localStorage.setItem('user', JSON.stringify(user));
        onLoginSuccess(user);
      }

      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : (isZh ? '操作失败' : 'Operation failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError(null);
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
  };

  const handleGuestMode = () => {
    // 访客模式：只记录本地，不上传数据
    const guestUser: User = {
      id: 'guest',
      email: 'guest@local',
      name: isZh ? '访客' : 'Guest',
    };
    localStorage.setItem('user', JSON.stringify(guestUser));
    onLoginSuccess(guestUser);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative w-full max-w-md bg-dark-card border border-white/10 rounded-3xl p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {mode === 'login'
                  ? isZh
                    ? '欢迎回来'
                    : 'Welcome Back'
                  : isZh
                    ? '创建账号'
                    : 'Create Account'}
              </h2>
              <p className="text-gray-400 text-sm">
                {mode === 'login'
                  ? isZh
                    ? '登录以使用 AI 工具'
                    : 'Sign in to use AI tools'
                  : isZh
                    ? '注册后开始使用'
                    : 'Sign up to get started'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isZh ? '用户名' : 'Name'}
                    className="w-full pl-12 pr-4 py-3 bg-dark-cardLight border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-purple/50 transition-colors"
                  />
                </div>
              )}

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isZh ? '邮箱地址' : 'Email address'}
                  className="w-full pl-12 pr-4 py-3 bg-dark-cardLight border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-purple/50 transition-colors"
                />
              </div>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isZh ? '密码' : 'Password'}
                  className="w-full pl-12 pr-12 py-3 bg-dark-cardLight border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-purple/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-purple to-primary-violet text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary-purple/30 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>{isZh ? '处理中...' : 'Processing...'}</span>
                  </>
                ) : (
                  <span>
                    {mode === 'login'
                      ? isZh
                        ? '登录'
                        : 'Sign In'
                      : isZh
                        ? '注册'
                        : 'Sign Up'}
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-500 text-sm">
                {isZh ? '或' : 'or'}
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Guest Mode */}
            <button
              onClick={handleGuestMode}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-medium hover:bg-white/10 hover:text-white transition-all"
            >
              {isZh ? '游客模式（仅本地使用）' : 'Continue as Guest (Local Only)'}
            </button>

            {/* Switch Mode */}
            <p className="text-center text-gray-400 text-sm mt-6">
              {mode === 'login'
                ? isZh
                  ? '还没有账号？'
                  : "Don't have an account?"
                : isZh
                  ? '已有账号？'
                  : 'Already have an account?'}{' '}
              <button
                onClick={switchMode}
                className="text-primary-purple hover:text-primary-violet transition-colors font-medium"
              >
                {mode === 'login'
                  ? isZh
                    ? '立即注册'
                    : 'Sign up'
                  : isZh
                    ? '立即登录'
                    : 'Sign in'}
              </button>
            </p>

            {/* Privacy Note */}
            <p className="text-center text-gray-500 text-xs mt-4">
              {isZh
                ? '🔒 我们尊重您的隐私，数据仅本地处理'
                : '🔒 We respect your privacy, data processed locally only'}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
