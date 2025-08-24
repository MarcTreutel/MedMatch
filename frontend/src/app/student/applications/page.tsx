'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';

interface Position {
  id: string;
  title: string;
  specialty: string;
  duration_months: number;
  start_date: string;
  clinic: {
    clinic_name: string;
    department: string;
  };
}

interface Application {
  id: string;
  position: Position;
  status: string;
  applied_at: string;
  reviewed_at: string | null;
  cover_letter: string;
}

export default function StudentApplications() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/applications/student/${user?.sub}`);
      const data = await response.json();

      console.log('Applications API response:', data);
      console.log('Is array?', Array.isArray(data));
      console.log('Type:', typeof data);

      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) return <div>Loading...</div>;
  if (!user) {
    router.push('/');
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">Pending</span>;
      case 'reviewed':
        return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">Reviewed</span>;
      case 'accepted':
        return <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">Accepted</span>;
      case 'rejected':
        return <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs">Rejected</span>;
      default:
        return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs">{status}</span>;
    }
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Applications
            </h1>
            <p className="text-gray-600">
              Track the status of your internship applications
            </p>
          </div>

          {/* Applications List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Applications ({applications.length})
              </h2>
            </div>
            
            {loading ? (
              <div className="text-center p-8">
                <div className="text-gray-500">Loading applications...</div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center p-8">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Applications Yet</h3>
                <p className="text-gray-500 mb-6">You haven't applied to any positions yet.</p>
                <button
                  onClick={() => router.push('/student/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Browse Positions
                </button>
              </div>
            ) : (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="pb-3 font-medium">Position</th>
                        <th className="pb-3 font-medium">Clinic</th>
                        <th className="pb-3 font-medium">Applied On</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((application) => (
                        <tr key={application.id} className="border-b hover:bg-gray-50">
                          <td className="py-4">
                            <div className="font-medium text-gray-900">{application.position.title}</div>
                            <div className="text-sm text-gray-500">{application.position.specialty}</div>
                          </td>
                          <td className="py-4">{application.position.clinic.clinic_name}</td>
                          <td className="py-4">{formatDate(application.applied_at)}</td>
                          <td className="py-4">
                            {getStatusBadge(application.status)}
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() => setSelectedApplication(application)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Application Details Modal */}
          {selectedApplication && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Application Details
                    </h2>
                    <button
                      onClick={() => setSelectedApplication(null)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {selectedApplication.position.title}
                    </h3>
                    <p className="text-blue-600">
                      {selectedApplication.position.clinic.clinic_name}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500">Applied On</p>
                      <p className="font-medium">{formatDate(selectedApplication.applied_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium">{getStatusBadge(selectedApplication.status)}</p>
                    </div>
                    {selectedApplication.reviewed_at && (
                      <div>
                        <p className="text-sm text-gray-500">Reviewed On</p>
                        <p className="font-medium">{formatDate(selectedApplication.reviewed_at)}</p>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Your Cover Letter</h4>
                    <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap">
                      {selectedApplication.cover_letter || 'No cover letter provided'}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Position Details</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Specialty:</span> {selectedApplication.position.specialty}</p>
                      <p><span className="font-medium">Duration:</span> {selectedApplication.position.duration_months} months</p>
                      <p><span className="font-medium">Start Date:</span> {formatDate(selectedApplication.position.start_date)}</p>
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <button
                      onClick={() => setSelectedApplication(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
