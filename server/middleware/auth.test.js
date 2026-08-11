const test = require('node:test')
const assert = require('node:assert/strict')
const { EventEmitter } = require('node:events')
const jwt = require('jsonwebtoken')

process.env.JWT_SECRET ||= 'test-secret-at-least-32-characters-long'
const prisma = require('../prisma')
const { auditMiddleware, redactSensitive, requireAuth } = require('./auth')

function response(statusCode = 200) {
  const res = new EventEmitter()
  res.statusCode = statusCode
  res.locals = {}
  res.body = null
  res.status = (nextStatus) => {
    res.statusCode = nextStatus
    return res
  }
  res.json = (body) => {
    res.body = body
    return body
  }
  return res
}

function authenticatedRequest(payload = { id: 'user-1', email: 'stale@example.com', role: 'ADMIN' }) {
  const token = jwt.sign(payload, process.env.JWT_SECRET)
  return { headers: { authorization: `Bearer ${token}` }, cookies: {} }
}

test('requireAuth rejects a valid token when the admin user was deleted', async () => {
  const originalFindUnique = prisma.adminUser.findUnique
  prisma.adminUser.findUnique = async () => null
  try {
    const req = authenticatedRequest()
    const res = response()
    let nextCalls = 0
    await requireAuth(req, res, () => { nextCalls += 1 })
    assert.equal(res.statusCode, 401)
    assert.equal(nextCalls, 0)
  } finally {
    prisma.adminUser.findUnique = originalFindUnique
  }
})

test('requireAuth rejects a user without the ADMIN role', async () => {
  const originalFindUnique = prisma.adminUser.findUnique
  prisma.adminUser.findUnique = async () => ({ id: 'user-1', email: 'user@example.com', name: 'User', role: 'USER' })
  try {
    const req = authenticatedRequest()
    const res = response()
    let nextCalls = 0
    await requireAuth(req, res, () => { nextCalls += 1 })
    assert.equal(res.statusCode, 403)
    assert.equal(nextCalls, 0)
  } finally {
    prisma.adminUser.findUnique = originalFindUnique
  }
})

test('requireAuth uses the current ADMIN user from the database', async () => {
  const originalFindUnique = prisma.adminUser.findUnique
  const currentUser = { id: 'user-1', email: 'current@example.com', name: 'Current Admin', role: 'ADMIN' }
  prisma.adminUser.findUnique = async () => currentUser
  try {
    const req = authenticatedRequest()
    const res = response()
    let nextCalls = 0
    await requireAuth(req, res, () => { nextCalls += 1 })
    assert.equal(nextCalls, 1)
    assert.deepEqual(req.user, currentUser)
  } finally {
    prisma.adminUser.findUnique = originalFindUnique
  }
})

test('requireAuth forwards database errors', async () => {
  const originalFindUnique = prisma.adminUser.findUnique
  const databaseError = new Error('database unavailable')
  prisma.adminUser.findUnique = async () => { throw databaseError }
  try {
    const req = authenticatedRequest()
    const res = response()
    let forwardedError
    await requireAuth(req, res, (error) => { forwardedError = error })
    assert.equal(forwardedError, databaseError)
    assert.equal(res.statusCode, 200)
  } finally {
    prisma.adminUser.findUnique = originalFindUnique
  }
})

test('requireAuth rejects an invalid token without querying the database', async () => {
  const originalFindUnique = prisma.adminUser.findUnique
  let databaseCalls = 0
  prisma.adminUser.findUnique = async () => { databaseCalls += 1 }
  try {
    const req = { headers: { authorization: 'Bearer invalid-token' }, cookies: {} }
    const res = response()
    let nextCalls = 0
    await requireAuth(req, res, () => { nextCalls += 1 })
    assert.equal(res.statusCode, 401)
    assert.equal(databaseCalls, 0)
    assert.equal(nextCalls, 0)
  } finally {
    prisma.adminUser.findUnique = originalFindUnique
  }
})

test('redactSensitive removes nested credentials without changing other fields', () => {
  assert.deepEqual(redactSensitive({ name: 'Admin', password: 'secret', nested: { token: 'jwt', note: 'ok' } }), { name: 'Admin', password: '[REDACTED]', nested: { token: '[REDACTED]', note: 'ok' } })
})

test('auditMiddleware records successful DELETE responses returning 204', async () => {
  const originalCreate = prisma.auditLog.create
  let recorded
  prisma.auditLog.create = async ({ data }) => { recorded = data }
  try {
    const req = { method: 'DELETE', params: { id: 'product-1' }, user: { id: 'user-1', email: 'admin@example.com' }, body: {}, ip: '127.0.0.1' }
    const res = response(204)
    auditMiddleware('Product')(req, res, () => {})
    res.emit('finish')
    await new Promise(resolve => setImmediate(resolve))
    assert.equal(recorded.action, 'DELETE')
    assert.equal(recorded.entityId, 'product-1')
    assert.equal(recorded.details, null)
  } finally {
    prisma.auditLog.create = originalCreate
  }
})

test('auditMiddleware ignores failed responses', async () => {
  const originalCreate = prisma.auditLog.create
  let calls = 0
  prisma.auditLog.create = async () => { calls += 1 }
  try {
    const req = { method: 'PUT', params: { id: 'product-1' }, user: { id: 'user-1', email: 'admin@example.com' }, body: {}, ip: '127.0.0.1' }
    const res = response(400)
    auditMiddleware('Product')(req, res, () => {})
    res.emit('finish')
    await new Promise(resolve => setImmediate(resolve))
    assert.equal(calls, 0)
  } finally {
    prisma.auditLog.create = originalCreate
  }
})
