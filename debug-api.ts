import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const MAXKB_API_KEY = process.env.MAXKB_API_KEY;
const MAXKB_BASE_URL = process.env.MAXKB_BASE_URL;

console.log('MAXKB Config:', {
  baseURL: MAXKB_BASE_URL,
  hasApiKey: !!MAXKB_API_KEY
});

const client = axios.create({
  baseURL: MAXKB_BASE_URL,
  headers: {
    Authorization: `Bearer ${MAXKB_API_KEY}`,
  },
  httpsAgent: new (await import('https')).Agent({
    rejectUnauthorized: false
  })
});

async function testAPI() {
  try {
    // Test 1: Get user info
    console.log('\n===