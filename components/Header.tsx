
import React from 'react';

const Header: React.FC = () => {
  const services = [
    { name: 'Flights', icon: '✈️' },
    { name: 'Hotels', icon: '🏨' },
    { name: 'Homestays', icon: '🏡' },
    { name: 'Trains', icon: '🚆' },
    { name: 'Buses', icon: '🚌', active: true },
    { name: 'Cabs', icon: '🚕' }
  ];

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-[100]">
      <div className="container mx-auto px-4 flex justify-between items-center h-[70px]">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-9 h-9 bg-mmt-blue rounded-full flex items-center justify-center text-white text-[10px] font-black">BF</div>
          <span className="text-2xl font-black text-mmt-dark tracking-tighter">BusFlow</span>
        </div>

        {/* Services Navigation */}
        <nav className="hidden lg:flex items-center h-full">
          {services.map((service) => (
            <div 
              key={service.name} 
              className={`flex flex-col items-center justify-center px-4 h-full cursor-pointer transition-colors border-b-4 ${
                service.active ? 'border-mmt-blue' : 'border-transparent hover:border-gray-200'
              }`}
            >
              <span className="text-xl mb-1">{service.icon}</span>
              <span className={`text-[11px] font-bold uppercase tracking-tight ${service.active ? 'text-mmt-blue' : 'text-gray-500'}`}>
                {service.name}
              </span>
            </div>
          ))}
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          <button className="bg-gradient-to-r from-mmt-blue to-blue-500 text-white text-xs font-bold py-2 px-6 rounded-full shadow-sm hover:shadow-md transition-all">
            Login or Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
