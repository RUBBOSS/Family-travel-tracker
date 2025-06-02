'use client';

import { useEffect, useState } from 'react';
import { ensureMinimalSchema, checkExistingTables } from '@/db/schema-unified';

export function SchemaInitializer() {
  const [schemaStatus, setSchemaStatus] = useState<{
    checked: boolean;
    success?: boolean;
    recommendations?: string[];
  }>({ checked: false });

  useEffect(() => {
    // Check and initialize schema when app loads
    const initializeSchema = async () => {
      try {
        // First check all tables
        const checkResult = await checkExistingTables();
        
        // Then ensure the minimal schema is in place
        const result = await ensureMinimalSchema();
        console.log('Schema initialization result:', result);
        
        setSchemaStatus({
          checked: true,
          success: result.success,
          recommendations: checkResult.recommendations || []
        });
      } catch (error) {
        console.error('Failed to initialize schema:', error);
        setSchemaStatus({
          checked: true,
          success: false,
          recommendations: ['Failed to initialize schema. Please check console for errors.']
        });
      }
    };

    initializeSchema();
  }, []);

  return null; // This component doesn't render anything
}
