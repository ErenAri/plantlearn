import type { SQLiteDatabase } from 'expo-sqlite'
import { getDevNowIso } from '@/dev/clock'
import type { CefrLevel } from './types'

interface SeedCard {
  word: string
  meaning: string
  example: string | null
  level: CefrLevel
  category: string
  phonetic: string | null
}

/* ─── A1 – Beginner (200 words) ──────────────────────── */
const A1_CARDS: SeedCard[] = [
  // Greetings & basics
  { word: 'hello', meaning: 'merhaba', example: 'Hello, how are you?', level: 'A1', category: 'greetings', phonetic: '/həˈloʊ/' },
  { word: 'goodbye', meaning: 'hoşça kal', example: 'Goodbye, see you tomorrow!', level: 'A1', category: 'greetings', phonetic: '/ɡʊdˈbaɪ/' },
  { word: 'thank you', meaning: 'teşekkür ederim', example: 'Thank you for your help.', level: 'A1', category: 'greetings', phonetic: '/θæŋk juː/' },
  { word: 'please', meaning: 'lütfen', example: 'Please sit down.', level: 'A1', category: 'greetings', phonetic: '/pliːz/' },
  { word: 'yes', meaning: 'evet', example: 'Yes, I agree.', level: 'A1', category: 'greetings', phonetic: '/jɛs/' },
  { word: 'no', meaning: 'hayır', example: 'No, thank you.', level: 'A1', category: 'greetings', phonetic: '/noʊ/' },
  { word: 'sorry', meaning: 'özür dilerim', example: 'Sorry, I am late.', level: 'A1', category: 'greetings', phonetic: '/ˈsɒri/' },
  { word: 'excuse me', meaning: 'affedersiniz', example: 'Excuse me, where is the bank?', level: 'A1', category: 'greetings', phonetic: '/ɪkˈskjuːz miː/' },
  { word: 'welcome', meaning: 'hoş geldiniz', example: 'Welcome to our home!', level: 'A1', category: 'greetings', phonetic: '/ˈwɛlkəm/' },
  { word: 'good morning', meaning: 'günaydın', example: 'Good morning, class!', level: 'A1', category: 'greetings', phonetic: '/ɡʊd ˈmɔːrnɪŋ/' },
  { word: 'good night', meaning: 'iyi geceler', example: 'Good night, sleep well.', level: 'A1', category: 'greetings', phonetic: '/ɡʊd naɪt/' },
  { word: 'good evening', meaning: 'iyi akşamlar', example: 'Good evening, everyone.', level: 'A1', category: 'greetings', phonetic: '/ɡʊd ˈiːvnɪŋ/' },

  // Family
  { word: 'mother', meaning: 'anne', example: 'My mother is a teacher.', level: 'A1', category: 'family', phonetic: '/ˈmʌðər/' },
  { word: 'father', meaning: 'baba', example: 'My father works in a hospital.', level: 'A1', category: 'family', phonetic: '/ˈfɑːðər/' },
  { word: 'brother', meaning: 'erkek kardeş', example: 'I have one brother.', level: 'A1', category: 'family', phonetic: '/ˈbrʌðər/' },
  { word: 'sister', meaning: 'kız kardeş', example: 'My sister is younger than me.', level: 'A1', category: 'family', phonetic: '/ˈsɪstər/' },
  { word: 'baby', meaning: 'bebek', example: 'The baby is sleeping.', level: 'A1', category: 'family', phonetic: '/ˈbeɪbi/' },
  { word: 'child', meaning: 'çocuk', example: 'The child is playing.', level: 'A1', category: 'family', phonetic: '/tʃaɪld/' },
  { word: 'family', meaning: 'aile', example: 'I love my family.', level: 'A1', category: 'family', phonetic: '/ˈfæməli/' },
  { word: 'friend', meaning: 'arkadaş', example: 'She is my best friend.', level: 'A1', category: 'family', phonetic: '/frɛnd/' },
  { word: 'man', meaning: 'adam', example: 'The man is tall.', level: 'A1', category: 'family', phonetic: '/mæn/' },
  { word: 'woman', meaning: 'kadın', example: 'The woman is reading.', level: 'A1', category: 'family', phonetic: '/ˈwʊmən/' },
  { word: 'boy', meaning: 'oğlan', example: 'The boy runs fast.', level: 'A1', category: 'family', phonetic: '/bɔɪ/' },
  { word: 'girl', meaning: 'kız', example: 'The girl likes music.', level: 'A1', category: 'family', phonetic: '/ɡɜːrl/' },

  // Body
  { word: 'head', meaning: 'baş', example: 'My head hurts.', level: 'A1', category: 'body', phonetic: '/hɛd/' },
  { word: 'eye', meaning: 'göz', example: 'She has blue eyes.', level: 'A1', category: 'body', phonetic: '/aɪ/' },
  { word: 'ear', meaning: 'kulak', example: 'I hear with my ears.', level: 'A1', category: 'body', phonetic: '/ɪr/' },
  { word: 'nose', meaning: 'burun', example: 'The dog has a wet nose.', level: 'A1', category: 'body', phonetic: '/noʊz/' },
  { word: 'mouth', meaning: 'ağız', example: 'Open your mouth, please.', level: 'A1', category: 'body', phonetic: '/maʊθ/' },
  { word: 'hand', meaning: 'el', example: 'Wash your hands before eating.', level: 'A1', category: 'body', phonetic: '/hænd/' },
  { word: 'foot', meaning: 'ayak', example: 'My foot is cold.', level: 'A1', category: 'body', phonetic: '/fʊt/' },
  { word: 'arm', meaning: 'kol', example: 'He broke his arm.', level: 'A1', category: 'body', phonetic: '/ɑːrm/' },
  { word: 'leg', meaning: 'bacak', example: 'The cat has four legs.', level: 'A1', category: 'body', phonetic: '/lɛɡ/' },
  { word: 'hair', meaning: 'saç', example: 'She has long hair.', level: 'A1', category: 'body', phonetic: '/hɛr/' },
  { word: 'tooth', meaning: 'diş', example: 'Brush your teeth.', level: 'A1', category: 'body', phonetic: '/tuːθ/' },
  { word: 'heart', meaning: 'kalp', example: 'The heart pumps blood.', level: 'A1', category: 'body', phonetic: '/hɑːrt/' },
  { word: 'face', meaning: 'yüz', example: 'Wash your face.', level: 'A1', category: 'body', phonetic: '/feɪs/' },
  { word: 'back', meaning: 'sırt', example: 'My back hurts.', level: 'A1', category: 'body', phonetic: '/bæk/' },

  // Food & drink
  { word: 'water', meaning: 'su', example: 'I drink water every day.', level: 'A1', category: 'food', phonetic: '/ˈwɔːtər/' },
  { word: 'bread', meaning: 'ekmek', example: 'I eat bread for breakfast.', level: 'A1', category: 'food', phonetic: '/brɛd/' },
  { word: 'milk', meaning: 'süt', example: 'Children drink milk.', level: 'A1', category: 'food', phonetic: '/mɪlk/' },
  { word: 'tea', meaning: 'çay', example: 'One tea, please.', level: 'A1', category: 'food', phonetic: '/tiː/' },
  { word: 'coffee', meaning: 'kahve', example: 'I need coffee in the morning.', level: 'A1', category: 'food', phonetic: '/ˈkɒfi/' },
  { word: 'food', meaning: 'yemek', example: 'The food is delicious.', level: 'A1', category: 'food', phonetic: '/fuːd/' },
  { word: 'fruit', meaning: 'meyve', example: 'Eat more fruit.', level: 'A1', category: 'food', phonetic: '/fruːt/' },
  { word: 'apple', meaning: 'elma', example: 'An apple a day keeps the doctor away.', level: 'A1', category: 'food', phonetic: '/ˈæpəl/' },
  { word: 'orange', meaning: 'portakal', example: 'I want fresh orange juice.', level: 'A1', category: 'food', phonetic: '/ˈɒrɪndʒ/' },
  { word: 'egg', meaning: 'yumurta', example: 'I eat eggs for breakfast.', level: 'A1', category: 'food', phonetic: '/ɛɡ/' },
  { word: 'cheese', meaning: 'peynir', example: 'Turkish cheese is delicious.', level: 'A1', category: 'food', phonetic: '/tʃiːz/' },
  { word: 'meat', meaning: 'et', example: 'We cook meat on Sundays.', level: 'A1', category: 'food', phonetic: '/miːt/' },
  { word: 'chicken', meaning: 'tavuk', example: 'We had chicken for dinner.', level: 'A1', category: 'food', phonetic: '/ˈtʃɪkɪn/' },
  { word: 'rice', meaning: 'pirinç', example: 'I like rice with vegetables.', level: 'A1', category: 'food', phonetic: '/raɪs/' },
  { word: 'sugar', meaning: 'şeker', example: 'No sugar in my tea, please.', level: 'A1', category: 'food', phonetic: '/ˈʃʊɡər/' },
  { word: 'salt', meaning: 'tuz', example: 'Add some salt to the soup.', level: 'A1', category: 'food', phonetic: '/sɔːlt/' },
  { word: 'butter', meaning: 'tereyağı', example: 'Put butter on the bread.', level: 'A1', category: 'food', phonetic: '/ˈbʌtər/' },

  // Colors
  { word: 'red', meaning: 'kırmızı', example: 'The car is red.', level: 'A1', category: 'colors', phonetic: '/rɛd/' },
  { word: 'blue', meaning: 'mavi', example: 'The sky is blue.', level: 'A1', category: 'colors', phonetic: '/bluː/' },
  { word: 'green', meaning: 'yeşil', example: 'The grass is green.', level: 'A1', category: 'colors', phonetic: '/ɡriːn/' },
  { word: 'yellow', meaning: 'sarı', example: 'The sun is yellow.', level: 'A1', category: 'colors', phonetic: '/ˈjɛloʊ/' },
  { word: 'white', meaning: 'beyaz', example: 'Snow is white.', level: 'A1', category: 'colors', phonetic: '/waɪt/' },
  { word: 'black', meaning: 'siyah', example: 'My shoes are black.', level: 'A1', category: 'colors', phonetic: '/blæk/' },

  // Numbers & time
  { word: 'one', meaning: 'bir', example: 'I have one brother.', level: 'A1', category: 'numbers', phonetic: '/wʌn/' },
  { word: 'two', meaning: 'iki', example: 'Two plus two is four.', level: 'A1', category: 'numbers', phonetic: '/tuː/' },
  { word: 'three', meaning: 'üç', example: 'I have three cats.', level: 'A1', category: 'numbers', phonetic: '/θriː/' },
  { word: 'ten', meaning: 'on', example: 'Count to ten.', level: 'A1', category: 'numbers', phonetic: '/tɛn/' },
  { word: 'hundred', meaning: 'yüz', example: 'There are a hundred students.', level: 'A1', category: 'numbers', phonetic: '/ˈhʌndrəd/' },
  { word: 'morning', meaning: 'sabah', example: 'I wake up in the morning.', level: 'A1', category: 'time', phonetic: '/ˈmɔːrnɪŋ/' },
  { word: 'evening', meaning: 'akşam', example: 'We eat dinner in the evening.', level: 'A1', category: 'time', phonetic: '/ˈiːvnɪŋ/' },
  { word: 'night', meaning: 'gece', example: 'Stars come out at night.', level: 'A1', category: 'time', phonetic: '/naɪt/' },
  { word: 'today', meaning: 'bugün', example: 'What day is today?', level: 'A1', category: 'time', phonetic: '/təˈdeɪ/' },
  { word: 'tomorrow', meaning: 'yarın', example: 'I will go tomorrow.', level: 'A1', category: 'time', phonetic: '/təˈmɒroʊ/' },
  { word: 'yesterday', meaning: 'dün', example: 'I was sick yesterday.', level: 'A1', category: 'time', phonetic: '/ˈjɛstərdeɪ/' },
  { word: 'week', meaning: 'hafta', example: 'See you next week.', level: 'A1', category: 'time', phonetic: '/wiːk/' },
  { word: 'month', meaning: 'ay', example: 'January is the first month.', level: 'A1', category: 'time', phonetic: '/mʌnθ/' },
  { word: 'year', meaning: 'yıl', example: 'A year has twelve months.', level: 'A1', category: 'time', phonetic: '/jɪr/' },
  { word: 'clock', meaning: 'saat', example: 'Look at the clock.', level: 'A1', category: 'time', phonetic: '/klɒk/' },

  // Nature
  { word: 'sun', meaning: 'güneş', example: 'The sun is shining.', level: 'A1', category: 'nature', phonetic: '/sʌn/' },
  { word: 'moon', meaning: 'ay', example: 'The moon is full tonight.', level: 'A1', category: 'nature', phonetic: '/muːn/' },
  { word: 'star', meaning: 'yıldız', example: 'The stars are beautiful.', level: 'A1', category: 'nature', phonetic: '/stɑːr/' },
  { word: 'rain', meaning: 'yağmur', example: 'It will rain today.', level: 'A1', category: 'nature', phonetic: '/reɪn/' },
  { word: 'snow', meaning: 'kar', example: 'Children play in the snow.', level: 'A1', category: 'nature', phonetic: '/snoʊ/' },
  { word: 'wind', meaning: 'rüzgar', example: 'The wind is strong today.', level: 'A1', category: 'nature', phonetic: '/wɪnd/' },
  { word: 'cloud', meaning: 'bulut', example: 'There are clouds in the sky.', level: 'A1', category: 'nature', phonetic: '/klaʊd/' },
  { word: 'sky', meaning: 'gökyüzü', example: 'The sky is clear.', level: 'A1', category: 'nature', phonetic: '/skaɪ/' },
  { word: 'tree', meaning: 'ağaç', example: 'A big tree is in the garden.', level: 'A1', category: 'nature', phonetic: '/triː/' },
  { word: 'flower', meaning: 'çiçek', example: 'The flowers are beautiful.', level: 'A1', category: 'nature', phonetic: '/ˈflaʊər/' },
  { word: 'sea', meaning: 'deniz', example: 'We swim in the sea.', level: 'A1', category: 'nature', phonetic: '/siː/' },
  { word: 'mountain', meaning: 'dağ', example: 'The mountain is high.', level: 'A1', category: 'nature', phonetic: '/ˈmaʊntən/' },
  { word: 'river', meaning: 'nehir', example: 'The river is long.', level: 'A1', category: 'nature', phonetic: '/ˈrɪvər/' },
  { word: 'lake', meaning: 'göl', example: 'We fished at the lake.', level: 'A1', category: 'nature', phonetic: '/leɪk/' },
  { word: 'garden', meaning: 'bahçe', example: 'We grow vegetables in the garden.', level: 'A1', category: 'nature', phonetic: '/ˈɡɑːrdən/' },

  // Animals
  { word: 'cat', meaning: 'kedi', example: 'The cat is sleeping.', level: 'A1', category: 'animals', phonetic: '/kæt/' },
  { word: 'dog', meaning: 'köpek', example: 'The dog is friendly.', level: 'A1', category: 'animals', phonetic: '/dɒɡ/' },
  { word: 'bird', meaning: 'kuş', example: 'The bird is singing.', level: 'A1', category: 'animals', phonetic: '/bɜːrd/' },
  { word: 'fish', meaning: 'balık', example: 'I like eating fish.', level: 'A1', category: 'animals', phonetic: '/fɪʃ/' },
  { word: 'horse', meaning: 'at', example: 'The horse runs fast.', level: 'A1', category: 'animals', phonetic: '/hɔːrs/' },
  { word: 'cow', meaning: 'inek', example: 'The cow gives milk.', level: 'A1', category: 'animals', phonetic: '/kaʊ/' },

  // House & objects
  { word: 'house', meaning: 'ev', example: 'This is my house.', level: 'A1', category: 'home', phonetic: '/haʊs/' },
  { word: 'door', meaning: 'kapı', example: 'Close the door, please.', level: 'A1', category: 'home', phonetic: '/dɔːr/' },
  { word: 'window', meaning: 'pencere', example: 'Open the window.', level: 'A1', category: 'home', phonetic: '/ˈwɪndoʊ/' },
  { word: 'table', meaning: 'masa', example: 'Put the book on the table.', level: 'A1', category: 'home', phonetic: '/ˈteɪbəl/' },
  { word: 'chair', meaning: 'sandalye', example: 'Sit on the chair.', level: 'A1', category: 'home', phonetic: '/tʃɛr/' },
  { word: 'bed', meaning: 'yatak', example: 'I sleep in my bed.', level: 'A1', category: 'home', phonetic: '/bɛd/' },
  { word: 'room', meaning: 'oda', example: 'My room is small.', level: 'A1', category: 'home', phonetic: '/ruːm/' },
  { word: 'kitchen', meaning: 'mutfak', example: 'Mother is in the kitchen.', level: 'A1', category: 'home', phonetic: '/ˈkɪtʃɪn/' },
  { word: 'bathroom', meaning: 'banyo', example: 'The bathroom is clean.', level: 'A1', category: 'home', phonetic: '/ˈbæθruːm/' },

  // School
  { word: 'school', meaning: 'okul', example: 'I go to school every day.', level: 'A1', category: 'school', phonetic: '/skuːl/' },
  { word: 'teacher', meaning: 'öğretmen', example: 'The teacher is kind.', level: 'A1', category: 'school', phonetic: '/ˈtiːtʃər/' },
  { word: 'student', meaning: 'öğrenci', example: 'I am a student.', level: 'A1', category: 'school', phonetic: '/ˈstuːdənt/' },
  { word: 'book', meaning: 'kitap', example: 'Read the book.', level: 'A1', category: 'school', phonetic: '/bʊk/' },
  { word: 'pen', meaning: 'kalem', example: 'Write with a pen.', level: 'A1', category: 'school', phonetic: '/pɛn/' },
  { word: 'paper', meaning: 'kağıt', example: 'I need paper.', level: 'A1', category: 'school', phonetic: '/ˈpeɪpər/' },

  // Places
  { word: 'city', meaning: 'şehir', example: 'Istanbul is a big city.', level: 'A1', category: 'places', phonetic: '/ˈsɪti/' },
  { word: 'village', meaning: 'köy', example: 'My grandmother lives in a village.', level: 'A1', category: 'places', phonetic: '/ˈvɪlɪdʒ/' },
  { word: 'road', meaning: 'yol', example: 'The road is long.', level: 'A1', category: 'places', phonetic: '/roʊd/' },
  { word: 'market', meaning: 'pazar', example: 'I buy vegetables at the market.', level: 'A1', category: 'places', phonetic: '/ˈmɑːrkɪt/' },
  { word: 'shop', meaning: 'dükkan', example: 'The shop is closed.', level: 'A1', category: 'places', phonetic: '/ʃɒp/' },
  { word: 'hospital', meaning: 'hastane', example: 'The hospital is near.', level: 'A1', category: 'places', phonetic: '/ˈhɒspɪtəl/' },
  { word: 'park', meaning: 'park', example: 'Children play in the park.', level: 'A1', category: 'places', phonetic: '/pɑːrk/' },

  // Common objects
  { word: 'bag', meaning: 'çanta', example: 'Put your books in the bag.', level: 'A1', category: 'objects', phonetic: '/bæɡ/' },
  { word: 'key', meaning: 'anahtar', example: 'I lost my key.', level: 'A1', category: 'objects', phonetic: '/kiː/' },
  { word: 'phone', meaning: 'telefon', example: 'My phone is ringing.', level: 'A1', category: 'objects', phonetic: '/foʊn/' },
  { word: 'money', meaning: 'para', example: 'I have no money.', level: 'A1', category: 'objects', phonetic: '/ˈmʌni/' },
  { word: 'car', meaning: 'araba', example: 'He drives a car.', level: 'A1', category: 'objects', phonetic: '/kɑːr/' },
  { word: 'bus', meaning: 'otobüs', example: 'I take the bus to school.', level: 'A1', category: 'objects', phonetic: '/bʌs/' },

  // Basic adjectives
  { word: 'big', meaning: 'büyük', example: 'The house is big.', level: 'A1', category: 'adjectives', phonetic: '/bɪɡ/' },
  { word: 'small', meaning: 'küçük', example: 'The cat is small.', level: 'A1', category: 'adjectives', phonetic: '/smɔːl/' },
  { word: 'new', meaning: 'yeni', example: 'I have a new phone.', level: 'A1', category: 'adjectives', phonetic: '/njuː/' },
  { word: 'old', meaning: 'eski', example: 'This building is old.', level: 'A1', category: 'adjectives', phonetic: '/oʊld/' },
  { word: 'good', meaning: 'iyi', example: 'This is a good book.', level: 'A1', category: 'adjectives', phonetic: '/ɡʊd/' },
  { word: 'bad', meaning: 'kötü', example: 'The weather is bad.', level: 'A1', category: 'adjectives', phonetic: '/bæd/' },
  { word: 'hot', meaning: 'sıcak', example: 'The tea is hot.', level: 'A1', category: 'adjectives', phonetic: '/hɒt/' },
  { word: 'cold', meaning: 'soğuk', example: 'It is cold outside.', level: 'A1', category: 'adjectives', phonetic: '/koʊld/' },
  { word: 'happy', meaning: 'mutlu', example: 'I am happy today.', level: 'A1', category: 'adjectives', phonetic: '/ˈhæpi/' },
  { word: 'sad', meaning: 'üzgün', example: 'She looks sad.', level: 'A1', category: 'adjectives', phonetic: '/sæd/' },
  { word: 'hungry', meaning: 'aç', example: 'I am hungry.', level: 'A1', category: 'adjectives', phonetic: '/ˈhʌŋɡri/' },
  { word: 'tired', meaning: 'yorgun', example: 'I am very tired.', level: 'A1', category: 'adjectives', phonetic: '/taɪərd/' },
  { word: 'beautiful', meaning: 'güzel', example: 'The flower is beautiful.', level: 'A1', category: 'adjectives', phonetic: '/ˈbjuːtɪfəl/' },
  { word: 'easy', meaning: 'kolay', example: 'This question is easy.', level: 'A1', category: 'adjectives', phonetic: '/ˈiːzi/' },
  { word: 'difficult', meaning: 'zor', example: 'The exam was difficult.', level: 'A1', category: 'adjectives', phonetic: '/ˈdɪfɪkəlt/' },
  { word: 'long', meaning: 'uzun', example: 'The road is long.', level: 'A1', category: 'adjectives', phonetic: '/lɒŋ/' },
  { word: 'short', meaning: 'kısa', example: 'The pencil is short.', level: 'A1', category: 'adjectives', phonetic: '/ʃɔːrt/' },
  { word: 'clean', meaning: 'temiz', example: 'Keep your room clean.', level: 'A1', category: 'adjectives', phonetic: '/kliːn/' },
  { word: 'fast', meaning: 'hızlı', example: 'The car is fast.', level: 'A1', category: 'adjectives', phonetic: '/fæst/' },
  { word: 'slow', meaning: 'yavaş', example: 'Walk slowly.', level: 'A1', category: 'adjectives', phonetic: '/sloʊ/' },

  // Basic verbs
  { word: 'eat', meaning: 'yemek yemek', example: 'I eat breakfast at 8.', level: 'A1', category: 'verbs', phonetic: '/iːt/' },
  { word: 'drink', meaning: 'içmek', example: 'Drink your water.', level: 'A1', category: 'verbs', phonetic: '/drɪŋk/' },
  { word: 'sleep', meaning: 'uyumak', example: 'I sleep at 10 PM.', level: 'A1', category: 'verbs', phonetic: '/sliːp/' },
  { word: 'walk', meaning: 'yürümek', example: 'I walk to school.', level: 'A1', category: 'verbs', phonetic: '/wɔːk/' },
  { word: 'run', meaning: 'koşmak', example: 'Do not run in the hallway.', level: 'A1', category: 'verbs', phonetic: '/rʌn/' },
  { word: 'sit', meaning: 'oturmak', example: 'Sit down, please.', level: 'A1', category: 'verbs', phonetic: '/sɪt/' },
  { word: 'stand', meaning: 'kalkmak', example: 'Stand up, please.', level: 'A1', category: 'verbs', phonetic: '/stænd/' },
  { word: 'come', meaning: 'gelmek', example: 'Come here!', level: 'A1', category: 'verbs', phonetic: '/kʌm/' },
  { word: 'go', meaning: 'gitmek', example: 'I go to school.', level: 'A1', category: 'verbs', phonetic: '/ɡoʊ/' },
  { word: 'see', meaning: 'görmek', example: 'I can see the bird.', level: 'A1', category: 'verbs', phonetic: '/siː/' },
  { word: 'hear', meaning: 'duymak', example: 'I can hear music.', level: 'A1', category: 'verbs', phonetic: '/hɪr/' },
  { word: 'speak', meaning: 'konuşmak', example: 'I speak English.', level: 'A1', category: 'verbs', phonetic: '/spiːk/' },
  { word: 'read', meaning: 'okumak', example: 'I read books every day.', level: 'A1', category: 'verbs', phonetic: '/riːd/' },
  { word: 'write', meaning: 'yazmak', example: 'Write your name.', level: 'A1', category: 'verbs', phonetic: '/raɪt/' },
  { word: 'learn', meaning: 'öğrenmek', example: 'I want to learn English.', level: 'A1', category: 'verbs', phonetic: '/lɜːrn/' },
  { word: 'know', meaning: 'bilmek', example: 'I know the answer.', level: 'A1', category: 'verbs', phonetic: '/noʊ/' },
  { word: 'want', meaning: 'istemek', example: 'I want water.', level: 'A1', category: 'verbs', phonetic: '/wɒnt/' },
  { word: 'like', meaning: 'beğenmek', example: 'I like pizza.', level: 'A1', category: 'verbs', phonetic: '/laɪk/' },
  { word: 'love', meaning: 'sevmek', example: 'I love my family.', level: 'A1', category: 'verbs', phonetic: '/lʌv/' },
  { word: 'give', meaning: 'vermek', example: 'Give me the book.', level: 'A1', category: 'verbs', phonetic: '/ɡɪv/' },
  { word: 'take', meaning: 'almak', example: 'Take this pen.', level: 'A1', category: 'verbs', phonetic: '/teɪk/' },
  { word: 'buy', meaning: 'satın almak', example: 'I want to buy a car.', level: 'A1', category: 'verbs', phonetic: '/baɪ/' },
  { word: 'work', meaning: 'çalışmak', example: 'I work every day.', level: 'A1', category: 'verbs', phonetic: '/wɜːrk/' },
  { word: 'play', meaning: 'oynamak', example: 'Children play outside.', level: 'A1', category: 'verbs', phonetic: '/pleɪ/' },
  { word: 'cook', meaning: 'pişirmek', example: 'My mother cooks well.', level: 'A1', category: 'verbs', phonetic: '/kʊk/' },
  { word: 'open', meaning: 'açmak', example: 'Open the door.', level: 'A1', category: 'verbs', phonetic: '/ˈoʊpən/' },
  { word: 'close', meaning: 'kapatmak', example: 'Close the window.', level: 'A1', category: 'verbs', phonetic: '/kloʊz/' },
  { word: 'help', meaning: 'yardım etmek', example: 'Can you help me?', level: 'A1', category: 'verbs', phonetic: '/hɛlp/' },
  { word: 'think', meaning: 'düşünmek', example: 'I think you are right.', level: 'A1', category: 'verbs', phonetic: '/θɪŋk/' },
  { word: 'ask', meaning: 'sormak', example: 'Ask the teacher.', level: 'A1', category: 'verbs', phonetic: '/æsk/' },

  // Miscellaneous A1
  { word: 'name', meaning: 'isim', example: 'What is your name?', level: 'A1', category: 'general', phonetic: '/neɪm/' },
  { word: 'age', meaning: 'yaş', example: 'What is your age?', level: 'A1', category: 'general', phonetic: '/eɪdʒ/' },
  { word: 'price', meaning: 'fiyat', example: 'What is the price?', level: 'A1', category: 'general', phonetic: '/praɪs/' },
  { word: 'country', meaning: 'ülke', example: 'Turkey is a beautiful country.', level: 'A1', category: 'general', phonetic: '/ˈkʌntri/' },
  { word: 'language', meaning: 'dil', example: 'I speak two languages.', level: 'A1', category: 'general', phonetic: '/ˈlæŋɡwɪdʒ/' },
]

