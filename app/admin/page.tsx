'use client'

import { useState } from 'react'
import { RefreshCw, Database, Wrench } from 'lucide-react'

export default function AdminPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runSchemaFix = async () => {
    setLoading(true)
    setResults(null)

    try {
      const response = await fetch('/api/admin/fix-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await response.json()
      setResults(result)
    } catch (error) {
      setResults({
        error: 'Failed to run schema fix',
        details: error
      })
    } finally {
      setLoading(false)
    }
  }

  const runMigration = async () => {
    setLoading(true)
    setResults(null)

    try {
      const response = await fetch('/api/admin/migrate-senders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await response.json()
      setResults(result)
    } catch (error) {
      setResults({
        error: 'Failed to run migration',
        details: error
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Admin Tools</h1>
      
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Database Schema Fix</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This tool fixes the database schema to ensure all senders have the instanceId field properly set.
            Run this if you're having issues with instanceId not saving.
          </p>
          <button
            onClick={runSchemaFix}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            <Database size={20} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Running Schema Fix...' : 'Run Schema Fix'}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Migrate Senders</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This tool automatically detects and sets instanceId for senders that are missing it.
          </p>
          <button
            onClick={runMigration}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Running Migration...' : 'Run Migration'}
          </button>
        </div>

        {results && (
          <div className={`border rounded-lg p-6 ${
            results.error 
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
              : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
          }`}>
            <h3 className={`font-semibold mb-4 ${
              results.error 
                ? 'text-red-800 dark:text-red-200'
                : 'text-green-800 dark:text-green-200'
            }`}>
              Results
            </h3>
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Wrench className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Troubleshooting Steps</h3>
            <ol className="text-yellow-700 dark:text-yellow-300 text-sm mt-2 space-y-1">
              <li>1. First run the "Schema Fix" to ensure proper database structure</li>
              <li>2. Then run "Migration" to auto-detect missing instance IDs</li>
              <li>3. Go back to Senders page and try editing a sender again</li>
              <li>4. If still not working, check the browser console for errors</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
