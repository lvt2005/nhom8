import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from '../styles/Login.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Use backend server for auth endpoints
    const endpoint = isRegister ? 'http://localhost:5000/auth/register' : 'http://localhost:5000/auth/login';

    try {
      const res = await axios.post(endpoint, { username, password });
      if (isRegister) {
        alert('Registration successful! Please login.');
        setIsRegister(false);
        setPassword('');
      } else {
        localStorage.setItem('token', res.data.accessToken);
        localStorage.setItem('user', JSON.stringify({ id: res.data.id, username: res.data.username }));
        router.push('/');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>{isRegister ? '🎮 Register' : '🎮 Login'}</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className={styles.input}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className={styles.input}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className={styles.button}>
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        <p className={styles.footer}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <span 
            onClick={() => setIsRegister(!isRegister)} 
            className={styles.link}
          >
            {isRegister ? 'Sign In' : 'Create Account'}
          </span>
        </p>
      </div>
    </div>
  );
}
