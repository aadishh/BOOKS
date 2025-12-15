'use client';

export default function HomeAudioBook() {
  const audioBooks = [
    { id: 1, title: 'Audio Book 1', image: '/images/audioB1.jpg' },
    { id: 2, title: 'Audio Book 2', image: '/images/audioB2.jpg' },
    { id: 3, title: 'Audio Book 3', image: '/images/audioB3.jpg' },
    { id: 4, title: 'Audio Book 4', image: '/images/audioB4.jpg' },
  ];

  return (
    <section>
      <h2 className="text-3xl font-bold mb-6">Audio Books</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {audioBooks.map((book) => (
          <div key={book.id} className="bg-white rounded-lg shadow p-4">
            <div className="w-full h-48 bg-gray-200 rounded mb-4 flex items-center justify-center">
              <span className="text-gray-500">{book.title}</span>
            </div>
            <h3 className="font-bold text-center">{book.title}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}
