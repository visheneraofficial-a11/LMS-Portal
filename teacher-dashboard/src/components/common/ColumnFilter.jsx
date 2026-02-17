import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, X, Filter, Search } from 'lucide-react';

/**
 * Excel-like column filter component.
 * Usage: <ColumnFilter column="name" data={allValues} selected={filters.name} onChange={v => setFilter('name', v)} />
 */
export default function ColumnFilter({ column, label, data = [], selected = null, onChange, align = 'left' }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  // Get unique values for this column
  const uniqueValues = useMemo(() => {
    const vals = [...new Set(data.map(v => String(v ?? '')))].filter(Boolean).sort();
    if (search) {
      const q = search.toLowerCase();
      return vals.filter(v => v.toLowerCase().includes(q));
    }
    return vals;
  }, [data, search]);

  const isFiltered = selected !== null && selected.length > 0 && selected.length < uniqueValues.length;

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleValue = (val) => {
    if (!selected || selected.length === 0) {
      // All were selected, now deselecting this one
      onChange(uniqueValues.filter(v => v !== val));
    } else if (selected.includes(val)) {
      const newSel = selected.filter(v => v !== val);
      if (newSel.length === 0) onChange(null); // Reset to all
      else onChange(newSel);
    } else {
      const newSel = [...selected, val];
      if (newSel.length >= uniqueValues.length) onChange(null); // All selected
      else onChange(newSel);
    }
  };

  const selectAll = () => { onChange(null); };
  const clearAll = () => { onChange([]); };

  const isSelected = (val) => {
    if (!selected || selected.length === 0) return true; // null / empty = all selected
    return selected.includes(val);
  };

  const allSelected = !selected || selected.length === 0;

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide transition-colors ${
          isFiltered ? 'text-primary-700' : 'text-gray-500'
        } hover:text-primary-600`}
      >
        {label || column}
        {isFiltered ? (
          <Filter className="w-3 h-3 text-primary-600 fill-primary-200" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>

      {open && (
        <div className={`absolute z-50 mt-1 top-full ${align === 'right' ? 'right-0' : 'left-0'} w-56 bg-white rounded-lg shadow-xl border border-gray-200`}>
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                autoFocus
              />
            </div>
          </div>

          {/* Select All / Clear */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100">
            <button onClick={selectAll} className="text-[10px] text-primary-600 hover:text-primary-700 font-medium">
              Select All
            </button>
            <button onClick={clearAll} className="text-[10px] text-red-600 hover:text-red-700 font-medium">
              Clear
            </button>
          </div>

          {/* Values */}
          <div className="max-h-48 overflow-y-auto py-1">
            {uniqueValues.length === 0 ? (
              <p className="text-xs text-gray-400 px-3 py-2 text-center">No values found</p>
            ) : (
              uniqueValues.map(val => (
                <button
                  key={val}
                  onClick={() => toggleValue(val)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center ${
                    isSelected(val)
                      ? 'bg-primary-600 border-primary-600'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {isSelected(val) && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span className="truncate">{val}</span>
                </button>
              ))
            )}
          </div>

          {/* Apply / Clear */}
          {isFiltered && (
            <div className="p-2 border-t border-gray-100">
              <button
                onClick={() => { onChange(null); setOpen(false); setSearch(''); }}
                className="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors font-medium"
              >
                <X className="w-3 h-3" /> Clear Filter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
