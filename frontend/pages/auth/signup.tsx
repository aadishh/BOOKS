import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button, Input, Card } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { SignupFormData, TwoFactorFormData } from '@/types';
import { isValidEmail } from '@/utils';

const SignupPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup, verify2FA } = useAuth();
  const router = useRouter();

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    watch,
  } = useForm<SignupFormData>();

  const {
    register: register2FA,
    handleSubmit: handle2FASubmit,
    formState: { errors: twoFAErrors },
    reset: reset2FA,
  } = useForm<TwoFactorFormData>();

  const password = watch('password');

  const onSignupSubmit = async (data: SignupFormData) => {
    try {
      setLoading(true);
      const response = await signup({
        username: data.username,
        email: data.email,
        password: data.password,
      });

      if (response.requiresTwoFactor && response.tempToken) {
        setRequiresTwoFactor(true);
        setTempToken(response.tempToken);
      } else {
        // Redirect to home or intended page
        const redirectTo = (router.query.redirect as string) || '/';
        router.push(redirectTo);
      }
    } catch (error) {
      console.error('Signup failed:', error);
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

      // Redirect to home or intended page
      const redirectTo = (router.query.redirect as string) || '/';
      router.push(redirectTo);
    } catch (error) {
      console.error('2FA verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignup = () => {
    setRequiresTwoFactor(false);
    setTempToken('');
    reset2FA();
  };

  return (
    <Layout title="Sign Up - BookStore" noFooter>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-light">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center space-x-2 mb-8">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-2xl font-bold text-secondary">BookStore</span>
            </Link>

            <h2 className="text-3xl font-bold text-secondary">
              {requiresTwoFactor ? 'Verify Your Email' : 'Create Account'}
            </h2>
            <p className="mt-2 text-muted">
              {requiresTwoFactor
                ? 'Enter the verification code sent to your email'
                : 'Join thousands of book lovers today'
              }
            </p>
          </div>

          <Card className="p-8">
            {!requiresTwoFactor ? (
              /* Signup Form */
              <form onSubmit={handleSignupSubmit(onSignupSubmit)} className="space-y-6">
                <div>
                  <Input
                    label="Username"
                    type="text"
                    placeholder="Choose a username"
                    {...registerSignup('username', {
                      required: 'Username is required',
                      minLength: {
                        value: 3,
                        message: 'Username must be at least 3 characters',
                      },
                      pattern: {
                        value: /^[a-zA-Z0-9_]+$/,
                        message: 'Username can only contain letters, numbers, and underscores',
                      },
                    })}
                    error={signupErrors.username?.message}
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Email"
                    type="email"
                    placeholder="Enter your email address"
                    {...registerSignup('email', {
                      required: 'Email is required',
                      validate: (value) => isValidEmail(value) || 'Please enter a valid email address',
                    })}
                    error={signupErrors.email?.message}
                    required
                  />
                </div>

                <div>
                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      {...registerSignup('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                      error={signupErrors.password?.message}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-muted hover:text-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Input
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      {...registerSignup('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) => value === password || 'Passwords do not match',
                      })}
                      error={signupErrors.confirmPassword?.message}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-muted hover:text-secondary"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>



                <div className="flex items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-primary focus:ring-primary border-muted rounded"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-secondary">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary hover:text-primary">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary hover:text-primary">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  loading={loading}
                  disabled={loading}
                >
                  Create Account
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
                  <p className="mt-2 text-sm text-muted">
                    Check your email for the verification code. It expires in 4 minutes.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleBackToSignup}
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
                    Verify & Create Account
                  </Button>
                </div>
              </form>
            )}

            {!requiresTwoFactor && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-light0">Already have an account?</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SignupPage;