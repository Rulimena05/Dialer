import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { Customer } from '../types/Customer';
import { CallRecord } from '../types/CallRecord';
import { useMicroSip } from './MicroSipContext';

interface AutoDialContextType {
  customers: Customer[];
  selectedCustomers: Customer[];
  callHistory: CallRecord[];
  isDialing: boolean;
  currentCall: CallRecord | null;
  loadCustomers: (newCustomers: Customer[]) => void;
  selectCustomers: (selected: Customer[]) => void;
  startAutoDial: () => Promise<void>;
  stopAutoDial: () => void;
  loadCallHistory: (history: CallRecord[]) => void;
}

const AutoDialContext = createContext<AutoDialContextType | undefined>(undefined);

export const useAutoDial = () => {
  const context = useContext(AutoDialContext);
  if (context === undefined) {
    throw new Error('useAutoDial must be used within an AutoDialProvider');
  }
  return context;
};

interface AutoDialProviderProps {
  children: ReactNode;
}

export const AutoDialProvider: React.FC<AutoDialProviderProps> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [isDialing, setIsDialing] = useState(false);
  const [currentCall, setCurrentCall] = useState<CallRecord | null>(null);
  
  const dialingRef = useRef<boolean>(false);
  const { makeCall, endCall, connected } = useMicroSip();

  const loadCustomers = (newCustomers: Customer[]) => {
    setCustomers(newCustomers);
    toast.success(`Loaded ${newCustomers.length} customers`);
  };

  const selectCustomers = (selected: Customer[]) => {
    setSelectedCustomers(selected);
  };

  const loadCallHistory = (history: CallRecord[]) => {
    setCallHistory(history);
  };

  const startAutoDial = async () => {
    if (!connected) {
      toast.error('MicroSip is not connected. Please connect before dialing.');
      return;
    }
    
    if (selectedCustomers.length === 0) {
      toast.error('No customers selected for auto-dialing');
      return;
    }

    setIsDialing(true);
    dialingRef.current = true;
    
    toast.info(`Starting auto-dial for ${selectedCustomers.length} customers`);
    
    let index = 0;
    const processNextCall = async () => {
      if (!dialingRef.current || index >= selectedCustomers.length) {
        setIsDialing(false);
        dialingRef.current = false;
        setCurrentCall(null);
        toast.success('Auto-dialing completed');
        return;
      }

      const customer = selectedCustomers[index];
      index++;
      
      // Create a call record
      const callRecord: CallRecord = {
        id: `call-${Date.now()}-${customer.caseId}`,
        caseId: customer.caseId,
        customerName: customer.customerName,
        phoneNumber: customer.phoneNumber,
        handel: customer.handel,
        callDate: new Date().toISOString(),
        startTime: new Date().toISOString(),
        endTime: '',
        duration: 0,
        status: 'in progress'
      };
      
      setCurrentCall(callRecord);
      setCallHistory(prev => [...prev, callRecord]);
      
      try {
        // Make the call
        await makeCall(customer.phoneNumber);
        
        // Simulate call status detection
        // In a real implementation, this would be handled by events from the MicroSip API
        const callDuration = Math.floor(Math.random() * 10) + 1;
        const callStatuses = ['Answer', 'Not Answer', 'Not Active', 'Voice Mail'];
        const randomStatus = callStatuses[Math.floor(Math.random() * callStatuses.length)];
        
        // Wait for call to connect or timeout
        await new Promise(resolve => setTimeout(resolve, callDuration * 1000));
        
        // Update call record with result
        const endTime = new Date().toISOString();
        const updatedCallRecord = {
          ...callRecord,
          endTime,
          duration: callDuration,
          status: randomStatus
        };
        
        setCallHistory(prev => 
          prev.map(record => 
            record.id === callRecord.id ? updatedCallRecord : record
          )
        );
        
        // If call was answered, hang up automatically as per requirements
        if (randomStatus === 'Answer') {
          endCall();
        }
        
        // Wait 5 seconds before next call as per requirements
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Process the next call
        if (dialingRef.current) {
          processNextCall();
        }
      } catch (error) {
        console.error('Error during auto-dial:', error);
        
        // Update call record with error
        const endTime = new Date().toISOString();
        const updatedCallRecord = {
          ...callRecord,
          endTime,
          duration: 0,
          status: 'Error'
        };
        
        setCallHistory(prev => 
          prev.map(record => 
            record.id === callRecord.id ? updatedCallRecord : record
          )
        );
        
        // Continue with next call despite error
        await new Promise(resolve => setTimeout(resolve, 5000));
        if (dialingRef.current) {
          processNextCall();
        }
      }
    };
    
    // Start the process
    processNextCall();
  };

  const stopAutoDial = () => {
    dialingRef.current = false;
    setIsDialing(false);
    setCurrentCall(null);
    endCall();
    toast.info('Auto-dialing stopped');
  };

  return (
    <AutoDialContext.Provider
      value={{
        customers,
        selectedCustomers,
        callHistory,
        isDialing,
        currentCall,
        loadCustomers,
        selectCustomers,
        startAutoDial,
        stopAutoDial,
        loadCallHistory,
      }}
    >
      {children}
    </AutoDialContext.Provider>
  );
};