import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Conversation, ElevenLabsConversationData } from '@/types/models';

interface UseConversationsOptions {
  patientId?: string;
  limit?: number;
  realtime?: boolean;
}

interface UseConversationsReturn {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getConversationSummary: (conversation: Conversation) => {
    summary: string;
    duration: string;
    participantCount: number;
    keyTopics: string[];
  };
}

export function useConversations({ 
  patientId, 
  limit = 10, 
  realtime = false 
}: UseConversationsOptions = {}): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    try {
      setError(null);
      setLoading(true);

      let query = supabase
        .from('conversations')
        .select(`
          id,
          patient_id,
          conversation_data,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Filter by patient if specified
      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setConversations(data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [patientId, limit]);

  // Set up real-time subscription if enabled
  useEffect(() => {
    if (!realtime) return;

    let channel = supabase
      .channel('conversations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          ...(patientId && { filter: `patient_id=eq.${patientId}` })
        },
        (payload) => {
          console.log('Conversation change:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newConversation = payload.new as Conversation;
            setConversations(prev => [newConversation, ...prev.slice(0, limit - 1)]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedConversation = payload.new as Conversation;
            setConversations(prev => 
              prev.map(conv => 
                conv.id === updatedConversation.id ? updatedConversation : conv
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            setConversations(prev => prev.filter(conv => conv.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [realtime, patientId, limit]);

  // Utility function to extract meaningful summary from conversation data
  const getConversationSummary = (conversation: Conversation) => {
    const data = conversation.conversation_data;
    
    // Extract summary
    const summary = data.summary || 
                   data.analysis?.summary || 
                   'No summary available';

    // Calculate duration
    const duration = data.metadata?.call_duration 
      ? `${Math.round(data.metadata.call_duration / 60)} min`
      : 'Unknown duration';

    // Count unique speakers/participants
    const speakers = new Set(data.transcript?.map(segment => segment.speaker) || []);
    const participantCount = speakers.size;

    // Extract key topics
    const keyTopics = data.analysis?.key_topics || 
                     data.analysis?.topics || 
                     [];

    return {
      summary,
      duration,
      participantCount,
      keyTopics: Array.isArray(keyTopics) ? keyTopics : []
    };
  };

  const refresh = async () => {
    await fetchConversations();
  };

  return {
    conversations,
    loading,
    error,
    refresh,
    getConversationSummary
  };
}

// Helper hook for a single conversation
export function useConversation(conversationId: string) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setError(null);
        setLoading(true);

        const { data, error: fetchError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        setConversation(data);
      } catch (err) {
        console.error('Error fetching conversation:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch conversation');
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) {
      fetchConversation();
    }
  }, [conversationId]);

  return { conversation, loading, error };
} 