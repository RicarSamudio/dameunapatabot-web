import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const dockerfile = readFileSync(new URL('../../../Dockerfile', import.meta.url), 'utf8')

describe('Dockerfile runtime environment', () => {
  it.each(['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'])(
    'does not bake %s into the build image',
    (variable) => {
      expect(dockerfile).not.toMatch(new RegExp(`^ARG ${variable}$`, 'm'))
      expect(dockerfile).not.toMatch(new RegExp(`^ENV ${variable}=`, 'm'))
    },
  )
})
