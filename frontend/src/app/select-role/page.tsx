'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useUserContext } from '@/context/UserContext';

export default function SelectRole() {
  const { user, isLoading: authLoading } = useUser();
  const { dbUser, isAdmin, loading, error: contextError, setUserRole, enableAdminAccess } = useUserContext();
  const router = useRouter();
  const [adminKey, setAdminKey] = useState('');
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [error, setError] = useState('');

  const handleSetRole = (role: string) => {
    setUserRole(role);
  };

  const handleAdminAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await enableAdminAccess(adminKey);
    if (success) {
      setError('');
      setShowAdminForm(false);
      alert("Admin access granted! You can now switch between roles.");
    } else {
      setError('Invalid admin key');
    }
  };

  if (authLoading || loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  
  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to MedMatch
              </h1>
              <p className="text-gray-600">
                Select your role to continue
              </p>
              
              {isAdmin && (
                <div className="mt-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full inline-block text-sm">
                  Admin Access Enabled
                </div>
              )}
            </div>

            {(error || contextError) && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                {error || contextError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <button
                onClick={() => handleSetRole('student')}
                className="bg-white border-2 border-blue-600 hover:bg-blue-50 rounded-lg p-6 text-center transition-colors group"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">👨‍🎓</div>
                <h2 className="text-xl font-semibold text-blue-700 mb-2">I'm a Student</h2>
                <p className="text-gray-600 text-sm">
                  Browse and apply for medical internships
                </p>
              </button>

              <button
                onClick={() => handleSetRole('clinic')}
                className="bg-white border-2 border-green-600 hover:bg-green-50 rounded-lg p-6 text-center transition-colors group"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🏥</div>
                <h2 className="text-xl font-semibold text-green-700 mb-2">I'm a Clinic</h2>
                <p className="text-gray-600 text-sm">
                  Post positions and review applications
                </p>
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowAdminForm(!showAdminForm)}
                className="text-gray-500 text-sm hover:text-gray-700"
              >
                Admin Access
              </button>
              
              {showAdminForm && (
                <form onSubmit={handleAdminAccess} className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Key
                    </label>
                    <input
                      type="password"
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Enable Admin Access
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
