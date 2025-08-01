const axios = require('axios');

const AUTH_TOKEN = process.env.AUTH_TOKEN || 'web-test-20250801i2f2W';
const API_URL = process.env.API_URL || `https://dropmail.me/api/graphql/${AUTH_TOKEN}`;

exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  };

  if (event.httpMethod === 'OPTIONS') {
    console.log('📋 Nhận yêu cầu OPTIONS cho check-email');
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    console.error('❌ Yêu cầu không phải POST:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Only POST method allowed' })
    };
  }

  const { sessionId } = JSON.parse(event.body || '{}');

  if (!sessionId) {
    console.error('❌ Thiếu sessionId trong yêu cầu');
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'sessionId is required' })
    };
  }

  const query = `
    query {
      session(id: "${sessionId}") {
        id
        expiresAt
        mails {
          id
          fromAddr
          toAddr
          headerSubject
          text
          receivedAt
        }
      }
    }
  `;

  try {
    const response = await axios.post(API_URL, { query }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    console.log('📡 Phản hồi DropMail check-email:', JSON.stringify(response.data, null, 2));
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('❌ Lỗi API check-email:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
