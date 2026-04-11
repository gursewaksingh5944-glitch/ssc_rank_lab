const fs = require('fs');
const path = require('path');

const bankPath = path.join(__dirname, 'data', 'question-bank.json');
const data = JSON.parse(fs.readFileSync(bankPath, 'utf-8'));

// ============================================================
// SSC CGL ENGLISH PYQ IMPORT
// Paper 1: CGL 2020 Tier-II, 29 Jan 2022
// Paper 2: CGL 2021 Tier-II, 08 Aug 2022
// ============================================================

function uid() {
  return Date.now().toString() + '_' + Math.random().toString(36).slice(2, 9);
}

// Comprehension passages
const PASSAGE_CHILD = `The child is the father of man. Childhood is a (1)______ of what one is going to be when one (2)______ maturity. The natural instincts of a man are (3)______ in his childhood. Time modifies them but cannot (4)______ them. History contains numerous examples of great men who gave (5)______ of their future when they were children. A child's mind is (6)______ and flexible. The mould he receives before his clay (7)______ becomes his permanent mark. The values and standards of (8)______ which will determine his life as a man (9)______ in childhood itself. There may be certain (10)______ of course. A bright morning may end in a storm!`;

const PASSAGE_CORRUPTION = `In ancient times, Hieun Tsang, a Chinese traveller came to India during the (1)______ of King Harsha. He praised the Indians (2)______ 'people with pure moral principles'. In 2014, India (3)______ 85th in the corruption perception index of the Transparency International. What (4)______ downfall! Isn't it ironical that we Indians (5)______ by the ideals of honesty and integrity, self-denial and (6)______ but in practice willingly resort to the (7)______ forms of corruption to promote our interests? The (8)______ of corruption is eating into the (9)______ of our society and we have become helpless (10)______ of our own degradation.`;

const PASSAGE_PIANO = `A piano teacher described an interesting encounter she had had with a young lady who came to inquire about music lessons. The young lady asked her, "How long will this course take? My father tells me that it is in fashion now to be able to play musical instruments and that I should learn one quickly. I want something that will be quick, fast and easy like, like…." When the amused teacher explained that it would take a lifetime of meticulous practice to learn music, her face fell and, needless to say, she never came back.

The single most important factor that distinguishes those of us who succeed in any venture and those of us who don't is this 'instant coffee' attitude. Most of us want results quickly. We want to reach the top immediately and get worked up when things go wrong. Perseverance and patience are forgotten words. We get upset, frustrated, and angry when a skill or activity requires us to put in a lot of effort and time. We get dejected and want to give it up.

But such thinking serves no good. For, it doesn't solve the problem. Life is tough for those with an 'instant coffee' attitude.

Success, real success and happiness come to those who have a 'bread-making' attitude — those who are willing to knead the dough, wait for hours for it to rise, only to punch it down and knead some more, wait for another couple of hours for it to rise again, and then bake it before it is ready to be eaten. Nothing is instantaneous. For every endeavour – whether in the area of career, academics, music, sports, relationships, physical fitness or even in spirituality – it is a long, arduous journey.

Only if we are willing to put in the time, painstaking effort and have faith, can we get results. If we don't accept this difficult-but-true fact of life, our lives will be far from being happy and fulfilling. For we may not make that extra effort which can change the course of life dramatically, for the good.

The major problems with these 'instant coffee' solutions are that they are invariably short-lived. If we stubbornly refuse to give up this search for quick solutions, all we do is end up on the wrong track.`;

const PASSAGE_NATURE = `Nature has been suffering mutely for hundreds of years but the problem did not (1)______ serious proportions so long as the damage was (2)______ and not beyond self-repair. These limits were crossed with (3)______ technological breakthroughs accomplished during the recent years. The developed nations (4)______ benefitted most from these were the first to (5)______ the environmental diseases bred by advanced technology.`;

const PASSAGE_NOISE = `Although pollution of land, sea, and air has been well documented, the latest and the least recognised version is the swelling tide of noise which is engulfing urban as well as rural areas. This has long-term implications on the ecology, health and productivity of a fast developing country like India.

Unlike other pollutants, noise lacks visibility, seldom registering on the consciousness, except as a trifling irritant to be dismissed at will and therefore less likely to be perceived as a threat. Available data indicates that noise does pose a threat to health and is known to have caused a number of complications. Declining productivity among workers in certain industries has been directly correlated with noise levels, particularly those under constant exposure to the menace.

The first-ever survey of the impact of noise on health, conducted by All India Institute of Medical Sciences (AIIMS), has established that noise not only impairs the physical and psychological functioning of the human organism but also causes nausea, vomiting, pain, hypertension and a lot of other complications, including cardio-vascular complaints.

A study by Post Graduate School of Basic Medical Sciences, Chennai, confirms such conclusions. In 50 per cent of industries, it was found that workmen exposed to higher intensities of noise in occupational capacities were often irritated, short-tempered, and impatient and more likely to resort to agitation and disrupt production. This was true of units in heavy industrial pockets in and around the four metropolitan centres.

Recreational noise, another ugly facet, is becoming more widespread in cities and towns. Loudspeakers are turned at full volume during marriages, festivals, jagrans, musical programmes, particularly at night, without the least consideration for others. Even at 50 dB, sound can awaken a person from a deep slumber. As experiments have shown, loudspeakers with output from 60 to 80 dB cause the pupils of a slumbering person to dilate, with increasing intake of oxygen, resulting in palpitation. The effect is more pronounced in narrow lanes. TV sets are played at full volume at prime time, invariably disturbing neighbours. Noise making seems to have become the latest status symbol, be it an election campaign or slogan shouting or advertising ownership of a TV set.`;

const PASSAGE_PUPPET = `In the stress-ridden world, traditional pastimes that could prove therapeutic are dying for want of patronage. One such is the art of puppetry. The word "puppet" is derived from the Latin word pupa, meaning "doll" or "girl". Puppets came into being in India in the third century A.D. Here it was honed into a theatrical art. It helped to propagate the works of saints and religious leaders, and also depict stories from epics. Later, it spread to South East Asia. The Cambodian puppeteers inspired the Thais. Java and Bali followed though it didn't catch on in Sumatra. The Malays followed the Siamese and Japanese styles in the nineteenth century.

Gradually, puppets became more sophisticated in appearance, as skilled craftsmen began to make the models. Puppeteers became trained as performers. In the eighteenth and nineteenth centuries, puppet theatres became extremely popular in artistic circles. Writers like George Sands and Goethe organised their own well-prepared puppet shows to entertain their friends. Puppet shows have been mentioned in the literature by Shakespeare, Ben Johnson, and many others.

Basically, there are three kinds of puppets. Shadow puppets are made of translucent leather and coloured vegetable dyes. Buffalo, goat, or sheep skin is treated to become translucent. Limbs are loosely-jointed so that they can be made to move separately. A stick is attached vertically in the middle. Movement of the stick causes general movements. But for special movements, single strings attached to the limbs are used. These leather puppets are projected on a screen, which is illuminated by a light source placed behind the puppets. The puppeteer manipulates the puppets to form moving shadows on the screen. He also speaks the parts, sings, or is accompanied by music.

String puppets involve puppets that are manipulated by six strings. The performance is on a stage but the puppeteers are never seen. They wear anklets which produce the illusion that the puppets themselves are dancing. The main storyteller recites the storyline, while the puppets perform, and the dialogue and music are provided by the puppeteers.

Rod or stick puppets are constructed around the main central rod. A short horizontal bar serves as the shoulders, from which the upper limbs dangle. The arms, made of cloth and stuffed with straw or paper, are jointed or manipulated with other thinner rods. These puppets can be the size of a human being. The puppeteer hides behind the puppet and manipulates it. The coordination of the limbs comes only through practice.

Puppetry is a good communication medium. Messages can be propagated in a realistic way. Puppet making and performing is good occupational therapy for convalescents and physically disabled people. Muscular coordination and manual dexterity improve with effort. However, the best use of this art is that it can provide delightful hours of fun to young and old alike.`;

const PASSAGE_BLIND = `You go up a dark, rickety stairwell of a building on a crowded street in Calcutta. You enter a small room. The centre of the room is empty but the corners are stacked with bedrolls, utensils and water bottles. Musical instruments, drums, cymbals and gongs are piled in a corner. Today, the room is filled with the laughter of men and women in colourful attire. Among the happy chorus of congratulations and laughter, the bride Chumki Pal and the groom Sandeep can be seen smiling. They are both blind, as are most of the people surrounding them. Pal is wearing a bright turquoise blue sari. "I know it's blue because people have told me but I can't imagine how it looks. But believe me, when I dream, I dream only in colours," she says. Their romance blossomed when they met as members of Blind Opera, the only one of its kind in the country as well as in Asia.

The 36 spirited members of Blind Opera demonstrate that physical disability is not an obstacle. They enact plays by Rabindranath Tagore, considered challenging even by veteran theatre groups. Blind Opera was launched in 1996 by four theatre aficionados, who took it as a challenge to get together the talents of these visually impaired people. The challenge to present the cast on stage is immense since space management is a problem. To solve this, the directors use ropes to separate the stage and the wings. When the actors step on the rope they know that it is the entrance to the stage. The members cannot see, but they can smell, hear and touch – three elements inherent to any theatre. At Blind Opera, they "believe that the blind can see. That is, they see in their own way, if not in our way, with the help of these abilities."

For the visually impaired, theatre is the medium for expression of their creative urges. They respond instinctively; they cannot copy anyone else because they cannot see. Their body language tells the story and hence it is very spontaneous. The members have earned kudos from Calcutta audiences. For the members of the troupe, discovering the language of the body is in a way also a journey of the persona. Coming from diverse backgrounds but bound together by the same disability, they have found an outlet for their creativity through the plays. They do not feel isolated anymore because they can relate to their fellow performers.

There is also a greater purpose behind it: to use theatre to build a community and mainstream the huge number of disabled living in isolation. Together they can be a force to demand better facilities in public life. Blind children should enter the mainstream from the beginning. The big dream of the group is to establish a drama school following the ideal of Tagore's Shantiniketan, offering a platform for creative expression to all those who are economically and socially forced to stay in the periphery. Like Chumki Pal, they all dream in colour.`;

// Paper 2 passages
const PASSAGE_VOLCANO = `A new and extreme tourist attraction has just exploded on to the scene in Iceland: Volcano Walking. It would appear, according to Trip Advisor, that this is one trip that cannot be missed, despite the extortionate cost.

The idea of making Thrihnukagigur volcano accessible was the brainchild of Ami B. Stefansson, a doctor in Reykjavik and a lifelong cave enthusiast. He has been studying caves in Iceland since 1954 and some would argue that there is no-one who has more experience. Thrihnukagigur has always been special to Stefansson ever since he was the first to descend down to the crater base in 1974. Like most people who experience it, he was utterly spellbound by its uniqueness and beauty and made it his mission to protect and preserve this stunning natural phenomenon. Unlike others who may have only seen the profit that could be made from walking into the mouth of a volcano, Stefansson believed that the primary focus was to treat such a grand natural wonder with the utmost respect, to protect and defend it. The first 'volcano tourists' entered the volcano in 2005 and it has since been labelled as one of the most unique tourist attractions in the world.

Volcano walkers are taken to the mouth of the crater from where they are lowered in a basket into the depths of the earth. People once thought that volcanoes were portals to Hell and associated with death and destruction and yet the entrance to the crater is awe-inspiring and almost ethereal. The vastness of it can feel overwhelming; it is the size of a cathedral and the Statue of Liberty could easily fit into the shaft. After 6 minutes and 120 metres, visitors arrive at the crater base. The ground space is the size of three full-sized basketball courts placed next to each other.

At the bottom there is a reverent hush. People whisper in respect to the sleeping giant who has lain dormant for 4,000 years. The subterranean walls are scorched with colours from a divine palette: magenta red, vibrant purple, burnt orange, vivid green and honey yellow. The colour intensifies in certain places where 4000 years ago the magma was pushed out with brutal force. This is Mother Nature's secret place, her private art studio where visitors feel like trespassers. The protruding rock faces show a tapestry of patterns and formations that have been molded by heat, pressure and time. Floodlights illuminate the walls and draw attention to the beauty humans were never intended to see. A light rain weeps from the porous rock above and covers the crater sides with a shine that makes it sparkle. The scorch marks can be seen close up – at one point in time these rock faces were glowing red with fiery heat. This giant, although sleeping, is still dangerous: an 80-metre drop into the void is disguised by a collection of rocks close to where visitors stand.

It is a soul-enriching experience and visitors often report feeling deeply moved by the beauty and tranquillity of something that was once so destructive and angry. Confronted with this result of the unrestrained forces of nature, it is hard not to feel small and powerless in comparison. Sadly, the magical spell is broken when the basket appears, indicating that it is time for visitors to return to reality. On the return hike, visitors walk across the lava fields as though they are astronauts on the moon. They pass enormous open wounds where the landscape is literally tearing itself apart as tectonic plates slowly shift. It serves as one final reminder that this giant is merely dormant, not dead.`;

