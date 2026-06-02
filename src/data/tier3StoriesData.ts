/**
 * Tier 3 stories — Grades 4-5 reading level.
 * Chapter stories (~700 words, 4-5 named sections), 5 vocab words,
 * 5 fact/opinion statements, 3 char trait questions.
 */
import type { CombinedStoryData } from "@/lib/ai";

const adventure: CombinedStoryData = {
  title: "The Cartographer's Secret",
  genre: "Adventure",
  story: `Chapter 1: The Hidden Drawer
Eleven-year-old Rowan discovered the map-maker's studio by accident. While helping his grandfather clear out the old lighthouse keeper's cottage, he pulled open a warped drawer and found a rolled parchment sealed with wax. The seal bore the image of a compass rose — the same symbol that appeared on every antique chart lining the cottage walls. His grandfather went pale when he saw it. "Put it back," he said quietly. Rowan did not put it back.

Chapter 2: The Language of Lines
That night, Rowan spread the parchment across his sleeping bag. The map was dense with notation: latitude markings, depth soundings, and a legend written in a cipher he had never seen. But along the left margin, in faded pencil, someone had begun a translation. The handwriting matched the journals stacked in the cottage — the work of Elara Voss, a cartographer who had vanished at sea forty years ago. Whatever she had been documenting, she had never finished the key.

Chapter 3: A Collaborator
Rowan photographed every page of the journals and sent them to his pen pal, Suki, who lived in Kyoto and had won a regional cryptography contest. Within two days she replied with a partial decode: the cipher substituted compass directions for vowels. Together they worked through the legend, and a location emerged — not a buried treasure, but a series of underwater caves off the northern headland that Elara believed contained bioluminescent ecosystems undocumented by science.

Chapter 4: The Headland
Rowan borrowed a kayak and paddled to the headland at low tide. The cave entrance was exactly where the map showed. Inside, the walls glowed with soft blue-green light — colonies of organisms pulsing faintly in the dark water. He took careful notes, sketching the shapes as Elara's journals had taught him. He understood now why she had kept the location secret: the wrong kind of attention would destroy what she had spent years protecting.

Chapter 5: The Choice
Back at the cottage, Rowan's grandfather waited on the step. Rowan handed him the parchment. "She didn't vanish because she was lost," Rowan said. "She vanished because she was hiding." His grandfather's eyes filled. He nodded slowly. They agreed: the caves would be reported — but only to a marine conservation trust, under the condition of protected status. Elara Voss's life work would finally be finished, carefully, by people who understood what it meant to keep a secret worth keeping.`,
  readingExtras: {
    keyPhrases: ["The seal bore the image of a compass rose."],
    sectionTitles: [
      "Chapter 1: The Hidden Drawer",
      "Chapter 2: The Language of Lines",
      "Chapter 3: A Collaborator",
      "Chapter 4: The Headland",
      "Chapter 5: The Choice",
    ],
  },
  vocabulary: {
    words: [
      { word: "cartographer", options: ["a person who makes maps", "a deep-sea diver", "a lighthouse keeper", "a code-breaker"], correctIndex: 0 },
      { word: "cipher",       options: ["a secret code or system of symbols", "a type of underwater cave", "a navigational instrument", "a wax seal stamp"], correctIndex: 0 },
      { word: "bioluminescent", options: ["producing light by a living organism", "relating to deep underwater pressure", "describing ancient handwriting", "belonging to a hidden archive"], correctIndex: 0 },
      { word: "notation",    options: ["a system of written symbols representing information", "the wax used to seal documents", "the art of kayaking in ocean caves", "the depth of underwater caves"], correctIndex: 0 },
      { word: "conservation", options: ["the protection of natural environments or species", "the process of decoding ciphers", "the study of ancient cartography", "the collection of rare maps"], correctIndex: 0 },
    ],
  },
  factOpinion: {
    statements: [
      { text: "Rowan found the parchment sealed with a compass-rose wax seal.", type: "fact", whyCorrect: "This is stated directly in the story — it can be verified by re-reading." },
      { text: "Elara Voss made the most important scientific discovery in the region's history.", type: "opinion", whyCorrect: "\"Most important\" is a judgment that readers could reasonably debate." },
      { text: "Suki decoded the cipher by matching compass directions to vowels.", type: "fact", whyCorrect: "The story describes exactly how the cipher worked." },
      { text: "Reporting the caves to a conservation trust was the only responsible decision.", type: "opinion", whyCorrect: "Others might reasonably argue for different approaches to protecting the caves." },
      { text: "Elara Voss had worked on the journals for years before she vanished.", type: "fact", whyCorrect: "The story states she spent years documenting the location." },
    ],
  },
  summaries: {
    options: [
      { text: "Rowan finds a hidden map, decodes it with a friend, discovers secret bioluminescent caves, and chooses to protect them through conservation.", correct: true, whyCorrect: "This traces the complete arc — discovery, decoding, exploration, and ethical resolution." },
      { text: "Rowan and his grandfather restore the lighthouse cottage and donate it to a marine museum.", correct: false },
      { text: "Suki travels from Kyoto to help Rowan excavate buried treasure from underwater caves.", correct: false },
    ],
  },
  characterTraits: {
    questions: [
      { question: "Which word best describes Rowan's approach to problems?", options: ["Methodical and persistent", "Reckless and impatient", "Timid and easily discouraged"], correctIndex: 0, whyCorrect: "Rowan carefully photographs journals, collaborates with Suki, and takes detailed notes — all evidence of methodical thinking." },
      { question: "What does Rowan's decision about the caves reveal about his character?", options: ["He is principled and thinks beyond personal gain", "He is secretive and untrustworthy", "He is indifferent to the natural world"], correctIndex: 0, whyCorrect: "Reporting to a conservation trust rather than publicizing the discovery shows he values protection over recognition." },
      { question: "How does Elara Voss's character compare to Rowan's?", options: ["Both prioritize protecting something valuable over personal fame", "Elara sought publicity while Rowan preferred secrecy", "Elara was careless while Rowan was careful"], correctIndex: 0, whyCorrect: "Elara spent years guarding the caves' location; Rowan continues that same protective instinct." },
    ],
  },
  compareContrast: {
    story2: `When twelve-year-old Amara found a bundle of letters tucked inside a library book, she assumed they were trash. Then she noticed the postmarks — each one from a different country, each written in a different language, all addressed to the same person: "The Keeper of Small Wonders." Amara spent weeks tracing the senders. They turned out to be a loose network of amateur naturalists from the 1960s who had each documented a species that had since been declared extinct. Their records, scattered across attics on three continents, had never been compiled. Amara petitioned her school to help digitize and donate the letters to a natural history archive.`,
    question: "How are Rowan's and Amara's discoveries similar, and how do the responsibilities they take on differ?",
    sampleAnswer: "Both Rowan and Amara uncover hidden scientific records that deserve careful protection. Rowan's discovery involves a living, fragile ecosystem that requires immediate conservation action, while Amara's involves historical documents that need preservation and compilation. Rowan acts locally and secretly; Amara builds a collaborative, public effort.",
  },
};

