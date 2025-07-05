import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { supabase, checkSupabaseConnection } from '../lib/supabaseClient';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

interface CallReport {
  id: string;
  customer_id: string;
  status: string;
  notes: string;
  follow_up_date: string | null;
  created_at: string;
  customer: {
    case_id: string;
    customer_name: string;
    phone_number: string;
    handel: string;
  };
}

const ReportCall = () => {
  const [reports, setReports] = useState<CallReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const initializeConnection = async () => {
      setLoading(true);
      setError(null);
      const isConnected = await checkSupabaseConnection();
      setConnectionStatus(isConnected);
      
      if (isConnected) {
        fetchReports();
      } else {
        setError('Unable to connect to the database. Please check your internet connection and ensure your Supabase configuration is correct.');
        setLoading(false);
      }
    };

    initializeConnection();
  }, []);

  const fetchReports = async () => {
    try {
      setError(null);
      console.log('Fetching reports from Supabase...');
      
      const { data, error: supabaseError } = await supabase
        .from('call_reports')
        .select(`
          *,
          customer:customers (
            case_id,
            customer_name,
            phone_number,
            handel
          )
        `)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw new Error(`Database error: ${supabaseError.message}`);
      }

      console.log('Reports fetched successfully:', data?.length || 0, 'records');
      setReports(data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error details:', error);
      setError(`Failed to fetch reports: ${errorMessage}`);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    setError(null);
    const isConnected = await checkSupabaseConnection();
    if (isConnected) {
      await fetchReports();
    } else {
      setError('Still unable to connect. Please check your internet connection and Supabase configuration.');
      setRetrying(false);
    }
  };

  const exportToExcel = () => {
    const exportData = reports.map(report => ({
      'Case ID': report.customer?.case_id,
      'Customer Name': report.customer?.customer_name,
      'Phone Number': report.customer?.phone_number,
      'Handel': report.customer?.handel,
      'Status': report.status,
      'Notes': report.notes,
      'Follow-up Date': report.follow_up_date ? format(new Date(report.follow_up_date), 'yyyy-MM-dd HH:mm') : '',
      'Created At': format(new Date(report.created_at), 'yyyy-MM-dd HH:mm'),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Call Reports');
    XLSX.writeFile(wb, `call-reports-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">
          {retrying ? 'Retrying connection...' : 'Loading reports...'}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-400 text-center max-w-md">{error}</div>
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {retrying ? 'Retrying...' : 'Retry Connection'}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Call Reports</h1>
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Download size={16} />
          Export to Excel
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Notes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Follow-up</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{report.customer?.customer_name}</div>
                    <div className="text-sm text-gray-400">{report.customer?.case_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{report.customer?.phone_number}</div>
                    <div className="text-sm text-gray-400">{report.customer?.handel}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      report.status === 'completed' ? 'bg-green-900 text-green-200' :
                      report.status === 'follow_up' ? 'bg-yellow-900 text-yellow-200' :
                      report.status === 'not_reached' ? 'bg-red-900 text-red-200' :
                      'bg-blue-900 text-blue-200'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300">{report.notes}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {report.follow_up_date ? format(new Date(report.follow_up_date), 'yyyy-MM-dd HH:mm') : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {format(new Date(report.created_at), 'yyyy-MM-dd HH:mm')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportCall;