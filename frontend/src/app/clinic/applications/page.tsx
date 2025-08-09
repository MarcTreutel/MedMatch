'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useUserContext } from '@/context/UserContext';
import Link from 'next/link';

interface Application {
  id: string;
  position_id: string;
  status: string;
  applied_at: string;
  cover_letter: string;
  notes?: string;
  reviewed_at?: string;
  student: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
  position: {
    id: string;
    title: string;
    specialty: string;
  };
}

interface Position {
  id: string;
  title: string;
}

export default function ClinicApplications() {
  const { user, isLoading: authLoading } = useUser();
  const { dbUser, isAdmin, loading: userLoading } = useUserContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPosition, setFilterPosition] = useState('all');

  // Get position ID from query params if available
  useEffect(() => {
    const positionId = searchParams.get('positionId');
    if (positionId) {
      setFilterPosition(positionId);
    }
  }, [searchParams]);

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
        fetchApplications(),
        fetchPositions()
      ]).then(() => {
        setLoading(false);
      });
    }
  }, [user, dbUser, authLoading, userLoading]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/applications');
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Applications data:', data);
      
      // Ensure we're working with an array
      if (Array.isArray(data)) {
        setApplications(data);
      } else {
        console.error('Expected array but got:', typeof data);
        setApplications([]);
        setError('Unexpected data format received from server');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to fetch applications');
      setApplications([]);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/positions');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setPositions(data.map(pos => ({ id: pos.id, title: pos.title })));
      } else {
        setPositions([]);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
      setPositions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (application: Application) => {
    setSelectedApplication(application);
    setReviewStatus(application.status);
    setReviewNotes(application.notes || '');
    setShowModal(true);
  };

  const handleReviewSubmit = async () => {
    if (!selectedApplication) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/applications/${selectedApplication.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: reviewStatus,
          notes: reviewNotes
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the application in the local state
        setApplications(applications.map(app => 
          app.id === selectedApplication.id 
            ? { ...app, status: reviewStatus, notes: reviewNotes, reviewed_at: new Date().toISOString() }
            : app
        ));
        setShowModal(false);
      } else {
        setError('Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      setError('Failed to update application status');
    }
  };

  const filteredApplications = applications.filter(app => {
    // Filter by status
    const statusMatch = filterStatus === 'all' || app.status === filterStatus;
    
    // Filter by position
    const positionMatch = filterPosition === 'all' || app.position_id === filterPosition;
    
    return statusMatch && positionMatch;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get position title by ID
  const getPositionTitle = (positionId: string) => {
    const position = positions.find(p => p.id === positionId);
    return position ? position.title : 'Unknown Position';
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterStatus('all');
    setFilterPosition('all');
    // Update URL to remove query params
    router.push('/clinic/applications');
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Manage Applications
            </h1>
            <p className="text-gray-600">
              Review and manage applications to your internship positions
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              Error: {error}
            </div>
          )}

          {/* Filter Controls */}
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="flex flex-col md:flex-row flex-wrap items-start md:items-center gap-4 mb-4">
              <div className="font-medium text-gray-700 w-full md:w-auto">Filter by status:</div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg ${
                    filterStatus === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilterStatus('pending')}
                  className={`px-4 py-2 rounded-lg ${
                    filterStatus === 'pending' 
                      ? 'bg-yellow-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pending
                </button>
                <button 
                  onClick={() => setFilterStatus('accepted')}
                  className={`px-4 py-2 rounded-lg ${
                    filterStatus === 'accepted' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Accepted
                </button>
                <button 
                  onClick={() => setFilterStatus('rejected')}
                  className={`px-4 py-2 rounded-lg ${
                    filterStatus === 'rejected' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Rejected
                </button>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row flex-wrap items-start md:items-center gap-4">
              <div className="font-medium text-gray-700 w-full md:w-auto">Filter by position:</div>
              <div className="flex-1">
                <select
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                  className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Positions</option>
                  {positions.map(position => (
                    <option key={position.id} value={position.id}>
                      {position.title}
                    </option>
                  ))}
                </select>
              </div>
              
              {(filterStatus !== 'all' || filterPosition !== 'all') && (
                <button 
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Applications List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Applications ({filteredApplications.length})
              </h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Loading applications...</div>
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">No applications found</div>
                  {filterStatus !== 'all' || filterPosition !== 'all' ? (
                    <button 
                      onClick={resetFilters}
                      className="mt-2 text-blue-600 hover:text-blue-800"
                    >
                      Clear filters to see all applications
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredApplications.map((application) => (
                    <div key={application.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {application.student?.user?.name || 'Unknown Student'}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-blue-600 font-medium mb-2">
                            Applied for: {application.position?.title || getPositionTitle(application.position_id) || 'Unknown Position'}
                          </p>
                          <p className="text-gray-600 text-sm mb-2">
                            Specialty: {application.position?.specialty || 'Not specified'}
                          </p>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            <span>Applied: {formatDate(application.applied_at)}</span>
                            {application.reviewed_at && (
                              <span>Reviewed: {formatDate(application.reviewed_at)}</span>
                            )}
                          </div>
                          {application.cover_letter && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                              <div className="font-medium mb-1">Cover Letter:</div>
                              {application.cover_letter}
                            </div>
                          )}
                          {application.notes && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-md text-sm text-gray-700">
                              <div className="font-medium mb-1">Review Notes:</div>
                              {application.notes}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => handleReviewClick(application)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            {application.status === 'pending' ? 'Review' : 'Update Status'}
                          </button>
                          <button
                            onClick={() => window.open(`mailto:${application.student?.user?.email}`)}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            Contact Student
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Review Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Review Application
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 font-medium">Student: {selectedApplication.student?.user?.name}</p>
                <p className="text-gray-700">Position: {selectedApplication.position?.title || getPositionTitle(selectedApplication.position_id)}</p>
                <p className="text-gray-500 text-sm">Applied: {formatDate(selectedApplication.applied_at)}</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Status
                </label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accept</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Notes
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                  placeholder="Add notes about this application..."
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
