
import React, { useEffect, useState } from 'react';
import { useStore } from './hooks/useStore';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import OnboardingPage from './components/OnboardingPage';
import SwipePage from './components/SwipePage';
import ChatListPage from './components/ChatListPage';
import MyProfilePage from './components/MyProfilePage';
import TabBar from './components/TabBar';

export type Page = 'swipe' | 'chats' | 'profile';

function App() {
  const { theme, isAuthenticated, hasOnboarded } = useStore();
  const [activePage, setActivePage] = useState<Page>('swipe');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const renderPage = () => {
    switch (activePage) {
      case 'swipe':
        return <SwipePage setActivePage={setActivePage} />;
      case 'chats':
        return <ChatListPage setActivePage={setActivePage} />;
      case 'profile':
        return <MyProfilePage />;
      default:
        return <SwipePage setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-black min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {isAuthenticated ? (
        !hasOnboarded ? (
          <OnboardingPage onComplete={() => setActivePage('swipe')} />
        ) : (
        <div className="flex flex-col h-screen max-h-screen">
          <div className="flex-grow overflow-hidden">
            {renderPage()}
          </div>
          <TabBar activePage={activePage} setActivePage={setActivePage} />
        </div>
        )
      ) : authView === 'login' ? (
        <LoginPage onSwitchToRegister={() => setAuthView('register')} />
      ) : (
        <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
      )}
    </div>
  );
}

export default App;
