const fs = require('fs');
const path = require('path');
const bankPath = path.join(__dirname, 'data', 'question-bank.json');
const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));

function detectTopic(q) {
  const t = q.toLowerCase();
  if (/antonym/.test(t)) return 'Antonyms';
  if (/synonym/.test(t)) return 'Synonyms';
  if (/active\s*(form|voice)|passive\s*(form|voice)|in\s*passive|in\s*active/.test(t)) return 'Active Passive';
  if (/narration|direct\s*(form|speech)|indirect\s*(form|speech)|in\s*direct\s*speech|in\s*indirect/.test(t)) return 'Direct Indirect Speech';
  if (/grammatical error|contains.*error|segment.*error|which contains/.test(t)) return 'Error Detection';
  if (/improve|improvement/.test(t)) return 'Sentence Improvement';
  if (/idiom/.test(t)) return 'Idioms and Phrases';
  if (/one word/.test(t)) return 'One Word Substitution';
  if (/means the same as the group of words/.test(t)) return 'One Word Substitution';
  if (/misspelt|spelt/.test(t)) return 'Spelling';
  if (/jumbled/.test(t)) return 'Sentence Rearrangement';
  if (/fill in the blank/.test(t)) return 'Fill in the Blanks';
  if (/fill in blank/.test(t)) return 'Fill in the Blanks';
  if (/passage|the author|according to the/.test(t)) return 'Reading Comprehension';
  return null; // will be manually set
}

// Each question: [answerIndex, questionText, [opts], topicOverride?, setId?]
// If topicOverride is null, auto-detect from question text

