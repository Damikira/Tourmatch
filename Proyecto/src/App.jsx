import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Componentes
import Navbar from './components/Navbar/Navbar';

// Páginas
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Registro from './pages/Registro/Registro';
import Panoramas from './pages/Panoramas/Panoramas';
import Lugares from './pages/Lugares/Lugares';
import Nosotros from './pages/Nosotros/Nosotros';
import Contacto from './pages/Contacto/Contacto';

// Dashboards Separados (Asegúrate de crear estas rutas/archivos)
import DashboardTurista from './pages/Dashboard/DashboardTurista';
import DashboardConductor from './pages/Dashboard/DashboardConductor';

// Este componente decide qué dashboard mostrar según el rol
const DashboardSwitcher = () => {
  const { user } = useAuth();
  
  if (user?.role === 'conductor') {
    return <DashboardConductor />;
  }
  return <DashboardTurista />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/panoramas" element={<Panoramas />} />
          <Route path="/lugares" element={<Lugares />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contacto" element={<Contacto />} />

          {/* RUTAS PROTEGIDAS */}
          
          {/* Dashboard Único: Internamente decide si mostrar Turista o Conductor */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['turista', 'conductor']}>
                <DashboardSwitcher />
              </ProtectedRoute>
            } 
          />

          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;