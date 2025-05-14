
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
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Select Your Profile</h2>
      
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <Card key={user.id} className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{user.first_name} {user.last_name}</CardTitle>
                {user.specialization && (
                  <CardDescription>{user.specialization}</CardDescription>
                )}
                {user.activity && (
                  <CardDescription className="font-medium">{user.activity}</CardDescription>
                )}
              </CardHeader>
              <CardFooter className="mt-auto">
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
