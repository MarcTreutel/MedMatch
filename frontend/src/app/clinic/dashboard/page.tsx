'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useUserContext } from '@/context/UserContext';

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

interface Application {
  id: string;
  position_id: string;
  status: string;
  applied_at: string;
  student: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
}

export default function ClinicDashboard() {
  const { user, isLoading: authLoading } = useUser();
  const { dbUser, isAdmin, loading: userLoading } = useUserContext();
  const router = useRouter();
  const [positions, setPositions] = useState<Position[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !userLoading) {
      // If user is not logged in, redirect to home
      if (!user) {
        router.push('/');
        return;
      }
      
      // If user is not a clinic or admin, redirect to role selection
      if (dbUser && dbUser.role !== 'clinic' && dbUser.role !== 'admin') {
        router.push('/select-role');
        return;
      }
      
      Promise.all([
        fetchPositions(),
        fetchApplications()
      ]).then(() => {
        setLoading(false);
      });
    }
  }, [user, dbUser, authLoading, userLoading]);

  const fetchPositions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/positions');
      const data = await response.json();
      setPositions(Array.isArray(data) ? data : []);
      return data;
    } catch (error) {
      console.error('Error fetching positions:', error);
      setPositions([]);
      return [];
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/applications');
      const data = await response.json();
      console.log('Applications data:', data);
      setApplications(Array.isArray(data) ? data : []);
      return data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
      return [];
    }
  };

  // Count applications for each position
  const getApplicationCount = (positionId: string) => {
    if (!Array.isArray(applications)) return 0;
    return applications.filter(app => app.position_id === positionId).length;
  };

  // Count applications by status
  const getApplicationCountByStatus = (status: string) => {
    if (!Array.isArray(applications)) return 0;
    return applications.filter(app => app.status === status).length;
  };

  if (authLoading || userLoading) return <div>Loading...</div>;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get recent applications (last 3)
  const recentApplications = Array.isArray(applications) 
    ? [...applications]
      .sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime())
      .slice(0, 3)
    : [];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Clinic Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back! Manage your internship positions and applications.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl text-green-600 mr-3">📋</div>
                <div>
                  <p className="text-sm text-gray-600">Active Positions</p>
                  <p className="text-2xl font-semibold text-gray-900">{positions.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl text-blue-600 mr-3">👥</div>
                <div>
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <p className="text-2xl font-semibold text-gray-900">{Array.isArray(applications) ? applications.length : 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl text-yellow-600 mr-3">⏳</div>
                <div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <p className="text-2xl font-semibold text-gray-900">{getApplicationCountByStatus('pending')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl text-purple-600 mr-3">🎯</div>
                <div>
                  <p className="text-sm text-gray-600">Accepted Applications</p>
                  <p className="text-2xl font-semibold text-gray-900">{getApplicationCountByStatus('accepted')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Posted Positions */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Your Posted Positions
                  </h2>
                  <Link href="/clinic/positions/new" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    + Post New Position
                  </Link>
                </div>
                <div className="p-6">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="text-gray-500">Loading positions...</div>
                    </div>
                  ) : positions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-500">No positions posted yet</div>
                      <Link href="/clinic/positions/new" className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block">
                        Post Your First Position
                      </Link>
                    </div>
                  ) : (
                    positions.map((position) => {
                      const appCount = getApplicationCount(position.id);
                      return (
                        <div key={position.id} className="border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {position.title}
                              </h3>
                              <p className="text-blue-600 font-medium mb-2">
                                {position.specialty}
                              </p>
                              <p className="text-gray-600 text-sm mb-3">
                                {position.description.substring(0, 120)}...
                              </p>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <span>📅 {formatDate(position.start_date)}</span>
                                <span>⏱️ {position.duration_months} months</span>
                                <span>📝 Apply by: {formatDate(position.application_deadline)}</span>
                              </div>
                              <div className="mt-2 flex items-center">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  position.status === 'active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {position.status.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <Link href={`/clinic/positions/${position.id}/applications`} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                                View Applications ({appCount})
                              </Link>
                              <Link href={`/clinic/positions/${position.id}/edit`} className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors">
                                Edit
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link href="/clinic/positions/new" className="block w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-center">
                    Post New Position
                  </Link>
                  <Link href="/clinic/applications" className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center">
                    View Applications
                  </Link>
                  <Link href="/clinic/profile" className="block w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-center">
                    Update Clinic Profile
                  </Link>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Applications
                </h3>
                {recentApplications.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No recent applications</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentApplications.map((app) => (
                      <div key={app.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {app.student?.user?.name || 'Student'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(app.applied_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {Array.isArray(applications) && applications.length > 3 && (
                      <Link href="/clinic/applications" className="block text-center text-sm text-blue-600 hover:text-blue-800">
                        View all {applications.length} applications
                      </Link>
                    )}
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