/* ─── A2 – Elementary (200 words) ────────────────────── */
const A2_CARDS: SeedCard[] = [
  // Travel & Transport
  { word: 'airport', meaning: 'havalimanı', example: 'We arrived at the airport.', level: 'A2', category: 'travel', phonetic: '/ˈɛrpɔːrt/' },
  { word: 'ticket', meaning: 'bilet', example: 'I bought a bus ticket.', level: 'A2', category: 'travel', phonetic: '/ˈtɪkɪt/' },
  { word: 'passport', meaning: 'pasaport', example: 'Show your passport, please.', level: 'A2', category: 'travel', phonetic: '/ˈpæspɔːrt/' },
  { word: 'hotel', meaning: 'otel', example: 'We stayed at a nice hotel.', level: 'A2', category: 'travel', phonetic: '/hoʊˈtɛl/' },
  { word: 'train', meaning: 'tren', example: 'The train is late.', level: 'A2', category: 'travel', phonetic: '/treɪn/' },
  { word: 'taxi', meaning: 'taksi', example: 'Let us take a taxi.', level: 'A2', category: 'travel', phonetic: '/ˈtæksi/' },
  { word: 'map', meaning: 'harita', example: 'Look at the map.', level: 'A2', category: 'travel', phonetic: '/mæp/' },
  { word: 'suitcase', meaning: 'bavul', example: 'My suitcase is heavy.', level: 'A2', category: 'travel', phonetic: '/ˈsuːtkeɪs/' },
  { word: 'trip', meaning: 'gezi', example: 'We had a great trip.', level: 'A2', category: 'travel', phonetic: '/trɪp/' },
  { word: 'vacation', meaning: 'tatil', example: 'I am on vacation.', level: 'A2', category: 'travel', phonetic: '/veɪˈkeɪʃən/' },

  // Shopping
  { word: 'cheap', meaning: 'ucuz', example: 'This shirt is cheap.', level: 'A2', category: 'shopping', phonetic: '/tʃiːp/' },
  { word: 'expensive', meaning: 'pahalı', example: 'The phone is expensive.', level: 'A2', category: 'shopping', phonetic: '/ɪkˈspɛnsɪv/' },
  { word: 'size', meaning: 'beden', example: 'What size do you wear?', level: 'A2', category: 'shopping', phonetic: '/saɪz/' },
  { word: 'clothes', meaning: 'kıyafet', example: 'I need new clothes.', level: 'A2', category: 'shopping', phonetic: '/kloʊðz/' },
  { word: 'shirt', meaning: 'gömlek', example: 'He wears a blue shirt.', level: 'A2', category: 'shopping', phonetic: '/ʃɜːrt/' },
  { word: 'shoes', meaning: 'ayakkabı', example: 'These shoes are comfortable.', level: 'A2', category: 'shopping', phonetic: '/ʃuːz/' },
  { word: 'hat', meaning: 'şapka', example: 'She wears a hat in summer.', level: 'A2', category: 'shopping', phonetic: '/hæt/' },
  { word: 'gift', meaning: 'hediye', example: 'I bought a gift for you.', level: 'A2', category: 'shopping', phonetic: '/ɡɪft/' },
  { word: 'receipt', meaning: 'fiş', example: 'Keep the receipt.', level: 'A2', category: 'shopping', phonetic: '/rɪˈsiːt/' },
  { word: 'wallet', meaning: 'cüzdan', example: 'My wallet is in my bag.', level: 'A2', category: 'shopping', phonetic: '/ˈwɒlɪt/' },

  // Health
  { word: 'doctor', meaning: 'doktor', example: 'I need to see a doctor.', level: 'A2', category: 'health', phonetic: '/ˈdɒktər/' },
  { word: 'medicine', meaning: 'ilaç', example: 'Take your medicine.', level: 'A2', category: 'health', phonetic: '/ˈmɛdɪsɪn/' },
  { word: 'sick', meaning: 'hasta', example: 'I feel sick today.', level: 'A2', category: 'health', phonetic: '/sɪk/' },
  { word: 'pain', meaning: 'ağrı', example: 'I have pain in my back.', level: 'A2', category: 'health', phonetic: '/peɪn/' },
  { word: 'fever', meaning: 'ateş', example: 'The child has a fever.', level: 'A2', category: 'health', phonetic: '/ˈfiːvər/' },
  { word: 'healthy', meaning: 'sağlıklı', example: 'Eating fruit is healthy.', level: 'A2', category: 'health', phonetic: '/ˈhɛlθi/' },
  { word: 'exercise', meaning: 'egzersiz', example: 'I exercise every morning.', level: 'A2', category: 'health', phonetic: '/ˈɛksərsaɪz/' },
  { word: 'dentist', meaning: 'diş hekimi', example: 'I go to the dentist twice a year.', level: 'A2', category: 'health', phonetic: '/ˈdɛntɪst/' },

  // Work & Daily life
  { word: 'job', meaning: 'iş', example: 'I found a new job.', level: 'A2', category: 'work', phonetic: '/dʒɒb/' },
  { word: 'office', meaning: 'ofis', example: 'I work in an office.', level: 'A2', category: 'work', phonetic: '/ˈɒfɪs/' },
  { word: 'meeting', meaning: 'toplantı', example: 'We have a meeting at 3.', level: 'A2', category: 'work', phonetic: '/ˈmiːtɪŋ/' },
  { word: 'boss', meaning: 'patron', example: 'My boss is kind.', level: 'A2', category: 'work', phonetic: '/bɒs/' },
  { word: 'salary', meaning: 'maaş', example: 'I get my salary monthly.', level: 'A2', category: 'work', phonetic: '/ˈsæləri/' },
  { word: 'colleague', meaning: 'iş arkadaşı', example: 'My colleague helped me.', level: 'A2', category: 'work', phonetic: '/ˈkɒliːɡ/' },
  { word: 'computer', meaning: 'bilgisayar', example: 'I use a computer at work.', level: 'A2', category: 'work', phonetic: '/kəmˈpjuːtər/' },
  { word: 'email', meaning: 'e-posta', example: 'I sent you an email.', level: 'A2', category: 'work', phonetic: '/ˈiːmeɪl/' },

  // Emotions & personality
  { word: 'angry', meaning: 'kızgın', example: 'Do not be angry.', level: 'A2', category: 'emotions', phonetic: '/ˈæŋɡri/' },
  { word: 'afraid', meaning: 'korkmuş', example: 'I am afraid of dogs.', level: 'A2', category: 'emotions', phonetic: '/əˈfreɪd/' },
  { word: 'excited', meaning: 'heyecanlı', example: 'I am excited about the trip.', level: 'A2', category: 'emotions', phonetic: '/ɪkˈsaɪtɪd/' },
  { word: 'surprised', meaning: 'şaşırmış', example: 'I was surprised by the news.', level: 'A2', category: 'emotions', phonetic: '/sərˈpraɪzd/' },
  { word: 'bored', meaning: 'sıkılmış', example: 'I am bored at home.', level: 'A2', category: 'emotions', phonetic: '/bɔːrd/' },
  { word: 'proud', meaning: 'gururlu', example: 'I am proud of you.', level: 'A2', category: 'emotions', phonetic: '/praʊd/' },
  { word: 'worried', meaning: 'endişeli', example: 'She is worried about the exam.', level: 'A2', category: 'emotions', phonetic: '/ˈwʌrid/' },
  { word: 'kind', meaning: 'nazik', example: 'She is very kind.', level: 'A2', category: 'emotions', phonetic: '/kaɪnd/' },
  { word: 'brave', meaning: 'cesur', example: 'The soldier was brave.', level: 'A2', category: 'emotions', phonetic: '/breɪv/' },
  { word: 'lazy', meaning: 'tembel', example: 'Do not be lazy.', level: 'A2', category: 'emotions', phonetic: '/ˈleɪzi/' },

  // Weather
  { word: 'sunny', meaning: 'güneşli', example: 'It is sunny today.', level: 'A2', category: 'weather', phonetic: '/ˈsʌni/' },
  { word: 'cloudy', meaning: 'bulutlu', example: 'It is cloudy outside.', level: 'A2', category: 'weather', phonetic: '/ˈklaʊdi/' },
  { word: 'rainy', meaning: 'yağmurlu', example: 'It is a rainy day.', level: 'A2', category: 'weather', phonetic: '/ˈreɪni/' },
  { word: 'windy', meaning: 'rüzgarlı', example: 'It is very windy today.', level: 'A2', category: 'weather', phonetic: '/ˈwɪndi/' },
  { word: 'warm', meaning: 'ılık', example: 'The weather is warm.', level: 'A2', category: 'weather', phonetic: '/wɔːrm/' },
  { word: 'cool', meaning: 'serin', example: 'The evening is cool.', level: 'A2', category: 'weather', phonetic: '/kuːl/' },
  { word: 'storm', meaning: 'fırtına', example: 'A storm is coming.', level: 'A2', category: 'weather', phonetic: '/stɔːrm/' },
  { word: 'degree', meaning: 'derece', example: 'It is 30 degrees today.', level: 'A2', category: 'weather', phonetic: '/dɪˈɡriː/' },

  // More verbs
  { word: 'arrive', meaning: 'varmak', example: 'We arrive at 5 PM.', level: 'A2', category: 'verbs', phonetic: '/əˈraɪv/' },
  { word: 'leave', meaning: 'ayrılmak', example: 'I leave home at 8 AM.', level: 'A2', category: 'verbs', phonetic: '/liːv/' },
  { word: 'wait', meaning: 'beklemek', example: 'Wait for me, please.', level: 'A2', category: 'verbs', phonetic: '/weɪt/' },
  { word: 'try', meaning: 'denemek', example: 'Try this food.', level: 'A2', category: 'verbs', phonetic: '/traɪ/' },
  { word: 'forget', meaning: 'unutmak', example: 'Do not forget your keys.', level: 'A2', category: 'verbs', phonetic: '/fərˈɡɛt/' },
  { word: 'remember', meaning: 'hatırlamak', example: 'I remember your name.', level: 'A2', category: 'verbs', phonetic: '/rɪˈmɛmbər/' },
  { word: 'understand', meaning: 'anlamak', example: 'I understand now.', level: 'A2', category: 'verbs', phonetic: '/ˌʌndərˈstænd/' },
  { word: 'believe', meaning: 'inanmak', example: 'I believe you.', level: 'A2', category: 'verbs', phonetic: '/bɪˈliːv/' },
  { word: 'choose', meaning: 'seçmek', example: 'Choose one color.', level: 'A2', category: 'verbs', phonetic: '/tʃuːz/' },
  { word: 'decide', meaning: 'karar vermek', example: 'I cannot decide.', level: 'A2', category: 'verbs', phonetic: '/dɪˈsaɪd/' },
  { word: 'explain', meaning: 'açıklamak', example: 'Please explain the rule.', level: 'A2', category: 'verbs', phonetic: '/ɪkˈspleɪn/' },
  { word: 'invite', meaning: 'davet etmek', example: 'I invite you to my party.', level: 'A2', category: 'verbs', phonetic: '/ɪnˈvaɪt/' },
  { word: 'practice', meaning: 'pratik yapmak', example: 'Practice makes perfect.', level: 'A2', category: 'verbs', phonetic: '/ˈpræktɪs/' },
  { word: 'promise', meaning: 'söz vermek', example: 'I promise to be careful.', level: 'A2', category: 'verbs', phonetic: '/ˈprɒmɪs/' },
  { word: 'prepare', meaning: 'hazırlamak', example: 'Prepare your homework.', level: 'A2', category: 'verbs', phonetic: '/prɪˈpɛr/' },
  { word: 'carry', meaning: 'taşımak', example: 'Can you carry this box?', level: 'A2', category: 'verbs', phonetic: '/ˈkæri/' },
  { word: 'pay', meaning: 'ödemek', example: 'I will pay the bill.', level: 'A2', category: 'verbs', phonetic: '/peɪ/' },
  { word: 'spend', meaning: 'harcamak', example: 'I spend time with family.', level: 'A2', category: 'verbs', phonetic: '/spɛnd/' },
  { word: 'borrow', meaning: 'ödünç almak', example: 'Can I borrow your pen?', level: 'A2', category: 'verbs', phonetic: '/ˈbɒroʊ/' },
  { word: 'lend', meaning: 'ödünç vermek', example: 'Lend me your book.', level: 'A2', category: 'verbs', phonetic: '/lɛnd/' },

  // More adjectives/adverbs
  { word: 'busy', meaning: 'meşgul', example: 'I am very busy today.', level: 'A2', category: 'adjectives', phonetic: '/ˈbɪzi/' },
  { word: 'free', meaning: 'boş', example: 'Are you free tonight?', level: 'A2', category: 'adjectives', phonetic: '/friː/' },
  { word: 'ready', meaning: 'hazır', example: 'I am ready to go.', level: 'A2', category: 'adjectives', phonetic: '/ˈrɛdi/' },
  { word: 'late', meaning: 'geç', example: 'Do not be late.', level: 'A2', category: 'adjectives', phonetic: '/leɪt/' },
  { word: 'early', meaning: 'erken', example: 'I woke up early.', level: 'A2', category: 'adjectives', phonetic: '/ˈɜːrli/' },
  { word: 'safe', meaning: 'güvenli', example: 'This place is safe.', level: 'A2', category: 'adjectives', phonetic: '/seɪf/' },
  { word: 'dangerous', meaning: 'tehlikeli', example: 'That road is dangerous.', level: 'A2', category: 'adjectives', phonetic: '/ˈdeɪndʒərəs/' },
  { word: 'important', meaning: 'önemli', example: 'This meeting is important.', level: 'A2', category: 'adjectives', phonetic: '/ɪmˈpɔːrtənt/' },
  { word: 'different', meaning: 'farklı', example: 'We have different ideas.', level: 'A2', category: 'adjectives', phonetic: '/ˈdɪfərənt/' },
  { word: 'same', meaning: 'aynı', example: 'We have the same bag.', level: 'A2', category: 'adjectives', phonetic: '/seɪm/' },
  { word: 'similar', meaning: 'benzer', example: 'These two are similar.', level: 'A2', category: 'adjectives', phonetic: '/ˈsɪmɪlər/' },
  { word: 'popular', meaning: 'popüler', example: 'This song is very popular.', level: 'A2', category: 'adjectives', phonetic: '/ˈpɒpjʊlər/' },
  { word: 'famous', meaning: 'ünlü', example: 'Istanbul is a famous city.', level: 'A2', category: 'adjectives', phonetic: '/ˈfeɪməs/' },
  { word: 'quiet', meaning: 'sessiz', example: 'The library is quiet.', level: 'A2', category: 'adjectives', phonetic: '/ˈkwaɪət/' },
  { word: 'loud', meaning: 'gürültülü', example: 'The music is too loud.', level: 'A2', category: 'adjectives', phonetic: '/laʊd/' },
  { word: 'wrong', meaning: 'yanlış', example: 'The answer is wrong.', level: 'A2', category: 'adjectives', phonetic: '/rɒŋ/' },
  { word: 'right', meaning: 'doğru', example: 'You are right.', level: 'A2', category: 'adjectives', phonetic: '/raɪt/' },
  { word: 'heavy', meaning: 'ağır', example: 'This box is heavy.', level: 'A2', category: 'adjectives', phonetic: '/ˈhɛvi/' },
  { word: 'light', meaning: 'hafif', example: 'The bag is light.', level: 'A2', category: 'adjectives', phonetic: '/laɪt/' },
  { word: 'full', meaning: 'dolu', example: 'The glass is full.', level: 'A2', category: 'adjectives', phonetic: '/fʊl/' },
  { word: 'empty', meaning: 'boş', example: 'The room is empty.', level: 'A2', category: 'adjectives', phonetic: '/ˈɛmpti/' },

  // Nouns continued
  { word: 'birthday', meaning: 'doğum günü', example: 'Happy birthday to you!', level: 'A2', category: 'general', phonetic: '/ˈbɜːrθdeɪ/' },
  { word: 'party', meaning: 'parti', example: 'I went to a party.', level: 'A2', category: 'general', phonetic: '/ˈpɑːrti/' },
  { word: 'music', meaning: 'müzik', example: 'I love listening to music.', level: 'A2', category: 'general', phonetic: '/ˈmjuːzɪk/' },
  { word: 'movie', meaning: 'film', example: 'We watched a good movie.', level: 'A2', category: 'general', phonetic: '/ˈmuːvi/' },
  { word: 'sport', meaning: 'spor', example: 'My favorite sport is football.', level: 'A2', category: 'general', phonetic: '/spɔːrt/' },
  { word: 'game', meaning: 'oyun', example: 'Let us play a game.', level: 'A2', category: 'general', phonetic: '/ɡeɪm/' },
  { word: 'news', meaning: 'haber', example: 'I watch the news at night.', level: 'A2', category: 'general', phonetic: '/njuːz/' },
  { word: 'letter', meaning: 'mektup', example: 'I wrote a letter to my friend.', level: 'A2', category: 'general', phonetic: '/ˈlɛtər/' },
  { word: 'problem', meaning: 'sorun', example: 'There is a problem.', level: 'A2', category: 'general', phonetic: '/ˈprɒbləm/' },
  { word: 'question', meaning: 'soru', example: 'I have a question.', level: 'A2', category: 'general', phonetic: '/ˈkwɛstʃən/' },
  { word: 'answer', meaning: 'cevap', example: 'I know the answer.', level: 'A2', category: 'general', phonetic: '/ˈænsər/' },
  { word: 'idea', meaning: 'fikir', example: 'That is a good idea.', level: 'A2', category: 'general', phonetic: '/aɪˈdɪə/' },
  { word: 'example', meaning: 'örnek', example: 'Give me an example.', level: 'A2', category: 'general', phonetic: '/ɪɡˈzæmpəl/' },
  { word: 'reason', meaning: 'sebep', example: 'Tell me the reason.', level: 'A2', category: 'general', phonetic: '/ˈriːzən/' },
  { word: 'difference', meaning: 'fark', example: 'What is the difference?', level: 'A2', category: 'general', phonetic: '/ˈdɪfərəns/' },
  { word: 'neighbor', meaning: 'komşu', example: 'My neighbor is friendly.', level: 'A2', category: 'general', phonetic: '/ˈneɪbər/' },
  { word: 'guest', meaning: 'misafir', example: 'We have guests tonight.', level: 'A2', category: 'general', phonetic: '/ɡɛst/' },
  { word: 'floor', meaning: 'kat', example: 'I live on the third floor.', level: 'A2', category: 'general', phonetic: '/flɔːr/' },
  { word: 'corner', meaning: 'köşe', example: 'The shop is on the corner.', level: 'A2', category: 'general', phonetic: '/ˈkɔːrnər/' },
  { word: 'bridge', meaning: 'köprü', example: 'We crossed the bridge.', level: 'A2', category: 'general', phonetic: '/brɪdʒ/' },
]

