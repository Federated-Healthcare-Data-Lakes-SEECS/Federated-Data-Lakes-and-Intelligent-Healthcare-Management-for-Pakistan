"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Hospital } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const Home = () => {
  const { isAuthenticated, loading: isAuthLoading } = useAuth();
  const router = useRouter();

  const isLoggedIn = isAuthenticated && !isAuthLoading;
  
  const handleButtonClick = () => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8">
          <div className="bg-blue-100 p-4 rounded-full">
            <Hospital className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Hospital Management System
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 mb-8">
          Administrative Panel
        </p>

        {/* Description */}
        <p className="text-gray-500 mb-12 max-w-lg mx-auto">
          Streamline your hospital operations with our comprehensive management system. 
          Access patient records, manage appointments, and oversee hospital administration.
        </p>

        {/* Main CTA Button */}
        <Button 
          onClick={handleButtonClick}
          size="lg"
          className="px-8 py-3 text-lg"
        >
          {isLoggedIn ? 'Go to Dashboard' : 'Login'}
        </Button>

        {/* Footer */}
        <div className="mt-16 text-sm text-gray-400">
          <p>Secure access for authorized personnel only</p>
        </div>
      </div>
    </div>
  );
};

export default Home;