// ============ PAPER 1: SSC CGL Tier-2 08-Aug-2022 English ============
const paper2022 = { name: "SSC CGL Tier-2 08-Aug-2022 English", year: 2022, questions: [
  // Volcano passage set (Q1-9)
  [1,"Select the correct antonym of the word. TRANQUILLITY",["wilderness","agitation","composure","repose"],"Antonyms","cgl2022eng_volcano"],
  [0,"Why is the bottom of the volcano called 'nature's art studio'?",["the walls are covered with patterns in bright hues","the rocks sparkle with a divine light","it looks like a cathedral","the entrance is vast and ethereal"],"Reading Comprehension","cgl2022eng_volcano"],
  [1,"Select the correct synonym of the word EXTORTIONATE",["exorcist","exorbitant","exotic","exonerate"],"Synonyms","cgl2022eng_volcano"],
  [1,"The tone of the passage is:",["formal","laudatory","apathetic","satirical"],"Reading Comprehension","cgl2022eng_volcano"],
  [3,"The volcano is referred to as the 'sleeping giant' in the passage because",["it is very deep","it is an active volcano","it is very destructive","it is a dormant volcano"],"Reading Comprehension","cgl2022eng_volcano"],
  [2,"The given passage is a ______ passage.",["narrative","literary","descriptive","didactic"],"Reading Comprehension","cgl2022eng_volcano"],
  [1,"What feelings do visitors have when they visit the volcano?",["fear","reverence","indifference","anger"],"Reading Comprehension","cgl2022eng_volcano"],
  [3,"Who came up with the idea of making the volcano accessible to tourists?",["Thrihnukagigur","Trip Advisor","Reykjavik","Ami B. Stefansson"],"Reading Comprehension","cgl2022eng_volcano"],
  [0,"How do tourists reach the base of the crater?",["They descend in a basket","They go across lava fields","They go through the tectonic plates","They walk down"],"Reading Comprehension","cgl2022eng_volcano"],

  // Fill-in-blanks passage set 1 (Q10-19) - stomach/doctor passage
  [2,"Select the most appropriate option to fill in the blank No. 1.",["discovering","to be discovered","discovered","discover"],"Fill in the Blanks","cgl2022eng_fill1"],
  [1,"Select the most appropriate option to fill in the blank No. 2.",["Poorly","Badly","Nicely","Extremely"],"Fill in the Blanks","cgl2022eng_fill1"],
  [2,"Select the most appropriate option to fill in the blank No. 3.",["Devastated","Decayed","Damaged","Decreased"],"Fill in the Blanks","cgl2022eng_fill1"],
  [0,"Select the most appropriate option to fill in the blank No. 4.",["His","Her","Its","Him"],"Fill in the Blanks","cgl2022eng_fill1"],
  [2,"Select the most appropriate option to fill in the blank No. 5.",["Registrar","Major","Doctor","Colonel"],"Fill in the Blanks","cgl2022eng_fill1"],
  [0,"Select the most appropriate option to fill in the blank No. 6.",["Could","Had","Would","Should"],"Fill in the Blanks","cgl2022eng_fill1"],
  [0,"Select the most appropriate option to fill in the blank No. 7.",["Great","Strong","Fast","Countless"],"Fill in the Blanks","cgl2022eng_fill1"],
  [1,"Select the most appropriate option to fill in the blank No. 8.",["Between","Through","Along","Across"],"Fill in the Blanks","cgl2022eng_fill1"],
  [2,"Select the most appropriate option to fill in the blank No. 9.",["Acquired","Imagined","Found","Obtained"],"Fill in the Blanks","cgl2022eng_fill1"],
  [0,"Select the most appropriate option to fill in the blank No. 10.",["Which","What","Who","Whom"],"Fill in the Blanks","cgl2022eng_fill1"],

  // Refugees passage set (Q20-23)
  [0,"Why do Syrian refugees prefer to take shelter in Turkey? Select the main reason.",["Turkey is the nearest hospitable country to Syria.","Turkey is a hospitable country.","Turkey provides the refugees with all amenities.","Turkey is a beautiful country."],"Reading Comprehension","cgl2022eng_refugees"],
  [3,"The passage is mainly about",["internally displaced people","people devastated by conflicts and civil war","refugees in host countries","displaced persons around the world"],"Reading Comprehension","cgl2022eng_refugees"],
  [1,"'Humanitarian disasters' refer to all those given below except",["civil war","earthquakes and floods","violence and persecution","armed conflicts"],"Reading Comprehension","cgl2022eng_refugees"],
  [2,"The greatest number of people who have been displaced internally in their home country are in",["Afghanistan","Turkey","Ethiopia","Syria"],"Reading Comprehension","cgl2022eng_refugees"],

  // Fill-in-blanks passage set 2 (Q24-33) - greenhouse/world matters
  [1,"Select the most appropriate option to fill in blank No.1",["usually","nearly","fairly","quite"],"Fill in the Blanks","cgl2022eng_fill2"],
  [0,"Select the most appropriate option to fill in blank No.2",["event","process","matter","act"],"Fill in the Blanks","cgl2022eng_fill2"],
  [2,"Select the most appropriate option to fill in blank No.3",["episodes","incidents","contests","functions"],"Fill in the Blanks","cgl2022eng_fill2"],
  [0,"Select the most appropriate option to fill in blank No.4",["largest","heaviest","smallest","tallest"],"Fill in the Blanks","cgl2022eng_fill2"],
  [3,"Select the most appropriate option to fill in blank No.5",["alike","mutual","common","similar"],"Fill in the Blanks","cgl2022eng_fill2"],
  [0,"Select the most appropriate option to fill in blank No.6",["produces","provides","presents","prepares"],"Fill in the Blanks","cgl2022eng_fill2"],
  [0,"Select the most appropriate option to fill in blank No.7",["incidence","deliverance","frequency","urgency"],"Fill in the Blanks","cgl2022eng_fill2"],
  [3,"Select the most appropriate option to fill in blank No.8",["indicated","distributed","dedicated","attributed"],"Fill in the Blanks","cgl2022eng_fill2"],
  [2,"Select the most appropriate option to fill in blank No.9",["suspected","projected","disputed","accepted"],"Fill in the Blanks","cgl2022eng_fill2"],
  [3,"Select the most appropriate option to fill in blank No.10",["routine","pompous","dubious","precious"],"Fill in the Blanks","cgl2022eng_fill2"],

  // World population passage set (Q34-37)
  [2,"Which statement is NOT correct according to the passage?",["World population is estimated to reach 10.4 billion in 2100.","Since 1950, world population was growing at its slowest speed.","The countries of Asia will contribute more than half of the increase anticipated through 2050.","The population of 61 countries will decrease by 1% or more between 2022 and 2050."],"Reading Comprehension","cgl2022eng_population"],
  [0,"The passage presents the findings of a United Nations report which is mainly regarding",["the world population","the population in India","the population in African countries","the population in China"],"Reading Comprehension","cgl2022eng_population"],
  [0,"What will be the consequence of high fertility?",["low economic growth","high economic growth","high mortality","low mortality"],"Reading Comprehension","cgl2022eng_population"],
  [1,"After reading the above passage it can be inferred that it is",["a magazine article","a news item","a research report","a survey report"],"Reading Comprehension","cgl2022eng_population"],

  // Savanna passage set (Q38-46)
  [0,"What is the main feature of Savanna landscape?",["tall grass and short trees","dense forests with tall trees","dry grass and low bushes","tall trees and short grass"],"Reading Comprehension","cgl2022eng_savanna"],
  [3,"The main theme of the passage is",["Grasses of the grassland Savanna","Wealth of animal life in Africa","Life in Savanna grassland","Vegetation and animal life in Savanna"],"Reading Comprehension","cgl2022eng_savanna"],
  [0,"Select the most appropriate meaning of the underlined word as it is used in the text. Palms which cannot withstand the drought are confined to the wettest areas or along rivers.",["Endure","Undergo","Suffer","Convert"],"Reading Comprehension","cgl2022eng_savanna"],
  [3,"What helps an elephant fight its enemies?",["its neck and tail","its legs and ears","its size and strength","its tusks and trunk"],"Reading Comprehension","cgl2022eng_savanna"],
  [0,"Which species of vegetation is NOT found in Australian Savanna?",["elephant grass","spinifex grass","mallee","mulga"],"Reading Comprehension","cgl2022eng_savanna"],
  [3,"Which of the following trees has water storing capacity in its broad trunk?",["Acacia","Gum arable","Palm","Baobab"],"Reading Comprehension","cgl2022eng_savanna"],
  [3,"Match the words with their meanings. Words- a. luxuriant, b. dormant, c. prolonged. Meanings- 1. continued, 2. lush, 3. sleeping",["a-1, b-3, c-2","a-3, b-2, c-1","a-2, b-1, c-3","a-2, b-3, c-1"],"Reading Comprehension","cgl2022eng_savanna"],
  [3,"Select the carnivorous animal from the following.",["okapi","gazelle","zebra","lynx"],"Reading Comprehension","cgl2022eng_savanna"],
  [0,"Why is Savanna in Africa called the 'Big Game Country'?",["Thousands of animals are hunted here.","Animal movies are particularly shot here.","It is home to many wild animals.","There are both carnivores and herbivores."],"Reading Comprehension","cgl2022eng_savanna"],

  // Standalone Q47-Q160
  [2,"Select the option that will improve the underlined part of the sentence. Keep the dog tied indoors; however, it may bite some stranger.",["still","yet","else","No improvement"],null],
  [0,"Identify the segment in the sentence which contains a grammatical error. These experiments had been going on since several months.",["since several months.","had been going on","No error","These experiments"],null],
  [3,"Select the most appropriate option to improve the underlined segment. Saroj has been suffering with osteoporosis from when she was fifty years old.",["from osteoporosis from when","with osteoporosis since","no improvement required","from osteoporosis since"],null],
  [3,"Select the misspelt word.",["nobility","inquiry","incite","enimity"],"Spelling"],
  [3,"Select the most appropriate active form of the given sentence. A bed time story was made for me every night by him.",["I made a bed time story for him every night.","He has made a bed time story for me every night.","He has been making a bed time story for me every night.","He made a bed time story for me every night."],"Active Passive"],
  [3,"Select the most appropriate indirect form of the given sentence. Jayesh said to Diwakar, 'You can top the class if you want to.'",["Jayesh told Diwakar that he would top the class if he wants to.","Jayesh told Diwakar that you could top the class if you wanted to.","Jayesh told Diwakar that you can top the class if you want to.","Jayesh told Diwakar that he could top the class if he wanted to."],"Direct Indirect Speech"],
  [1,"Select the word which means the same as the group of words given. a book or set of books giving information on many subjects or on many aspects of one subject and typically arranged alphabetically.",["Thesaurus","Encyclopedia","Glossary","Dictionary"],"One Word Substitution"],
  [1,"Select the most appropriate one word to substitute the given group of words. one who is all powerful",["emperor","omnipotent","sovereign","conqueror"],"One Word Substitution"],
  [3,"Select the option that expresses the given sentence in direct speech. I told you that I had bought a new book for you the day before.",["I told to you, 'I have bought a new book for you yesterday.'","I said to you, 'You have bought a new book for me the day before.'","I said to you, 'I have bought a new book for you the day before.'","I said to you, 'I bought a new book for you yesterday.'"],"Direct Indirect Speech"],
  [3,"Select the option that expresses the given sentence in passive voice. Nobody has brought this fact to my notice.",["This fact is not being brought to my notice by nobody.","This fact had not been brought to my notice by anybody.","This fact was not brought to my notice by anybody.","This fact has not been brought to my notice by anybody."],"Active Passive"],
  [1,"Select the option that expresses the given sentence in indirect speech. He said, 'Oh, how I would have loved to visit Kashmir this year.'",["He exclaimed how I would have loved to visit Kashmir this year.","He exclaimed that he would have really loved to visit Kashmir that year.","He said that he will have loved to visit Kashmir this year.","He exclaimed that how he would have loved to visit Kashmir that year."],"Direct Indirect Speech"],
  [0,"Given below are four sentences in jumbled order. Pick the option that gives their correct order.",["BDCA","CBAD","CDAB","BCAD"],"Sentence Rearrangement"],
  [0,"Select the most appropriate active form of the given sentence. Those who help themselves are helped by God.",["God helps those who help themselves.","If you help yourself, God will help you.","Help yourself and God will help you.","God is helping those who are helping others."],"Active Passive"],
  [3,"Identify the segment in the sentence which contains a grammatical error. It turned out to be the noisy park party anybody had ever attended.",["It turned out to be","anybody had ever attended.","No error","the noisy park party"],"Error Detection"],
  [0,"Identify the segment that contains a grammatical error. If I was you, I would not lose temper in this situation.",["If I was you","I would not","lose temper","in this situation"],"Error Detection"],
  [0,"Select the most appropriate meaning of the given idiom. lend an ear",["pay attention to","not tell something to others","not make trouble","be good for a particular thing"],"Idioms and Phrases"],
  [3,"Identify the segment that contains a grammatical error. Contented people seldom complaint against their fate.",["against","their fate","Contented people","seldom complaint"],"Error Detection"],
  [3,"Identify the segment that contains a grammatical error. The most talented of these three boys are my friend's son.",["No error","The most talented","of these three boys","are my friend's son"],"Error Detection"],
  [2,"Select the most appropriate meaning of the given idiom. bad blood",["hard luck","poor quality","ill feeling","low status"],"Idioms and Phrases"],
  [1,"Select the most appropriate one word to substitute the given group of words. one who speaks for others",["orator","spokesperson","verbose","talkative"],"One Word Substitution"],
  [1,"Identify the segment in the sentence which contains a grammatical error. The gentleman had a suitcase full with wigs, ornaments and dresses.",["The gentleman had","a suitcase full with","No error","wigs, ornaments and dresses."],"Error Detection"],
  [3,"Select the option that will improve the underlined part of the sentence. The scientists are busy to explore new ideas.",["for exploring","No Improvement","to be exploring","exploring"],null],
  [2,"Select the most appropriate meaning of the given idiom. all in all",["every person","first in line","having all authority","completely lost"],"Idioms and Phrases"],
  [1,"Select the option that will improve the underlined part of the sentence. Keep him at arm's length lest you may not repent in the long run.",["unless you may","lest you should","or you may not","No Improvement"],null],
  [3,"Select the most appropriate passive form of the given sentence. Granny had given Uncle Ken a good lecture on how to be a responsible adult.",["Granny was given a good lecture by Uncle Ken on how to be a responsible adult.","Uncle Ken was being given a good lecture by Granny on how to be a responsible adult.","Uncle Ken was giving a good lecture to Granny on how to be a responsible adult.","Uncle Ken had been given a good lecture by Granny on how to be a responsible adult."],"Active Passive"],
  [0,"Given below are four jumbled sentences. Select the option that gives their correct order forming a meaningful and coherent paragraph.",["CDAB","CBDA","ADBC","DACB"],"Sentence Rearrangement"],
  [3,"Select the most appropriate indirect form of the given sentence. I said to you, 'You should believe her'.",["I asked you if you should believe her.","I asked whether she should believe you.","I told you that I should believe her.","I told you that you should believe her."],"Direct Indirect Speech"],
  [3,"You can have a comfortable journey only then you are getting your seats reserved in advance.",["only then you get","no improvement required","only when you are getting","only if you get"],null],
  [0,"None of the girl deserve to be selected for this award.",["None of the girls deserves","no improvement required","None of the girl deserves","None of the girls are deserving"],null],
  [1,"Select the option that expresses the given sentence in indirect speech. My friend said, 'Hello! What are you doing here?'",["My friend said hello to me and asked what were you doing here.","My friend greeted me and asked me what I was doing there.","My friend said hello and asked me what was I doing there.","My friend wished me and asked me what was I doing here."],"Direct Indirect Speech"],
  [1,"Select the most appropriate meaning of the given idiom. fight shy of",["to invite","to avoid","to perform","to challenge"],"Idioms and Phrases"],
  [1,"Select the option that expresses the given sentence in indirect speech. She said to herself, 'Shall I have a happy married life?'",["She wondered if she shall have a happy married life.","She wondered if she would have a happy married life.","She asked that if she should have a happy married life.","She thought that she should have a happy married life."],"Direct Indirect Speech"],
  [2,"Select the most appropriate direct form of the given sentence. I asked the carpenter how long he would take to polish my furniture.",["I said to carpenter, 'How long he would take to polish his furniture?'","I said to carpenter, 'How long you would take to polish my furniture?'","I said to carpenter, 'How long will you take to polish my furniture?'","I said to carpenter, 'How long he would take to polish my furniture?'"],"Direct Indirect Speech"],
  [0,"Select the most appropriate direct form. Taru asked Kavya if she would help her in setting up her new dressing table.",["Taru said to Kavya, 'Will you help me in setting up my new dressing table?'","Taru said to Kavya, 'Would you help her in setting up my new dressing table?'","Taru said to Kavya, 'Will you help me in setting up her new dressing table?'","Taru said to Kavya, 'How would you help me in setting up my new dressing table?'"],"Direct Indirect Speech"],
  [1,"Select the most appropriate synonym of the given word. fictitious",["genuine","imaginary","factual","confirmed"],"Synonyms"],
  [0,"Identify the segment which contains a grammatical error. Every Saturday, your mother prepares a pudding, isn't she?",["isn't she","Every Saturday, your mother","prepares a pudding","No error"],"Error Detection"],
  [1,"Select the option that expresses the given sentence in direct speech. The teacher asked me why I had reached the examination hall so late.",["The teacher said to me, 'Why are you reaching the examination hall so late?'","The teacher said to me, 'Why did you reach the examination hall so late?'","The teacher said to me, 'Why had I reached the examination hall so late?'","The teacher said to me, 'Why you reached the examination hall so late?'"],"Direct Indirect Speech"],
  [1,"Select the option that expresses the given sentence in passive voice. He likes people to flatter him.",["He likes people to be flattered by him.","He likes to be flattered by people.","He liked to be flattered by people.","He likes to have been flattered by people."],"Active Passive"],
  [2,"Select the most appropriate indirect form. 'Remove all the stains carefully and clean the windows,' said the contractor to the worker.",["The contractor requested the worker to remove all the stains carefully and clean the windows.","The contractor said to the worker that you should remove all the stains carefully and clean the windows.","The contractor instructed the worker to remove all the stains carefully and clean the windows.","The contractor told the worker that by removing all the stains carefully, the windows will be cleaned."],"Direct Indirect Speech"],
  [2,"Select the wrongly spelt word.",["Passage","Premium","Parallel","Penalty"],"Spelling"],
  [1,"Select the most appropriate meaning of the given idiom. clam up",["to be frustrated","to become silent","to be upset","to lose temper"],"Idioms and Phrases"],
  [0,"Select the most appropriate antonym of the given word. CONGENIAL",["Mean","mild","Mellow","Merciful"],"Antonyms"],
  [0,"Select the option that will improve the underlined part. I take pride to serve my country.",["in serving","No Improvement","to have served","to be serving"],null],
  [0,"Select the word which means the same as the group of words given. an animal or person that eats a variety of food of both plant and animal origin.",["Omnivore","Cannibal","Herbivore","Carnivore"],"One Word Substitution"],
  [0,"Select the most appropriate active form. Not much damage to the life and property was caused by the cyclone in July this year at the Andhra coast.",["The cyclone did not cause much damage to the life and property in July this year at the Andhra coast.","The cyclone could not cause much damage to the life and property in July this year.","The cyclone has not caused much damage to the life and property in July this year at the Andhra coast.","The Andhra coast did not cause much damage to the life and property in July this year."],"Active Passive"],
  [0,"Select the most appropriate indirect form. Rahul said to Mohit, 'I am taking my family to Kashmir for a vacation tomorrow.'",["Rahul told Mohit that he was taking his family to Kashmir for a vacation the following day.","Rahul told Mohit that he is taking his family to Kashmir for a vacation tomorrow.","Rahul told Mohit that I am taking my family to Kashmir for a vacation tomorrow.","Rahul told Mohit that I was taking my family to Kashmir for a vacation the following day."],"Direct Indirect Speech"],
  [1,"Select the option that will improve the underlined part. I reached at London only this morning.",["reach","reached","am reaching","No Improvement"],null],
  [1,"Select the word which means the same as the group of words given. a doctor who specializes in heart diseases",["Urologist","Cardiologist","Dermatologist","Nephrologist"],"One Word Substitution"],
  [2,"Identify the segment which contains a grammatical error. This story is quite interesting, but I have read much interesting stories than this.",["No error","This story is quite interesting","much interesting stories than this.","but I have read"],"Error Detection"],
  [2,"Select the most appropriate meaning of the given idiom. cut a sorry figure",["make a sculpture","render an apology","create a poor impression","break a record"],"Idioms and Phrases"],
  [2,"Fill in the blank with the most appropriate word. The boy ______ to take the money.",["reminded","denied","refused","ordered"],"Fill in the Blanks"],
  [3,"Select the most appropriate meaning of the given idiom. forty winks",["a brief statement","a hot day","a worthless object","a short nap"],"Idioms and Phrases"],
  [0,"Select the most appropriate active form. Rani's car is twelve years old but it has not been used much.",["Rani's car is twelve years old but she hasn't used it much.","Rani's car is twelve years old but it hasn't used her much.","Rani's car is twelve years old but she isn't using it much.","Rani's car is twelve years old but she didn't use it much."],"Active Passive"],
  [3,"Select the most appropriate option to improve the underlined segment. Learning a poem by heart is meaningless if you do not understand it.",["Learning a poem in heart","To learning a poem at heart","Learn a poem by heart","no improvement required"],null],
  [0,"Select the option that will improve the underlined part. He is interested neither in business or on the job.",["nor in a","not on a","No Improvement","nor to the"],null],
  [3,"Select the most appropriate direct form. The policeman told the boys that they could not park their car there.",["The policeman said to the boys, 'You could not park their car there.'","The policeman said to the boys, 'How could you park your car here?'","The policeman told to the boys, 'They could not park their car there.'","The policeman said to the boys, 'You cannot park your car here.'"],"Direct Indirect Speech"],
  [0,"Select the option that expresses the given sentence in passive voice. Who could have made such a silly mistake?",["By whom could such a silly mistake have been made?","By whom can such a silly mistake be made?","By whom can such a silly mistake have been made?","By whom could such a silly mistake be made?"],"Active Passive"],
  [3,"Select the most appropriate indirect form. 'Don't be late tomorrow morning,' my mother said to me.",["My mother told me don't be late tomorrow morning.","My mother asks me not to be late tomorrow morning.","My mother warned me not to be late tomorrow morning.","My mother warned me not to be late the next day morning."],"Direct Indirect Speech"],
  [3,"Select the option that will improve the underlined part. Many battles was fought on the soil of India.",["Much battle was","Many battle were","No Improvement","Many a battle was"],null],
  [0,"Select the option that expresses the given sentence in active voice. I am not interested in this assignment.",["This assignment does not interest me.","This assignment did not interest me.","This assignment is not interesting me.","This assignment has not interested me."],"Active Passive"],
  [3,"Select the most appropriate passive form. The flood victims of Assam have to make highway their home every year.",["Highway is being made their home every year by the flood victims of Assam.","Highway has made the flood victims of Assam their home every year.","Highway has been made their home every year by the flood victims of Assam.","Highway has to be made their home every year by the flood victims of Assam."],"Active Passive"],
  [2,"Select the option that expresses the given sentence in indirect speech. She said to me, 'Don't worry about me.'",["She told me don't worry about her.","She told me to not to worry about me.","She told me not to worry about her.","She told me to not be worried about her."],"Direct Indirect Speech"],
  [1,"Select the most appropriate passive form. Please do not pluck any flowers from the temple compound.",["How can any flowers be plucked from the temple compound?","You are requested not to pluck any flowers from the temple compound.","Let any flowers not to be plucked from the temple compound.","No flowers can be plucked from the temple compound."],"Active Passive"],
  [0,"Identify the segment that contains a grammatical error. The people living in coastal areas were evacuated by time.",["by time","were evacuated","living in coastal areas","The people"],"Error Detection"],
  [2,"Select the option that expresses the given sentence in direct speech. You told me that you had not slept the previous night and could not work then.",["You said to me, 'I have not slept the previous night and cannot work then.'","You said to me, 'You did not sleep the previous night and could not work now.'","You said to me, 'I did not sleep last night and cannot work now.'","You said to me, 'I have not slept last night and could not work then.'"],"Direct Indirect Speech"],
  [3,"Identify the segment which contains a grammatical error. If you are going downhill you can go much fast.",["No error","you can go","If you are going downhill","much fast."],"Error Detection"],
  [0,"Select the most appropriate option to improve the underlined segment. The first step in making a kite is to fasten two sticks of bamboo together in the form of a cross.",["no improvement required","in making a kite is to fastening","in making a kite is to be fastened","into making a kite is fasten"],null],
  [2,"Select the most appropriate direct form. The driver asked a passerby if he could tell him the way to the market.",["The driver said to a passerby, 'Please, will you tell me the way to the market?'","The driver said to a passerby, 'Tell me the way to the market, will you'","The driver said to a passerby, 'Can you tell me the way to the market?'","The driver said to a passerby, 'Could he tell him the way to the market?'"],"Direct Indirect Speech"],
  [2,"Select the option that will improve the underlined part. I will have travelled all over Europe last year.",["No Improvement","have travelled","travelled","were travelling"],null],
  [3,"Select the most appropriate meaning of the given idiom. bury the hatchet",["hide a treasure","sow the seeds","dig a grave","forget past quarrels"],"Idioms and Phrases"],
  [0,"Select the option that will improve the underlined part. The little boy did many mischiefs in school.",["made much mischief","performed many mischiefs","No Improvement","did much mischiefs"],null],
  [3,"Select the most appropriate one word to substitute the given group of words. a case for keeping a sword",["wrapper","sleeve","quiver","sheath"],"One Word Substitution"],
  [3,"Select the option that expresses the given sentence in indirect speech. She said, 'Ruhi slipped when she was trying to board the bus.'",["She says that Ruhi slipped when she was trying to board the bus.","She said that Ruhi has slipped when she was trying to board the bus.","She said that Ruhi slipped when she was trying to board the bus.","She said that Ruhi had slipped when she was trying to board the bus."],"Direct Indirect Speech"],
  [2,"Select the most appropriate antonym of the given word. indolent",["languid","listless","energetic","torpid"],"Antonyms"],
  [2,"Select the most appropriate active form. How many members were informed about the meeting in time?",["How many members could you inform about the meeting in time?","How many meetings did you inform about the members in time?","How many members did you inform about the meeting in time?","How many members have you informed about the meeting in time?"],"Active Passive"],
  [0,"Select the most appropriate option to improve the underlined segment. Turn left outside the library door and walk down the corridor then you came to the main staircase.",["until you come to","no improvement required","until you will come at","when you are come to"],null],
  [3,"Identify the segment which contains a grammatical error. You should tell these children to complete their projects himself.",["No error","these children to complete","You should tell","their projects himself."],"Error Detection"],
  [1,"Identify the segment that contains a grammatical error. As soon the gun shot was heard, people ran out in panic.",["in panic","As soon the","gun shot was heard","people ran out"],"Error Detection"],
  [0,"Select the most appropriate one word to substitute the given group of words. one who lives on others",["parasite","shrewd","flatterer","hypocrite"],"One Word Substitution"],
  [2,"Identify the segment which contains a grammatical error. During the seventeenth century there were great developments at the sphere of knowledge.",["During the seventeenth century","No error","at the sphere of knowledge.","there were great developments"],"Error Detection"],
  [3,"Select the word which means the same as the group of words given. one who talks to oneself",["Colloquist","Somniloquist","Ventriloquist","Soliloquist"],"One Word Substitution"],
  [2,"Select the option that expresses the given sentence in active voice. Has Rahul been declared fit to play the next match?",["Are they declaring Rahul fit to play the next match?","Has Rahul declared the next match fit to play?","Have they declared Rahul fit to play the next match?","Did they declare Rahul fit to play the next match?"],"Active Passive"],
  [2,"Select the option that expresses the given sentence in indirect speech. I said to you, 'He cannot be trusted completely.'",["You told me that he could not be trusted completely.","I said you that he cannot be trusted completely.","I told you that he could not be trusted completely.","You told me that he cannot be trusted completely."],"Direct Indirect Speech"],
  [3,"Select the option that expresses the given sentence in direct speech. Your sister will say that she has lost her pen again.",["Your sister says, 'I lost her pen again.'","Your sister will say, 'I lost my pen again.'","Your sister said, 'She has lost my pen again.'","Your sister will say, 'I have lost my pen again.'"],"Direct Indirect Speech"],
  [2,"Select the option that expresses the given sentence in direct speech. The judge asked the prisoner if he had anything to say for himself.",["The judge said to the prisoner, 'If you have anything to say for yourself?'","The judge said to the prisoner, 'Did he had anything to say for himself?'","The judge said to the prisoner, 'Do you have anything to say for yourself?'","The judge said to the prisoner, 'Does he have anything to say for himself?'"],"Direct Indirect Speech"],
  [1,"Select the option that expresses the given sentence in indirect speech. 'What a hopeless fellow you are!' said the teacher to the student.",["The teacher told the student that you are a very hopeless fellow.","The teacher told the student that he was a very hopeless fellow.","The teacher told the student what are a hopeless fellow he was.","The teacher said the student was what a hopeless fellow."],"Direct Indirect Speech"],
  [1,"Select the most appropriate antonym of the given word. IMPECCABLE",["Flawless","Blemished","Unsullied","Exquisite"],"Antonyms"],
  [0,"Select the option that expresses the given sentence in passive voice. She is going to serve tea in silver cups today.",["Tea is going to be served in silver cups today.","Tea will be served in silver cups today.","Tea will have been served in silver cups today.","Tea should be served in silver cups today."],"Active Passive"],
  [1,"Select the option that expresses the given sentence in indirect speech. The young man said to his father, 'Pardon me, sir.'",["The young man told his father pardon me.","The young man begged of his father to pardon him.","The young man requested to his father pardon me, sir.","The young man begged of his father to pardon me."],"Direct Indirect Speech"],
  [1,"Select the most appropriate indirect form. 'Oh, how could I ever thank you, Sir!' said the convict to the Bishop.",["The convict told the Bishop that it was difficult for him to thank him.","Exclaiming gratefully, the convict said to the Bishop that he could never thank him enough.","The convict said to the Bishop that he could never thank him enough.","The convict exclaimed gratefully to the Bishop that how he could ever thank him."],"Direct Indirect Speech"],
  [2,"Select the most appropriate option to improve the underlined segment. His tone was neither of anger nor sorrow.",["no improvement required","or of sorrow","nor of sorrow","or sorrow"],null],
  [2,"Identify the segment that contains a grammatical error. He said that he had forgot to lock the door before leaving.",["He said that","to lock the door","he had forgot","before leaving"],"Error Detection"],
  [1,"Select the word which means the same as the group of words given. person who moves from one place to another, with intentions of finding work and settling",["Nomad","Migrant","Tramp","Vagrant"],"One Word Substitution"],
  [0,"Select the option that expresses the given sentence in active voice. The money shall have been withdrawn from the bank by tomorrow.",["We shall have withdrawn the money from the bank by tomorrow.","We shall be withdrawing the money from the bank by tomorrow.","We shall withdraw the money from the bank by tomorrow.","We are going to withdraw the money from the bank by tomorrow."],"Active Passive"],
  [2,"Identify the segment which contains a grammatical error. At one time birds and animals lived peaceful together.",["At one time","birds and animals lived","peaceful together.","No error"],"Error Detection"],
  [0,"Select the option that expresses the given sentence in indirect speech. She said to me, 'Can you look after my baby for a short while?'",["She asked me if I could look after her baby for a short while.","She asked me if I can look after my baby for a short while.","She asked me if you can look after my baby for a short while.","She asked me that if I could look after her baby for a short while."],"Direct Indirect Speech"],
  [1,"Select the most appropriate option to improve the underlined segment. Eighty girls sat there at four long tables, doing their homework by candlelight.",["to doing their homework by","no improvement required","doing its homework by","to have done their homework with"],null],
  [2,"Select the most appropriate option to improve the underlined segment. Mr. Fogg thought that it is possible to a man to go round the world in eighty days.",["it is possible to a man","it was possible to the man","it was possible for a man","no improvement required"],null],
  [1,"Identify the segment that contains a grammatical error. Scarcely had he took the medicine when his headache was gone.",["No error","took the medicine","Scarcely had he","when his headache was gone"],"Error Detection"],
  [3,"Select the option that expresses the given sentence in active voice. An enquiry is demanded by us.",["We are demanding an enquiry.","We have demanded an enquiry.","We will demand an enquiry.","We demand an enquiry."],"Active Passive"],
  [3,"Select the most appropriate one word to substitute the given group of words. symbols of royalty",["emblem","relic","sceptre","regalia"],"One Word Substitution"],
  [2,"Select the most appropriate indirect form. Granny said to Nina, 'I don't know why you think it is so wonderful.'",["Granny said to Nina that she hadn't known why she was thinking it was so wonderful.","Granny said to Nina that I don't know why you think it is so wonderful","Granny said to Nina that she didn't know why she thought it was so wonderful.","Granny said to Nina that she doesn't know why she thinks it was so wonderful."],"Direct Indirect Speech"],
  [1,"Select the most appropriate meaning of the given idiom. hold your horses",["fight trouble","slow down","not get upset","aim high"],"Idioms and Phrases"],
  [2,"Select the option that will improve the underlined part. She is as good if not better than her sister.",["as good as","more good","good as","No Improvement"],null],
  [1,"Identify the segment which contains a grammatical error. If you study hard, you surely got selected for the scholarship.",["for the scholarship.","you surely got selected","If you study hard","No error"],"Error Detection"],
  [2,"Select the word which means the same as the group of words given. a large single detached house with single or double story",["Penthouse","Suite","Bungalow","Apartment"],"One Word Substitution"],
  [1,"Select the most appropriate synonym of the given word. abandon",["adopt","leave","start","allow"],"Synonyms"],
  [3,"Select the most appropriate synonym of the given word. INCUMBENT",["Contestant","Adventurer","Prophet","Occupant"],"Synonyms"],
  [3,"Select the most appropriate passive form. Let your son manage your business after your retirement.",["Your business is being managed by your son after your retirement.","Your business can be managed by your son after your retirement.","Let your retirement be managed by your son after your business.","Let your business be managed by your son after your retirement."],"Active Passive"],
  [1,"Select the most appropriate indirect form. He said to his brother, 'Where did you go for a picnic?'",["He asked his brother where did he go for a picnic.","He asked his brother where he had gone for a picnic.","He asked his brother where he went for a picnic.","He asked his brother where did you go for a picnic."],"Direct Indirect Speech"],
  [2,"Identify the segment that contains a grammatical error. Open your books at page tenth.",["No error","Open your","page tenth","books at"],"Error Detection"],
  [1,"Fill in the blank with the most appropriate word. The annual meeting of our club has been ______ till next month.",["deranged","deferred","disrupted","dragged"],"Fill in the Blanks"],
  [3,"Select the option that will improve the underlined part. The apple tree was loaded of fruit.",["loaded with","loaded from","No Improvement","laden with"],null],
  [3,"Select the option that expresses the given sentence in active voice. Nothing can be achieved without hard work.",["One will achieve nothing without hard work.","One has achieved nothing without hard work.","One could achieve nothing without hard work.","One can achieve nothing without hard work."],"Active Passive"],
]};

