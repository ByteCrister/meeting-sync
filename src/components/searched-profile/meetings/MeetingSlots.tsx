'use client';

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Users, ChevronUp, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ApiSPType } from '@/utils/constants';
import { getSearchedUser, GetSearchedUserResponse } from '@/utils/client/api/api-searched-profile';
import { isEqual } from 'lodash';
import { MeetingSlotCardSkeleton } from './MeetingSlotCardSkeleton';
import PaginateButtons from '@/components/global-ui/ui-component/PaginateButtons';
import CAT from './CAT';
import { useAppSelector } from '@/lib/hooks';
import { DateTime } from 'luxon';
import { convertTimeBetweenTimeZones } from '@/utils/client/date-formatting/convertTimeBetweenTimeZones';
import { convertDateTimeBetweenTimeZones } from '@/utils/client/date-formatting/convertDateTimeBetweenTimeZones';
import { calculateTimeDurationByConvertedTimes } from '@/utils/client/date-formatting/calculateTimeDurationByConvertedTimes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RegisterSlotStatus } from '../../../types/client-types';


interface BookedMeeting {
  _id: string;
  title: string;
  description?: string;
  meetingDate: string;
  durationFrom: string;
  durationTo: string;
  participants: number;
  status: RegisterSlotStatus;
  category: string;
  createdAt: string;
  isBooked: boolean;
}

const normalizeMeetingsToUserTimeZone = (
  meetings: BookedMeeting[],
  fromTZ: string,
  toTZ: string
): BookedMeeting[] => {
  return meetings.map((meeting) => {
    const convertedDateTime = convertDateTimeBetweenTimeZones(
      fromTZ,
      toTZ,
      meeting.meetingDate,
      meeting.durationFrom
    );

    const convertedTimeFrom = convertTimeBetweenTimeZones(
      fromTZ,
      toTZ,
      meeting.meetingDate,
      meeting.durationFrom
    );

    const convertedTimeTo = convertTimeBetweenTimeZones(
      fromTZ,
      toTZ,
      meeting.meetingDate,
      meeting.durationTo
    );

    return {
      ...meeting,
      meetingDate: convertedDateTime,
      durationFrom: convertedTimeFrom,
      durationTo: convertedTimeTo,
    };
  });
};