const fantasy: CombinedStoryData = {
  title: "The Last Dragon Keeper",
  genre: "Fantasy & Magic",
  story: `Chapter 1: The Egg
Nobody believed the old stories about dragons — nobody except Fen. So when the river flooded the eastern pasture and left behind a speckled grey stone the size of a watermelon, Fen knew immediately what it was. She brought it home wrapped in a horse blanket, hid it under her bed, and began warming it with a lamp the way the Field Guide to Rare Creatures described. Two weeks later, the stone cracked.

Chapter 2: Ember
The creature that hatched was the size of a large cat, with scales the color of embers and enormous amber eyes that tracked Fen's every movement. Fen named her Ember. Caring for her was complicated: Ember ate only live fish, slept in temperatures that would have melted a wax candle, and communicated through a low hum that Fen gradually learned to interpret. Fear meant a quick staccato pulse. Curiosity sounded like a long, rising note.

Chapter 3: The Problem of Growing
By midsummer, Ember was the size of a pony and impossible to hide. The village carpenter had already complained about scorch marks on his fence. Fen knew the old guide's warning by heart: a dragon discovered before bonding was complete would be hunted. Bonding required trust built through three shared dangers — not manufactured ones, but genuine risks faced together. They had faced one: the flooding river. Two more remained.

Chapter 4: Fire and Ice
The second danger came in August, when a drought dried the mountain spring and the village's mill pond began to fail. Ember, following some instinct Fen did not understand, flew low over the eastern ridge and found a hidden spring the villagers had forgotten. They brought the water back together, Fen guiding on horseback while Ember cleared the rockslide blocking the channel. The villagers saw Ember that day. None of them called for a hunt.

Chapter 5: The Keeper's Oath
The third danger was the hardest: a fever that nearly killed Ember in September. Fen stayed awake for four nights, following the guide's instructions for treating dragon fever with mineral-rich clay and silence. On the fifth morning, Ember opened her eyes and hummed the long, rising note — curiosity, not fear. The guide said the bond was complete when a dragon chose to stay despite having the strength to leave. That afternoon, Ember could have flown to the mountains. She curled up at Fen's feet instead. Fen understood, at last, what it meant to be a keeper.`,
  readingExtras: {
    keyPhrases: ["Fear meant a quick staccato pulse."],
    sectionTitles: [
      "Chapter 1: The Egg",
      "Chapter 2: Ember",
      "Chapter 3: The Problem of Growing",
      "Chapter 4: Fire and Ice",
      "Chapter 5: The Keeper's Oath",
    ],
  },
  vocabulary: {
    words: [
      { word: "staccato",   options: ["short, sharp, disconnected sounds or movements", "a slow, melancholy rhythm", "a high-pitched continuous tone", "a type of dragon communication code"], correctIndex: 0 },
      { word: "instinct",   options: ["an inborn pattern of behavior not based on learning", "a deliberate plan formed through reasoning", "a signal sent between bonded creatures", "a fever symptom in large reptiles"], correctIndex: 0 },
      { word: "bonding",    options: ["forming a deep mutual trust between two beings", "a process of fireproofing materials", "the act of hiding something valuable", "the ritual of naming a creature"], correctIndex: 0 },
      { word: "interpret",  options: ["to understand or explain the meaning of something", "to ignore communication in favor of action", "to translate written text into sound", "to predict future behavior from past events"], correctIndex: 0 },
      { word: "manufactured", options: ["artificially created rather than naturally occurring", "constructed from fire-resistant materials", "originating from dragon territory", "relating to bonding ceremonies"], correctIndex: 0 },
    ],
  },
  factOpinion: {
    statements: [
      { text: "The dragon egg was about the size of a watermelon.", type: "fact", whyCorrect: "The story states this size directly — it can be confirmed by re-reading." },
      { text: "Keeping a dragon is more rewarding than any other responsibility a person can take on.", type: "opinion", whyCorrect: "\"More rewarding than any other\" is a personal judgment that different readers could dispute." },
      { text: "Ember communicated fear through a quick staccato pulse.", type: "fact", whyCorrect: "The guide Fen used defines this communication pattern explicitly in the story." },
      { text: "The villagers should have helped Fen care for Ember from the beginning.", type: "opinion", whyCorrect: "Whether the villagers had that obligation is a matter of judgment, not something the story states." },
      { text: "Fen stayed awake for four nights treating Ember's fever.", type: "fact", whyCorrect: "The story says exactly four nights — a specific, verifiable detail." },
    ],
  },
  summaries: {
    options: [
      { text: "Fen hatches and raises a dragon named Ember, faces three shared dangers, and completes a bond built on genuine trust.", correct: true, whyCorrect: "This covers the full arc: the egg, the dangers, and the completed bond — without adding invented details." },
      { text: "Fen steals a dragon egg from a mountain nest and trains it to fight for the village.", correct: false },
      { text: "The village carpenter reports Ember to dragon hunters, forcing Fen to release her into the wild.", correct: false },
    ],
  },
  characterTraits: {
    questions: [
      { question: "What does Fen's decision to hide Ember reveal about her character?", options: ["She is protective and willing to take personal risks for those she cares for", "She is dishonest and avoids all community responsibility", "She is reckless and ignores consequences"], correctIndex: 0, whyCorrect: "Hiding Ember despite the risk to herself shows protectiveness; she later faces danger alongside Ember, not from it." },
      { question: "How does Fen demonstrate patience in the story?", options: ["She spends weeks warming the egg and four nights nursing Ember's fever", "She waits for the village carpenter to stop complaining before acting", "She postpones looking for the hidden spring until autumn"], correctIndex: 0, whyCorrect: "Both the incubation and the fever-watch show Fen sustaining effort over a long period without giving up." },
      { question: "What does Ember's choice to stay at the end suggest about her character?", options: ["She values the bond she and Fen built over her own freedom", "She is too weak after her illness to fly to the mountains", "She stays out of habit, not genuine affection"], correctIndex: 0, whyCorrect: "The guide specifically says the bond is proven when the dragon stays despite having the strength to leave." },
    ],
  },
  compareContrast: {
    story2: `In the mountain village of Thresh, a boy named Corin found a wounded gryphon tangled in a wire fence. The Field Guide he'd inherited said gryphons could not be tamed — only treated and released. Corin splinted its wing, fed it raw venison for six weeks, and kept it calm by reading aloud each evening. The morning the gryphon was well enough to fly, it circled the village three times before disappearing into the clouds. Corin returned to his empty barn and found a single copper feather on the hay.`,
    question: "How are Fen and Corin alike in how they care for magical creatures, and how do their outcomes differ?",
    sampleAnswer: "Both Fen and Corin offer dedicated, careful care to magical creatures in need, following guides and accepting personal sacrifice. But their outcomes differ: Fen's story ends with a permanent bond — Ember chooses to stay. Corin's story ends with a beautiful, deliberate departure — the gryphon was never meant to stay, and the copper feather is a farewell, not a bond.",
  },
};

