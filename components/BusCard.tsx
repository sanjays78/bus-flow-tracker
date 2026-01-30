
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus } from '../types';

interface Props {
  bus: Bus;
}

const BusCard: React.FC<Props> = ({ bus }) => {
  const navigate = useNavigate();
  const isFull = bus.availableSeats === 0;

  const handleViewSeats = () => {
    if (!isFull) {
      navigate(`/bus/${bus.id}`);
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all mb-4 border border-white hover:border-blue-100 group overflow-hidden cursor-pointer"
      onClick={handleViewSeats}
    >
      <div className="p-5 flex flex-col md:flex-row items-stretch gap-6">

        {/* BUS INFO */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-mmt-blue transition-colors">
                {bus.name}
              </h3>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-0.5">
                {bus.type} • {bus.busNumber}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 bg-green-500 text-white text-[12px] font-bold px-2 py-0.5 rounded shadow-sm">
                <span>★</span> {bus.rating}
              </div>
              <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase">120+ ratings</p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50/50 p-4 rounded-lg">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-gray-900">{bus.departureTime}</span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{bus.source}</span>
            </div>

            <div className="flex-1 flex flex-col items-center px-10">
              <span className="text-[11px] font-bold text-gray-400 mb-1">03h 00m</span>
              <div className="w-full flex items-center gap-2">
                <div className="w-2 h-2 rounded-full border-2 border-gray-300"></div>
                <div className="flex-1 h-px bg-gray-200"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-2xl font-black text-gray-900">{bus.arrivalTime}</span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{bus.destination}</span>
            </div>
          </div>
        </div>

        {/* PRICING */}
        <div className="md:w-[220px] flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-gray-100 pt-5 md:pt-0 md:pl-6">
          <div className="text-right">
            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Price per person</p>
            <p className="text-3xl font-black text-gray-900">₹ {bus.price}</p>
          </div>

          <div className="w-full mt-6">
            <div className="flex items-center justify-end gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${isFull ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className={`text-[11px] font-bold ${isFull ? 'text-red-500' : 'text-gray-500 uppercase'}`}>
                {isFull ? 'Fully Booked' : `${bus.availableSeats} Seats Available`}
              </span>
            </div>

            <button
              disabled={isFull}
              onClick={(e) => {
                e.stopPropagation();
                handleViewSeats();
              }}
              className={`w-full py-3 px-4 rounded-full font-black text-sm uppercase tracking-wider transition-all shadow-sm ${isFull
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-mmt-blue text-white hover:bg-mmt-hover active:scale-95 shadow-blue-100'
                }`}
            >
              {isFull ? 'Sold Out' : 'View Seats'}
            </button>
          </div>
        </div>
      </div>

      {/* AMENITIES */}
      <div className="bg-gray-50 border-t border-gray-100 px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-[11px] text-gray-500 font-bold flex items-center gap-1">
            <span className="opacity-50">⚡</span> Charging Point
          </span>
          <span className="text-[11px] text-gray-500 font-bold flex items-center gap-1">
            <span className="opacity-50">🚿</span> Sanitized
          </span>
          <span className="text-[11px] text-gray-500 font-bold flex items-center gap-1">
            <span className="opacity-50">📱</span> M-Ticket
          </span>
        </div>
        <a href="#" className="text-[11px] text-mmt-blue font-bold hover:underline">Policies & Details</a>
      </div>
    </div>
  );
};

export default BusCard;
