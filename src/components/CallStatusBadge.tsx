import React from 'react';

interface CallStatusBadgeProps {
  status: string;
}

const CallStatusBadge: React.FC<CallStatusBadgeProps> = ({ status }) => {
  let bgColor = 'bg-gray-500';
  let textColor = 'text-white';
  
  switch (status.toLowerCase()) {
    case 'answer':
      bgColor = 'bg-green-500';
      break;
    case 'not answer':
      bgColor = 'bg-yellow-500';
      break;
    case 'not active':
      bgColor = 'bg-red-500';
      break;
    case 'voice mail':
      bgColor = 'bg-purple-500';
      break;
    case 'in progress':
      bgColor = 'bg-blue-500';
      break;
    case 'hang up':
      bgColor = 'bg-orange-500';
      break;
    default:
      bgColor = 'bg-gray-500';
  }

  return (
    <span className={`${bgColor} ${textColor} px-2 py-1 rounded text-xs font-medium`}>
      {status}
    </span>
  );
};

export default CallStatusBadge;