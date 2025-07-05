import React, { useState } from 'react';
import { Wifi, WifiOff, Save } from 'lucide-react';
import { useMicroSip } from '../contexts/MicroSipContext';
import { toast } from 'react-toastify';

const Settings = () => {
  const { connected, connectionInfo, connect, disconnect } = useMicroSip();
  
  const [settings, setSettings] = useState({
    server: connectionInfo.server,
    proxy: connectionInfo.proxy,
    username: connectionInfo.username,
    domain: connectionInfo.domain,
    login: connectionInfo.login,
    password: connectionInfo.password,
    callDelay: 5,
    autoHangup: true,
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would update the MicroSip settings
    toast.success('Settings saved successfully');
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium">MicroSip Connection</h2>
            <div className="flex items-center gap-2">
              {connected ? (
                <>
                  <Wifi size={18} className="text-green-400" />
                  <span className="text-green-400 text-sm">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff size={18} className="text-red-400" />
                  <span className="text-red-400 text-sm">Disconnected</span>
                </>
              )}
            </div>
          </div>
          
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="server" className="block text-sm font-medium text-gray-400 mb-1">
                  Server
                </label>
                <input
                  type="text"
                  id="server"
                  name="server"
                  value={settings.server}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="proxy" className="block text-sm font-medium text-gray-400 mb-1">
                  Proxy
                </label>
                <input
                  type="text"
                  id="proxy"
                  name="proxy"
                  value={settings.proxy}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={settings.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-gray-400 mb-1">
                  Domain
                </label>
                <input
                  type="text"
                  id="domain"
                  name="domain"
                  value={settings.domain}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="login" className="block text-sm font-medium text-gray-400 mb-1">
                  Login
                </label>
                <input
                  type="text"
                  id="login"
                  name="login"
                  value={settings.login}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={settings.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={connected ? disconnect : connect}
                className={`px-4 py-2 rounded flex items-center gap-2 transition ${
                  connected 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {connected ? (
                  <>
                    <WifiOff size={16} />
                    Disconnect
                  </>
                ) : (
                  <>
                    <Wifi size={16} />
                    Connect
                  </>
                )}
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-700 transition"
              >
                <Save size={16} />
                Save Settings
              </button>
            </div>
          </form>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-medium mb-6">Auto-Dial Settings</h2>
          
          <form onSubmit={handleSave}>
            <div className="mb-4">
              <label htmlFor="callDelay" className="block text-sm font-medium text-gray-400 mb-1">
                Delay Between Calls (seconds)
              </label>
              <input
                type="number"
                id="callDelay"
                name="callDelay"
                value={settings.callDelay}
                onChange={handleChange}
                min="1"
                max="30"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Time to wait after each call before dialing the next number
              </p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoHangup"
                  name="autoHangup"
                  checked={settings.autoHangup}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                />
                <label htmlFor="autoHangup" className="ml-2 block text-sm text-gray-300">
                  Auto-hangup when call is answered
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500 ml-6">
                Automatically hang up and proceed to the next number when a call is answered
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-700 transition"
              >
                <Save size={16} />
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="mt-8 bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-medium mb-4">Python Backend Status</h2>
        
        <div className="p-4 border border-yellow-800 bg-yellow-900 bg-opacity-20 rounded-md mb-6">
          <p className="text-yellow-400 flex items-center">
            <AlertTriangle size={20} className="mr-2" />
            Python backend integration is required for actual MicroSip control
          </p>
          <p className="mt-2 text-sm text-gray-300">
            The current system is a front-end prototype. To fully implement the auto-dialing functionality,
            you'll need to develop a Python backend that uses libraries like pjsua2 or other SIP
            clients to interface with MicroSip.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-700 rounded-md">
            <h3 className="font-medium mb-2">Required Backend Components:</h3>
            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
              <li>Python SIP client library (pjsua2 recommended)</li>
              <li>Flask or FastAPI web server</li>
              <li>WebSockets for real-time communication</li>
              <li>Call detection and status monitoring</li>
              <li>CSV data handling</li>
            </ul>
          </div>
          
          <div className="p-4 bg-gray-700 rounded-md">
            <h3 className="font-medium mb-2">Implementation Steps:</h3>
            <ol className="list-decimal list-inside text-sm text-gray-300 space-y-1">
              <li>Install SIP client libraries in Python</li>
              <li>Create API endpoints for call control</li>
              <li>Implement WebSockets for real-time updates</li>
              <li>Develop CSV data processing</li>
              <li>Connect React frontend to Python backend</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add missing AlertTriangle component
const AlertTriangle = ({ size, className }: { size: number, className?: string }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
      <path d="M12 9v4"></path>
      <path d="M12 17h.01"></path>
    </svg>
  );
};

export default Settings;