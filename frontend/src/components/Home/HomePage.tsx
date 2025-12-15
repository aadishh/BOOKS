'use client';

import HomeBooks from '../HomeBooks';
import HomeAudioBook from '../HomeAudioBook';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="text-4xl font-bold mb-6">Welcome to Bookstore</h1>
        <p className="text-gray-600 text-lg">
          Discover your next favorite book from our extensive collection
        </p>
      </section>
      
      <HomeBooks />
      <HomeAudioBook />
    </div>
  );
}
