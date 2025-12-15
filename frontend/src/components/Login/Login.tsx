'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomInputField from '../CustomInputField';
import CustomButton from '../CustomButton';
import { loginUser, signUpUser, verify2FA } from '@/lib/api';
import { useGlobalContext } from '@/context/GlobalContext';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/lib/constants';
import type { LoginFormData, SignUpFormData } from '@/types';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState<LoginFormData>({ username: '', password: '' });
  const [signUpData, setSignUpData] = useState<SignUpFormData & { confirmPassword: string }>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const { updateCustomToast } = useGlobalContext();
  const { setUser, setToken } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await loginUser(loginData);
      
      if (response.statusCode === 200) {
        // Check if 2FA is required
        if (response.data.requiresTwoFactor && response.data.tempToken) {
          setTempToken(response.data.tempToken);
          setShowTwoFactor(true);
          updateCustomToast('INFO', response.message || 'Please enter the verification code sent to your email');
        } else if (response.data.token && response.data.user) {
          // Direct login without 2FA
          setToken(response.data.token);
          setUser(response.data.user);
          updateCustomToast('SUCCESS', response.message || 'Login successful!');
          router.push(ROUTES.HOME);
        }
      } else {
        updateCustomToast('ERROR', response.message || 'Login failed');
      }
    } catch (error) {
      updateCustomToast('ERROR', error instanceof Error ? error.message : 'Login failed');
    }
  };

  const handleTwoFactorVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await verify2FA({ tempToken, code: twoFactorCode });
      
      if (response.statusCode === 200 && response.data.token && response.data.user) {
        setToken(response.data.token);
        setUser(response.data.user);
        updateCustomToast('SUCCESS', response.message || 'Authentication successful!');
        router.push(ROUTES.HOME);
      } else {
        updateCustomToast('ERROR', response.message || 'Verification failed');
      }
    } catch (error) {
      updateCustomToast('ERROR', error instanceof Error ? error.message : 'Verification failed');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      updateCustomToast('ERROR', 'Passwords do not match');
      return;
    }

    try {
      const { confirmPassword, ...signUpPayload } = signUpData;
      const response = await signUpUser(signUpPayload);
      
      if (response.statusCode === 200 || response.statusCode === 201) {
        if (response.data.token && response.data.user) {
          // Auto-login after signup
          setToken(response.data.token);
          setUser(response.data.user);
          updateCustomToast('SUCCESS', response.message || 'Sign up successful!');
          router.push(ROUTES.HOME);
        } else {
          updateCustomToast('SUCCESS', response.message || 'Sign up successful! Please login.');
          setIsLogin(true);
        }
      } else {
        updateCustomToast('ERROR', response.message || 'Sign up failed');
      }
    } catch (error) {
      updateCustomToast('ERROR', error instanceof Error ? error.message : 'Sign up failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {showTwoFactor ? 'Two-Factor Authentication' : isLogin ? 'Login' : 'Sign Up'}
        </h2>

        {showTwoFactor ? (
          <form onSubmit={handleTwoFactorVerify}>
            <p className="mb-4 text-gray-600 text-sm">
              A verification code has been sent to your email. Please enter it below.
            </p>
            <CustomInputField
              label="Verification Code"
              type="text"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder="Enter 6-digit code"
              required
            />
            <CustomButton type="submit" className="w-full">
              Verify
            </CustomButton>
            <button
              type="button"
              onClick={() => {
                setShowTwoFactor(false);
                setTempToken('');
                setTwoFactorCode('');
              }}
              className="mt-2 text-sm text-blue-500 hover:underline w-full text-center"
            >
              Back to Login
            </button>
          </form>
        ) : isLogin ? (
          <form onSubmit={handleLogin}>
            <CustomInputField
              label="Username"
              type="text"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              required
            />
            <CustomInputField
              label="Password"
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              required
            />
            <CustomButton type="submit" className="w-full">
              Login
            </CustomButton>
          </form>
        ) : (
          <form onSubmit={handleSignUp}>
            <CustomInputField
              label="Username"
              type="text"
              value={signUpData.username}
              onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
              required
            />
            <CustomInputField
              label="Email"
              type="email"
              value={signUpData.email}
              onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
              required
            />
            <CustomInputField
              label="Password"
              type="password"
              value={signUpData.password}
              onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
              required
            />
            <CustomInputField
              label="Confirm Password"
              type="password"
              value={signUpData.confirmPassword}
              onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
              required
            />
            <CustomButton type="submit" className="w-full">
              Sign Up
            </CustomButton>
          </form>
        )}

        {!showTwoFactor && (
          <p className="mt-4 text-center">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-500 hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
