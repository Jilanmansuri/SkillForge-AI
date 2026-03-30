import { useMemo } from 'react';

function decodePayload(raw: string | null) {
  if (!raw) return null;

  try {
    return JSON.parse(atob(raw));
  } catch {
    return null;
  }
}

export default function SharedRoadmapPage() {
  const payload = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return decodePayload(params.get('data'));
  }, []);

  if (!payload) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6">
        <div className="card max-w-md text-center">
          <h1 className="text-2xl font-bold mb-3">Shared roadmap not available</h1>
          <p className="text-gray-400">This link is invalid or incomplete.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6">
      <div className="card max-w-xl w-full text-center space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-400">SkillForge AI</p>
          <h1 className="text-3xl font-bold mt-3">{payload.role}</h1>
          <p className="text-gray-400 mt-2">Personalized roadmap snapshot</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#111] border border-[#222] rounded-xl p-4">
            <div className="text-xs uppercase text-gray-500">Match</div>
            <div className="text-2xl font-bold text-indigo-400 mt-2">{payload.score}%</div>
          </div>
          <div className="bg-[#111] border border-[#222] rounded-xl p-4">
            <div className="text-xs uppercase text-gray-500">Steps</div>
            <div className="text-2xl font-bold mt-2">{payload.steps}</div>
          </div>
          <div className="bg-[#111] border border-[#222] rounded-xl p-4">
            <div className="text-xs uppercase text-gray-500">Weeks</div>
            <div className="text-2xl font-bold mt-2">{payload.weeks}</div>
          </div>
        </div>

        <p className="text-gray-400">
          Open the main app to run your own resume analysis and generate a fresh roadmap.
        </p>
      </div>
    </div>
  );
}
