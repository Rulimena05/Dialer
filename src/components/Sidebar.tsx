import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Upload, Clock, Settings, Phone, Users, LogOut, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { signOut, isAdmin } = useAuth();

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-5 border-b border-gray-700 flex items-center gap-3">
        <img src="https://i.imghippo.com/files/vN4585NBA.png" alt="Rdesk Logo" className="w-8 h-8" />
        <h1 className="text-xl font-bold">Rdesk App</h1>
      </div>
      <nav className="flex-1 py-4">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex items-center px-5 py-3 transition-colors ${
              isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`
          }
        >
          <Home className="mr-3" size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        {isAdmin && (
          <>
            <div className="px-5 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Customers
            </div>
            <NavLink 
              to="/customers/baf" 
              className={({ isActive }) => 
                `flex items-center px-5 py-2 transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`
              }
            >
              <Users className="mr-3" size={20} />
              <span>BAF</span>
            </NavLink>
            
            <NavLink 
              to="/customers/akulaku" 
              className={({ isActive }) => 
                `flex items-center px-5 py-2 transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`
              }
            >
              <Users className="mr-3" size={20} />
              <span>Akulaku</span>
            </NavLink>
            
            <NavLink 
              to="/customers/traveloka" 
              className={({ isActive }) => 
                `flex items-center px-5 py-2 transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`
              }
            >
              <Users className="mr-3" size={20} />
              <span>Traveloka</span>
            </NavLink>
          </>
        )}
        
        {isAdmin && (
          <NavLink 
            to="/upload" 
            className={({ isActive }) => 
              `flex items-center px-5 py-3 transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            <Upload className="mr-3" size={20} />
            <span>Upload Customers</span>
          </NavLink>
        )}
        
        <NavLink 
          to="/history" 
          className={({ isActive }) => 
            `flex items-center px-5 py-3 transition-colors ${
              isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`
          }
        >
          <Clock className="mr-3" size={20} />
          <span>Call History</span>
        </NavLink>

        <NavLink 
          to="/reports" 
          className={({ isActive }) => 
            `flex items-center px-5 py-3 transition-colors ${
              isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`
          }
        >
          <FileText className="mr-3" size={20} />
          <span>Report Call</span>
        </NavLink>
        
        <NavLink 
          to="/settings" 
          className={({ isActive }) => 
            `flex items-center px-5 py-3 transition-colors ${
              isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`
          }
        >
          <Settings className="mr-3" size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => signOut()}
          className="w-full px-4 py-2 text-gray-300 hover:bg-gray-700 rounded flex items-center transition-colors"
        >
          <LogOut className="mr-3" size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;