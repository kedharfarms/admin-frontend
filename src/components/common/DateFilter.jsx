// export default DateFilter;
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import dayjs from 'dayjs';
import './CustomCalendar.css';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaRegCalendarAlt } from 'react-icons/fa';

export const CustomCalendar = ({ value, onChange, disabledDate }) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [startDate, setStartDate] = useState(value?.[0] || null);
  const [endDate, setEndDate] = useState(value?.[1] || null);
  const [hoverDate, setHoverDate] = useState(null);

  const generateCalendarDays = (month) => {
    const startOfMonth = month.startOf('month');
    const endOfMonth = month.endOf('month');
    const startDate = startOfMonth.startOf('week');
    const endDate = endOfMonth.endOf('week');

    const days = [];
    let current = startDate;

    while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
      days.push(current);
      current = current.add(1, 'day');
    }

    return days;
  };

  const leftMonth = currentMonth;
  const rightMonth = currentMonth.add(1, 'month');

  const leftCalendarDays = generateCalendarDays(leftMonth);
  const rightCalendarDays = generateCalendarDays(rightMonth);

  const handleDateClick = (date) => {
    if (disabledDate && disabledDate(date)) return;

    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (date.isBefore(startDate)) {
        setStartDate(date);
        setEndDate(startDate);
      } else {
        setEndDate(date);
      }
    }
  };

  const isInRange = (date) => {
    if (!startDate) return false;

    const rangeEnd = endDate || hoverDate;
    if (!rangeEnd) return false;

    const start = startDate.isBefore(rangeEnd) ? startDate : rangeEnd;
    const end = startDate.isBefore(rangeEnd) ? rangeEnd : startDate;

    return date.isAfter(start, 'day') && date.isBefore(end, 'day');
  };

  const isRangeStart = (date) => {
    if (!startDate) return false;
    const rangeEnd = endDate || hoverDate;
    if (!rangeEnd) return date.isSame(startDate, 'day');

    const start = startDate.isBefore(rangeEnd) ? startDate : rangeEnd;
    return date.isSame(start, 'day');
  };

  const isRangeEnd = (date) => {
    if (!startDate) return false;
    const rangeEnd = endDate || hoverDate;
    if (!rangeEnd) return false;

    const end = startDate.isBefore(rangeEnd) ? rangeEnd : startDate;
    return date.isSame(end, 'day');
  };

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => prev.subtract(1, 'month'));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => prev.add(1, 'month'));
  };

  const renderMonth = (month, days) => (
    <div className="calendar-month">
      <div className="calendar-header">
        <h3 className="calendar-month-title">{month.format('MMMM YYYY')}</h3>
      </div>

      <div className="calendar-weekdays">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((day, index) => {
          const isCurrentMonth = day.month() === month.month();
          const isToday = day.isSame(dayjs(), 'day');
          const isDisabled = disabledDate && disabledDate(day);
          const inRange = isInRange(day);
          const rangeStart = isRangeStart(day);
          const rangeEnd = isRangeEnd(day);

          return (
            <div
              key={index}
              className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} 
                         ${isToday ? 'today' : ''} 
                         ${isDisabled ? 'disabled' : ''} 
                         ${inRange ? 'in-range' : ''} 
                         ${rangeStart ? 'range-start' : ''} 
                         ${rangeEnd ? 'range-end' : ''}`}
              onClick={() => !isDisabled && handleDateClick(day)}
              onMouseEnter={() => {
                if (!isDisabled && startDate && !endDate) {
                  setHoverDate(day);
                }
              }}
              onMouseLeave={() => setHoverDate(null)}
            >
              {day.date()}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="custom-calendar">
      <div className="calendar-months-container">
        <button
          onClick={goToPreviousMonth}
          className="calendar-nav-arrow calendar-nav-left"
          type="button"
        >
          <FiChevronLeft size={18} />
        </button>

        {renderMonth(leftMonth, leftCalendarDays)}
        <div className="calendar-separator"></div>
        {renderMonth(rightMonth, rightCalendarDays)}

        <button
          onClick={goToNextMonth}
          className="calendar-nav-arrow calendar-nav-right"
          type="button"
        >
          <FiChevronRight size={18} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="custom-calendar-footer">
        <button className="calendar-btn cancel" onClick={() => onChange(null)}>
          Cancel
        </button>
        <button
          className="calendar-btn apply"
          disabled={!startDate || !endDate}
          onClick={() => onChange([startDate, endDate])}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

const DateFilter = forwardRef(({ onChange, value }, ref) => {
  const dropdownRef = useRef();
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);

  useEffect(() => {
    if (value && value.length === 2 && value[0] && value[1]) {
      setDateRange([dayjs(value[0]), dayjs(value[1])]);
    } else {
      setDateRange([null, null]);
    }
  }, [value]);

  const quickRanges = [
    { label: 'Today', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
    {
      label: 'Yesterday',
      value: [dayjs().subtract(1, 'day').startOf('day'), dayjs().subtract(1, 'day').endOf('day')],
    },
    {
      label: 'This Week',
      value: [dayjs().startOf('week').add(1, 'day'), dayjs().endOf('week').add(1, 'day')],
    },

    {
      label: 'Last Week',
      value: [
        dayjs().startOf('isoWeek').subtract(1, 'week'),
        dayjs().startOf('isoWeek').subtract(1, 'day').endOf('day'),
      ],
    },
    {
      label: 'Last 7 Days',
      value: [dayjs().subtract(6, 'day').startOf('day'), dayjs().endOf('day')],
    },
    { label: 'This Month', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
    {
      label: 'Last Month',
      value: [
        dayjs().subtract(1, 'month').startOf('month'),
        dayjs().subtract(1, 'month').endOf('month'),
      ],
    },
    {
      label: 'Last 6 Months',
      value: [dayjs().subtract(5, 'month').startOf('month'), dayjs().endOf('month')],
    },
    { label: 'This Year', value: [dayjs().startOf('year'), dayjs().endOf('year')] },
    { label: 'Custom Date Range', value: 'custom' },
  ];

  useImperativeHandle(ref, () => ({
    clear: () => {
      setDateRange([null, null]);
      setShowCustom(false);
      setOpen(false);
      if (onChange) onChange([]);
    },
    setDates: (dates) => {
      // dates should be an array of [Date, Date] objects
      if (dates && dates.length === 2) {
        const dayjsDates = [dayjs(dates[0]), dayjs(dates[1])];
        setDateRange(dayjsDates);
      }
    },
  }));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setShowCustom(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCustomDateChange = (dates) => {
    if (!dates) return;
    setDateRange(dates);
    setShowCustom(false);
    setOpen(false);
    if (onChange) onChange(dates.map((d) => d.format('YYYY-MM-DD')));
  };

  const displayText =
    dateRange[0] && dateRange[1]
      ? `${dateRange[0].format('DD/MM/YYYY')} - ${dateRange[1].format('DD/MM/YYYY')}`
      : 'Start Date - End Date';

  const handleQuickRangeClick = (item) => {
    if (item.value === 'custom') {
      setShowCustom(true);
    } else {
      setDateRange(item.value);
      setOpen(false);
      setShowCustom(false);
      if (onChange) onChange(item.value.map((d) => d.format('YYYY-MM-DD')));
    }
  };

  return (
    <div className="date-filter-container" ref={dropdownRef}>
      <div
        className="date-filter-button"
        onClick={() => {
          setOpen(!open);
          setShowCustom(false);
        }}
      >
        <span className="text-gray-500 text-sm font-medium ">{displayText}</span>
        <FaRegCalendarAlt className="calendar-icon" />
      </div>

      {open && (
        <div className="date-filter-dropdown">
          <div className="quick-ranges-panel">
            {quickRanges.map((item, idx) => (
              <div
                key={idx}
                className="quick-range-item"
                onClick={() => handleQuickRangeClick(item)}
              >
                {item.label}
              </div>
            ))}
          </div>

          {showCustom && (
            <div className="custom-calendar-panel">
              <CustomCalendar
                value={dateRange}
                onChange={handleCustomDateChange}
                disabledDate={(current) => current && current > dayjs()}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default DateFilter;
