import { app } from '../../server/index.js';

export const handler = async (event, context) => {
  const { path, httpMethod, headers, body, queryStringParameters } = event;
  
  const req = {
    method: httpMethod,
    url: path.replace('/.netlify/functions/api', '/api'),
    headers: headers || {},
    body: body ? JSON.parse(body) : undefined,
    query: queryStringParameters || {}
  };

  let response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
    body: ''
  };

  return new Promise((resolve) => {
    const mockRes = {
      status: (code) => {
        response.statusCode = code;
        return mockRes;
      },
      json: (data) => {
        response.body = JSON.stringify(data);
        resolve(response);
      },
      send: (data) => {
        response.body = typeof data === 'string' ? data : JSON.stringify(data);
        resolve(response);
      },
      setHeader: (key, value) => {
        response.headers[key] = value;
      }
    };

    try {
      app(req, mockRes);
    } catch (error) {
      response.statusCode = 500;
      response.body = JSON.stringify({ error: 'Internal Server Error' });
      resolve(response);
    }
  });
};
