"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import UserList from "./UserList";

export default function NewMessageDialog({ open, onOpenChange, onContinueToChatBox }: { open: boolean, onOpenChange: (open: boolean) => void; onContinueToChatBox: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-500">Chat with other friend. Here you can add different friends to chat box.</p>
        <UserList onOpenChange={onOpenChange} onContinueToChatBox={onContinueToChatBox} />
      </DialogContent>
    </Dialog>
  );
}