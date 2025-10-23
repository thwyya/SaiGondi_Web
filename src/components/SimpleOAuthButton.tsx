"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { FaFacebookF } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

interface SimpleOAuthButtonProps {
  provider: 'google' | 'facebook';
  children: React.ReactNode;
  variant?: 'outline-primary' | 'primary';
  className?: string;
}

const SimpleOAuthButton: React.FC<SimpleOAuthButtonProps> = ({ 
  provider, 
  children, 
  variant = 'outline-primary',
  className 
}) => {
  const handleOAuthClick = () => {
    const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/auth`;
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
    const callbackUrl = `${frontendUrl}/auth/callback`;
    
    // Try the most common OAuth patterns
    const urls = [
      // Pattern 1: Simple redirect_uri
      `${baseUrl}/${provider}?redirect_uri=${encodeURIComponent(callbackUrl)}`,
      
      // Pattern 2: With service parameter (common in some backends)
      `${baseUrl}/${provider}?redirect_uri=${encodeURIComponent(callbackUrl)}&service=${provider}`,
      
      // Pattern 3: With services parameter (what backend might be looking for)
      `${baseUrl}/${provider}?redirect_uri=${encodeURIComponent(callbackUrl)}&services=${provider}`,
      
      // Pattern 4: No parameters (let backend handle default redirect)
      `${baseUrl}/${provider}`,
    ];
    
    console.log(`Testing ${provider} OAuth with multiple patterns:`);
    urls.forEach((url, index) => {
      console.log(`Pattern ${index + 1}:`, url);
    });
    
    // Use the first pattern (most common)
    const primaryUrl = urls[0];
    console.log(`Using primary pattern:`, primaryUrl);
    
    // Redirect to OAuth URL
    window.location.href = primaryUrl;
  };

  return (
    <Button 
      variant={variant} 
      className={className}
      onClick={handleOAuthClick}
      type="button"
    >
      {children}
    </Button>
  );
};

export default SimpleOAuthButton;
