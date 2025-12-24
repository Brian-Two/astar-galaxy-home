import { useState, useEffect } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface UsernameStepProps {
  value: string;
  onChange: (value: string) => void;
  onValidChange: (isValid: boolean) => void;
}

export function UsernameStep({ value, onChange, onValidChange }: UsernameStepProps) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setStatus('idle');
      setError(null);
      onValidChange(false);
      return;
    }

    // Validate format
    const trimmed = value.trim().toLowerCase();
    if (trimmed.length < 3) {
      setStatus('invalid');
      setError('Username must be at least 3 characters');
      onValidChange(false);
      return;
    }
    if (trimmed.length > 20) {
      setStatus('invalid');
      setError('Username must be 20 characters or less');
      onValidChange(false);
      return;
    }
    if (!/^[a-z0-9_]+$/.test(trimmed)) {
      setStatus('invalid');
      setError('Only letters, numbers, and underscores allowed');
      onValidChange(false);
      return;
    }

    // Check availability
    const checkAvailability = async () => {
      setStatus('checking');
      setError(null);
      
      const { data, error } = await supabase
        .rpc('check_username_available', { username_to_check: trimmed });
      
      if (error) {
        setStatus('invalid');
        setError('Error checking username');
        onValidChange(false);
        return;
      }
      
      if (data) {
        setStatus('available');
        setError(null);
        onValidChange(true);
      } else {
        setStatus('taken');
        setError('This username is already taken');
        onValidChange(false);
      }
    };

    const timeout = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeout);
  }, [value, onValidChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toLowerCase().replace(/\s/g, '');
    onChange(newValue);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-display font-semibold text-foreground">
          Choose your username
        </h2>
        <p className="text-muted-foreground">
          This is how other explorers will find you
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <Input
            id="username"
            type="text"
            placeholder="astronaut_42"
            value={value}
            onChange={handleChange}
            className={cn(
              "h-12 bg-secondary/50 border-border/50 pr-10",
              status === 'available' && "border-primary/50",
              (status === 'taken' || status === 'invalid') && "border-destructive/50"
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {status === 'checking' && (
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
            )}
            {status === 'available' && (
              <Check className="h-5 w-5 text-primary" />
            )}
            {(status === 'taken' || status === 'invalid') && (
              <X className="h-5 w-5 text-destructive" />
            )}
          </div>
        </div>
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {status === 'available' && (
          <p className="text-sm text-primary">Username is available!</p>
        )}
        
        <p className="text-xs text-muted-foreground">
          3-20 characters. Letters, numbers, and underscores only.
        </p>
      </div>
    </div>
  );
}
