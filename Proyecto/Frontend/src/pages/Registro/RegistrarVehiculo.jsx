import { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; 
import styles from './RegistrarVehiculo.module.css';

const RegistrarVehiculo = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const [vehiculo, setVehiculo] = useState({
    patente: '',
    marca: '',
    modelo: '',
    capacidad: 4
  });

  const handleChange = (e) => {
    setVehiculo({ ...vehiculo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.token) return setMensaje({ texto: "No estás autenticado", tipo: 'error' });
    
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/vehiculos/registrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}` 
        },
        body: JSON.stringify(vehiculo)
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje({ texto: "¡Vehículo guardado en la base de datos!", tipo: 'success' });
        setVehiculo({ patente: '', marca: '', modelo: '', capacidad: 4 });
      } else {
        setMensaje({ texto: data.mensaje || "Error al registrar", tipo: 'error' });
      }
    } catch (error) {
      setMensaje({ texto: "Error de conexión", tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <h2>Registrar mi Vehículo</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>Patente</label>
        <input type="text" name="patente" value={vehiculo.patente} onChange={handleChange} required placeholder="ABCD-12" />
        
        <label>Marca</label>
        <input type="text" name="marca" value={vehiculo.marca} onChange={handleChange} required placeholder="Ej: Toyota" />

        <label>Modelo</label>
        <input type="text" name="modelo" value={vehiculo.modelo} onChange={handleChange} required placeholder="Ej: Hiace" />

        <label>Capacidad</label>
        <input type="number" name="capacidad" value={vehiculo.capacidad} onChange={handleChange} required />

        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? 'Guardando...' : 'Guardar Vehículo'}
        </button>
      </form>
      {mensaje.texto && <p className={mensaje.tipo === 'success' ? styles.success : styles.error}>{mensaje.texto}</p>}
    </div>
  );
};

export default RegistrarVehiculo;