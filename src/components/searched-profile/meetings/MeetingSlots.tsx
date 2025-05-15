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

interface BookedMeeting {
  _id: string;
  title: string;
  description?: string;
  meetingDate: string;
  durationFrom: string;
  durationTo: string;
  participants: number;
  status: "upcoming" | "ongoing" | "completed" | "expired";
  category: string;
  createdAt: string;
  isBooked: boolean;
}


export const MeetingSlots = ({ userId, userTimeZone }: { userId: string; userTimeZone: string }) => {
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
      setAllMeetings(data);
      setMeetings(data);
      setUniqueCategories(responseData.uniqueCategories || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, filterType]);

  // Apply filtering and sorting
  useEffect(() => {
    let filtered = [...allMeetings];

    if (selectedCategory !== 'all' && selectedCategory !== '') {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.meetingDate).getTime();
      const dateB = new Date(b.meetingDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setMeetings(filtered);
  }, [sortOrder, selectedCategory, allMeetings]);


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return (
          <Badge className="bg-blue-100 text-blue-700 border border-blue-300 shadow-sm">
            Upcoming
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-700 border border-green-300 shadow-sm">
            Completed
          </Badge>
        );
      case 'ongoing':
        return (
          <Badge className="bg-green-100 text-gray-500 border border-gray-400 shadow-sm">
            Ongoing
          </Badge>
        );
      case 'expired':
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

    setMeetings((prev) => {
      return [...prev].sort((a, b) => {
        const dateA = new Date(a.meetingDate).getTime();
        const dateB = new Date(b.meetingDate).getTime();
        return nextOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    });
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
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold tracking-tight">Booked Meetings</h2>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
          <div className="flex flex-wrap gap-2">
            <Select value={filterType} onValueChange={(val) => setFilterType(val as "all" | "bookedByMe" | "bookedMine")}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter Meetings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Meetings</SelectItem>
                <SelectItem value="bookedByMe">Meetings I’ve Booked</SelectItem>
                <SelectItem value="bookedMine">Meetings of Searched User Booked Mine</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={(val) => handleFilterChange(val)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
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
            onClick={toggleSort}
            variant="ghost"
            className={`
    group
    relative
    flex items-center gap-1 text-sm font-medium
    text-gray-500 dark:text-gray-400
    hover:text-primary transition-colors duration-300
    px-3 py-1.5 rounded-lg
    border border-transparent hover:border-gray-300 dark:hover:border-gray-600
    shadow-sm hover:shadow-md
    bg-transparent hover:bg-gray-100/60 dark:hover:bg-gray-800/50
    backdrop-blur-sm
  `}
          >
            <span className="relative z-10">Created At</span>
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
                                  convertDateTimeBetweenTimeZones(userTimeZone, currentUserTimeZone, meeting.meetingDate, meeting.durationFrom)
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
                          {convertTimeBetweenTimeZones(currentUserTimeZone!, userTimeZone, meeting.meetingDate, meeting.durationFrom)}
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
                    <CAT filterType={filterType} status={meeting.status} isBooked={meeting.isBooked} loadingBtns={loadingBtns} handleLoadingBtns={handleLoadingBtns} meetingSlotId={meeting._id} />
                  </div>
                </Card>
              </motion.div>
            )) : (
              <div className="w-full text-center py-6 text-muted-foreground text-sm italic">
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
