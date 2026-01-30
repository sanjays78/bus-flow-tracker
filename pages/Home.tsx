import React, { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header';
import SearchHero from '../components/SearchHero';
import BusCard from '../components/BusCard';
import { Bus, SearchParams } from '../types';
import { MOCK_BUSES } from '../constants';
import { getTravelTip } from '../services/geminiService';
import { seedBuses, findBuses } from '../services/busService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
    const [searchResults, setSearchResults] = useState<Bus[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [aiTip, setAiTip] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Seed buses on app load (only runs once if check passes inside)
        seedBuses();
    }, []);

    // Filters
    const [filters, setFilters] = useState({
        ac: false,
        nonAc: false,
        sleeper: false,
        seater: false
    });

    const handleSearch = (params: SearchParams) => {
        setLoading(true);
        setSearchParams(params);

        setTimeout(async () => {
            // Use Firestore to find buses
            const filtered = await findBuses(params.source, params.destination);
            setSearchResults(filtered);
            setHasSearched(true);
            setLoading(false);

            const tip = await getTravelTip(params.source, params.destination);
            setAiTip(tip);
        }, 700);
    };

    const filteredResults = useMemo(() => {
        if (!filters.ac && !filters.nonAc && !filters.sleeper && !filters.seater) return searchResults;

        return searchResults.filter(bus => {
            const typeMatch =
                (filters.ac && bus.type.includes('AC') && !bus.type.includes('Non-AC')) ||
                (filters.nonAc && bus.type.includes('Non-AC')) ||
                (filters.sleeper && bus.type.includes('Sleeper')) ||
                (filters.seater && bus.type.includes('Semi-Sleeper'));

            return typeMatch;
        });
    }, [searchResults, filters]);

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col bg-mmt-bg">
            <Header
                user={user}
                onLogin={handleLogin}
                onLogout={logout}
            />

            <main className="flex-grow">
                <SearchHero
                    onSearch={handleSearch}
                    initialSource={searchParams?.source}
                    initialDestination={searchParams?.destination}
                />

                <div className="container mx-auto px-4 py-8 -mt-16 relative z-[50]">
                    {loading && (
                        <div className="bg-white rounded-xl p-20 text-center shadow-xl">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-mmt-blue border-t-transparent mb-6"></div>
                            <p className="text-mmt-dark font-black uppercase text-sm tracking-widest">Searching Best Bus Routes...</p>
                        </div>
                    )}

                    {hasSearched && !loading && (
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* FILTER SIDEBAR */}
                            <aside className="lg:w-72 flex-shrink-0">
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-24">
                                    <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Filters</h3>
                                        <button
                                            onClick={() => setFilters({ ac: false, nonAc: false, sleeper: false, seater: false })}
                                            className="text-[11px] font-bold text-mmt-blue hover:underline"
                                        >
                                            RESET ALL
                                        </button>
                                    </div>

                                    <div className="p-5 space-y-8">
                                        <div>
                                            <h4 className="text-[11px] font-black text-gray-400 uppercase mb-4 tracking-widest">Bus Type</h4>
                                            <div className="space-y-3">
                                                {['AC', 'Non-AC', 'Sleeper', 'Seater'].map(type => (
                                                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-gray-300 text-mmt-blue focus:ring-mmt-blue"
                                                            checked={filters[type.toLowerCase().replace('-', '') as keyof typeof filters]}
                                                            onChange={(e) => setFilters({ ...filters, [type.toLowerCase().replace('-', '')]: e.target.checked })}
                                                        />
                                                        <span className="text-sm text-gray-700 font-medium group-hover:text-mmt-blue transition-colors">{type}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-[11px] font-black text-gray-400 uppercase mb-4 tracking-widest">Departure Time</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['Morning', 'Afternoon', 'Evening', 'Night'].map(time => (
                                                    <button key={time} className="text-[10px] font-bold py-2 border border-gray-200 rounded-md hover:border-mmt-blue hover:text-mmt-blue transition-all">
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </aside>

                            {/* RESULTS AREA */}
                            <div className="flex-1">
                                {aiTip && (
                                    <div className="mb-6 bg-white border-l-4 border-mmt-blue p-5 rounded-r-xl shadow-sm flex items-start gap-4">
                                        <div className="bg-blue-50 p-2 rounded-lg">
                                            <span className="text-xl">🤖</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-mmt-blue uppercase mb-1 tracking-widest">Smart Travel Suggestion</p>
                                            <p className="text-sm text-gray-700 font-medium leading-relaxed italic">"{aiTip}"</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-black text-gray-900">
                                        Buses from <span className="text-mmt-blue">{searchParams?.source}</span> to <span className="text-mmt-blue">{searchParams?.destination}</span>
                                    </h2>
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="font-bold text-gray-400">SORT BY:</span>
                                        <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-md font-black text-gray-700 cursor-pointer">
                                            Popularity ↓
                                        </div>
                                    </div>
                                </div>

                                {filteredResults.length > 0 ? (
                                    <div className="space-y-4">
                                        {filteredResults.map(bus => (
                                            <BusCard key={bus.id} bus={bus} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-xl p-20 text-center shadow-sm">
                                        <div className="text-5xl mb-6">🔍</div>
                                        <h3 className="text-xl font-black text-gray-900 mb-2">Oops! No buses found</h3>
                                        <p className="text-gray-500 max-sm mx-auto font-medium">Try changing your filters or choosing a different travel date.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {!hasSearched && !loading && (
                        <div className="max-w-6xl mx-auto py-20">
                            <div className="bg-white rounded-2xl p-10 shadow-sm border border-white">
                                <h3 className="text-2xl font-black text-gray-900 mb-8 text-center uppercase tracking-tighter">Why book with BusFlow?</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                    <div className="flex gap-4">
                                        <div className="text-3xl">🎫</div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-sm uppercase">Paperless Tickets</h4>
                                            <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">Book tickets online and receive confirmation instantly via SMS and Email.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="text-3xl">🛡️</div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-sm uppercase">Secure Payments</h4>
                                            <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">Your transactions are secured with industry-standard encryption protocols.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="text-3xl">🎧</div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-sm uppercase">24/7 Support</h4>
                                            <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">We are here to help you with your booking issues anytime, anywhere.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <footer className="bg-mmt-dark text-white pt-16 pb-10">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 opacity-80">
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-mmt-blue rounded-full flex items-center justify-center text-white text-[10px] font-black">BF</div>
                                <span className="text-xl font-black text-white tracking-tighter">BusFlow</span>
                            </div>
                            <p className="text-xs leading-relaxed font-medium">
                                Over the years, BusFlow has been the trusted platform for millions of travellers.
                                With the widest range of bus options, we make your journey comfortable.
                            </p>
                        </div>
                        <div>
                            <h5 className="font-black text-[11px] uppercase tracking-widest mb-6">Product</h5>
                            <ul className="text-xs space-y-3 font-medium text-gray-400">
                                <li className="hover:text-white cursor-pointer transition-colors">Bus Tickets</li>
                                <li className="hover:text-white cursor-pointer transition-colors">Flights</li>
                                <li className="hover:text-white cursor-pointer transition-colors">Hotels</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-black text-[11px] uppercase tracking-widest mb-6">Company</h5>
                            <ul className="text-xs space-y-3 font-medium text-gray-400">
                                <li className="hover:text-white cursor-pointer transition-colors">About Us</li>
                                <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
                                <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                            </ul>
                        </div>
                        <div className="flex flex-col gap-4">
                            <h5 className="font-black text-[11px] uppercase tracking-widest mb-2">Connect with us</h5>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-mmt-blue cursor-pointer transition-colors">f</div>
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-mmt-blue cursor-pointer transition-colors">t</div>
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-mmt-blue cursor-pointer transition-colors">in</div>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase font-black tracking-widest text-gray-500">
                        <span>© 2024 BUSFLOW INDIA PVT. LTD.</span>
                        <span>Country: India | USA | UAE</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
