'use client';

import React from 'react';
import ViewDetails from './ViewDetails';
import { PopularMeeting } from '@/types/client-types';
import { formateSlotMeetingDate } from '../my-slots/SlotCard';

export const MeetingCard = ({ meeting }: { meeting: PopularMeeting }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 p-6 space-y-5 flex flex-col h-full">
      {/* Category Pill */}
      <span className="inline-block bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 px-4 py-1 text-xs font-semibold rounded-full shadow-sm max-w-max">
        {meeting.category}
      </span>

      {/* Meeting Title with Truncate */}
      <h3 className="text-xl font-bold text-gray-900 leading-snug truncate">
        {meeting.title}
      </h3>

      {/* Date and Time */}
      <div className="flex items-center text-gray-600 text-sm gap-2">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>
          {formateSlotMeetingDate(meeting.meetingDate)}{' '}
          at {meeting.durationFrom}
        </span>
      </div>

      {/* Guests */}
      <div className="flex items-center text-gray-600 text-sm gap-2">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span>
          {meeting.guestSize} guests{' '}
          <span className="text-gray-400">({meeting.totalParticipants} total)</span>
        </span>
      </div>

      {/* Engagement Rate */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Engagement Rate</span>
          <span className="font-medium text-gray-700">{meeting.engagementRate * 100}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${meeting.engagementRate * 100}%` }}
          />
        </div>
      </div>

      {/* View Details Button */}
      <ViewDetails meeting={meeting} />
    </div>
  );
};
