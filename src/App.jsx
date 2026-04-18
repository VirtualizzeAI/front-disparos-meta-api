
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NewBlast } from './pages/NewBlast';
import { Profile } from './pages/Profile';
import { ConnectedNumber } from './pages/ConnectedNumber';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="new-blast" element={<NewBlast />} />
        <Route path="profile" element={<Profile />} />
        <Route path="connected-number" element={<ConnectedNumber />} />
      </Route>
    </Routes>
  );
}

export default App;
