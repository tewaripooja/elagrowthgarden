/**
 * Tier 1 stories — Grade 1 reading level.
 * Short (~150 words), simple sentences (≤10 words), common sight words.
 * 3 vocab words, 3 fact/opinion statements, 2 char trait questions.
 */
import type { CombinedStoryData } from "@/lib/ai";

const adventure: CombinedStoryData = {
  title: "The Treasure Map",
  genre: "Adventure",
  story: `Sam found a map under his bed. The map had an X on it. Sam wanted to find the treasure.

He went to the big oak tree. He dug in the soft dirt. His dog Biscuit helped him dig.

Sam found a small box. He opened it slowly. Inside was a shiny coin and a note. The note said, "Well done, brave explorer!"

Sam smiled a big smile. He ran home to show Mom. Mom gave him a hug. Sam put the coin in his room. He felt very proud of himself.`,
  readingExtras: { keyPhrases: ["Sam found a map under his bed."] },
  vocabulary: {
    words: [
      { word: "treasure", options: ["something special you find", "a kind of food", "a big rock"], correctIndex: 0 },
      { word: "explorer", options: ["someone who looks around new places", "a type of dog", "a fast runner"], correctIndex: 0 },
      { word: "proud",    options: ["feeling happy about what you did", "very hungry", "very tired"], correctIndex: 0 },
    ],
  },
  factOpinion: {
    statements: [
      { text: "Sam found a map under his bed.",            type: "fact",    whyCorrect: "We can check this in the story — it really happened." },
      { text: "Finding treasure is the best thing ever.", type: "opinion", whyCorrect: "Not everyone would agree — it is what someone thinks." },
      { text: "The box had a coin and a note inside.",    type: "fact",    whyCorrect: "The story tells us exactly what was in the box." },
    ],
  },
  summaries: {
    options: [
      { text: "Sam follows a map, digs under a tree, and finds a treasure box with a coin and note.", correct: true,  whyCorrect: "This covers the main events from start to finish." },
      { text: "Sam lost his dog Biscuit in the garden and never found him.",                           correct: false },
      { text: "Sam drew a map and gave it to his mom as a gift.",                                      correct: false },
    ],
  },
  characterTraits: {
    questions: [
      { question: "Which word best describes Sam?", options: ["Brave and curious", "Lazy and bored", "Mean and sad"], correctIndex: 0, whyCorrect: "Sam follows the map on his own and keeps digging — that shows bravery and curiosity." },
      { question: "How does Sam feel at the end of the story?", options: ["Proud and happy", "Angry and tired", "Scared and alone"], correctIndex: 0, whyCorrect: "Sam smiles and feels proud after finding the treasure." },
    ],
  },
  compareContrast: {
    story2: `Lily found a note on the kitchen table. It said, "Follow the clues!" She looked around the house. She found clues in the kitchen, the hall, and her room. The last clue led her to a cupcake on the table. Her dad had made a treasure hunt just for her.`,
    question: "How are Sam's and Lily's treasure hunts alike and different?",
    sampleAnswer: "Both Sam and Lily follow clues to find a surprise. Sam digs outside for a box, but Lily follows clues inside her house for a cupcake.",
  },
};

const fantasy: CombinedStoryData = {
  title: "The Magic Seed",
  genre: "Fantasy & Magic",
  story: `Mia found a tiny seed in the park. The seed was pink and glowed a little. She took it home and planted it in a pot.

She watered it every day. On the third day, a green shoot came up. By the next morning, a huge flower had grown.

The flower was blue and sparkly. It made music when the wind blew. Birds came to listen. Bees came too.

Mia sat by the flower all afternoon. She felt calm and happy. She did not know the seed was magic. But she knew the flower was very special.`,
  readingExtras: { keyPhrases: ["The seed was pink and glowed a little."] },
  vocabulary: {
    words: [
      { word: "glowed",  options: ["shone with soft light", "made a loud noise", "fell on the ground"], correctIndex: 0 },
      { word: "shoot",   options: ["a tiny new plant that has just started to grow", "a loud bang", "a kind of bird"], correctIndex: 0 },
      { word: "calm",    options: ["quiet and peaceful", "very loud", "very cold"], correctIndex: 0 },
    ],
  },
  factOpinion: {
    statements: [
      { text: "Mia watered the seed every day.",                  type: "fact",    whyCorrect: "The story tells us she watered it every day." },
      { text: "The magic flower was the prettiest thing ever.",   type: "opinion", whyCorrect: "That is what someone thinks — others might disagree." },
      { text: "The flower made music when the wind blew.",        type: "fact",    whyCorrect: "The story states this directly." },
    ],
  },
  summaries: {
    options: [
      { text: "Mia plants a glowing seed, and it grows into a magic musical flower that makes her feel happy.", correct: true,  whyCorrect: "This covers the main idea from beginning to end." },
      { text: "Mia loses her seed and spends the whole story looking for it.",                                    correct: false },
      { text: "Mia buys a flower from a shop and puts it in her room.",                                          correct: false },
    ],
  },
  characterTraits: {
    questions: [
      { question: "Which word best describes Mia?", options: ["Caring and patient", "Greedy and rude", "Lazy and silly"], correctIndex: 0, whyCorrect: "Mia waters the seed every day and takes care of it — that shows she is caring and patient." },
      { question: "How does Mia feel by the end of the story?", options: ["Calm and happy", "Angry and upset", "Scared and confused"], correctIndex: 0, whyCorrect: "The story says she felt calm and happy sitting by the flower." },
    ],
  },
  compareContrast: {
    story2: `Tom found a magic stone by the river. When he held it, flowers grew around his feet. He put the stone on a rock by his house. Every morning, new flowers appeared. The garden became the nicest on the street.`,
    question: "How are Mia's magic seed and Tom's magic stone alike and different?",
    sampleAnswer: "Both the seed and the stone make flowers grow in a magical way. Mia plants her seed in a pot, but Tom places his stone outside. Mia's flower makes music, but Tom's stone makes a whole garden.",
  },
};