/* ─── B1 – Intermediate (150 words) ──────────────────── */
const B1_CARDS: SeedCard[] = [
  // Education & technology
  { word: 'university', meaning: 'üniversite', example: 'I study at university.', level: 'B1', category: 'education', phonetic: '/ˌjuːnɪˈvɜːrsəti/' },
  { word: 'knowledge', meaning: 'bilgi', example: 'Knowledge is power.', level: 'B1', category: 'education', phonetic: '/ˈnɒlɪdʒ/' },
  { word: 'research', meaning: 'araştırma', example: 'I did some research on the topic.', level: 'B1', category: 'education', phonetic: '/rɪˈsɜːrtʃ/' },
  { word: 'experiment', meaning: 'deney', example: 'The experiment was successful.', level: 'B1', category: 'education', phonetic: '/ɪkˈspɛrɪmənt/' },
  { word: 'degree', meaning: 'diploma', example: 'She has a degree in engineering.', level: 'B1', category: 'education', phonetic: '/dɪˈɡriː/' },
  { word: 'exam', meaning: 'sınav', example: 'I passed the exam.', level: 'B1', category: 'education', phonetic: '/ɪɡˈzæm/' },
  { word: 'grade', meaning: 'not', example: 'I got a good grade.', level: 'B1', category: 'education', phonetic: '/ɡreɪd/' },
  { word: 'lecture', meaning: 'ders', example: 'The lecture was interesting.', level: 'B1', category: 'education', phonetic: '/ˈlɛktʃər/' },
  { word: 'internet', meaning: 'internet', example: 'I use the internet every day.', level: 'B1', category: 'technology', phonetic: '/ˈɪntərˌnɛt/' },
  { word: 'software', meaning: 'yazılım', example: 'I develop software.', level: 'B1', category: 'technology', phonetic: '/ˈsɒftwɛr/' },
  { word: 'website', meaning: 'web sitesi', example: 'Visit our website for details.', level: 'B1', category: 'technology', phonetic: '/ˈwɛbsaɪt/' },
  { word: 'password', meaning: 'şifre', example: 'Change your password regularly.', level: 'B1', category: 'technology', phonetic: '/ˈpæswɜːrd/' },
  { word: 'screen', meaning: 'ekran', example: 'The screen is too bright.', level: 'B1', category: 'technology', phonetic: '/skriːn/' },
  { word: 'download', meaning: 'indirmek', example: 'Download the app from the store.', level: 'B1', category: 'technology', phonetic: '/ˈdaʊnloʊd/' },

  // Environment & Nature
  { word: 'environment', meaning: 'çevre', example: 'We must protect the environment.', level: 'B1', category: 'environment', phonetic: '/ɪnˈvaɪrənmənt/' },
  { word: 'pollution', meaning: 'kirlilik', example: 'Air pollution is a big problem.', level: 'B1', category: 'environment', phonetic: '/pəˈluːʃən/' },
  { word: 'recycle', meaning: 'geri dönüştürmek', example: 'We should recycle paper.', level: 'B1', category: 'environment', phonetic: '/riːˈsaɪkəl/' },
  { word: 'energy', meaning: 'enerji', example: 'Solar energy is clean.', level: 'B1', category: 'environment', phonetic: '/ˈɛnərdʒi/' },
  { word: 'climate', meaning: 'iklim', example: 'The climate is changing.', level: 'B1', category: 'environment', phonetic: '/ˈklaɪmət/' },
  { word: 'forest', meaning: 'orman', example: 'The forest is full of animals.', level: 'B1', category: 'environment', phonetic: '/ˈfɒrɪst/' },
  { word: 'island', meaning: 'ada', example: 'We visited a small island.', level: 'B1', category: 'environment', phonetic: '/ˈaɪlənd/' },
  { word: 'ocean', meaning: 'okyanus', example: 'The Pacific Ocean is the largest.', level: 'B1', category: 'environment', phonetic: '/ˈoʊʃən/' },

  // Culture & Society
  { word: 'culture', meaning: 'kültür', example: 'Turkish culture is rich.', level: 'B1', category: 'culture', phonetic: '/ˈkʌltʃər/' },
  { word: 'tradition', meaning: 'gelenek', example: 'It is a tradition to eat together.', level: 'B1', category: 'culture', phonetic: '/trəˈdɪʃən/' },
  { word: 'religion', meaning: 'din', example: 'People of different religions live here.', level: 'B1', category: 'culture', phonetic: '/rɪˈlɪdʒən/' },
  { word: 'ceremony', meaning: 'tören', example: 'The graduation ceremony was nice.', level: 'B1', category: 'culture', phonetic: '/ˈsɛrɪmoʊni/' },
  { word: 'society', meaning: 'toplum', example: 'Education helps society.', level: 'B1', category: 'culture', phonetic: '/səˈsaɪəti/' },
  { word: 'government', meaning: 'hükümet', example: 'The government made new rules.', level: 'B1', category: 'culture', phonetic: '/ˈɡʌvərnmənt/' },
  { word: 'law', meaning: 'yasa', example: 'Everyone must follow the law.', level: 'B1', category: 'culture', phonetic: '/lɔː/' },
  { word: 'freedom', meaning: 'özgürlük', example: 'Freedom of speech is important.', level: 'B1', category: 'culture', phonetic: '/ˈfriːdəm/' },

  // Abstract & Intermediate verbs
  { word: 'achieve', meaning: 'başarmak', example: 'She achieved her goals.', level: 'B1', category: 'verbs', phonetic: '/əˈtʃiːv/' },
  { word: 'develop', meaning: 'geliştirmek', example: 'We develop new products.', level: 'B1', category: 'verbs', phonetic: '/dɪˈvɛləp/' },
  { word: 'encourage', meaning: 'teşvik etmek', example: 'Teachers encourage students.', level: 'B1', category: 'verbs', phonetic: '/ɪnˈkʌrɪdʒ/' },
  { word: 'improve', meaning: 'geliştirmek', example: 'I want to improve my English.', level: 'B1', category: 'verbs', phonetic: '/ɪmˈpruːv/' },
  { word: 'increase', meaning: 'artırmak', example: 'Prices have increased.', level: 'B1', category: 'verbs', phonetic: '/ɪnˈkriːs/' },
  { word: 'reduce', meaning: 'azaltmak', example: 'We need to reduce waste.', level: 'B1', category: 'verbs', phonetic: '/rɪˈdjuːs/' },
  { word: 'suggest', meaning: 'önermek', example: 'I suggest we leave early.', level: 'B1', category: 'verbs', phonetic: '/səˈdʒɛst/' },
  { word: 'discuss', meaning: 'tartışmak', example: 'Let us discuss the plan.', level: 'B1', category: 'verbs', phonetic: '/dɪˈskʌs/' },
  { word: 'organize', meaning: 'organize etmek', example: 'I organize events at school.', level: 'B1', category: 'verbs', phonetic: '/ˈɔːrɡənaɪz/' },
  { word: 'compare', meaning: 'karşılaştırmak', example: 'Compare the two pictures.', level: 'B1', category: 'verbs', phonetic: '/kəmˈpɛr/' },
  { word: 'depend', meaning: 'bağlı olmak', example: 'It depends on the weather.', level: 'B1', category: 'verbs', phonetic: '/dɪˈpɛnd/' },
  { word: 'create', meaning: 'yaratmak', example: 'Artists create beautiful works.', level: 'B1', category: 'verbs', phonetic: '/kriˈeɪt/' },
  { word: 'discover', meaning: 'keşfetmek', example: 'Scientists discover new things.', level: 'B1', category: 'verbs', phonetic: '/dɪˈskʌvər/' },
  { word: 'support', meaning: 'desteklemek', example: 'I support your decision.', level: 'B1', category: 'verbs', phonetic: '/səˈpɔːrt/' },
  { word: 'attend', meaning: 'katılmak', example: 'I will attend the conference.', level: 'B1', category: 'verbs', phonetic: '/əˈtɛnd/' },
  { word: 'belong', meaning: 'ait olmak', example: 'This book belongs to me.', level: 'B1', category: 'verbs', phonetic: '/bɪˈlɒŋ/' },
  { word: 'cooperate', meaning: 'işbirliği yapmak', example: 'We must cooperate as a team.', level: 'B1', category: 'verbs', phonetic: '/koʊˈɒpəreɪt/' },
  { word: 'recommend', meaning: 'tavsiye etmek', example: 'I recommend this book.', level: 'B1', category: 'verbs', phonetic: '/ˌrɛkəˈmɛnd/' },

  // Intermediate adjectives
  { word: 'available', meaning: 'mevcut', example: 'Is this room available?', level: 'B1', category: 'adjectives', phonetic: '/əˈveɪləbəl/' },
  { word: 'necessary', meaning: 'gerekli', example: 'Sleep is necessary for health.', level: 'B1', category: 'adjectives', phonetic: '/ˈnɛsəsɛri/' },
  { word: 'possible', meaning: 'mümkün', example: 'Is it possible to change?', level: 'B1', category: 'adjectives', phonetic: '/ˈpɒsɪbəl/' },
  { word: 'impossible', meaning: 'imkansız', example: 'Nothing is impossible.', level: 'B1', category: 'adjectives', phonetic: '/ɪmˈpɒsɪbəl/' },
  { word: 'comfortable', meaning: 'rahat', example: 'This chair is comfortable.', level: 'B1', category: 'adjectives', phonetic: '/ˈkʌmftəbəl/' },
  { word: 'convenient', meaning: 'uygun', example: 'Is this time convenient for you?', level: 'B1', category: 'adjectives', phonetic: '/kənˈviːniənt/' },
  { word: 'traditional', meaning: 'geleneksel', example: 'This is a traditional dance.', level: 'B1', category: 'adjectives', phonetic: '/trəˈdɪʃənəl/' },
  { word: 'modern', meaning: 'modern', example: 'The building is very modern.', level: 'B1', category: 'adjectives', phonetic: '/ˈmɒdərn/' },
  { word: 'ancient', meaning: 'antik', example: 'Ancient ruins are fascinating.', level: 'B1', category: 'adjectives', phonetic: '/ˈeɪnʃənt/' },
  { word: 'responsible', meaning: 'sorumlu', example: 'I am responsible for this project.', level: 'B1', category: 'adjectives', phonetic: '/rɪˈspɒnsɪbəl/' },
  { word: 'successful', meaning: 'başarılı', example: 'She is a successful doctor.', level: 'B1', category: 'adjectives', phonetic: '/səkˈsɛsfəl/' },
  { word: 'creative', meaning: 'yaratıcı', example: 'The artist is very creative.', level: 'B1', category: 'adjectives', phonetic: '/kriˈeɪtɪv/' },
  { word: 'independent', meaning: 'bağımsız', example: 'She is very independent.', level: 'B1', category: 'adjectives', phonetic: '/ˌɪndɪˈpɛndənt/' },

  // Intermediate nouns
  { word: 'experience', meaning: 'deneyim', example: 'I have five years of experience.', level: 'B1', category: 'general', phonetic: '/ɪkˈspɪriəns/' },
  { word: 'opportunity', meaning: 'fırsat', example: 'This is a great opportunity.', level: 'B1', category: 'general', phonetic: '/ˌɒpərˈtuːnəti/' },
  { word: 'advantage', meaning: 'avantaj', example: 'Speaking two languages is an advantage.', level: 'B1', category: 'general', phonetic: '/ədˈvæntɪdʒ/' },
  { word: 'decision', meaning: 'karar', example: 'It was a difficult decision.', level: 'B1', category: 'general', phonetic: '/dɪˈsɪʒən/' },
  { word: 'situation', meaning: 'durum', example: 'The situation is improving.', level: 'B1', category: 'general', phonetic: '/ˌsɪtʃuˈeɪʃən/' },
  { word: 'opinion', meaning: 'görüş', example: 'In my opinion, this is wrong.', level: 'B1', category: 'general', phonetic: '/əˈpɪnjən/' },
  { word: 'purpose', meaning: 'amaç', example: 'What is the purpose of this meeting?', level: 'B1', category: 'general', phonetic: '/ˈpɜːrpəs/' },
  { word: 'memory', meaning: 'hafıza', example: 'She has a good memory.', level: 'B1', category: 'general', phonetic: '/ˈmɛməri/' },
  { word: 'attention', meaning: 'dikkat', example: 'Pay attention to the teacher.', level: 'B1', category: 'general', phonetic: '/əˈtɛnʃən/' },
  { word: 'appointment', meaning: 'randevu', example: 'I have a doctor appointment.', level: 'B1', category: 'general', phonetic: '/əˈpɔɪntmənt/' },
  { word: 'education', meaning: 'eğitim', example: 'Education is very important.', level: 'B1', category: 'general', phonetic: '/ˌɛdʒuˈkeɪʃən/' },
  { word: 'industry', meaning: 'endüstri', example: 'The tourism industry is growing.', level: 'B1', category: 'general', phonetic: '/ˈɪndəstri/' },
  { word: 'accident', meaning: 'kaza', example: 'There was a car accident.', level: 'B1', category: 'general', phonetic: '/ˈæksɪdənt/' },
  { word: 'community', meaning: 'topluluk', example: 'Our community is strong.', level: 'B1', category: 'general', phonetic: '/kəˈmjuːnəti/' },
  { word: 'customer', meaning: 'müşteri', example: 'The customer is always right.', level: 'B1', category: 'general', phonetic: '/ˈkʌstəmər/' },
  { word: 'salary', meaning: 'maaş', example: 'I get my salary on the first.', level: 'B1', category: 'general', phonetic: '/ˈsæləri/' },
  { word: 'distance', meaning: 'mesafe', example: 'The distance is 10 kilometers.', level: 'B1', category: 'general', phonetic: '/ˈdɪstəns/' },
  { word: 'direction', meaning: 'yön', example: 'Which direction should I go?', level: 'B1', category: 'general', phonetic: '/dɪˈrɛkʃən/' },
]

