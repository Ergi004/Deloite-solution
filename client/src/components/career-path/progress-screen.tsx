'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const MESSAGES = [
  'Analysing your profile…',
  'Matching roles at your company…',
  'Building your roadmap…',
  'Checking the plan…',
];

export function ProgressScreen() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-lg font-medium">{MESSAGES[index]}</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        This usually takes less than a minute.
      </p>
    </div>
  );
}
