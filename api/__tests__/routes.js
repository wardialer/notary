// routes.test.js
const request = require('supertest');
const path = require('path');
const mongoose = require('mongoose');
const app = require('../app');
const Model = require('../model/document');
const documentLib = require('../libs/document');

let server;
beforeAll(() => {
  server = app.listen(4000);
});

afterAll(() => {
  mongoose.connection.close();
  server.close();
});

describe('document routes tests', () => {
  test('get documents list route GET /document/', async () => {
    const documents = [{ id: 'abc' }];
    Model.find = jest.fn(() => documents);

    const response = await request(server).get('/document/');
    expect(response.status).toEqual(200);
    expect(JSON.parse(response.text)).toEqual(documents);
    Model.find.mockRestore();
  });

  test('get document route GET /document/:hash', async () => {
    const hash = '8578131f4b45dc9ed971c2c6a693b0e0d0e6aaeb2a72c80d1d97bfe9a1b36e77';
    Model.findOne = jest.fn(() => ({ hash }));

    const response = await request(server).get(`/document/${hash}`);
    expect(response.status).toEqual(200);
    expect(JSON.parse(response.text).hash).toEqual(hash);
    Model.findOne.mockRestore();
  });

  test('400 error on invalid hash route GET /document/:hash', async () => {
    const hash = 'aBc';
    Model.findOne = jest.fn(() => ({ hash }));

    const response = await request(server).get(`/document/${hash}`);
    expect(response.status).toEqual(400);
    expect(response.text).toEqual('Invalid Hash');
    Model.findOne.mockRestore();
  });

  test('create document route POST /document/', async () => {
    const document = {
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    };

    documentLib.save = jest.fn(() => new Promise((resolve) => resolve(document)));
    Model.findOne = jest.fn(() => null);

    const response = await request(server)
      .post('/document/')
      .attach('document', path.resolve(__dirname, 'dummy'));

    expect(response.status).toEqual(200);
    expect(JSON.parse(response.text)).toEqual(document);
    Model.findOne.mockRestore();
    documentLib.save.mockRestore();
  });

  test('retrieve existing document if uploaded again route POST /document/', async () => {
    Model.findOne = jest.fn(({ hash }) => ({ hash }));

    const response = await request(server)
      .post('/document/')
      .attach('document', path.resolve(__dirname, 'dummy'));

    expect(response.status).toEqual(200);
    expect(JSON.parse(response.text)).toEqual({ hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' });
    Model.findOne.mockRestore();
  });
});
