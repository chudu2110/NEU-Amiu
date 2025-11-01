import React, { useState } from 'react';
import { REQUIRED_EMAIL_DOMAIN } from '../constants';
import { useStore } from '../hooks/useStore';
import LanguageSwitcher from './LanguageSwitcher';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { register, t } = useStore();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.toLowerCase().endsWith(REQUIRED_EMAIL_DOMAIN)) {
      setError(t('invalidEmail'));
      return;
    }
    register(email, name);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat p-4" style={{ backgroundImage: "url('https://picsum.photos/id/122/1920/1080')" }}>
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
      
      <div className="absolute top-4 right-4 flex items-center space-x-4 z-10">
        <LanguageSwitcher />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center text-white max-w-md w-full">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight brand-font">
            {(() => {
              const appName = t('appName');
              const firstChar = appName.charAt(0);
              const restChars = appName.slice(1);
              return (
                <span className="brand-gradient-text">
                  <span className="logo-n-font uppercase">{firstChar}</span>
                  <span className="brand-font">{restChars}</span>
                </span>
              );
            })()}
        </h1>
        
        <div className="mt-10 w-full bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white">{t('createAccount')}</h2>
            <p className="text-gray-300 mt-1">{t('loginSubtitle')}</p>
            <form onSubmit={handleRegister} className="mt-6 w-full space-y-4">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('fullNamePlaceholder')} required className="w-full px-4 py-3 bg-white/20 border-2 border-transparent focus:border-blue-500 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-0 transition duration-300" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('emailPlaceholder')} required className="w-full px-4 py-3 bg-white/20 border-2 border-transparent focus:border-blue-500 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-0 transition duration-300" />
              {error && <p className="pt-1 text-red-400 text-sm">{error}</p>}
              <div className="pt-2">
                <button type="submit" className="w-full btn-responsive brand-button hover:opacity-90 transition">{t('registerButton')}</button>
                <p className="mt-4 text-center text-gray-300 text-sm">
                  {t('alreadyHaveAccountPrompt')}
                  <button type="button" onClick={onSwitchToLogin} className="font-semibold text-cyan-400 hover:text-cyan-300 underline bg-transparent border-none p-0 cursor-pointer">{t('loginLink')}</button>
                </p>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;