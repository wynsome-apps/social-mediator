import express from "express";

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.render('index');
});
app.get('/demo', (req, res) => {
  res.render('demo');
})

export default app;