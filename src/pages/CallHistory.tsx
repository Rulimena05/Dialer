import React, { useState } from 'react';
import { Download, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { CSVLink } from 'react-csv';
import CallHistoryTable from '../components/CallHistoryTable';
import { useAutoDial } from '../contexts/AutoDialContext';

const CallHistory = () => {
  const { callHistory } = useAutoDial();
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Prepare data for CSV export
  const csvData = callHistory.map(record => ({
    Case_Id: record.caseId,
    Customer_Name: record.customerName,
    Phonenumber1: record.phoneNumber,
    Handel: record.handel,
    Call_Date: format(new Date(record.callDate), 'yyyy-MM-dd'),
    Start_Time: format(new Date(record.startTime), 'HH:mm:ss'),
    End_Time: record.endTime ? format(new Date(record.endTime), 'HH:mm:ss') : '',
    Duration: record.duration,
    Respons_Code: record.status
  }));

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-semibold">Call History</h1>
        
        <div className="mt-4 md:mt-0 flex gap-2">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="px-4 py-2 bg-gray-700 text-white rounded flex items-center gap-2 hover:bg-gray-600 transition"
          >
            <Filter size={16} />
            Filter
          </button>
          
          <CSVLink 
            data={csvData} 
            filename={`call-history-${format(new Date(), 'yyyy-MM-dd')}.csv`}
            className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Download size={16} />
            Export CSV
          </CSVLink>
        </div>
      </div>
      
      <CallHistoryTable callHistory={callHistory} />
    </div>
  );
};

export default CallHistory;