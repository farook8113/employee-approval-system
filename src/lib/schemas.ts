import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['employee', 'manager'], {
    errorMap: () => ({ message: 'Role must be either employee or manager' }),
  }),
})

export const requestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),
  category: z.enum(['Leave', 'Equipment', 'Software Access', 'Budget', 'Travel', 'Other'], {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['Low', 'Medium', 'High'], {
    errorMap: () => ({ message: 'Please select a priority' }),
  }),
  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Please select a valid start date',
  }),
  end_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Please select a valid end date',
  }),
  attachment_url: z.string().url().optional().or(z.literal('')),
}).refine((data) => {
  const start = new Date(data.start_date)
  const end = new Date(data.end_date)
  return end >= start
}, {
  message: 'End date must be on or after start date',
  path: ['end_date'],
})

export const approvalSchema = z.object({
  status: z.enum(['Approved', 'Rejected'], {
    errorMap: () => ({ message: 'Status must be Approved or Rejected' }),
  }),
  manager_comment: z.string().min(3, 'Please provide a justification comment of at least 3 characters'),
})

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
})
