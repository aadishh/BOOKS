'use client';

import { useState, useEffect } from 'react';
import CustomInputField from '../CustomInputField';
import CustomButton from '../CustomButton';
import { profileBuild, getProfile } from '@/lib/api';
import { useGlobalContext } from '@/context/GlobalContext';
import { useAuth } from '@/context/AuthContext';
import { Countries } from '@/lib/helpers';
import type { ProfileFormData } from '@/types';

export default function ProfilePage() {
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  });
  const [selectedCountry, setSelectedCountry] = useState('');
  const { updateCustomToast } = useGlobalContext();
  const { userData } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (userData) {
        const user = JSON.parse(userData);
        const profile = await getProfile(user.username);
        if (profile?.data) {
          setFormData(profile.data);
        }
      }
    };
    fetchProfile();
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userData) {
      const user = JSON.parse(userData);
      const response = await profileBuild(user.username, formData);
      
      if (response?.success) {
        updateCustomToast('SUCCESS', 'Profile updated successfully!');
      } else {
        updateCustomToast('ERROR', 'Failed to update profile');
      }
    }
  };

  const country = Countries.find((c) => c.name === selectedCountry);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInputField
            label="First Name"
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
          <CustomInputField
            label="Last Name"
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
          <CustomInputField
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <CustomInputField
            label="Zip Code"
            type="text"
            value={formData.zipCode}
            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
          />
        </div>

        <CustomInputField
          label="Address"
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Country</label>
            <select
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setFormData({ ...formData, country: e.target.value, state: '' });
              }}
            >
              <option value="">Select Country</option>
              {Countries.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">State</label>
            <select
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              disabled={!selectedCountry}
            >
              <option value="">Select State</option>
              {country?.states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <CustomInputField
            label="City"
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>

        <CustomButton type="submit" className="w-full">
          Save Profile
        </CustomButton>
      </form>
    </div>
  );
}
