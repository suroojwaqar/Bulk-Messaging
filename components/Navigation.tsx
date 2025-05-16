'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  MessageSquare, 
  Users, 
  List, 
  Send, 
  Settings,
  Home,
  Shield,
  BarChart3
} from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Senders', href: '/senders', icon: Settings },
  { name: 'Lists', href: '/lists', icon: List },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Campaigns', href: '/campaigns', icon: Send },
  { name: 'Admin', href: '/admin', icon: Shield },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                Bulk Messaging
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? 'border-blue-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}
