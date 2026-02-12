import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

export default function ProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();

  const isOwnProfile = user?.id === id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900">
      <Header />

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Avatar + Name */}
          <div className="flex items-center gap-5 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-3xl shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-dark-900">{user?.name}</h1>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Full Name</p>
              <p className="text-dark-900 font-medium">{user?.name}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="text-dark-900 font-medium">{user?.email}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">User ID</p>
              <p className="text-dark-900 font-medium font-mono text-sm">{id}</p>
            </div>
          </div>

          {/* Actions */}
          {isOwnProfile && (
            <div className="mt-8 flex gap-4">
              <Link to="/dashboard" className="btn-primary text-center">
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
