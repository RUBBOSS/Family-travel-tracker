import React, { useState, useEffect } from 'react';
import { checkExistingTables } from '@/db/schema-unified';
import { ApplySchema } from './ApplySchema';
import { ExecSqlCheck } from './ExecSqlCheck';
import { useUserContext } from '@/context/UserContext';

export function SchemaSetupGuide() {
  const [showInstructions, setShowInstructions] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);
  const { currentUser, isLoading } = useUserContext();
  
  useEffect(() => {
    const checkSchema = async () => {
      // Only check schema if user is authenticated
      if (isLoading || !currentUser) {
        return;
      }
      
      try {
        const results = await checkExistingTables();
        
        // If authentication is required, don't show instructions
        if (results.authRequired) {
          setShowInstructions(false);
          return;
        }
        
        setCheckResult(results);
        
        // Show instructions if any required tables are missing
        const requiredTables = ['user_profiles', 'countries', 'visited_countries'];
        const missingTables = requiredTables.filter(
          table => !results.tables[table]?.exists
        );
        
        if (missingTables.length > 0) {
          setShowInstructions(true);
        }
      } catch (error) {
        console.error('Error checking schema:', error);
        setShowInstructions(true);
      }
    };
      checkSchema();
  }, [currentUser, isLoading]);

  if (!showInstructions) {
    return null;
  }
  return (
    <div className="bg-slate-700 border-l-4 border-yellow-500 p-4 mt-8 rounded-r-lg">
      <div className="flex">
        <div>
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-300">
            Database Schema Setup Required
          </h3>
          <div className="mt-2 text-sm text-slate-300">
            <p>
              Your database schema needs to be set up properly for this application to work. 
              Please follow these steps:
            </p>
            <ol className="list-decimal mt-2 ml-4 space-y-1">
              <li>Option 1: Click the &quot;Setup Database Schema&quot; button below to automatically set up your database</li>
              <li>Option 2: Go to your <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Supabase Dashboard</a> and run the SQL manually</li>
            </ol>
            <div className="mt-4 bg-slate-800/60 p-4 rounded">
              <h4 className="text-sm font-medium text-blue-300">Automatic Setup</h4>
              <p className="text-xs text-slate-300 mb-2">This will attempt to set up the database schema automatically:</p>
              <ExecSqlCheck />
              <ApplySchema />
            </div>
            
            <div className="mt-4 bg-slate-800/60 p-4 rounded">
              <h4 className="text-sm font-medium text-blue-300">Manual Setup</h4>
              <p className="text-xs text-slate-300 mb-2">
                If automatic setup doesn&apos;t work, follow the instructions in <code className="bg-slate-800 px-1 rounded">SCHEMA_SETUP.md</code> 
                to set up your database manually.
              </p>
            </div>
            
            {checkResult && (
              <div className="mt-4 text-xs bg-slate-800 p-2 rounded overflow-auto max-h-60">
                <p className="font-bold text-yellow-300">Diagnostic Information:</p>
                <pre className="text-slate-300 whitespace-pre-wrap">
                  {JSON.stringify(checkResult, null, 2)}
                </pre>
              </div>
            )}
            <div className="mt-4">
              <button 
                onClick={() => setShowInstructions(false)} 
                className="text-sm bg-slate-600 hover:bg-slate-500 text-white px-3 py-1 rounded transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