const mystery: CombinedStoryData = {
  title: "The Missing Snack",
  genre: "Mystery",
  story: `Zoe put her apple in her bag before school. At lunch, she opened her bag. The apple was gone!

She looked at her friends. Ben had a red face. Emma was looking away. Max was eating a banana.

Zoe asked each one. Ben said he did not take it. Emma said she did not see it. Max said he found an apple on the floor and gave it to the teacher.

Zoe went to the teacher. The teacher smiled. She had the apple on her desk. The teacher gave it back. Zoe ate it and laughed. Mystery solved!`,
  readingExtras: { keyPhrases: ["The apple was gone!"] },
  vocabulary: {
    words: [
      { word: "mystery", options: ["something strange that needs to be worked out", "a type of fruit", "a fun game"], correctIndex: 0 },
      { word: "solved",  options: ["found the answer to a problem", "lost something important", "made a big mess"], correctIndex: 0 },
      { word: "clue",    options: ["a hint that helps you find an answer", "a kind of pencil", "a new friend"], correctIndex: 0 },
    ],
  },
  factOpinion: {
    statements: [
      { text: "Zoe put her apple in her bag before school.",      type: "fact",    whyCorrect: "The story tells us this is what Zoe did." },
      { text: "Stealing food is the worst thing a person can do.", type: "opinion", whyCorrect: "This is what someone thinks — not everyone would rank it the same way." },
      { text: "Max gave the apple to the teacher.",               type: "fact",    whyCorrect: "Max says he found it on the floor and gave it to the teacher." },
    ],
  },
  summaries: {
    options: [
      { text: "Zoe's apple goes missing at lunch. She asks her friends and finds it on the teacher's desk.", correct: true,  whyCorrect: "This covers the problem and how it was solved." },
      { text: "Zoe and her friends share their lunches and become best friends.",                             correct: false },
      { text: "Zoe forgets to bring her lunch and feels hungry all day.",                                     correct: false },
    ],
  },
  characterTraits: {
    questions: [
      { question: "Which word best describes Zoe?", options: ["Clever and calm", "Angry and mean", "Shy and quiet"], correctIndex: 0, whyCorrect: "Zoe asks each friend calmly and keeps looking until she finds her apple." },
      { question: "What kind of person is Max?", options: ["Honest and helpful", "Sneaky and rude", "Silly and forgetful"], correctIndex: 0, whyCorrect: "Max found the apple and gave it to the teacher — he did the right thing." },
    ],
  },
  compareContrast: {
    story2: `Jake could not find his pencil. He looked in his desk and his bag. His friend Sara spotted it on the floor under his chair. Jake picked it up and thanked Sara. He made sure to put it away carefully next time.`,
    question: "How are Zoe's missing apple mystery and Jake's missing pencil alike and different?",
    sampleAnswer: "Both Zoe and Jake lose something and need a friend's help to find it. Zoe loses food and Jake loses a school tool. A friend helps Jake right away, but Zoe has to ask several people before finding hers.",
  },
};

