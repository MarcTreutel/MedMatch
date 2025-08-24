'use client';

import Navigation from '@/components/Navigation';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/context/UserContext';

interface ForbiddenPageProps {
  requiredRole?: string;
  currentRole?: string;
}

export default function ForbiddenPage({ requiredRole, currentRole }: ForbiddenPageProps) {
  const router = useRouter();
  const { dbUser } = useUserContext();

  const handleGoBack = () => {
    // Redirect to appropriate dashboard based on user role
    if (dbUser?.role === 'student') {
      router.push('/student/dashboard');
    } else if (dbUser?.role === 'clinic') {
      router.push('/clinic/dashboard');
    } else {
      router.push('/');
    }
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Forbidden
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
            {requiredRole && (
              <span className="block mt-2 text-sm">
                Required role: <span className="font-semibold">{requiredRole}</span>
              </span>
            )}
            {currentRole && (
              <span className="block mt-1 text-sm">
                Your role: <span className="font-semibold">{currentRole}</span>
              </span>
            )}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleGoBack}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to My Dashboard
            </button>
            <button
              onClick={() => router.back()}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

