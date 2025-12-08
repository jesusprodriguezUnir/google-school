import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SmartGradebook } from '../components/SmartGradebook';
import { User, Grade, UserRole } from '../types';

describe('SmartGradebook', () => {
    const mockStudents: User[] = [
        { id: 's1', name: 'Alice', email: 'alice@test.com', role: UserRole.STUDENT, avatar: '' },
        { id: 's2', name: 'Bob', email: 'bob@test.com', role: UserRole.STUDENT, avatar: '' },
    ];

    const mockGrades: Grade[] = [
        { id: 'g1', studentId: 's1', subject: 'Math', score: 9, feedback: '', date: '' },
        { id: 'g2', studentId: 's2', subject: 'Math', score: 4, feedback: '', date: '' },
    ];

    const subjects = ['Math'];
    const onUpdateGrade = vi.fn();

    it('renders students correctly', () => {
        render(
            <SmartGradebook
                students={mockStudents}
                grades={mockGrades}
                subjects={subjects}
                onUpdateGrade={onUpdateGrade}
            />
        );
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('filters failing students when "Needs Attention" is clicked', () => {
        render(
            <SmartGradebook
                students={mockStudents}
                grades={mockGrades}
                subjects={subjects}
                onUpdateGrade={onUpdateGrade}
            />
        );

        // Initial state: Both present
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();

        // Click Filter
        fireEvent.click(screen.getByText('Needs Attention'));

        // Alice (9) should be gone, Bob (4) should remain
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('calls onUpdateGrade when input changes', () => {
        render(
            <SmartGradebook
                students={mockStudents}
                grades={mockGrades}
                subjects={subjects}
                onUpdateGrade={onUpdateGrade}
            />
        );

        const input = screen.getByDisplayValue('9');
        fireEvent.change(input, { target: { value: '10' } });

        expect(onUpdateGrade).toHaveBeenCalledWith('s1', 'Math', '10');
    });
});
