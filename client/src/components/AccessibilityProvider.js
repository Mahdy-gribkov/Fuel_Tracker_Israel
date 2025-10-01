/**
 * Accessibility Provider Component
 * 
 * This component provides comprehensive accessibility features including:
 * - Keyboard navigation support
 * - Screen reader compatibility
 * - High contrast mode
 * - Focus management
 * - ARIA labels and descriptions
 * - Reduced motion preferences
 * 
 * @author Fuel Tracker Global Team
 * @version 2.0.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

// Accessibility context
const AccessibilityContext = createContext();

/**
 * Custom hook to access accessibility features
 * @returns {Object} - Accessibility context value
 */
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

/**
 * Accessibility Provider Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} - Accessibility provider
 */
export const AccessibilityProvider = ({ children }) => {
  // State for accessibility features
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  // Check for user preferences on mount
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsReducedMotion(prefersReducedMotion);

    // Check for high contrast preference
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    setIsHighContrast(prefersHighContrast);

    // Listen for preference changes
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastMediaQuery = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = (e) => setIsReducedMotion(e.matches);
    const handleContrastChange = (e) => setIsHighContrast(e.matches);

    motionMediaQuery.addEventListener('change', handleMotionChange);
    contrastMediaQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionMediaQuery.removeEventListener('change', handleMotionChange);
      contrastMediaQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Keyboard navigation detection
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        setIsKeyboardNavigation(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardNavigation(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Apply accessibility styles to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply high contrast mode
    if (isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply reduced motion
    if (isReducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Apply font size
    root.classList.remove('font-small', 'font-normal', 'font-large');
    root.classList.add(`font-${fontSize}`);
  }, [isHighContrast, isReducedMotion, fontSize]);

  // Announce messages to screen readers
  const announce = (message, priority = 'polite') => {
    const announcement = {
      id: Date.now(),
      message,
      priority,
      timestamp: new Date()
    };
    
    setAnnouncements(prev => [...prev, announcement]);
    
    // Remove announcement after 5 seconds
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
    }, 5000);
  };

  // Focus management utilities
  const focusElement = (selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const trapFocus = (container) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  };

  // Skip to content functionality
  const skipToContent = () => {
    focusElement('#main-content');
    announce('Skipped to main content');
  };

  // Skip to navigation functionality
  const skipToNavigation = () => {
    focusElement('nav');
    announce('Skipped to navigation');
  };

  const contextValue = {
    // State
    isHighContrast,
    isReducedMotion,
    fontSize,
    isKeyboardNavigation,
    announcements,
    
    // Actions
    setIsHighContrast,
    setIsReducedMotion,
    setFontSize,
    announce,
    focusElement,
    trapFocus,
    skipToContent,
    skipToNavigation
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      
      {/* Skip links for keyboard navigation */}
      <div className="skip-links">
        <button
          onClick={skipToNavigation}
          className="skip-link"
          aria-label="Skip to navigation"
        >
          Skip to Navigation
        </button>
        <button
          onClick={skipToContent}
          className="skip-link"
          aria-label="Skip to main content"
        >
          Skip to Main Content
        </button>
      </div>

      {/* Screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announcements.map(announcement => (
          <div key={announcement.id}>
            {announcement.message}
          </div>
        ))}
      </div>
    </AccessibilityContext.Provider>
  );
};

/**
 * Higher-order component for accessibility features
 * @param {React.Component} WrappedComponent - Component to wrap
 * @returns {React.Component} - Enhanced component
 */
export const withAccessibility = (WrappedComponent) => {
  return function AccessibilityWrapper(props) {
    const accessibility = useAccessibility();
    
    return (
      <WrappedComponent
        {...props}
        accessibility={accessibility}
      />
    );
  };
};

/**
 * Hook for managing focus within a component
 * @param {React.RefObject} containerRef - Reference to container element
 * @returns {Object} - Focus management utilities
 */
export const useFocusManagement = (containerRef) => {
  const { trapFocus, focusElement } = useAccessibility();

  const focusFirst = () => {
    if (containerRef.current) {
      const firstFocusable = containerRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  };

  const focusLast = () => {
    if (containerRef.current) {
      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const lastFocusable = focusableElements[focusableElements.length - 1];
      if (lastFocusable) {
        lastFocusable.focus();
      }
    }
  };

  const enableFocusTrap = () => {
    if (containerRef.current) {
      return trapFocus(containerRef.current);
    }
  };

  return {
    focusFirst,
    focusLast,
    enableFocusTrap
  };
};

export default AccessibilityProvider;