const PASSAGE_STOMACH = `The working of the stomach was 1.______ by a strange accident. In 1822, a man named Alexis St. Martin was 2.______ hit by a shot gun. The bullet had seriously 3.______ the chest wall and made a hole in 4.______ stomach. He was brought to an American army 5.______ William Beaumont.

The doctor saved the patient but he 6.______ not close the hole properly. Beaumont took it as a 7.______ opportunity to see the inside of the stomach 8.______ the hole. He made some wonderful observations. Beaumont 9.______ that the stomach was churning food. Its wall secreted a fluid 10.______ could digest the food. He also observed that the end of the stomach opens into the intestine only after the digestion of the food inside the stomach is completed.`;

const PASSAGE_GREENHOUSE = `Human activities are changing Earth's natural greenhouse 1.______. Burning fossil fuels like coal and oil puts 2.______ carbon dioxide into our atmosphere. NASA has 3.______ increase in the amount of carbon dioxide and some other greenhouse gases in 4.______ atmosphere. Too much of these greenhouse gases can 5.______ Earth's atmosphere to trap more and more heat. This causes Earth to warm up.`;

const PASSAGE_REFUGEES = `At the end of 2020, there were 82.4 million forcibly displaced people in the world, of which more than a quarter are refugees.

"By the end of 2020, the number of people forcibly displaced due to persecution, conflict, violence, human rights violations, and events seriously disturbing public order, had grown to 82.4 million, the highest number on record according to available data," according to the UN High Commissioner for Refugees (UNHCR). Out of these 82.4 million forcibly displaced people in the world, more than a quarter are refugees.

Just five countries produce 68% of all refugees displaced abroad: the Syrian Arab Republic, Venezuela, Afghanistan, South Sudan, and Myanmar.

The top five host countries, where these displaced people are currently located are: Turkey, Colombia, Germany, Pakistan, and Uganda.

With 3.7 million displaced people now within its borders, Turkey hosts twice as many refugees as Colombia, the next highest host country, with 1.7 million people. The situation in Turkey illustrates the effects of proximity, as 92% of its refugees have come from neighbouring Syria, where war and armed conflict have now been raging for more than 10 years. It demonstrates that huge numbers of displaced people stay close to their point of origin.

There are more than 48 million internally displaced people – people who have had to flee their homes in search of safety elsewhere within their home nation.

The highest increases in the number of internally displaced people happened in Africa and were provoked by a combination of armed conflict and humanitarian disasters. Civil war in Ethiopia, Africa's second most-populated country, has sparked a wave of displacement in a region that was already facing what the UNHCR calls "a full-scale humanitarian crisis."

All in all, more than a million Ethiopian people had to leave their homes behind last year, the UNHCR says.`;

const PASSAGE_SAVANNA = `The savanna landscape is typified by tall grass and short trees. It is rather misleading to call the savanna 'tropical grassland', because trees are always present with the luxuriant tall grass. The terms 'parkland' or 'bush-veld' perhaps describe the landscape better.

Trees grow best towards the equatorial humid latitudes or along river banks but decrease in height and density away from the equator. They occur in clumps or as scattered individuals. The trees are deciduous, shedding their leaves in the cool, dry season to prevent excessive loss of water through transpiration, e.g. acacias. Others have broad trunks, with water-storing devices to survive through the prolonged drought such as baobabs and bottle trees. Trees are mostly hard, gnarled and thorny and may exude gum like gum arable. Many trees are umbrella shaped, exposing only a narrow edge to the strong winds.

Palms which cannot withstand the drought are confined to the wettest areas or along rivers. Vegetative luxuriance reaches its peak in the rainy season, when trees renew their foliage and flower. In true savanna lands, the grass is tall and coarse, growing 6 to 12 feet high. The elephant grass may attain a height of even 15 feet! The grass tends to grow in compact tufts and has long roots which reach down in search of water. It appears greenish and well-nourished in the rainy season but turns yellow and dies down in the dry season that follows. The grass lies dormant throughout the long, rainless period and springs up again in the next rainy season.

In between the tall grass are scattered short trees and low bushes. As the rainfall diminishes towards the deserts the savanna merges into thorny scrub. In Australia, this scrubland is particularly well represented by a number of species: mallee, mulga, spinifex grass and other bushes.

The savanna, particularly in Africa, is the home of wild animals. It is known as the 'big game country' and thousands of animals are trapped or killed each year by people from all over the world. Some of the animals are tracked down for their skins, horns, tusks, bones or hair, others are captured alive and sent out of Africa as zoo animals, laboratory specimens or pets. There is such a wealth of animal life in Africa that many of the animal films that we see at the cinema are actually taken in the savanna. There are, in fact, two main groups of animals in the savanna, the grass-eating herbivorous animals and the flesh-eating carnivorous animals. The herbivorous animals are often very alert and move swiftly from place to place in search of green pastures.

They are endowed with great speed to run away from the savage flesh-eaters that are always after them. The leaf and grass-eating animals include the zebra, antelope, giraffe, deer, gazelle, elephant and okapi.

Many are well camouflaged species and their presence amongst the tall greenish-brown grass cannot be easily detected. The giraffe with such a long neck can locate its enemies a great distance away, while the elephant is so huge and strong that few animals will venture to come near it. It is well equipped with tusks and trunk for defence.

The carnivorous animals like the lion, tiger, leopard, hyena, panther, jaguar, jackal, lynx and puina have powerful jaws and teeth for attacking other animals. Their natural colorings of light yellowish-brown, often with stripes like the tiger or spots like the leopard, match perfectly with the tawny background of the savanna. They often hide themselves in shady spots up in the branches or amidst the tall bushes, and many wild animals, as well as hunters themselves, are caught unawares in this manner.`;

const PASSAGE_BIGCAT = `Over the past year, Dr Hemmings has been conducting research on the big cat phenomenon and has already 1.________the remains of some wild animals that may have been eaten by 2._______ far larger than any of the country's known carnivores. The project has 3._________an analysis of twenty skeletal animal remains 4.________ from across Gloucestershire and other nearby counties. The bones were selected because the 5.___________of their death led people to believe that these animals may have been killed by a big cat.`;

const PASSAGE_TWINS = `In August every year, thousands of twins descend on a town in Ohio called Twinsburg, named by identical twin brothers 1.________two centuries ago. The Twins Days Festival is a three-day 2.________consisting of talent shows and look-alike 3.___________that has become one of the world's 4._____________ gatherings of twins. There have been 5.___________ festivals in Nigeria, a country where 1 in 22 births to the Yoruba people 6.__________twins, identical or fraternal, which is a much higher 7.__________than anywhere else in the world. This has been 8.___________to the eating of yams, but the theory is 9._____________. Biomedical researchers attend these events, regarding them as a 10._______________ opportunity to conduct surveys and experiments.`;

const PASSAGE_POPULATION = `New Delhi — India is set to surpass China as the world's most populous country in 2023, with each counting more than 1.4 billion residents this year, a United Nations report said on Monday, warning that high fertility would challenge economic growth.

The world's population, estimated to reach 8 billion by November 15 this year, could grow to 8.5 billion in 2030, and 10.4 billion in 2100, as the pace of mortality slows, said the report released on World Population Day.

India's population was 1.21 billion in 2011, according to the domestic census, which is conducted once a decade. The government had deferred the 2021 census due to the Covid-19 pandemic.

The world's population was growing at its slowest pace since 1950, having fallen below 1% in 2020, UN estimates showed.

In 2021, the average fertility of the world's population stood at 2.3 births per woman over a lifetime, having fallen from about 5 births in 1950. Global fertility is projected to decline further to 2.1 births per woman by 2050.

Referring to an earlier World Health Organization report — estimating about 14.9 million deaths relating to the Covid-19 pandemic between January 2020 and December 2021, the UN report said global life expectancy at birth fell to 71 years in 2021 from 72.8 years in 2019, mostly due to the pandemic.

The United Nations said more than half of the projected increase in the global population up to 2050 will be concentrated in eight countries — Democratic Republic of Congo, Egypt, Ethiopia, India, Nigeria, Pakistan, the Philippines and Tanzania.

Countries of sub-Saharan Africa are expected to contribute more than half of the increase anticipated through 2050.

However, the population of 61 countries is projected to decrease by 1% or more between 2022 and 2050, driven by a fall in fertility.`;


// Helper to build a comprehension question
function compQ(passage, passageTitle, q, opts, ansIdx, topic, exam, year, qid) {
  return {
    question: q,
    options: opts,
    answerIndex: ansIdx,
    topic: topic,
    passage: passage,
    passageTitle: passageTitle,
    exam: exam,
    year: year,
    qid: qid
  };
}

// ============================================================
// PAPER 1: SSC CGL 2020 Tier-II, 29 Jan 2022
// ============================================================
const paper1Exam = "SSC CGL 2020 Tier-II";
const paper1Year = 2022;