const mystery: CombinedStoryData = {
  title: "The Lighthouse Cipher",
  genre: "Mystery",
  story: `Chapter 1: The New Keeper
Priya had been volunteering at the Harrow Point Lighthouse museum for three weeks when she found the first message. It was scratched into the underside of the lamp housing: four rows of numbers separated by slashes. The museum director, Mr. Olesk, said they were just inventory codes. Priya did not believe him.

Chapter 2: A Pattern
She photographed the numbers and found two more sets in unexpected places — one etched into the brass railing of the observation deck, one pressed into the clay floor of the old fog-signal room. All three used the same structure: groups of two numbers, always between 01 and 26. Priya spent a study hall converting them to letters using A=1, B=2. The lamp housing gave her: T-I-D-E-S-T-U-R-N. The railing: L-O-O-K-B-E-L-O-W. She needed the third.

Chapter 3: The Fog Room
Translating the clay-floor inscription was harder — the numerals had smudged over decades. Priya borrowed the museum's imaging lamp, which made faint impressions visible, and worked for an hour before the full message appeared: F-I-N-D-T-H-E-L-O-G. She started with the museum's public logbook, which held records from 1920 to 1975. The entry dated October 14, 1943 was written in different handwriting from the rest. It described a small fishing vessel navigating without lights during a wartime blackout, guided through the rocks by the lighthouse keeper using a mirror-signal pattern unknown to naval authorities.

Chapter 4: The Keeper's Risk
The entry was signed not with a name but with the same compass-rose symbol Priya had seen stamped in the keeper's private collection. She found the keeper's personal log in a donation box that had sat unopened for thirty years. Its final entry explained everything: the keeper had risked her commission — and her freedom — to guide the vessel, which was carrying civilian refugees, not contraband. She had never reported it because she did not know if she had broken a law worth keeping.

Chapter 5: Priya's Report
Priya brought her full findings to Mr. Olesk. He was quiet for a long time. Then he said the museum had been trying to identify the keeper's actions for two decades, without success. He asked Priya to write the exhibit text herself. The cipher that had stumped historians turned out to require only patience, an imaging lamp, and someone who refused to be told it was just an inventory code.`,
  readingExtras: {
    keyPhrases: ["She needed the third."],
    sectionTitles: [
      "Chapter 1: The New Keeper",
      "Chapter 2: A Pattern",
      "Chapter 3: The Fog Room",
      "Chapter 4: The Keeper's Risk",
      "Chapter 5: Priya's Report",
    ],
  },
  vocabulary: {
    words: [
      { word: "inscription",  options: ["words or symbols carved or written onto a surface", "a type of navigation logbook", "a wartime communication signal", "a museum inventory system"], correctIndex: 0 },
      { word: "commission",   options: ["an official rank or authority granted by an organization", "a payment made for voluntary work", "a written record of lighthouse operations", "a type of mirror-signal pattern"], correctIndex: 0 },
      { word: "contraband",   options: ["goods that are illegal to possess or transport", "civilian passengers on a naval vessel", "a coded message hidden in a public space", "a wartime blackout order"], correctIndex: 0 },
      { word: "cipher",       options: ["a secret system for encoding messages", "a preserved record of lighthouse keeper duties", "a brass railing used on observation decks", "a naval authority during wartime"], correctIndex: 0 },
      { word: "civilian",     options: ["a person not in the armed forces", "a keeper who operates a lighthouse independently", "a navigator who ignores official signals", "a historian who studies wartime records"], correctIndex: 0 },
    ],
  },
  factOpinion: {
    statements: [
      { text: "Priya found three sets of numbers hidden in the lighthouse.", type: "fact", whyCorrect: "The story describes each location: the lamp housing, the railing, and the fog-signal room." },
      { text: "The lighthouse keeper made the most courageous decision of anyone in the wartime region.", type: "opinion", whyCorrect: "\"Most courageous\" compares the keeper to everyone else in a region — a judgment readers could debate." },
      { text: "The keeper's personal log had sat in a donation box for thirty years.", type: "fact", whyCorrect: "The story states this timeline directly and specifically." },
      { text: "Mr. Olesk should have opened the donation box much sooner.", type: "opinion", whyCorrect: "Whether he had an obligation to open it sooner involves a judgment about responsibility that differs by perspective." },
      { text: "The 1943 log entry was written in different handwriting from the rest of the logbook.", type: "fact", whyCorrect: "Priya observes this directly when reading the public logbook." },
    ],
  },
  summaries: {
    options: [
      { text: "Priya decodes a three-part cipher hidden in the lighthouse, uncovering a keeper who risked her career to rescue civilian refugees during wartime.", correct: true, whyCorrect: "This covers all key elements: the cipher, the discovery process, and the keeper's true act." },
      { text: "Priya exposes museum director Mr. Olesk as the person who hid coded messages to conceal stolen wartime supplies.", correct: false },
      { text: "Priya restores a damaged lighthouse lamp and discovers that its inventor left behind a treasure map.", correct: false },
    ],
  },
  characterTraits: {
    questions: [
      { question: "What does Priya's persistence in decoding the numbers reveal about her?", options: ["She is analytical and refuses to accept dismissive explanations", "She distrusts all authority figures by default", "She prefers working alone and rejects collaboration"], correctIndex: 0, whyCorrect: "Mr. Olesk dismisses the codes as inventory numbers; Priya photographs them and investigates anyway — a clear example of not settling for easy answers." },
      { question: "How does the lighthouse keeper's character contrast with how Priya initially expects her story to end?", options: ["The keeper acted from compassion rather than self-interest, which surprises Priya's assumption of a simpler mystery", "The keeper turned out to be dishonest, confirming Priya's suspicion of a cover-up", "The keeper's identity was never revealed, leaving the mystery unresolved"], correctIndex: 0, whyCorrect: "Priya starts looking for a puzzle; what she finds is a moral story — a keeper who chose a dangerous act of mercy." },
      { question: "What quality do Priya and the lighthouse keeper share?", options: ["Both act on their convictions despite uncertainty about the consequences", "Both prefer to work through official channels rather than independently", "Both are motivated primarily by recognition and documentation"], correctIndex: 0, whyCorrect: "The keeper guided the vessel without knowing if it was legal; Priya investigates without knowing if it matters — both act on conviction first." },
    ],
  },
  compareContrast: {
    story2: `At the edge of a former mining town, a girl named Dex found an old dispatch board nailed to the inside of a collapsed company shack. The board held dozens of handwritten notes — shift assignments, equipment requests, one unsigned letter complaining that "the water has changed color and no one will answer." Dex traced the unsigned letter to a retired miner who confirmed that the company had diverted toxic runoff into the town's creek for three years before the mine closed. The evidence had been there for decades. Dex submitted it to the county environmental office and a local newspaper simultaneously.`,
    question: "How are Priya's and Dex's investigations similar, and how does the nature of what they uncover differ?",
    sampleAnswer: "Both Priya and Dex investigate old, overlooked records that others have dismissed, and both uncover hidden truths that deserve public attention. Priya's discovery reveals an act of moral courage — a keeper who broke rules to save lives. Dex's discovery reveals an act of harm — a company that broke rules to avoid accountability. One mystery ends with honoring someone; the other ends with holding someone responsible.",
  },
};

