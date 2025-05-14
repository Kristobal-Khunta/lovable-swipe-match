
import { useApp } from '@/context/AppContext';
import AppLayout from '@/components/AppLayout';
import UserSelection from '@/components/UserSelection';
import { AppProvider } from '@/context/AppContext';

const Index = () => {
  return (
    <AppProvider>
      <div className="min-h-screen bg-background">
        <MainContent />
      </div>
    </AppProvider>
  );
};

const MainContent = () => {
  const { currentSession } = useApp();

  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      {currentSession ? <AppLayout /> : <UserSelection />}
    </div>
  );
};

export default Index;
