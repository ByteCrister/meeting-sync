import apiService from "./api-services";

export const getPopBookedUsers = async (slotId: string) => {
    const resData = await apiService.get(`/api/user-slot-register/booked-users`, { slotId, type: "users" });
    return resData;
};

export const getAllPopBlockedUsers = async (slotId: string) => {
    const resData = await apiService.get(`/api/user-slot-register/booked-users`, { slotId, type: "blocked-users" });
    return resData;
};

export const performPopBlockUser = async (userId: string, slotId: string) => {
    const resData = await apiService.post(`/api/user-slot-register/booked-users`, { userId, slotId });
    return resData;
};

export const performPopUnBlockUser = async (userId: string, slotId: string) => {
    const resData = await apiService.put(`/api/user-slot-register/booked-users`, { userId, slotId, type: 'unblock-user' });
    return resData;
};

export const performPopRemoveUser = async (userId: string, slotId: string) => {
    const responseData = await apiService.delete("/api/user-slot-register/booked-users", { slotId, userId });
    return responseData;
}

export const performUndoPopUserRemove = async(userId: string, slotId: string)=>{
    const resData = await apiService.put(`/api/user-slot-register/booked-users`, { userId, slotId, type: 'undo-remove-user' });
    return resData;
}