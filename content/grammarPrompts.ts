import type { Difficulty } from '@/gameplay'

export interface GrammarPrompt {
  id: number
  difficulty: Difficulty
  topic: string
  instruction: string
  sentence: string
  choices: [string, string, string]
  correctIndex: 0 | 1 | 2
  explanation: string
}

export const GRAMMAR_PROMPTS: GrammarPrompt[] = [
  // ── EASY (40) ────────────────────────────────

  // Articles
  { id: 1, difficulty: 'easy', topic: 'articles', instruction: 'Choose the correct article.', sentence: '___ apple a day keeps the doctor away.', choices: ['A', 'An', 'The'], correctIndex: 1, explanation: '"An" is used before vowel sounds.' },
  { id: 2, difficulty: 'easy', topic: 'articles', instruction: 'Choose the correct article.', sentence: 'She is ___ teacher at our school.', choices: ['a', 'an', 'the'], correctIndex: 0, explanation: '"A" is used before consonant sounds.' },
  { id: 3, difficulty: 'easy', topic: 'articles', instruction: 'Choose the correct article.', sentence: '___ sun rises in the east.', choices: ['A', 'An', 'The'], correctIndex: 2, explanation: '"The" is used for unique things.' },
  { id: 4, difficulty: 'easy', topic: 'articles', instruction: 'Choose the correct article.', sentence: 'I saw ___ elephant at the zoo.', choices: ['a', 'an', 'the'], correctIndex: 1, explanation: '"An" is used before vowel sounds.' },
  { id: 5, difficulty: 'easy', topic: 'articles', instruction: 'Choose the correct article.', sentence: 'He wants to be ___ doctor.', choices: ['a', 'an', 'the'], correctIndex: 0, explanation: '"A" is used before consonant sounds.' },

  // Present Simple
  { id: 6, difficulty: 'easy', topic: 'present_simple', instruction: 'Choose the correct verb form.', sentence: 'She ___ to school every day.', choices: ['go', 'goes', 'going'], correctIndex: 1, explanation: 'Third person singular takes -es.' },
  { id: 7, difficulty: 'easy', topic: 'present_simple', instruction: 'Choose the correct verb form.', sentence: 'They ___ football on Sundays.', choices: ['plays', 'play', 'playing'], correctIndex: 1, explanation: 'Plural subjects use base form.' },
  { id: 8, difficulty: 'easy', topic: 'present_simple', instruction: 'Choose the correct verb form.', sentence: 'He ___ coffee every morning.', choices: ['drink', 'drinks', 'drinking'], correctIndex: 1, explanation: 'Third person singular takes -s.' },
  { id: 9, difficulty: 'easy', topic: 'present_simple', instruction: 'Choose the correct verb form.', sentence: 'I ___ English at school.', choices: ['study', 'studies', 'studying'], correctIndex: 0, explanation: '"I" uses the base form.' },
  { id: 10, difficulty: 'easy', topic: 'present_simple', instruction: 'Choose the correct negative form.', sentence: 'She ___ like spicy food.', choices: ["don't", "doesn't", "isn't"], correctIndex: 1, explanation: 'Third person singular uses "doesn\'t".' },

  // Pronouns
  { id: 11, difficulty: 'easy', topic: 'pronouns', instruction: 'Choose the correct pronoun.', sentence: '___ is my best friend.', choices: ['He', 'Him', 'His'], correctIndex: 0, explanation: '"He" is the subject pronoun.' },
  { id: 12, difficulty: 'easy', topic: 'pronouns', instruction: 'Choose the correct pronoun.', sentence: 'I gave the book to ___.', choices: ['she', 'her', 'hers'], correctIndex: 1, explanation: '"Her" is the object pronoun.' },
  { id: 13, difficulty: 'easy', topic: 'pronouns', instruction: 'Choose the correct pronoun.', sentence: 'That car is ___.', choices: ['my', 'me', 'mine'], correctIndex: 2, explanation: '"Mine" is a possessive pronoun.' },
  { id: 14, difficulty: 'easy', topic: 'pronouns', instruction: 'Choose the correct pronoun.', sentence: '___ are going to the park.', choices: ['We', 'Us', 'Our'], correctIndex: 0, explanation: '"We" is the subject pronoun.' },

  // Prepositions
  { id: 15, difficulty: 'easy', topic: 'prepositions', instruction: 'Choose the correct preposition.', sentence: 'The cat is ___ the table.', choices: ['on', 'at', 'to'], correctIndex: 0, explanation: '"On" indicates position on a surface.' },
  { id: 16, difficulty: 'easy', topic: 'prepositions', instruction: 'Choose the correct preposition.', sentence: 'I live ___ Istanbul.', choices: ['on', 'in', 'at'], correctIndex: 1, explanation: '"In" is used for cities and countries.' },
  { id: 17, difficulty: 'easy', topic: 'prepositions', instruction: 'Choose the correct preposition.', sentence: 'The meeting is ___ Monday.', choices: ['in', 'on', 'at'], correctIndex: 1, explanation: '"On" is used for days.' },
  { id: 18, difficulty: 'easy', topic: 'prepositions', instruction: 'Choose the correct preposition.', sentence: 'I wake up ___ 7 o\'clock.', choices: ['in', 'on', 'at'], correctIndex: 2, explanation: '"At" is used for specific times.' },

  // To Be
  { id: 19, difficulty: 'easy', topic: 'to_be', instruction: 'Choose the correct form of "to be".', sentence: 'I ___ a student.', choices: ['am', 'is', 'are'], correctIndex: 0, explanation: '"I" takes "am".' },
  { id: 20, difficulty: 'easy', topic: 'to_be', instruction: 'Choose the correct form of "to be".', sentence: 'They ___ from Turkey.', choices: ['am', 'is', 'are'], correctIndex: 2, explanation: '"They" takes "are".' },
  { id: 21, difficulty: 'easy', topic: 'to_be', instruction: 'Choose the correct form of "to be".', sentence: 'My cat ___ very cute.', choices: ['am', 'is', 'are'], correctIndex: 1, explanation: 'Singular nouns take "is".' },

  // Plurals
  { id: 22, difficulty: 'easy', topic: 'plurals', instruction: 'Choose the correct plural form.', sentence: 'I have two ___.', choices: ['child', 'childs', 'children'], correctIndex: 2, explanation: '"Children" is the irregular plural.' },
  { id: 23, difficulty: 'easy', topic: 'plurals', instruction: 'Choose the correct plural form.', sentence: 'There are many ___ in the ocean.', choices: ['fish', 'fishes', 'fishs'], correctIndex: 0, explanation: '"Fish" stays the same in plural.' },
  { id: 24, difficulty: 'easy', topic: 'plurals', instruction: 'Choose the correct plural form.', sentence: 'She bought three ___.', choices: ['tomato', 'tomatos', 'tomatoes'], correctIndex: 2, explanation: 'Words ending in -o add -es.' },

  // Question Forms
  { id: 25, difficulty: 'easy', topic: 'questions', instruction: 'Choose the correct question word.', sentence: '___ is your name?', choices: ['What', 'Where', 'When'], correctIndex: 0, explanation: '"What" asks about identity or things.' },
  { id: 26, difficulty: 'easy', topic: 'questions', instruction: 'Choose the correct question word.', sentence: '___ do you live?', choices: ['What', 'Where', 'When'], correctIndex: 1, explanation: '"Where" asks about place.' },
  { id: 27, difficulty: 'easy', topic: 'questions', instruction: 'Choose the correct question word.', sentence: '___ is your birthday?', choices: ['What', 'Where', 'When'], correctIndex: 2, explanation: '"When" asks about time.' },

  // Can/Can't
  { id: 28, difficulty: 'easy', topic: 'modals', instruction: 'Choose the correct form.', sentence: 'She ___ swim very well.', choices: ['can', 'cans', 'canning'], correctIndex: 0, explanation: '"Can" never changes form.' },
  { id: 29, difficulty: 'easy', topic: 'modals', instruction: 'Choose the correct form.', sentence: 'I ___ speak French.', choices: ["can't", "don't can", "not can"], correctIndex: 0, explanation: '"Can\'t" is the negative of "can".' },

  // There is / There are
  { id: 30, difficulty: 'easy', topic: 'there_is_are', instruction: 'Choose the correct form.', sentence: 'There ___ a book on the table.', choices: ['is', 'are', 'be'], correctIndex: 0, explanation: '"There is" for singular nouns.' },
  { id: 31, difficulty: 'easy', topic: 'there_is_are', instruction: 'Choose the correct form.', sentence: 'There ___ many students in the class.', choices: ['is', 'are', 'be'], correctIndex: 1, explanation: '"There are" for plural nouns.' },

  // Demonstratives
  { id: 32, difficulty: 'easy', topic: 'demonstratives', instruction: 'Choose the correct word.', sentence: '___ are my books over there.', choices: ['This', 'These', 'Those'], correctIndex: 2, explanation: '"Those" is for far plural things.' },
  { id: 33, difficulty: 'easy', topic: 'demonstratives', instruction: 'Choose the correct word.', sentence: '___ is my phone right here.', choices: ['This', 'That', 'These'], correctIndex: 0, explanation: '"This" is for near singular things.' },

  // Have / Has
  { id: 34, difficulty: 'easy', topic: 'have_has', instruction: 'Choose the correct form.', sentence: 'She ___ a beautiful garden.', choices: ['have', 'has', 'having'], correctIndex: 1, explanation: 'Third person singular uses "has".' },
  { id: 35, difficulty: 'easy', topic: 'have_has', instruction: 'Choose the correct form.', sentence: 'We ___ two dogs at home.', choices: ['have', 'has', 'having'], correctIndex: 0, explanation: '"We" uses "have".' },

  // Possessives
  { id: 36, difficulty: 'easy', topic: 'possessives', instruction: 'Choose the correct possessive.', sentence: 'This is ___ book.', choices: ['Tom', "Tom's", 'Toms'], correctIndex: 1, explanation: 'Add \'s for possession.' },
  { id: 37, difficulty: 'easy', topic: 'possessives', instruction: 'Choose the correct word.', sentence: '___ house is very big.', choices: ['They', 'Them', 'Their'], correctIndex: 2, explanation: '"Their" is the possessive adjective.' },

  // Imperatives
  { id: 38, difficulty: 'easy', topic: 'imperatives', instruction: 'Choose the correct imperative.', sentence: '___ the door, please.', choices: ['Close', 'Closes', 'Closing'], correctIndex: 0, explanation: 'Imperatives use the base verb.' },

  // Conjunctions
  { id: 39, difficulty: 'easy', topic: 'conjunctions', instruction: 'Choose the correct conjunction.', sentence: 'I like tea ___ coffee.', choices: ['and', 'but', 'or'], correctIndex: 0, explanation: '"And" joins similar ideas.' },
  { id: 40, difficulty: 'easy', topic: 'conjunctions', instruction: 'Choose the correct conjunction.', sentence: 'I want to go ___ I am tired.', choices: ['and', 'but', 'or'], correctIndex: 1, explanation: '"But" shows contrast.' },

  // ── MEDIUM (40) ──────────────────────────────

  // Present Continuous
  { id: 41, difficulty: 'medium', topic: 'present_continuous', instruction: 'Choose the correct form.', sentence: 'She ___ a book right now.', choices: ['reads', 'is reading', 'read'], correctIndex: 1, explanation: 'Present continuous: am/is/are + -ing.' },
  { id: 42, difficulty: 'medium', topic: 'present_continuous', instruction: 'Choose the correct form.', sentence: 'They ___ football at the moment.', choices: ['play', 'are playing', 'plays'], correctIndex: 1, explanation: 'Use present continuous for actions happening now.' },
  { id: 43, difficulty: 'medium', topic: 'present_continuous', instruction: 'Choose the correct form.', sentence: 'We ___ dinner tonight with friends.', choices: ['have', 'are having', 'has'], correctIndex: 1, explanation: 'Present continuous for planned future arrangements.' },

  // Past Simple
  { id: 44, difficulty: 'medium', topic: 'past_simple', instruction: 'Choose the correct past tense.', sentence: 'She ___ to the store yesterday.', choices: ['go', 'goes', 'went'], correctIndex: 2, explanation: '"Went" is the past tense of "go".' },
  { id: 45, difficulty: 'medium', topic: 'past_simple', instruction: 'Choose the correct past tense.', sentence: 'I ___ a great movie last night.', choices: ['see', 'saw', 'seen'], correctIndex: 1, explanation: '"Saw" is the past tense of "see".' },
  { id: 46, difficulty: 'medium', topic: 'past_simple', instruction: 'Choose the correct past tense.', sentence: 'They ___ arrive on time.', choices: ["didn't", "don't", "weren't"], correctIndex: 0, explanation: 'Past simple negative uses "didn\'t" + base verb.' },
  { id: 47, difficulty: 'medium', topic: 'past_simple', instruction: 'Choose the correct form.', sentence: '___ you finish your homework?', choices: ['Do', 'Did', 'Does'], correctIndex: 1, explanation: 'Past simple questions use "Did".' },

  // Future (will / going to)
  { id: 48, difficulty: 'medium', topic: 'future', instruction: 'Choose the correct future form.', sentence: 'I think it ___ rain tomorrow.', choices: ['will', 'is going to', 'going'], correctIndex: 0, explanation: '"Will" for predictions and beliefs.' },
  { id: 49, difficulty: 'medium', topic: 'future', instruction: 'Choose the correct future form.', sentence: 'She ___ visit her grandmother next week.', choices: ['will', 'is going to', 'going'], correctIndex: 1, explanation: '"Is going to" for planned intentions.' },
  { id: 50, difficulty: 'medium', topic: 'future', instruction: 'Choose the correct form.', sentence: 'I ___ help you with that.', choices: ['will', 'am going', 'going to'], correctIndex: 0, explanation: '"Will" for spontaneous decisions.' },

  // Comparatives
  { id: 51, difficulty: 'medium', topic: 'comparatives', instruction: 'Choose the correct comparative.', sentence: 'This book is ___ than that one.', choices: ['more interesting', 'interestinger', 'most interesting'], correctIndex: 0, explanation: 'Long adjectives use "more + adjective".' },
  { id: 52, difficulty: 'medium', topic: 'comparatives', instruction: 'Choose the correct comparative.', sentence: 'My sister is ___ than me.', choices: ['taller', 'more tall', 'tallest'], correctIndex: 0, explanation: 'Short adjectives add -er.' },
  { id: 53, difficulty: 'medium', topic: 'comparatives', instruction: 'Choose the correct comparative.', sentence: 'This test is ___ than the last one.', choices: ['more easy', 'easier', 'easy'], correctIndex: 1, explanation: 'Adjectives ending in -y change to -ier.' },
  { id: 54, difficulty: 'medium', topic: 'comparatives', instruction: 'Choose the correct form.', sentence: 'She speaks English ___ than her brother.', choices: ['good', 'better', 'best'], correctIndex: 1, explanation: '"Better" is the comparative of "good".' },

  // Superlatives
  { id: 55, difficulty: 'medium', topic: 'superlatives', instruction: 'Choose the correct superlative.', sentence: 'He is ___ student in the class.', choices: ['the best', 'the better', 'the most good'], correctIndex: 0, explanation: '"The best" is the superlative of "good".' },
  { id: 56, difficulty: 'medium', topic: 'superlatives', instruction: 'Choose the correct superlative.', sentence: 'This is ___ movie I have ever seen.', choices: ['the worst', 'the worse', 'the most bad'], correctIndex: 0, explanation: '"The worst" is the superlative of "bad".' },

  // Modals (should / must)
  { id: 57, difficulty: 'medium', topic: 'modals', instruction: 'Choose the correct modal.', sentence: 'You ___ eat more vegetables.', choices: ['should', 'musting', 'canning'], correctIndex: 0, explanation: '"Should" gives advice.' },
  { id: 58, difficulty: 'medium', topic: 'modals', instruction: 'Choose the correct modal.', sentence: 'Students ___ wear uniforms at school.', choices: ['can', 'must', 'should'], correctIndex: 1, explanation: '"Must" expresses obligation.' },
  { id: 59, difficulty: 'medium', topic: 'modals', instruction: 'Choose the correct modal.', sentence: 'You ___ park here. It is not allowed.', choices: ["mustn't", "shouldn't", "don't have to"], correctIndex: 0, explanation: '"Mustn\'t" expresses prohibition.' },

  // Adverbs of Frequency
  { id: 60, difficulty: 'medium', topic: 'adverbs', instruction: 'Choose the correct position.', sentence: 'She ___ late for class.', choices: ['is never', 'never is', 'never does'], correctIndex: 0, explanation: 'Frequency adverbs come after "to be".' },
  { id: 61, difficulty: 'medium', topic: 'adverbs', instruction: 'Choose the correct adverb.', sentence: 'I ___ brush my teeth before bed.', choices: ['always', 'never', 'rarely'], correctIndex: 0, explanation: '"Always" means 100% of the time.' },

  // Countable/Uncountable
  { id: 62, difficulty: 'medium', topic: 'countable_uncountable', instruction: 'Choose the correct word.', sentence: 'How ___ water do you drink daily?', choices: ['many', 'much', 'some'], correctIndex: 1, explanation: '"Much" is used with uncountable nouns.' },
  { id: 63, difficulty: 'medium', topic: 'countable_uncountable', instruction: 'Choose the correct word.', sentence: 'There are ___ books on the shelf.', choices: ['much', 'a lot of', 'a'], correctIndex: 1, explanation: '"A lot of" works with countable plurals.' },
  { id: 64, difficulty: 'medium', topic: 'countable_uncountable', instruction: 'Choose the correct word.', sentence: 'Can I have ___ sugar, please?', choices: ['a', 'some', 'many'], correctIndex: 1, explanation: '"Some" is used with uncountable nouns in requests.' },

  // Present Perfect (intro)
  { id: 65, difficulty: 'medium', topic: 'present_perfect', instruction: 'Choose the correct form.', sentence: 'I ___ been to London twice.', choices: ['have', 'has', 'had'], correctIndex: 0, explanation: '"I" uses "have" in present perfect.' },
  { id: 66, difficulty: 'medium', topic: 'present_perfect', instruction: 'Choose the correct form.', sentence: 'She ___ finished her homework.', choices: ['have', 'has', 'had'], correctIndex: 1, explanation: 'Third person singular uses "has".' },
  { id: 67, difficulty: 'medium', topic: 'present_perfect', instruction: 'Choose the correct form.', sentence: 'Have you ___ tried sushi?', choices: ['ever', 'never', 'already'], correctIndex: 0, explanation: '"Ever" is used in present perfect questions.' },

  // Relative Pronouns (basic)
  { id: 68, difficulty: 'medium', topic: 'relative_pronouns', instruction: 'Choose the correct relative pronoun.', sentence: 'The man ___ lives next door is a teacher.', choices: ['who', 'which', 'what'], correctIndex: 0, explanation: '"Who" is used for people.' },
  { id: 69, difficulty: 'medium', topic: 'relative_pronouns', instruction: 'Choose the correct relative pronoun.', sentence: 'The book ___ I read was amazing.', choices: ['who', 'which', 'where'], correctIndex: 1, explanation: '"Which" is used for things.' },

  // Connectors
  { id: 70, difficulty: 'medium', topic: 'connectors', instruction: 'Choose the correct connector.', sentence: 'I stayed home ___ it was raining.', choices: ['because', 'although', 'so'], correctIndex: 0, explanation: '"Because" gives a reason.' },
  { id: 71, difficulty: 'medium', topic: 'connectors', instruction: 'Choose the correct connector.', sentence: '___ it was cold, she went for a walk.', choices: ['Because', 'Although', 'So'], correctIndex: 1, explanation: '"Although" shows contrast.' },
  { id: 72, difficulty: 'medium', topic: 'connectors', instruction: 'Choose the correct connector.', sentence: 'It was late, ___ I went to bed.', choices: ['because', 'although', 'so'], correctIndex: 2, explanation: '"So" shows result.' },

  // Used to
  { id: 73, difficulty: 'medium', topic: 'used_to', instruction: 'Choose the correct form.', sentence: 'I ___ play tennis when I was young.', choices: ['use to', 'used to', 'using to'], correctIndex: 1, explanation: '"Used to" describes past habits.' },
  { id: 74, difficulty: 'medium', topic: 'used_to', instruction: 'Choose the correct form.', sentence: 'She didn\'t ___ like vegetables.', choices: ['use to', 'used to', 'using to'], correctIndex: 0, explanation: 'After "didn\'t", use "use to" (base form).' },

  // Gerund/Infinitive (basic)
  { id: 75, difficulty: 'medium', topic: 'gerund_infinitive', instruction: 'Choose the correct form.', sentence: 'I enjoy ___ music.', choices: ['listen', 'listening', 'to listen'], correctIndex: 1, explanation: '"Enjoy" is followed by a gerund.' },
  { id: 76, difficulty: 'medium', topic: 'gerund_infinitive', instruction: 'Choose the correct form.', sentence: 'She wants ___ a doctor.', choices: ['be', 'being', 'to be'], correctIndex: 2, explanation: '"Want" is followed by an infinitive.' },
  { id: 77, difficulty: 'medium', topic: 'gerund_infinitive', instruction: 'Choose the correct form.', sentence: 'He decided ___ abroad.', choices: ['study', 'studying', 'to study'], correctIndex: 2, explanation: '"Decide" is followed by an infinitive.' },

  // Passive Voice (basic)
  { id: 78, difficulty: 'medium', topic: 'passive', instruction: 'Choose the correct passive form.', sentence: 'English ___ in many countries.', choices: ['speaks', 'is spoken', 'speaking'], correctIndex: 1, explanation: 'Passive: is/are + past participle.' },
  { id: 79, difficulty: 'medium', topic: 'passive', instruction: 'Choose the correct passive form.', sentence: 'The cake ___ by my mother.', choices: ['made', 'was made', 'is making'], correctIndex: 1, explanation: 'Past passive: was/were + past participle.' },

  // Tag Questions
  { id: 80, difficulty: 'medium', topic: 'tag_questions', instruction: 'Choose the correct tag.', sentence: 'You are a student, ___?', choices: ["aren't you", "are you", "do you"], correctIndex: 0, explanation: 'Positive statement takes negative tag.' },

  // ── HARD (40) ────────────────────────────────

  // Conditionals
  { id: 81, difficulty: 'hard', topic: 'conditionals', instruction: 'Choose the correct form (First Conditional).', sentence: 'If it rains, I ___ an umbrella.', choices: ['will take', 'would take', 'took'], correctIndex: 0, explanation: 'First conditional: If + present, will + base verb.' },
  { id: 82, difficulty: 'hard', topic: 'conditionals', instruction: 'Choose the correct form (Second Conditional).', sentence: 'If I ___ rich, I would travel the world.', choices: ['am', 'was/were', 'will be'], correctIndex: 1, explanation: 'Second conditional: If + past simple, would + base verb.' },
  { id: 83, difficulty: 'hard', topic: 'conditionals', instruction: 'Choose the correct form (Third Conditional).', sentence: 'If I had studied harder, I ___ the exam.', choices: ['would pass', 'would have passed', 'will pass'], correctIndex: 1, explanation: 'Third conditional: would have + past participle.' },
  { id: 84, difficulty: 'hard', topic: 'conditionals', instruction: 'Choose the correct form.', sentence: 'Unless you hurry, you ___ the bus.', choices: ['miss', 'will miss', 'would miss'], correctIndex: 1, explanation: '"Unless" means "if not" - uses first conditional.' },

  // Reported Speech
  { id: 85, difficulty: 'hard', topic: 'reported_speech', instruction: 'Choose the correct reported form.', sentence: 'She said she ___ tired.', choices: ['is', 'was', 'will be'], correctIndex: 1, explanation: 'Reported speech shifts tense back.' },
  { id: 86, difficulty: 'hard', topic: 'reported_speech', instruction: 'Choose the correct reported form.', sentence: 'He told me he ___ call me later.', choices: ['will', 'would', 'can'], correctIndex: 1, explanation: '"Will" becomes "would" in reported speech.' },
  { id: 87, difficulty: 'hard', topic: 'reported_speech', instruction: 'Choose the correct form.', sentence: 'She asked me where I ___.', choices: ['live', 'lived', 'living'], correctIndex: 1, explanation: 'Reported questions shift tense back.' },
  { id: 88, difficulty: 'hard', topic: 'reported_speech', instruction: 'Choose the correct form.', sentence: 'They said they ___ been to Paris.', choices: ['have', 'had', 'has'], correctIndex: 1, explanation: 'Present perfect becomes past perfect in reported speech.' },

  // Present Perfect vs. Past Simple
  { id: 89, difficulty: 'hard', topic: 'present_perfect_vs_past', instruction: 'Choose the correct tense.', sentence: 'I ___ him yesterday.', choices: ['have seen', 'saw', 'see'], correctIndex: 1, explanation: '"Yesterday" requires past simple.' },
  { id: 90, difficulty: 'hard', topic: 'present_perfect_vs_past', instruction: 'Choose the correct tense.', sentence: 'She ___ here since 2020.', choices: ['lived', 'has lived', 'lives'], correctIndex: 1, explanation: '"Since" requires present perfect.' },
  { id: 91, difficulty: 'hard', topic: 'present_perfect_vs_past', instruction: 'Choose the correct tense.', sentence: 'I ___ three books this month.', choices: ['read', 'have read', 'was reading'], correctIndex: 1, explanation: '"This month" (unfinished time) uses present perfect.' },

  // Past Perfect
  { id: 92, difficulty: 'hard', topic: 'past_perfect', instruction: 'Choose the correct form.', sentence: 'When I arrived, they ___ already left.', choices: ['have', 'had', 'has'], correctIndex: 1, explanation: 'Past perfect for an action before another past action.' },
  { id: 93, difficulty: 'hard', topic: 'past_perfect', instruction: 'Choose the correct form.', sentence: 'She ___ never seen snow before that day.', choices: ['has', 'had', 'have'], correctIndex: 1, explanation: 'Past perfect: had + past participle.' },

  // Modal Perfects
  { id: 94, difficulty: 'hard', topic: 'modal_perfects', instruction: 'Choose the correct form.', sentence: 'You ___ told me earlier!', choices: ['should', 'should have', 'must'], correctIndex: 1, explanation: '"Should have" expresses past regret.' },
  { id: 95, difficulty: 'hard', topic: 'modal_perfects', instruction: 'Choose the correct form.', sentence: 'She ___ been at home. Her car is in the garage.', choices: ['must have', 'can have', 'should have'], correctIndex: 0, explanation: '"Must have" for strong past deductions.' },
  { id: 96, difficulty: 'hard', topic: 'modal_perfects', instruction: 'Choose the correct form.', sentence: 'He ___ forgotten about the meeting.', choices: ['might have', 'will have', 'can have'], correctIndex: 0, explanation: '"Might have" for past possibility.' },

  // Passive (advanced)
  { id: 97, difficulty: 'hard', topic: 'passive_advanced', instruction: 'Choose the correct passive form.', sentence: 'The letter ___ by the time I arrived.', choices: ['has been sent', 'had been sent', 'was sent'], correctIndex: 1, explanation: 'Past perfect passive: had been + past participle.' },
  { id: 98, difficulty: 'hard', topic: 'passive_advanced', instruction: 'Choose the correct form.', sentence: 'The building is ___ renovated right now.', choices: ['been', 'being', 'be'], correctIndex: 1, explanation: 'Present continuous passive: is being + past participle.' },

  // Relative Clauses (advanced)
  { id: 99, difficulty: 'hard', topic: 'relative_clauses', instruction: 'Choose the correct relative pronoun.', sentence: 'The city ___ we visited last summer was beautiful.', choices: ['which', 'where', 'what'], correctIndex: 0, explanation: '"Which" as object of the relative clause.' },
  { id: 100, difficulty: 'hard', topic: 'relative_clauses', instruction: 'Choose the correct relative.', sentence: 'She is the doctor ___ daughter won the prize.', choices: ['who', 'whose', 'whom'], correctIndex: 1, explanation: '"Whose" shows possession.' },
  { id: 101, difficulty: 'hard', topic: 'relative_clauses', instruction: 'Choose the correct relative pronoun.', sentence: 'The reason ___ he left is unknown.', choices: ['which', 'why', 'that'], correctIndex: 1, explanation: '"Why" is used after "reason".' },

  // Wish / If only
  { id: 102, difficulty: 'hard', topic: 'wish', instruction: 'Choose the correct form.', sentence: 'I wish I ___ more time.', choices: ['have', 'had', 'would have'], correctIndex: 1, explanation: '"Wish + past simple" for present unreal situations.' },
  { id: 103, difficulty: 'hard', topic: 'wish', instruction: 'Choose the correct form.', sentence: 'I wish I ___ studied harder for the exam.', choices: ['have', 'had', 'would'], correctIndex: 1, explanation: '"Wish + past perfect" for past regrets.' },

  // Gerund/Infinitive (advanced)
  { id: 104, difficulty: 'hard', topic: 'gerund_infinitive_adv', instruction: 'Choose the correct form.', sentence: 'I remember ___ the door. (I did it.)', choices: ['locking', 'to lock', 'lock'], correctIndex: 0, explanation: '"Remember + gerund" = remembering a past action.' },
  { id: 105, difficulty: 'hard', topic: 'gerund_infinitive_adv', instruction: 'Choose the correct form.', sentence: 'I stopped ___ a coffee on the way.', choices: ['buy', 'buying', 'to buy'], correctIndex: 2, explanation: '"Stop + to infinitive" = stop in order to do something.' },
  { id: 106, difficulty: 'hard', topic: 'gerund_infinitive_adv', instruction: 'Choose the correct form.', sentence: 'She avoids ___ in public.', choices: ['speak', 'speaking', 'to speak'], correctIndex: 1, explanation: '"Avoid" is always followed by a gerund.' },

  // Causative
  { id: 107, difficulty: 'hard', topic: 'causative', instruction: 'Choose the correct form.', sentence: 'I had my hair ___ yesterday.', choices: ['cut', 'cutting', 'to cut'], correctIndex: 0, explanation: 'Causative: have + object + past participle.' },
  { id: 108, difficulty: 'hard', topic: 'causative', instruction: 'Choose the correct form.', sentence: 'She got her car ___ at the garage.', choices: ['repair', 'repaired', 'repairing'], correctIndex: 1, explanation: 'Causative: get + object + past participle.' },

  // Inversion
  { id: 109, difficulty: 'hard', topic: 'inversion', instruction: 'Choose the correct form.', sentence: 'Not only ___ he pass, but he got the highest score.', choices: ['did', 'does', 'has'], correctIndex: 0, explanation: '"Not only" triggers subject-auxiliary inversion.' },
  { id: 110, difficulty: 'hard', topic: 'inversion', instruction: 'Choose the correct form.', sentence: 'Rarely ___ I seen such beauty.', choices: ['have', 'had', 'do'], correctIndex: 0, explanation: 'Negative adverbs trigger inversion.' },

  // Phrasal Verbs
  { id: 111, difficulty: 'hard', topic: 'phrasal_verbs', instruction: 'Choose the correct phrasal verb.', sentence: 'I need to ___ this problem before Monday.', choices: ['figure out', 'figure up', 'figure in'], correctIndex: 0, explanation: '"Figure out" means to solve or understand.' },
  { id: 112, difficulty: 'hard', topic: 'phrasal_verbs', instruction: 'Choose the correct phrasal verb.', sentence: 'The meeting was ___ until next week.', choices: ['put off', 'put on', 'put up'], correctIndex: 0, explanation: '"Put off" means to postpone.' },
  { id: 113, difficulty: 'hard', topic: 'phrasal_verbs', instruction: 'Choose the correct phrasal verb.', sentence: 'She ___ with a great idea.', choices: ['came up', 'came down', 'came off'], correctIndex: 0, explanation: '"Came up with" means to think of.' },

  // Subjunctive
  { id: 114, difficulty: 'hard', topic: 'subjunctive', instruction: 'Choose the correct form.', sentence: 'The teacher insisted that he ___ the work himself.', choices: ['does', 'do', 'did'], correctIndex: 1, explanation: 'Subjunctive uses base verb after "insist that".' },
  { id: 115, difficulty: 'hard', topic: 'subjunctive', instruction: 'Choose the correct form.', sentence: 'It is important that she ___ on time.', choices: ['is', 'be', 'was'], correctIndex: 1, explanation: 'Subjunctive "be" after "it is important that".' },

  // Mixed Tenses
  { id: 116, difficulty: 'hard', topic: 'mixed_tenses', instruction: 'Choose the correct tense.', sentence: 'By this time next year, I ___ my degree.', choices: ['will finish', 'will have finished', 'finish'], correctIndex: 1, explanation: 'Future perfect for completion before a future point.' },
  { id: 117, difficulty: 'hard', topic: 'mixed_tenses', instruction: 'Choose the correct tense.', sentence: 'She ___ for two hours when you called.', choices: ['was studying', 'had been studying', 'studied'], correctIndex: 1, explanation: 'Past perfect continuous for duration before past event.' },
  { id: 118, difficulty: 'hard', topic: 'mixed_tenses', instruction: 'Choose the correct form.', sentence: 'By 2025, they ___ here for ten years.', choices: ['will live', 'will have lived', 'are living'], correctIndex: 1, explanation: 'Future perfect for duration up to a future point.' },

  // Cleft Sentences
  { id: 119, difficulty: 'hard', topic: 'cleft', instruction: 'Choose the correct form.', sentence: 'It ___ John who broke the window.', choices: ['is', 'was', 'were'], correctIndex: 1, explanation: 'Cleft sentence with past reference uses "was".' },
  { id: 120, difficulty: 'hard', topic: 'cleft', instruction: 'Choose the correct form.', sentence: 'What I need ___ more practice.', choices: ['is', 'are', 'were'], correctIndex: 0, explanation: '"What" clause takes singular verb.' },
]
