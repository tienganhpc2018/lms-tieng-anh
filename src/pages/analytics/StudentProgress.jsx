import React from 'react';
import { TeacherAnalytics } from './TeacherAnalytics';

export const StudentProgress = () => {
  // Reuses analytics component with role-aware filters
  return <TeacherAnalytics />;
};
