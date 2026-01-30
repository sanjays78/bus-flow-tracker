import React from 'react';
import { SeatLayout as SeatLayoutType } from '../types';

interface SeatLayoutProps {
    layout: SeatLayoutType;
    bookedSeats: string[];
    selectedSeats: string[];
    onSeatClick: (seatId: string) => void;
    maxSelection?: number;
    busType?: string;
}

// Seat status colors
const SEAT_COLORS = {
    available: 'bg-green-100 border-green-400 hover:bg-green-200 cursor-pointer',
    selected: 'bg-blue-500 border-blue-600 text-white cursor-pointer',
    booked: 'bg-gray-300 border-gray-400 cursor-not-allowed opacity-60',
};

const SeatLayout: React.FC<SeatLayoutProps> = ({
    layout,
    bookedSeats,
    selectedSeats,
    onSeatClick,
    maxSelection = 6,
    busType = 'Seater',
}) => {
    const { rows, seatsPerRow, aisleAfter } = layout;

    // Generate seat ID (e.g., "A1", "B2")
    const getSeatId = (row: number, seat: number): string => {
        const rowLetter = String.fromCharCode(65 + row); // A, B, C...
        return `${rowLetter}${seat + 1}`;
    };

    // Get seat status
    const getSeatStatus = (seatId: string): 'available' | 'selected' | 'booked' => {
        if (bookedSeats.includes(seatId)) return 'booked';
        if (selectedSeats.includes(seatId)) return 'selected';
        return 'available';
    };

    // Handle seat click
    const handleSeatClick = (seatId: string) => {
        const status = getSeatStatus(seatId);
        if (status === 'booked') return;

        // Check max selection limit when selecting a new seat
        if (status === 'available' && selectedSeats.length >= maxSelection) {
            return;
        }

        onSeatClick(seatId);
    };

    // Determine if it's a sleeper bus
    const isSleeper = busType?.toLowerCase().includes('sleeper');

    return (
        <div className="seat-layout-container bg-white rounded-xl p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Select Seats</h3>
                <span className="text-sm text-gray-500">
                    {selectedSeats.length} / {maxSelection} selected
                </span>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mb-6 text-xs">
                <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded border ${SEAT_COLORS.available.split(' ').slice(0, 2).join(' ')}`}></div>
                    <span className="text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded border ${SEAT_COLORS.selected.split(' ').slice(0, 2).join(' ')}`}></div>
                    <span className="text-gray-600">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded border ${SEAT_COLORS.booked.split(' ').slice(0, 2).join(' ')}`}></div>
                    <span className="text-gray-600">Booked</span>
                </div>
            </div>

            {/* Bus Layout */}
            <div className="relative bg-gray-50 rounded-lg p-4 border border-gray-200">
                {/* Driver section */}
                <div className="flex items-center justify-end mb-4 pb-4 border-b border-dashed border-gray-300">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Driver</span>
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-lg">🚌</span>
                        </div>
                    </div>
                </div>

                {/* Seats Grid */}
                <div className="space-y-2">
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <div key={rowIndex} className="flex items-center justify-center gap-1">
                            {/* Row label */}
                            <div className="w-6 text-xs text-gray-400 font-medium">
                                {String.fromCharCode(65 + rowIndex)}
                            </div>

                            {/* Seats in row */}
                            {Array.from({ length: seatsPerRow }).map((_, seatIndex) => {
                                const seatId = getSeatId(rowIndex, seatIndex);
                                const status = getSeatStatus(seatId);

                                return (
                                    <React.Fragment key={seatId}>
                                        {/* Aisle gap */}
                                        {seatIndex === aisleAfter && (
                                            <div className="w-8"></div>
                                        )}

                                        {/* Seat */}
                                        <button
                                            onClick={() => handleSeatClick(seatId)}
                                            disabled={status === 'booked'}
                                            className={`
                                                ${isSleeper ? 'w-12 h-8' : 'w-10 h-10'}
                                                rounded-lg border-2 
                                                flex items-center justify-center
                                                text-xs font-bold
                                                transition-all duration-200
                                                ${SEAT_COLORS[status]}
                                            `}
                                            title={`Seat ${seatId} - ${status}`}
                                        >
                                            {seatId}
                                        </button>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Entrance indicator */}
                <div className="flex justify-end mt-4 pt-4 border-t border-dashed border-gray-300">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Entrance ↓</span>
                </div>
            </div>

            {/* Selected seats summary */}
            {selectedSeats.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                            Selected: <span className="font-bold text-blue-600">{selectedSeats.join(', ')}</span>
                        </span>
                        <button
                            onClick={() => selectedSeats.forEach(seat => onSeatClick(seat))}
                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                            Clear All
                        </button>
                    </div>
                </div>
            )}

            {/* Max selection warning */}
            {selectedSeats.length >= maxSelection && (
                <div className="mt-2 text-xs text-orange-600 text-center">
                    Maximum {maxSelection} seats can be selected at once
                </div>
            )}
        </div>
    );
};

export default SeatLayout;
