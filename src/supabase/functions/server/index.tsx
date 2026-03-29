import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    // Health check endpoint
    if (path.endsWith('/make-server-c614a86f/health')) {
      return new Response(
        JSON.stringify({ status: 'ok' }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        },
      );
    }

    // Save shared record endpoint
    if (path.endsWith('/make-server-c614a86f/share-record') && req.method === 'POST') {
      const body = await req.json();
      const { recordId, recordData, userId, userName } = body;

      if (!recordId || !recordData || !userId) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Save the shared record with a unique ID
      const sharedRecord = {
        ...recordData,
        sharedBy: userName || 'Anonymous',
        sharedAt: new Date().toISOString(),
        isPublic: true,
      };

      await kv.set(`shared_record:${recordId}`, sharedRecord);

      return new Response(
        JSON.stringify({ 
          success: true, 
          shareUrl: `${url.origin}/view/${recordId}` 
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Get shared record endpoint
    if (path.match(/\/make-server-c614a86f\/shared-record\/.+/) && req.method === 'GET') {
      const recordId = path.split('/').pop();

      if (!recordId) {
        return new Response(
          JSON.stringify({ error: 'Record ID required' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      const record = await kv.get(`shared_record:${recordId}`);

      if (!record) {
        return new Response(
          JSON.stringify({ error: 'Record not found' }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      return new Response(
        JSON.stringify({ record }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not Found' }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  } catch (error: any) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});