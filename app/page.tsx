'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Printer } from 'phosphor-react';

export default function Home() {
  const tools = [
    {
      id: 'receipt-bulk-print',
      title: 'Cetak Nota Massal',
      description: 'Cetak nota/faktur dalam jumlah banyak - 100% client-side',
      href: '/receipt-bulk-print',
      icon: Printer,
    },
    {
      id: 'debt-list',
      title: 'Daftar Hutang',
      description: 'Kelola dan lacak hutang dengan fitur lengkap',
      href: '/debt-list',
      icon: Printer,
    },
    // More tools can be added here in the future
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Selamat Datang di Widjaya Tools
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Kumpulan alat bermanfaat untuk kebutuhan sehari-hari Anda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" weight="bold" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tool.title}
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {tool.description}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
          <p>Alat lainnya akan segera hadir...</p>
        </div>
      </div>
    </div>
  );
}
