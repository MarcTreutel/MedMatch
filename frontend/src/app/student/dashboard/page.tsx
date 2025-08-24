// Fixed Student Dashboard - Handle API errors and missing @CurrentUser

'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import ApplicationModal from '@/components/ApplicationModal';
import ForbiddenPage from '@/components/ForbiddenPage';
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

      // If user has correct role, fetch data
      if (dbUser && (dbUser.role === 'student' || dbUser.role === 'admin')) {
        Promise.all([
          fetchPositions(),
          fetchApplications()
        ]).then(() => {
          setLoading(false);
        });
      } else if (dbUser) {
        // User is logged in but has wrong role - stop loading to show forbidden page
        setLoading(false);
      }
    }
  }, [user, dbUser, authLoading, userLoading]);

  const fetchPositions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/positions');
      const data = await response.json();
      
      // 🔥 FIX: Handle API errors - check if data is an array
      if (Array.isArray(data)) {
        setPositions(data);
        return data;
      } else {
        console.error('Positions API returned non-array:', data);
        setPositions([]);
        return [];
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
      setPositions([]);
      return [];
    }
  };

  const fetchApplications = async () => {
    if (!user?.sub) return [];
    
    try {
      const response = await fetch(`http://localhost:3001/api/applications/my`);
      const data = await response.json();
      
      // 🔥 FIX: Handle API errors - check if data is an array
      if (Array.isArray(data)) {
        setApplications(data);
        return data;
      } else {
        console.error('Applications API returned non-array:', data);
        // Since JWT is disabled, applications endpoint will return empty array anyway
        setApplications([]);
        return [];
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
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

  // Show loading while authentication is happening
  if (authLoading || userLoading) return <div>Loading...</div>;

  // Show forbidden page for users with wrong role
  if (dbUser && dbUser.role !== 'student' && dbUser.role !== 'admin') {
    return <ForbiddenPage requiredRole="Student" currentRole={dbUser.role} />;
  }

  // Show loading while fetching dashboard data (only for authorized users)
  if (loading && dbUser && (dbUser.role === 'student' || dbUser.role === 'admin')) {
    return <div>Loading dashboard...</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 🔥 FIX: Ensure applications is always an array before using .map()
  const appliedPositionIds = Array.isArray(applications) 
    ? applications.map(app => app.position?.id).filter(Boolean)
    : [];

  // 🔥 FIX: Ensure positions is always an array before using .filter()
  const availablePositions = Array.isArray(positions)
    ? positions.filter(position => !appliedPositionIds.includes(position.id))
    : [];

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Student Dashboard
              {isAdmin && <span className="text-sm font-normal text-blue-600 ml-2">(Admin View)</span>}
            </h1>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
            </div>
          )}

          {/* My Applications Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">My Applications</h2>
            {applications.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">You haven't applied to any positions yet.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {applications.map((application) => (
                  <div key={application.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {application.position?.title || 'Position Title Not Available'}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {application.position?.clinic?.clinic_name || 'Clinic Name Not Available'} - {application.position?.clinic?.department || 'Department Not Available'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Applied: {formatDate(application.applied_at)}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Positions Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Available Positions</h2>
            {availablePositions.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">
                  {positions.length === 0 
                    ? 'No positions available at the moment.' 
                    : 'You have applied to all available positions.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {availablePositions.map((position) => (
                  <div key={position.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{position.title}</h3>
                        <p className="text-gray-600 mb-2">
                          {position.clinic?.clinic_name} - {position.clinic?.department}
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                          Specialty: {position.specialty} | Duration: {position.duration_months} months
                        </p>
                      </div>
                      <button
                        onClick={() => handleApplyClick(position)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-700">{position.description}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Start Date:</span>
                        <span className="ml-2 text-gray-900">{formatDate(position.start_date)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Application Deadline:</span>
                        <span className="ml-2 text-gray-900">{formatDate(position.application_deadline)}</span>
                      </div>
                    </div>
                    
                    {position.requirements && (
                      <div className="mt-4">
                        <span className="font-medium text-gray-600">Requirements:</span>
                        <p className="mt-1 text-gray-700">{position.requirements}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Modal */}
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

