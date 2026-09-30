
// ───────────────────────── voice lines (Misaki): audio/voice/<id>.mp3 ─────────────────────────
// jp is the spoken line, en the subtitle (a tr() key). Data only; played with audio.speak(id).
const VOICE = {
  v01: { jp: 'ここから、出なきゃ……', en: 'I have to get out of here...' },
  v02: { jp: '花子さん、遊びましょ', en: '"Hanako-san... will you come out and play?"' },
  v03: { jp: '先生……？', en: '"Sensei...?"' },
  v04: { jp: 'うそ……戻ってる……？', en: 'No... I\'m back where I started?' },
  v05: { jp: '……十三段目？', en: '...A thirteenth step?' },
  v06: { jp: '……わたし？', en: '...That\'s me?' },
  v07: { jp: '私は、眠ってなんかいなかった。', en: 'I never fell asleep.' },
  v08: { jp: 'こっくりさん、こっくりさん、おいでください。', en: '"Kokkuri-san, Kokkuri-san, please come."' },
  v09: { jp: 'しらいし……さよ……', en: 'Shiraishi... Sayo...' },
  v10: { jp: '逃げなきゃ！', en: 'I have to run!' },
  v11: { jp: '花子さん、みーつけた！', en: 'Found you, Hanako-san!' },
  v12: { jp: '花子さん！', en: 'Hanako-san!' },
  v13: { jp: '小夜ちゃん！', en: 'Sayo!' },
  v14: { jp: '……朝だ。', en: '...It\'s morning.' },
  v15: { jp: '私の名前は、橘美咲。あの子の名前は、白石小夜。', en: 'My name is Tachibana Misaki. Her name was Shiraishi Sayo.' },
  v16: { jp: '小夜ちゃん。また、あした。', en: 'See you tomorrow, Sayo.' },
};
// Ids whose mp3 is in audio/voice/. Only these are fetched (all prefetched after the first unlock);
// drop an id here if its file is missing, so the console stays free of 404s.
const VOICE_FILES = Object.keys(VOICE);
