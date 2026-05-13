import { createContext, useState, useContext, useEffect } from 'react';

// 1. Creamos el contexto
const AuthContext = createContext();

// 2. Proveedor del contexto (El componente que envolverá a toda la app)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Aquí guardaremos los datos del usuario
  const [loading, setLoading] = useState(true); // Para saber si estamos verificando la sesión

  // Al cargar la app, revisamos si hay una sesión guardada en el navegador
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Función para iniciar sesión
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Guardamos en el navegador
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    alert("Sesión cerrada correctamente");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  return useContext(AuthContext);
};