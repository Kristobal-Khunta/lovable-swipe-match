
import { User } from '@/types';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Check, X } from 'lucide-react';

interface UserCardProps {
  user: User;
  onSwipe: (userId: number, isLike: boolean) => void;
  loading?: boolean;
}

const UserCard = ({ user, onSwipe, loading = false }: UserCardProps) => {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const handleSwipe = (isLike: boolean) => {
    if (loading) return;
    
    // Set the swipe direction for animation
    setSwipeDirection(isLike ? 'right' : 'left');
    
    // Delay the actual swipe action to allow the animation to play
    setTimeout(() => {
      onSwipe(user.id, isLike);
      setSwipeDirection(null);
    }, 300);
  };

  const getCardClass = () => {
    if (swipeDirection === 'left') {
      return 'swipe-card swiping-left';
    } else if (swipeDirection === 'right') {
      return 'swipe-card swiping-right';
    }
    return 'swipe-card';
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${getCardClass()}`}>
      <CardHeader>
        <CardTitle className="text-2xl">{user.first_name} {user.last_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{user.description}</CardDescription>
      </CardContent>
      <CardFooter className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          size="lg" 
          className="rounded-full w-16 h-16 border-dislike text-dislike hover:bg-dislike hover:text-white"
          onClick={() => handleSwipe(false)}
          disabled={loading}
        >
          <X className="h-8 w-8" />
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="rounded-full w-16 h-16 border-like text-like hover:bg-like hover:text-white"
          onClick={() => handleSwipe(true)}
          disabled={loading}
        >
          <Check className="h-8 w-8" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserCard;
