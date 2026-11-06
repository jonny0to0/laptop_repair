'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export default function BusinessHoursBadge() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  useEffect(() => {
    // Check current local time (Mon-Sat 9 AM - 7 PM, Sun closed)
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday
    const hour = now.getHours();

    if (day === 0) {
      setIsOpen(false);
    } else if (day === 6) {
      // Saturday 9 to 18
      setIsOpen(hour >= 9 && hour < 18);
    } else {
      // Mon - Fri 9 to 19
      setIsOpen(hour >= 9 && hour < 19);
    }
  }, []);

  if (isOpen === null) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
        isOpen
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-amber-50 text-amber-800 border border-amber-200'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
        }`}
      />
      <span>
        {isOpen
          ? 'Open Now (9 AM – 7 PM)'
          : "Closed Now • Book online, we'll confirm at 9 AM"}
      </span>
    </div>
  );
}
