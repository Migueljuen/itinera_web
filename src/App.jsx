import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import CreatorPage from './pages/creator/index';
export default function App() {
  return (
    <Router>
      <Routes>
        {/* shared */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* creator */}
        <Route path="/creator" element={<CreatorPage />} />

      </Routes>
    </Router>
  );
}