'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

export function TagListInput({
  label,
  values,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [input, setInput] = useState('');

  const add = () => {
    if (input.trim()) {
      onChange([...values, input.trim()]);
      setInput('');
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <div className="flex gap-2">
        <Input
          value={input}
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={add}>
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((v, i) => (
          <Badge
            key={`${v}-${i}`}
            variant="secondary"
            className="cursor-pointer transition-transform duration-150 [@media(hover:hover)]:hover:scale-105 active:scale-95"
            onClick={() => onChange(values.filter((_, idx) => idx !== i))}
          >
            {v} ×
          </Badge>
        ))}
      </div>
    </div>
  );
}
