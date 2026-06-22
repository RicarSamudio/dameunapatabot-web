import { describe, expect, it } from 'vitest'
import { adoptionSubmissionSchema, giveUpSubmissionSchema } from './form-schemas'

describe('form-schemas', () => {
  it('accepts adoption payload with canonical email/type and normalizes photos', () => {
    const parsed = adoptionSubmissionSchema.safeParse({
      type: 'CAT',
      nombreCompleto: 'Ana Perez',
      numeroCelular: '11223344',
      email: 'ana@example.com',
      photos: [
        '  /uploads/11111111-1111-4111-8111-111111111111.png ',
        ' /uploads/22222222-2222-4222-8222-222222222222.png ',
      ],
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.type).toBe('CAT')
      expect(parsed.data.email).toBe('ana@example.com')
      expect(parsed.data.photos).toEqual([
        '/uploads/11111111-1111-4111-8111-111111111111.png',
        '/uploads/22222222-2222-4222-8222-222222222222.png',
      ])
    }
  })

  it('rejects adoption payloads without canonical email', () => {
    const parsed = adoptionSubmissionSchema.safeParse({
      type: 'ADOPTION',
      nombreCompleto: 'Ana Perez',
      numeroCelular: '11223344',
      photos: ['/uploads/33333333-3333-4333-8333-333333333333.png'],
    })

    expect(parsed.success).toBe(false)
  })

  it('rejects adoption photos that are not local upload references', () => {
    const parsed = adoptionSubmissionSchema.safeParse({
      type: 'ADOPTION',
      nombreCompleto: 'Ana Perez',
      numeroCelular: '11223344',
      email: 'ana@example.com',
      photos: ['https://evil.example/payload.jpg'],
    })

    expect(parsed.success).toBe(false)
  })

  it('rejects adoption photos with traversal-like paths', () => {
    const parsed = adoptionSubmissionSchema.safeParse({
      type: 'ADOPTION',
      nombreCompleto: 'Ana Perez',
      numeroCelular: '11223344',
      email: 'ana@example.com',
      photos: ['/uploads/../secret.png'],
    })

    expect(parsed.success).toBe(false)
  })

  it('validates give-up canonical fields and normalizes photos', () => {
    const parsed = giveUpSubmissionSchema.safeParse({
      name: 'Juan Perez',
      phone: '11998877',
      email: '',
      animalType: 'CAT',
      breed: 'Mestizo',
      age: '2',
      sex: 'M',
      description: 'Tiene buen comportamiento y está vacunado.',
      photos: [
        ' /uploads/44444444-4444-4444-8444-444444444444.webp ',
        ' /uploads/55555555-5555-4555-8555-555555555555.webp ',
      ],
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.photos).toEqual([
        '/uploads/44444444-4444-4444-8444-444444444444.webp',
        '/uploads/55555555-5555-4555-8555-555555555555.webp',
      ])
      expect(parsed.data.email).toBe('')
    }
  })
})
