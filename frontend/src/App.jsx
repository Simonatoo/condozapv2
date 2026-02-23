import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './pages/Login';
import Home from './pages/Home';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import MyProducts from './pages/MyProducts';
import Settings from './pages/Settings';
import MyCondo from './pages/MyCondo';

function App() {
  return (
    <GoogleOAuthProvider clientId="110838961324-7v3m69c6thv4jhn66je3qogjtl8pov0h.apps.googleusercontent.com">
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/my-products" element={<PrivateRoute><MyProducts /></PrivateRoute>} />
            <Route path="/my-condo" element={<PrivateRoute><MyCondo /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          </Routes>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