export const MeetingSlots = ({ userId, userTimeZone, setMeetingCount }: { userId: string; userTimeZone: string, setMeetingCount: (count: number) => void }) => {
  const currentUserTimeZone = useAppSelector(state => state.userStore.user?.timeZone);
  const [isLoading, setIsLoading] = useState(true);
  const [allMeetings, setAllMeetings] = useState<BookedMeeting[]>([]);
  const [meetings, setMeetings] = useState<BookedMeeting[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState<'all' | 'bookedByMe' | 'bookedMine'>('all');
  const [uniqueCategories, setUniqueCategories] = useState<string[]>(['Category']);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loadingBtns, setLoadingBtns] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [maxItems] = useState<number>(3);


  const fetchData = async () => {
    setIsLoading(true);
    const responseData = await getSearchedUser(userId, ApiSPType.GET_USER_MEETINGS, filterType) as GetSearchedUserResponse<BookedMeeting[]>;
    const { data, success } = responseData as { data: BookedMeeting[], success: boolean, uniqueCategories: string[] };
    if (success && !isEqual(data, meetings)) {
      const converted = normalizeMeetingsToUserTimeZone(data, userTimeZone, currentUserTimeZone!);
      const sorted = sortMeetingsByDate([...converted], sortOrder);
      setAllMeetings(sorted);
      const filtered = filterMeetingsByCategory(sorted, selectedCategory);
      setMeetings(filtered);
      setMeetingCount(filtered.length || 0);
      setUniqueCategories(responseData.uniqueCategories || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, filterType]);

  const getStatusBadge = (status: RegisterSlotStatus) => {
    switch (status) {
      case RegisterSlotStatus.Upcoming:
        return (
          <Badge className="bg-blue-100 text-blue-700 border border-blue-300 shadow-sm">
            Upcoming
          </Badge>
        );
      case RegisterSlotStatus.Completed:
        return (
          <Badge className="bg-green-100 text-green-700 border border-green-300 shadow-sm">
            Completed
          </Badge>
        );
      case RegisterSlotStatus.Ongoing:
        return (
          <Badge className="bg-green-100 text-gray-500 border border-gray-400 shadow-sm">
            Ongoing
          </Badge>
        );
      case RegisterSlotStatus.Expired:
        return (
          <Badge className="bg-red-100 text-red-700 border border-red-300 shadow-sm">
            Expired
          </Badge>
        );
      default:
        return null;
    }
  };

  const toggleSort = () => {
    const nextOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(nextOrder);

    // Update All Meetings, used as main data source
    const sortedAll = sortMeetingsByDate([...allMeetings], nextOrder);
    setAllMeetings(sortedAll);

    // Update Meetings, used as displayed data
    const filtered = filterMeetingsByCategory(sortedAll, selectedCategory);
    setMeetings(filtered);
    setCurrentPage(1);

    console.log(`Sorted into ${nextOrder}`);
    console.table(filtered.map(f => ({
      title: f.title,
      meetingDate: f.meetingDate
    })));

  };


  const handleLoadingBtns = (
    meetingSlotId: string,
    operation: "add" | "delete"
  ) => {
    if (operation === "add") {
      setLoadingBtns((prev) => ({ ...prev, [meetingSlotId]: true }));
    } else {
      setLoadingBtns((prev) => {
        const updated = { ...prev };
        delete updated[meetingSlotId];
        return updated;
      });
    }
  };

  const handleFilterChange = async (value: string) => {
    setSelectedCategory(value);
    const filtered = filterMeetingsByCategory([...allMeetings], value);
    const sorted = sortMeetingsByDate(filtered, sortOrder);
    setMeetings(sorted);
  };

  const sortMeetingsByDate = (data: BookedMeeting[], order: 'asc' | 'desc') => {
    return [...data].sort((a, b) => {
      const dateA = new Date(a.meetingDate).getTime();
      const dateB = new Date(b.meetingDate).getTime();
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
  };

  const filterMeetingsByCategory = (data: BookedMeeting[], category: string) => {
    if (category === 'all' || category === '') return data;
    return data.filter(m => m.category === category);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3.5 mb-4">
        <h2 className="text-xl font-bold text-gray-700 tracking-tight">Meetings</h2>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
          <div className="flex flex-col md:flex-row gap-2">
            <Select name='select-meeting-sort' value={filterType} onValueChange={(val) => setFilterType(val as "all" | "bookedByMe" | "bookedMine")}>
              <SelectTrigger id='select-meeting-sort-trigger' className="w-full focus:outline-none focus:ring-0">
                <SelectValue id='select-meeting-sort-value' placeholder="Filter Meetings" />
              </SelectTrigger>
              <SelectContent id='select-meeting-sort-content' className='bg-white'>
                {
                  [{ value: 'all', label: 'All Meetings' },
                  { value: 'bookedByMe', label: "Meetings I've Booked" },
                  { value: 'bookedMine', label: "Meetings of Searched User Booked Mine" }
                  ].map((option) => (
                    <SelectItem key={option.value}
                      value={option.value}
                      className={filterType === option.value ? "text-gray-600" : ""}
                    >
                      {option.label}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
            <Select name='select-by-categories' value={selectedCategory} onValueChange={(val) => handleFilterChange(val)}>
              <SelectTrigger className="w-full focus:outline-none focus:ring-0">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            id='sort-by-date'
            name='sort-by-date'
            onClick={toggleSort}
            variant="ghost"
            className={`
    group
    relative
    flex items-center gap-1 text-sm font-medium
    text-gray-500
    hover:text-primary transition-colors duration-300
    px-3 py-1.5 rounded-lg
    border border-transparent hover:border-gray-300
    shadow-sm hover:shadow-md
    bg-transparent
    backdrop-blur-sm
  `}
          >
            <span className="relative z-10">Meeting At</span>
            <motion.div
              key={sortOrder}
              initial={{ y: -4, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {sortOrder === 'asc' ? (
                <ChevronUp className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors" />
              )}
            </motion.div>
          </Button>

        </div>
      </div>


      {
        (isLoading || !currentUserTimeZone) ? < MeetingSlotCardSkeleton />
          : meetings && meetings.length > 0 ?
            meetings.slice(
              maxItems * (currentPage - 1),
              maxItems * (currentPage - 1) + maxItems
            ).map((meeting, index) => (
              <motion.div
                key={meeting._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="p-6 rounded-3xl border border-muted bg-gradient-to-br from-background via-background/90 to-background/80 shadow-[0_8px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300">
                  <div className="space-y-5">
                    {/* Title & Badge */}
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-semibold text-foreground">{meeting.title}</h3>
                      {getStatusBadge(meeting.status)}
                    </div>

                    {/* Description */}
                    {meeting.description && (
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {meeting.description}
                      </p>
                    )}

                    {/* Info Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-primary" />
                        {
                          currentUserTimeZone && userTimeZone && meeting.meetingDate && (
                            <span>
                              {meeting.meetingDate ? (
                                DateTime.fromISO(
                                  meeting.meetingDate,
                                ).toFormat('ccc, LLL d')
                              ) : (
                                'Meeting Date Unavailable'
                              )}
                            </span>
                          )
                        }

                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-primary" />
                        <span>
                          {meeting.durationFrom}
                          ({
                            calculateTimeDurationByConvertedTimes(currentUserTimeZone!, userTimeZone, meeting.meetingDate, meeting.durationFrom, meeting.durationTo)
                          })</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-primary" />
                        <span>{meeting.participants} participants</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <CAT key={`cat-index-${index}`} filterType={filterType} status={meeting.status} isBooked={meeting.isBooked} loadingBtns={loadingBtns} handleLoadingBtns={handleLoadingBtns} meetingSlotId={meeting._id} />
                  </div>
                </Card>
              </motion.div>
            )) : (
              <div className="w-full text-center py-6 text-muted-foreground text-sm italic text-gray-700">
                User has no meetings yet.
              </div>
            )
      }

      {
        meetings.length !== 0 &&
        <PaginateButtons
          currentPage={currentPage}
          maxItems={maxItems}
          totalItems={meetings.length}
          handlePaginatePage={(newPage) => setCurrentPage(newPage)}
        />
      }
    </div>
  );
};
