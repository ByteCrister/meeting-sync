'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ChevronUp, ChevronDown, PlusIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { addSlots, setCurrentPage, sortTempSlots } from '@/lib/features/Slots/SlotSlice';
import apiService from '@/utils/client/api/api-services';
import SlotCardSkeleton from './SlotSkeleton';
import PaginateButtons from '../global-ui/ui-component/PaginateButtons';
import SlotCard from './SlotCard';
import SearchSlots from './SearchSlots';
import { toggleSlotDialog } from '@/lib/features/component-state/componentSlice';
import { useSearchParams } from 'next/navigation';



type selectedSlotFiled = 'title' | 'category' | 'bookedUsers' | 'status' | 'meetingDate' | 'createdAt';
type SortFieldButtons = 'title' | 'category' | 'bookingCount' | 'status' | 'meetingDate' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function MySlots() {
  const searchParams = useSearchParams();
  const searchedMeetingSlot = searchParams?.get('slot') || '';

  const { tempStore, currentSlotPage } = useAppSelector(state => state.slotStore);
  const dispatch = useAppDispatch();

  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [maxItemsPerPage] = useState<number>(4);

  const [sortField, setSortField] = useState<selectedSlotFiled>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');


  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      const responseData = await apiService.get(`/api/user-slot-register`);

      if (responseData.success && Array.isArray(responseData.data)) {
        const data = [...responseData.data];

        if (searchedMeetingSlot) {
          const searchedIndex = data.findIndex(item => item._id === searchedMeetingSlot);
          if (searchedIndex > -1) {
            const [searchedItem] = data.splice(searchedIndex, 1);
            data.unshift(searchedItem);
          }
        }

        dispatch(addSlots(data)); // Let your reducer handle comparison if needed
        dispatch(setCurrentPage(1));
      }
      setIsFetching(false);
    };

    fetchData();
  }, [dispatch, searchedMeetingSlot]);

  useEffect(() => {
    if (!searchedMeetingSlot || tempStore.length === 0) return;

    const index = tempStore.findIndex(slot => slot._id === searchedMeetingSlot);
    if (index > 0) {
      const newSlots = [...tempStore];
      const [found] = newSlots.splice(index, 1);
      newSlots.unshift(found);
      dispatch(sortTempSlots(newSlots));
      dispatch(setCurrentPage(1)); // Optional: reset page
    }
  }, [searchedMeetingSlot, tempStore, dispatch]);



  const handleSort = useCallback((field: SortFieldButtons) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field === 'bookingCount' ? 'bookedUsers' : field);
      setSortOrder('asc');
    }

    const sortedArray = [...tempStore].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (sortField === 'createdAt' || sortField === 'meetingDate') {
        const aDate = typeof aValue === 'string' ? new Date(aValue).getTime() : 0;
        const bDate = typeof bValue === 'string' ? new Date(bValue).getTime() : 0;
        return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;

      } else if (sortField === 'bookedUsers') {
        return sortOrder === 'asc'
          ? a.bookedUsers.length - b.bookedUsers.length
          : b.bookedUsers.length - a.bookedUsers.length;
      } else {
        return sortOrder === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      }
    });
    dispatch(sortTempSlots(sortedArray));
  }, [dispatch, sortField, sortOrder, tempStore]);


  const handleCreateSlot = useCallback(() => {
    dispatch(toggleSlotDialog({ isOpen: true, mode: 'create' }));
  }, [dispatch]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Meeting Slots</h1>
        <p className="text-gray-500 mt-2">
          Manage your available meeting slots
        </p>
      </div>

      {/* Search and Sort Section */}
      <div className="mb-6 space-y-4">
        {/* Search and Create Section */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search Input */}
          <div className="w-full md:w-[70%]">
            <SearchSlots isFetching={isFetching} />
          </div>

          {/* Create Button */}
          <div className="w-full md:w-auto">
            <button
              onClick={handleCreateSlot}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-md cursor-pointer shadow-md hover:shadow-lg hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all duration-200 font-medium"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create Slot</span>
            </button>
          </div>
        </div>


        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Sort by:</span>
          <div className="flex flex-wrap gap-1 md:space-x-2">
            {(['title', 'category', 'bookingCount', 'status', 'meetingDate', 'createdAt'] as SortFieldButtons[]).map((field) => (
              <button
                key={field}
                onClick={() => handleSort(field)}
                className={`flex items-center px-3 py-1 rounded-full text-sm cursor-pointer
                  ${(sortField === 'bookedUsers' ? 'bookingCount' : sortField) === field
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {field.charAt(0).toUpperCase() + field.slice(1)}
                {(sortField === 'bookedUsers' ? 'bookingCount' : sortField) === field && (
                  sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {
        isFetching
          ? <SlotCardSkeleton />
          : <>
            {/* Slots List */}
            <div className="space-y-4">
              {tempStore && tempStore.length !== 0 && tempStore
                .slice(
                  maxItemsPerPage * (currentSlotPage - 1),
                  (maxItemsPerPage * (currentSlotPage - 1)) + maxItemsPerPage
                ).map((slot, index) => (
                  <SlotCard key={slot._id + slot.title + index} slot={slot} isSearchedSlot={slot._id === searchedMeetingSlot} />
                ))}
            </div>


            {!isFetching && tempStore.length === 0 && <>
              <div className="text-center py-12">
                <p className="text-gray-500">No meeting slots found</p>
              </div>
            </>
            }
            {
              !isFetching && tempStore.length !== 0 &&
              <>
                {/* Paginate buttons */}
                <PaginateButtons
                  currentPage={currentSlotPage}
                  maxItems={maxItemsPerPage}
                  totalItems={tempStore.length}
                  handlePaginatePage={(newPage) => dispatch(setCurrentPage(newPage))}
                />
              </>}
          </>
      }

    </div>

  );
}
