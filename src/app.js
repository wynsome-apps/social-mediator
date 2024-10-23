import express from 'express';
import router from './routes/index.js';
import './services/messageworker.service.js';

const app = express();
app.set('view engine', 'ejs');
app.set('views', process.cwd() + '/src/views');
app.use(express.static('public'));

app.use('/', router);

export default app;
