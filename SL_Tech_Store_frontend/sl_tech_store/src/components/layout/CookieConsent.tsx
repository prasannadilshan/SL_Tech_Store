import { useState, useEffect } from 'react';
import { getCookie, setCookie } from '../../utils/cookies';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if the user has already answered the cookie prompt
    const consent = getCookie('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    setCookie('cookie_consent', 'accepted', 365); // Save for 1 year
    setShowBanner(false);
  };

  const handleDecline = () => {
    setCookie('cookie_consent', 'declined', 365); // Save for 1 year
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: 24,
      right: 24,
      background: 'white',
      padding: '20px 24px',
      borderRadius: 12,
      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      zIndex: 9999,
      maxWidth: 600,
      margin: '0 auto',
      border: '1px solid var(--gray-200)'
    }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontSize: 18, color: 'var(--gray-900)' }}>🍪 We value your privacy</h4>
        <p style={{ margin: 0, color: 'var(--gray-600)', fontSize: 14, lineHeight: 1.5 }}>
          We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button className="btn btn-outline btn-sm" onClick={handleDecline}>Decline</button>
        <button className="btn btn-primary btn-sm" onClick={handleAccept}>Accept All</button>
      </div>
    </div>
  );
}
