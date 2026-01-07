import React, {useEffect} from 'react';
import {useLocation} from '@docusaurus/router';

function initSnack() {
  if (typeof window !== 'undefined' && (window as any).ExpoSnack) {
    (window as any).ExpoSnack.initialize();
  }
}

export default function Root({children}: {children: React.ReactNode}): JSX.Element {
  const location = useLocation();

  useEffect(() => {
    // Initialize immediately if ExpoSnack is ready
    initSnack();

    // Also wait a bit for the script to load if it hasn't yet
    const timer = setTimeout(initSnack, 1000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return <>{children}</>;
}
