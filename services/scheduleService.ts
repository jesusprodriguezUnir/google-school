import api from './api';
import { TeacherAvailability, ClassSubject, ScheduleSlot } from '../types';

export const scheduleService = {
    // Availability
    getTeacherAvailability: async (teacherId: string): Promise<TeacherAvailability[]> => {
        const response = await api.get(`/schedule/availability/${teacherId}`);
        return response.data;
    },

    setAvailability: async (teacherId: string, day: string, slot: number) => {
        const response = await api.post('/schedule/availability', {
            teacher_id: teacherId,
            day_of_week: day,
            slot_index: slot
        });
        return response.data;
    },

    removeAvailability: async (teacherId: string, day: string, slot: number) => {
        await api.delete(`/schedule/availability/${teacherId}/${day}/${slot}`);
    },

    // Curriculum
    getCurriculum: async (classId: string): Promise<ClassSubject[]> => {
        const response = await api.get(`/schedule/curriculum/${classId}`);
        return response.data;
    },

    setCurriculum: async (classId: string, subjects: Partial<ClassSubject>[]) => {
        const response = await api.post(`/schedule/curriculum/${classId}`, subjects);
        return response.data;
    },

    // Generation
    generateSchedule: async (classId: string): Promise<ScheduleSlot[]> => {
        const response = await api.post(`/schedule/generate/${classId}`);
        return response.data;
    },

    getSchedule: async (classId: string): Promise<ScheduleSlot[]> => {
        const response = await api.get(`/schedule/view/${classId}`);
        return response.data;
    },
};
