import type { Difficulty } from '@/gameplay'

export interface SpeakingPrompt {
  id: number
  difficulty: Difficulty
  sentence: string
  translation: string
}

export const SPEAKING_PROMPTS: SpeakingPrompt[] = [
  { id: 1, difficulty: 'easy', sentence: 'Merhaba', translation: 'Hello' },
  { id: 2, difficulty: 'easy', sentence: 'Nasılsın?', translation: 'How are you?' },
  { id: 3, difficulty: 'easy', sentence: 'Teşekkür ederim', translation: 'Thank you' },
  { id: 4, difficulty: 'easy', sentence: 'Günaydın', translation: 'Good morning' },
  { id: 5, difficulty: 'easy', sentence: 'İyi geceler', translation: 'Good night' },
  { id: 6, difficulty: 'easy', sentence: 'Evet, anlıyorum', translation: 'Yes, I understand' },
  { id: 7, difficulty: 'easy', sentence: 'Hayır, bilmiyorum', translation: 'No, I don\'t know' },
  { id: 8, difficulty: 'easy', sentence: 'Lütfen yardım edin', translation: 'Please help' },
  { id: 9, difficulty: 'easy', sentence: 'Su istiyorum', translation: 'I want water' },
  { id: 10, difficulty: 'easy', sentence: 'Hoşça kal', translation: 'Goodbye' },
  { id: 11, difficulty: 'medium', sentence: 'Benim adım Ali', translation: 'My name is Ali' },
  { id: 12, difficulty: 'medium', sentence: 'Ben öğrenciyim', translation: 'I am a student' },
  { id: 13, difficulty: 'medium', sentence: 'Bugün hava güzel', translation: 'The weather is nice today' },
  { id: 14, difficulty: 'medium', sentence: 'Bir çay lütfen', translation: 'One tea, please' },
  { id: 15, difficulty: 'medium', sentence: 'Saat kaç?', translation: 'What time is it?' },
  { id: 16, difficulty: 'medium', sentence: 'Nereye gidiyorsun?', translation: 'Where are you going?' },
  { id: 17, difficulty: 'medium', sentence: 'Bugün ne yapacaksın?', translation: 'What will you do today?' },
  { id: 18, difficulty: 'medium', sentence: 'Markete gidiyorum', translation: 'I am going to the market' },
  { id: 19, difficulty: 'medium', sentence: 'Bu ne kadar?', translation: 'How much is this?' },
  { id: 20, difficulty: 'medium', sentence: 'Türkçe öğreniyorum', translation: 'I am learning Turkish' },
  { id: 21, difficulty: 'hard', sentence: 'Yarın okula gideceğim', translation: 'I will go to school tomorrow' },
  { id: 22, difficulty: 'hard', sentence: 'Annem çok güzel yemek yapar', translation: 'My mother cooks very well' },
  { id: 23, difficulty: 'hard', sentence: 'Dün akşam film izledim', translation: 'I watched a movie last night' },
  { id: 24, difficulty: 'hard', sentence: 'İki kardeşim var', translation: 'I have two siblings' },
  { id: 25, difficulty: 'hard', sentence: 'Otobüs durağı nerede?', translation: 'Where is the bus stop?' },
  { id: 26, difficulty: 'hard', sentence: 'Kahvaltıda peynir yedim', translation: 'I ate cheese for breakfast' },
  { id: 27, difficulty: 'hard', sentence: 'Her gün spor yapıyorum', translation: 'I exercise every day' },
  { id: 28, difficulty: 'hard', sentence: 'Bu kitap çok ilginç', translation: 'This book is very interesting' },
  { id: 29, difficulty: 'hard', sentence: 'Tatilde denize gittik', translation: 'We went to the sea on vacation' },
  { id: 30, difficulty: 'hard', sentence: 'Yeni bir iş buldum', translation: 'I found a new job' },
]
