/**
 * api/ai.js
 * ─────────
 * AI Assistant API calls powered by Mistral AI (via FastAPI backend).
 *
 * Backend endpoints:
 *   POST /ai/chat           – send a message and receive a streamed or full reply
 *   GET  /ai/history        – retrieve conversation history
 *   POST /ai/summarize      – summarise a patient record
 *   POST /ai/analyze        – analyse clinical notes / observations
 */
import client from './client'

/**
 * Send a chat message to the AI assistant.
 * @param {Object} payload – { message, patient_id?, conversation_id? }
 */
export async function sendAIMessage(payload) {
  const { data } = await client.post('/ai/chat', payload)
  return data
}

/**
 * Retrieve conversation history.
 * @param {string} [conversationId] – optional session ID
 */
export async function getAIHistory(conversationId) {
  const params = conversationId ? { conversation_id: conversationId } : {}
  const { data } = await client.get('/ai/history', { params })
  return data
}

/**
 * Request an AI summary of a patient's medical record.
 * @param {string|number} patientId
 */
export async function summarizePatient(patientId) {
  const { data } = await client.post('/ai/summarize', { patient_id: patientId })
  return data
}

/**
 * Analyse clinical text / observations.
 * @param {Object} payload – { text, context? }
 */
export async function analyzeText(payload) {
  const { data } = await client.post('/ai/analyze', payload)
  return data
}
