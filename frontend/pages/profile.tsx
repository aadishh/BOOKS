import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { Layout } from '@/components/layout';
import { Button, Input, Card } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { ProfileFormData } from '@/types';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProfileFormData>();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Set form values when user data is available
  React.useEffect(() => {
    if (user) {
      setValue('email', user.email);
      setValue('firstName', user.profile?.firstName || '');
      setValue('lastName', user.profile?.lastName || '');
      setValue('phone', user.profile?.phone || '');
      setValue('twoFactorEnabled', user.twoFactorEnabled || false);
    }
  }, [user, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setUpdating(true);
      await updateProfile({
        email: data.email,
        twoFactorEnabled: data.twoFactorEnabled,
        profile: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
    // Reset form values to current user data
    if (user) {
      setValue('email', user.email);
      setValue('firstName', user.profile?.firstName || '');
      setValue('lastName', user.profile?.lastName || '');
      setValue('phone', user.profile?.phone || '');
      setValue('twoFactorEnabled', user.twoFactorEnabled || false);
    }
  };

  if (loading || !user) {
    return (
      <Layout title="Profile - BookStore">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile - BookStore">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary">Profile Settings</h1>
          <p className="text-muted mt-2">Manage your account information and security settings</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-secondary mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="First Name"
                    type="text"
                    placeholder="Enter your first name"
                    disabled={!isEditing}
                    {...register('firstName')}
                    error={errors.firstName?.message}
                  />
                </div>
                
                <div>
                  <Input
                    label="Last Name"
                    type="text"
                    placeholder="Enter your last name"
                    disabled={!isEditing}
                    {...register('lastName')}
                    error={errors.lastName?.message}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  disabled={!isEditing}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address',
                    },
                  })}
                  error={errors.email?.message}
                  required
                />
              </div>

              <div className="mt-4">
                <Input
                  label="Phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  disabled={!isEditing}
                  {...register('phone')}
                  error={errors.phone?.message}
                />
              </div>
            </div>

            {/* Security Settings */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-secondary mb-4">Security Settings</h2>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-secondary">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted">
                    Add an extra layer of security to your account by requiring a verification code when signing in.
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    id="twoFactorEnabled"
                    type="checkbox"
                    disabled={!isEditing}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50"
                    {...register('twoFactorEnabled')}
                  />
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-secondary mb-4">Account Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted">Username:</span>
                  <p className="font-medium text-secondary">{user.username}</p>
                </div>
                <div>
                  <span className="text-muted">Role:</span>
                  <p className="font-medium text-secondary capitalize">{user.role}</p>
                </div>
                <div>
                  <span className="text-muted">Member since:</span>
                  <p className="font-medium text-secondary">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <div>
                  <span className="text-muted">Last login:</span>
                  <p className="font-medium text-secondary">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              {!isEditing ? (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={updating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={updating}
                    disabled={updating}
                  >
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfilePage;