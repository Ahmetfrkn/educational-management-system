import api from './api';

export const getStudents = async (search = '') => {
    const response = await api.get('/students', {
        params: { search }
    });
    return response.data;
};
