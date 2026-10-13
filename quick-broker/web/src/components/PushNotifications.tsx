import { useState, useEffect } from 'react';

export default function PushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return;

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      // Register push subscription
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'BEl62iUYgUivxIkv69yViEuiBIq1aK1s1Y2V0Q6oV5oU' // VAPID public key placeholder
      });

      // Send subscription to backend
      try {
        const token = localStorage.getItem('token');
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ subscription })
        });
      } catch (error) {
        console.error('Failed to save push subscription:', error);
      }

      // Show confirmation
      new Notification('Quick-Broker', {
        body: 'Push notifications enabled!',
        icon: '/icon-192.svg'
      });
    }
  };

  if (!isSupported) return null;
  if (permission === 'granted') return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-white rounded-2xl shadow-xl border border-border p-4 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 192 192">
            <rect width="192" height="192" rx="32" fill="#B07D4F"/>
            <path d="M96 32L32 88h18v64h32v-32h28v32h32V88h18L96 32z" fill="#fff"/>
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm text-text">Enable Notifications</p>
          <p className="text-muted text-xs">Get alerts for inspection requests</p>
        </div>
        <button
          onClick={requestPermission}
          className="px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold"
        >
          Enable
        </button>
      </div>
    </div>
  );
}
