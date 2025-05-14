
import { useApp } from '@/context/AppContext';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

const UserSelection = () => {
  const { users, startSession, loading, loadUsers } = useApp();
  
  useEffect(() => {
    loadUsers();
  }, []);

  const handleSelectUser = async (userId: number) => {
    await startSession(userId);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Select Your Profile</h2>
      
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader className="pb-2">
                <CardTitle>{user.first_name} {user.last_name}</CardTitle>
              </CardHeader>
              <CardFooter>
                <Button 
                  onClick={() => handleSelectUser(user.id)}
                  disabled={loading}
                  className="w-full"
                >
                  Select
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSelection;