const paper1 = [
  // === Comprehension Set 1: "The child is the father of man" (Q1-10) ===
  compQ(PASSAGE_CHILD, "The child is the father of man", "Select the most appropriate option to fill in blank no.1.", ["promise", "bond", "contract", "plight"], 0, "Reading Comprehension", paper1Exam, paper1Year, "65497837776"),
  compQ(PASSAGE_CHILD, "The child is the father of man", "Select the most appropriate option to fill in blank no.2.", ["scores", "secures", "completes", "attains"], 3, "Reading Comprehension", paper1Exam, paper1Year, "65497837777"),
  compQ(PASSAGE_CHILD, "The child is the father of man", "Select the most appropriate option to fill in blank no.3.", ["contributed", "disposed", "determined", "distributed"], 2, "Reading Comprehension", paper1Exam, paper1Year, "65497837778"),
  compQ(PASSAGE_CHILD, "The child is the father of man", "Select the most appropriate option to fill in blank no.4.", ["delete", "efface", "cancel", "finish"], 1, "Reading Comprehension", paper1Exam, paper1Year, "65497837779"),
  compQ(PASSAGE_CHILD, "The child is the father of man", "Select the most appropriate option to fill in blank no.5.", ["suggestions", "indications", "preparations", "estimations"], 1, "Reading Comprehension", paper1Exam, paper1Year, "65497837780"),
  compQ(PASSAGE_CHILD, "The child is the father of man", "Select the most appropriate option to fill in blank no.6.", ["impressionable", "rigid", "sensible", "obstinate"], 0, "Reading Comprehension", paper1Exam, paper1Year, "65497837781"),
  compQ(PASSAGE_CHILD, "The child is the father of man", "Select the most appropriate option to fill in blank no.7.", ["contracts", "precipitates", "refines", "hardens"], 3, "Reading Comprehension", paper1Exam, paper1Year, "65497837782"),
  compQ(PASSAGE_CHILD, "The child is the father of man", "Select the most appropriate option to fill in blank no.8.", ["tactics", "conduct", "attitude", "manipulation"], 1, "Reading Comprehension", paper1Exam, paper1Year, "65497837783"),
  compQ(PASSAGE_CHILD, "The child is the father of man", "Select the most appropriate option to fill in blank no.9.", ["is developing", "has developed", "are developed", "develops"], 2, "Reading Comprehension", paper1Exam, paper1Year, "65497837784"),
  compQ(PASSAGE_CHILD, "The child is the father of man", "Select the most appropriate option to fill in blank no.10.", ["concessions", "exemptions", "exceptions", "rejections"], 2, "Reading Comprehension", paper1Exam, paper1Year, "65497837785"),

  // === Comprehension Set 2: Hieun Tsang / Corruption (Q11-20) ===
  compQ(PASSAGE_CORRUPTION, "Hieun Tsang and corruption in India", "Select the most appropriate option to fill in blank no.1.", ["vigour", "authority", "command", "reign"], 3, "Reading Comprehension", paper1Exam, paper1Year, "65497837787"),
  compQ(PASSAGE_CORRUPTION, "Hieun Tsang and corruption in India", "Select the most appropriate option to fill in blank no.2.", ["by", "like", "such", "as"], 3, "Reading Comprehension", paper1Exam, paper1Year, "65497837788"),
  compQ(PASSAGE_CORRUPTION, "Hieun Tsang and corruption in India", "Select the most appropriate option to fill in blank no.3.", ["ranked", "graded", "stacked", "piled"], 0, "Reading Comprehension", paper1Exam, paper1Year, "65497837789"),
  compQ(PASSAGE_CORRUPTION, "Hieun Tsang and corruption in India", "Select the most appropriate option to fill in blank no.4.", ["the", "any", "some", "a"], 3, "Reading Comprehension", paper1Exam, paper1Year, "65497837790"),
  compQ(PASSAGE_CORRUPTION, "Hieun Tsang and corruption in India", "Select the most appropriate option to fill in blank no.5.", ["declare", "assert", "swear", "affirm"], 2, "Reading Comprehension", paper1Exam, paper1Year, "65497837791"),
  compQ(PASSAGE_CORRUPTION, "Hieun Tsang and corruption in India", "Select the most appropriate option to fill in blank no.6.", ["prejudice", "omission", "erosion", "sacrifice"], 3, "Reading Comprehension", paper1Exam, paper1Year, "65497837792"),
  compQ(PASSAGE_CORRUPTION, "Hieun Tsang and corruption in India", "Select the most appropriate option to fill in blank no.7.", ["vilest", "vile", "viler", "more vile"], 0, "Reading Comprehension", paper1Exam, paper1Year, "65497837793"),
  compQ(PASSAGE_CORRUPTION, "Hieun Tsang and corruption in India", "Select the most appropriate option to fill in blank no.8.", ["malaise", "despair", "deficiency", "melancholy"], 0, "Reading Comprehension", paper1Exam, paper1Year, "65497837794"),
  compQ(PASSAGE_CORRUPTION, "Hieun Tsang and corruption in India", "Select the most appropriate option to fill in blank no.9.", ["vitals", "threats", "imperative", "necessity"], 0, "Reading Comprehension", paper1Exam, paper1Year, "65497837795"),
  compQ(PASSAGE_CORRUPTION, "Hieun Tsang and corruption in India", "Select the most appropriate option to fill in blank no.10.", ["performers", "sorcerers", "onlookers", "visionaries"], 2, "Reading Comprehension", paper1Exam, paper1Year, "65497837796"),

  // === Comprehension Set 3: Piano / Instant Coffee (Q21-25) ===
  compQ(PASSAGE_PIANO, "Instant coffee attitude vs bread-making attitude", "When an activity requires too much effort we feel:", ["fulfilled", "frustrated", "inspired", "happy"], 1, "Reading Comprehension", paper1Exam, paper1Year, "65497837826"),
  compQ(PASSAGE_PIANO, "Instant coffee attitude vs bread-making attitude", "What kind of attitude does the writer advocate for a life of fulfilment?", ["One of instant gratification", "One of perseverance and patience", "One of anger and dejection", "One of stubbornness and refusal"], 1, "Reading Comprehension", paper1Exam, paper1Year, "65497837830"),
  compQ(PASSAGE_PIANO, "Instant coffee attitude vs bread-making attitude", "Why did the young lady approach the piano teacher for music lessons?", ["It was considered fashionable to be able to play musical instruments.", "The piano teacher was highly accomplished.", "She was a music lover and was keen to take lessons.", "She was willing to practise hard to become a successful piano player."], 0, "Reading Comprehension", paper1Exam, paper1Year, "65497837827"),
  compQ(PASSAGE_PIANO, "Instant coffee attitude vs bread-making attitude", "What does 'bread making' attitude consist of?", ["Talent and skill", "Futile labour", "Painstaking efforts", "Instantaneous results"], 2, "Reading Comprehension", paper1Exam, paper1Year, "65497837829"),
  compQ(PASSAGE_PIANO, "Instant coffee attitude vs bread-making attitude", "What do you understand by the term 'instant coffee attitude'?", ["Expecting quick results", "Short-lived pleasure", "Passion to learn something", "Keeping up with the latest trends"], 0, "Reading Comprehension", paper1Exam, paper1Year, "65497837828"),

  // === Comprehension Set 4: Nature / Environment (Q26-30) ===
  compQ(PASSAGE_NATURE, "Nature and environmental damage", "Select the most appropriate option to fill in blank no.1.", ["assume", "grasp", "receive", "become"], 0, "Reading Comprehension", paper1Exam, paper1Year, "65497837798"),
  compQ(PASSAGE_NATURE, "Nature and environmental damage", "Select the most appropriate option to fill in blank no.2.", ["attainable", "countable", "credible", "containable"], 3, "Reading Comprehension", paper1Exam, paper1Year, "65497837799"),
  compQ(PASSAGE_NATURE, "Nature and environmental damage", "Select the most appropriate option to fill in blank no.3.", ["commonplace", "spectacular", "paltry", "habitual"], 1, "Reading Comprehension", paper1Exam, paper1Year, "65497837800"),
  compQ(PASSAGE_NATURE, "Nature and environmental damage", "Select the most appropriate option to fill in blank no.4.", ["who", "whose", "which", "whom"], 2, "Reading Comprehension", paper1Exam, paper1Year, "65497837801"),
  compQ(PASSAGE_NATURE, "Nature and environmental damage", "Select the most appropriate option to fill in blank no.5.", ["undergo", "encounter", "interact", "derive"], 1, "Reading Comprehension", paper1Exam, paper1Year, "65497837802"),

  // === Comprehension Set 5: Noise Pollution (Q31-35) ===
  compQ(PASSAGE_NOISE, "Noise pollution", "Which of the following statements is FALSE?", ["There is a direct correlation between productivity of workers and noise.", "Noise pollution is not visible to the eyes.", "Loudspeakers with low decibel sound can cause palpitations.", "Several studies have been conducted on air, water and land pollution."], 2, "Reading Comprehension", paper1Exam, paper1Year, "65497837836"),
  compQ(PASSAGE_NOISE, "Noise pollution", "Recreational noise is created during:", ["discord between agitated workers", "shouting of slogans", "weddings and festivals", "running of heavy machinery"], 2, "Reading Comprehension", paper1Exam, paper1Year, "65497837834"),
  compQ(PASSAGE_NOISE, "Noise pollution", "In what way does noise become a status symbol?", ["Showing off the loud volume of one's TV", "Exposing workmen to high intensity sounds", "Awakening people from deep sleep", "Conducting late night musical shows"], 0, "Reading Comprehension", paper1Exam, paper1Year, "65497837835"),
  compQ(PASSAGE_NOISE, "Noise pollution", "Noise can be differentiated from other pollutants because:", ["it does not impact the productivity of the workers in industries", "it is not detrimental to our health in any way", "it is prevalent only in the urban areas of the country", "it is regarded as a small irritant which may be easily dismissed"], 3, "Reading Comprehension", paper1Exam, paper1Year, "65497837833"),
  compQ(PASSAGE_NOISE, "Noise pollution", "According to a survey conducted by AIIMS, noise does NOT cause:", ["nausea and vomiting", "eye infections", "heart related complaints", "hypertension"], 1, "Reading Comprehension", paper1Exam, paper1Year, "65497837832"),

  // === Comprehension Set 6: Puppetry (Q36-45) ===
  compQ(PASSAGE_PUPPET, "The art of puppetry", "The above passage is:", ["narrative", "didactic", "factual", "literary"], 2, "Reading Comprehension", paper1Exam, paper1Year, "65497837812"),
  compQ(PASSAGE_PUPPET, "The art of puppetry", "The word puppet is derived from the Latin word:", ["pupa", "rod", "girl", "doll"], 0, "Reading Comprehension", paper1Exam, paper1Year, "65497837804"),
  compQ(PASSAGE_PUPPET, "The art of puppetry", "A light source is placed behind the shadow puppets so that:", ["they are clearly visible in bright light", "the puppeteer is hidden from view", "moving shadows can be created on the screen", "the puppets can illuminate the screen"], 2, "Reading Comprehension", paper1Exam, paper1Year, "65497837808"),
  compQ(PASSAGE_PUPPET, "The art of puppetry", "Which of the following statements about string puppets is FALSE?", ["Puppets wear anklets while dancing.", "The show is performed on a stage.", "Six strings are used to manipulate puppets.", "The main storyteller narrates the story."], 0, "Reading Comprehension", paper1Exam, paper1Year, "65497837809"),
  compQ(PASSAGE_PUPPET, "The art of puppetry", "Which of the following is NOT a benefit of the art of puppetry?", ["It is a good therapy for physically challenged people.", "It is entertaining for people of all ages.", "A puppeteer is required to manipulate the puppets.", "Messages can be propagated in a realistic manner."], 2, "Reading Comprehension", paper1Exam, paper1Year, "65497837811"),
  compQ(PASSAGE_PUPPET, "The art of puppetry", "Traditional ways of recreation, such as puppetry, are dying because:", ["the performances are no longer interesting", "the performers lack skill and training", "they do not get the support of patrons", "they do not provide relaxation from stress"], 2, "Reading Comprehension", paper1Exam, paper1Year, "65497837813"),
  compQ(PASSAGE_PUPPET, "The art of puppetry", "Where did the art of puppetry first come into being?", ["India", "Cambodia", "Bali", "Japan"], 0, "Reading Comprehension", paper1Exam, paper1Year, "65497837805"),
  compQ(PASSAGE_PUPPET, "The art of puppetry", "Which of the following statements testifies that puppetry was popular in artistic circles?", ["People spent a huge sum of money to see puppet shows.", "Puppetry finds a mention in literature.", "Puppets became more sophisticated in appearance.", "Puppeteers were trained to give performances."], 1, "Reading Comprehension", paper1Exam, paper1Year, "65497837810"),
  compQ(PASSAGE_PUPPET, "The art of puppetry", "The upper limbs of stick puppets are made of:", ["straw", "paper", "cloth", "leather"], 2, "Reading Comprehension", paper1Exam, paper1Year, "65497837806"),
  compQ(PASSAGE_PUPPET, "The art of puppetry", "Limbs of the puppets are loosely-jointed:", ["to create the illusion of dancing", "to make the movements aesthetic", "to allow movement of limbs separately", "to move the entire body of the puppet"], 2, "Reading Comprehension", paper1Exam, paper1Year, "65497837807"),

  // === Comprehension Set 7: Blind Opera (Q46-55) ===
  compQ(PASSAGE_BLIND, "Blind Opera", "Which of the following statements is FALSE?", ["Calcutta audiences have lauded Blind Opera.", "Blind Opera is one of its kind in the world.", "The blind can see in their own way.", "Blind Opera was launched in 1996."], 1, "Reading Comprehension", paper1Exam, paper1Year, "65497837821"),
  compQ(PASSAGE_BLIND, "Blind Opera", "What is the biggest problem in presenting the troupe on stage?", ["Space management", "Communication", "Spontaneity", "Time management"], 0, "Reading Comprehension", paper1Exam, paper1Year, "65497837819"),
  compQ(PASSAGE_BLIND, "Blind Opera", "How do the actors of Blind Opera ascertain they are on stage?", ["By the ropes used to demarcate the area", "By their familiarity with the stage", "By the cheering of the audience", "By their sense of smell and touch"], 0, "Reading Comprehension", paper1Exam, paper1Year, "65497837818"),
  compQ(PASSAGE_BLIND, "Blind Opera", "The visually impaired do NOT feel secluded in the Blind Opera group because they can:", ["relate to their fellow performers", "express their creativity freely", "become economically independent", "play musical instruments together"], 0, "Reading Comprehension", paper1Exam, paper1Year, "65497837823"),
  compQ(PASSAGE_BLIND, "Blind Opera", "Which of the following statements contradicts the writer's view?", ["The actors of Blind Opera imitate others easily.", "The blind dream in colour despite their disability.", "Blind children should enter the mainstream from the beginning.", "As a united community, the disabled can demand better facilities."], 0, "Reading Comprehension", paper1Exam, paper1Year, "65497837824"),
  compQ(PASSAGE_BLIND, "Blind Opera", "Which of the following is NOT a key element inherent to any theatre?", ["Sense of hearing", "Sense of taste", "Sense of smell", "Sense of touch"], 1, "Reading Comprehension", paper1Exam, paper1Year, "65497837816"),
  compQ(PASSAGE_BLIND, "Blind Opera", "What is the binding factor for the members of Blind Opera?", ["Their love for plays of Tagore", "Visual impairment", "Their diverse backgrounds", "Their talent for acting"], 1, "Reading Comprehension", paper1Exam, paper1Year, "65497837820"),
  compQ(PASSAGE_BLIND, "Blind Opera", "What is the happy occasion mentioned in the beginning of the passage?", ["A musical show", "A birthday", "A laughter show", "A wedding"], 3, "Reading Comprehension", paper1Exam, paper1Year, "65497837815"),
  compQ(PASSAGE_BLIND, "Blind Opera", "The greater intent behind Blind Opera is to:", ["establish a drama school on the lines of Shantiniketan", "bring the disabled into the mainstream", "showcase the talent of the visually challenged", "popularise the plays of Rabindranath Tagore"], 1, "Reading Comprehension", paper1Exam, paper1Year, "65497837822"),
  compQ(PASSAGE_BLIND, "Blind Opera", "The members of Blind Opera demonstrate that:", ["blindness is a great hindrance", "physical disability is not an obstacle", "their talent cannot be tapped", "the visually challenged lack expression"], 1, "Reading Comprehension", paper1Exam, paper1Year, "65497837817"),

  // === Standalone Questions (Q56-200) ===
  // Q56 - Sentence Rearrangement
  {question: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order to form a meaningful and coherent paragraph.\nA. She hugged my mom and almost screamed when she saw me.\nB. It was a long ride before we finally reached.\nC. A plump, over excited woman greeted us at the door.\nD. Apparently, she had seen me as a baby and behaved as if she didn't expect me to grow up!", options: ["DACB", "CABD", "BCAD", "ADBC"], answerIndex: 2, topic: "Sentence Rearrangement", exam: paper1Exam, year: paper1Year, qid: "65497837939"},
  // Q57 - Error Detection
  {question: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\nHis son-in-laws / have enhanced / his business / within a short period.", options: ["His son-in-laws", "his business", "within a short period", "have enhanced"], answerIndex: 0, topic: "Error Detection", exam: paper1Exam, year: paper1Year, qid: "65497837846"},
  // Q58 - Antonyms
  {question: "Select the most appropriate ANTONYM of the given word.\nIndigenous", options: ["Alien", "Primitive", "Natural", "Innate"], answerIndex: 0, topic: "Antonyms", exam: paper1Exam, year: paper1Year, qid: "65497837956"},
  // Q59 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in reported speech.\nThe captain announced, \"The flight will be delayed due to bad weather.\"", options: ["The captain announced that the flight would be delay due to bad weather.", "The captain announced that the flight would be delayed due to bad weather.", "The captain announced that the fight was delayed due to bad weather.", "The captain announced that the flight will be delayed due to bad weather."], answerIndex: 1, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837900"},
  // Q60 - Fill in the Blanks
  {question: "Select the most appropriate option to fill in the blank.\nHave you ______ with the difficulties you might have to face?", options: ["pondered", "considered", "discussed", "reckoned"], answerIndex: 3, topic: "Fill in the Blanks", exam: paper1Exam, year: paper1Year, qid: "65497837928"},
  // Q61 - Active Passive
  {question: "Select the option that expresses the given sentence in passive voice.\nHave you placed an order for a cake?", options: ["Have an order for a cake been placed by you?", "Is an order for a cake being placed by you?", "Has an order for a cake been placed by you?", "Was an order for a cake placed by you?"], answerIndex: 2, topic: "Active Passive", exam: paper1Exam, year: paper1Year, qid: "65497837884"},
  // Q62 - Sentence Improvement
  {question: "Select the option that will improve the underlined part of the given sentence. In case no improvement is needed, select 'No improvement required'.\nIs this the same book like our teacher recommended?", options: ["same book as", "same book who", "similar book that", "No improvement required"], answerIndex: 0, topic: "Sentence Improvement", exam: paper1Exam, year: paper1Year, qid: "65497837866"},
  // Q63 - Idioms
  {question: "Select the most appropriate meaning of the given idiom.\nTo rise like a phoenix", options: ["To behave like a royal", "To set on fire", "To emerge with a new life", "To be modest"], answerIndex: 2, topic: "Idioms and Phrases", exam: paper1Exam, year: paper1Year, qid: "65497837962"},
  // Q64 - Antonyms
  {question: "Select the most appropriate ANTONYM of the given word.\nThwart", options: ["Appoint", "Oppose", "Obstruct", "Allow"], answerIndex: 3, topic: "Antonyms", exam: paper1Exam, year: paper1Year, qid: "65497837954"},
  // Q65 - Sentence Improvement
  {question: "Select the option that will improve the underlined part of the given sentence. In case no improvement is needed, select 'No improvement required'.\nThe show flopped miserably to the utter disappointment of everybody.", options: ["for the utter", "No improvement required", "at an utter", "by the utterly"], answerIndex: 1, topic: "Sentence Improvement", exam: paper1Exam, year: paper1Year, qid: "65497837871"},
  // Q66 - Sentence Rearrangement
  {question: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order.\nA. Now, I was shining from top to toe and felt proud of my form.\nB. Finally, I was ready to leave the factory for my new home.\nC. Then the painter set about rubbing me vigorously and polishing me.\nD. A busy carpenter at last gave finishing touches to me.", options: ["ADBC", "DACB", "DCAB", "ACDB"], answerIndex: 2, topic: "Sentence Rearrangement", exam: paper1Exam, year: paper1Year, qid: "65497837933"},
  // Q67 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in direct speech.\nThe actor said that what he did in films was something he had never attempted in real life.", options: ["The actor said, \"What I do in films is something I have never attempted in real life.\"", "The actor said, \"What he did in films was something he had never attempted in real life.\"", "The actor said, \"What I am doing in films is something I have never attempted in real life.\"", "The actor said, \"What he did in films is something he has never attempted in real life.\""], answerIndex: 0, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837911"},
  // Q68 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in direct speech.\nMother said that when we pluck a flower it dies so we should let it beautify the world as long as it lives.", options: ["Mother said, \"When we pluck a flower it dies so you should let it beautify the world as long as it lived.\"", "Mother said, \"When we plucked a flower it died so we should let it beautify the world as long as it lived.\"", "Mother says, \"When we pluck a flower it dies so we should let it beautify the world as long as it lives.\"", "Mother said, \"When we pluck a flower it dies so we should let it beautify the world as long as it lives.\""], answerIndex: 3, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837922"},
  // Q69 - Fill in the Blanks
  {question: "Select the most appropriate option to fill in the blank.\nIn the absence of the Principal, the Vice-Principal ______ for him.", options: ["deputes", "replaces", "officiates", "exchanges"], answerIndex: 2, topic: "Fill in the Blanks", exam: paper1Exam, year: paper1Year, qid: "65497837927"},
  // Q70 - Active Passive
  {question: "Select the option that expresses the given sentence in active voice.\nWalking zones have been demarcated using paints and cones by the municipal corporation.", options: ["Walking zones are demarcating the municipal corporation using paints and cones.", "The municipal corporation is demarcating walking zones using paints and cones.", "The municipal corporation has demarcated walking zones using paints and cones.", "The municipal corporation will demarcate walking zones using paints and cones."], answerIndex: 2, topic: "Active Passive", exam: paper1Exam, year: paper1Year, qid: "65497837881"},
  // Q71 - Active Passive
  {question: "Select the option that expresses the given sentence in active voice.\nAll previous ages are far surpassed in knowledge by our age.", options: ["Our age far surpassed all previous ages in knowledge.", "Our age is far surpassing all previous ages in knowledge.", "Our age will far surpasses all previous ages in knowledge.", "Our age far surpasses all previous ages in knowledge."], answerIndex: 3, topic: "Active Passive", exam: paper1Exam, year: paper1Year, qid: "65497837887"},
  // Q72 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in reported speech.\nThe children said to the nurse, \"Reema slipped and fell from the stairs.\"", options: ["The children told the nurse Reema has slipped and fallen from the stairs.", "The children told the nurse that Reema had slipped and fallen from the stairs.", "The children told to the nurse that Reema slipped and fallen from the stairs.", "The children told the nurse that Reema slipped and fell from the stairs."], answerIndex: 1, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837919"},
  // Q73 - Sentence Improvement
  {question: "Select the option that will improve the underlined part of the given sentence. In case no improvement is needed, select 'No improvement required'.\nThe news about the surge in Covid-19 cases is broadcasted every morning.", options: ["are broadcasted", "are broadcast", "is broadcast", "No improvement required"], answerIndex: 2, topic: "Sentence Improvement", exam: paper1Exam, year: paper1Year, qid: "65497837872"},
  // Q74 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in reported speech.\nThe teacher says, \"Every action has an equal and opposite reaction.\"", options: ["The teacher says every action had an equal and opposite reaction.", "The teacher said that every action has an equal and opposite reaction.", "The teacher said that every action had an equal and opposite reaction.", "The teacher says that every action has an equal and opposite reaction."], answerIndex: 3, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837909"},
  // Q75 - Error Detection
  {question: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\nThe strain caused by / the difficulties and anxieties / were more than / she could bear.", options: ["the difficulties and anxieties", "were more than", "she could bear", "The strain caused by"], answerIndex: 1, topic: "Error Detection", exam: paper1Exam, year: paper1Year, qid: "65497837853"},
  // Q76 - Idioms
  {question: "Select the most appropriate meaning of the given idiom.\nTo turn the corner", options: ["To go back to the past", "To pass the critical stage", "To wait for an opportunity", "To change one's goal"], answerIndex: 1, topic: "Idioms and Phrases", exam: paper1Exam, year: paper1Year, qid: "65497837964"},
  // Q77 - Error Detection
  {question: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\nThe manager / took him / at task / for his negligence.", options: ["for his negligence", "took him", "The manager", "at task"], answerIndex: 3, topic: "Error Detection", exam: paper1Exam, year: paper1Year, qid: "65497837841"},
  // Q78 - Synonyms
  {question: "Select the most appropriate synonym of the given word.\nPenalise", options: ["Praise", "Punish", "Pretend", "Protect"], answerIndex: 1, topic: "Synonyms", exam: paper1Exam, year: paper1Year, qid: "65497837951"},
  // Q79 - Sentence Rearrangement
  {question: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order.\nA. The promotion of congenial relationship at all levels of the staff leads to prosperity of the organisation.\nB. Better skills increase the working capacity of employees by promoting better work habits.\nC. This includes multiplication of knowledge and development of their skills.\nD. Efficient management aims at qualitative improvement of its employees.", options: ["DCBA", "DABC", "DCAB", "DBAC"], answerIndex: 0, topic: "Sentence Rearrangement", exam: paper1Exam, year: paper1Year, qid: "65497837950"},
  // Q80 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in direct speech.\nMy sister suggested that we go for a walk in the fresh air.", options: ["My sister said, \"We shall go for a walk in the fresh air.\"", "My sister said, \"Let me go for a walk in the fresh air.\"", "My sister said, \"Go for a walk in the fresh air.\"", "My sister said, \"Let us go for a walk in the fresh air.\""], answerIndex: 3, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837913"},
  // Q81 - Error Detection
  {question: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\nThe city turned out / to be very / different to what / he had expected.", options: ["different to what", "he had expected", "The city turned out", "to be very"], answerIndex: 0, topic: "Error Detection", exam: paper1Exam, year: paper1Year, qid: "65497837855"},
  // Q82 - Sentence Improvement
  {question: "Select the option that will improve the underlined part of the given sentence. In case no improvement is needed, select 'No improvement required'.\nThe teacher found it difficult to exceed on the students' request.", options: ["exceed for", "No improvement required", "accede by", "accede to"], answerIndex: 3, topic: "Sentence Improvement", exam: paper1Exam, year: paper1Year, qid: "65497837863"},
  // Q83 - Error Detection
  {question: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\nI will spend / my rest of remaining / life in my / native village.", options: ["my rest of remaining", "life in my", "native village", "I will spend"], answerIndex: 0, topic: "Error Detection", exam: paper1Exam, year: paper1Year, qid: "65497837854"},
  // Q84 - Idioms
  {question: "Select the most appropriate meaning of the given idiom.\nTo read between the lines", options: ["To criticise the writer's style", "To understand the implied meaning", "To interrupt someone while reading", "To read each line carefully"], answerIndex: 1, topic: "Idioms and Phrases", exam: paper1Exam, year: paper1Year, qid: "65497837957"},
  // Q85 - Active Passive
  {question: "Select the option that expresses the given sentence in passive voice.\nGive her a 50% raise in salary.", options: ["She should give a 50% raise in salary.", "Let her being given a 50% raise in salary.", "She should have given a 50% raise in salary.", "Let her be given a 50% raise in salary."], answerIndex: 3, topic: "Active Passive", exam: paper1Exam, year: paper1Year, qid: "65497837893"},
  // Q86 - Sentence Rearrangement
  {question: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order.\nA. Some of these attachments can be quite cumbersome to use.\nB. Appliances like food processors come with a load of attachments.\nC. But, finding the right blade and fixing it in the right slot can be quite a job.\nD. For each different vegetable, you need to fix a different blade.", options: ["DACB", "BADC", "BDAC", "DCAB"], answerIndex: 1, topic: "Sentence Rearrangement", exam: paper1Exam, year: paper1Year, qid: "65497837932"},
  // Q87 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in direct speech.\nMy friend asked me where I planned to go for a vacation.", options: ["My friend said to me, \"Where have you planned to go for a vacation?\"", "My friend said to me, \"Where do you plan to go for a vacation?\"", "My friend said to me, \"Where are you planning to go for a vacation?\"", "My friend said to me, \"Where you have planned to go for a vacation?\""], answerIndex: 1, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837912"},
  // Q88 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in direct speech.\nRaza requested his parents to forgive him that time and promised never to play truant again.", options: ["Raza said to his parents, \"Please forgive me that time. I promise to never play truant again.\"", "Raza said to his parents, \"Forgive me that time. I promise I would never play truant again.\"", "Raza said to his parents, \"Forgive me this time. I promised never to play truant again.\"", "Raza said to his parents, \"Please forgive me this time. I promise never to play truant again.\""], answerIndex: 3, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837924"},
  // Q89 - Active Passive
  {question: "Select the option that expresses the given sentence in passive voice.\nThe commanding officer ordered the troops to march ahead.", options: ["The troops were being ordered to march ahead by the commanding officer.", "The troops are ordered to march ahead by the commanding officer.", "The troops were ordered to march ahead by the commanding officer.", "The troops have been ordered to march ahead by the commanding officer."], answerIndex: 2, topic: "Active Passive", exam: paper1Exam, year: paper1Year, qid: "65497837879"},
  // Q90 - Sentence Rearrangement
  {question: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order.\nA. Suddenly, a motor bike came towards me from the opposite direction.\nB. The consequence of my daredevilry was a sprained ankle and a bruised arm.\nC. I was enjoying my hands-free ride at top speed.\nD. I tried to swerve out of the way but lost control and fell.", options: ["BCDA", "CBDA", "CADB", "BADC"], answerIndex: 2, topic: "Sentence Rearrangement", exam: paper1Exam, year: paper1Year, qid: "65497837940"},
  // Q91 - One Word Substitution
  {question: "Select the option that can be used as a one-word substitute for the given group of words.\nOnly on the surface of something", options: ["Supercilious", "Superficial", "Superseding", "Superlative"], answerIndex: 1, topic: "One Word Substitution", exam: paper1Exam, year: paper1Year, qid: "65497837973"},
  // Q92 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in direct speech.\nHer parents asked her if the match proposed by them would be acceptable to her.", options: ["Her parents said to her, \"Will the match proposed by us be acceptable to you?\"", "Her parents said to her, \"Was the match proposed by them acceptable to her?\"", "Her parents said her, \"Would the match proposed by them be acceptable to her?\"", "Her parents said her, \"Will the match proposed by us be acceptable to you?\""], answerIndex: 0, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837915"},
  // Q93 - One Word Substitution (NOTE: chosen answer was "Rivalry" but correct is "Antipathy")
  {question: "Select the option that can be used as a one-word substitute for the given group of words.\nStrong dislike between two persons", options: ["Rivalry", "Antipathy", "Tolerance", "Adoration"], answerIndex: 1, topic: "One Word Substitution", exam: paper1Exam, year: paper1Year, qid: "65497837969"},
  // Q94 - Sentence Rearrangement
  {question: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order.\nA. \"How do you manage to complete so much work?\" he asked the student.\nB. Looking at the huge pile of books on a student's desk, a man said, \"What a burden, my son! I pity you.\"\nC. \"I focus on only one lesson at a time,\" the student further added.\nD. \"I don't think of all the work I have to do,\" answered the student.", options: ["BADC", "ACDB", "ACBD", "BDAC"], answerIndex: 0, topic: "Sentence Rearrangement", exam: paper1Exam, year: paper1Year, qid: "65497837941"},
  // Q95 - Spelling / Vocabulary
  {question: "Select the segment in which a word has been INCORRECTLY used.\nIs the Abominable Snowman a friction of the mountaineers' imagination?", options: ["imagination", "of the mountaineers'", "a friction", "Is the Abominable Snowman"], answerIndex: 2, topic: "Vocabulary", exam: paper1Exam, year: paper1Year, qid: "65497837979"},
  // Q96 - Sentence Improvement
  {question: "Select the option that will improve the underlined part of the given sentence. In case no improvement is needed, select 'No improvement required'.\nDo I need finish this work today itself?", options: ["No improvement required", "Need I", "Do I must", "Must I to"], answerIndex: 1, topic: "Sentence Improvement", exam: paper1Exam, year: paper1Year, qid: "65497837858"},
  // Q97 - One Word Substitution
  {question: "Select the option that can be used as a one-word substitute for the given group of words.\nA decision on which one cannot go back", options: ["Irrevocable", "Improbable", "Incredible", "Incorrigible"], answerIndex: 0, topic: "One Word Substitution", exam: paper1Exam, year: paper1Year, qid: "65497837976"},
  // Q98 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in reported speech.\nThe old man said, \"I was walking in my garden at six o'clock.\"", options: ["The old man said that I was been walking in my garden at six o'clock.", "The old man said that I had been walking in my garden at six o'clock.", "The old man said that he had been walking in his garden at six o'clock.", "The old man said that he was walking in his garden at six o'clock."], answerIndex: 2, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837908"},
  // Q99 - Error Detection
  {question: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\nYou should / avail this opportunity / to demonstrate / your skills.", options: ["avail this opportunity", "to demonstrate", "your skills", "You should"], answerIndex: 0, topic: "Error Detection", exam: paper1Exam, year: paper1Year, qid: "65497837849"},
  // Q100 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in reported speech.\nThe librarian said, \"Let no student be issued a book till next week.\"", options: ["The librarian said that no student will be issued a book till the following week.", "The librarian said that no student is to be issued a book till next week.", "The librarian said that let no student be issued a book till next week.", "The librarian said that no student was to be issued a book till the following week."], answerIndex: 3, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837917"},
  // Q101 - Sentence Improvement
  {question: "Select the option that will improve the underlined part of the given sentence. In case no improvement is needed, select 'No improvement required'.\nHe felt dejected but the feeling passed out in a minute.", options: ["No improvement required", "passed back", "passed on", "passed off"], answerIndex: 3, topic: "Sentence Improvement", exam: paper1Exam, year: paper1Year, qid: "65497837862"},
  // Q102 - Sentence Improvement
  {question: "Select the option that will improve the underlined part of the given sentence. In case no improvement is needed, select 'No improvement required'.\nHe was knowing her for a long time before he finally married her.", options: ["had knew", "had known", "has been knowing", "No improvement required"], answerIndex: 1, topic: "Sentence Improvement", exam: paper1Exam, year: paper1Year, qid: "65497837857"},
  // Q103 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in direct speech.\nThe commander ordered the soldiers to march ahead and not to think of their enemy's large numbers.", options: ["The commander said to the soldiers, \"March ahead. Do not think of their enemy's large numbers.\"", "The commander said to the soldiers, \"March ahead and not think of their enemy's large numbers.\"", "The commander said to the soldiers, \"March ahead. Do not think of your enemy's large numbers.\"", "The commander said to the soldiers, \"Please march ahead. Do not think of your enemy's large numbers.\""], answerIndex: 2, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837925"},
  // Q104 - Idioms
  {question: "Select the most appropriate meaning of the given idiom.\nTo meet one's Waterloo", options: ["To meet a friend", "To experience defeat", "To make a foolish choice", "To win a match"], answerIndex: 1, topic: "Idioms and Phrases", exam: paper1Exam, year: paper1Year, qid: "65497837958"},
  // Q105 - Idioms
  {question: "Select the most appropriate meaning of the given idiom.\nTo have an axe to grind", options: ["To have adequate means of subsistence", "To have an indomitable task to accomplish", "To have a selfish motive in doing something", "To have access to top levels of authority"], answerIndex: 2, topic: "Idioms and Phrases", exam: paper1Exam, year: paper1Year, qid: "65497837965"},
  // Q106 - Synonyms
  {question: "Select the most appropriate synonym of the given word.\nJudicious", options: ["Graceful", "Thoughtful", "Beautiful", "Plentiful"], answerIndex: 1, topic: "Synonyms", exam: paper1Exam, year: paper1Year, qid: "65497837952"},
  // Q107-200: continuing... (truncated for brevity in comments, all included below)
  // Q107 - Active Passive
  {question: "Select the option that expresses the given sentence in active voice.\nAbsolute liberty is enjoyed by us in matters of food and dress.", options: ["We have enjoyed absolute liberty in matters of food and dress.", "We will enjoy absolute liberty in matters of food and dress.", "We enjoy absolute liberty in matters of food and dress.", "We are enjoying absolute liberty in matters of food and dress."], answerIndex: 2, topic: "Active Passive", exam: paper1Exam, year: paper1Year, qid: "65497837888"},
  // Q108 - Sentence Rearrangement
  {question: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order.\nA. In fact he began his career as a peon in a small firm.\nB. Before he joined us as the accounts officer, he was a junior clerk.\nC. He learnt typing, accounting and even graduated.\nD. But he gradually improved his qualifications.", options: ["BADC", "BCDA", "CDAB", "CBAD"], answerIndex: 0, topic: "Sentence Rearrangement", exam: paper1Exam, year: paper1Year, qid: "65497837936"},
  // Q109 - Active Passive
  {question: "Select the option that expresses the given sentence in passive voice.\nYou must sign the contract before you start working.", options: ["The contract must being signed by you before you start working.", "The contract will be signed by you before you start working.", "The contract has been signed by you before you start working.", "The contract must be signed by you before you start working."], answerIndex: 3, topic: "Active Passive", exam: paper1Exam, year: paper1Year, qid: "65497837880"},
  // Q110 - One Word Substitution
  {question: "Select the option that can be used as a one-word substitute for the given group of words.\nAn entertainer who performs difficult physical feats", options: ["Archer", "Acrobat", "Artisan", "Artist"], answerIndex: 1, topic: "One Word Substitution", exam: paper1Exam, year: paper1Year, qid: "65497837966"},
  // Q111 - Sentence Improvement
  {question: "Select the option that will improve the underlined part of the given sentence. In case no improvement is needed, select 'No improvement required'.\nIt is I who am responsible for the success of the organisation.", options: ["It is me who am", "No improvement required", "It is me that is", "It is I which is"], answerIndex: 1, topic: "Sentence Improvement", exam: paper1Exam, year: paper1Year, qid: "65497837865"},
  // Q112 - Synonyms
  {question: "Select the most appropriate synonym of the given word.\nSequestered", options: ["Secluded", "Polished", "Frequented", "Decorated"], answerIndex: 0, topic: "Synonyms", exam: paper1Exam, year: paper1Year, qid: "65497837953"},
  // Q113-Q200: remaining standalone questions
  // Q113 - Sentence Rearrangement
  {question: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order.\nA. My father is the only breadwinner in the family.\nB. My mother happily lends a helping hand in his hard work.\nC. I belong to a family where it is difficult to make both ends meet.\nD. He earns a rather meagre amount, working as a mason.", options: ["CBDA", "ABCD", "CADB", "ACBD"], answerIndex: 2, topic: "Sentence Rearrangement", exam: paper1Exam, year: paper1Year, qid: "65497837931"},
  // Q114 - Sentence Rearrangement
  {question: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order.\nA. This usually results from a conviction on the part of the worker that the boss is genuinely interested in his growth and development.\nB. More attention should be paid to make this contact constructive and productive.\nC. The most vital spot in management is the contact between the workers and the boss.\nD. Constructive conditions prevail when mutual confidence and respect exists between the supervisor and the supervised.", options: ["CBDA", "DBCA", "CADB", "DABC"], answerIndex: 0, topic: "Sentence Rearrangement", exam: paper1Exam, year: paper1Year, qid: "65497837943"},
  // Q115 - Sentence Improvement
  {question: "Select the option that will improve the underlined part of the given sentence. In case no improvement is needed, select 'No improvement required'.\nThe magistrate acquitted him of all charges and set him free.", options: ["atoned him from", "No improvement required", "accused him for", "apprehended him in"], answerIndex: 1, topic: "Sentence Improvement", exam: paper1Exam, year: paper1Year, qid: "65497837875"},
  // Q116 - Sentence Rearrangement
  {question: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order.\nA. And that something in her lifted her to the world number one position in tennis in 2005.\nB. But all this happened in almost no time.\nC. It took Maria just four years as a professional to reach the pinnacle.\nD. There is something disarming about Maria Sharapova.", options: ["DABC", "ABCD", "CBAD", "BCDA"], answerIndex: 0, topic: "Sentence Rearrangement", exam: paper1Exam, year: paper1Year, qid: "65497837948"},
  // Q117 - Error Detection
  {question: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\nYour name / precedes before / mine / in the list.", options: ["mine", "in the list", "Your name", "precedes before"], answerIndex: 3, topic: "Error Detection", exam: paper1Exam, year: paper1Year, qid: "65497837850"},
  // Q118 - Error Detection
  {question: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\nThe girl lay down / on the bed / besides her mother / and went to sleep.", options: ["and went to sleep", "besides her mother", "on the bed", "The girl lay down"], answerIndex: 1, topic: "Error Detection", exam: paper1Exam, year: paper1Year, qid: "65497837840"},
  // Q119 - Sentence Rearrangement
  {question: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order.\nA. Expert designers standardise basic designs, leaving scope for the satisfaction of individual taste.\nB. However, uniformity does not imply lack of taste.\nC. Mechanical production of goods leads to uniformity of design.\nD. In fact, popular taste has improved because standardised goods of better design are now accessible.", options: ["ADBC", "CBDA", "ACDB", "CDAB"], answerIndex: 1, topic: "Sentence Rearrangement", exam: paper1Exam, year: paper1Year, qid: "65497837946"},
  // Q120 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in reported speech.\nShe said to her mother, \"May I have another slice of cake?\"", options: ["She asked her mother that may I have another slice of cake.", "She asked her mother if she might have another slice of cake.", "She asked her mother if she may have another slice of cake.", "She asked her mother that may she have another slice of cake."], answerIndex: 1, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837901"},
  // Q121-200 remaining — I'll continue with the rest
  // Q121 - Error Detection
  {question: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\nIf you have / remained calm / you could have / saved the situation.", options: ["remained calm", "If you have", "you could have", "saved the situation"], answerIndex: 1, topic: "Error Detection", exam: paper1Exam, year: paper1Year, qid: "65497837844"},
  // Q122 - Error Detection
  {question: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\nScarcely had I / started reading / the paper / then the doorbell rang.", options: ["Scarcely had I", "started reading", "the paper", "then the doorbell rang"], answerIndex: 3, topic: "Error Detection", exam: paper1Exam, year: paper1Year, qid: "65497837852"},
  // Q123 - Error Detection
  {question: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\nHe often / persists to ask / awkward questions / at the board meetings.", options: ["awkward questions", "persists to ask", "at the board meetings", "He often"], answerIndex: 1, topic: "Error Detection", exam: paper1Exam, year: paper1Year, qid: "65497837851"},
  // Q124 - Sentence Improvement
  {question: "Select the option that will improve the underlined part of the given sentence. In case no improvement is needed, select 'No improvement required'.\nNot only the workmen but also the supervisor was suspended for negligence.", options: ["was suspend", "have been suspended", "were suspended", "No improvement required"], answerIndex: 3, topic: "Sentence Improvement", exam: paper1Exam, year: paper1Year, qid: "65497837867"},
  // Q125 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in direct speech.\nSmriti greeted me and asked me where I was working then.", options: ["Smriti said to me, \"Hello! Where you are working now?\"", "Smriti said to me, \"Hello! Where I was working then?\"", "Smriti said to me, \"Hello! Where are you working now?\"", "Smriti said to me, \"Hello! Where were you working then?\""], answerIndex: 2, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837914"},
  // Q126 - Sentence Rearrangement
  {question: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order.\nA. The first is far more real than the second.\nB. But, a person who enjoys long distance popularity succeeds in creating a favourable notion of himself among unknown people.\nC. An intimately popular person is liked by those who know him.\nD. There are two kinds of popularity - intimate and long distance popularity.", options: ["DCAB", "CABD", "CBDA", "DACB"], answerIndex: 3, topic: "Sentence Rearrangement", exam: paper1Exam, year: paper1Year, qid: "65497837937"},
  // Q127 - One Word Substitution
  {question: "Select the option that can be used as a one-word substitute for the given group of words.\nA long wooden seat with a back for people to sit on in a church", options: ["Altar", "Pulpit", "Pew", "Aisle"], answerIndex: 2, topic: "One Word Substitution", exam: paper1Exam, year: paper1Year, qid: "65497837975"},
  // Q128 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in reported speech.\nShe said, \"I wish I could fly like a butterfly!\"", options: ["She wished that I could fly like a butterfly.", "She exclaimed that could she fly like a butterfly.", "She wished that she could fly like a butterfly.", "She exclaimed that she would fly like a butterfly."], answerIndex: 2, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837918"},
  // Q129 - Sentence Rearrangement
  {question: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order.\nA. There are others who claim that they have never been so well connected.\nB. However, such social networking sites help us to keep in touch with old friends or make new ones.\nC. Whether or not Facebook friendships are lasting is debatable.\nD. Some people believe that real friendships are collapsing in modern times.", options: ["DACB", "CBAD", "DBCA", "CDBA"], answerIndex: 0, topic: "Sentence Rearrangement", exam: paper1Exam, year: paper1Year, qid: "65497837945"},
  // Q130 - Direct Indirect Speech  
  {question: "Select the option that expresses the given sentence in reported speech.\nHarsh said, \"How happy I am to receive the best student award!\"", options: ["Harsh exclaimed with joy that he was very happy to receive the best student award.", "Harsh exclaimed happily that he was receiving the best student award.", "Harsh exclaimed with joy that how happy he was to receive the best student award.", "Harsh exclaimed happily that I am very happy to receive the best student award."], answerIndex: 0, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837906"},
  // Q131 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in reported speech.\nThe investigator asked me, \"Did you see or hear anything in the dead of night?\"", options: ["The investigator asked me if I see or hear anything in the dead of night.", "The investigator asked me that if I had seen or heard anything in the dead of night.", "The investigator asked me if I saw or heard anything in the dead of night.", "The investigator asked me if I had seen or heard anything in the dead of night."], answerIndex: 3, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837916"},
  // Q132 - Spelling
  {question: "Select the INCORRECTLY spelt word.", options: ["Accumulate", "Occasion", "Remittance", "Neccessary"], answerIndex: 3, topic: "Spelling", exam: paper1Exam, year: paper1Year, qid: "65497837980"},
  // Q133 - Sentence Improvement
  {question: "Select the option that will improve the underlined part of the given sentence. In case no improvement is needed, select 'No improvement required'.\nThe soldiers would not have surrendered if they not ran out of ammunition.", options: ["had not run out", "did not ran out", "No improvement required", "do not run out"], answerIndex: 0, topic: "Sentence Improvement", exam: paper1Exam, year: paper1Year, qid: "65497837870"},
  // Q134 - Sentence Improvement
  {question: "Select the option that will improve the underlined part of the given sentence. In case no improvement is needed, select 'No improvement required'.\nIt is the true fact that the second wave of Covid-19 that has gripped India is more deadly.", options: ["a real fact", "a fact", "the correct fact", "No improvement required"], answerIndex: 1, topic: "Sentence Improvement", exam: paper1Exam, year: paper1Year, qid: "65497837874"},
  // Q135 - Fill in the Blanks
  {question: "Select the most appropriate option to fill in the blank.\nHe was ______ at his brother's refusal to help him financially.", options: ["indignant", "indicted", "enchanted", "enamoured"], answerIndex: 0, topic: "Fill in the Blanks", exam: paper1Exam, year: paper1Year, qid: "65497837929"},
  // Q136 - Sentence Rearrangement
  {question: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order.\nA. Most of these superpowers are not rich in natural resources and have faced political turmoil.\nB. Human capital ultimately makes the difference, both, in an enterprise and a nation.\nC. The new economic superpowers of today amply testify this thesis.\nD. Yet, they have achieved economic affluence in a relatively short period.", options: ["ADBC", "ACDB", "BCAD", "BCDA"], answerIndex: 2, topic: "Sentence Rearrangement", exam: paper1Exam, year: paper1Year, qid: "65497837947"},
  // Q137 - Fill in the Blanks
  {question: "Select the most appropriate option to fill in the blank.\nThe more he tried to solve the mystery, the more _________ he felt.", options: ["confusing", "callous", "humbled", "perplexed"], answerIndex: 3, topic: "Fill in the Blanks", exam: paper1Exam, year: paper1Year, qid: "65497837926"},
  // Q138 - Vocabulary
  {question: "Select the segment in which a word has been INCORRECTLY used.\nThe children were so exhausted that they sank warily into bed.", options: ["were so exhausted", "warily into bed", "that they sank", "The children"], answerIndex: 1, topic: "Vocabulary", exam: paper1Exam, year: paper1Year, qid: "65497837977"},
  // Q139 - One Word Substitution
  {question: "Select the option that can be used as a one-word substitute for the given group of words.\nStudy of diseases", options: ["Anthology", "Pathology", "Neurology", "Etymology"], answerIndex: 1, topic: "One Word Substitution", exam: paper1Exam, year: paper1Year, qid: "65497837972"},
  // Q140 - Sentence Improvement
  {question: "Select the option that will improve the underlined part of the given sentence. In case no improvement is needed, select 'No improvement required'.\nThese shoes are cheap as well durable.", options: ["neither cheaper nor durable", "No improvement required", "both cheap and durable", "more cheaper than durable"], answerIndex: 2, topic: "Sentence Improvement", exam: paper1Exam, year: paper1Year, qid: "65497837864"},
  // Q141-200 remaining
  // Q141 - Active Passive
  {question: "Select the option that expresses the given sentence in active voice.\nA defamation case is being filed by him against his business partner.", options: ["He has filed a defamation case against his business partner.", "He has been filing a defamation case against his business partner.", "He is filing a defamation case against his business partner.", "His business partner is filing a defamation case against him."], answerIndex: 2, topic: "Active Passive", exam: paper1Exam, year: paper1Year, qid: "65497837897"},
  // Q142 - Active Passive
  {question: "Select the option that expresses the given sentence in passive voice.\nWhat did you do to help the migrant labourers during the pandemic?", options: ["What is done by you to help the migrant labourers during the pandemic?", "What was being done by you to help the migrant labourers during the pandemic?", "What has been done by you to help the migrant labourers during the pandemic?", "What was done by you to help the migrant labourers during the pandemic?"], answerIndex: 3, topic: "Active Passive", exam: paper1Exam, year: paper1Year, qid: "65497837894"},
  // Q143 - Active Passive
  {question: "Select the option that expresses the given sentence in active voice.\nMay you be blessed with health and happiness!", options: ["You may bless with health and happiness.", "May health and happiness be blessed by you!", "May health and happiness bless you!", "May God bless you with health and happiness!"], answerIndex: 3, topic: "Active Passive", exam: paper1Exam, year: paper1Year, qid: "65497837898"},
  // Q144 - Error Detection
  {question: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\nThis renowned / university provide / research opportunities / for students.", options: ["research opportunities", "for students", "university provide", "This renowned"], answerIndex: 2, topic: "Error Detection", exam: paper1Exam, year: paper1Year, qid: "65497837837"},
  // Q145 - Active Passive
  {question: "Select the option that expresses the given sentence in active voice.\nEnough money will have been saved by me for a new house by next year.", options: ["I will be saving enough money for a new house by next year.", "I will save enough money for a new house by next year.", "I will have saved enough money for a new house by next year.", "I will have been saving enough money for a new house by next year."], answerIndex: 2, topic: "Active Passive", exam: paper1Exam, year: paper1Year, qid: "65497837889"},
  // Q146 - One Word Substitution
  {question: "Select the option that can be used as a one-word substitute for the given group of words.\nCentral character in a story or play", options: ["Emulator", "Protagonist", "Adversary", "Contender"], answerIndex: 1, topic: "One Word Substitution", exam: paper1Exam, year: paper1Year, qid: "65497837974"},
  // Q147 - Active Passive
  {question: "Select the option that expresses the given sentence in active voice.\nLet these ancient texts be preserved for posterity.", options: ["You must preserve these ancient texts for posterity.", "Let us preserve these ancient texts for posterity.", "Let these ancient texts preserve us for posterity.", "We have to preserve these ancient texts for posterity."], answerIndex: 1, topic: "Active Passive", exam: paper1Exam, year: paper1Year, qid: "65497837895"},
  // Q148 - Sentence Improvement
  {question: "Select the option that will improve the underlined part of the given sentence. In case no improvement is needed, select 'No improvement required'.\nThe shopkeeper was obliged to dispense to the service of his salesman.", options: ["by the services", "No improvement required", "away the service", "with the services"], answerIndex: 3, topic: "Sentence Improvement", exam: paper1Exam, year: paper1Year, qid: "65497837876"},
  // Q149 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in reported speech.\nThe old man said to her, \"Good luck to you! May you succeed in your venture!\"", options: ["The old man wished you good luck and prayed that you might succeed in your venture.", "The old man wished her good luck and prayed that she might succeed in her venture.", "The old man exclaimed good luck to you and wished that she may succeed in her venture.", "The old man told her good luck and prayed that may she succeed in her venture."], answerIndex: 1, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837920"},
  // Q150 - Error Detection
  {question: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\nThis dog seems / to be very ferocious, / otherwise, / it is harmless.", options: ["it is harmless", "otherwise", "to be very ferocious", "This dog seems"], answerIndex: 1, topic: "Error Detection", exam: paper1Exam, year: paper1Year, qid: "65497837845"},
  // Q151 - Sentence Improvement
  {question: "Select the option that will improve the underlined part of the given sentence. In case no improvement is needed, select 'No improvement required'.\nThe doors and windows will have painted by afternoon.", options: ["No improvement required", "would been painted", "will be painting", "will have been painted"], answerIndex: 3, topic: "Sentence Improvement", exam: paper1Exam, year: paper1Year, qid: "65497837861"},
  // Q152 - Error Detection
  {question: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\nWe yet / have time / to catch / the bus.", options: ["the bus", "We yet", "have time", "to catch"], answerIndex: 1, topic: "Error Detection", exam: paper1Exam, year: paper1Year, qid: "65497837848"},
  // Q153 - Sentence Rearrangement
  {question: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order.\nA. The sand is so hot that you cannot walk over it in the day time.\nB. Here, there is nothing but sand and rock.\nC. A great part of Arabia is a desert.\nD. However, there are springs of water but these are few and far apart.", options: ["CABD", "ACDB", "CBAD", "BDCA"], answerIndex: 2, topic: "Sentence Rearrangement", exam: paper1Exam, year: paper1Year, qid: "65497837934"},
  // Q154 - One Word Substitution
  {question: "Select the option that can be used as a one-word substitute for the given group of words.\nNo longer in use", options: ["Obsolete", "Obscure", "Original", "Oriental"], answerIndex: 0, topic: "One Word Substitution", exam: paper1Exam, year: paper1Year, qid: "65497837968"},
  // Q155 - Idioms
  {question: "Select the most appropriate meaning of the given idiom.\nTo hit below the belt", options: ["To attack in an unfair manner", "To attack after warning", "To hit someone boldly", "To hit off the mark"], answerIndex: 0, topic: "Idioms and Phrases", exam: paper1Exam, year: paper1Year, qid: "65497837960"},
  // Q156 - One Word Substitution
  {question: "Select the option that can be used as a one-word substitute for the given group of words.\nTo free from restraint", options: ["Subjugate", "Emancipate", "Escalate", "Validate"], answerIndex: 1, topic: "One Word Substitution", exam: paper1Exam, year: paper1Year, qid: "65497837971"},
  // Q157 - Error Detection
  {question: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\nThe allies / of the government / decided to / withdrew all support.", options: ["withdrew all support", "of the government", "The allies", "decided to"], answerIndex: 0, topic: "Error Detection", exam: paper1Exam, year: paper1Year, qid: "65497837842"},
  // Q158 - Sentence Rearrangement
  {question: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order.\nA. Arrogance inflames prejudice and hatred, but humble speech soothes.\nB. Humility is the quality of being courteously respectful of others.\nC. It is the opposite of arrogance, aggressiveness and vanity.\nD. Thus, a humble demeanour is what is required to live in peace.", options: ["BCAD", "ACBD", "CADB", "DACB"], answerIndex: 0, topic: "Sentence Rearrangement", exam: paper1Exam, year: paper1Year, qid: "65497837938"},
  // Q159 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in direct speech.\nThe teacher ordered the students to go straight to their classrooms.", options: ["\"Go straight to your classrooms,\" the teacher said to the students.", "\"Go straight to their classrooms,\" the teacher said to the students.", "The teacher said to the students, \"Please go straight to your classrooms.\"", "The teacher said, \"Students, to go straight to their classrooms.\""], answerIndex: 0, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837904"},
  // Q160 - Error Detection
  {question: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\nHave you / ever spoke / to anyone / about your problems?", options: ["to anyone", "Have you", "ever spoke", "about your problems"], answerIndex: 2, topic: "Error Detection", exam: paper1Exam, year: paper1Year, qid: "65497837843"},
  // Q161 - Sentence Rearrangement
  {question: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order.\nA. He stamped them mechanically and returned them to us.\nB. They had information that large sums of money were being smuggled out of the country.\nC. No sooner had he left than the custom officers entered.\nD. An official entered our train compartment and asked for passports.", options: ["CBDA", "ACBD", "DACB", "DCBA"], answerIndex: 2, topic: "Sentence Rearrangement", exam: paper1Exam, year: paper1Year, qid: "65497837935"},
  // Q162 - Active Passive
  {question: "Select the option that expresses the given sentence in passive voice.\nThe audience is applauding the wonderful performance.", options: ["The wonderful audience is being applauded by the performance.", "The wonderful performance was being applauded by the audience.", "The wonderful performance is being applauded by the audience.", "The wonderful performance is applauded by the audience."], answerIndex: 2, topic: "Active Passive", exam: paper1Exam, year: paper1Year, qid: "65497837883"},
  // Q163 - Active Passive
  {question: "Select the option that expresses the given sentence in active voice.\nWere you sent summons by the court?", options: ["Is the court sending you summons?", "Will the court send you summons?", "Has the court sent you summons?", "Did the court send you summons?"], answerIndex: 3, topic: "Active Passive", exam: paper1Exam, year: paper1Year, qid: "65497837896"},
  // Q164 - Sentence Improvement
  {question: "Select the option that will improve the underlined part of the given sentence. In case no improvement is needed, select 'No improvement required'.\nUnless we are not sure of our goals, we cannot achieve them.", options: ["Except if we are not sure", "Not until we are sure", "No improvement required", "Unless we are sure"], answerIndex: 3, topic: "Sentence Improvement", exam: paper1Exam, year: paper1Year, qid: "65497837878"},
  // Q165 - Error Detection
  {question: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\nThe more harder / you work, / the better / it will be.", options: ["The more harder", "you work", "it will be", "the better"], answerIndex: 0, topic: "Error Detection", exam: paper1Exam, year: paper1Year, qid: "65497837839"},
  // Q166 - Active Passive
  {question: "Select the option that expresses the given sentence in passive voice.\nI could not use his laptop as it was password protected.", options: ["His laptop has not been used by me as it is password protected.", "His laptop cannot be used by me as it is password protected.", "His laptop could not been used by me as it was password protected.", "His laptop could not be used by me as it was password protected."], answerIndex: 3, topic: "Active Passive", exam: paper1Exam, year: paper1Year, qid: "65497837892"},
  // Q167 - Spelling
  {question: "Select the INCORRECTLY spelt word.", options: ["Maintainence", "Countenance", "Assistance", "Perseverance"], answerIndex: 0, topic: "Spelling", exam: paper1Exam, year: paper1Year, qid: "65497837981"},
  // Q168 - Sentence Improvement
  {question: "Select the option that will improve the underlined part of the given sentence. In case no improvement is needed, select 'No improvement required'.\nHe denied if he had caused the accident.", options: ["that he had", "of having", "No improvement required", "not to had"], answerIndex: 0, topic: "Sentence Improvement", exam: paper1Exam, year: paper1Year, qid: "65497837869"},
  // Q169 - Sentence Rearrangement
  {question: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order.\nA. I felt embarrassed as if I was somehow responsible for the fire in our home.\nB. In my case, it was no different.\nC. It always happens that bad news travels quickly.\nD. Everyone in high school was aware of my plight.", options: ["ADBC", "CDAB", "ABCD", "CBDA"], answerIndex: 3, topic: "Sentence Rearrangement", exam: paper1Exam, year: paper1Year, qid: "65497837949"},
  // Q170 - Sentence Improvement
  {question: "Select the option that will improve the underlined part of the given sentence. In case no improvement is needed, select 'No improvement required'.\nIt is time for the factory to being closed.", options: ["No improvement required", "for closing", "should be closed", "to be closed"], answerIndex: 3, topic: "Sentence Improvement", exam: paper1Exam, year: paper1Year, qid: "65497837860"},
  // Q171 - Sentence Improvement
  {question: "Select the option that will improve the underlined part of the given sentence. In case no improvement is needed, select 'No improvement required'.\nSal trees have been planted in relatively three-fourth of the forest area.", options: ["No improvement required", "about three-fourth", "around three-fourth", "nearly three-fourths"], answerIndex: 3, topic: "Sentence Improvement", exam: paper1Exam, year: paper1Year, qid: "65497837873"},
  // Q172 - Error Detection
  {question: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\nHe was unable / to help me because / he had been failed / to arrange the money.", options: ["to help me because", "he had been failed", "to arrange the money", "He was unable"], answerIndex: 1, topic: "Error Detection", exam: paper1Exam, year: paper1Year, qid: "65497837856"},
  // Q173 - Sentence Rearrangement
  {question: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order.\nA. His role also includes the smooth flow of goods from farms and factories to the consumer.\nB. As the final link between the producer and the consumer, he plays a key role in the economy.\nC. It is he who promotes or impedes the sale of products.\nD. The retailer determines the final cost of a product.", options: ["BACD", "DCBA", "ABCD", "CABD"], answerIndex: 1, topic: "Sentence Rearrangement", exam: paper1Exam, year: paper1Year, qid: "65497837942"},
  // Q174 - Error Detection
  {question: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\nHe went / to the bed / with a / slight fever.", options: ["slight fever", "He went", "to the bed", "with a"], answerIndex: 2, topic: "Error Detection", exam: paper1Exam, year: paper1Year, qid: "65497837838"},
  // Q175 - Active Passive
  {question: "Select the option that expresses the given sentence in passive voice.\nDo not touch any items displayed on glass shelves.", options: ["Any items displayed on glass shelves not be touched.", "Let any items displayed on glass shelves be touched.", "No items displayed on glass shelves should be touched.", "Any items displayed on glass shelves will not be touched."], answerIndex: 2, topic: "Active Passive", exam: paper1Exam, year: paper1Year, qid: "65497837891"},
  // Q176 - Sentence Rearrangement
  {question: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order.\nA. There are several factors that contribute to wisdom.\nB. Doing this has become more difficult than before owing to the complexity of the specialised knowledge required.\nC. This is the capacity to take account of all important factors in a problem and to attach to each its due weight.\nD. Of these, I should put first a sense of proportion.", options: ["ACBD", "ADCB", "CDBA", "CBAD"], answerIndex: 1, topic: "Sentence Rearrangement", exam: paper1Exam, year: paper1Year, qid: "65497837944"},
  // Q177 - Active Passive
  {question: "Select the option that expresses the given sentence in active voice.\nEfforts are being made by us to reduce crowding in core city areas.", options: ["We are making efforts to reduce crowding in core city areas.", "We were making efforts to reduce crowding in core city areas.", "We made efforts to reduce crowding in core city areas.", "We will be making efforts to reduce crowding in core city areas."], answerIndex: 0, topic: "Active Passive", exam: paper1Exam, year: paper1Year, qid: "65497837882"},
  // Q178 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in reported speech.\n\"Please lend me some money, Raman. I need it urgently,\" said Sumesh.", options: ["Sumesh requested Raman to lend me some money as I needed it urgently.", "Sumesh requested Raman please lend me some money as I need it urgently.", "Sumesh requested Raman to lend him some money as he needed it urgently.", "Sumesh requested to Raman to please lend him some money as he needed it urgently."], answerIndex: 2, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837907"},
  // Q179 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in direct speech.\nThe students asked how they would benefit from online classes.", options: ["The students said, \"How will they be benefited from online classes?\"", "The students said, \"How we would benefit from online classes?\"", "The students said, \"How they will benefit from online classes?\"", "The students said, \"How will we benefit from online classes?\""], answerIndex: 3, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837910"},
  // Q180 - Idioms
  {question: "Select the most appropriate meaning of the given idiom.\nAgainst one's grain", options: ["Against the society", "Against the law", "Against one's family", "Against one's nature"], answerIndex: 3, topic: "Idioms and Phrases", exam: paper1Exam, year: paper1Year, qid: "65497837963"},
  // Q181 - One Word Substitution
  {question: "Select the option that can be used as a one-word substitute for the given group of words.\nOne who possesses several talents", options: ["Verbose", "Virtuous", "Virtual", "Versatile"], answerIndex: 3, topic: "One Word Substitution", exam: paper1Exam, year: paper1Year, qid: "65497837967"},
  // Q182 - Active Passive
  {question: "Select the option that expresses the given sentence in active voice.\nElaborate plans are being made for Aarushi's destination wedding.", options: ["They are making elaborate plans for Aarushi's destination wedding.", "They have been making elaborate plans for Aarushi's destination wedding.", "They made elaborate plans for Aarushi's destination wedding.", "They have made elaborate plans for Aarushi's destination wedding."], answerIndex: 0, topic: "Active Passive", exam: paper1Exam, year: paper1Year, qid: "65497837890"},
  // Q183 - Error Detection
  {question: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\nMr. Das, my friend / and Principal / of this college, / have retired.", options: ["of this college", "and Principal", "Mr. Das, my friend", "have retired"], answerIndex: 3, topic: "Error Detection", exam: paper1Exam, year: paper1Year, qid: "65497837847"},
  // Q184 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in direct speech.\nFather told the children that there was some good news for them that day.", options: ["Father said to the children, \"There had been some good news for them that day.\"", "Father said to the children, \"There was some good news for you today.\"", "Father said to the children, \"There was some good news for them that day.\"", "Father said to the children, \"There is some good news for you today.\""], answerIndex: 3, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837921"},
  // Q185 - Active Passive
  {question: "Select the option that expresses the given sentence in passive voice.\nLight the lamp of knowledge in every heart.", options: ["Let the lamp of knowledge light in every heart.", "Let the lamp of knowledge be lighting every heart.", "Let the lamp of knowledge being lighted in every heart.", "Let the lamp of knowledge be lit in every heart."], answerIndex: 3, topic: "Active Passive", exam: paper1Exam, year: paper1Year, qid: "65497837886"},
  // Q186 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in reported speech.\nHarry said to me, \"Don't wear this expensive watch to school.\"", options: ["Harry told me that not to wear that expensive watch to school.", "Harry told me not to wear that expensive watch to school.", "Harry told me that don't wear that expensive watch to school.", "Harry told me to not wear this expensive watch to school."], answerIndex: 1, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837902"},
  // Q187 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in direct speech.\nShe asked if she could help him with his packing.", options: ["She said, \"May I help you with your packing?\"", "She said, \"Can I help you with your packing?\"", "She said, \"Could I help him with your packing?\"", "She said, \"Should you help me with my packing?\""], answerIndex: 1, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837903"},
  // Q188 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in direct speech.\nThe little boy asked his teacher if she had always been good as a child.", options: ["The little boy said to his teacher, \"You have always been good as a child?\"", "The little boy said to his teacher, \"Are you always good as a child?\"", "The little boy said to his teacher, \"Ma'am, always you were good as a child?\"", "The little boy said to his teacher, \"Ma'am, were you always good as a child?\""], answerIndex: 3, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837923"},
  // Q189 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in reported speech.\nShe said, \"It is my birthday next week.\"", options: ["She said that my birthday was next week.", "She said that it is my birthday the following week.", "She said that it was her birthday the following week.", "She said that next week was her birthday."], answerIndex: 2, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837899"},
  // Q190 - One Word Substitution
  {question: "Select the option that can be used as a one-word substitute for the given group of words.\nMade of artificial substance or material", options: ["Expensive", "Offensive", "Synthetic", "Authentic"], answerIndex: 2, topic: "One Word Substitution", exam: paper1Exam, year: paper1Year, qid: "65497837970"},
  // Q191 - Vocabulary
  {question: "Select the segment in which a word has been INCORRECTLY used.\nHe had an amazing capacity to condone up the most delectable dishes at a short notice.", options: ["capacity to condone up", "the most delectable", "dishes at a short notice", "He had an amazing"], answerIndex: 0, topic: "Vocabulary", exam: paper1Exam, year: paper1Year, qid: "65497837978"},
  // Q192 - Sentence Improvement
  {question: "Select the option that will improve the underlined part of the given sentence. In case no improvement is needed, select 'No improvement required'.\nMegha's habit of procrastination puts her colleagues on lot of trouble.", options: ["to a lot of trouble", "into lot troubles", "No improvement required", "in lot of troubles"], answerIndex: 0, topic: "Sentence Improvement", exam: paper1Exam, year: paper1Year, qid: "65497837877"},
  // Q193 - Sentence Improvement
  {question: "Select the option that will improve the underlined part of the given sentence. In case no improvement is needed, select 'No improvement required'.\nThe manager assured the employees that none of them will be dismiss.", options: ["would be dismissed", "would have been dismissed", "No improvement required", "is being dismiss"], answerIndex: 0, topic: "Sentence Improvement", exam: paper1Exam, year: paper1Year, qid: "65497837859"},
  // Q194 - Antonyms
  {question: "Select the most appropriate ANTONYM of the given word.\nRemorse", options: ["Sorrow", "Regret", "Empathy", "Satisfaction"], answerIndex: 3, topic: "Antonyms", exam: paper1Exam, year: paper1Year, qid: "65497837955"},
  // Q195 - Direct Indirect Speech
  {question: "Select the option that expresses the given sentence in reported speech.\nThe Chief Minister said, \"All exams shall be cancelled this year.\"", options: ["The Chief Minister said that all exams should be cancelled this year.", "The Chief Minister says that all exams shall be cancelled this year.", "The Chief Minister said that all exams would be cancelled that year.", "The Chief Minister said that all exams should have been cancelled that year."], answerIndex: 2, topic: "Direct Indirect Speech", exam: paper1Exam, year: paper1Year, qid: "65497837905"},
  // Q196 - Idioms
  {question: "Select the most appropriate meaning of the given idiom.\nKeep your head", options: ["Remain calm", "Be furious", "Respect yourself", "Protect yourself"], answerIndex: 0, topic: "Idioms and Phrases", exam: paper1Exam, year: paper1Year, qid: "65497837961"},
  // Q197 - Idioms
  {question: "Select the most appropriate meaning of the given idiom.\nA square deal", options: ["An advantageous deal", "A fair and honest deal", "A false claim", "An unfruitful plan"], answerIndex: 1, topic: "Idioms and Phrases", exam: paper1Exam, year: paper1Year, qid: "65497837959"},
  // Q198 - Active Passive
  {question: "Select the option that expresses the given sentence in passive voice.\nPeople write autobiographies for various reasons.", options: ["Autobiographies have been written by people for various reasons.", "Autobiographies were written by people for various reasons.", "Autobiographies are written by people for various reasons.", "Autobiographies are being written by people for various reasons."], answerIndex: 2, topic: "Active Passive", exam: paper1Exam, year: paper1Year, qid: "65497837885"},
  // Q199 - Sentence Improvement
  {question: "Select the option that will improve the underlined part of the given sentence. In case no improvement is needed, select 'No improvement required'.\nUnless you carry a Covid-19 negative report, you can travel by air.", options: ["Provided", "Only", "Until", "No improvement required"], answerIndex: 0, topic: "Sentence Improvement", exam: paper1Exam, year: paper1Year, qid: "65497837868"},
  // Q200 - Fill in the Blanks
  {question: "Select the most appropriate option to fill in the blank.\nThe workers ______ against the new labour laws.", options: ["opposed", "implicated", "remonstrated", "dissented"], answerIndex: 2, topic: "Fill in the Blanks", exam: paper1Exam, year: paper1Year, qid: "65497837930"},
];

// Paper 2 will be done as a separate run due to file size - this is already very large.
// For now, let's import Paper 1.

// ============================================================
// CONVERT TO BANK FORMAT AND IMPORT
// ============================================================

const existingQids = new Set();
data.questions.forEach(q => {
  if (q.source && q.source.questionId) existingQids.add(q.source.questionId);
});

let added = 0, skipped = 0, dupes = 0;
const topicCounts = {};

const allQs = [...paper1];

for (const raw of allQs) {
  // Dedup by question ID
  const qid = raw.qid;
  if (qid && existingQids.has(qid)) { dupes++; continue; }

  // Dedup by question text (first 80 chars)
  const qKey = (raw.question || '').substring(0, 80).toLowerCase().trim();
  const isDupe = data.questions.some(existing =>
    existing.subject === 'english' &&
    (existing.question || '').substring(0, 80).toLowerCase().trim() === qKey
  );
  if (isDupe) { dupes++; continue; }

  const entry = {
    id: uid(),
    type: "question",
    examFamily: "ssc",
    subject: "english",
    difficulty: "medium",
    tier: "tier2",
    questionMode: "objective",
    topic: raw.topic,
    question: raw.question,
    options: raw.options,
    answerIndex: raw.answerIndex,
    explanation: "",
    marks: 2,
    negativeMarks: 0.5,
    isChallengeCandidate: false,
    confidenceScore: 1.0,
    reviewStatus: "approved",
    isPYQ: true,
    year: raw.year,
    frequency: 1,
    subtopic: null,
    source: {
      kind: "pyq_paper",
      exam: raw.exam,
      questionId: raw.qid || null,
      importedAt: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reviewAudit: {
      reviewedAt: new Date().toISOString(),
      reviewedBy: "pyq_english_import",
      decision: "approve",
      rejectReason: ""
    }
  };

  // Add passage data for comprehension questions
  if (raw.passage) {
    entry.passage = raw.passage;
    entry.passageTitle = raw.passageTitle || null;
    entry.isComprehension = true;
  }

  data.questions.push(entry);
  if (qid) existingQids.add(qid);
  added++;

  const t = raw.topic;
  topicCounts[t] = (topicCounts[t] || 0) + 1;
}

data.updatedAt = new Date().toISOString();
fs.writeFileSync(bankPath, JSON.stringify(data, null, 2));

console.log(`\n=== ENGLISH PYQ IMPORT RESULTS ===`);
console.log(`Paper 1 (CGL 2020 Tier-II, 29 Jan 2022): ${paper1.length} questions parsed`);
console.log(`Added: ${added}`);
console.log(`Duplicates skipped: ${dupes}`);
console.log(`Total bank size: ${data.questions.length}`);
console.log(`\nTopic breakdown:`);
Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => console.log(`  ${t}: ${c}`));
