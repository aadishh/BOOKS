'use client';

import { useState } from 'react';
import CustomImage from '../CustomImage';

export default function SingleBook() {
  const [book] = useState({
    _id: '1',
    title: 'Sample Book',
    author: 'Author Name',
    description: 'This is a sample book description.',
    price: 29.99,
    image: '/images/book1.jpg',
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <CustomImage
              src={book.image}
              alt={book.title}
              width={400}
              height={600}
              className="w-full rounded-lg"
            />
          </div>
          
          <div>
            <h1 className="text-4xl font-bold mb-4">{book.title}</h1>
            <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
            <p className="text-3xl text-blue-600 font-bold mb-6">${book.price}</p>
            <p className="text-gray-700 mb-6">{book.description}</p>
            
            <button className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 w-full">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
