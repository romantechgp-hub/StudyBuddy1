
import React, { useState, useEffect } from 'react';
import { View, UserProfile } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import StudyMode from './components/StudyMode';
import MathSolver from './components/MathSolver';
import SpeakingHelper from './components/SpeakingHelper';
import QAMode from './components/QAMode';
import TalkMode from './components/TalkMode';
import SupportChat from './components/SupportChat';
import DailyChallenge from './components/DailyChallenge';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import Profile from './components/Profile';
import UserSetup from './components/UserSetup';
import Login from './components/Login';
import SpellingChecker from './components/SpellingChecker';
import ScriptWriter from './components/ScriptWriter';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.LOGIN);
  const [user, setUser] = useState<UserProfile | null>(null);

  const loadUserFromStorage = () => {
    const session = localStorage.getItem('studybuddy_session_id');
    const usersRaw = localStorage.getItem('studybuddy_registered_users');
    if (session && usersRaw) {
      const users: UserProfile[] = JSON.parse(usersRaw);
      const currentUser = users.find(u => u.id === session);
      if (currentUser) {
        if (currentUser.isBlocked) {
          handleLogout();
          alert('আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে।');
        } else {
          setUser(currentUser);
        }
      }
    }
  };

  useEffect(() => {
    loadUserFromStorage();
    
    const session = localStorage.getItem('studybuddy_session_id');
    const initialView = session ? View.HOME : View.LOGIN;
    setCurrentView(initialView);
    
    // Ensure there is an initial state in history
    window.history.replaceState({ view: initialView }, '', '');

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setCurrentView(event.state.view);
      }
    };

    const handleStorageUpdate = () => {
      loadUserFromStorage();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('local-storage-update', handleStorageUpdate);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('local-storage-update', handleStorageUpdate);
    };
  }, []);

  const navigateTo = (newView: View, replace: boolean = false) => {
    if (replace) {
      window.history.replaceState({ view: newView }, '', '');
    } else {
      window.history.pushState({ view: newView }, '', '');
    }
    setCurrentView(newView);
  };

  const saveUserToStore = (updatedUser: UserProfile) => {
    const usersRaw = localStorage.getItem('studybuddy_registered_users');
    let users: UserProfile[] = usersRaw ? JSON.parse(usersRaw) : [];
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index > -1) {
      users[index] = updatedUser;
    } else {
      users.push(updatedUser);
    }
    localStorage.setItem('studybuddy_registered_users', JSON.stringify(users));
    setUser(updatedUser);
    window.dispatchEvent(new CustomEvent('local-storage-update'));
  };

  const handleLogout = () => {
    localStorage.removeItem('studybuddy_session_id');
    setUser(null);
    navigateTo(View.LOGIN, true);
    window.dispatchEvent(new CustomEvent('local-storage-update'));
  };

  const handleLogin = (id: string, pass: string): string | null => {
    const usersRaw = localStorage.getItem('studybuddy_registered_users');
    if (!usersRaw) return 'অ্যাকাউন্ট পাওয়া যায়নি।';
    const users: UserProfile[] = JSON.parse(usersRaw);
    const found = users.find(u => u.id === id);
    if (!found) return 'ভুল আইডি।';
    if (found.password !== pass) return 'ভুল পাসওয়ার্ড।';
    if (found.isBlocked) return 'অ্যাকাউন্টটি ব্লকড।';
    
    setUser(found);
    localStorage.setItem('studybuddy_session_id', found.id);
    navigateTo(View.HOME, true);
    window.dispatchEvent(new CustomEvent('local-storage-update'));
    return null;
  };

  const handleRegister = (name: string, id: string, email: string, pass: string, image?: string) => {
    const newUser: UserProfile = {
      id, email: email || undefined, name, password: pass,
      points: 0, streak: 1, lastActive: new Date().toISOString(),
      profileImage: image, isBlocked: false
    };
    saveUserToStore(newUser);
    localStorage.setItem('studybuddy_session_id', id);
    navigateTo(View.HOME, true);
  };

  const handleUpdateProfile = (updatedData: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updatedData, lastActive: new Date().toISOString() };
    saveUserToStore(updated);
  };

  const renderView = () => {
    if (currentView === View.LOGIN) return <Login onLogin={handleLogin} onGoToRegister={() => navigateTo(View.REGISTER)} />;
    if (currentView === View.REGISTER) return <UserSetup onComplete={handleRegister} onGoToLogin={() => navigateTo(View.LOGIN)} />;
    if (!user) return <Login onLogin={handleLogin} onGoToRegister={() => navigateTo(View.REGISTER)} />;

    switch (currentView) {
      case View.HOME: return <Home setView={navigateTo} user={user} />;
      case View.STUDY_MODE: return <StudyMode onBack={() => window.history.back()} />;
      case View.MATH_SOLVER: return <MathSolver onBack={() => window.history.back()} />;
      case View.SPEAKING_HELPER: return <SpeakingHelper onBack={() => window.history.back()} />;
      case View.QA_MODE: return <QAMode onBack={() => window.history.back()} />;
      case View.TALK_MODE: return <TalkMode onBack={() => window.history.back()} />;
      case View.SPELLING_CHECKER: return <SpellingChecker onBack={() => window.history.back()} />;
      case View.SCRIPT_WRITER: return <ScriptWriter onBack={() => window.history.back()} />;
      case View.SUPPORT_CHAT: return <SupportChat onBack={() => window.history.back()} userId={user.id} userName={user.name} />;
      case View.DAILY_CHALLENGE: return <DailyChallenge onBack={() => window.history.back()} onComplete={(pts) => {
        const updated = { ...user, points: user.points + pts };
        saveUserToStore(updated);
      }} />;
      case View.ADMIN_LOGIN: return <AdminLogin onBack={() => window.history.back()} onLogin={() => navigateTo(View.ADMIN_PANEL)} />;
      case View.ADMIN_PANEL: return <AdminPanel onBack={() => window.history.back()} />;
      case View.PROFILE: return <Profile onBack={() => window.history.back()} user={user} onUpdate={handleUpdateProfile} onLogout={handleLogout} />;
      default: return <Home setView={navigateTo} user={user} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {user && <Header user={user} setView={navigateTo} />}
      <main className="flex-grow container mx-auto px-4 py-6 max-w-4xl">
        {renderView()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
