import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault(); // Evita que la página se recargue
    setLoading(true);

    try {
      // Usamos la función de Supabase para iniciar sesión
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error; // Si hay un error, lo mostramos
      
      // Si el login es exitoso, el 'onAuthStateChange' en App.tsx 
      // se encargará de redirigirnos.
    
    } catch (error: any) {
      alert(`Error al iniciar sesión: ${error.message}`);
    } finally {
      setLoading(false); // Dejamos de cargar
    }
  };

  return (
    <div className="overlay">
      <div className="role-selector" style={{ minWidth: '400px' }}>
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              className="form-group input" // Usamos clases que ya existen
              type="email"
              placeholder="tu@correo.com"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              className="form-group input"
              type="password"
              placeholder="Tu contraseña"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? <span>Cargando...</span> : <span>Iniciar Sesión</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;