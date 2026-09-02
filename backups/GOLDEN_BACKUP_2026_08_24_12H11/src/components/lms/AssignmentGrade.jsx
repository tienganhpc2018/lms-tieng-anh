import React from 'react';
import GradingDashboard from './GradingDashboard';

export default function AssignmentGrade({ activityId, activityTitle }) {
  return <GradingDashboard activityId={activityId} activityTitle={activityTitle} />;
}
