import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, X, MessageCircle, Save } from 'lucide-react';
import CustomerTable from '../components/CustomerTable';
import { useAutoDial } from '../contexts/AutoDialContext';
import { Customer } from '../types/Customer';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-toastify';

interface CallReport {
  customerId: string;
  status: string;
  notes: string;
  followUpDate?: string;
}

const CustomerList = () => {
  const { handel } = useParams<{ handel: string }>();
  const { customers, selectCustomers } = useAutoDial();
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [report, setReport] = useState<CallReport>({
    customerId: '',
    status: 'pending',
    notes: '',
  });
  
  useEffect(() => {
    const filtered = customers.filter(customer => 
      customer.handel.toLowerCase() === handel?.toLowerCase()
    );
    setFilteredCustomers(filtered);
  }, [customers, handel]);

  const handleSelectCustomers = (selected: Customer[]) => {
    selectCustomers(selected);
  };

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
    setReport({
      customerId: customer.id,
      status: 'pending',
      notes: '',
    });
  };

  const handleWhatsAppClick = (phoneNumber: string) => {
    // Format phone number for WhatsApp
    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber.slice(1) : phoneNumber;
    window.open(`https://web.whatsapp.com/send?phone=${formattedNumber}`, '_blank');
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('call_reports')
        .insert([{
          customer_id: report.customerId,
          status: report.status,
          notes: report.notes,
          follow_up_date: report.followUpDate,
          created_at: new Date().toISOString(),
        }]);

      if (error) throw error;

      toast.success('Report saved successfully');
      setShowReportModal(false);
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('Failed to save report');
    }
  };

  const capitalizedHandel = handel?.charAt(0).toUpperCase() + handel?.slice(1).toLowerCase();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">{capitalizedHandel} Customers</h1>
          <p className="text-gray-400">
            {filteredCustomers.length} customers available
          </p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <CustomerTable 
          customers={filteredCustomers} 
          onSelectCustomers={handleSelectCustomers}
          onCustomerClick={handleCustomerClick}
        />
      </div>

      {/* Customer Details Modal */}
      {showModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Customer Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Case ID</label>
                <p className="text-lg">{selectedCustomer.caseId}</p>
              </div>

              <div>
                <label className="text-sm text-gray-400">Customer Name</label>
                <p className="text-lg">{selectedCustomer.customerName}</p>
              </div>

              <div>
                <label className="text-sm text-gray-400">Phone Number</label>
                <div className="flex items-center gap-3">
                  <p className="text-lg">{selectedCustomer.phoneNumber}</p>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${selectedCustomer.phoneNumber}`}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      <Phone size={16} />
                      Call
                    </a>
                    <button
                      onClick={() => handleWhatsAppClick(selectedCustomer.phoneNumber)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                    >
                      <MessageCircle size={16} />
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400">Handel</label>
                <p className="text-lg">{selectedCustomer.handel}</p>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Add Call Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Call Report</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Status
                </label>
                <select
                  value={report.status}
                  onChange={(e) => setReport({ ...report, status: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="not_reached">Not Reached</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Notes
                </label>
                <textarea
                  value={report.notes}
                  onChange={(e) => setReport({ ...report, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                ></textarea>
              </div>

              {report.status === 'follow_up' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="datetime-local"
                    value={report.followUpDate}
                    onChange={(e) => setReport({ ...report, followUpDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Save size={16} />
                  Save Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;