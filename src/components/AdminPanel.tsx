
import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import apiService from '@/services/api';
import { toast } from 'sonner';
import { User } from '@/types';

const AdminPanel = ({ onUsersLoaded }: { onUsersLoaded: () => void }) => {
  const [userJson, setUserJson] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleLoad = async () => {
    setLoading(true);
    try {
      let users: User[];
      try {
        users = JSON.parse(userJson);
        if (!Array.isArray(users)) {
          throw new Error('Users data must be an array');
        }
      } catch (e) {
        toast.error('Invalid JSON format');
        return;
      }

      const response = await apiService.bulkLoadUsers(users);
      toast.success(`Successfully loaded ${response.loaded} users`);
      onUsersLoaded();
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
      <p className="text-sm text-gray-600 mb-4">
        Paste JSON array of users to bulk load:
      </p>
      <Textarea
        value={userJson}
        onChange={(e) => setUserJson(e.target.value)}
        placeholder='[{"id": 1, "first_name": "Alice", "last_name": "Smith", "description": "Loves hiking and music."}, ...]'
        className="mb-4 h-48 font-mono text-sm"
      />
      <Button onClick={handleLoad} disabled={loading} className="w-full">
        {loading ? 'Loading...' : 'Load Users'}
      </Button>
    </div>
  );
};

export default AdminPanel;
