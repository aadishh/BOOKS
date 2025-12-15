'use client';

import { useState } from 'react';
import CustomInputField from './CustomInputField';
import CustomButton from './CustomButton';
import { useGlobalContext } from '@/context/GlobalContext';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const { updateCustomToast } = useGlobalContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomToast('SUCCESS', 'Message sent successfully!');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <form onSubmit={handleSubmit} className="max-w-lg">
        <CustomInputField
          label="Name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <CustomInputField
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Message
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows={5}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
          />
        </div>
        <CustomButton type="submit">Send Message</CustomButton>
      </form>
    </div>
  );
}
