import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      setShowBanner(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowBanner(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  // Don't show if already installed
  if (isInstalled) return null;

  // Mobile: show banner at bottom
  // Desktop: show button in header
  return (
    <>
      {/* Mobile bottom banner */}
      {showBanner && !isInstalled && (
        <div className="fixed bottom-16 left-4 right-4 bg-white rounded-2xl shadow-xl border border-border p-4 z-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 192 192">
                <rect width="192" height="192" rx="32" fill="#B07D4F"/>
                <path d="M96 32L32 88h18v64h32v-32h28v32h32V88h18L96 32z" fill="#fff"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm text-text">Install App</p>
              <p className="text-muted text-xs">Quick-Broker — Find housing</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBanner(false)}
              className="px-3 py-2 text-muted text-sm"
            >
              ✕
            </button>
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold"
            >
              Install
            </button>
          </div>
        </div>
      )}

      {/* Floating install button (when banner dismissed) */}
      {!showBanner && isInstallable && !isInstalled && (
        <button
          onClick={handleInstall}
          className="fixed bottom-20 right-4 bg-primary text-white rounded-full px-4 py-2 shadow-lg text-sm font-semibold z-40 flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0l2.5 5.5L16 6l-4 4 1 5.5L8 12.5 3 15.5 4 10 0 6l5.5-.5L8 0z"/>
          </svg>
          Install
        </button>
      )}
    </>
  );
}
