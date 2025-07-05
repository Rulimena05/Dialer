import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useMicroSip } from '../contexts/MicroSipContext';

const MicroSipStatus = () => {
  const { connected, connectionInfo, connect } = useMicroSip();

  return (
    <div className="flex items-center gap-2">
      {connected ? (
        <>
          <Wifi size={18} className="text-green-400" />
          <span className="text-sm">
            Connected to MicroSip ({connectionInfo.username}@{connectionInfo.domain})
          </span>
        </>
      ) : (
        <>
          <WifiOff size={18} className="text-red-400" />
          <span className="text-sm">Disconnected</span>
          <button 
            onClick={connect}
            className="ml-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition"
          >
            Connect
          </button>
        </>
      )}
    </div>
  );
};

export default MicroSipStatus;