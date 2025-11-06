
import React, { useEffect, useRef, useState } from 'react';
import { useStore } from './hooks/useStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import CreatePasswordPage from './pages/CreatePasswordPage';
import OnboardingPage from './components/OnboardingPage';
import SwipePage from './components/SwipePage';
import ChatListPage from './components/ChatListPage';
import MyProfilePage from './components/MyProfilePage';
import TabBar from './components/TabBar';
import socket from './data/socket';
import type { User } from './types';

export type Page = 'swipe' | 'chats' | 'profile';

// Helper: Tạo user ID từ email (hash đơn giản)
const generateUserIdFromEmail = (email: string): number => {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % 1000000; // Giới hạn trong phạm vi hợp lý
};

// Helper: Chuyển online user info thành User type
const convertOnlineUserToUser = (onlineUser: any): User => {
  return {
    id: onlineUser.id || generateUserIdFromEmail(onlineUser.email || ''),
    name: onlineUser.name || 'Unknown User',
    age: 20, // Default age cho test
    bio: `Online - ${onlineUser.email || ''}`,
    image: `https://ui-avatars.com/api/?name=${encodeURIComponent(onlineUser.name || 'User')}&background=random&size=200`
  };
};

function App() {
  const { theme, isAuthenticated, hasOnboarded, userEmail, myProfile, addMatch, addMessage, chats } = useStore();
  const [activePage, setActivePage] = useState<Page>('swipe');
  const [authView, setAuthView] = useState<'login' | 'register' | 'verifyOtp' | 'createPassword'>('login');
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const prevAuthRef = useRef<boolean>(isAuthenticated);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Debug: Track authentication state changes
  useEffect(() => {
    console.log('🔐 Authentication state changed - isAuthenticated:', isAuthenticated, 'hasOnboarded:', hasOnboarded);
  }, [isAuthenticated, hasOnboarded]);

  // Reset về login chỉ khi thực sự logout (transition true -> false)
  useEffect(() => {
    const prev = prevAuthRef.current;
    if (prev && !isAuthenticated) {
      setAuthView('login');
      setPendingEmail('');
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // Socket: Xử lý users online và nhận tin nhắn global
  useEffect(() => {
    if (!isAuthenticated || !userEmail) return;

    const myId = generateUserIdFromEmail(userEmail);

    // Khi socket connect, gửi thông tin user đăng nhập và join room
    const handleConnect = () => {
      socket.emit('user:login', {
        userId: myId,
        name: myProfile?.name || userEmail.split('@')[0],
        email: userEmail
      });
      socket.emit('join', { roomId: 'global-room', userId: String(myId) });
      console.log('Sent user:login event', { userId: myId, name: myProfile?.name, email: userEmail });
    };


    // Nhận danh sách users online khi đăng nhập
    const handleOnlineUsers = (users: any[]) => {
      console.log('Received online users:', users);
      users.forEach((onlineUser) => {
        const user = convertOnlineUserToUser(onlineUser);
        addMatch(user);
      });
    };

    // Nhận thông báo khi có user mới online
    const handleUserOnline = (onlineUser: any) => {
      console.log('User came online:', onlineUser);
      const user = convertOnlineUserToUser(onlineUser);
      addMatch(user);
    };

    // Nhận thông báo khi user offline (optional: có thể xóa khỏi matches)
    const handleUserOffline = (data: any) => {
      console.log('User went offline:', data);
      // Có thể xử lý xóa user khỏi matches nếu cần
    };

    // Handler nhận tin nhắn toàn cục (hoạt động ở mọi trang, không chỉ ChatPage)
    const handleGlobalMessage = (payload: any) => {
      const payloadFromStr = String(payload.from || '');
      const payloadToStr = String(payload.to || '');
      const myIdStr = String(myId || '');
      
      // Bỏ qua tin nhắn từ chính mình (đã được thêm local trong ChatPage rồi)
      if (payloadFromStr === myIdStr) {
        return;
      }
      
      // Chỉ nhận tin nhắn gửi cho mình
      if (payloadToStr === myIdStr) {
        // Tìm chat với user gửi tin nhắn
        const senderUserId = Number(payloadFromStr);
        if (!senderUserId) return;
        
        // Check duplicate trước khi thêm
        const existingChat = chats.find(c => c.matchId === senderUserId);
        const existingMessages = existingChat ? existingChat.messages : [];
        
        const incomingMessage = {
          id: payload.id || Date.now(),
          sender: 'them' as const,
          timestamp: payload.ts || Date.now(),
          type: (payload.type || 'text') as 'text',
          content: payload.content || payload.text || '',
        };
        
        // Check duplicate
        const isDuplicate = existingMessages.some(m => 
          m.id === incomingMessage.id || 
          (m.content === incomingMessage.content && 
           Math.abs(m.timestamp - incomingMessage.timestamp) < 1000 &&
           m.sender === incomingMessage.sender)
        );
        
        if (!isDuplicate) {
          addMessage(senderUserId, incomingMessage);
          console.log('Global message received and added to chat:', senderUserId);
        }
      }
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on('connect', handleConnect);
    socket.on('online-users', handleOnlineUsers);
    socket.on('user:online', handleUserOnline);
    socket.on('user:offline', handleUserOffline);
    socket.on('message', handleGlobalMessage); // Listener toàn cục cho tin nhắn

    return () => {
      socket.off('connect', handleConnect);
      socket.off('online-users', handleOnlineUsers);
      socket.off('user:online', handleUserOnline);
      socket.off('user:offline', handleUserOffline);
      socket.off('message', handleGlobalMessage);
    };
  }, [isAuthenticated, userEmail, myProfile?.name, addMatch, addMessage, chats]);

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

  // Debug log
  console.log('App.tsx render - isAuthenticated:', isAuthenticated, 'hasOnboarded:', hasOnboarded, 'authView:', authView);

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
      ) : authView === 'register' ? (
        <RegisterPage 
          onSwitchToLogin={() => setAuthView('login')}
          onOtpSent={(email: string) => { setPendingEmail(email); setAuthView('verifyOtp'); }}
        />
      ) : authView === 'verifyOtp' ? (
        <VerifyOtpPage 
          email={pendingEmail}
          onBack={() => setAuthView('register')}
          onVerified={() => setAuthView('createPassword')}
        />
      ) : (
        <CreatePasswordPage emailProp={pendingEmail} />
      )}
    </div>
  );
}

export default App;
