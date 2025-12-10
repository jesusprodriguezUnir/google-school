import React, { useEffect, useRef } from 'react';

const DIAGRAM_DEFINITION = `
erDiagram
    %% User Management
    User {
        String id PK
        String name
        String email
        String hashed_password
        Enum role
        String avatar
        Integer max_weekly_hours "Teacher"
        String specialization "Teacher"
        String class_id FK "Student"
    }

    ClassGroup {
        String id PK
        String name
        Enum level
        String teacher_id FK "Tutor"
    }

    %% Relationships User-Class
    User ||--o{ ClassGroup : "teaches (as tutor)"
    ClassGroup ||--o{ User : "has students"
    
    %% Parent-Student (Many to Many)
    parent_student {
        String parent_id FK
        String student_id FK
    }
    User }|--|{ parent_student : "is parent/child"

    %% Academics
    Grade {
        String id PK
        String student_id FK
        String subject
        Float score
        String feedback
        String date
    }
    User ||--o{ Grade : "has grades"

    %% Curriculum & Schedule
    SubjectTemplate {
        String id PK
        String name
        Integer default_hours
        Enum education_level
    }

    ClassSubject {
        String id PK
        String class_id FK
        String name
        String teacher_id FK
        Integer hours_weekly
    }
    ClassGroup ||--o{ ClassSubject : "has subjects"
    
    %% Fixed one-to-many from User to Subjects
    User ||--o{ ClassSubject : "teaches subject"

    ScheduleSlot {
        String id PK
        String class_id FK
        String subject_id FK
        String day_of_week
        Integer slot_index
    }
    ClassGroup ||--o{ ScheduleSlot : "has schedule"
    ClassSubject ||--o{ ScheduleSlot : "is scheduled in"

    TeacherAvailability {
        String id PK
        String teacher_id FK
        String day_of_week
        Integer slot_index
    }
    User ||--o{ TeacherAvailability : "has availability"

    %% Finance & Comms
    Invoice {
        String id PK
        String parent_id FK
        String student_id FK
        Float amount
        Enum status
        Enum type
        String due_date
    }
    User ||--o{ Invoice : "billed to (Parent)"

    Announcement {
        String id PK
        String author_id FK
        String title
        String content
        String date
        String target_class_id FK
    }
    User ||--o{ Announcement : "authors"
    ClassGroup ||--o{ Announcement : "receives"
`;

declare global {
    interface Window {
        mermaid: any;
    }
}

export const DatabaseSchemaPage: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Dynamically load mermaid from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js';
        script.async = true;

        script.onload = () => {
            if (window.mermaid) {
                window.mermaid.initialize({ startOnLoad: true, theme: 'default' });
                if (containerRef.current) {
                    window.mermaid.init(undefined, containerRef.current.querySelector('.mermaid'));
                }
            }
        };

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        }
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Database Architecture</h2>
                <p className="text-gray-500">
                    Live Entity-Relationship Diagram (ERD) of the application's data models.
                </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-x-auto">
                <div ref={containerRef}>
                    <pre className="mermaid">
                        {DIAGRAM_DEFINITION}
                    </pre>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                <strong>Note:</strong> This diagram is generated dynamically using Mermaid.js based on the current backend <code>models.py</code> definition.
            </div>
        </div>
    );
};
