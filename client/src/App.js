/**
 * Main Application Component
 * 
 * This is the root component of the Fuel Tracker Global application.
 * It provides the main routing, context providers, and global configurations.
 * 
 * Features:
 * - React Router for navigation
 * - React Query for data management
 * - Accessibility provider for enhanced UX
 * - Authentication context
 * - Global error handling
 * - Performance monitoring
 * 
 * @author Fuel Tracker Global Team
 * @version 2.0.0
 */

import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { AccessibilityProvider } from './components/AccessibilityProvider';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const News = React.lazy(() => import('./pages/News'));
const About = React.lazy(() => import('./pages/About'));
const ProtectedRoute = React.lazy(() => import('./components/ProtectedRoute'));

// Create a client for React Query with enhanced configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      suspense: false,
      useErrorBoundary: true,
    },
    mutations: {
      retry: 1,
      useErrorBoundary: true,
    },
  },
});

/**
 * Performance monitoring hook
 */
const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Monitor Core Web Vitals
    if ('web-vitals' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }

    // Monitor memory usage
    if ('memory' in performance) {
      const logMemoryUsage = () => {
        const memory = performance.memory;
        console.log('Memory Usage:', {
          used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
        });
      };
      
      // Log memory usage every 30 seconds
      const interval = setInterval(logMemoryUsage, 30000);
      return () => clearInterval(interval);
    }
  }, []);
};

/**
 * Main App Component
 * @returns {JSX.Element} - Main application component
 */
function App() {
  // Initialize performance monitoring
  usePerformanceMonitoring();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AccessibilityProvider>
          <AuthProvider>
            <Router>
              <div className="App">
                {/* Skip links for accessibility */}
                <a 
                  href="#main-content" 
                  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
                >
                  Skip to main content
                </a>
                
                <Navbar />
                
                <main 
                  id="main-content" 
                  className="main-content"
                  role="main"
                  aria-label="Main content"
                >
                  <Suspense fallback={
                    <div className="flex justify-center items-center min-h-screen">
                      <LoadingSpinner size="large" text="Loading application..." />
                    </div>
                  }>
                    <AnimatePresence mode="wait">
                      <Routes>
                        <Route 
                          path="/" 
                          element={
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Home />
                            </motion.div>
                          } 
                        />
                        <Route 
                          path="/login" 
                          element={
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Login />
                            </motion.div>
                          } 
                        />
                        <Route 
                          path="/register" 
                          element={
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Register />
                            </motion.div>
                          } 
                        />
                        <Route 
                          path="/dashboard" 
                          element={
                            <ProtectedRoute>
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                              >
                                <Dashboard />
                              </motion.div>
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/analytics" 
                          element={
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Analytics />
                            </motion.div>
                          } 
                        />
                        <Route 
                          path="/news" 
                          element={
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                            >
                              <News />
                            </motion.div>
                          } 
                        />
                        <Route 
                          path="/about" 
                          element={
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                            >
                              <About />
                            </motion.div>
                          } 
                        />
                      </Routes>
                    </AnimatePresence>
                  </Suspense>
                </main>
                
                <Footer />
                
                {/* Enhanced Toast Notifications */}
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#1a202c',
                      color: '#fff',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                      fontSize: '14px',
                      fontWeight: '500',
                    },
                    success: {
                      iconTheme: {
                        primary: '#48bb78',
                        secondary: '#fff',
                      },
                      duration: 3000,
                    },
                    error: {
                      iconTheme: {
                        primary: '#f56565',
                        secondary: '#fff',
                      },
                      duration: 5000,
                    },
                    loading: {
                      iconTheme: {
                        primary: '#3182ce',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
                
                {/* React Query DevTools (only in development) */}
                {process.env.NODE_ENV === 'development' && (
                  <ReactQueryDevtools initialIsOpen={false} />
                )}
              </div>
            </Router>
          </AuthProvider>
        </AccessibilityProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
