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

      // IMPORTANTE: Al registrar, también guardamos la sesión automáticamente
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

  // --- FUNCIÓN DE LOGIN (BLINDADA CONTRA ERRORES TEXTO/JSON) ---
  const login = async (email, password) => {
    try {
      const response = await fetch("https://tourmatch-dw83.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      // 🌟 SOLUCIÓN AL CRASH: Primero verificamos si la respuesta del servidor falló (Status 401, 400, etc.)
      if (!response.ok) {
        let mensajeError = "Credenciales incorrectas";
        try {
          // Leemos la respuesta como texto plano de forma segura para capturar el mensaje de Java
          const textoPlano = await response.text();
          if (textoPlano) {
            mensajeError = textoPlano;
          }
        } catch (e) {
          // Si no se puede leer, mantiene el mensaje por defecto
        }
        
        // Retornamos success false junto al mensaje de error y el status HTTP
        return { 
          success: false, 
          message: mensajeError, 
          status: response.status 
        };
      }

      // 🌟 Si llegó aquí es porque la respuesta fue exitosa (200 OK), procesamos el JSON con total seguridad
      const data = await response.json();

      // Capturamos los 4 campos que configuramos en el AuthService.java
      const userData = {
        email: email, // El email que usó para entrar
        token: data.token,
        nombre: data.nombre,
        rol: data.rol // "CONDUCTOR" o "TURISTA" (viene del Enum de Java)
      };

      // Guardamos en el estado global y en el almacenamiento local
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Retornamos éxito y el rol para que el componente Login navegue
      return { success: true, rol: data.rol };
    } catch (error) {
      console.error("Error en login:", error);
      return { success: false, message: error.message };
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