import Link from 'next/link'
import { MessageSquare, Users, List, Send, Settings, Download } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Bulk Messaging Tool
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Send bulk WhatsApp messages with WaAPI integration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/senders"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg dark:hover:shadow-gray-700/20 transition-all"
          >
            <div className="text-blue-500 mb-4">
              <Settings size={48} />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Senders</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your WaAPI tokens and sender accounts
            </p>
          </Link>

          <Link
            href="/lists"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg dark:hover:shadow-gray-700/20 transition-all"
          >
            <div className="text-green-500 mb-4">
              <List size={48} />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Lists</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage contact groups
            </p>
          </Link>

          <Link
            href="/contacts"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg dark:hover:shadow-gray-700/20 transition-all"
          >
            <div className="text-purple-500 mb-4">
              <Users size={48} />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Contacts</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Add contacts and upload CSV files
            </p>
          </Link>

          <Link
            href="/campaigns"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg dark:hover:shadow-gray-700/20 transition-all"
          >
            <div className="text-red-500 mb-4">
              <Send size={48} />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Campaigns</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Create and send bulk messages
            </p>
          </Link>
        </div>

        <div className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Getting Started
          </h3>
          <ol className="text-yellow-700 dark:text-yellow-300 space-y-2">
            <li>1. Add a sender with your WaAPI token</li>
            <li>2. Create a contact list</li>
            <li>3. Add contacts or upload CSV file</li>
            <li>4. Create and send your campaign</li>
          </ol>
        </div>

        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Bulk Upload Contacts
              </h3>
              <p className="text-blue-700 dark:text-blue-300">
                Download our CSV template to bulk upload contacts with the correct format.
              </p>
            </div>
            <a
              href="/api/contacts/example"
              download="contacts-example.csv"
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Download size={20} />
              Download CSV Template
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
