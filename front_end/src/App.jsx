import './App.css';

import Register from './component/Register';
import Login from './component/Login';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './component/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login Page */}
        <Route path="/" element={<Login />} />

        {/* Register Page */}
        <Route path="/register" element={<Register />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
