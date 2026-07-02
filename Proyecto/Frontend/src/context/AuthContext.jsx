import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app, recuperamos la sesión si existe
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // --- FUNCIÓN DE REGISTRO ---
  const register = async (nombre, email, password, rol) => {
    try {
      const response = await fetch("https://tourmatch-dw83.onrender.com/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password, rol })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.mensaje || "Error al registrar usuario");
      }

      const userData = {
        email: email,
        token: data.token,
        nombre: data.nombre,
        rol: data.rol
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, rol: data.rol };
    } catch (error) {
      console.error("Error en registro:", error);
      return { success: false, message: error.message };
    }
  };

  // --- FUNCIÓN DE LOGIN ---
  const login = async (email, password) => {
    try {
      const response = await fetch("https://tourmatch-dw83.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      // 🌟 Si la respuesta falló (401, 400, etc.)
      if (!response.ok) {
        let mensajeError = "Credenciales incorrectas";
        try {
          const textoPlano = await response.text();
          if (textoPlano && !textoPlano.startsWith("<!DOCTYPE")) { 
            // Evitamos leer HTML de error de Render como texto válido
            mensajeError = textoPlano;
          }
        } catch (e) {
          // Mantiene el error por defecto si falla al leer text()
        }
        
        return { 
          success: false, 
          message: mensajeError, 
          status: response.status 
        };
      }

      // Si todo sale bien (200 OK), procesamos el JSON con total seguridad
      const data = await response.json();

      const userData = {
        email: email,
        token: data.token,
        nombre: data.nombre,
        rol: data.rol
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true, rol: data.rol };
    } catch (error) {
      console.error("Error en login:", error);
      return { success: false, message: "Error de conexión o credenciales incorrectas" };
    }
  };

  // --- FUNCIÓN DE CIERRE DE SESIÓN ---
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
