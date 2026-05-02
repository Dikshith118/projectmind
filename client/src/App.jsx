import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Projects  from './pages/Projects';
import Dashboard from './pages/Dashboard';

function Protected({ children }) {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <Protected><Projects /></Protected>
        } />
        <Route path="/projects/:id" element={
          <Protected><Dashboard /></Protected>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}