'use client';

import { useState } from 'react';
import CustomInputField from '../CustomInputField';
import CustomButton from '../CustomButton';
import { uploadBook } from '@/lib/api';
import { useGlobalContext } from '@/context/GlobalContext';

export default function Admin() {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    category: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const { updateCustomToast } = useGlobalContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('author', formData.author);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('category', formData.category);
    
    if (file) {
      formDataToSend.append('image', file);
    }

    const response = await uploadBook(formDataToSend);
    
    if (response?.success) {
      updateCustomToast('SUCCESS', 'Book uploaded successfully!');
      setFormData({ title: '', author: '', description: '', price: '', category: '' });
      setFile(null);
    } else {
      updateCustomToast('ERROR', 'Failed to upload book');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Upload New Book</h2>
        
        <form onSubmit={handleSubmit}>
          <CustomInputField
            label="Title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <CustomInputField
            label="Author"
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            required
          />
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <CustomInputField
            label="Price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
          <CustomInputField
            label="Category"
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          />
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Book Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="shadow border rounded w-full py-2 px-3"
              required
            />
          </div>
          <CustomButton type="submit" className="w-full">
            Upload Book
          </CustomButton>
        </form>
      </div>
    </div>
  );
}
