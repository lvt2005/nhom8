import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import socket from '../utils/socket';
import styles from '../styles/Lobby.module.css';

export default function Lobby() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, searching

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));

    if (!socket.connected) {
      socket.connect();
    }

    socket.on('matched', (data) => {
      console.log('Matched!', data);
      router.push(`/game?roomId=${data.roomId}`);
    });

    return () => {
      socket.off('matched');
    };
  }, [router]);

  const findMatch = () => {
    if (!user) return;
    setStatus('searching');
    socket.emit('join_queue', { userId: user.id, username: user.username });
  };

  if (!user) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>👋 Welcome, {user.username}!</h1>
        <p className={styles.subtitle}>Ready to play Rock Paper Scissors?</p>
        
        {status === 'idle' ? (
          <button 
            onClick={findMatch}
            className={styles.button}
          >
            <span>🎯</span>
            <span>Find Match</span>
          </button>
        ) : (
          <div className={styles.searching}>
            <div className={styles.spinner}></div>
            <p className={styles.searchingText}>🔍 Searching for opponent...</p>
          </div>
        )}
      </div>
    </div>
  );
}
