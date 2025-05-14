
import { useApp } from '@/context/AppContext';
import UserCard from './UserCard';

const SwipeView = () => {
  const { candidate, submitSwipe, loadingSwipe } = useApp();

  if (loadingSwipe && !candidate) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-medium">No more profiles to show</h3>
        <p className="text-muted-foreground mt-2">Check your matches or try again later!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <UserCard 
        user={candidate} 
        onSwipe={submitSwipe}
        loading={loadingSwipe}
      />
    </div>
  );
};

export default SwipeView;
