"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { FaFacebookF } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

export default function OAuthDebugPage() {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  const testOAuthUrl = async (provider: 'google' | 'facebook', approach: string, url: string) => {
    addDebugInfo(`Testing ${provider} - ${approach}: ${url}`);
    
    try {
      // Test if the URL is accessible
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      addDebugInfo(`✅ ${provider} - ${approach}: URL accessible`);
      
      // If accessible, try to redirect
      window.location.href = url;
      
    } catch (error) {
      addDebugInfo(`❌ ${provider} - ${approach}: Error - ${error}`);
    }
  };

  const testGoogleOAuth = async () => {
    setIsLoading(true);
    setDebugInfo([]);
    
    addDebugInfo('Starting Google OAuth tests...');
    
    const baseUrl = 'http://localhost:5000/api/users/auth';
    const frontendUrl = 'http://localhost:3000';
    const callbackUrl = `${frontendUrl}/auth/callback`;
    
    const approaches = [
      {
        name: "Simple redirect_uri",
        url: `${baseUrl}/google?redirect_uri=${encodeURIComponent(callbackUrl)}`
      },
      {
        name: "With service parameter",
        url: `${baseUrl}/google?redirect_uri=${encodeURIComponent(callbackUrl)}&service=google`
      },
      {
        name: "With services parameter",
        url: `${baseUrl}/google?redirect_uri=${encodeURIComponent(callbackUrl)}&services=google`
      },
      {
        name: "With client_id",
        url: `${baseUrl}/google?redirect_uri=${encodeURIComponent(callbackUrl)}&client_id=frontend`
      },
      {
        name: "Different endpoint",
        url: `${baseUrl}/oauth/google?redirect_uri=${encodeURIComponent(callbackUrl)}`
      },
      {
        name: "No parameters",
        url: `${baseUrl}/google`
      }
    ];
    
    for (const approach of approaches) {
      await testOAuthUrl('google', approach.name, approach.url);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsLoading(false);
  };

  const testFacebookOAuth = async () => {
    setIsLoading(true);
    setDebugInfo([]);
    
    addDebugInfo('Starting Facebook OAuth tests...');
    
    const baseUrl = 'http://localhost:5000/api/users/auth';
    const frontendUrl = 'http://localhost:3000';
    const callbackUrl = `${frontendUrl}/auth/callback`;
    
    const approaches = [
      {
        name: "Simple redirect_uri",
        url: `${baseUrl}/facebook?redirect_uri=${encodeURIComponent(callbackUrl)}`
      },
      {
        name: "With service parameter",
        url: `${baseUrl}/facebook?redirect_uri=${encodeURIComponent(callbackUrl)}&service=facebook`
      },
      {
        name: "With services parameter",
        url: `${baseUrl}/facebook?redirect_uri=${encodeURIComponent(callbackUrl)}&services=facebook`
      },
      {
        name: "With client_id",
        url: `${baseUrl}/facebook?redirect_uri=${encodeURIComponent(callbackUrl)}&client_id=frontend`
      },
      {
        name: "Different endpoint",
        url: `${baseUrl}/oauth/facebook?redirect_uri=${encodeURIComponent(callbackUrl)}`
      },
      {
        name: "No parameters",
        url: `${baseUrl}/facebook`
      }
    ];
    
    for (const approach of approaches) {
      await testOAuthUrl('facebook', approach.name, approach.url);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>OAuth Debug Page</h1>
      <p>Test different OAuth approaches to find the correct one for your backend.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Google OAuth Tests</h2>
        <Button 
          onClick={testGoogleOAuth}
          disabled={isLoading}
          variant="outline-primary"
        >
          <FcGoogle className="text-xl" /> Test Google OAuth
        </Button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Facebook OAuth Tests</h2>
        <Button 
          onClick={testFacebookOAuth}
          disabled={isLoading}
          variant="outline-primary"
        >
          <FaFacebookF className="text-[var(--primary)] text-xl" /> Test Facebook OAuth
        </Button>
      </div>
      
      {debugInfo.length > 0 && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          fontSize: '14px',
          maxHeight: '400px',
          overflowY: 'auto',
          border: '1px solid #ddd'
        }}>
          <h3>Debug Log:</h3>
          {debugInfo.map((info, index) => (
            <div key={index} style={{ 
              marginBottom: '5px',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}>
              {info}
            </div>
          ))}
        </div>
      )}
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Click "Test Google OAuth" or "Test Facebook OAuth"</li>
          <li>Watch the debug log to see which approaches work</li>
          <li>Look for ✅ (success) or ❌ (error) indicators</li>
          <li>If a URL works, it will redirect you to the OAuth provider</li>
          <li>Use the working approach in your main OAuth implementation</li>
        </ol>
      </div>
    </div>
  );
}
