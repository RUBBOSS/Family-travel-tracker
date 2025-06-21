export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600">Page not found</p>
        <a href="/" className="mt-4 inline-block text-blue-500 hover:text-blue-600">
          Return Home
        </a>
      </div>
    </div>
  );
}
