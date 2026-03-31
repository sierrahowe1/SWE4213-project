import { useState, useEffect, useCallback } from 'react'
import AuthContainer from './components/AuthContainer'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import BookDetails from './components/BookDetails'
import Profile from './components/Profile'
import Recommendations from './components/Recommendations'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/auth/status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user || data);
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setCurrentPage('dashboard');
    setSelectedBook(null);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    setSelectedBook(null);
  };

  const handleBookSelect = (book) => {
    setSelectedBook(book);
    setCurrentPage('bookDetails');
  };

  const handleBackToDashboard = () => {
    setSelectedBook(null);
    setCurrentPage('dashboard');
    refreshUser();
  };

  const handleRecommendations = () => {
    setSelectedBook(null);
    setCurrentPage('rec');
  };

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('/api/auth/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user) setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  }, []);

  // Keep yearly counts and goals in sync when opening Profile
  useEffect(() => {
    if (!isLoggedIn || currentPage !== 'profile') return;
    refreshUser();
  }, [currentPage, isLoggedIn, refreshUser]);

  if (authLoading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <span className="text-gray-600">Loading session...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {isLoggedIn && <Header user={user} onNavigate={handleNavigate} onLogout={handleLogout} />}

      {!isLoggedIn ? (
        <AuthContainer onLogin={handleLogin} />
      ) : (
        <>
          {currentPage === 'dashboard' && (
            <Dashboard onBookSelect={handleBookSelect} user={user} />
          )}
          {currentPage === 'profile' && (
            <Profile user={user} onUserUpdated={refreshUser} />
          )}
          {currentPage === 'bookDetails' && selectedBook && (
            <BookDetails book={selectedBook} user={user} onBack={handleBackToDashboard} onUserUpdated={refreshUser} />
          )}
          {currentPage === 'rec' && (
            <Recommendations user={user}  onBookSelect={handleBookSelect}/>
          )}
        </>
      )}
    </div>
  );
}

export default App;
