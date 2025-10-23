import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button, Input, Card } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { LoginFormData, TwoFactorFormData } from '@/types';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, verify2FA } = useAuth();
  const router = useRouter();

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>();

  const {
    register: register2FA,
    handleSubmit: handle2FASubmit,
    formState: { errors: twoFAErrors },
    reset: reset2FA,
  } = useForm<TwoFactorFormData>();

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      const response = await login(data);
      
      if (response.requiresTwoFactor && response.tempToken) {
        setRequiresTwoFactor(true);
        setTempToken(response.tempToken);
      } else {
        // Redirect to intended page or home
        const redirectTo = (router.query.redirect as string) || '/';
        router.push(redirectTo);
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const on2FASubmit = async (data: TwoFactorFormData) => {
    try {
      setLoading(true);
      await verify2FA({
        tempToken,
        code: data.code,
      });
      
      // Redirect to intended page or home
      const redirectTo = (router.query.redirect as string) || '/';
      router.push(redirectTo);
    } catch (error) {
      console.error('2FA verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setRequiresTwoFactor(false);
    setTempToken('');
    reset2FA();
  };

  return (
    <Layout title="Sign In - BookStore" noFooter>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-secondary-50">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center space-x-2 mb-8">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-2xl font-bold text-secondary-900">BookStore</span>
            </Link>
            
            <h2 className="text-3xl font-bold text-secondary-900">
              {requiresTwoFactor ? 'Two-Factor Authentication' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-secondary-600">
              {requiresTwoFactor 
                ? 'Enter the verification code sent to your email'
                : 'Sign in to your account to continue'
              }
            </p>
          </div>

          <Card className="p-8">
            {!requiresTwoFactor ? (
              /* Login Form */
              <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-6">
                <div>
                  <Input
                    label="Username or Email"
                    type="text"
                    placeholder="Enter your username or email"
                    {...registerLogin('username', {
                      required: 'Username or email is required',
                    })}
                    error={loginErrors.username?.message}
                    required
                  />
                </div>

                <div>
                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      {...registerLogin('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                      error={loginErrors.password?.message}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-secondary-400 hover:text-secondary-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-700">
                      Remember me
                    </label>
                  </div>

                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  loading={loading}
                  disabled={loading}
                >
                  Sign In
                </Button>
              </form>
            ) : (
              /* 2FA Form */
              <form onSubmit={handle2FASubmit(on2FASubmit)} className="space-y-6">
                <div>
                  <Input
                    label="Verification Code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    {...register2FA('code', {
                      required: 'Verification code is required',
                      pattern: {
                        value: /^\d{6}$/,
                        message: 'Please enter a valid 6-digit code',
                      },
                    })}
                    error={twoFAErrors.code?.message}
                    required
                  />
                  <p className="mt-2 text-sm text-secondary-600">
                    Check your email for the verification code. It expires in 4 minutes.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleBackToLogin}
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    loading={loading}
                    disabled={loading}
                  >
                    Verify
                  </Button>
                </div>
              </form>
            )}

            {!requiresTwoFactor && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-secondary-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-secondary-500">Don't have an account?</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href="/auth/signup">
                    <Button variant="outline" className="w-full">
                      Create Account
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>

          {/* Demo Credentials */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials</h3>
            <div className="text-xs text-blue-800 space-y-1">
              <div><strong>Admin:</strong> admin / password</div>
              <div><strong>User:</strong> user / password</div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;