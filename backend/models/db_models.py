from datetime import datetime
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Time, Date, Float, Boolean, Text, Enum, Numeric, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from .base import Base  # Import Base from our local base module

class Exam(Base):
    __tablename__ = 'exams'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    subject_id = Column(UUID(as_uuid=True), ForeignKey('subjects.id'), nullable=False)
    academic_year = Column(String(9), nullable=False)  # e.g., "2023-2024"
    semester = Column(String(20), nullable=False)  # e.g., "Fall", "Spring"
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    duration = Column(Integer, nullable=False)  # in minutes
    exam_type = Column(String(50), nullable=False)  # e.g., "Midterm", "Final"
    max_marks = Column(Integer, default=100)
    passing_marks = Column(Integer, default=35)
    status = Column(String(20), nullable=False, default='Draft')  # Draft, Scheduled, Completed, Cancelled
    description = Column(Text)
    created_by = Column(String, nullable=False)  # Supabase user ID
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    subject = relationship('Subject', backref='exams')
    rooms = relationship('ExamRoom', back_populates='exam', cascade='all, delete-orphan')
    students = relationship('ExamStudent', back_populates='exam', cascade='all, delete-orphan')
    invigilators = relationship('ExamInvigilator', back_populates='exam', cascade='all, delete-orphan')

class ExamRoom(Base):
    __tablename__ = 'exam_rooms'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id = Column(UUID(as_uuid=True), ForeignKey('exams.id'), nullable=False)
    room_id = Column(UUID(as_uuid=True), ForeignKey('rooms.id'), nullable=False)
    max_students = Column(Integer, nullable=False)
    current_students = Column(Integer, default=0)
    
    # Relationships
    exam = relationship('Exam', back_populates='rooms')
    room = relationship('Room', back_populates='exam_rooms')
    students = relationship('ExamStudent', back_populates='exam_room')

class ExamStudent(Base):
    __tablename__ = 'exam_students'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id = Column(UUID(as_uuid=True), ForeignKey('exams.id'), nullable=False)
    student_id = Column(String, nullable=False)  # Supabase user ID
    room_id = Column(UUID(as_uuid=True), ForeignKey('exam_rooms.id'))
    seat_number = Column(String(20))
    status = Column(String(20), default='Registered')  # Registered, Present, Absent, Deferred
    marks_obtained = Column(Float)
    grade = Column(String(5))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    exam = relationship('Exam', back_populates='students')
    student = relationship('User')
    exam_room = relationship('ExamRoom', back_populates='students')

class ExamInvigilator(Base):
    __tablename__ = 'exam_invigilators'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id = Column(UUID(as_uuid=True), ForeignKey('exams.id'), nullable=False)
    staff_id = Column(String, nullable=False)  # Supabase user ID
    role = Column(String(50), nullable=False)  # Chief Invigilator, Invigilator, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    exam = relationship('Exam', back_populates='invigilators')
    staff = relationship('User')


# Student Dashboard Models
class Attendance(Base):
    __tablename__ = 'attendance'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String(20), nullable=False)  # present, absent, late, excused
    subject_id = Column(UUID(as_uuid=True), ForeignKey('subjects.id'))
    recorded_by = Column(String)  # Supabase user ID, nullable because not all records may have a recorded_by
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    student = relationship('Student', back_populates='attendance_records')
    subject = relationship('Subject')
    recorded_by_user = relationship('User', foreign_keys=[recorded_by])
    
    __table_args__ = (
        CheckConstraint("status IN ('present', 'absent', 'late', 'excused')", 
                       name='check_attendance_status'),
        {}
    )


class Mark(Base):
    __tablename__ = 'marks'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    subject_id = Column(UUID(as_uuid=True), ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False)
    exam_id = Column(UUID(as_uuid=True), ForeignKey('exams.id', ondelete='CASCADE'), nullable=False)
    marks_obtained = Column(Numeric(5, 2))
    max_marks = Column(Numeric(5, 2), nullable=False, server_default='100')
    grade = Column(String(2))
    remarks = Column(Text)
    recorded_by = Column(String)  # Supabase user ID, nullable because not all records may have a recorded_by
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    student = relationship('Student', back_populates='marks')
    subject = relationship('Subject')
    exam = relationship('Exam')
    recorded_by_user = relationship('User', foreign_keys=[recorded_by])


class Fee(Base):
    __tablename__ = 'fees'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    fee_type = Column(String(50), nullable=False)  # tuition, hostel, library, etc.
    amount = Column(Numeric(10, 2), nullable=False)
    due_date = Column(Date)
    status = Column(String(20), nullable=False, server_default='unpaid')  # paid, unpaid, partial, waived
    payment_date = Column(Date)
    payment_method = Column(String(50))
    transaction_id = Column(String(100))
    receipt_number = Column(String(100))
    academic_year = Column(String(20))
    semester = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    student = relationship('Student', back_populates='fees')
    
    __table_args__ = (
        CheckConstraint("status IN ('paid', 'unpaid', 'partial', 'waived')", 
                       name='check_fee_status'),
        {}
    )


class Internship(Base):
    __tablename__ = 'internships'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    company_name = Column(String(255), nullable=False)
    position = Column(String(255), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    status = Column(String(50), nullable=False, server_default='applied')  # applied, in_progress, completed, rejected
    description = Column(Text)
    supervisor_name = Column(String(255))
    supervisor_email = Column(String(255))
    supervisor_phone = Column(String(50))
    is_paid = Column(Boolean, default=False)
    stipend_amount = Column(Numeric(10, 2))
    certificate_url = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    student = relationship('Student', back_populates='internships')
    
    __table_args__ = (
        CheckConstraint("status IN ('applied', 'in_progress', 'completed', 'rejected')", 
                       name='check_internship_status'),
        {}
    )


class Subject(Base):
    __tablename__ = 'subjects'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_code = Column(String(50), unique=True, nullable=False)
    subject_name = Column(String(255), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey('courses.id'))
    semester = Column(Integer)
    credits = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    course = relationship('Course')


# Update Student model with new relationships
def update_student_model():
    from sqlalchemy.orm import relationship
    
    # Add relationships to Student model if it exists
    if hasattr(Base, 'Student'):
        Base.Student.attendance_records = relationship('Attendance', back_populates='student')
        Base.Student.marks = relationship('Mark', back_populates='student')
        Base.Student.fees = relationship('Fee', back_populates='student')
        Base.Student.internships = relationship('Internship', back_populates='student')

# Call the function to update the Student model
update_student_model()
