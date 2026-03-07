import type { Difficulty } from '@/gameplay'

export interface ListeningPrompt {
  id: number
  difficulty: Difficulty
  audioText: string
  audioLang: string
  question: string
  choices: [string, string, string]
  correctIndex: 0 | 1 | 2
}

export const LISTENING_PROMPTS: ListeningPrompt[] = [
  { id: 1, difficulty: 'easy', audioText: 'Merhaba, nasılsın?', audioLang: 'tr-TR', question: 'What is being said?', choices: ['Hello, how are you?', 'Goodbye, see you!', 'Good night!'], correctIndex: 0 },
  { id: 2, difficulty: 'easy', audioText: 'Benim adım Ali.', audioLang: 'tr-TR', question: 'What does the speaker say?', choices: ['I am hungry.', 'My name is Ali.', 'I am tired.'], correctIndex: 1 },
  { id: 3, difficulty: 'easy', audioText: 'Teşekkür ederim.', audioLang: 'tr-TR', question: 'What did you hear?', choices: ['I am sorry.', 'Please help me.', 'Thank you.'], correctIndex: 2 },
  { id: 4, difficulty: 'easy', audioText: 'Günaydın!', audioLang: 'tr-TR', question: 'What greeting is this?', choices: ['Good morning!', 'Good evening!', 'Good night!'], correctIndex: 0 },
  { id: 5, difficulty: 'easy', audioText: 'Evet, anlıyorum.', audioLang: 'tr-TR', question: 'What is the response?', choices: ['No, I don\'t know.', 'Yes, I understand.', 'Maybe later.'], correctIndex: 1 },
  { id: 6, difficulty: 'easy', audioText: 'Su istiyorum.', audioLang: 'tr-TR', question: 'What does the speaker want?', choices: ['Tea', 'Coffee', 'Water'], correctIndex: 2 },
  { id: 7, difficulty: 'easy', audioText: 'Bugün hava güzel.', audioLang: 'tr-TR', question: 'What is the topic?', choices: ['The weather is nice today.', 'I am going to school.', 'The food is ready.'], correctIndex: 0 },
  { id: 8, difficulty: 'easy', audioText: 'Ben öğrenciyim.', audioLang: 'tr-TR', question: 'Who is speaking?', choices: ['A teacher', 'A student', 'A doctor'], correctIndex: 1 },
  { id: 9, difficulty: 'easy', audioText: 'Hoşça kal!', audioLang: 'tr-TR', question: 'What is being said?', choices: ['Welcome!', 'Come here!', 'Goodbye!'], correctIndex: 2 },
  { id: 10, difficulty: 'easy', audioText: 'Bir çay lütfen.', audioLang: 'tr-TR', question: 'What is ordered?', choices: ['One tea, please.', 'One coffee, please.', 'One juice, please.'], correctIndex: 0 },
  { id: 11, difficulty: 'medium', audioText: 'Yarın okula gideceğim.', audioLang: 'tr-TR', question: 'When is the speaker going to school?', choices: ['Yesterday', 'Tomorrow', 'Today'], correctIndex: 1 },
  { id: 12, difficulty: 'medium', audioText: 'Saat kaç? Saat üç.', audioLang: 'tr-TR', question: 'What time is it?', choices: ['Two o\'clock', 'Four o\'clock', 'Three o\'clock'], correctIndex: 2 },
  { id: 13, difficulty: 'medium', audioText: 'Markete gidip ekmek alacağım.', audioLang: 'tr-TR', question: 'Where is the speaker going?', choices: ['To the market', 'To the hospital', 'To the park'], correctIndex: 0 },
  { id: 14, difficulty: 'medium', audioText: 'Annem çok güzel yemek yapar.', audioLang: 'tr-TR', question: 'Who cooks well?', choices: ['Father', 'Mother', 'Sister'], correctIndex: 1 },
  { id: 15, difficulty: 'medium', audioText: 'Kış geldi, hava çok soğuk.', audioLang: 'tr-TR', question: 'What season is it?', choices: ['Summer', 'Spring', 'Winter'], correctIndex: 2 },
  { id: 16, difficulty: 'medium', audioText: 'Kahvaltıda peynir ve zeytin yedim.', audioLang: 'tr-TR', question: 'What meal is mentioned?', choices: ['Breakfast', 'Lunch', 'Dinner'], correctIndex: 0 },
  { id: 17, difficulty: 'medium', audioText: 'İki kardeşim var, biri büyük biri küçük.', audioLang: 'tr-TR', question: 'How many siblings does the speaker have?', choices: ['One', 'Two', 'Three'], correctIndex: 1 },
  { id: 18, difficulty: 'medium', audioText: 'Otobüs durağı nerede?', audioLang: 'tr-TR', question: 'What is the speaker looking for?', choices: ['A restaurant', 'A school', 'A bus stop'], correctIndex: 2 },
  { id: 19, difficulty: 'medium', audioText: 'Dün akşam film izledim.', audioLang: 'tr-TR', question: 'What did the speaker do last night?', choices: ['Watched a movie', 'Read a book', 'Went for a walk'], correctIndex: 0 },
  { id: 20, difficulty: 'medium', audioText: 'Bu kitap çok ilginç, okumalısın.', audioLang: 'tr-TR', question: 'What does the speaker recommend?', choices: ['A movie', 'A book', 'A song'], correctIndex: 1 },
  { id: 21, difficulty: 'hard', audioText: 'Geçen hafta İstanbul\'a gittim ve çok güzel vakit geçirdim.', audioLang: 'tr-TR', question: 'Where did the speaker go last week?', choices: ['Ankara', 'İzmir', 'İstanbul'], correctIndex: 2 },
  { id: 22, difficulty: 'hard', audioText: 'Doktor bana her gün meyve yememi söyledi.', audioLang: 'tr-TR', question: 'What did the doctor advise?', choices: ['Eat fruit every day', 'Exercise more', 'Drink more water'], correctIndex: 0 },
  { id: 23, difficulty: 'hard', audioText: 'Türkçe öğrenmek istiyorum çünkü Türkiye\'de yaşamak istiyorum.', audioLang: 'tr-TR', question: 'Why does the speaker want to learn Turkish?', choices: ['For a job', 'To live in Turkey', 'For school'], correctIndex: 1 },
  { id: 24, difficulty: 'hard', audioText: 'Hava çok sıcak olduğu için denize gittik.', audioLang: 'tr-TR', question: 'Why did they go to the sea?', choices: ['It was cold', 'It was raining', 'It was very hot'], correctIndex: 2 },
  { id: 25, difficulty: 'hard', audioText: 'Cumartesi günü arkadaşlarımla pikniğe gideceğiz.', audioLang: 'tr-TR', question: 'What are they doing on Saturday?', choices: ['Going on a picnic', 'Going to a concert', 'Going shopping'], correctIndex: 0 },
  { id: 26, difficulty: 'hard', audioText: 'Babam emekli oldu ve şimdi bahçede çalışıyor.', audioLang: 'tr-TR', question: 'What does the father do now?', choices: ['He teaches', 'He works in the garden', 'He travels'], correctIndex: 1 },
  { id: 27, difficulty: 'hard', audioText: 'Müzik dinlemeyi seviyorum, özellikle Türk müziği.', audioLang: 'tr-TR', question: 'What kind of music does the speaker prefer?', choices: ['Classical', 'Rock', 'Turkish music'], correctIndex: 2 },
  { id: 28, difficulty: 'hard', audioText: 'Her sabah erkenden kalkıp spor yapıyorum.', audioLang: 'tr-TR', question: 'What does the speaker do every morning?', choices: ['Exercises early', 'Reads the newspaper', 'Cooks breakfast'], correctIndex: 0 },
  { id: 29, difficulty: 'hard', audioText: 'Tatilde ailecek Antalya\'ya gideceğiz, çok heyecanlıyım.', audioLang: 'tr-TR', question: 'How does the speaker feel about the holiday?', choices: ['Worried', 'Excited', 'Tired'], correctIndex: 1 },
  { id: 30, difficulty: 'hard', audioText: 'Yeni bir iş buldum, pazartesi başlıyorum.', audioLang: 'tr-TR', question: 'When does the new job start?', choices: ['Friday', 'Wednesday', 'Monday'], correctIndex: 2 },
]
