const { registerRoutes } = require('../../server/routes');
const express = require('express');

const app = express();
app.use(express.json());
registerRoutes(app);

exports.handler = async (event, context) => {
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
      const originalUrl = req.url;
      req.originalUrl = originalUrl;
      req.path = originalUrl.split('?')[0];
      
      app(req, mockRes, () => {
        response.statusCode = 404;
        response.body = JSON.stringify({ error: 'Not Found' });
        resolve(response);
      });
    } catch (error) {
      console.error('Handler error:', error);
      response.statusCode = 500;
      response.body = JSON.stringify({ error: 'Internal Server Error' });
      resolve(response);
    }
  });
};
