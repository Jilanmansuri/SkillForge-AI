import { useEffect, useState } from 'react';
import { cn } from '../components/SkillPill';

export default function BackendStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  
  // Prefer relative `/api` so Vite can proxy to the backend during local development.
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').trim();

  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
        if (res.ok) {
          if (isMounted) setStatus('connected');
        } else {
          if (isMounted) setStatus('disconnected');
        }
      } catch (e) {
        if (isMounted) setStatus('disconnected');
      }
    };

    checkHealth();
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [API_BASE]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111] border border-[#222] text-xs font-semibold shadow-lg">
      <div className={cn(
        "w-2.5 h-2.5 rounded-full",
        status === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
        status === 'disconnected' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
        'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)] animate-pulse'
      )} />
      <span className={cn(
        "text-gray-300",
        status === 'connected' ? 'text-emerald-400' : 
        status === 'disconnected' ? 'text-red-400' : 
        'text-yellow-400'
      )}>
        {status === 'connected' ? 'System Online' : 
         status === 'disconnected' ? 'Server Offline' : 
         'Connecting...'}
      </span>
    </div>
  );
}
