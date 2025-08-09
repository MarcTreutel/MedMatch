'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';

interface ClinicProfile {
  id: string;
  clinic_name: string;
  department: string;
}

export default function NewPosition() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [clinicProfile, setClinicProfile] = useState<ClinicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [position, setPosition] = useState({
    title: '',
    description: '',
    specialty: '',
    duration_months: 3,
    start_date: '',
    application_deadline: '',
    requirements: ''
  });

  useEffect(() => {
    if (user) {
      fetchClinicProfile();
    }
  }, [user]);

  const fetchClinicProfile = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/clinics/profile/${user?.sub}`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setClinicProfile(data);
        } else {
          // No profile found, redirect to create profile
          router.push('/clinic/profile');
        }
      }
    } catch (error) {
      console.error('Error fetching clinic profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    if (!clinicProfile?.id) {
      setMessage('Error: Clinic profile not found. Please complete your profile first.');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/positions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clinic_id: clinicProfile.id,
          ...position,
          status: 'active'
        }),
      });

      if (response.ok) {
        setMessage('Position created successfully!');
        // Reset form
        setPosition({
          title: '',
          description: '',
          specialty: '',
          duration_months: 3,
          start_date: '',
          application_deadline: '',
          requirements: ''
        });
        
        // Redirect to positions list after short delay
        setTimeout(() => {
          router.push('/clinic/dashboard');
        }, 2000);
      } else {
        setMessage('Error creating position. Please try again.');
      }
    } catch (error) {
      console.error('Error creating position:', error);
      setMessage('Error creating position. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading) return <div>Loading...</div>;
  if (!user) {
    router.push('/');
    return null;
  }

  if (!clinicProfile) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-xl mx-auto text-center">
              <div className="bg-white rounded-lg shadow p-8">
                <div className="text-6xl mb-4">🏥</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Complete Your Profile First
                </h1>
                <p className="text-gray-600 mb-6">
                  You need to complete your clinic profile before posting positions.
                </p>
                <button
                  onClick={() => router.push('/clinic/profile')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Complete Profile
                </button>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Post New Internship Position
                  </h1>
                  <p className="text-gray-600">
                    Create an internship opportunity for medical students
                  </p>
                </div>
                <button
                  onClick={() => router.push('/clinic/dashboard')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Position Form */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Position Details
                </h2>
                <p className="text-gray-500 text-sm">
                  For: {clinicProfile.clinic_name} - {clinicProfile.department}
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Position Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position Title *
                    </label>
                    <input
                      type="text"
                      value={position.title}
                      onChange={(e) => setPosition({...position, title: e.target.value})}
                      placeholder="e.g. Internal Medicine Internship"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>

                  {/* Specialty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Specialty *
                    </label>
                    <select
                      value={position.specialty}
                      onChange={(e) => setPosition({...position, specialty: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value="">Select Specialty</option>
                      <option value="Internal Medicine">Internal Medicine</option>
                      <option value="Surgery">Surgery</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
                      <option value="Psychiatry">Psychiatry</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Oncology">Oncology</option>
                      <option value="Radiology">Radiology</option>
                      <option value="Emergency Medicine">Emergency Medicine</option>
                      <option value="Family Medicine">Family Medicine</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (Months) *
                    </label>
                    <select
                      value={position.duration_months}
                      onChange={(e) => setPosition({...position, duration_months: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value={1}>1 Month</option>
                      <option value={2}>2 Months</option>
                      <option value={3}>3 Months</option>
                      <option value={4}>4 Months</option>
                      <option value={6}>6 Months</option>
                      <option value={12}>12 Months</option>
                    </select>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={position.start_date}
                      onChange={(e) => setPosition({...position, start_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>

                  {/* Application Deadline */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Deadline *
                    </label>
                    <input
                      type="date"
                      value={position.application_deadline}
                      onChange={(e) => setPosition({...position, application_deadline: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position Description *
                    </label>
                    <textarea
                      value={position.description}
                      onChange={(e) => setPosition({...position, description: e.target.value})}
                      placeholder="Describe the internship position, responsibilities, and learning opportunities..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      rows={5}
                      required
                    ></textarea>
                  </div>

                  {/* Requirements */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Requirements
                    </label>
                    <textarea
                      value={position.requirements}
                      onChange={(e) => setPosition({...position, requirements: e.target.value})}
                      placeholder="List any specific requirements like year of study, language skills, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      rows={3}
                    ></textarea>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8">
                  {message && (
                    <div className={`p-4 mb-4 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {message}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={saving}
                    className={`w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {saving ? 'Creating Position...' : 'Post Position'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
