import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

let bookmarks = []; // 메모리에 저장 (DB 대체)

app.post('/api/bookmarks', (req, res) => {
  bookmarks = req.body;
  console.log('✅ 북마크 저장 완료!');
  res.status(200).json({ ok: true });
});

app.get('/api/bookmarks', (req, res) => {
  res.json(bookmarks);
});

app.listen(3001, () =>
  console.log('📡 API 서버 실행 중: http://localhost:3001'),
);
