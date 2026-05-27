
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex justify-center mb-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent sm:text-3xl">
              CareerConnect
            </h1>
            <p className="text-gray-600 mt-2">Your Gateway to Great Careers</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