/* ─── B2 – Upper Intermediate (150 words) ────────────── */
const B2_CARDS: SeedCard[] = [
  // Business & Professional
  { word: 'negotiate', meaning: 'müzakere etmek', example: 'We need to negotiate the terms.', level: 'B2', category: 'business', phonetic: '/nɪˈɡoʊʃieɪt/' },
  { word: 'strategy', meaning: 'strateji', example: 'We need a new business strategy.', level: 'B2', category: 'business', phonetic: '/ˈstrætədʒi/' },
  { word: 'deadline', meaning: 'son tarih', example: 'The deadline is next Friday.', level: 'B2', category: 'business', phonetic: '/ˈdɛdlaɪn/' },
  { word: 'budget', meaning: 'bütçe', example: 'We are over budget this month.', level: 'B2', category: 'business', phonetic: '/ˈbʌdʒɪt/' },
  { word: 'profit', meaning: 'kar', example: 'The company made a profit.', level: 'B2', category: 'business', phonetic: '/ˈprɒfɪt/' },
  { word: 'investment', meaning: 'yatırım', example: 'Education is a good investment.', level: 'B2', category: 'business', phonetic: '/ɪnˈvɛstmənt/' },
  { word: 'competition', meaning: 'rekabet', example: 'Competition drives innovation.', level: 'B2', category: 'business', phonetic: '/ˌkɒmpəˈtɪʃən/' },
  { word: 'entrepreneur', meaning: 'girişimci', example: 'She is a successful entrepreneur.', level: 'B2', category: 'business', phonetic: '/ˌɒntrəprəˈnɜːr/' },
  { word: 'revenue', meaning: 'gelir', example: 'Annual revenue increased by 20%.', level: 'B2', category: 'business', phonetic: '/ˈrɛvənjuː/' },
  { word: 'contract', meaning: 'sözleşme', example: 'Sign the contract by Monday.', level: 'B2', category: 'business', phonetic: '/ˈkɒntrækt/' },

  // Science
  { word: 'hypothesis', meaning: 'hipotez', example: 'Our hypothesis was confirmed.', level: 'B2', category: 'science', phonetic: '/haɪˈpɒθəsɪs/' },
  { word: 'evidence', meaning: 'kanıt', example: 'There is no evidence for that.', level: 'B2', category: 'science', phonetic: '/ˈɛvɪdəns/' },
  { word: 'theory', meaning: 'teori', example: 'Einstein developed the theory of relativity.', level: 'B2', category: 'science', phonetic: '/ˈθɪəri/' },
  { word: 'analysis', meaning: 'analiz', example: 'The data analysis took weeks.', level: 'B2', category: 'science', phonetic: '/əˈnæləsɪs/' },
  { word: 'conclusion', meaning: 'sonuç', example: 'In conclusion, the study was successful.', level: 'B2', category: 'science', phonetic: '/kənˈkluːʒən/' },
  { word: 'phenomenon', meaning: 'fenomen', example: 'Northern lights are a natural phenomenon.', level: 'B2', category: 'science', phonetic: '/fɪˈnɒmɪnən/' },
  { word: 'genetic', meaning: 'genetik', example: 'Eye color is genetic.', level: 'B2', category: 'science', phonetic: '/dʒəˈnɛtɪk/' },
  { word: 'molecule', meaning: 'molekül', example: 'Water is a simple molecule.', level: 'B2', category: 'science', phonetic: '/ˈmɒlɪkjuːl/' },

  // Advanced verbs
  { word: 'acknowledge', meaning: 'kabul etmek', example: 'He acknowledged his mistake.', level: 'B2', category: 'verbs', phonetic: '/əkˈnɒlɪdʒ/' },
  { word: 'allocate', meaning: 'tahsis etmek', example: 'Allocate resources wisely.', level: 'B2', category: 'verbs', phonetic: '/ˈæləkeɪt/' },
  { word: 'anticipate', meaning: 'öngörmek', example: 'We anticipate strong demand.', level: 'B2', category: 'verbs', phonetic: '/ænˈtɪsɪpeɪt/' },
  { word: 'collaborate', meaning: 'işbirliği yapmak', example: 'Teams collaborate on projects.', level: 'B2', category: 'verbs', phonetic: '/kəˈlæbəreɪt/' },
  { word: 'compensate', meaning: 'telafi etmek', example: 'We will compensate for the delay.', level: 'B2', category: 'verbs', phonetic: '/ˈkɒmpənseɪt/' },
  { word: 'contradict', meaning: 'çelişmek', example: 'His actions contradict his words.', level: 'B2', category: 'verbs', phonetic: '/ˌkɒntrəˈdɪkt/' },
  { word: 'demonstrate', meaning: 'göstermek', example: 'The experiment demonstrates the theory.', level: 'B2', category: 'verbs', phonetic: '/ˈdɛmənstreɪt/' },
  { word: 'eliminate', meaning: 'ortadan kaldırmak', example: 'We need to eliminate errors.', level: 'B2', category: 'verbs', phonetic: '/ɪˈlɪmɪneɪt/' },
  { word: 'evaluate', meaning: 'değerlendirmek', example: 'We will evaluate all applications.', level: 'B2', category: 'verbs', phonetic: '/ɪˈvæljueɪt/' },
  { word: 'guarantee', meaning: 'garanti etmek', example: 'I cannot guarantee success.', level: 'B2', category: 'verbs', phonetic: '/ˌɡærənˈtiː/' },
  { word: 'implement', meaning: 'uygulamak', example: 'We will implement the plan next week.', level: 'B2', category: 'verbs', phonetic: '/ˈɪmplɪmɛnt/' },
  { word: 'investigate', meaning: 'soruşturmak', example: 'Police are investigating the case.', level: 'B2', category: 'verbs', phonetic: '/ɪnˈvɛstɪɡeɪt/' },
  { word: 'justify', meaning: 'haklı çıkarmak', example: 'How do you justify this decision?', level: 'B2', category: 'verbs', phonetic: '/ˈdʒʌstɪfaɪ/' },
  { word: 'maintain', meaning: 'sürdürmek', example: 'Maintain a healthy lifestyle.', level: 'B2', category: 'verbs', phonetic: '/meɪnˈteɪn/' },
  { word: 'overcome', meaning: 'üstesinden gelmek', example: 'She overcame many obstacles.', level: 'B2', category: 'verbs', phonetic: '/ˌoʊvərˈkʌm/' },
  { word: 'perceive', meaning: 'algılamak', example: 'People perceive things differently.', level: 'B2', category: 'verbs', phonetic: '/pərˈsiːv/' },
  { word: 'pursue', meaning: 'peşinden gitmek', example: 'Pursue your dreams.', level: 'B2', category: 'verbs', phonetic: '/pərˈsuː/' },
  { word: 'transform', meaning: 'dönüştürmek', example: 'Technology transforms our lives.', level: 'B2', category: 'verbs', phonetic: '/trænsˈfɔːrm/' },

  // Advanced adjectives
  { word: 'adequate', meaning: 'yeterli', example: 'Is the budget adequate?', level: 'B2', category: 'adjectives', phonetic: '/ˈædɪkwət/' },
  { word: 'comprehensive', meaning: 'kapsamlı', example: 'We need a comprehensive plan.', level: 'B2', category: 'adjectives', phonetic: '/ˌkɒmprɪˈhɛnsɪv/' },
  { word: 'controversial', meaning: 'tartışmalı', example: 'That is a controversial topic.', level: 'B2', category: 'adjectives', phonetic: '/ˌkɒntrəˈvɜːrʃəl/' },
  { word: 'crucial', meaning: 'çok önemli', example: 'This step is crucial.', level: 'B2', category: 'adjectives', phonetic: '/ˈkruːʃəl/' },
  { word: 'diverse', meaning: 'çeşitli', example: 'We have a diverse team.', level: 'B2', category: 'adjectives', phonetic: '/daɪˈvɜːrs/' },
  { word: 'efficient', meaning: 'verimli', example: 'This method is very efficient.', level: 'B2', category: 'adjectives', phonetic: '/ɪˈfɪʃənt/' },
  { word: 'enormous', meaning: 'devasa', example: 'The building is enormous.', level: 'B2', category: 'adjectives', phonetic: '/ɪˈnɔːrməs/' },
  { word: 'fundamental', meaning: 'temel', example: 'This is a fundamental concept.', level: 'B2', category: 'adjectives', phonetic: '/ˌfʌndəˈmɛntəl/' },
  { word: 'inevitable', meaning: 'kaçınılmaz', example: 'Change is inevitable.', level: 'B2', category: 'adjectives', phonetic: '/ɪnˈɛvɪtəbəl/' },
  { word: 'precise', meaning: 'kesin', example: 'Be more precise in your answer.', level: 'B2', category: 'adjectives', phonetic: '/prɪˈsaɪs/' },
  { word: 'remarkable', meaning: 'dikkat çekici', example: 'Her progress is remarkable.', level: 'B2', category: 'adjectives', phonetic: '/rɪˈmɑːrkəbəl/' },
  { word: 'significant', meaning: 'önemli', example: 'This is a significant improvement.', level: 'B2', category: 'adjectives', phonetic: '/sɪɡˈnɪfɪkənt/' },
  { word: 'substantial', meaning: 'önemli miktarda', example: 'There was a substantial increase.', level: 'B2', category: 'adjectives', phonetic: '/səbˈstænʃəl/' },
  { word: 'sustainable', meaning: 'sürdürülebilir', example: 'We need sustainable energy sources.', level: 'B2', category: 'adjectives', phonetic: '/səˈsteɪnəbəl/' },
  { word: 'vulnerable', meaning: 'savunmasız', example: 'Children are the most vulnerable.', level: 'B2', category: 'adjectives', phonetic: '/ˈvʌlnərəbəl/' },

  // Idioms & Expressions
  { word: 'break the ice', meaning: 'buzları kırmak', example: 'A joke can break the ice.', level: 'B2', category: 'idioms', phonetic: null },
  { word: 'get along', meaning: 'geçinmek', example: 'I get along with my neighbors.', level: 'B2', category: 'idioms', phonetic: null },
  { word: 'look forward to', meaning: 'dört gözle beklemek', example: 'I look forward to seeing you.', level: 'B2', category: 'idioms', phonetic: null },
  { word: 'make up one\'s mind', meaning: 'karar vermek', example: 'I cannot make up my mind.', level: 'B2', category: 'idioms', phonetic: null },
  { word: 'take into account', meaning: 'hesaba katmak', example: 'Take the weather into account.', level: 'B2', category: 'idioms', phonetic: null },
  { word: 'run out of', meaning: 'tükenmek', example: 'We ran out of milk.', level: 'B2', category: 'idioms', phonetic: null },
  { word: 'figure out', meaning: 'çözmek', example: 'I need to figure out this problem.', level: 'B2', category: 'idioms', phonetic: null },
  { word: 'come across', meaning: 'rastlamak', example: 'I came across an old photo.', level: 'B2', category: 'idioms', phonetic: null },

  // Advanced nouns
  { word: 'awareness', meaning: 'farkındalık', example: 'Raise awareness about pollution.', level: 'B2', category: 'general', phonetic: '/əˈwɛrnəs/' },
  { word: 'consequence', meaning: 'sonuç', example: 'Every action has consequences.', level: 'B2', category: 'general', phonetic: '/ˈkɒnsɪkwəns/' },
  { word: 'controversy', meaning: 'tartışma', example: 'The law created controversy.', level: 'B2', category: 'general', phonetic: '/ˈkɒntrəvɜːrsi/' },
  { word: 'perspective', meaning: 'bakış açısı', example: 'Try to see it from my perspective.', level: 'B2', category: 'general', phonetic: '/pərˈspɛktɪv/' },
  { word: 'phenomenon', meaning: 'olgu', example: 'Social media is a modern phenomenon.', level: 'B2', category: 'general', phonetic: '/fɪˈnɒmɪnən/' },
  { word: 'statistics', meaning: 'istatistik', example: 'Statistics show improvement.', level: 'B2', category: 'general', phonetic: '/stəˈtɪstɪks/' },
  { word: 'infrastructure', meaning: 'altyapı', example: 'The city needs better infrastructure.', level: 'B2', category: 'general', phonetic: '/ˈɪnfrəstrʌktʃər/' },
  { word: 'innovation', meaning: 'yenilik', example: 'Innovation drives economic growth.', level: 'B2', category: 'general', phonetic: '/ˌɪnəˈveɪʃən/' },
  { word: 'complexity', meaning: 'karmaşıklık', example: 'The complexity of the problem.', level: 'B2', category: 'general', phonetic: '/kəmˈplɛksəti/' },
  { word: 'unemployment', meaning: 'işsizlik', example: 'Unemployment rates are falling.', level: 'B2', category: 'general', phonetic: '/ˌʌnɪmˈplɔɪmənt/' },
]

