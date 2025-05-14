
import { useApp } from '@/context/AppContext';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import SwipeView from './SwipeView';
import MatchList from './MatchList';

const AppLayout = () => {
  const { currentUser, endSession } = useApp();

  return (
    <div className="container max-w-md mx-auto py-4 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">SwipeMate</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {currentUser?.first_name} {currentUser?.last_name}
          </span>
          <Button variant="outline" size="sm" onClick={endSession}>
            Logout
          </Button>
        </div>
      </div>

      <Tabs defaultValue="swipe" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="swipe">Discover</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
        </TabsList>
        <TabsContent value="swipe">
          <SwipeView />
        </TabsContent>
        <TabsContent value="matches">
          <MatchList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppLayout;
