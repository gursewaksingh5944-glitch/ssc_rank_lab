const fs = require('fs');
const path = require('path');

const bankPath = path.join(__dirname, 'data', 'question-bank.json');
const data = JSON.parse(fs.readFileSync(bankPath, 'utf-8'));

// This script patches existing comprehension questions that were imported
// without passage data. It matches by question text and adds passage+passageTitle+isComprehension.

// Passages for Paper 1 (CGL 2020 Tier-II, 29 Jan 2022)
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


// Define passage mappings:  question text fragment -> {passage, passageTitle, topic fix}
const patchRules = [
  // Paper 1 Comprehension Sets
  // Set 1: Child/father of man (Q1-10) - "fill in blank no.X" with specific options
  { match: q => q.question.includes('fill in blank no.') && q.options && q.options.includes('promise') && q.options.includes('bond'), passage: PASSAGE_CHILD, title: "The child is the father of man" },
  { match: q => q.question.includes('fill in blank no.') && q.options && q.options.includes('scores') && q.options.includes('attains'), passage: PASSAGE_CHILD, title: "The child is the father of man" },
  { match: q => q.question.includes('fill in blank no.') && q.options && q.options.includes('contributed') && q.options.includes('determined'), passage: PASSAGE_CHILD, title: "The child is the father of man" },
  { match: q => q.question.includes('fill in blank no.') && q.options && q.options.includes('delete') && q.options.includes('efface'), passage: PASSAGE_CHILD, title: "The child is the father of man" },
  { match: q => q.question.includes('fill in blank no.') && q.options && q.options.includes('suggestions') && q.options.includes('indications'), passage: PASSAGE_CHILD, title: "The child is the father of man" },
  { match: q => q.question.includes('fill in blank no.') && q.options && q.options.includes('impressionable') && q.options.includes('rigid'), passage: PASSAGE_CHILD, title: "The child is the father of man" },
  { match: q => q.question.includes('fill in blank no.') && q.options && q.options.includes('contracts') && q.options.includes('hardens'), passage: PASSAGE_CHILD, title: "The child is the father of man" },
  { match: q => q.question.includes('fill in blank no.') && q.options && q.options.includes('tactics') && q.options.includes('conduct'), passage: PASSAGE_CHILD, title: "The child is the father of man" },
  { match: q => q.question.includes('fill in blank no.') && q.options && q.options.includes('is developing') && q.options.includes('are developed'), passage: PASSAGE_CHILD, title: "The child is the father of man" },
  { match: q => q.question.includes('fill in blank no.') && q.options && q.options.includes('concessions') && q.options.includes('exemptions'), passage: PASSAGE_CHILD, title: "The child is the father of man" },

  // Set 2: Corruption (Q11-20)
  { match: q => q.question.includes('fill in blank no.') && q.options && q.options.includes('vigour') && q.options.includes('reign'), passage: PASSAGE_CORRUPTION, title: "Hieun Tsang and corruption in India" },
  { match: q => q.question.includes('fill in blank no.') && q.options && (q.options.includes('by') && q.options.includes('like') && q.options.includes('such') && q.options.includes('as')), passage: PASSAGE_CORRUPTION, title: "Hieun Tsang and corruption in India" },
  { match: q => q.question.includes('fill in blank no.') && q.options && q.options.includes('ranked') && q.options.includes('stacked'), passage: PASSAGE_CORRUPTION, title: "Hieun Tsang and corruption in India" },
  { match: q => q.question.includes('fill in blank no.') && q.options && (q.options.includes('the') && q.options.includes('any') && q.options.includes('some') && q.options.includes('a')) && q.options.length === 4, passage: PASSAGE_CORRUPTION, title: "Hieun Tsang and corruption in India" },
  { match: q => q.question.includes('fill in blank no.') && q.options && q.options.includes('declare') && q.options.includes('swear'), passage: PASSAGE_CORRUPTION, title: "Hieun Tsang and corruption in India" },
  { match: q => q.question.includes('fill in blank no.') && q.options && q.options.includes('prejudice') && q.options.includes('sacrifice'), passage: PASSAGE_CORRUPTION, title: "Hieun Tsang and corruption in India" },
  { match: q => q.question.includes('fill in blank no.') && q.options && q.options.includes('vilest') && q.options.includes('vile'), passage: PASSAGE_CORRUPTION, title: "Hieun Tsang and corruption in India" },
  { match: q => q.question.includes('fill in blank no.') && q.options && q.options.includes('malaise') && q.options.includes('despair'), passage: PASSAGE_CORRUPTION, title: "Hieun Tsang and corruption in India" },
  { match: q => q.question.includes('fill in blank no.') && q.options && q.options.includes('vitals') && q.options.includes('threats'), passage: PASSAGE_CORRUPTION, title: "Hieun Tsang and corruption in India" },
  { match: q => q.question.includes('fill in blank no.') && q.options && q.options.includes('performers') && q.options.includes('onlookers'), passage: PASSAGE_CORRUPTION, title: "Hieun Tsang and corruption in India" },

  // Set 3: Piano/Instant Coffee (Q21-25) - match by question text
  { match: q => q.question.includes('activity requires too much effort we feel'), passage: PASSAGE_PIANO, title: "Instant coffee attitude vs bread-making attitude" },
  { match: q => q.question.includes('bread-making') || q.question.includes('bread making'), passage: PASSAGE_PIANO, title: "Instant coffee attitude vs bread-making attitude" },
  { match: q => q.question.includes('young lady approach the piano teacher'), passage: PASSAGE_PIANO, title: "Instant coffee attitude vs bread-making attitude" },
  { match: q => q.question.includes("'instant coffee attitude'") || q.question.includes('instant coffee attitude'), passage: PASSAGE_PIANO, title: "Instant coffee attitude vs bread-making attitude" },
  { match: q => q.question.includes('advocate for a life of fulfilment'), passage: PASSAGE_PIANO, title: "Instant coffee attitude vs bread-making attitude" },

  // Set 4: Nature/Environment (Q26-30)
  { match: q => q.question.includes('fill in blank no.') && q.options && q.options.includes('assume') && q.options.includes('grasp') && q.options.includes('receive'), passage: PASSAGE_NATURE, title: "Nature and environmental damage" },
  { match: q => q.question.includes('fill in blank no.') && q.options && q.options.includes('attainable') && q.options.includes('containable'), passage: PASSAGE_NATURE, title: "Nature and environmental damage" },
  { match: q => q.question.includes('fill in blank no.') && q.options && q.options.includes('commonplace') && q.options.includes('spectacular'), passage: PASSAGE_NATURE, title: "Nature and environmental damage" },
  { match: q => q.question.includes('fill in blank no.') && q.options && q.options.includes('who') && q.options.includes('whose') && q.options.includes('which') && q.options.includes('whom'), passage: PASSAGE_NATURE, title: "Nature and environmental damage" },
  { match: q => q.question.includes('fill in blank no.') && q.options && q.options.includes('undergo') && q.options.includes('encounter') && q.options.includes('interact'), passage: PASSAGE_NATURE, title: "Nature and environmental damage" },

  // Set 5: Noise Pollution (Q31-35) - match by question text
  { match: q => q.question.includes('Loudspeakers with low decibel') || (q.question.includes('FALSE') && q.options && q.options.some(o => o.includes('Loudspeakers'))), passage: PASSAGE_NOISE, title: "Noise pollution" },
  { match: q => q.question.includes('Recreational noise is created during'), passage: PASSAGE_NOISE, title: "Noise pollution" },
  { match: q => q.question.includes('noise become a status symbol'), passage: PASSAGE_NOISE, title: "Noise pollution" },
  { match: q => q.question.includes('Noise can be differentiated from other pollutants'), passage: PASSAGE_NOISE, title: "Noise pollution" },
  { match: q => q.question.includes('noise does NOT cause') || (q.question.includes('AIIMS') && q.question.includes('noise')), passage: PASSAGE_NOISE, title: "Noise pollution" },

  // Set 6: Puppetry (Q36-45)
  { match: q => (q.question === 'The above passage is:' || q.question.includes('above passage is:')) && q.options && q.options.includes('narrative') && q.options.includes('factual'), passage: PASSAGE_PUPPET, title: "The art of puppetry" },
  { match: q => q.question.includes('puppet is derived from the Latin word'), passage: PASSAGE_PUPPET, title: "The art of puppetry" },
  { match: q => q.question.includes('light source is placed behind the shadow puppets'), passage: PASSAGE_PUPPET, title: "The art of puppetry" },
  { match: q => q.question.includes('string puppets is FALSE'), passage: PASSAGE_PUPPET, title: "The art of puppetry" },
  { match: q => q.question.includes('NOT a benefit of the art of puppetry'), passage: PASSAGE_PUPPET, title: "The art of puppetry" },
  { match: q => q.question.includes('puppetry, are dying because'), passage: PASSAGE_PUPPET, title: "The art of puppetry" },
  { match: q => q.question.includes('art of puppetry first come into being'), passage: PASSAGE_PUPPET, title: "The art of puppetry" },
  { match: q => q.question.includes('puppetry was popular in artistic circles'), passage: PASSAGE_PUPPET, title: "The art of puppetry" },
  { match: q => q.question.includes('upper limbs of stick puppets'), passage: PASSAGE_PUPPET, title: "The art of puppetry" },
  { match: q => q.question.includes('Limbs of the puppets are loosely-jointed'), passage: PASSAGE_PUPPET, title: "The art of puppetry" },

  // Set 7: Blind Opera (Q46-55)
  { match: q => q.question.includes('FALSE') && q.options && q.options.some(o => o.includes('Blind Opera')), passage: PASSAGE_BLIND, title: "Blind Opera" },
  { match: q => q.question.includes('biggest problem in presenting the troupe'), passage: PASSAGE_BLIND, title: "Blind Opera" },
  { match: q => q.question.includes('actors of Blind Opera ascertain'), passage: PASSAGE_BLIND, title: "Blind Opera" },
  { match: q => q.question.includes('NOT feel secluded'), passage: PASSAGE_BLIND, title: "Blind Opera" },
  { match: q => q.question.includes("contradicts the writer's view") && q.options && q.options.some(o => o.includes('Blind Opera')), passage: PASSAGE_BLIND, title: "Blind Opera" },
  { match: q => q.question.includes('NOT a key element inherent to any theatre'), passage: PASSAGE_BLIND, title: "Blind Opera" },
  { match: q => q.question.includes('binding factor for the members of Blind Opera'), passage: PASSAGE_BLIND, title: "Blind Opera" },
  { match: q => q.question.includes('happy occasion mentioned in the beginning'), passage: PASSAGE_BLIND, title: "Blind Opera" },
  { match: q => q.question.includes('greater intent behind Blind Opera'), passage: PASSAGE_BLIND, title: "Blind Opera" },
  { match: q => q.question.includes('members of Blind Opera demonstrate'), passage: PASSAGE_BLIND, title: "Blind Opera" },

  // Paper 2 Comprehension Sets
  // Volcano Walking (Q1-10 of Paper 2)
  { match: q => q.question.includes("ANTONYM") && q.question.includes("TRANQUILLITY"), passage: PASSAGE_VOLCANO, title: "Volcano Walking in Iceland" },
  { match: q => q.question.includes('sleeping giant') && q.question.includes('passage'), passage: PASSAGE_VOLCANO, title: "Volcano Walking in Iceland" },
  { match: q => q.question.includes('tone of the passage') && q.options && q.options.some(o => o.includes('laudatory')), passage: PASSAGE_VOLCANO, title: "Volcano Walking in Iceland" },
  { match: q => q.question.includes('most appropriate title') && q.options && q.options.some(o => o.includes('Volcano')), passage: PASSAGE_VOLCANO, title: "Volcano Walking in Iceland" },
  { match: q => q.question.includes('appropriate meaning') && q.question.includes('ETHEREAL'), passage: PASSAGE_VOLCANO, title: "Volcano Walking in Iceland" },
  { match: q => q.question.includes('factual') && q.question.includes('passage') && q.options && q.options.some(o => o.includes('factual') || o.includes('descriptiv')), passage: PASSAGE_VOLCANO, title: "Volcano Walking in Iceland" },
  { match: q => q.question.includes('synonymous') && q.question.includes('EXTORTIONATE'), passage: PASSAGE_VOLCANO, title: "Volcano Walking in Iceland" },
  { match: q => q.question.includes('NOT correct according to the passage') && q.options && q.options.some(o => o.includes('Stefansson')), passage: PASSAGE_VOLCANO, title: "Volcano Walking in Iceland" },
  { match: q => q.question.includes('According to the passage') && q.question.includes('awe-inspiring') && q.question.includes('crater'), passage: PASSAGE_VOLCANO, title: "Volcano Walking in Iceland" },
  { match: q => q.question.includes("author's feelings") && q.options && q.options.some(o => o.includes('trespass')), passage: PASSAGE_VOLCANO, title: "Volcano Walking in Iceland" },

  // Stomach/Beaumont (Q11-20 of Paper 2)
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('disclosed') && q.options.includes('revealed'), passage: PASSAGE_STOMACH, title: "The working of the stomach" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('accidentally') && q.options.includes('seriously'), passage: PASSAGE_STOMACH, title: "The working of the stomach" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('injured') && q.options.includes('damaged'), passage: PASSAGE_STOMACH, title: "The working of the stomach" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('his') && q.options.includes('the') && q.options.includes('their') && q.options.includes('its'), passage: PASSAGE_STOMACH, title: "The working of the stomach" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('physician') && q.options.includes('surgeon'), passage: PASSAGE_STOMACH, title: "The working of the stomach" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('would') && q.options.includes('could') && q.options.includes('should') && q.options.includes('might'), passage: PASSAGE_STOMACH, title: "The working of the stomach" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('golden') && q.options.includes('fortunate'), passage: PASSAGE_STOMACH, title: "The working of the stomach" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('through') && q.options.includes('within') && q.options.includes('over') && q.options.includes('behind'), passage: PASSAGE_STOMACH, title: "The working of the stomach" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('observed') && q.options.includes('inferred') && q.options.includes('discovered'), passage: PASSAGE_STOMACH, title: "The working of the stomach" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('which') && q.options.includes('that') && q.options.includes('what') && q.options.includes('it'), passage: PASSAGE_STOMACH, title: "The working of the stomach" },

  // Greenhouse (Q21-25 of Paper 2)
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('effect') && q.options.includes('affect'), passage: PASSAGE_GREENHOUSE, title: "Greenhouse effect" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('more') && q.options.includes('much') && q.options.includes('many') && q.options.includes('little'), passage: PASSAGE_GREENHOUSE, title: "Greenhouse effect" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('observed') && q.options.includes('watched') && q.options.includes('realised'), passage: PASSAGE_GREENHOUSE, title: "Greenhouse effect" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes("Earth's") && q.options.includes('its'), passage: PASSAGE_GREENHOUSE, title: "Greenhouse effect" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('compel') && q.options.includes('cause') && q.options.includes('allow'), passage: PASSAGE_GREENHOUSE, title: "Greenhouse effect" },

  // Refugees/Displaced People (Q26-30 of Paper 2)
  { match: q => q.question.includes('passage presents the findings of a United Nations'), passage: PASSAGE_REFUGEES, title: "Forcibly displaced people worldwide" },
  { match: q => q.question.includes('NOT correct') && q.options && q.options.some(o => o.includes('Turkey')), passage: PASSAGE_REFUGEES, title: "Forcibly displaced people worldwide" },
  { match: q => q.question.includes('NOT true') && q.options && q.options.some(o => o.includes('Ethiopia')), passage: PASSAGE_REFUGEES, title: "Forcibly displaced people worldwide" },
  { match: q => q.question.includes('mainly about') && q.options && q.options.some(o => o.includes('refugee')), passage: PASSAGE_REFUGEES, title: "Forcibly displaced people worldwide" },
  { match: q => q.question.includes('inferred') && q.options && q.options.some(o => o.includes('factual')), passage: PASSAGE_REFUGEES, title: "Forcibly displaced people worldwide" },

  // Savanna (Q31-40 of Paper 2)
  { match: q => q.question.includes('main theme of the passage') && q.options && q.options.some(o => o.includes('savanna') || o.includes('Savanna')), passage: PASSAGE_SAVANNA, title: "The savanna landscape" },
  { match: q => q.question.includes('kind of a passage') && q.options && q.options.some(o => o.includes('Descriptive')), passage: PASSAGE_SAVANNA, title: "The savanna landscape" },
  { match: q => q.question.includes('NOT true') && q.options && q.options.some(o => o.includes('savanna') || o.includes('Savanna') || o.includes('elephant') || o.includes('giraffe')), passage: PASSAGE_SAVANNA, title: "The savanna landscape" },

  // Big Cat Phenomenon (Q41-45 of Paper 2)
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('explored') && q.options.includes('examined'), passage: PASSAGE_BIGCAT, title: "Big cat phenomenon research" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('something') && q.options.includes('creatures'), passage: PASSAGE_BIGCAT, title: "Big cat phenomenon research" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('involved') && q.options.includes('comprised'), passage: PASSAGE_BIGCAT, title: "Big cat phenomenon research" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('recovered') && q.options.includes('collected'), passage: PASSAGE_BIGCAT, title: "Big cat phenomenon research" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('circumstances') && q.options.includes('situations'), passage: PASSAGE_BIGCAT, title: "Big cat phenomenon research" },

  // Twins Festival (Q51-60 of Paper 2)
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('almost') && q.options.includes('about') && q.options.includes('around') && q.options.includes('nearly'), passage: PASSAGE_TWINS, title: "Twins Days Festival" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('affair') && q.options.includes('event') && q.options.includes('function'), passage: PASSAGE_TWINS, title: "Twins Days Festival" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('contests') && q.options.includes('competitions'), passage: PASSAGE_TWINS, title: "Twins Days Festival" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('greatest') && q.options.includes('largest'), passage: PASSAGE_TWINS, title: "Twins Days Festival" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('comparable') && q.options.includes('similar'), passage: PASSAGE_TWINS, title: "Twins Days Festival" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('produces') && q.options.includes('gives') && q.options.includes('results'), passage: PASSAGE_TWINS, title: "Twins Days Festival" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('rate') && q.options.includes('proportion') && q.options.includes('ratio'), passage: PASSAGE_TWINS, title: "Twins Days Festival" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('attributed') && q.options.includes('dedicated'), passage: PASSAGE_TWINS, title: "Twins Days Festival" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('uncontested') && q.options.includes('unproven'), passage: PASSAGE_TWINS, title: "Twins Days Festival" },
  { match: q => q.question.includes('fill in blank') && q.options && q.options.includes('treasured') && q.options.includes('golden'), passage: PASSAGE_TWINS, title: "Twins Days Festival" },

  // World Population (Q46-50 of Paper 2)
  { match: q => q.question.includes('NOT correct') && q.options && q.options.some(o => o.includes('sub-Saharan')), passage: PASSAGE_POPULATION, title: "World population growth" },
  { match: q => q.question.includes('United Nations report') && q.question.includes('mainly reg'), passage: PASSAGE_POPULATION, title: "World population growth" },
];

let patched = 0;
for (const q of data.questions) {
  if (q.subject !== 'english') continue;
  if (q.passage && q.isComprehension) continue; // already patched

  for (const rule of patchRules) {
    try {
      if (rule.match(q)) {
        q.passage = rule.passage;
        q.passageTitle = rule.title;
        q.isComprehension = true;
        q.topic = "Reading Comprehension";
        q.updatedAt = new Date().toISOString();
        patched++;
        break;
      }
    } catch(e) {}
  }
}

data.updatedAt = new Date().toISOString();
fs.writeFileSync(bankPath, JSON.stringify(data, null, 2));

console.log(`\n=== PASSAGE PATCH RESULTS ===`);
console.log(`Questions patched with passage data: ${patched}`);

// Verify
const comp = data.questions.filter(q => q.isComprehension);
console.log(`Total comprehension questions now: ${comp.length}`);
const byTitle = {};
comp.forEach(q => { const t = q.passageTitle || 'unknown'; byTitle[t] = (byTitle[t] || 0) + 1; });
Object.entries(byTitle).sort((a,b) => b[1] - a[1]).forEach(([t, c]) => console.log(`  ${t}: ${c}`));
