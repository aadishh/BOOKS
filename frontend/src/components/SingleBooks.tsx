'use client';

import CustomImage from './CustomImage';
import type { Book } from '@/types';

interface SingleBooksProps {
  book: Book;
  onAddToCart?: (book: Book) => void;
}

export default function SingleBooks({ book, onAddToCart }: SingleBooksProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <CustomImage
        src={book.image}
        alt={book.title}
        width={200}
        height={300}
        className="w-full h-64 object-cover rounded mb-4"
      />
      
      <h3 className="font-bold text-lg mb-2 line-clamp-2">{book.title}</h3>
      <p className="text-gray-600 mb-2">{book.author}</p>
      
      {book.description && (
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{book.description}</p>
      )}
      
      <div className="flex justify-between items-center">
        <span className="text-blue-600 font-bold text-xl">${book.price}</span>
        
        {onAddToCart && (
          <button
            onClick={() => onAddToCart(book)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
