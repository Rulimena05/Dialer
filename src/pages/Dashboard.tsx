import React, { useMemo } from 'react';
import { Play, Square, Phone } from 'lucide-react';
import CallProgressBar from '../components/CallProgressBar';
import CallStatusBadge from '../components/CallStatusBadge';
import { useAutoDial } from '../contexts/AutoDialContext';
import { useMicroSip } from '../contexts/MicroSipContext';

const Dashboard = () => {
  const { 
    selectedCustomers, 
    callHistory, 
    isDialing, 
    currentCall,
    startAutoDial, 
    stopAutoDial 
  } = useAutoDial();
  
  const { connected } = useMicroSip();
  
  const stats = useMemo(() => {
    const total = selectedCustomers.length;
    const completed = callHistory.filter(record => 
      record.status !== 'in progress' && 
      selectedCustomers.some(c => c.caseId === record.caseId)
    ).length;
    
    const inProgress = isDialing ? 1 : 0;
    
    const answered = callHistory.filter(record => 
      record.status === 'Answer' &&
      selectedCustomers.some(c => c.caseId === record.caseId)
    ).length;
    
    const notAnswered = callHistory.filter(record => 
      record.status === 'Not Answer' &&
      selectedCustomers.some(c => c.caseId === record.caseId)
    ).length;
    
    const notActive = callHistory.filter(record => 
      (record.status === 'Not Active' || record.status === 'Voice Mail') &&
      selectedCustomers.some(c => c.caseId === record.caseId)
    ).length;
    
    return {
      total,
      completed,
      inProgress,
      answered,
      notAnswered,
      notActive
    };
  }, [selectedCustomers, callHistory, isDialing]);
  
  const recentCalls = useMemo(() => {
    return [...callHistory]
      .filter(call => call.status !== 'in progress')
      .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())
      .slice(0, 5);
  }, [callHistory]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
          <p className="text-gray-400">
            {selectedCustomers.length} customers selected for auto-dialing
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <button
            onClick={startAutoDial}
            disabled={isDialing || selectedCustomers.length === 0 || !connected}
            className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2 hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={16} />
            Start Auto-Dial
          </button>
          <button
            onClick={stopAutoDial}
            disabled={!isDialing}
            className="px-4 py-2 bg-red-600 text-white rounded flex items-center gap-2 hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Square size={16} />
            Stop
          </button>
        </div>
      </div>

      <CallProgressBar 
        total={stats.total} 
        completed={stats.completed}
        inProgress={stats.inProgress}
        answered={stats.answered}
        notAnswered={stats.notAnswered}
        notActive={stats.notActive}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-5 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Total Customers</h3>
            <div className="bg-blue-500 bg-opacity-20 p-2 rounded">
              <Phone size={20} className="text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{selectedCustomers.length}</p>
          <p className="text-gray-400 text-sm">Selected for auto-dialing</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-5 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Completed Calls</h3>
            <div className="bg-green-500 bg-opacity-20 p-2 rounded">
              <Phone size={20} className="text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.completed}</p>
          <p className="text-gray-400 text-sm">
            {stats.total > 0 
              ? `${Math.round((stats.completed / stats.total) * 100)}% of total` 
              : 'No customers selected'}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-5 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Success Rate</h3>
            <div className="bg-yellow-500 bg-opacity-20 p-2 rounded">
              <Phone size={20} className="text-yellow-400" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">
            {stats.completed > 0 
              ? `${Math.round((stats.answered / stats.completed) * 100)}%` 
              : '0%'}
          </p>
          <p className="text-gray-400 text-sm">Calls answered successfully</p>
        </div>
      </div>
      
      {currentCall && (
        <div className="bg-blue-900 bg-opacity-20 border border-blue-800 rounded-lg p-4 mb-8 animate-pulse">
          <h3 className="text-lg font-medium mb-2 flex items-center">
            <Phone className="mr-2 text-blue-400" size={20} />
            Current Call
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400">Customer</p>
              <p className="font-medium">{currentCall.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Phone</p>
              <p className="font-medium">{currentCall.phoneNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Started</p>
              <p className="font-medium">
                {new Date(currentCall.startTime).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <CallStatusBadge status={currentCall.status} />
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-gray-800 rounded-lg p-5 shadow-md">
        <h3 className="text-lg font-medium mb-4">Recent Calls</h3>
        
        {recentCalls.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {recentCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3 text-sm">{call.customerName}</td>
                    <td className="px-4 py-3 text-sm">{call.phoneNumber}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(call.endTime).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 text-sm">{call.duration} sec</td>
                    <td className="px-4 py-3 text-sm">
                      <CallStatusBadge status={call.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400">
            No call history available yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;