// ============ PAPER 2: SSC CGL Tier-2 11-Sep-2019 English ============
const paper2019 = { name: "SSC CGL Tier-2 11-Sep-2019 English", year: 2019, questions: [
  // Standalone Q1-Q28
  [0,"Select the word which means the same as the group of words given. causing great damage or suffering",["Catastrophic","Spasmodic","Catatonic","Chasm"],"One Word Substitution"],
  [2,"Given below are four jumbled sentences. Pick the option that gives their correct order.",["DCBA","ABDC","DACB","CADB"],"Sentence Rearrangement"],
  [2,"Identify the segment in the sentence, which contains the grammatical error. Why should always we have to wait for her to join us?",["for her to join her","Why should","always we","have to wait"],"Error Detection"],
  [0,"Choose the most appropriate option to change the narration. The priest said to me, 'You have committed a cardinal sin.'",["The priest told me that I had committed a cardinal sin.","The priest is saying I have committed a cardinal sin.","The priest said if I will be committing a cardinal sin.","The priest told me I am committing a cardinal sin."],"Direct Indirect Speech"],
  [0,"Choose the most appropriate option to change the narration. Her mother said, 'We must have a party to celebrate your promotion.'",["Her mother said that they must have a party to celebrate her promotion.","Her mother said she had been planning a party for celebrating her promotion.","Her mother says that they should plan a party to celebrate her promotion.","Her mother told that they would be having a party to celebrate her promotion."],"Direct Indirect Speech"],
  [2,"Choose the most appropriate option to change the voice. Somebody feeds the stray dog daily.",["Daily somebody has fed the stray dog.","The stray dog was fed daily.","The stray dog is fed daily by somebody.","The stray dog will be fed daily."],"Active Passive"],
  [0,"Identify the best way to improve the underlined part. She is a very good sprinter. I can't run as fast as she does.",["no improvement","like she is doing","as she doing","as she do"],null],
  [1,"Select the most appropriate option to fill in the blank. The car cleaner expressed his inability to continue cleaning my car from 1st July due to his ______.",["ill feeling","ill health","disease","disorder"],"Fill in the Blanks"],
  [2,"Select the word which means the same as the group of words given. Strong dislike or hostility",["sympathy","telepathy","antipathy","empathy"],"One Word Substitution"],
  [3,"Identify the segment which contains the grammatical error. She is a great cook, has her own blog on YouTube and was followed by one lakh viewers.",["She is","a great cook","has her own blog","was followed"],"Error Detection"],
  [0,"Choose the most appropriate option to change the narration. My uncle said, 'Just my luck! I've missed the bus again.'",["My uncle exclaimed that he was unlucky as he had missed the bus again.","My uncle said he was lucky as he had missed the bus again.","My uncle exclaimed that he is once again lucky to miss the bus.","My uncle says that he is unlucky as he has missed the bus again."],"Direct Indirect Speech"],
  [3,"Choose the most appropriate option to change the narration. Kiran said, 'I will reach Patna tomorrow morning.'",["Kiran said that she will reach Patna tomorrow morning.","Kiran says that she will reach Patna tomorrow morning.","Kiran said that I will reach Patna the next morning.","Kiran said that she would reach Patna the next morning."],"Direct Indirect Speech"],
  [3,"Identify the segment which contains the grammatical error. The Prime Minister holding is the important meeting to review the security and safety of doctors.",["of doctors","working in","to review","holding is the"],"Error Detection"],
  [1,"Select the most appropriate idiom to fill in the sentence. Making the final paper was a really difficult task but by the end of the week, I was able to ______.",["bark up the wrong tree","wrap my head around it","cry my eyes out","run out of steam"],"Idioms and Phrases"],
  [1,"Select the word which means the same as the group of words given. To express in an unclear way",["eloquent","garbled","lucid","Intelligible"],"One Word Substitution"],
  [0,"Select the most appropriate option to fill in the blank. The sky is quite overcast. We're ______ to have rain today.",["likely","mostly","surely","probably"],"Fill in the Blanks"],
  [0,"Select the most appropriate option to fill in the blank. When my friend suggested going to the mall for lunch, I agreed ______.",["at once","at large","at most","at ease"],"Fill in the Blanks"],
  [2,"Choose the most appropriate option to change the narration. The airline official said, 'We are extremely sorry that the flight has been delayed due to heavy floods.'",["The airline official announced the airline is extremely sorry that the flight will be delayed due to heavy floods.","The airline official announces they are extremely sorry that the flight has been delayed due to heavy floods.","The airline official announced that they were extremely sorry that the flight had been delayed due to heavy floods.","The airline official announced that we are extremely sorry that the flight has been delayed due to heavy floods."],"Direct Indirect Speech"],
  [2,"Identify the best way to improve the underlined part. If you wishes to participating at the National level games you'll have to start getting coaching immediately.",["wish to participating","wished for participating","wish to participate","no improvement"],null],
  [2,"Choose the most appropriate option to change the voice. Popular monuments will be kept open till 9 p.m.",["They had kept popular monuments open till 9 p.m.","They are keeping popular monuments open till 9 p.m.","They will keep popular monuments open till 9 p.m.","They will be keeping popular monuments open till 9 p.m."],"Active Passive"],
  [2,"Identify the segment which contains the grammatical error. Last evening my friend tells me the funny joke that I have ever heard.",["that I have","ever heard","tells me the funny joke","Last evening my friend"],"Error Detection"],
  [3,"Identify the best way to improve the underlined part. You have been so unwell! How you feeling now?",["you is feeling","you are feeling","No improvement","are you feeling"],null],
  [1,"Select the word which means the same as the group of words given. something happening by chance in a happy and beneficial way",["serenity","serendipity","misadventure","fortitude"],"One Word Substitution"],
  [0,"Select the word which means the same as the group of words given. lacking in variety and interest",["monotonous","fresh","exclamatory","vibrant"],"One Word Substitution"],
  [1,"Identify the best way to improve the underlined part. I am going to see a play tomorrow evening.",["seeing","no improvement","to saw","to seeing"],null],
  [1,"Pick a word opposite in meaning to optimistic.",["energetic","pessimistic","idealistic","realistic"],"Antonyms"],
  [0,"Choose the most appropriate option to change the narration. Rita said, 'I'm not feeling well.'",["Rita said that she was not feeling well.","Rita said she will not be feeling well.","Rita said she is not feeling well.","Rita says that I'm not feeling well."],"Direct Indirect Speech"],
  [3,"Select the most appropriate idiom to fill in the sentence. Suman really has ______. She moved to a new house just a month back but already has a lovely garden.",["a heart of gold","a bad hair day","a foot in the door","green fingers"],"Idioms and Phrases"],

  // Fill-in-blanks passage set 1 (Q29-33)
  [0,"Select the most appropriate option to fill in blank No.1.",["intently","smoothly","evenly","clearly"],"Fill in the Blanks","cgl2019eng_fill1"],
  [3,"Select the most appropriate option to fill in blank No.2.",["Wherever","Whenever","Moreover","However"],"Fill in the Blanks","cgl2019eng_fill1"],
  [0,"Select the most appropriate option to fill in blank No.3.",["at","opposite","through","in"],"Fill in the Blanks","cgl2019eng_fill1"],
  [0,"Select the most appropriate option to fill in blank No.4",["immediately","keenly","urgently","cleverly"],"Fill in the Blanks","cgl2019eng_fill1"],
  [3,"Select the most appropriate option to fill in blank No.5.",["created","create","creates","creating"],"Fill in the Blanks","cgl2019eng_fill1"],

  // Standalone Q34-Q61
  [0,"Identify the best way to improve the underlined part. When I was a child I do not like going out to play in the park.",["did not like","don't likes","no improvement","did not liked"],null],
  [1,"Select the word which means the same as the group of words given. Something causing shock or dismay",["frivolous","appalling","mischievous","remarkable"],"One Word Substitution"],
  [0,"Identify the best way to improve the underlined part. My guests doesn't wanted to eat anything since they weren't hungry after the party.",["didn't want to eat","didn't wanted to eat","don't wants to eat","no improvement"],null],
  [1,"Identify the best way to improve the underlined part. Please switch on all the lights in the room as it's getting very dark now.",["as it were getting","no improvement","as it was getting","when it will get"],null],
  [1,"Identify the word that is misspelt.",["Immediate","iliterate","implement","illogical"],"Spelling"],
  [3,"Select the most appropriate idiom to fill in the sentence. Pallavi worked really hard for the examination and ______ to gain success.",["struck a sour note","hit the bull's eye","beat about the bush","left no stone unturned"],"Idioms and Phrases"],
  [0,"Choose the most appropriate option to change the voice. By how many people were you helped in your time of difficulty?",["How many people helped you in your time of difficulty?","How many people were you helping in time of difficulty?","How many people are you helped by in your time of difficulty?","In your time of difficulty how many people were you helped by?"],"Active Passive"],
  [1,"Choose the most appropriate option to change the voice. Nobody told me Vanita was unwell.",["I wasn't being told by anybody that Vanita was unwell.","I wasn't told by anybody that Vanita was unwell.","Nobody told me Vanita was being unwell.","Nobody tells me that Vanita was unwell."],"Active Passive"],
  [1,"Identify the best way to improve the underlined part. When Veena returned to India she had to get use driving on the left.",["to get used to drives","to get used to driving","No improvement","to getting use to"],null],
  [3,"Identify the segment which contains the grammatical error. The birth of a girl bring great joy to Neha's family.",["The birth","of a girl","to Neha's family","bring great joy"],"Error Detection"],
  [3,"Select the most appropriate idiom to fill in the sentence. Listen, you need to prioritize. You can't have your ______!",["Achilles' heel","heebie-jeebies","paint the town red","finger in every pie"],"Idioms and Phrases"],
  [1,"Identify the segment which contains the grammatical error. This summer, I've met down a lot of interesting people.",["interesting people","I've met down","a lot of","This summer"],"Error Detection"],
  [0,"Select the most appropriate option to fill in the blank. The business prospect seemed quite ______ so I convinced my friend to partner with me.",["lucrative","dubious","flourishing","prosperous"],"Fill in the Blanks"],
  [3,"Choose the most appropriate option to change the voice. Do not take the coastal road during monsoons.",["You are not taking the coastal road during monsoons.","You will not take the coastal road during monsoons.","Coastal road is not being taken during monsoons.","Coastal roads should not be taken during monsoons."],"Active Passive"],
  [1,"Choose the most appropriate option to change the voice. The team manager is examining the documents of all the players.",["Examination of the documents of all the players was done by the team manager.","The documents of all the players are being examined by the team manager.","The documents of all the players the team manager is examining.","The team manager has been examining the documents of all the players."],"Active Passive"],
  [2,"Choose the most appropriate option to change the narration. He asked me if I would like to take that apartment on rent from the next day.",["'Would you had taken this apartment on rent from tomorrow?' he said to me.","'Would you have taken this apartment on rent from the next day?' he said to me.","'Would you like to take this apartment on rent from tomorrow?' he said to me.","'Would you be liking to take this apartment on rent from tomorrow?' he said to me."],"Direct Indirect Speech"],
  [2,"Select the most appropriate idiom to fill in the sentence. Initially I thought I could participate in the international Scholars Contest but when I saw the preparatory material I ______.",["missed the boat","hit the bull's eye","got cold feet","made a scene"],"Idioms and Phrases"],
  [2,"Select the most appropriate option to fill in the blank. The company gave in to the demands of the employees as it found them ______.",["illegal","irrational","legitimate","formidable"],"Fill in the Blanks"],
  [3,"Select the word which means the same as the group of words given. continuing for a very long time",["laconic","interim","concise","interminable"],"One Word Substitution"],
  [2,"Identify the segment which contains the grammatical error. I won't be here next week as I'm going to Mumbai to a conference.",["I won't","be here","to a conference","as I'm going"],"Error Detection"],
  [2,"Identify the best way to improve the underlined part. My daughter fell asleep while she been reading.",["while she is reading","no improvement","while she was reading","whenever she has reading"],null],
  [2,"Choose the most appropriate option to change the voice. Teenagers don't like being told what to do.",["Being told what to do was not being liked by teenagers.","Teenagers should not be told what to do.","Being told what to do is not liked by teenagers.","Teenagers are not liking being told what to do."],"Active Passive"],
  [0,"Identify the best way to improve the underlined part. The metro service is so good that one doesn't have to wait since a few minutes.",["beyond a few minutes","No improvement","for some few minutes","up to a few minutes"],null],
  [3,"Identify the best way to improve the underlined part. Have you any idea where is Anya?",["where Anya were?","No improvement","where was Anya?","where Anya is?"],null],
  [3,"Identify the segment which contains the grammatical error. I am really bored of this movie! When was it end?",["it end?","I am really bored","of this movie","When was"],"Error Detection"],
  [2,"Identify the segment which contains the grammatical error. I'm going to the airport to receives my friend.",["my friend","to the airport","to receives","I'm going"],"Error Detection"],
  [1,"Choose the most appropriate option to change the voice. People are reading the articles on using plastic waste innovatively with interest.",["The articles on innovative use of plastic waste are read with interest.","The articles on using plastic waste innovatively are being read with interest.","People have been reading the articles on using plastic waste innovatively with interest.","People were reading the articles on using plastic waste innovatively with interest."],"Active Passive"],
  [2,"Choose the most appropriate option to change the narration. 'You speak such good English!' said Mary.",["Mary exclaimed that I speak so much good English.","Mary told me I was speaking much good English.","Mary exclaimed that I spoke very good English.","Mary exclaimed that I was speaking very good English."],"Direct Indirect Speech"],

  // Tiger passage set (Q62-Q70)
  [0,"The Global Tiger Forum comprises -",["countries which have tigers.","National Geographic and World Wildlife Fund.","all countries of the United Nations.","America and the European Union."],"Reading Comprehension","cgl2019eng_tiger"],
  [0,"The biggest increase in tiger population has been between the years",["2014-2018","2002-2006","2006-2010","2010-2014"],"Reading Comprehension","cgl2019eng_tiger"],
  [2,"The year 2022 marks the target date for -",["tripling the world tiger population.","tripling India's tiger population.","doubling the count of world tiger population.","doubling the count of India's tiger population."],"Reading Comprehension","cgl2019eng_tiger"],
  [1,"2018 census on the big cat has been the most reliable because?",["it photographed 1540 tigers.","it photographed 83% of the tigers.","it photographed all living tigers of India.","it only uses the capture-mark-recapture method."],"Reading Comprehension","cgl2019eng_tiger"],
  [1,"The survival of the tiger is vital today because?",["it is no longer a threat to the villagers' safety.","it is central to the food chain and the eco system.","it promotes tourism in India and increases revenue.","it is now on the verge of extinction."],"Reading Comprehension","cgl2019eng_tiger"],
  [2,"Researchers refer to places where tigers are found not by states but by the term?",["green belts","deep forests","landscapes","ecosystems"],"Reading Comprehension","cgl2019eng_tiger"],
  [2,"Which of the following statements is not true as per the passage?",["There are more reliable ways of data collection","Forest departments have become more watchful","The tiger reserves have increased to 100 in 2018","Poaching gangs have been reduced drastically"],"Reading Comprehension","cgl2019eng_tiger"],
  [2,"What has been the impact of providing inviolate spaces for tigers?",["The poachers have been caught in these spaces very easily.","The number of villagers killed by man eater tigers has increased.","Tiger numbers have increased due to safe breeding places.","Tigers have moved from Uttar Pradesh to Madhya Pradesh."],"Reading Comprehension","cgl2019eng_tiger"],
  [1,"Pick out a word that is similar in meaning to: CONDUCIVE",["reclusive","helpful","unfavorable","hindering"],"Reading Comprehension","cgl2019eng_tiger"],

  // Standalone Q71-Q77
  [3,"Identify the segment which contains the grammatical error. Does an English examination begin at 10 o'clock?",["10 o'clock?","English examination","begin at","Does an"],"Error Detection"],
  [3,"Choose the most appropriate option to change the voice. Please give me some more time to complete the assignments.",["You may please give me some more time to complete the assignments.","I am requesting you to give me some more time to complete the assignments.","Some more time will be given to me to complete the assignments.","I may please be given some more time to complete the assignments."],"Active Passive"],
  [1,"Choose the most appropriate option to change the narration. Rohan smiled and said that he thought Jojo liked him.",["Rohan smiled and said he thought, 'Jojo likes me!'","Rohan smiled and said, 'I think Jojo likes me!'","Rohan smiled and said, 'They think Jojo likes me!'","Rohan smiled and asked, 'Do you think Jojo likes me?'"],"Direct Indirect Speech"],
  [3,"Identify the best way to improve the underlined part. The Inspector stopped the boy and asked where he went.",["he had going","No improvement","he has gone","he was going"],null],
  [3,"Identify the segment which contains the grammatical error. I use to going for a morning walk when I was living in Dehradun.",["living in Dehradun","for a morning walk","when I was","use to going"],"Error Detection"],
  [1,"Choose the most appropriate option to change the narration. The commander ordered his battalion to march on.",["The commander says to his battalion, 'Please march on.'","'March on!' the commander said to his battalion.","The commander says to his battalion, 'March on!'","The commander gives his battalion order, 'March on!'"],"Direct Indirect Speech"],
  [1,"Choose the most appropriate option to change the narration. The lawyer says, 'My client is innocent.'",["The lawyer said that his client is innocent.","The lawyer says that his client is innocent.","The lawyer says my client was innocent.","The lawyer said that my client is innocent."],"Direct Indirect Speech"],

  // Bhupen Khakar fill-in-blank set (Q78-Q86)
  [1,"Select the most appropriate option to fill in blank No.1. (Passage: I was friends with the artist Bhupen Khakar... finest/fine/finer/few)",["Finer","finest","few","fine"],"Fill in the Blanks","cgl2019eng_bhupen"],
  [0,"Select the most appropriate option to fill in blank No.2. (Passage: I was friends with Bhupen Khakar...)",["a lot","the more","a lots","the less"],"Fill in the Blanks","cgl2019eng_bhupen"],
  [3,"Select the most appropriate option to fill in blank No.3.",["would had","having had","has had","would have"],"Fill in the Blanks","cgl2019eng_bhupen"],
  [0,"Select the most appropriate option to fill in blank No.4.",["still","until","never","alone"],"Fill in the Blanks","cgl2019eng_bhupen"],
  [1,"Select the most appropriate option to fill in blank No.5.",["is","was","be","were"],"Fill in the Blanks","cgl2019eng_bhupen"],
  [3,"Select the most appropriate option to fill in blank No.6.",["to drop","dropping","dropped","drop"],"Fill in the Blanks","cgl2019eng_bhupen"],
  [3,"Select the most appropriate option to fill in blank No.7.",["those","their","they","them"],"Fill in the Blanks","cgl2019eng_bhupen"],
  [0,"Select the most appropriate option to fill in blank No.9.",["open","was opening","opens","opening"],"Fill in the Blanks","cgl2019eng_bhupen"],
  [0,"Select the most appropriate option to fill in blank No.10.",["to look","to watch","looking upon","for looking"],"Fill in the Blanks","cgl2019eng_bhupen"],

  // Standalone Q87-Q105
  [1,"Identify the segment which contains the grammatical error. What shall we do on ourselves this evening?",["this evening","on ourselves","What shall","we do"],"Error Detection"],
  [3,"Choose the most appropriate option to change the narration. 'Let's go out for dinner. I've been home this whole week,' said Anna.",["Anna said to me that we must go out for dinner as she has been home that whole week.","Anna told me she was wanting to go out for dinner and had been home this whole week.","Anna told me she is at home the whole week and would like to go out for dinner.","Anna suggested we go out for dinner as she had been home that whole week."],"Direct Indirect Speech"],
  [0,"Choose the most appropriate option to change the voice. They sealed all unauthorized farms on the highway.",["All unauthorized farms on the highway were sealed.","They are sealing all unauthorized farms on the highway.","All unauthorized farms on the highway have sealed the authorities.","The authorities were sealing all unauthorized farms on the highway."],"Active Passive"],
  [1,"Choose the most appropriate option to change the voice. Do you think that the government will accept our demands?",["Do you think we will accept the government demands?","Do you think that our demands will be accepted by the government?","Do you think that the government is going to accept our demands?","Do you think that our demands have been accepted by the government?"],"Active Passive"],
  [2,"Choose the most appropriate option to change the voice. How many languages are spoken in India?",["How many languages did the Indians speak?","How many languages are Indians speaking?","How many languages do people in India speak?","People have been speaking how many languages in India?"],"Active Passive"],
  [0,"Select the most appropriate idiom to fill in the sentence. In my parents' time, we mostly ate at home and family outings happened ______.",["once in a blue moon","behind the back","in fine feather","shoulder to shoulder"],"Idioms and Phrases"],
  [2,"Choose the most appropriate option to change the narration. 'Go on, apply for the job,' said my best friend.",["My best friend says I should go off and apply for the job.","My best friend had said to me to go on and apply for the job.","My best friend encouraged me to apply for the job.","You should apply for the job my best friend said."],"Direct Indirect Speech"],
  [3,"Choose the most appropriate option to change the voice. High interest rates are alarming automobile dealers.",["Automobile dealers is being alarmed by high interest rates.","High interest rates has been alarmed by automobile dealers.","High interest rates have alarmed automobile dealers.","Automobile dealers are being alarmed by high interest rates."],"Active Passive"],
  [1,"Choose the most appropriate option to change the narration. 'You should lock your car as there have been some instances of theft,' said Anil.",["There have been instances of theft so I should lock my car was told to me by Anil.","Anil advised me that I should lock my car as there had been some instances of theft.","There have been some instances of theft so I should have locked my car said Anil.","Anil said he must lock his car because there were some instances of theft."],"Direct Indirect Speech"],
  [0,"Identify the segment which contains the grammatical error. Instead of studying in home I went to my friend's house.",["in home","I went","Instead of studying","to my friend's house."],"Error Detection"],
  [1,"Select the word which means the same as the group of words given. Impossible to satisfy",["palatable","insatiable","insane","magnanimous"],"One Word Substitution"],
  [1,"Choose the most appropriate option to change the narration. 'I'm so sorry! I totally forgot about the meeting,' he said.",["He is being sorry for having totally forgotten about the meeting.","He apologized and said he had totally forgotten about the meeting.","He was so sorry that he had forgot totally about the meeting.","Having forgotten totally about the meeting he is very sorry."],"Direct Indirect Speech"],
  [3,"Identify the best way to improve the underlined part. I couldn't visit my aunt as there were the traffic jam due to an accident.",["no improvement","are a traffic jam","were a traffic jam","was a traffic jam"],null],
  [0,"Choose the most appropriate option to change the voice. We have written all the library rules on the notice-board.",["All the library rules have been written on the notice-board.","All the library rules were written on the notice-board.","All the library rules are being written on the notice-board.","We are writing all the library rules on the notice-board."],"Active Passive"],
  [0,"Choose the most appropriate option to change the narration. The Queen said to the ministers, 'Cut off the prisoner's head!'",["The Queen ordered the ministers to cut off the prisoner's head.","Screaming at the ministers the Queen is ordering to cut off the prisoner's head.","The prisoner's head would be cut off screamed the queen to the ministers.","The Queen told the ministers that to cut off the prisoner's head."],"Direct Indirect Speech"],
  [1,"Identify the best way to improve the underlined part. We waited till 10 pm for our guests but they never turned up.",["was waiting","no improvement","have been waited","are waiting"],null],
  [0,"Select the most appropriate idiom to fill in the sentence. That student of yours has such sound values. She's indeed a ______.",["rare bird","barrel of laughs","pain in the neck","pot calling the kettle black"],"Idioms and Phrases"],
  [2,"Choose the most appropriate option to change the narration. Mother said, 'Sonam, don't throw tantrums.'",["Mother warns Sonam not to throw tantrums.","Mother said that Sonam is not to throw tantrums.","Mother told Sonam not to throw tantrums.","Mother says to Sonam not to throw tantrums."],"Direct Indirect Speech"],
  [3,"Identify the segment which contains the grammatical error. He likes to put all the garbage into a black small bag.",["into a","all the garbage","He likes to put","black small bag"],"Error Detection"],

  // Fill-in-blanks passage set 2 (Q106-Q113)
  [2,"Select the most appropriate option to fill in blank No.1",["her's","ours","one's","theirs"],"Fill in the Blanks","cgl2019eng_fill2"],
  [3,"Select the most appropriate option to fill in blank No.2",["therefore","both","by","and"],"Fill in the Blanks","cgl2019eng_fill2"],
  [3,"Select the most appropriate option to fill in blank No.3",["building","monument","apartments","monuments"],"Fill in the Blanks","cgl2019eng_fill2"],
  [3,"Select the most appropriate option to fill in blank No.5",["in","by","for","till"],"Fill in the Blanks","cgl2019eng_fill2"],
  [0,"Select the most appropriate option to fill in blank No.6.",["this","then","those","that"],"Fill in the Blanks","cgl2019eng_fill2"],
  [3,"Select the most appropriate option to fill in blank No.7",["Tour","Tourist","Tourists","Tourism"],"Fill in the Blanks","cgl2019eng_fill2"],
  [0,"Select the most appropriate option to fill in blank No.8",["close","was closed","having closed","was being closed"],"Fill in the Blanks","cgl2019eng_fill2"],
  [0,"Select the most appropriate option to fill in blank No.9",["will be","has been","will have been","would have been"],"Fill in the Blanks","cgl2019eng_fill2"],

  // Comedy passage set (Q114-Q118)
  [1,"By saying 'the audience has not invested in the stand-up comedy art form' the author means that?",["the audience prefers to watch only women comedians.","it is a new art form and it will take time to build an audience.","the audience don't wish to develop a sense of humour.","there are faltering payments and cancelled shows."],"Reading Comprehension","cgl2019eng_comedy"],
  [1,"Comedians were given good media coverage.",["3, 4 & 5","1, 2 & 5","2, 4 & 5","2, 3 & 4"],"Reading Comprehension","cgl2019eng_comedy"],
  [1,"Select the word which means the same as 'fledgling' in the given context.",["a nervous person who frets a lot","a fairly new company or industry","a mature person who performs well","a successful and established venture"],"Reading Comprehension","cgl2019eng_comedy"],
  [3,"How has the situation been reversed from the early success of stand-up comedy?",["SNG Comedy and East India Comedy support the comedians.","Comedians are being offered double the price asked by them.","Comedy Store and Canvas Laugh Club are offering bigger platforms to comedians.","Comedy groups are packing up and founders are resigning."],"Reading Comprehension","cgl2019eng_comedy"],
  [3,"The true comic artist takes years to find one's voice.",["1 & 3","2 & 4","1 & 2","3 & 4"],"Reading Comprehension","cgl2019eng_comedy"],

  // Standalone Q119-Q134
  [2,"Identify the best way to improve the underlined part. Ravi can't come to the meeting as he was not well.",["couldn't came","could come","couldn't come","no improvement"],null],
  [0,"Find a word that is the synonym of Philanthropist.",["humanitarian","philosopher","humanist","misant"],"Synonyms"],
  [1,"Identify the best way to improve the underlined part. These houses which were built 20 years ago are now in need of repairs.",["which can built","no improvement","which was build","who was built"],null],
  [0,"Select the word which means the same as the group of words given. Splendid and expensive-looking",["sumptuous","peculiar","curious","malicious"],"One Word Substitution"],
  [1,"Identify the best way to improve the underlined part. Don't stay in school after 2 p.m. All the teachers have been leaving by then.",["are leave","will have left","must left","No improvement"],null],
  [3,"Identify the best way to improve the underlined part. I have an invite from a friend to visit the Canada and United States next month.",["no improvement","to Canada or the united states","to the Canada and United States","Canada and the United States"],null],
  [1,"Reena said, 'What a lovely scene! I wish I could stay here forever!'",["Reena said with happiness that was a lovely scene. She wishes to stay there forever.","Reena exclaimed that it was a lovely scene. She further wished that she could stay there forever.","Reena says this is a lovely scene. I wish I could stay there forever.","Reena said what a lovely scene! She wished she could stay here forever."],"Direct Indirect Speech"],
  [3,"My grandfather wished that God should give me success in my new venture. He further said that his prayers would always be with me.",["My grandfather says to me, 'God might give you success in your new venture!'","My grandfather said to me, 'Maybe God will give you success in your new venture!'","My grandfather wished to me, 'May God give to you success in your new venture!'","My grandfather said to me, 'May God give you success in your new venture! My prayers will always be with you.'"],"Direct Indirect Speech"],
  [0,"The salesman said to me, 'All the gift items are new. We received this consignment yesterday.'",["The salesman informed me that all the gift items were new. He further said they had received that consignment the day before.","The salesman informed to me about all the gift items that they were new.","The salesman told me that all the gift items are new.","The salesman said to me that all the gift items are new."],"Direct Indirect Speech"],
  [0,"Select the word which means the same as the group of words given. Seeming reasonable",["plausible","permeable","versatile","volatile"],"One Word Substitution"],
  [2,"Identify the best way to improve the underlined part. Whenever we go out we spend a lot money on food.",["much of","most of","a lot of","no improvement"],null],
  [3,"Choose the most appropriate option to change the voice. An apple carries about 100 million useful bacteria.",["About 100 million useful bacteria are being carried by an apple.","An apple will carry about 100 million useful bacteria.","The useful bacteria to be carried in an apple is about 100 million.","About 100 million useful bacteria are carried by an apple."],"Active Passive"],
  [3,"Identify the segment which contains the grammatical error. High level security arrangements were made for the forthcoming visit to a Japanese Prime Minister.",["security arrangements","were made","for the forthcoming","visit to a"],"Error Detection"],
  [0,"Choose the most appropriate option to change the voice. Preparations are being made for our Annual fest.",["We are making preparations for our Annual fest.","We have made preparations for our Annual fest.","Preparations were being made for our Annual fest.","Our Annual fest preparations are made."],"Active Passive"],
  [2,"Identify the best way to improve the underlined part. My student, a doctor by profession, preferring to walk to the hospital everyday.",["preferring walking","no improvement","prefers to walk","prefer to walking"],null],
  [2,"Choose the most appropriate option to change the narration. The teacher said to Rana, 'Have you completed the project?'",["The teacher asked Rana that if Rana has completed the project.","The teacher asks Rana have you completed the project.","The teacher asked Rana whether he had completed the project.","The teacher asks Rana will you complete the project."],"Direct Indirect Speech"],

  // Exercise/weight loss passage set (Q135-Q144)
  [2,"The Mid West Trial 2 was a",["European study on 100 participants who exercised 7 times a week and burnt 800 calories.","Canadian study on 500 participants who exercised 6 times a week and burnt 600 calories.","U.S based study on 100 participants who exercised 5 times a week and burnt 600 calories","U.S based study on 100 participants who exercised 3 times a week and burnt 300 calories."],"Reading Comprehension","cgl2019eng_exercise"],
  [3,"The Mid West Trial 2 duration was -",["12 months","6 months","18 months","10 months"],"Reading Comprehension","cgl2019eng_exercise"],
  [3,"Select the option that is not true as per the passage. Several studies show that as a result of the workout-",["the majority lost a little weight.","a few had the desired weight loss.","some gained some weight.","most gained a lot of weight."],"Reading Comprehension","cgl2019eng_exercise"],
  [1,"What was the difference between the Mid West Trial 2 study and the Mid West Trial 2 Follow-up study?",["The duration of the follow up study was longer.","The calorie intake and the time of exercise were examined.","Participants of the study stayed in the premises.","Face to face interviews were conducted."],"Reading Comprehension","cgl2019eng_exercise"],
  [2,"The finding of the Mid West Trial 2 Follow-up study was that the best time for exercise was-",["noon to 3 p.m.","between 3-7 p.m.","before noon.","7 p.m. onwards."],"Reading Comprehension","cgl2019eng_exercise"],
  [1,"Select the option which is not true. The successful weight losers in the Mid West Trial 2 Follow-up study ______",["remained active.","slept more.","walked more.","ate less."],"Reading Comprehension","cgl2019eng_exercise"],
  [3,"Select the correct option. By 'larkish exercisers' the writer refers to people who-",["love to see the lark in the morning.","like to exercise late with the larks.","like to sing in the morning.","exercise in the morning."],"Reading Comprehension","cgl2019eng_exercise"],
  [2,"Find one word which means the same as the following. a set of rules about food and diet that someone follows",["catalogue","regiment","regimen","fundamental"],"Reading Comprehension","cgl2019eng_exercise"],
  [2,"Find one word in the passage which means the same as 'confusing'.",["brainstorming","vexing","befuddling","striking"],"Reading Comprehension","cgl2019eng_exercise"],
  [2,"What would Dr. Willis say to someone who has given up exercising because they cannot do so in the morning?",["Exercise is good only in the morning.","Exercise only with a trainer.","Any exercise is better than none.","Evening is the worst time to exercise."],"Reading Comprehension","cgl2019eng_exercise"],

  // Standalone Q145-Q163
  [0,"Select the most appropriate idiom to fill in the sentence. Colleges cannot ______ to ragging because of the Anti Ragging Act.",["turn a blind eye","add fuel to the fire","look forward","look someone in the eye"],"Idioms and Phrases"],
  [1,"Identify the segment which contains the grammatical error. I had a hard time paying the driver as I had only hundreds rupee note.",["paying the driver","only hundreds rupee note","I had a hard time","as I had"],"Error Detection"],
  [0,"Select the most appropriate idiom to fill in the sentence. During the staff meeting there was a lot of ruckus since many didn't ______ with the authorities.",["see eye to eye","put their best foot forward","put their foot down","move up in the world"],"Idioms and Phrases"],
  [0,"Select the most appropriate idiom to fill in the sentence. I could make out that the conversation was leading to a fight so I ______.",["nipped it in the bud","cut corners","killed two birds with a stone","made a song and a dance"],"Idioms and Phrases"],
  [3,"Identify the segment which contains the grammatical error. I had to go to the doctor because I was not bear the pain in my tooth.",["had to go","in my tooth","to the doctor","was not bear"],"Error Detection"],
  [2,"Select the word which means the same as the group of words given. The fear of water",["claustrophobia","autophobia","hydrophobia","pyrophobia"],"One Word Substitution"],
  [1,"Choose the most appropriate option to change the narration. My boss said, 'Do you think you can complete the report within five days?'",["My boss said to me do you think I can complete the report within five days?","My boss asked me whether I thought I could complete the report within five days.","My boss said to me if I think I can complete the report within five days.","My boss says do you think you can complete the report within five days?"],"Direct Indirect Speech"],
  [2,"Identify the segment which contains the grammatical error. To write a poem I need a pen, a diary and also the quiet place.",["a diary","To write","and also the","I need"],"Error Detection"],
  [3,"Identify the best way to improve the underlined part. I think that capitalism is not a better economic system for our country.",["was not the good","is not better","no improvement","is not a good"],null],
  [0,"Choose the most appropriate option to change the voice. The play on environment issues was performed with great professionalism by our students.",["Our students performed the play on environment issues with great professionalism.","Our students were to perform with great professionalism the play on environment issue.","Our students have been performing the play on environment issues with great professionalism.","The play on environment issues was being performed with great professionalism by our students."],"Active Passive"],
  [0,"Choose the most appropriate option to change the narration. 'Don't overspeed at night,' I said to Irina.",["I warned Irina not to overspeed at night.","Over speeding at night is not good, I said to Irina.","I warn to Irina not to overspeed at night.","I had been warning Irina not to overspeed at night."],"Direct Indirect Speech"],
  [2,"Choose the most appropriate option to change the narration. My friend told me I could stay at his place in Dehradun whenever I wished.",["My friend said, 'You will be coming to stay at my place in Dehradun whenever you wish.'","My friend said, 'If you are wishing to come to Dehradun come and stay in my place.'","My friend said, 'You can stay at my place in Dehradun whenever you wish.'","My friend said, 'You will come and be staying in my place in Dehradun whenever you wish.'"],"Direct Indirect Speech"],
  [3,"Find a word that is the synonym of impoverished.",["spendthrift","generous","wealthy","penniless"],"Synonyms"],
  [0,"Identify the segment which contains the grammatical error. I don't like movies who has an unhappy ending.",["who has","I don't","like movies","an unhappy ending"],"Error Detection"],
  [1,"Find a word that is the synonym of Stoical.",["ruffled","apathetic","panicky","equivocal"],"Synonyms"],
  [3,"Choose the most appropriate option to change the voice. Our home was built in 1990 by my father.",["Our home was being built in 1990 by my father.","My father had built our home in 1990.","My father was building our home in 1990.","My father built our home in 1990."],"Active Passive"],
  [2,"Choose the most appropriate option to change the narration. Mary said, 'I have to be there by 10 am tomorrow.'",["Mary says to me that she has to be there by 10 am.","Mary tells me she has to be there by 10 am tomorrow.","Mary told me that she had to be there by 10 am the next day.","Mary is telling me that she has to be there by 10 am tomorrow."],"Direct Indirect Speech"],
  [0,"Identify the segment which contains the grammatical error. It takes me one hour to get to work in the morning in week day.",["in week day","in the morning","takes me","to get to work"],"Error Detection"],
  [0,"Identify the best way to improve the underlined part. It has been two years that I have see Meena.",["since I have seen","No improvement","since I didn't saw","that I saw"],null],

  // Cultural activities passage set (Q164-Q168)
  [0,"The probability of a child in United Kingdom getting opportunities to engage in cultural and sports activities depends on which factors?",["parental economic background and school funding","whether one parent is British and school funding","parental economic background and whether parents have university education","university education and school funding"],"Reading Comprehension","cgl2019eng_cultural"],
  [0,"According to the passage which of the following is NOT the correct reason for exposure to cultural activities and sports at a young age?",["brings about differences among children.","leads children to explore their talents.","builds team spirit and social skills.","helps in confidence building."],"Reading Comprehension","cgl2019eng_cultural"],
  [3,"Pick out a phrase or a word which means the same as 'a group of people considered to be superior to others because of their social standing'",["disadvantaged","cultural wallflowers","hard-wired","elitist"],"Reading Comprehension","cgl2019eng_cultural"],
  [2,"How will a wholesome education including arts and sports NOT benefit the disadvantaged?",["Children will get exposure to arts and sports.","Children will no longer have the fear of not fitting in.","Children will have feelings of low self-esteem and self-exclusion.","Children will explore play and learning outside of class."],"Reading Comprehension","cgl2019eng_cultural"],
  [3,"According to the author, what is truly heart-breaking and damaging for the kids is that -",["parents don't have money to pay for any additional classes.","teachers are told not to offer these opportunities.","schools wish to offer activities but don't have funds.","children themselves feel that the activities are not fit for the likes of them."],"Reading Comprehension","cgl2019eng_cultural"],

  // Standalone Q169-Q170
  [2,"Choose the most appropriate option to change the narration. Sumit said, 'I will be leaving for London this summer so I can meet you only when I return.'",["Sumit said he will be leaving for London this summer and he could meet him only when he returned.","Sumit said he will go to London this summer and he would meet me only when he will be returning.","Sumit said that he would be leaving for London that summer and he could meet me only when he returned.","Sumit said he will have gone to London that summer and could meet me only when he returned."],"Direct Indirect Speech"],
  [2,"Pick a word opposite in meaning to Lackadaisical.",["indifferent","jocular","enthusiastic","lukewarm"],"Antonyms"],
]};

