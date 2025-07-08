'use client';

import { useSearchParams } from 'next/navigation';
import HowItWorks from './HowItWorks';
import Features from './Feature';
import Roadmap from './Roadmap';
import FullPageError from '@/components/errors/FullPageError';

const MeetingSync = () => {
  const searchParams = useSearchParams();
  const option = searchParams?.get('option');

  const renderSection = () => {
    switch (option) {
      case 'features':
        return <Features />;
      case 'roadmap':
        return <Roadmap />;
      case 'how-it-works':
        return <HowItWorks />;
      default:
        return <FullPageError message='Wrong page detected. Someone maybe changed the route name or entered invalid page.' />;
    }
  };

  return (
      renderSection()
  );
};

export default MeetingSync;