const silly: CombinedStoryData = {
  title: "Operation Spaghetti",
  genre: "Silly & Funny",
  story: `Chapter 1: The Plan
It began, as most disasters do, with a brilliant idea. Twelve-year-old Ozzy announced to his friends during lunch that the school's annual Spring Assembly would be the perfect opportunity to serve the entire fifth grade spaghetti — not in the cafeteria, but on the auditorium stage, mid-performance, as a surprise. His friends Bex and Tomás stared at him. "Define 'brilliant,'" said Tomás. "Trust me," said Ozzy. This was the first mistake.

Chapter 2: Logistics
The plan required three things: a pasta pot borrowed from Bex's grandmother, a portable camping stove, and a very cooperative janitor. The janitor, Mr. Fitch, agreed on the condition that he receive a full serving of Bex's grandmother's sauce, which was, he said, the only thing that would make the risk worthwhile. The pot was enormous. It barely fit through the backstage door. The camping stove, as it turned out, required a fuel canister that Ozzy had forgotten to purchase. He substituted four birthday candles. This was the second mistake.

Chapter 3: Technical Difficulties
The pasta took forty-seven minutes to cook on birthday candles. During this time, the first two acts of the Spring Assembly — a recorder ensemble and a dramatic reading of selected weather forecasts — took place without incident. The auditorium filled with the smell of oregano. Three teachers exchanged concerned looks. The principal asked the custodian what was happening. The custodian, who was Mr. Fitch, said he had no information about any spaghetti. Mr. Fitch considered this technically accurate.

Chapter 4: The Reveal
When Ozzy, Bex, and Tomás wheeled the pot onto the stage during the intermission, approximately ninety-three people applauded. This was not the reaction Ozzy had expected. Then the pot tipped. The auditorium went silent. The spaghetti did not go on the audience — it went entirely on Mr. Fitch, who had been standing behind the curtain eating an advance serving. He emerged from behind the curtain covered in marinara and holding his bowl with great dignity. The assembly dissolved into approximately six minutes of uncontrollable laughter.

Chapter 5: The Aftermath
Ozzy, Bex, and Tomás received three weeks of lunch cleanup duty. Mr. Fitch received a formal commendation for "grace under unexpected circumstances." Bex's grandmother received a thank-you card from the principal, who described the sauce as "genuinely remarkable." At the end-of-year awards ceremony, Ozzy was given the unofficial class prize for "Most Ambitious Plan That Technically Did Not Go As Intended But Was Also Definitely Worth It." He accepted it with a bow.`,
  readingExtras: {
    keyPhrases: ["\"Define 'brilliant,'\" said Tomás."],
    sectionTitles: [
      "Chapter 1: The Plan",
      "Chapter 2: Logistics",
      "Chapter 3: Technical Difficulties",
      "Chapter 4: The Reveal",
      "Chapter 5: The Aftermath",
    ],
  },
  vocabulary: {
    words: [
      { word: "logistics",    options: ["the practical details of organizing a complex activity", "the unexpected results of a poorly timed plan", "the formal approval required for a school event", "the quantity of pasta needed for ninety students"], correctIndex: 0 },
      { word: "commendation", options: ["an official recognition of praiseworthy behavior", "a three-week punishment for breaking school rules", "a formal complaint filed by a principal", "a type of award given at spring assemblies"], correctIndex: 0 },
      { word: "intermission", options: ["a pause between sections of a performance", "the moment when a plan begins to fail publicly", "the period when teachers exchange concerned looks", "an unauthorized culinary addition to a program"], correctIndex: 0 },
      { word: "technically",  options: ["in a strict, literal sense without considering the larger context", "in a manner that acknowledges full responsibility", "with complete accuracy across all relevant details", "through formal channels approved by administration"], correctIndex: 0 },
      { word: "ambitious",    options: ["showing a strong desire to achieve something difficult", "involving multiple steps that all go exactly as planned", "related to pasta preparation under challenging conditions", "characterized by good judgment about school assemblies"], correctIndex: 0 },
    ],
  },
  factOpinion: {
    statements: [
      { text: "The pasta took forty-seven minutes to cook on birthday candles.", type: "fact", whyCorrect: "The story gives this specific duration — it is a detail that can be verified in the text." },
      { text: "Ozzy's plan was the funniest thing that had ever happened at the school.", type: "opinion", whyCorrect: "\"Funniest thing ever\" is a judgment — different people in the auditorium would likely rate it differently." },
      { text: "Mr. Fitch received a formal commendation for grace under unexpected circumstances.", type: "fact", whyCorrect: "This is stated explicitly as an outcome in the aftermath chapter." },
      { text: "Bex's grandmother's sauce was the best part of the entire Spring Assembly.", type: "opinion", whyCorrect: "\"Best part\" is a preference — the recorder ensemble's fans might reasonably disagree." },
      { text: "Ozzy, Bex, and Tomás received three weeks of lunch cleanup duty.", type: "fact", whyCorrect: "The story states the consequence directly and specifically." },
    ],
  },
  summaries: {
    options: [
      { text: "Ozzy, Bex, and Tomás attempt to serve spaghetti on stage during the Spring Assembly; the pot tips on Mr. Fitch, chaos follows, and everyone faces humorous consequences.", correct: true, whyCorrect: "This covers the plan, the failure, and the aftermath without inventing details not in the story." },
      { text: "Ozzy wins a cooking competition by convincing Mr. Fitch to judge a pasta cook-off during school hours.", correct: false },
      { text: "The Spring Assembly is cancelled after a pasta smell triggers a school evacuation.", correct: false },
    ],
  },
  characterTraits: {
    questions: [
      { question: "What does Ozzy's reaction to the award at the end of the year reveal about his character?", options: ["He is good-humored and comfortable laughing at himself", "He is embarrassed and tries to avoid further attention", "He is resentful about the consequences he received"], correctIndex: 0, whyCorrect: "Accepting the award \"with a bow\" after everything that went wrong shows self-awareness and a light attitude toward failure." },
      { question: "How does Mr. Fitch demonstrate an unexpected quality in this story?", options: ["He shows composure and even dignity in an absurd situation", "He demonstrates poor judgment by agreeing to help from the start", "He reveals selfishness by prioritizing his own serving over the students"], correctIndex: 0, whyCorrect: "Emerging from behind the curtain covered in marinara while still holding his bowl \"with great dignity\" shows remarkable composure." },
      { question: "What do Bex and Tomás's roles in the plan suggest about their character?", options: ["They are loyal friends who participate even when skeptical", "They are the masterminds who convinced Ozzy to act", "They distance themselves from responsibility when things go wrong"], correctIndex: 0, whyCorrect: "Tomás questions the plan from the start ('Define brilliant') yet still participates — loyalty over caution." },
    ],
  },
  compareContrast: {
    story2: `When the seventh-grade science fair was cancelled due to a broken projector, Nadia decided to hold her own unofficial presentation in the school courtyard using a bedsheet and a borrowed flashlight. She had prepared a demonstration on atmospheric pressure involving a hard-boiled egg and a glass bottle. The demonstration worked perfectly on the first try — the egg was sucked into the bottle to the astonishment of approximately fifteen spectators — and then immediately cracked the bottle, sending egg fragments in a modest radius. Nadia received a spontaneous round of applause and a request to never do it again indoors.`,
    question: "How are Ozzy's and Nadia's plans similar in ambition and outcome, and what does each character's response to the results reveal about them?",
    sampleAnswer: "Both Ozzy and Nadia pursue ambitious, unofficial plans that end in unexpected physical chaos — spaghetti covering Mr. Fitch; egg fragments covering spectators. Both receive mixed reactions: applause combined with consequences. Ozzy accepts his result with theatrical good humor (the bow); Nadia's outcome is more matter-of-fact — the demonstration succeeds scientifically before failing structurally, and she accepts the applause and the ban with equal composure.",
  },
};

