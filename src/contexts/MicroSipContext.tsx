import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-toastify';

interface MicroSipContextType {
  connected: boolean;
  calling: boolean;
  connectionInfo: {
    server: string;
    proxy: string;
    username: string;
    domain: string;
    login: string;
  };
  connect: () => Promise<void>;
  disconnect: () => void;
  makeCall: (phoneNumber: string) => Promise<void>;
  endCall: () => void;
  callStatus: string | null;
}

const MicroSipContext = createContext<MicroSipContextType | undefined>(undefined);

export const useMicroSip = () => {
  const context = useContext(MicroSipContext);
  if (context === undefined) {
    throw new Error('useMicroSip must be used within a MicroSipProvider');
  }
  return context;
};

interface MicroSipProviderProps {
  children: ReactNode;
}

export const MicroSipProvider: React.FC<MicroSipProviderProps> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [calling, setCalling] = useState(false);
  const [callStatus, setCallStatus] = useState<string | null>(null);
  
  const connectionInfo = {
    server: '103.22.251.101',
    proxy: '103.22.251.101',
    username: 'Admin',
    domain: '103.22.251.101',
    login: 'peLit4_pks',
    password: 'GDUgy72fgWG89hN',
  };

  // This is a simulation of connecting to MicroSip
  // In a real implementation, you would use the actual MicroSip API
  const connect = async () => {
    try {
      setConnected(false);
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful connection
      setConnected(true);
      toast.success('Connected to MicroSip successfully');
    } catch (error) {
      console.error('Failed to connect to MicroSip:', error);
      toast.error('Failed to connect to MicroSip');
      setConnected(false);
    }
  };

  const disconnect = () => {
    setConnected(false);
    setCalling(false);
    setCallStatus(null);
    toast.info('Disconnected from MicroSip');
  };

  const makeCall = async (phoneNumber: string) => {
    if (!connected) {
      toast.error('MicroSip is not connected');
      return;
    }
    
    try {
      setCalling(true);
      setCallStatus('dialing');
      toast.info(`Calling ${phoneNumber}...`);
      
      // Simulate call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate call status
      const statuses = ['Answer', 'Not Answer', 'Not Active', 'Voice Mail'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setCallStatus(randomStatus);
      
      if (randomStatus === 'Answer') {
        // Simulate call duration for answered calls
        await new Promise(resolve => setTimeout(resolve, 3000));
        endCall();
      }
      
    } catch (error) {
      console.error('Error making call:', error);
      setCalling(false);
      setCallStatus(null);
      toast.error('Failed to make call');
    }
  };

  const endCall = () => {
    if (calling) {
      setCalling(false);
      setCallStatus(null);
      toast.info('Call ended');
    }
  };

  // Connect automatically when the component mounts
  useEffect(() => {
    connect();
    
    // Cleanup on unmount
    return () => {
      if (connected) {
        disconnect();
      }
    };
  }, []);

  return (
    <MicroSipContext.Provider
      value={{
        connected,
        calling,
        connectionInfo,
        connect,
        disconnect,
        makeCall,
        endCall,
        callStatus,
      }}
    >
      {children}
    </MicroSipContext.Provider>
  );
};