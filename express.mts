import express from "express";

import { parse } from 'url';
import next from "next";

import dotenv from 'dotenv';
dotenv.config();

import api from './express/index.mts';

const dev = process.env.NODE_ENV === 'development';

const server = express();

const app = next({ dev, port: 3000 });
const handle = app.getRequestHandler();

server.use('/api', api);

server.all(/(.*)/, (req, res) => {
  const parsedUrl = parse(req.url!, true);
  return handle(req, res, parsedUrl);
});

app.prepare().then(() => {
  server.listen(3000, (err) => {
    if (err) throw err;
    console.log(`Express Server running on http://localhost:3000 as ${dev ? 'development' : 'production'}`);
  });
});