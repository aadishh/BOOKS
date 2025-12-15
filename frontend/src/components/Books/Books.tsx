'use client';

import { useEffect, useState } from 'react';
import { getBooks } from '@/lib/api';
import type { Book } from '@/types';
import CustomImage from '../CustomImage';
import SearchBar from '../SearchBar';

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      const response = await getBooks();
      if (response && response.data && response.data.data) {
        setBooks(response.data.data);
        setFilteredBooks(response.data.data);
      }
      setLoading(false);
    };
    fetchBooks();
  }, []);

  const handleSearch = (query: string) => {
    const filtered = books.filter(
      (book) =>
        book.name.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredBooks(filtered);
  };

  if (loading) {
    return <div className="text-center py-8">Loading books...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Books</h1>
      
      <div className="mb-8">
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredBooks?.map((book) => (
          <div key={book.id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
            <CustomImage
              src={book.image || '/placeholder-book.jpg'}
              alt={book.name}
              width={200}
              height={300}
              className="w-full h-64 object-cover rounded mb-4"
            />
            <h3 className="font-bold text-lg mb-2">{book.name}</h3>
            <p className="text-gray-600 mb-2">{book.author}</p>
            <p className="text-blue-600 font-bold">${book.price}</p>
            <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
