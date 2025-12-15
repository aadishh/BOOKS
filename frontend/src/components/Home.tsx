'use client';

import HomeBooks from './HomeBooks';
import HomeAudioBook from './HomeAudioBook';
import Bio from './Bio';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4 text-gray-800">
          Welcome to Bookstore
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover your next favorite book from our extensive collection
        </p>
      </section>

      <div className="mb-12">
        <Bio />
      </div>
      
      <div className="mb-12">
        <HomeBooks />
      </div>
      
      <div>
        <HomeAudioBook />
      </div>
    </div>
  );
}