const humor: CombinedStoryData = {
  title: "The Wobbly Lunch",
  genre: "Silly & Funny",
  story: `It was a very silly Tuesday at school. First, Leo dropped his milk. It went all over his shoes. He made a squishing sound with every step.

Next, his sandwich fell apart. The cheese landed on his nose. Everyone laughed. Leo laughed too.

Then his chair wobbled. He held on tight. The chair did not fall — but his apple rolled off the table and hit the teacher on the foot.

The teacher looked at Leo. Leo looked at the teacher. Then they both started to laugh.

"Best lunch ever," said Leo. And somehow, it really was.`,
  readingExtras: { keyPhrases: ["It was a very silly Tuesday at school."] },
  vocabulary: {
    words: [
      { word: "wobbled", options: ["moved from side to side in an unsteady way", "stayed very still", "made a loud crash"], correctIndex: 0 },
      { word: "squishing", options: ["making a wet, squishy sound", "running very fast", "eating quickly"], correctIndex: 0 },
      { word: "somehow",   options: ["in a way that is hard to explain", "never ever", "very loudly"], correctIndex: 0 },
    ],
  },
  factOpinion: {
    statements: [
      { text: "Leo's milk went all over his shoes.",             type: "fact",    whyCorrect: "The story tells us this happened." },
      { text: "Spilling milk at lunch is really embarrassing.", type: "opinion", whyCorrect: "This is what someone might feel — not everyone would agree." },
      { text: "Leo's apple rolled and hit the teacher's foot.", type: "fact",    whyCorrect: "The story says the apple rolled off the table and hit the teacher." },
    ],
  },
  summaries: {
    options: [
      { text: "Everything goes wrong at Leo's lunch, but he and his teacher end up laughing about it.", correct: true,  whyCorrect: "This captures all the silly events and the happy ending." },
      { text: "Leo wins a prize for being the tidiest student at lunch.",                                correct: false },
      { text: "Leo skips lunch because he is not hungry.",                                               correct: false },
    ],
  },
  characterTraits: {
    questions: [
      { question: "Which word best describes Leo?", options: ["Fun and cheerful", "Grumpy and rude", "Sad and lonely"], correctIndex: 0, whyCorrect: "Leo laughs at himself and calls it the best lunch ever — he has a great attitude." },
      { question: "How does the teacher react to being hit by the apple?", options: ["She laughs along with Leo", "She shouts at Leo", "She cries and leaves"], correctIndex: 0, whyCorrect: "The story says both Leo and the teacher start to laugh." },
    ],
  },
  compareContrast: {
    story2: `At recess, Priya tripped and her snack went flying. Her crackers landed on her friend's head. They both giggled so much they could not stop. Priya said it was the funniest snack break she ever had.`,
    question: "How are Leo's and Priya's silly food moments alike and different?",
    sampleAnswer: "Both Leo and Priya have a funny accident with food and end up laughing. Leo's accident happens at lunch inside the classroom, but Priya's happens outside at recess. Leo's apple hits the teacher, while Priya's crackers land on her friend.",
  },
};

const animals: CombinedStoryData = {
  title: "The Helpful Fox",
  genre: "Animals & Nature",
  story: `Fox found lots of berries on the big bush. She had more than she could eat. She looked around the forest.

Rabbit was hungry. Fox gave Rabbit a pawful of berries. Rabbit said thank you and hopped away happy.

Deer was thirsty from walking all day. Fox found a stream and showed Deer the way. Deer took a long cool drink.

Bird had a hurt wing and could not fly. Fox sat with Bird and kept her warm until Bird felt better.

That night, all the animals came to Fox's den. They brought nuts and leaves and soft moss. They made Fox a cosy bed to say thank you.`,
  readingExtras: { keyPhrases: ["She had more than she could eat."] },
  vocabulary: {
    words: [
      { word: "pawful", options: ["as much as fits in a paw", "a tiny bit", "a very big pile"], correctIndex: 0 },
      { word: "stream", options: ["a small flowing body of water", "a kind of berry", "a loud sound"], correctIndex: 0 },
      { word: "cosy",   options: ["warm and comfortable", "very cold and wet", "bright and noisy"], correctIndex: 0 },
    ],
  },
  factOpinion: {
    statements: [
      { text: "Fox gave Rabbit some berries.",                 type: "fact",    whyCorrect: "The story tells us Fox gave berries to Rabbit." },
      { text: "Foxes are the kindest animals in the forest.", type: "opinion", whyCorrect: "That is something someone might think, but not everyone agrees." },
      { text: "The animals made Fox a cosy bed as a thank you.", type: "fact", whyCorrect: "The story says the animals brought soft things to make a bed for Fox." },
    ],
  },
  summaries: {
    options: [
      { text: "Fox shares berries, helps Deer find water, and comforts Bird. The animals thank her with a cosy bed.", correct: true,  whyCorrect: "This covers all three acts of kindness and the reward at the end." },
      { text: "Fox eats all the berries herself and falls asleep in the sun.",                                         correct: false },
      { text: "Fox gets lost in the forest and the animals help her find her home.",                                   correct: false },
    ],
  },
  characterTraits: {
    questions: [
      { question: "Which word best describes Fox?", options: ["Kind and generous", "Greedy and selfish", "Shy and afraid"], correctIndex: 0, whyCorrect: "Fox gives away food, shows the way to water, and keeps Bird warm — all acts of kindness." },
      { question: "Why do the animals bring gifts to Fox?", options: ["To say thank you for her help", "To trade berries for nuts", "To ask Fox to leave the forest"], correctIndex: 0, whyCorrect: "The story says they made a cosy bed to say thank you." },
    ],
  },
  compareContrast: {
    story2: `Bear found honey in a tree. There was too much for one bear. She called her friends — Rabbit, Squirrel, and Owl. They all shared the honey together under the big tree. Bear felt warm inside knowing her friends were happy.`,
    question: "How are Fox and Bear alike and different in the way they share?",
    sampleAnswer: "Both Fox and Bear find more than they need and share with others. Fox helps animals in different ways — food, water, and warmth. Bear shares one thing, honey, with her friends all at once. Both feel happy when they help.",
  },
};

