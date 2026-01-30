/**
 * TimeSlotGrid Component
 * Grid display of selectable time slots (Teal theme)
 */
export default function TimeSlotGrid({
    slots = [],
    selectedTime,
    onSelectTime,
    disabled = false
}) {
    if (slots.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500">
                No time slots available
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {slots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                const isPast = slot.isPast;
                const isBooked = !slot.available && !isPast;
                const isDisabled = disabled || !slot.available;

                return (
                    <button
                        key={slot.time}
                        type="button"
                        onClick={() => !isDisabled && onSelectTime(slot.time)}
                        disabled={isDisabled}
                        className={`
              px-2 py-2 rounded-lg text-sm font-medium
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-1
              ${isSelected
                                ? 'bg-teal-500 text-white ring-2 ring-teal-400'
                                : slot.available
                                    ? 'bg-slate-50 text-slate-700 hover:bg-teal-50 hover:text-teal-700 border border-slate-200'
                                    : isPast
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        : 'bg-red-50 text-red-400 cursor-not-allowed border border-red-200'
                            }
            `}
                        title={isPast ? 'Time has passed' : isBooked ? 'Already booked' : 'Available'}
                    >
                        {slot.time}
                    </button>
                );
            })}
        </div>
    );
}
