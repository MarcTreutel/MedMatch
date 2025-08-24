'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserContext } from '@/context/UserContext';

export default function Navigation() {
  const { user, error, isLoading } = useUser();
  const { dbUser, isAdmin } = useUserContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Check if we're in student or clinic section
  const isStudentSection = pathname?.includes('/student');
  const isClinicSection = pathname?.includes('/clinic');

  const handleRoleSwitch = () => {
    if (isAdmin) {
      // Admin can switch roles directly
      if (isStudentSection) {
        router.push('/clinic/dashboard');
      } else if (isClinicSection) {
        router.push('/student/dashboard');
      } else {
        router.push('/select-role');
      }
    } else {
      // Regular users go to role selection
      router.push('/select-role');
    }
    setMenuOpen(false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-blue-900">MedMatch</h1>
            </Link>
            
            {user && (
              <div className="hidden md:flex ml-8 space-x-6">
                {isStudentSection && (
                  <>
                    <Link href="/student/dashboard" 
                      className={`text-gray-600 hover:text-blue-700 ${pathname === '/student/dashboard' ? 'text-blue-700 font-medium' : ''}`}
                    >
                      Dashboard
                    </Link>
                    <Link href="/student/profile" 
                      className={`text-gray-600 hover:text-blue-700 ${pathname === '/student/profile' ? 'text-blue-700 font-medium' : ''}`}
                    >
                      My Profile
                    </Link>
                    <Link href="/student/applications" 
                      className={`text-gray-600 hover:text-blue-700 ${pathname === '/student/applications' ? 'text-blue-700 font-medium' : ''}`}
                    >
                      My Applications
                    </Link>
                  </>
                )}
                
                {isClinicSection && (
                  <>
                    <Link href="/clinic/dashboard" 
                      className={`text-gray-600 hover:text-green-700 ${pathname === '/clinic/dashboard' ? 'text-green-700 font-medium' : ''}`}
                    >
                      Dashboard
                    </Link>
                    <Link href="/clinic/profile" 
                      className={`text-gray-600 hover:text-green-700 ${pathname === '/clinic/profile' ? 'text-green-700 font-medium' : ''}`}
                    >
                      Clinic Profile
                    </Link>
                    <Link href="/clinic/positions" 
                      className={`text-gray-600 hover:text-green-700 ${pathname === '/clinic/positions' ? 'text-green-700 font-medium' : ''}`}
                    >
                      Manage Positions
                    </Link>
                    <Link href="/clinic/applications" 
                      className={`text-gray-600 hover:text-green-700 ${pathname === '/clinic/applications' ? 'text-green-700 font-medium' : ''}`}
                    >
                      Applications
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-2">
                  <img
                    src={user.picture || '/default-avatar.png'}
                    alt={user.name || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-gray-700 flex items-center">
                    {user.name || user.email}
                    {isAdmin && (
                      <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-0.5 text-xs rounded-full">
                        Admin
                      </span>
                    )}
                  </span>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      {/* Only admins can switch roles */}
                      {isAdmin && (
                        <button 
                          onClick={handleRoleSwitch}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {isStudentSection ? "Switch to Clinic" : 
                          isClinicSection ? "Switch to Student" : 
                          "Select Role"}
                        </button>
                      )}
                      <a
                        href="/api/auth/logout"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </a>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-x-2">
                <a
                  href="/api/auth/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login
                </a>
                <a
                  href="/api/auth/signup"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = '/api/auth/signup';
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

