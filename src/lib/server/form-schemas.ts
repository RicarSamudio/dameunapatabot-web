import { z } from 'zod'

const phoneSchema = z.string().trim().min(8).max(32)
const uploadedPhotoSchema = z
  .string()
  .trim()
  .regex(/^\/uploads\/[a-f0-9-]+\.(?:jpg|jpeg|png|webp|gif)$/i, 'Invalid upload reference')

const normalizePhotos = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []

  return value
    .filter((photo): photo is string => typeof photo === 'string')
    .map((photo) => photo.trim())
    .filter((photo) => photo.length > 0)
}

export const adoptionSubmissionSchema = z
  .object({
    type: z.enum(['ADOPTION', 'CAT']).optional().default('ADOPTION'),
    nombreCompleto: z.string().trim().min(2),
    numeroCelular: phoneSchema,
    email: z.string().trim().email(),
    photos: z.array(uploadedPhotoSchema).optional(),
  })
  .passthrough()
  .transform((payload) => ({
    ...payload,
    photos: normalizePhotos(payload.photos),
  }))

export const giveUpSubmissionSchema = z
  .object({
    name: z.string().trim().min(2),
    phone: phoneSchema,
    email: z.string().trim().email().optional().or(z.literal('')),
    animalType: z.string().trim().min(1),
    breed: z.string().optional(),
    age: z.string().optional(),
    sex: z.string().trim().min(1),
    description: z.string().trim().min(10),
    photos: z.array(uploadedPhotoSchema).optional(),
  })
  .passthrough()
  .transform((payload) => ({
    ...payload,
    photos: normalizePhotos(payload.photos),
  }))

export const fosterSubmissionSchema = z
  .object({
    name: z.string().trim().min(2),
    phone: phoneSchema,
    email: z.string().trim().email().optional().or(z.literal('')),
    housingType: z.string().trim().min(2),
    hasPets: z.string().trim().min(1),
    hasChildren: z.string().trim().min(1),
    availability: z.string().trim().min(2),
    experience: z.string().trim().min(5),
    comments: z.string().trim().max(1000).optional().or(z.literal('')),
  })
  .passthrough()

export const volunteerSubmissionSchema = z
  .object({
    name: z.string().trim().min(2),
    phone: phoneSchema,
    email: z.string().trim().email(),
    areas: z.array(z.string().trim().min(1)).min(1),
    availability: z.string().trim().min(2),
    experience: z.string().trim().min(5),
    comments: z.string().trim().max(1000).optional().or(z.literal('')),
  })
  .passthrough()
