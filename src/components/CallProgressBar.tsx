import React from 'react';

interface CallProgressBarProps {
  total: number;
  completed: number;
  inProgress: number;
  answered: number;
  notAnswered: number;
  notActive: number;
}

const CallProgressBar: React.FC<CallProgressBarProps> = ({
  total,
  completed,
  inProgress,
  answered,
  notAnswered,
  notActive,
}) => {
  const completedPercent = (completed / total) * 100;
  const inProgressPercent = (inProgress / total) * 100;

  const answeredPercent = (answered / total) * 100;
  const notAnsweredPercent = (notAnswered / total) * 100;
  const notActivePercent = (notActive / total) * 100;
  
  return (
    <div className="mb-6 bg-gray-800 rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-medium mb-3">Calling Progress</h3>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Overall Progress</span>
          <span>{Math.round(completedPercent)}% ({completed}/{total})</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-blue-500 h-4 transition-all duration-500 ease-out" 
            style={{ width: `${completedPercent}%` }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Answered</span>
            <span>{answered}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-green-500 h-3" 
              style={{ width: `${answeredPercent}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Not Answered</span>
            <span>{notAnswered}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-yellow-500 h-3" 
              style={{ width: `${notAnsweredPercent}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Not Active</span>
            <span>{notActive}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-red-500 h-3" 
              style={{ width: `${notActivePercent}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex flex-wrap gap-3">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm text-gray-300">Answered</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
          <span className="text-sm text-gray-300">Not Answered</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <span className="text-sm text-gray-300">Not Active</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-sm text-gray-300">In Progress</span>
        </div>
      </div>
    </div>
  );
};

export default CallProgressBar;