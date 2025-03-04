const request = require('supertest')
const server = require('./server')
const db = require('../data/dbConfig')

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})

beforeEach(async () => {
  await db('users').truncate()
})

afterAll(async () => {
  await db.destroy()
})

describe('server.js', () => {
  it('is the correct testing environment', async () => {
    expect(process.env.NODE_ENV).toBe('testing')
  })
})

describe('auth endpoints', () => {
  describe('[POST] /api/auth/register', () => {
    it('returns 201 when provided valid credentials', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({ username: 'test', password: 'password' })
      
      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('id')
      expect(res.body).toHaveProperty('username', 'test')
    })

    it('returns 400 when username is missing', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({ password: 'password' })
      
      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/username and password required/i)
    })

    it('returns 400 when password is missing', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({ username: 'test' })
      
      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/username and password required/i)
    })
  })

  describe('[POST] /api/auth/login', () => {
    it('returns a token when login is successful', async () => {
      // Register a user first
      await request(server)
        .post('/api/auth/register')
        .send({ username: 'test', password: 'password' })
      
      // Then login with same credentials
      const res = await request(server)
        .post('/api/auth/login')
        .send({ username: 'test', password: 'password' })
      
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('token')
      expect(res.body.message).toMatch(/welcome/i)
    })

    it('returns 401 with invalid credentials', async () => {
      // Register a user first
      await request(server)
        .post('/api/auth/register')
        .send({ username: 'test', password: 'password' })
      
      // Then try to login with wrong password
      const res = await request(server)
        .post('/api/auth/login')
        .send({ username: 'test', password: 'wrongpassword' })
      
      expect(res.status).toBe(401)
      expect(res.body.message).toMatch(/invalid credentials/i)
    })
  })
})

describe('jokes endpoints', () => {
  describe('[GET] /api/jokes', () => {
    it('returns 401 when token is not provided', async () => {
      const res = await request(server).get('/api/jokes')
      
      expect(res.status).toBe(401)
      expect(res.body.message).toMatch(/token required/i)
    })

    it('returns jokes when token is valid', async () => {
      // Register a user first
      await request(server)
        .post('/api/auth/register')
        .send({ username: 'test', password: 'password' })
      
      // Then login to get token
      const loginRes = await request(server)
        .post('/api/auth/login')
        .send({ username: 'test', password: 'password' })
      
      const token = loginRes.body.token
      
      // Use token to get jokes
      const jokesRes = await request(server)
        .get('/api/jokes')
        .set('Authorization', token)
      
      expect(jokesRes.status).toBe(200)
      expect(Array.isArray(jokesRes.body)).toBe(true)
    })
  })
})