const animals: CombinedStoryData = {
  title: "The Migration",
  genre: "Animals & Nature",
  story: `Chapter 1: August
The flock gathered on the power lines above Lena's house every August, and every August she counted them. This year there were forty-three Arctic terns — the same forty-three, she was almost certain, because of the one with the notched left wing. She had named him Shard three summers ago, when she was eight. In three days, she knew, they would be gone, and they would not return until spring. The migration route stretched from the Arctic to the Antarctic and back — the longest journey of any animal on earth.

Chapter 2: October
Lena had been tracking migration data since her class adopted a citizen-science project in third grade. Now eleven, she had four years of arrival dates, flock sizes, and weather patterns logged in a spreadsheet. This October she noticed something in the data: over four years, the average arrival date had shifted eleven days earlier. She brought it to her science teacher, Ms. Wick, who told her it was likely related to shifting ocean temperatures affecting the fish populations the terns needed along their route. "But that's just an idea," Ms. Wick added. "You'd need more data to be sure."

Chapter 3: The Contact
Lena posted her spreadsheet to a citizen-science database and wrote a brief note explaining the anomaly. Within a week, she had received responses from observers in Iceland, South Africa, and New Zealand — all of whom had noticed the same shift. An ornithologist at a university in Reykjavik emailed her directly, asking if she would be willing to join a multi-year collaborative study. Lena printed the email and read it to Shard's empty perch on the power line. She accepted.

Chapter 4: The Study
Over the next two years, Lena contributed observation logs, photographs, and her original four years of data to the study. The ornithologist published preliminary findings: the shifting arrival times correlated strongly with a decline in sandeel populations in specific feeding corridors. The terns were adjusting their schedule, but the adjustment had limits. If the fish populations dropped below a threshold, the birds would arrive before the food was ready — and the fledglings would starve.

Chapter 5: April
When the terns returned the following April, Lena counted forty-one. She looked for Shard's notched wing for twenty minutes. Then she saw it — third from the left on the second wire. She noted the date, the weather, the flock size. She sent the data to Reykjavik. She did not know if her observations would be enough to change anything. But she understood, now, that not knowing was not a reason to stop looking.`,
  readingExtras: {
    keyPhrases: ["The migration route stretched from the Arctic to the Antarctic and back."],
    sectionTitles: [
      "Chapter 1: August",
      "Chapter 2: October",
      "Chapter 3: The Contact",
      "Chapter 4: The Study",
      "Chapter 5: April",
    ],
  },
  vocabulary: {
    words: [
      { word: "migration",    options: ["the seasonal movement of animals from one region to another", "the study of bird populations in scientific databases", "the decline of fish populations in ocean corridors", "the annual counting of Arctic terns in one location"], correctIndex: 0 },
      { word: "ornithologist", options: ["a scientist who studies birds", "a researcher who tracks ocean temperature shifts", "a citizen-science database administrator", "a conservationist specializing in fish populations"], correctIndex: 0 },
      { word: "anomaly",      options: ["something that deviates from what is expected or normal", "a confirmed pattern verified by multiple observers", "a measurement error in a citizen-science dataset", "a gap in four years of migration records"], correctIndex: 0 },
      { word: "correlate",    options: ["to show a mutual relationship between two things", "to gather data from multiple geographic observers", "to publish findings in a peer-reviewed study", "to adjust a migration route based on temperature data"], correctIndex: 0 },
      { word: "fledgling",    options: ["a young bird that has recently grown flight feathers", "a first-year observer in a citizen-science project", "a fish species in decline along migration corridors", "a preliminary finding not yet fully confirmed"], correctIndex: 0 },
    ],
  },
  factOpinion: {
    statements: [
      { text: "The Arctic tern's migration route is the longest journey of any animal on earth.", type: "fact", whyCorrect: "The story states this as an established scientific fact about the species." },
      { text: "Citizen-science projects are the most effective way to track environmental changes.", type: "opinion", whyCorrect: "\"Most effective\" compares citizen science to all other methods — a judgment scientists debate." },
      { text: "Lena's arrival-date data showed an eleven-day shift over four years.", type: "fact", whyCorrect: "This is a specific numerical finding from her spreadsheet — a verifiable data point." },
      { text: "Lena should have contacted the ornithologist sooner instead of waiting for a response.", type: "opinion", whyCorrect: "Whether she acted too slowly involves a judgment about responsibility and timing that the story doesn't resolve." },
      { text: "The published study found that shifting arrival times correlated with sandeel population decline.", type: "fact", whyCorrect: "The ornithologist's preliminary findings are described explicitly in Chapter 4." },
    ],
  },
  summaries: {
    options: [
      { text: "Lena tracks Arctic terns for years, notices a troubling shift in their arrival dates, connects with scientists globally, and contributes to a study linking the shift to declining fish populations.", correct: true, whyCorrect: "This covers Lena's journey from local observer to scientific contributor without adding events not in the story." },
      { text: "Lena rescues an injured tern named Shard and releases him after a two-year recovery program.", correct: false },
      { text: "Lena moves to Iceland to continue her migration research at the university in Reykjavik.", correct: false },
    ],
  },
  characterTraits: {
    questions: [
      { question: "What does Lena's four years of consistent record-keeping reveal about her character?", options: ["She is disciplined and takes long-term commitments seriously", "She is obsessive in a way that isolates her from other interests", "She is cautious about sharing her findings with others"], correctIndex: 0, whyCorrect: "Maintaining a detailed spreadsheet from age seven to eleven across four years shows sustained discipline, not impulsiveness." },
      { question: "How does Lena respond to Ms. Wick's caution that she'd need more data?", options: ["She seeks out additional observers rather than accepting uncertainty as a final answer", "She abandons the investigation and focuses on other class projects", "She challenges Ms. Wick's qualifications to comment on migration data"], correctIndex: 0, whyCorrect: "Posting to the citizen-science database and reaching out globally is a direct response to the call for more data." },
      { question: "What does the final scene — Lena finding Shard and sending data to Reykjavik — reveal about her attitude toward her work?", options: ["She finds meaning in the act of observing itself, regardless of whether it changes outcomes", "She is frustrated that her years of work have not yet produced concrete policy changes", "She is relieved the study is over and she can stop tracking migration data"], correctIndex: 0, whyCorrect: "\"Not knowing was not a reason to stop looking\" shows she values the work independent of guaranteed results." },
    ],
  },
  compareContrast: {
    story2: `Every winter, twelve-year-old Hector biked to the estuary outside town to count the dunlin — small wading birds that spent cold months feeding in the mud before flying north to breed. He had been doing it since he was nine, following a protocol from a shorebird atlas his aunt had given him. Last winter, he counted sixty fewer birds than the winter before. He reported the number to the atlas's online database and received an automated confirmation. No one contacted him. He continued counting.`,
    question: "How are Lena's and Hector's approaches to citizen science similar, and how does the recognition they receive differ?",
    sampleAnswer: "Both Lena and Hector observe wildlife consistently over multiple years and report their findings to scientific databases. Both notice troubling declines. The key difference is recognition: Lena's anomaly attracts direct attention from an ornithologist and leads to a formal collaboration. Hector receives only an automated confirmation and hears nothing further. Yet both continue. This suggests that the value of careful observation doesn't depend on whether it is immediately noticed.",
  },
};

