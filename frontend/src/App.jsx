import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Admin from './pages/Admin';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './App.css';

// Navigation Manager
const MainLayout = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const { user, isAdmin } = useAuth();

  const handleViewDetails = (id) => {
    setSelectedProductId(id);
    setCurrentPage('detail');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onViewDetails={handleViewDetails} />;
      case 'detail':
        return <ProductDetail productId={selectedProductId} onBack={() => setCurrentPage('home')} />;
      case 'cart':
        return (user?.role === 'admin' || user?.role === 'staff') ? <Home onViewDetails={handleViewDetails} /> : <Cart onNavigate={setCurrentPage} />;
      case 'orders':
        return (user?.role === 'admin' || user?.role === 'staff') ? <Home onViewDetails={handleViewDetails} /> : <Orders />;
      case 'login':
        return <Login onLoginSuccess={(loggedInUser) => {
          if (loggedInUser?.role === 'admin' || loggedInUser?.role === 'staff') {
            setCurrentPage('admin');
          } else {
            setCurrentPage('home');
          }
        }} />;
      case 'admin':
        // Guard admin route just in case
        return (isAdmin || user?.role === 'staff') ? <Admin /> : <Home onViewDetails={handleViewDetails} />;
      default:
        return <Home onViewDetails={handleViewDetails} />;
    }
  };

  return (
    <div style={styles.appContainer}>
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="container" style={styles.mainContent}>
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainLayout />
      </CartProvider>
    </AuthProvider>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-main)',
  },
  mainContent: {
    flexGrow: 1,
    paddingBottom: '3rem',
  },
};

export default App;
