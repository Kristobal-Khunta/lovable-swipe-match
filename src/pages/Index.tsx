
import AppLayout from '@/components/AppLayout';
import UserSelection from '@/components/UserSelection';
import { AppProvider, useApp } from '@/context/AppContext';

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
    <div className="container mx-auto py-8 px-4">
      {currentSession ? <AppLayout /> : <UserSelection />}
    </div>
  );
};

export default Index;