const space: CombinedStoryData = {
  title: "Signals from Kepler-7",
  genre: "Space & Science",
  story: `Chapter 1: The Pattern
The signal had been in the dataset for three months before twelve-year-old Dara noticed it. She was part of a school team participating in SETI@school, a program that let students analyze radio telescope data for anomalies. Most anomalies turned out to be interference from satellites or ground equipment. This one was different: a repeating sequence of seven pulses, spaced in intervals matching the first seven prime numbers. Dara flagged it.

Chapter 2: The Wait
For two weeks, nothing happened. The flag disappeared from the shared interface, which usually meant a researcher had reviewed it and filed it as known interference. Dara pulled her original analysis and ran the same test on a different software tool. The prime-number spacing held. She emailed the program coordinator, Dr. Tessaro, directly, attaching both analyses. She received an out-of-office reply. She waited.

Chapter 3: The Response
Dr. Tessaro replied eleven days later: "We saw your flag. We have also seen this signal independently. We believe it is a pulsar not currently in our catalog. The prime-number spacing is consistent with natural pulsar behavior in certain rotational configurations. We are investigating. Your original flag helped us locate the archival data. We will credit your team in the paper." Dara read the email four times.

Chapter 4: The Paper
The preliminary paper was published eight months later. It described a pulsar rotating at an unusual rate — not proof of extraterrestrial communication, but a significant find for pulsar astronomy. Dara's school team was listed in the acknowledgments. Her science teacher printed the citation and taped it to the classroom door. A journalist from the local paper called the school and asked if a student had "discovered aliens." Her teacher said no. Dara said, "We discovered something better — something we didn't know existed."

Chapter 5: The Next Dataset
The following semester, SETI@school sent a new dataset. Dara opened it on a Tuesday afternoon and started at the first row. She did not expect to find anything. She had learned, from the pulsar, that expectation was not the point. Looking carefully was the point. She highlighted the first anomaly at 4:17 PM and submitted the flag before dinner.`,
  readingExtras: {
    keyPhrases: ["a repeating sequence of seven pulses, spaced in intervals matching the first seven prime numbers"],
    sectionTitles: [
      "Chapter 1: The Pattern",
      "Chapter 2: The Wait",
      "Chapter 3: The Response",
      "Chapter 4: The Paper",
      "Chapter 5: The Next Dataset",
    ],
  },
  vocabulary: {
    words: [
      { word: "anomaly",     options: ["something that deviates from what is expected or normal", "a confirmed signal from an extraterrestrial source", "an error introduced by satellite interference", "a dataset sent to participating schools"], correctIndex: 0 },
      { word: "pulsar",      options: ["a rapidly rotating neutron star that emits regular bursts of radio waves", "a type of radio interference from ground equipment", "a pattern of seven prime-number intervals in telescope data", "a catalog of known astronomical objects"], correctIndex: 0 },
      { word: "acknowledgment", options: ["a formal recognition of someone's contribution", "a peer-reviewed section describing experimental methods", "a response from a researcher confirming alien contact", "an out-of-office email reply"], correctIndex: 0 },
      { word: "preliminary", options: ["coming before a final, fully confirmed result", "relating to data that has been fully verified", "describing a finding that has been withdrawn from publication", "involving only the most senior researchers"], correctIndex: 0 },
      { word: "rotational",  options: ["relating to the spinning motion of an object", "describing the spacing of prime-number intervals", "involving the transmission of radio telescope data", "referring to a catalog of documented star systems"], correctIndex: 0 },
    ],
  },
  factOpinion: {
    statements: [
      { text: "The signal consisted of seven pulses spaced at prime-number intervals.", type: "fact", whyCorrect: "Dara's analysis describes this specific pattern — it is a verifiable detail in the story." },
      { text: "Dara's discovery was more important than any other SETI@school finding that year.", type: "opinion", whyCorrect: "\"More important than any other\" requires comparing all findings — a judgment the story does not make." },
      { text: "Dr. Tessaro's team had also identified the signal independently before responding to Dara.", type: "fact", whyCorrect: "Dr. Tessaro states this directly in her email reply to Dara." },
      { text: "Finding a new pulsar is more valuable than searching for extraterrestrial communication.", type: "opinion", whyCorrect: "Scientists disagree about research priorities — this reflects a values judgment, not a factual claim." },
      { text: "Dara's school team was listed in the acknowledgments of the published paper.", type: "fact", whyCorrect: "The story states explicitly that the team appeared in the acknowledgments section." },
    ],
  },
  summaries: {
    options: [
      { text: "Dara flags an unusual signal in telescope data, follows up despite delays, and contributes to the discovery of an uncatalogued pulsar.", correct: true, whyCorrect: "This captures the full arc: noticing, persisting, and the scientific outcome — without inventing alien contact." },
      { text: "Dara proves that a radio signal from Kepler-7 is evidence of extraterrestrial intelligence.", correct: false },
      { text: "Dara's teacher submits the data to a research team, and the school receives a grant to build a radio telescope.", correct: false },
    ],
  },
  characterTraits: {
    questions: [
      { question: "What does Dara's decision to email Dr. Tessaro directly — after her flag disappeared — reveal about her?", options: ["She is persistent and does not accept dismissal without verification", "She is distrustful of scientific institutions by default", "She is impatient and expects immediate responses to her work"], correctIndex: 0, whyCorrect: "Running the analysis a second time and then contacting the coordinator shows she verifies before escalating — persistent but methodical." },
      { question: "How does Dara respond to the journalist's question about aliens?", options: ["She offers a precise, accurate alternative framing of the discovery", "She avoids the question entirely and lets her teacher answer for her", "She exaggerates the significance of the finding to generate interest"], correctIndex: 0, whyCorrect: "\"We discovered something better — something we didn't know existed\" is both accurate and more meaningful than the alien framing." },
      { question: "What does the final chapter reveal about how Dara has changed as a scientist?", options: ["She now values careful observation as worthwhile regardless of what it produces", "She is more focused on recognition and publication than before", "She has lowered her standards for what counts as a significant finding"], correctIndex: 0, whyCorrect: "\"Expectation was not the point. Looking carefully was the point\" shows a shift from outcome-focused to process-focused thinking." },
    ],
  },
  compareContrast: {
    story2: `Thirteen-year-old Rafi spent six months analyzing atmospheric data from the Mars Climate Orbiter archive as part of a university outreach program. He was looking for evidence of ancient water erosion patterns in the Valles Marineris region. He found what appeared to be a recurring sediment signature in three data sets from different decades — but when he submitted his analysis, the graduate student reviewing it told him the pattern was likely an artifact of the sensor calibration process. Rafi updated his methodology and resubmitted. The graduate student confirmed his revised analysis showed a real signal. It was too small to be publishable on its own, but it was added to a larger ongoing study.`,
    question: "How are Dara's and Rafi's experiences with scientific investigation similar, and how does the role of persistence differ between their stories?",
    sampleAnswer: "Both Dara and Rafi identify signals in large datasets that initially seem explainable by mundane causes — interference for Dara, calibration artifacts for Rafi. Both persist: Dara by re-running her analysis and escalating to the coordinator; Rafi by revising his methodology after feedback. The key difference is that Dara's persistence involves following up when ignored; Rafi's involves accepting correction and improving his work. Both show that scientific progress requires continuing after setbacks, but through different kinds of persistence.",
  },
};

export const SAMPLE_STORIES_TIER3: Record<string, CombinedStoryData[]> = {
  adventure: [adventure],
  fantasy:   [fantasy],
  mystery:   [mystery],
  silly:     [silly],
  animals:   [animals],
  space:     [space],
};