const SEED_CARDS: SeedCard[] = [...A1_CARDS, ...A2_CARDS, ...B1_CARDS, ...B2_CARDS]

const STARTER_PLANT = {
  speciesId: 'starter-fern',
  level: 1,
  xp: 0,
  health: 100,
  stage: 'seed',
}

export async function seedIfEmpty(db: SQLiteDatabase): Promise<void> {
  const now = getDevNowIso()

  const cardsCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM srs_cards',
  )
  if ((cardsCount?.count ?? 0) === 0) {
    for (const card of SEED_CARDS) {
      await db.runAsync(
        'INSERT INTO srs_cards (word, meaning, example, level, category, phonetic, interval, ease, dueDate, lapses) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        card.word,
        card.meaning,
        card.example,
        card.level,
        card.category,
        card.phonetic,
        1,
        2.5,
        now,
        0,
      )
    }
  }

  const plantCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM plants')
  if ((plantCount?.count ?? 0) === 0) {
    await db.runAsync(
      'INSERT INTO plants (speciesId, level, xp, health, stage, totalWater, totalSun, totalFertilizer, totalRoots, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      STARTER_PLANT.speciesId,
      STARTER_PLANT.level,
      STARTER_PLANT.xp,
      STARTER_PLANT.health,
      STARTER_PLANT.stage,
      0,
      0,
      0,
      0,
      now,
    )
  }

  const streakRow = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM streaks')
  if ((streakRow?.count ?? 0) === 0) {
    await db.runAsync(
      'INSERT INTO streaks (id, currentStreak, lastSessionDate) VALUES (?, ?, ?)',
      1,
      0,
      null,
    )
  }
}
