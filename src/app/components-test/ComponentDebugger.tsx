'use client';

import React, { useEffect } from 'react';

interface ComponentDebuggerProps {
  componentToDebug: React.ReactNode;
}

export default function ComponentDebugger({
  componentToDebug,
}: ComponentDebuggerProps) {
  useEffect(() => {
    console.log('Component being debugged:', componentToDebug);
  }, [componentToDebug]);

  return null;
}
