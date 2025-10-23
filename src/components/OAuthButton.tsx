"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { FaFacebookF } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

interface OAuthButtonProps {
  provider: 'google' | 'facebook';
  children: React.ReactNode;
  variant?: 'outline-primary' | 'primary';
  className?: string;
}

const OAuthButton: React.FC<OAuthButtonProps> = ({ 
  provider, 
  children, 
  variant = 'outline-primary',
  className 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleOAuthClick = async () => {
    setIsLoading(true);
    
    try {
      const baseUrl = 'http://localhost:5000/api/users/auth';
      const frontendUrl = 'http://localhost:3000';
      const callbackUrl = `${frontendUrl}/auth/callback`;
      
      // Try different approaches based on common OAuth patterns
      const approaches = [
        // Approach 1: Simple redirect_uri
        `${baseUrl}/${provider}?redirect_uri=${encodeURIComponent(callbackUrl)}`,
        
        // Approach 2: With service parameter
        `${baseUrl}/${provider}?redirect_uri=${encodeURIComponent(callbackUrl)}&service=${provider}`,
        
        // Approach 3: With services parameter
        `${baseUrl}/${provider}?redirect_uri=${encodeURIComponent(callbackUrl)}&services=${provider}`,
        
        // Approach 4: POST request approach (if backend expects POST)
        `${baseUrl}/${provider}`,
        
        // Approach 5: Different endpoint structure
        `${baseUrl}/oauth/${provider}?redirect_uri=${encodeURIComponent(callbackUrl)}`,
        
        // Approach 6: With client_id parameter
        `${baseUrl}/${provider}?redirect_uri=${encodeURIComponent(callbackUrl)}&client_id=frontend`,
      ];
      
      console.log(`Attempting ${provider} OAuth with multiple approaches:`);
      approaches.forEach((url, index) => {
        console.log(`Approach ${index + 1}:`, url);
      });
      
      // Try the first approach first
      const primaryUrl = approaches[0];
      console.log(`Using primary approach:`, primaryUrl);
      
      // Open OAuth URL
      window.location.href = primaryUrl;
      
    } catch (error) {
      console.error(`Error initiating ${provider} OAuth:`, error);
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      className={className}
      onClick={handleOAuthClick}
      type="button"
      disabled={isLoading}
    >
      {isLoading ? 'Đang tải...' : children}
    </Button>
  );
};

export default OAuthButton;