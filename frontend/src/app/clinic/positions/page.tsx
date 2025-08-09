'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';

interface Position {
  id: string;
  title: string;
  description: string;
  specialty: string;
  duration_months: number;
  start_date: string;
  application_deadline: string;
  requirements: string;
  status: string;
  created_at: string;
}

export default function PositionsManagement() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPositions();
    }
  }, [user]);

  const fetchPositions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/positions');
      if (response.ok) {
        const data = await response.json();
        setPositions(data);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading || loading) return <div>Loading...</div>;
  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Manage Internship Positions
                  </h1>
                  <p className="text-gray-600">
                    Create, edit and track your internship positions
                  </p>
                </div>
                <Link href="/clinic/positions/new" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                  + New Position
                </Link>
              </div>
            </div>

            {/* Positions List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Your Posted Positions
                </h2>
              </div>
              
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Loading positions...</div>
                  </div>
                ) : positions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No Positions Yet</h3>
                    <p className="text-gray-500 mb-6">You haven't posted any internship positions yet.</p>
                    <Link href="/clinic/positions/new" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors">
                      Create Your First Position
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-gray-500 border-b">
                          <th className="pb-3 font-medium">Title</th>
                          <th className="pb-3 font-medium">Specialty</th>
                          <th className="pb-3 font-medium">Duration</th>
                          <th className="pb-3 font-medium">Start Date</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {positions.map((position) => (
                          <tr key={position.id} className="border-b hover:bg-gray-50">
                            <td className="py-4">
                              <div className="font-medium text-gray-900">{position.title}</div>
                              <div className="text-sm text-gray-500">Applications: 0</div>
                            </td>
                            <td className="py-4">{position.specialty}</td>
                            <td className="py-4">{position.duration_months} months</td>
                            <td className="py-4">{formatDate(position.start_date)}</td>
                            <td className="py-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                position.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {position.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-4">
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-800">
                                  View
                                </button>
                                <button className="text-gray-600 hover:text-gray-800">
                                  Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
