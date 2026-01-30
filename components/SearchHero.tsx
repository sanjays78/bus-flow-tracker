
import React, { useState } from 'react';
import { SearchParams } from '../types';
import { POPULAR_CITIES } from '../constants';

interface Props {
  onSearch: (params: SearchParams) => void;
  initialSource?: string;
  initialDestination?: string;
}

const SearchHero: React.FC<Props> = ({ onSearch, initialSource = '', initialDestination = '' }) => {
  const [source, setSource] = useState(initialSource);
  const [destination, setDestination] = useState(initialDestination);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (source && destination) {
      onSearch({ source, destination, date });
    }
  };

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  return (
    <div className="mmt-gradient pb-32 pt-12 relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
         <svg width="400" height="400" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="white"/></svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto bg-white rounded-xl search-widget-shadow overflow-visible p-1 md:p-2">
          <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row items-stretch">
            {/* FROM */}
            <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-gray-100 hover:bg-blue-50/30 transition-colors relative">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">From</label>
              <input 
                type="text"
                placeholder="Source City"
                className="w-full text-2xl font-black text-gray-900 outline-none bg-transparent placeholder:text-gray-200"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                list="cities-src"
              />
              <p className="text-[11px] text-gray-400 mt-1 font-medium">Select source city</p>
              
              {/* Swap Button (Absolute Positioned between fields) */}
              <button 
                type="button"
                onClick={handleSwap}
                className="absolute right-[-14px] top-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-white rounded-full border border-gray-100 shadow flex items-center justify-center text-mmt-blue hover:scale-110 transition-transform hidden lg:flex"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
            </div>

            {/* TO */}
            <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-gray-100 hover:bg-blue-50/30 transition-colors">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">To</label>
              <input 
                type="text"
                placeholder="Destination City"
                className="w-full text-2xl font-black text-gray-900 outline-none bg-transparent placeholder:text-gray-200"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                list="cities-dest"
              />
              <p className="text-[11px] text-gray-400 mt-1 font-medium">Select destination city</p>
            </div>

            {/* DATE */}
            <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-gray-100 hover:bg-blue-50/30 transition-colors">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Travel Date</label>
              <input 
                type="date"
                className="w-full text-2xl font-black text-gray-900 outline-none bg-transparent"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <p className="text-[11px] text-gray-400 mt-1 font-medium uppercase tracking-tighter">
                {new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
              </p>
            </div>

            {/* SEARCH BUTTON */}
            <div className="flex items-center justify-center p-4">
              <button 
                type="submit"
                className="w-full lg:w-48 bg-gradient-to-r from-blue-400 to-mmt-blue text-white font-black text-xl py-3 px-8 rounded-full shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all uppercase tracking-tight"
              >
                Search
              </button>
            </div>
          </form>

          <datalist id="cities-src">{POPULAR_CITIES.map(c => <option key={c} value={c}/>)}</datalist>
          <datalist id="cities-dest">{POPULAR_CITIES.map(c => <option key={c} value={c}/>)}</datalist>
        </div>
      </div>
    </div>
  );
};

export default SearchHero;
