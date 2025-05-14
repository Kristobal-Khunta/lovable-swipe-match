
import { useApp } from '@/context/AppContext';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const MatchList = () => {
  const { matches, getMatches, loading, resetMatches } = useApp();
  
  useEffect(() => {
    getMatches();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Matches</h2>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={resetMatches}
          disabled={loading || matches.length === 0}
          className="flex items-center gap-1"
        >
          <Trash2 size={16} />
          Reset Matches
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : matches.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <CardDescription>No matches yet. Keep swiping!</CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <Card key={match.user_id}>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">{match.first_name} {match.last_name}</CardTitle>
                <CardDescription>
                  Matched {formatDistanceToNow(new Date(match.matched_at))} ago
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchList;
