import { UserProvider as Auth0Provider } from '@auth0/nextjs-auth0/client';
import { Inter } from 'next/font/google';
import './globals.css';
import { UserProvider } from '@/context/UserContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MedMatch Platform',
  description: 'Connecting medical students with clinical internships',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Auth0Provider>
          <UserProvider>
            {children}
          </UserProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}
