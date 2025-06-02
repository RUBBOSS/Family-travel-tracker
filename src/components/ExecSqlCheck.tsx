'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

export function ExecSqlCheck() {
  const [exists, setExists] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  
  useEffect(() => {
    const checkFunction = async () => {
      try {
        // Try to call the exec_sql function with a simple query
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql: `SELECT 1 as test` 
        });
        
        if (error) {
          console.error('Error checking exec_sql function:', error);
          setExists(false);
        } else {
          setExists(true);
        }
      } catch (err) {
        console.error('Exception checking exec_sql function:', err);
        setExists(false);
      } finally {
        setChecking(false);
      }
    };
    
    checkFunction();
  }, []);
  
  if (checking) {
    return <p className="text-sm text-slate-400">Checking SQL execution capabilities...</p>;
  }
  
  if (exists === true) {
    return <p className="text-sm text-green-400">✓ SQL execution function is available</p>;
  }
  
  return (
    <div className="mt-2 p-3 bg-yellow-900/30 border border-yellow-800 rounded-md">
      <h4 className="text-sm font-medium text-yellow-300 mb-2">SQL Function Setup Required</h4>
      <p className="text-xs text-slate-300 mb-2">
        The automatic schema setup requires an SQL function to be created in your Supabase project.
      </p>
      <ol className="text-xs list-decimal ml-4 space-y-1 text-slate-300">
        <li>Go to your <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Supabase Dashboard</a></li>
        <li>Select your project</li>
        <li>Go to SQL Editor</li>
        <li>Copy and paste this SQL:</li>
      </ol>
      <pre className="mt-2 text-xs bg-slate-800 p-2 rounded overflow-auto text-slate-300">
{`-- Create an RPC function that can execute SQL (service role only)
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- This runs with the privileges of the function creator
AS $$
BEGIN
  EXECUTE sql;
  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;

-- Set RLS policy for the function (service role only)
REVOKE ALL ON FUNCTION exec_sql(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;`}
      </pre>
      <p className="mt-2 text-xs text-slate-300">
        After creating the function, refresh this page to try automatic setup again.
      </p>
    </div>
  );
}
