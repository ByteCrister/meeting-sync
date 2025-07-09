'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { debounce, isEqual } from 'lodash';
import { useRouter } from 'next/navigation';
import { APIGetSearchSuggestion, APIUpdateUsersSearchScore } from '@/utils/client/api/api-search';
import SearchLoading from './SearchLoading';

interface SearchResult {
  _id: string;
  field: 'user' | 'slot';
  name: string;
  matchedString: string;
  href: string;
}

const SearchBar = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const debouncedFetchRef = useRef(
    debounce(async (query: string) => {
      setLoading(true);
      const res = await APIGetSearchSuggestion(query);
      if (res.success && !isEqual(res.data, suggestions)) {
        setSuggestions(res.data);
      } else if (!res.success) {
        setSuggestions([]);
      }
      setLoading(false);
    }, 400)
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      debouncedFetchRef.current.cancel();
    };
  }, [suggestions]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    setShowSuggestions(true);
    if (q.trim()) debouncedFetchRef.current(q);
    else setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && searchQuery) {
      debouncedFetchRef.current.cancel();
      setSearchQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleSuggestionClick = async (href: string, id: string, field: 'user' | 'slot') => {
    await APIUpdateUsersSearchScore(id, field);
    setShowSuggestions(false);
    router.push(href);
  };

  return (
    <div className="relative w-full max-w-md mx-auto" ref={wrapperRef}>
      <div className="relative">
        <input
          id="user-searching"
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
          onBlur={(e) => {
            if (!wrapperRef.current?.contains(e.relatedTarget as Node)) {
              setShowSuggestions(false);
            }
          }}
          placeholder="Search meetings, users, or topics..."
          className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />

        <div className="absolute inset-y-0 left-4 flex items-center text-gray-400">
          <Search className="w-5 h-5" />
        </div>

        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              debouncedFetchRef.current.cancel();
              setSearchQuery('');
              setSuggestions([]);
              setShowSuggestions(false);
            }}
            className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showSuggestions && searchQuery && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-fade-in">
          <div className="divide-y divide-gray-100 max-h-64 overflow-auto">
            {loading && (
              <div className="px-4 py-3 text-sm text-gray-500">
                <SearchLoading />
              </div>
            )}
            {!loading && suggestions.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500">No suggestions found</div>
            )}
            {!loading &&
              suggestions.map((s) => (
                <button
                  key={s._id}
                  onClick={() => {
                    handleSuggestionClick(s.href, s._id, s.field);
                    setSearchQuery(s.name);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-gray-400">Matched: {s.matchedString}</div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
