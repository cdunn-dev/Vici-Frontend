import { ReactNode } from 'react';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import Link from 'next/link';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <AppBar position="static" className="bg-white dark:bg-gray-800 shadow-sm">
        <Toolbar>
          <Link href="/" passHref>
            <Typography
              variant="h6"
              component="a"
              className="text-gray-900 dark:text-white font-bold cursor-pointer"
            >
              Vici
            </Typography>
          </Link>
          <Box className="flex-grow" />
          <nav className="hidden md:flex space-x-8">
            <Link href="/training-plans" passHref>
              <Typography
                component="a"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer"
              >
                Training Plans
              </Typography>
            </Link>
            <Link href="/dashboard" passHref>
              <Typography
                component="a"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer"
              >
                Dashboard
              </Typography>
            </Link>
            <Link href="/profile" passHref>
              <Typography
                component="a"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer"
              >
                Profile
              </Typography>
            </Link>
          </nav>
        </Toolbar>
      </AppBar>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <Container maxWidth="lg">
          <Box className="py-8">
            <Typography
              variant="body2"
              align="center"
              className="text-gray-600 dark:text-gray-400"
            >
              © {new Date().getFullYear()} Vici. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </footer>
    </div>
  );
}; 