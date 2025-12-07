import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Auth.css';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    // Chỉ cho phép số
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Chỉ lấy ký tự đầu tiên nếu có nhiều ký tự
    const singleDigit = numericValue.slice(0, 1);
    
    const newOtp = [...otp];
    newOtp[index] = singleDigit;
    setOtp(newOtp);
    setError('');

    // Auto focus next input nếu đã nhập số
    if (singleDigit && index < 5) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (index, e) => {
    // Xử lý Backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Nếu ô hiện tại trống, focus về ô trước và xóa giá trị ở đó
        e.preventDefault();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
      // Nếu ô hiện tại có giá trị, để browser xử lý xóa tự nhiên
    }
    
    // Xử lý Delete
    if (e.key === 'Delete') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
    }
    
    // Xử lý Arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
    
    // Chặn các ký tự không phải số (trừ các phím điều hướng và điều khiển)
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
    if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    
    if (pastedData.length >= 6) {
      // Nếu paste đủ 6 số, điền vào tất cả các ô
      const newOtp = pastedData.slice(0, 6).split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    } else if (pastedData.length > 0) {
      // Nếu paste ít hơn 6 số, điền từ ô hiện tại
      const startIndex = parseInt(e.target.dataset.index) || 0;
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length && (startIndex + i) < 6; i++) {
        newOtp[startIndex + i] = pastedData[i];
      }
      setOtp(newOtp);
      const nextIndex = Math.min(startIndex + pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const validate = () => {
    if (otp.some(digit => !digit)) {
      setError('Vui lòng nhập đầy đủ 6 số OTP');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const otpCode = otp.join('');
      console.log('OTP entered:', otpCode);
      // Verify OTP logic here
      navigate('/reset-password', { state: { email, otp: otpCode } });
    }
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
    console.log('Resending OTP to:', email);
    // Resend OTP logic here
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Xác Thực OTP</h1>
          <p>Nhập mã OTP đã được gửi đến email của bạn</p>
          {email && <p className="email-hint">{email}</p>}
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="otp-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => {
                  if (el) inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                data-index={index}
                className={`otp-input ${error ? 'error' : ''}`}
                autoFocus={index === 0}
                autoComplete="off"
              />
            ))}
          </div>
          {error && <span className="error-message otp-error">{error}</span>}

          <div className="otp-timer">
            {!canResend ? (
              <p>Gửi lại mã sau: <span className="timer">{timer}s</span></p>
            ) : (
              <button type="button" onClick={handleResend} className="resend-button">
                Gửi lại mã OTP
              </button>
            )}
          </div>

          <button type="submit" className="auth-button">
            Xác Thực
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <Link to="/forgot-password" className="auth-link">
              Quay lại
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;

