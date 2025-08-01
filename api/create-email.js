const axios = require('axios');

const AUTH_TOKEN = process.env.AUTH_TOKEN || 'web-test-20250801i2f2W';
const API_URL = process.env.API_URL || `https://dropmail.me/api/graphql/${AUTH_TOKEN}`;

exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };

  if (event.httpMethod === 'OPTIONS') {
    console.log('📋 Nhận yêu cầu OPTIONS cho create-email');
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

  const { domainId = 'RG9tYWluOjI=' } = JSON.parse(event.body || '{}');
  const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2);

  const query = `
    mutation {
      introduceSession(input: {
        withAddress: true,
        domainId: "${domainId}"
      }) {
        id
        expiresAt
        addresses {
          address
          restoreKey
        }
      }
    }
  `;

  try {
    const response = await axios.post(`${API_URL}?cacheBuster=${uniqueId}`, { query }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    console.log('📡 Phản hồi DropMail create-email:', JSON.stringify(response.data, null, 2));
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('❌ Lỗi API create-email:', error.message, error.response?.data);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
