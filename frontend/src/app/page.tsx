'use client';

import Navigation from '@/components/Navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUserContext } from '@/context/UserContext';

export default function Home() {
  const { user, isLoading } = useUser();
  const { dbUser, loading: contextLoading } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (user && !isLoading && !contextLoading) {
      if (dbUser) {
        // Existing user - redirect to their dashboard
        if (dbUser.role === 'student') {
          router.push('/student/dashboard');
        } else if (dbUser.role === 'clinic') {
          router.push('/clinic/dashboard');
        } else if (dbUser.role === 'admin') {
          router.push('/select-role'); // Admins can choose role
        }
      } else {
        // New user - redirect to role selection
        router.push('/select-role');
      }
    }
  }, [user, isLoading, contextLoading, dbUser, router]);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h1 className="text-5xl font-bold text-blue-900 mb-4">
              MedMatch
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connecting Medical Students with Internship Opportunities
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
            <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-blue-500">
              <div className="text-4xl mb-4">🎓</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                For Medical Students
              </h2>
              <p className="text-gray-600 mb-6">
                Find the perfect internship opportunities at top clinics. 
                Apply with one click and track your applications.
              </p>
              <button
                onClick={() => {
                  // TODO: Add student information page/modal
                  console.log('Student info clicked - coming soon!');
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block cursor-pointer border-none"
              >
                Learn More for Students
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-green-500">
              <div className="text-4xl mb-4">🏥</div>
              <h2 className="text-2xl font-semibent text-gray-800 mb-4">
                For Clinics
              </h2>
              <p className="text-gray-600 mb-6">
                Streamline your internship program. Post positions, 
                manage applications, and find the best candidates.
              </p>
              <button
                onClick={() => {
                  // TODO: Add clinic information page/modal
                  console.log('Clinic info clicked - coming soon!');
                }}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-block cursor-pointer border-none"
              >
                Learn More for Clinics
              </button>
            </div>
          </div>

          <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              Trusted by Leading Medical Institutions
            </h3>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-blue-600">4+</div>
                <div className="text-gray-600">Charité Clinics</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">100+</div>
                <div className="text-gray-600">Students Ready</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">50+</div>
                <div className="text-gray-600">Positions Available</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}


