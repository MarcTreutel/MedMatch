'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import ApplicationModal from '@/components/ApplicationModal';
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
  clinic: {
    clinic_name: string;
    department: string;
    user: {
      name: string;
    };
  };
}

interface Application {
  id: string;
  position: Position;
  status: string;
  applied_at: string;
}

export default function StudentDashboard() {
  const { user, isLoading: authLoading } = useUser();
  const { dbUser, isAdmin, loading: userLoading } = useUserContext();
  const router = useRouter();
  const [positions, setPositions] = useState<Position[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !userLoading) {
      // If user is not logged in, redirect to home
      if (!user) {
        router.push('/');
        return;
      }
      
      // If user is not a student or admin, redirect to role selection
      if (dbUser && dbUser.role !== 'student' && dbUser.role !== 'admin') {
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
      setPositions(data);
      return data;
    } catch (error) {
      console.error('Error fetching positions:', error);
      return [];
    }
  };

  const fetchApplications = async () => {
    if (!user?.sub) return [];
    
    try {
      const response = await fetch(`http://localhost:3001/api/applications/student/${user.sub}`);
      const data = await response.json();
      setApplications(data);
      return data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  };

  const handleApplyClick = (position: Position) => {
    setSelectedPosition(position);
    setShowModal(true);
  };

  const handleApplicationSuccess = () => {
    setShowModal(false);
    setMessage('Application submitted successfully!');
    fetchApplications();
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  if (authLoading || userLoading || loading) return <div>Loading...</div>;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filter out positions that the user has already applied to
  const appliedPositionIds = Array.isArray(applications) 
  ? applications.map(app => app.position?.id).filter(Boolean)
  : [];
  const availablePositions = positions.filter(pos => !appliedPositionIds.includes(pos.id));

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Student Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user.name}! Find your perfect internship below.
            </p>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
              {message}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl text-blue-600 mr-3">📋</div>
                <div>
                  <p className="text-sm text-gray-600">Available Positions</p>
                  <p className="text-2xl font-semibold text-gray-900">{availablePositions.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl text-yellow-600 mr-3">⏳</div>
                <div>
                  <p className="text-sm text-gray-600">Applications Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {applications.filter(app => app.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl text-green-600 mr-3">✅</div>
                <div>
                  <p className="text-sm text-gray-600">Applications Accepted</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {applications.filter(app => app.status === 'accepted').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl text-purple-600 mr-3">🎯</div>
                <div>
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <p className="text-2xl font-semibold text-gray-900">{applications.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Available Positions */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Available Internship Positions
                  </h2>
                </div>
                <div className="p-6">
                  {availablePositions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-500">No available positions at the moment</div>
                    </div>
                  ) : (
                    availablePositions.map((position) => (
                      <div key={position.id} className="border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {position.title}
                            </h3>
                            <p className="text-blue-600 font-medium mb-2">
                              {position.clinic?.clinic_name || 'Clinic Name'}
                            </p>
                            <p className="text-gray-600 text-sm mb-3">
                              {position.description}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <span>📅 {formatDate(position.start_date)}</span>
                              <span>⏱️ {position.duration_months} months</span>
                              <span>🏥 {position.specialty}</span>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              Apply by: {formatDate(position.application_deadline)}
                            </div>
                            {position.requirements && (
                              <div className="mt-2 text-xs text-gray-600">
                                Requirements: {position.requirements}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleApplyClick(position)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ml-4 shrink-0"
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>
                    ))
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
                  <button 
                    onClick={() => router.push('/student/profile')}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Complete Profile
                  </button>
                  <button
                    onClick={() => router.push('/student/applications')}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    View My Applications
                  </button>
                </div>
              </div>

              {/* Recent Applications */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Your Recent Applications
                </h3>
                {applications.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No applications yet</p>
                    <p className="text-sm text-gray-400 mt-1">Apply to positions to see them here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.slice(0, 3).map((application) => (
                      <div key={application.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                        <p className="font-medium text-gray-900">{application.position.title}</p>
                        <p className="text-sm text-gray-600">{application.position.clinic.clinic_name}</p>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-gray-500">
                            Applied: {new Date(application.applied_at).toLocaleDateString()}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {applications.length > 3 && (
                      <button
                        onClick={() => router.push('/student/applications')}
                        className="w-full text-sm text-blue-600 hover:text-blue-800 mt-2"
                      >
                        View all {applications.length} applications
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {showModal && selectedPosition && (
        <ApplicationModal
          position={selectedPosition}
          onClose={() => setShowModal(false)}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </>
  );
}
