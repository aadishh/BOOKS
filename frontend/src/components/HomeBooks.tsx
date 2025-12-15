'use client';

import { useEffect, useState } from 'react';
import { getBooks } from '@/lib/api';
import type { Book } from '@/types';
import CustomImage from './CustomImage';

export default function HomeBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      const data = await getBooks();
      if (data) {
        setBooks(data.slice(0, 6));
      }
      setLoading(false);
    };
    fetchBooks();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading books...</div>;
  }

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-6">Featured Books</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <div key={book._id} className="bg-white rounded-lg shadow p-4">
            <CustomImage
              src={book.image}
              alt={book.title}
              width={200}
              height={300}
              className="w-full h-64 object-cover rounded mb-4"
            />
            <h3 className="font-bold text-lg mb-2">{book.title}</h3>
            <p className="text-gray-600 mb-2">{book.author}</p>
            <p className="text-blue-600 font-bold">${book.price}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
