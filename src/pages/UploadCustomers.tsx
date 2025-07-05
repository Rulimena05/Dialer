import React, { useState, useCallback } from 'react';
import { Upload, FileText, Check, AlertCircle, Download } from 'lucide-react';
import Papa from 'papaparse';
import CustomerTable from '../components/CustomerTable';
import { useAutoDial } from '../contexts/AutoDialContext';
import { Customer } from '../types/Customer';
import { useNavigate } from 'react-router-dom';

const UploadCustomers = () => {
  const { loadCustomers, selectCustomers, customers } = useAutoDial();
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; message: string } | null>(null);
  const navigate = useNavigate();
  
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processCSV = useCallback((file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedCustomers = results.data.map((row: any, index) => {
            return {
              id: `customer-${index}`,
              caseId: row['Case ID'] || row['Case_Id'] || '',
              customerName: row['Customer name'] || row['Customer_Name'] || '',
              phoneNumber: row['PhoneNumber1'] || row['Phonenumber1'] || '',
              handel: row['HANDEL'] || row['Handel'] || '',
            } as Customer;
          }).filter((c: Customer) => c.caseId && c.phoneNumber);
          
          if (parsedCustomers.length === 0) {
            setUploadStatus({
              success: false,
              message: 'No valid customer data found in the CSV file',
            });
            return;
          }
          
          // Group customers by handel
          const customersByHandel = parsedCustomers.reduce((acc: { [key: string]: Customer[] }, customer) => {
            const handel = customer.handel.toLowerCase();
            if (!acc[handel]) {
              acc[handel] = [];
            }
            acc[handel].push(customer);
            return acc;
          }, {});

          // Load all customers
          loadCustomers(parsedCustomers);
          
          setUploadStatus({
            success: true,
            message: `Successfully loaded ${parsedCustomers.length} customers:\n${
              Object.entries(customersByHandel)
                .map(([handel, customers]) => `${handel}: ${customers.length} customers`)
                .join('\n')
            }`,
          });

          // Navigate to the first handel's customer list
          const firstHandel = Object.keys(customersByHandel)[0];
          if (firstHandel) {
            navigate(`/customers/${firstHandel}`);
          }
        } catch (error) {
          console.error('Error processing CSV:', error);
          setUploadStatus({
            success: false,
            message: 'Error processing CSV file. Please check the format.',
          });
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setUploadStatus({
          success: false,
          message: 'Error parsing CSV file: ' + error.message,
        });
      }
    });
  }, [loadCustomers, navigate]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== 'text/csv') {
        setUploadStatus({
          success: false,
          message: 'Please upload a CSV file',
        });
        return;
      }
      
      processCSV(file);
    }
  }, [processCSV]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'text/csv') {
        setUploadStatus({
          success: false,
          message: 'Please upload a CSV file',
        });
        return;
      }
      
      processCSV(file);
    }
  }, [processCSV]);

  const handleSelectCustomers = useCallback((selected: Customer[]) => {
    selectCustomers(selected);
  }, [selectCustomers]);

  const downloadTemplate = useCallback(() => {
    const template = [
      {
        'Case ID': '118699466',
        'Customer name': 'John Doe',
        'PhoneNumber1': '628116500309',
        'HANDEL': 'BAF'
      },
      {
        'Case ID': '118699467',
        'Customer name': 'Jane Smith',
        'PhoneNumber1': '628116500310',
        'HANDEL': 'Akulaku'
      },
      {
        'Case ID': '118699468',
        'Customer name': 'Bob Johnson',
        'PhoneNumber1': '628116500311',
        'HANDEL': 'Traveloka'
      }
    ];
    
    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'customer-template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Upload Customers</h1>
        <button
          onClick={downloadTemplate}
          className="px-4 py-2 bg-gray-700 text-white rounded flex items-center gap-2 hover:bg-gray-600 transition"
        >
          <Download size={16} />
          Download Template
        </button>
      </div>
      
      <div className="mb-8">
        <div 
          className={`border-2 border-dashed p-8 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-500 bg-opacity-10' 
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input
            type="file"
            id="file-upload"
            accept=".csv"
            onChange={handleChange}
            className="hidden"
          />
          
          <Upload size={48} className="text-gray-400 mb-4" />
          <p className="text-lg font-medium mb-2">
            Drop your CSV file here or click to browse
          </p>
          <p className="text-sm text-gray-400 text-center max-w-md">
            Upload a CSV file containing customer data with columns: 
            Case ID, Customer name, PhoneNumber1, HANDEL
          </p>
        </div>
      </div>
      
      {uploadStatus && (
        <div 
          className={`mb-6 p-4 rounded-lg ${
            uploadStatus.success ? 'bg-green-900 bg-opacity-20' : 'bg-red-900 bg-opacity-20'
          }`}
        >
          <div className="flex items-start">
            {uploadStatus.success ? (
              <Check className="text-green-400 mr-3 mt-0.5 flex-shrink-0" size={20} />
            ) : (
              <AlertCircle className="text-red-400 mr-3 mt-0.5 flex-shrink-0" size={20} />
            )}
            <div>
              <p className={`font-medium ${uploadStatus.success ? 'text-green-400' : 'text-red-400'}`}>
                {uploadStatus.success ? 'Success' : 'Error'}
              </p>
              <pre className="text-white text-sm whitespace-pre-wrap">{uploadStatus.message}</pre>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-gray-800 rounded-lg p-5 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <FileText className="mr-2" size={20} />
            Customer Data
          </h2>
          <p className="text-sm text-gray-400">
            {customers.length} customers loaded
          </p>
        </div>
        
        {customers.length > 0 ? (
          <CustomerTable customers={customers} onSelectCustomers={handleSelectCustomers} />
        ) : (
          <div className="text-center py-8 text-gray-400">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No customer data loaded</p>
            <p className="text-sm mt-1">Upload a CSV file to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadCustomers;