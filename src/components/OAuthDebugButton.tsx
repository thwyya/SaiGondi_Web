"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { FaFacebookF } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

interface OAuthDebugButtonProps {
  provider: 'google' | 'facebook';
  children: React.ReactNode;
  variant?: 'outline-primary' | 'primary';
  className?: string;
}

const OAuthDebugButton: React.FC<OAuthDebugButtonProps> = ({ 
  provider, 
  children, 
  variant = 'outline-primary',
  className 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  const testOAuthApproach = async (approach: number, url: string) => {
    addDebugInfo(`Testing approach ${approach}: ${url}`);
    
    try {
      // Test if the URL is accessible
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors' // Avoid CORS issues
      });
      
      addDebugInfo(`Approach ${approach} - URL accessible`);
      
      // If accessible, try to redirect
      window.location.href = url;
      
    } catch (error) {
      addDebugInfo(`Approach ${approach} - Error: ${error}`);
    }
  };

  const handleOAuthClick = async () => {
    setIsLoading(true);
    setDebugInfo([]);
    
    addDebugInfo(`Starting ${provider} OAuth test...`);
    
    const baseUrl = 'http://localhost:5000/api/users/auth';
    const frontendUrl = 'http://localhost:3000';
    const callbackUrl = `${frontendUrl}/auth/callback`;
    
    // Different approaches to try
    const approaches = [
      {
        name: "Simple redirect_uri",
        url: `${baseUrl}/${provider}?redirect_uri=${encodeURIComponent(callbackUrl)}`
      },
      {
        name: "With service parameter",
        url: `${baseUrl}/${provider}?redirect_uri=${encodeURIComponent(callbackUrl)}&service=${provider}`
      },
      {
        name: "With services parameter",
        url: `${baseUrl}/${provider}?redirect_uri=${encodeURIComponent(callbackUrl)}&services=${provider}`
      },
      {
        name: "With client_id",
        url: `${baseUrl}/${provider}?redirect_uri=${encodeURIComponent(callbackUrl)}&client_id=frontend`
      },
      {
        name: "Different endpoint structure",
        url: `${baseUrl}/oauth/${provider}?redirect_uri=${encodeURIComponent(callbackUrl)}`
      },
      {
        name: "No parameters",
        url: `${baseUrl}/${provider}`
      }
    ];
    
    addDebugInfo(`Found ${approaches.length} approaches to test`);
    
    // Test each approach
    for (let i = 0; i < approaches.length; i++) {
      const approach = approaches[i];
      addDebugInfo(`Testing: ${approach.name}`);
      
      // Add a small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Test the URL
      await testOAuthApproach(i + 1, approach.url);
      
      // If we get here, the redirect worked
      break;
    }
    
    setIsLoading(false);
  };

  return (
    <div>
      <Button 
        variant={variant} 
        className={className}
        onClick={handleOAuthClick}
        type="button"
        disabled={isLoading}
      >
        {isLoading ? 'Đang test...' : children}
      </Button>
      
      {debugInfo.length > 0 && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          fontSize: '12px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          <strong>Debug Info:</strong>
          {debugInfo.map((info, index) => (
            <div key={index} style={{ marginBottom: '2px' }}>
              {info}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OAuthDebugButton;