const science: CombinedStoryData = {
  title: "Space Garden",
  genre: "Space & Science",
  story: `Astro the robot lived on a small rocket ship. The ship travelled far from Earth. Astro missed green things. She decided to grow a garden.

She planted seeds in a tray of special soil. She gave them water and light every day. The seeds were slow to wake up in space.

On day ten, a tiny green shoot appeared! Astro jumped with joy. She watered it more carefully now.

Soon there were five plants growing. Astro picked a small red tomato. She took a bite. It tasted like summer on Earth.

Astro smiled. Space felt a little like home.`,
  readingExtras: { keyPhrases: ["She decided to grow a garden."] },
  vocabulary: {
    words: [
      { word: "soil",    options: ["the dirt that plants grow in", "a type of robot", "a small rocket"], correctIndex: 0 },
      { word: "appeared", options: ["came into view", "disappeared forever", "made a loud sound"], correctIndex: 0 },
      { word: "carefully", options: ["in a slow and gentle way", "very quickly and loudly", "in a messy way"], correctIndex: 0 },
    ],
  },
  factOpinion: {
    statements: [
      { text: "Astro planted seeds in a tray of special soil.",    type: "fact",    whyCorrect: "The story tells us this directly." },
      { text: "Growing plants in space is too hard to do.",        type: "opinion", whyCorrect: "Astro proves it can be done — this is just one person's view." },
      { text: "On day ten, a tiny green shoot appeared.",          type: "fact",    whyCorrect: "The story says the shoot appeared on day ten." },
    ],
  },
  summaries: {
    options: [
      { text: "Astro grows a garden on a rocket ship, picks a tomato, and feels closer to home.", correct: true,  whyCorrect: "This covers the whole story from planting to the first taste." },
      { text: "Astro flies her rocket back to Earth to buy tomatoes from a shop.",                 correct: false },
      { text: "Astro loses all her seeds and the rocket runs out of food.",                        correct: false },
    ],
  },
  characterTraits: {
    questions: [
      { question: "Which word best describes Astro?", options: ["Creative and determined", "Lazy and unhappy", "Angry and impatient"], correctIndex: 0, whyCorrect: "Astro comes up with the idea to grow a garden and waters the plants every single day." },
      { question: "How does Astro feel when the first shoot appears?", options: ["Full of joy", "Sad and worried", "Bored and tired"], correctIndex: 0, whyCorrect: "The story says Astro jumped with joy." },
    ],
  },
  compareContrast: {
    story2: `On a cold planet far away, Rover the robot found some strange purple plants. He gave them water from his tank. They grew bigger each day. He collected their seeds and sent them back to Earth in a little capsule.`,
    question: "How are Astro and Rover alike and different in the way they work with plants?",
    sampleAnswer: "Both Astro and Rover care for plants in space. Astro grows food to eat and make herself feel at home. Rover collects plants to send back to Earth. Astro grows plants she planted herself, but Rover finds plants that already exist.",
  },
};

export const SAMPLE_STORIES_TIER1: Record<string, CombinedStoryData[]> = {
  adventure:      [adventure],
  "fantasy-magic":[fantasy],
  mystery:        [mystery],
  humor:          [humor],
  animals:        [animals],
  "sci-fi":       [science],
};
