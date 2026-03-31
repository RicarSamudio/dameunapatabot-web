import { describe, expect, it } from 'vitest'
import { adoptionSubmissionSchema, giveUpSubmissionSchema } from './form-schemas'

describe('form-schemas', () => {
  it('accepts adoption payload with canonical email/type and normalizes photos', () => {
    const parsed = adoptionSubmissionSchema.safeParse({
      type: 'CAT',
      nombreCompleto: 'Ana Perez',
      numeroCelular: '11223344',
      email: 'ana@example.com',
      photos: ['  /uploads/a.png ', ' /uploads/b.png '],
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.type).toBe('CAT')
      expect(parsed.data.email).toBe('ana@example.com')
      expect(parsed.data.photos).toEqual(['/uploads/a.png', '/uploads/b.png'])
    }
  })

  it('rejects adoption payloads without canonical email', () => {
    const parsed = adoptionSubmissionSchema.safeParse({
      type: 'ADOPTION',
      nombreCompleto: 'Ana Perez',
      numeroCelular: '11223344',
      photos: ['/uploads/a.png'],
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
      photos: [' /uploads/cat-1.webp ', ' /uploads/cat-2.webp '],
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.photos).toEqual(['/uploads/cat-1.webp', '/uploads/cat-2.webp'])
      expect(parsed.data.email).toBe('')
    }
  })
})
