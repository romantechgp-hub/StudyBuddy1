
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

  useEffect(() => {
    const session = localStorage.getItem('studybuddy_session_id');
    const usersRaw = localStorage.getItem('studybuddy_registered_users');
    if (session && usersRaw) {
      const users: UserProfile[] = JSON.parse(usersRaw);
      const currentUser = users.find(u => u.id === session);
      if (currentUser) {
        if (currentUser.isBlocked) {
          handleLogout();
          alert('আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।');
        } else {
          setUser(currentUser);
          setCurrentView(View.HOME);
        }
      }
    }
  }, []);

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
  };

  const handleLogout = () => {
    localStorage.removeItem('studybuddy_session_id');
    setUser(null);
    setCurrentView(View.LOGIN);
  };

  const handleLogin = (id: string, pass: string): string | null => {
    const usersRaw = localStorage.getItem('studybuddy_registered_users');
    if (!usersRaw) return 'কোনো অ্যাকাউন্ট পাওয়া যায়নি। প্রথমে রেজিস্ট্রেশন করুন।';
    
    const users: UserProfile[] = JSON.parse(usersRaw);
    const found = users.find(u => u.id === id);
    
    if (!found) return 'ইউজার আইডি খুঁজে পাওয়া যায়নি।';
    if (found.password !== pass) return 'সঠিক পাসওয়ার্ড ব্যবহার করুন।';
    if (found.isBlocked) return 'আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে।';
    
    setUser(found);
    localStorage.setItem('studybuddy_session_id', found.id);
    setCurrentView(View.HOME);
    return null;
  };

  const handleRegister = (name: string, id: string, email: string, pass: string, image?: string) => {
    const newUser: UserProfile = {
      id: id,
      email: email || undefined,
      name,
      password: pass,
      points: 0,
      streak: 1,
      lastActive: new Date().toISOString(),
      profileImage: image,
      isBlocked: false
    };
    saveUserToStore(newUser);
    localStorage.setItem('studybuddy_session_id', id);
    setCurrentView(View.HOME);
  };

  const addPoints = (amount: number) => {
    if (!user) return;
    const updated = { ...user, points: user.points + amount };
    saveUserToStore(updated);
  };

  const handleUpdateProfile = (updatedData: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updatedData };
    saveUserToStore(updated);
  };

  const renderView = () => {
    if (currentView === View.LOGIN) return <Login onLogin={handleLogin} onGoToRegister={() => setCurrentView(View.REGISTER)} />;
    if (currentView === View.REGISTER) return <UserSetup onComplete={handleRegister} onGoToLogin={() => setCurrentView(View.LOGIN)} />;
    if (!user) return <Login onLogin={handleLogin} onGoToRegister={() => setCurrentView(View.REGISTER)} />;

    switch (currentView) {
      case View.HOME: return <Home setView={setCurrentView} user={user} />;
      case View.STUDY_MODE: return <StudyMode onBack={() => setCurrentView(View.HOME)} />;
      case View.MATH_SOLVER: return <MathSolver onBack={() => setCurrentView(View.HOME)} />;
      case View.SPEAKING_HELPER: return <SpeakingHelper onBack={() => setCurrentView(View.HOME)} />;
      case View.QA_MODE: return <QAMode onBack={() => setCurrentView(View.HOME)} />;
      case View.TALK_MODE: return <TalkMode onBack={() => setCurrentView(View.HOME)} />;
      case View.SPELLING_CHECKER: return <SpellingChecker onBack={() => setCurrentView(View.HOME)} />;
      case View.SCRIPT_WRITER: return <ScriptWriter onBack={() => setCurrentView(View.HOME)} />;
      case View.SUPPORT_CHAT: return <SupportChat onBack={() => setCurrentView(View.HOME)} userId={user.id} userName={user.name} />;
      case View.DAILY_CHALLENGE: return <DailyChallenge onBack={() => setCurrentView(View.HOME)} onComplete={(pts) => addPoints(pts)} />;
      case View.ADMIN_LOGIN: return <AdminLogin onBack={() => setCurrentView(View.HOME)} onLogin={() => setCurrentView(View.ADMIN_PANEL)} />;
      case View.ADMIN_PANEL: return <AdminPanel onBack={() => setCurrentView(View.HOME)} />;
      case View.PROFILE: return <Profile onBack={() => setCurrentView(View.HOME)} user={user} onUpdate={handleUpdateProfile} onLogout={handleLogout} />;
      default: return <Home setView={setCurrentView} user={user} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {user && <Header user={user} setView={setCurrentView} />}
      <main className="flex-grow container mx-auto px-4 py-6 max-w-4xl">
        {renderView()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
