'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, CheckCircle, Clock, RefreshCw, Send, Trash2 } from 'lucide-react';

interface WebhookEvent {
  id: string;
  stripe_event_id: string;
  type: string;
  data: any;
  processed: boolean;
  processed_at?: string;
  error?: string;
  created_at: string;
}

export default function WebhookEventsPage() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    loadEvents();
    // Set up polling for real-time updates
    const interval = setInterval(loadEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadEvents = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('webhook_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  };

  const sendTestEvent = async (eventType: string) => {
    setTestLoading(true);
    try {
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: eventType,
          tier: eventType.includes('updated') ? 'pro' : 'starter',
          amount: eventType.includes('payment') ? 2900 : undefined
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(`Test event sent successfully: ${eventType}`);
        // Reload events to see the new test event
        await loadEvents();
      } else {
        alert(`Failed to send test event: ${result.error}`);
      }
    } catch (error) {
      alert(`Error sending test event: ${(error as Error).message}`);
    } finally {
      setTestLoading(false);
    }
  };

  const clearEvents = async () => {
    if (!confirm('Are you sure you want to clear all webhook events? This cannot be undone.')) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from('webhook_events')
      .delete()
      .like('type', 'test.%');

    if (!error) {
      await loadEvents();
      alert('Test events cleared successfully');
    } else {
      alert(`Failed to clear events: ${error.message}`);
    }
  };

  const getEventIcon = (event: WebhookEvent) => {
    if (event.error) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
    if (event.processed) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <Clock className="w-5 h-5 text-yellow-500" />;
  };

  const getEventColor = (type: string) => {
    if (type.includes('failed')) return 'text-red-600';
    if (type.includes('succeeded')) return 'text-green-600';
    if (type.includes('created')) return 'text-blue-600';
    if (type.includes('updated')) return 'text-purple-600';
    if (type.includes('deleted')) return 'text-orange-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted/20 rounded w-1/3 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted/20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Webhook Events Monitor</h1>
        <div className="flex gap-2">
          <button
            onClick={loadEvents}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={clearEvents}
            className="px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Test Events
          </button>
        </div>
      </div>

      {/* Test Event Buttons */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Send Test Events</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => sendTestEvent('subscription.created')}
            disabled={testLoading}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Create Sub
          </button>
          <button
            onClick={() => sendTestEvent('subscription.updated')}
            disabled={testLoading}
            className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Update Sub
          </button>
          <button
            onClick={() => sendTestEvent('payment.succeeded')}
            disabled={testLoading}
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Payment OK
          </button>
          <button
            onClick={() => sendTestEvent('payment.failed')}
            disabled={testLoading}
            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Payment Fail
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Recent Events ({events.length})</h2>
        </div>
        
        <div className="divide-y divide-border">
          {events.length === 0 ? (
            <div className="p-8 text-center text-muted">
              No webhook events found. Send a test event to get started.
            </div>
          ) : (
            events.map(event => (
              <div
                key={event.id}
                className="p-4 hover:bg-muted/5 cursor-pointer transition-colors"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getEventIcon(event)}
                    <div>
                      <p className={`font-medium ${getEventColor(event.type)}`}>
                        {event.type}
                      </p>
                      <p className="text-sm text-muted">
                        ID: {event.stripe_event_id}
                      </p>
                      <p className="text-xs text-muted mt-1">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {event.processed && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Processed
                      </span>
                    )}
                    {event.error && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Error
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-card rounded-xl border border-border max-w-2xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold">Event Details</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-muted hover:text-primary"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-muted">Event Type</label>
                <p className={`font-mono ${getEventColor(selectedEvent.type)}`}>
                  {selectedEvent.type}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted">Event ID</label>
                <p className="font-mono text-sm">{selectedEvent.stripe_event_id}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted">Status</label>
                <p>{selectedEvent.processed ? '✅ Processed' : '⏳ Pending'}</p>
              </div>
              
              {selectedEvent.processed_at && (
                <div>
                  <label className="text-sm font-medium text-muted">Processed At</label>
                  <p>{new Date(selectedEvent.processed_at).toLocaleString()}</p>
                </div>
              )}
              
              {selectedEvent.error && (
                <div>
                  <label className="text-sm font-medium text-muted">Error</label>
                  <p className="text-red-600">{selectedEvent.error}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-muted">Event Data</label>
                <pre className="mt-2 p-4 bg-muted/10 rounded-lg overflow-auto text-xs">
                  {JSON.stringify(selectedEvent.data, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}