// ============ IMPORT LOGIC ============
let added = 0, dupes = 0;
const existSet = new Set(
  bank.questions.map(q => q.question.trim().toLowerCase().substring(0, 50))
);

function importPaper(paper, subject) {
  let paperAdded = 0, paperDupes = 0;
  for (const entry of paper.questions) {
    const [a, q, o, topicOverride, setId] = entry;
    const topic = topicOverride || detectTopic(q) || 'English';
    const key = q.trim().toLowerCase().substring(0, 50);
    if (existSet.has(key)) { dupes++; paperDupes++; continue; }
    existSet.add(key);

    const qObj = {
      id: Date.now().toString() + '_' + Math.random().toString(36).slice(2, 9),
      type: 'question',
      examFamily: 'ssc',
      subject: subject,
      difficulty: 'medium',
      tier: 'tier2',
      questionMode: 'objective',
      topic: topic,
      question: q,
      options: o,
      answerIndex: a,
      explanation: '',
      marks: 2,
      negativeMarks: 0.5,
      isPYQ: true,
      year: paper.year,
      subtopic: null,
      source: {
        kind: 'cracku-extract',
        fileName: paper.name,
        importedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (setId) qObj.setId = setId;
    bank.questions.push(qObj);
    added++;
    paperAdded++;
  }
  console.log(`  ${paper.name}: ${paperAdded} added, ${paperDupes} dupes`);
}

importPaper(paper2022, 'english');
importPaper(paper2019, 'english');

bank.updatedAt = new Date().toISOString();
fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2));
console.log(`\nDone: ${added} added, ${dupes} duplicates skipped.`);
console.log(`Total questions in bank: ${bank.questions.length}`);
