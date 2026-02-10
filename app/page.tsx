export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">Dingran Dai</h1>
        <p className="text-xl text-gray-600 mb-2">Portfolio Website</p>
        <p className="text-sm text-gray-400">Website is working!</p>
        <div className="mt-8">
          <a 
            href="/projects" 
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            View Projects
          </a>
        </div>
      </div>
    </div>
  );
}