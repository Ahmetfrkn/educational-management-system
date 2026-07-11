import api from './api';

// Fetch inbox messages (paginated, searchable)
export const getInbox = async (page = 1, search = '') => {
    const response = await api.get('/messages/inbox', {
        params: { page, search: search || undefined }
    });
    return response.data;
};

// Fetch sent messages (paginated, searchable)
export const getSent = async (page = 1, search = '') => {
    const response = await api.get('/messages/sent', {
        params: { page, search: search || undefined }
    });
    return response.data;
};

// Fetch a single message (marks as read if receiver)
export const getMessage = async (id) => {
    const response = await api.get(`/messages/${id}`);
    return response.data;
};

// Send a new message
export const sendMessage = async (data) => {
    const response = await api.post('/messages', data);
    return response.data;
};

// Delete a message (soft-delete for current user)
export const deleteMessage = async (id) => {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
};

// Get unread message count
export const getUnreadCount = async () => {
    const response = await api.get('/messages/unread-count');
    return response.data;
};

// Get eligible recipients based on role
export const getRecipients = async (search = '') => {
    const response = await api.get('/messages/recipients', {
        params: { search: search || undefined }
    });
    return response.data;
};
