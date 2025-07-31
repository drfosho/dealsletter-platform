'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [errors, setErrors] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Capture console errors
    const originalError = console.error;
    console.error = (...args) => {
      setErrors(prev => [...prev, args.join(' ')]);
      originalError(...args);
    };

    // Test environment variables
    const envVars = {
      GOOGLE_MAPS_API: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? '✓ Set' : '✗ Missing',
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing',
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing',
    };

    setLogs([
      'Environment Variables:',
      ...Object.entries(envVars).map(([key, value]) => `${key}: ${value}`),
    ]);

    // Test Supabase connection
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setLogs(prev => [...prev, `Supabase session: ${JSON.stringify(data)}`]))
      .catch(err => setErrors(prev => [...prev, `Supabase error: ${err.message}`]));

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">System Status</h2>
        <div className="bg-card border border-border rounded-lg p-4">
          {logs.map((log, i) => (
            <div key={i} className="text-sm font-mono">{log}</div>
          ))}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-destructive">Errors</h2>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            {errors.map((error, i) => (
              <div key={i} className="text-sm font-mono text-destructive mb-2">{error}</div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">CSS Variables</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary text-secondary p-4 rounded">Primary</div>
          <div className="bg-secondary text-primary p-4 rounded border border-border">Secondary</div>
          <div className="bg-accent text-white p-4 rounded">Accent</div>
          <div className="bg-muted text-primary p-4 rounded">Muted</div>
          <div className="bg-card text-primary p-4 rounded border border-border">Card</div>
          <div className="bg-destructive text-white p-4 rounded">Destructive</div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Test Components</h2>
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Test input visibility"
            className="w-full px-4 py-3 text-primary bg-card border border-border rounded-lg placeholder:text-muted"
          />
          <button className="px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90">
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
}