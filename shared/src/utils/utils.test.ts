import {
  validateEmail,
  validatePhone,
  validateVIN,
  validateZipCode,
  capitalizeFirst,
  capitalizeWords,
  formatCurrency,
  formatDate,
  unique,
  isEmpty,
  delay,
  debounce,
  buildQueryString,
  formatFileSize,
} from './index'

describe('Validation utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid.email')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      expect(validatePhone('1234567890')).toBe(true)
      expect(validatePhone('+1 (555) 123-4567')).toBe(true)
      expect(validatePhone('+1-555-123-4567')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false)
      expect(validatePhone('abc-def-ghij')).toBe(false)
    })
  })

  describe('validateVIN', () => {
    it('should validate correct VINs', () => {
      expect(validateVIN('1HGBH41JXMN109186')).toBe(true)
      expect(validateVIN('JH4TB2H26CC000000')).toBe(true)
    })

    it('should reject invalid VINs', () => {
      expect(validateVIN('1HGBH41JXMN10918')).toBe(false) // too short
      expect(validateVIN('1HGBH41JXMN1091866')).toBe(false) // too long
      expect(validateVIN('1HGBH41JXMN109I86')).toBe(false) // contains I
    })
  })

  describe('validateZipCode', () => {
    it('should validate correct ZIP codes', () => {
      expect(validateZipCode('12345')).toBe(true)
      expect(validateZipCode('12345-6789')).toBe(true)
    })

    it('should reject invalid ZIP codes', () => {
      expect(validateZipCode('1234')).toBe(false)
      expect(validateZipCode('12345-678')).toBe(false)
      expect(validateZipCode('abcde')).toBe(false)
    })
  })
})

describe('String utilities', () => {
  describe('capitalizeFirst', () => {
    it('should capitalize the first letter', () => {
      expect(capitalizeFirst('hello')).toBe('Hello')
      expect(capitalizeFirst('WORLD')).toBe('World')
    })
  })

  describe('capitalizeWords', () => {
    it('should capitalize all words', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World')
      expect(capitalizeWords('JOHN DOE')).toBe('John Doe')
    })
  })
})

describe('Number utilities', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      const formatted = formatCurrency(1234.56)
      expect(formatted).toMatch(/\$1,234\.56/)
    })
  })
})

describe('Date utilities', () => {
  describe('formatDate', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const formatted = formatDate(date, 'en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
      expect(formatted).toBe('Jan 15, 2024')
    })
  })
})

describe('Array utilities', () => {
  describe('unique', () => {
    it('should remove duplicates', () => {
      expect(unique([1, 2, 2, 3, 3, 4])).toEqual([1, 2, 3, 4])
      expect(unique(['a', 'b', 'b', 'c'])).toEqual(['a', 'b', 'c'])
    })
  })
})

describe('Object utilities', () => {
  describe('isEmpty', () => {
    it('should correctly identify empty values', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
      expect(isEmpty([])).toBe(true)
      expect(isEmpty({})).toBe(true)
      expect(isEmpty('')).toBe(true)
    })

    it('should correctly identify non-empty values', () => {
      expect(isEmpty([1])).toBe(false)
      expect(isEmpty({ a: 1 })).toBe(false)
      expect(isEmpty('hello')).toBe(false)
      expect(isEmpty(0)).toBe(false)
    })
  })
})

describe('Async utilities', () => {
  describe('delay', () => {
    it('should delay execution', async () => {
      const start = Date.now()
      await delay(100)
      const end = Date.now()
      expect(end - start).toBeGreaterThanOrEqual(95) // Allow some tolerance
    })
  })

  describe('debounce', () => {
    it('should debounce function calls', (done) => {
      let callCount = 0
      const fn = () => callCount++
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      setTimeout(() => {
        expect(callCount).toBe(1)
        done()
      }, 150)
    })
  })
})

describe('URL utilities', () => {
  describe('buildQueryString', () => {
    it('should build query strings correctly', () => {
      const params = { name: 'John', age: 30, active: true }
      const queryString = buildQueryString(params)
      expect(queryString).toBe('?name=John&age=30&active=true')
    })

    it('should handle empty params', () => {
      expect(buildQueryString({})).toBe('')
    })
  })
})

describe('File utilities', () => {
  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(1073741824)).toBe('1 GB')
    })
  })
})