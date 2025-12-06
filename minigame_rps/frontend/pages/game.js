import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import socket from '../utils/socket';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandRock, faHandPaper, faHandScissors } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/Game.module.css';

export default function Game() {
  const router = useRouter();
  const { roomId } = router.query;
  const [user, setUser] = useState(null);
  const [result, setResult] = useState(null);
  const [myChoice, setMyChoice] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));

    if (!socket.connected) {
      socket.connect();
    }

    socket.on('round_result', (data) => {
      console.log('Round result:', data);
      setResult(data);
      if (data.player1.id === JSON.parse(userData).id) {
        setOpponentChoice(data.player2.choice);
      } else {
        setOpponentChoice(data.player1.choice);
      }
    });

    return () => {
      socket.off('round_result');
    };
  }, [router]);

  const makeChoice = (choice) => {
    if (!user || !roomId) return;
    setMyChoice(choice);
    setResult(null);
    setOpponentChoice(null);
    socket.emit('player_choice', { roomId, choice, userId: user.id });
  };

  const resetGame = () => {
    setMyChoice(null);
    setResult(null);
    setOpponentChoice(null);
  }

  const getResultClass = () => {
    if (!result) return '';
    if (result.result === 'draw') return styles.draw;
    return result.winnerId === user.id ? styles.win : styles.lose;
  };

  const getResultText = () => {
    if (!result) return '';
    if (result.result === 'draw') return '🤝 Draw!';
    return result.winnerId === user.id ? '🎉 You Win!' : '😢 You Lose!';
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.roomTitle}>🎮 Game Room #{roomId}</h1>
      </div>
      
      <div className={styles.gameCard}>
        <div className={styles.choicesContainer}>
          <button 
            onClick={() => makeChoice('rock')} 
            disabled={!!myChoice} 
            className={styles.choiceButton}
          >
            <FontAwesomeIcon icon={faHandRock} className={styles.icon} />
            <span>Rock</span>
          </button>
          <button 
            onClick={() => makeChoice('paper')} 
            disabled={!!myChoice} 
            className={styles.choiceButton}
          >
            <FontAwesomeIcon icon={faHandPaper} className={styles.icon} />
            <span>Paper</span>
          </button>
          <button 
            onClick={() => makeChoice('scissors')} 
            disabled={!!myChoice} 
            className={styles.choiceButton}
          >
            <FontAwesomeIcon icon={faHandScissors} className={styles.icon} />
            <span>Scissors</span>
          </button>
        </div>

        <div className={styles.statusSection}>
          {myChoice && <p className={styles.myChoice}>✨ You chose: <strong>{myChoice.toUpperCase()}</strong></p>}
          {result ? (
            <div className={styles.resultContainer}>
              <h2 className={`${styles.resultTitle} ${getResultClass()}`}>
                {getResultText()}
              </h2>
              <p className={styles.resultDetails}>Opponent chose: <strong>{opponentChoice?.toUpperCase()}</strong></p>
              <button onClick={resetGame} className={styles.playAgainButton}>
                🔄 Play Again
              </button>
            </div>
          ) : (
            myChoice && <p className={styles.waiting}>⏳ Waiting for opponent...</p>
          )}
        </div>
      </div>
    </div>
  );
}
