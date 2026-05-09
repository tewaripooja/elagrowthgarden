import type { CombinedStoryData } from "@/lib/ai";

/** Bundled stories by genre (primary fast path; AI is fallback). */
const BASE_STORIES_BY_GENRE: Record<string, CombinedStoryData[]> = {
  adventure: [
    {
      title: "The Map in the Attic",
      genre: "Adventure",
      readingExtras: {
        keyPhrases: ["At last she reached an old oak tree marked on the map."],
      },
      story:
        "Maya found an ancient map rolled up in a dusty box in the attic. Her grandmother said it might lead to a small treasure the family had hidden long ago. With courage she did not know she had, Maya began a journey through the woods behind the house. The path was steep, but she kept going. At last she reached an old oak tree marked on the map. She dug where the X was drawn and uncovered a metal box. Inside were photos, a letter, and a shiny coin. The real treasure was the mysterious story of her great-grandparents' first adventure together. That evening Maya spread the photos across the kitchen table while rain drummed softly on the roof. Her grandmother brewed tea and pointed to a young couple standing on a foggy dock, then to a tiny sailboat sketched in the margins of the letter. They read the letter aloud, line by line, about storms weathered, jokes shared on long nights at sea, and a promise to always find their way home. Maya traced the coin's worn ridges and imagined how many hands had held it through hard winters and easier summers. When she climbed the attic stairs again, the air smelled less like dust and more like stories waiting for the next curious visitor.",
      vocabulary: {
        words: [
          {
            word: "ancient",
            whyCorrect:
              "The story describes an old map stored for years — “ancient” means something very old, not loud or tiny.",
            variants: [
              { options: ["very old", "very loud", "very tiny"], correctIndex: 0 },
              { options: ["very old", "brand new", "impossible to see"], correctIndex: 0 },
            ],
          },
          {
            word: "courage",
            variants: [
              { options: ["being brave", "being sleepy", "being noisy"], correctIndex: 0 },
              { options: ["being brave", "giving up immediately", "avoiding friends"], correctIndex: 0 },
            ],
          },
          {
            word: "journey",
            variants: [
              { options: ["a trip", "a snack", "a color"], correctIndex: 0 },
              { options: ["a trip", "a song title", "a type of shoe"], correctIndex: 0 },
            ],
          },
          {
            word: "treasure",
            variants: [
              { options: ["something special and valuable", "a kind of weather", "a math answer"], correctIndex: 0 },
              { options: ["something special and valuable", "empty pockets", "a grocery list"], correctIndex: 0 },
            ],
          },
          {
            word: "mysterious",
            variants: [
              { options: ["hard to explain or full of secrets", "always hungry", "made of metal"], correctIndex: 0 },
              { options: ["hard to explain or full of secrets", "perfectly ordinary", "always noisy"], correctIndex: 0 },
            ],
          },
        ],
      },
      factOpinion: {
        statements: [
          {
            text: "Maya found a map in the attic.",
            type: "fact",
            whyCorrect:
              "This matches events told directly in the story — Maya discovers the map upstairs.",
          },
          {
            text: "Digging under old trees is always the best hobby.",
            type: "opinion",
            whyCorrect:
              "Words like “always” and “best” signal what someone prefers — different readers could disagree.",
          },
          { text: "The box held photos and a coin.", type: "fact" },
          { text: "Finding family stories is better than finding gold.", type: "opinion" },
          { text: "The map showed an oak tree.", type: "fact" },
        ],
      },
      summaries: {
        options: [
          {
            text: "Maya follows a family map, digs at an oak, and learns about her relatives.",
            correct: true,
            whyCorrect:
              "It tracks Maya’s path from map → oak → discovery without inventing scenes that never happen.",
          },
          { text: "Maya builds a rocket and flies to the moon with her grandmother.", correct: false },
          { text: "Maya sells the attic and moves to a new city forever.", correct: false },
        ],
        summaryVariants: [
          [
            {
              text: "Maya uses an attic map to reach an oak tree and discovers family keepsakes and stories.",
              correct: true,
              whyCorrect:
                "Same core plot as the story: guided by the map, finds something meaningful about family.",
            },
            { text: "Maya spends the whole story asleep and misses every clue.", correct: false },
            { text: "Maya decides maps never work and stops exploring.", correct: false },
          ],
        ],
      },
      characterTraits: {
        questions: [
          {
            question: "Which trait best describes Maya in this story?",
            whyCorrect:
              "Maya explores the attic map and keeps hiking — curiosity and persistence fit better than laziness or meanness.",
            variants: [
              { options: ["Curious and determined", "Lazy and rude", "Scared and mean"], correctIndex: 0 },
              { options: ["Curious and determined", "Forgetful and careless", "Unkind to family"], correctIndex: 0 },
            ],
          },
          {
            question: "How does Maya show courage?",
            variants: [
              {
                options: ["She follows the map even when the path is hard", "She hides in the attic", "She throws the map away"],
                correctIndex: 0,
              },
              {
                options: ["She follows the map even when the path is hard", "She refuses to leave the house", "She ignores every clue"],
                correctIndex: 0,
              },
            ],
          },
          {
            question: "What does Maya value most at the end?",
            variants: [
              { options: ["Her family's story", "Only the coin", "Selling the photos"], correctIndex: 0 },
              { options: ["Her family's story", "Keeping secrets forever", "Ignoring letters"], correctIndex: 0 },
            ],
          },
        ],
      },
      compareContrast: {
        story2:
          "Leo bought a pirate map at a yard sale and marched to the park. He dug near the swings and found a plastic toy. He laughed and traded the toy with a friend for a sticker. Leo's trip was short and silly, not a long hike like Maya's, but both kids used a map and hoped for a surprise.",
        question: "How are Maya's and Leo's map adventures alike and different?",
        sampleAnswer:
          "Both used a map and dug for a surprise. Maya's journey was longer and led to family history; Leo's was quick, in a park, and ended with a toy and a trade.",
        sampleWhyCorrect:
          "It names one clear similarity (maps + digging + hoping) and contrasts setting, length, and what each child finds.",
      },
    },
    {
      title: "The Rope Bridge",
      genre: "Adventure",
      story:
        "The trail to the waterfall ended at a rope bridge that swayed over a rushing stream. Nico's heart beat fast. The planks looked slippery, and the ropes were frayed in spots. Still, the group needed to cross to finish the hike. Nico took a deep breath and stepped carefully, one foot at a time. Halfway across, a board snapped! A friend steadied the rope while Nico crawled the last few feet. On the other side, everyone cheered. The waterfall was loud and bright, and Nico felt proud of the risky crossing. Mist cooled their faces as they followed the trail along mossy stones. A guide explained how winter floods sometimes loosened boards, which made Nico listen extra closely to every creak on the way back. They paused at a wide bend in the stream to refill water bottles and watch dragonflies stitch across the surface. By the time the parking lot came into view, legs ached and boots were muddy, but Nico kept replaying the steady grip of the rope and the cheer that rose when both feet touched solid ground again.",
      vocabulary: {
        words: [
          { word: "frayed", options: ["worn and coming apart", "brand new", "frozen solid"], correctIndex: 0 },
          { word: "rushing", options: ["moving very fast", "standing still", "sleeping"], correctIndex: 0 },
          { word: "steady", options: ["hold still and firm", "run away", "drop everything"], correctIndex: 0 },
          { word: "trail", options: ["a path outdoors", "a kind of soup", "a music note"], correctIndex: 0 },
          { word: "risky", options: ["dangerous or uncertain", "always safe", "very boring"], correctIndex: 0 },
        ],
      },
      factOpinion: {
        statements: [
          { text: "Nico crossed a rope bridge over a stream.", type: "fact" },
          { text: "Waterfalls are prettier than any painting.", type: "opinion" },
          { text: "A board broke while Nico was on the bridge.", type: "fact" },
          { text: "Hiking is always easy for everyone.", type: "opinion" },
          { text: "Friends helped steady the rope.", type: "fact" },
        ],
      },
      summaries: {
        options: [
          { text: "Nico carefully crosses a shaky rope bridge with friends' help to reach a waterfall.", correct: true },
          { text: "Nico swims underwater to find a lost phone.", correct: false },
          { text: "Nico builds a new bridge out of candy.", correct: false },
        ],
      },
      characterTraits: {
        questions: [
          {
            question: "What best describes Nico during the crossing?",
            options: ["Careful and brave", "Careless and rude", "Sleepy and bored"],
            correctIndex: 0,
          },
          {
            question: "How do Nico's friends help?",
            options: ["They steady the rope", "They run away", "They push the bridge"],
            correctIndex: 0,
          },
          {
            question: "How does Nico feel at the waterfall?",
            options: ["Proud", "Angry at the stream", "Confused by maps"],
            correctIndex: 0,
          },
        ],
      },
      compareContrast: {
        story2:
          "In gym class, Jordan walked across a low balance beam only a foot off the mat. It wobbled a little, but mats were below. Jordan used arms for balance and finished in seconds. Unlike Nico's high bridge over water, this was short and indoors, yet both tasks needed balance and calm steps.",
        question: "Compare Nico's bridge and Jordan's balance beam.",
        sampleAnswer:
          "Both need balance and careful steps. Nico's bridge is high over water and risky; Jordan's beam is low over a soft mat and short.",
      },
    },
    {
      title: "The Hidden Cove",
      genre: "Adventure",
      story:
        "Kayaks slid into the bay at sunrise. The team paddled around a rocky point until Eli spotted a narrow gap between tall cliffs. They slipped through and entered a hidden cove with calm green water and smooth shells on the shore. A seal popped up and stared, then dove away. They rested, ate snacks, and sketched the cliffs in a notebook. On the way back, waves grew choppy, but they paddled as a team and reached the dock tired and happy. Gulls wheeled overhead while they rinsed sand from their shoes and compared sketches. Eli taped a shell into the notebook beside a smear of salt water that looked like a tiny map of its own. Someone brewed cocoa from a thermos, and laughter carried across the parking lot as parents listened to the story of the narrow gap. Later, photos of the cove appeared on the community board with a note that said, small adventures still count. Even the seal seemed worth a sentence, because everyone agreed that quiet staring counted as a kind of hello.",
      vocabulary: {
        words: [
          { word: "cove", options: ["a small sheltered bay", "a kind of bird", "a math tool"], correctIndex: 0 },
          { word: "choppy", options: ["rough with small waves", "perfectly flat", "completely dry"], correctIndex: 0 },
          { word: "narrow", options: ["not wide", "very loud", "very sweet"], correctIndex: 0 },
          { word: "sheltered", options: ["protected from wind and waves", "out in open ocean", "underground"], correctIndex: 0 },
          { word: "cliffs", options: ["high steep rock faces", "tiny flowers", "soft pillows"], correctIndex: 0 },
        ],
      },
      factOpinion: {
        statements: [
          { text: "The group found a cove between cliffs.", type: "fact" },
          { text: "Kayaking is more fun than any other sport.", type: "opinion" },
          { text: "They saw a seal in the cove.", type: "fact" },
          { text: "Green water always means the ocean is sick.", type: "opinion" },
          { text: "Waves were choppy on the return trip.", type: "fact" },
        ],
      },
      summaries: {
        options: [
          { text: "Kayakers discover a quiet cove, rest and explore, then paddle back through rougher waves.", correct: true },
          { text: "The team sinks their boats and walks home.", correct: false },
          { text: "They never leave the dock because of fog.", correct: false },
        ],
      },
      characterTraits: {
        questions: [
          {
            question: "How does the team handle harder waves?",
            options: ["They paddle together", "They abandon the kayaks", "They argue and stop"],
            correctIndex: 0,
          },
          {
            question: "What does Eli contribute?",
            options: ["Spotting the gap to the cove", "Sleeping in the kayak", "Hiding the snacks"],
            correctIndex: 0,
          },
          {
            question: "What mood are they in at the end?",
            options: ["Tired but happy", "Angry and lost", "Bored and cold"],
            correctIndex: 0,
          },
        ],
      },
      compareContrast: {
        story2:
          "A family took a motorboat straight to a busy beach with music and umbrellas. Kids played volleyball and bought ice cream. The water was crowded and loud, not quiet like the hidden cove. Both trips used boats, but one felt secret and calm while the other was social and bright.",
        question: "How is the hidden cove trip different from the busy beach trip?",
        sampleAnswer:
          "Both use boats. The cove is quiet and narrow; the beach is crowded and loud with games and food stands.",
      },
    },
  ],

  "fantasy-magic": [
    {
      title: "The Dragon's Egg",
      genre: "Fantasy & Magic",
      story:
        "In the village library, a book glowed on the highest shelf. When Priya opened it, a tiny dragon egg rolled onto her lap, warm as toast. A note said, Keep me kind. That night the egg hatched into a dragon no bigger than a kitten, with shimmering scales. It drank milk and sneezed sparks. Priya practiced whispering gentle words whenever it flared up. Soon the dragon could light candles without scorching the table. The librarian smiled and said some magic grows best with patience. Priya carried a tiny blanket in her backpack so the dragon could nap between chapters. During story hour, children leaned closer whenever its tail tapped the rhythm of a rhyme. Even the sternest visitor softened when the dragon lit only the corners of a page so everyone could see the pictures. By Friday, a sign appeared on the bulletin board: gentle dragons welcome, please bring napkins for possible sparks. Priya realized kindness was not one big moment but dozens of small choices, like sharing snacks and apologizing when a sneeze left a scorch mark on a bookmark.",
      vocabulary: {
        words: [
          { word: "shimmering", options: ["sparkling softly", "completely invisible", "very heavy"], correctIndex: 0 },
          { word: "patience", options: ["calm waiting without rushing", "loud shouting", "running fast"], correctIndex: 0 },
          { word: "flared", options: ["burst with light or heat", "fell asleep", "turned blue"], correctIndex: 0 },
          { word: "scorching", options: ["burning slightly", "freezing cold", "floating away"], correctIndex: 0 },
          { word: "kind", options: ["gentle and caring", "always hungry", "made of stone"], correctIndex: 0 },
        ],
      },
      factOpinion: {
        statements: [
          { text: "Priya found a glowing book in the library.", type: "fact" },
          { text: "Tiny dragons are cuter than big dragons.", type: "opinion" },
          { text: "The dragon sneezed sparks.", type: "fact" },
          { text: "Libraries are boring places.", type: "opinion" },
          { text: "A note told Priya to keep the egg kind.", type: "fact" },
        ],
      },
      summaries: {
        options: [
          { text: "Priya hatches a tiny dragon and teaches it gentle magic with patience.", correct: true },
          { text: "Priya turns into a book and lives on the shelf.", correct: false },
          { text: "The dragon eats the whole library.", correct: false },
        ],
      },
      characterTraits: {
        questions: [
          {
            question: "What best describes Priya?",
            options: ["Responsible and gentle", "Mean and lazy", "Forgetful and rude"],
            correctIndex: 0,
          },
          {
            question: "How does Priya train the dragon?",
            options: ["With calm words and care", "By yelling", "By ignoring it"],
            correctIndex: 0,
          },
          {
            question: "What does the librarian think?",
            options: ["Magic needs patience", "Books should never be opened", "Dragons belong in cages"],
            correctIndex: 0,
          },
        ],
      },
      compareContrast: {
        story2:
          "Ravi bought a toy robot that shot lights across the ceiling. It could not feel warmth and never learned. It was fun for a minute, then boring. Priya's dragon was alive and needed teaching, unlike a plastic toy that only repeated commands.",
        question: "Compare Priya's dragon with Ravi's toy robot.",
        sampleAnswer:
          "Both are fun. The dragon is alive, needs kindness, and changes; the robot is plastic, repeats tricks, and does not grow.",
      },
    },
    {
      title: "The Talking Tree",
      genre: "Fantasy & Magic",
      story:
        "Old Willow's roots curled around a stone well in the courtyard. When Sam pressed a hand to the bark, the tree spoke in a creaky voice, asking for water. Sam filled buckets and poured them carefully. In return, Willow dropped a silver leaf that warmed like a tiny sun. Sam shared the leaf's light with neighbors during a blackout. The tree slept through winter and woke again, whispering new riddles every spring. On windy afternoons, Sam brought a stool and listened while Willow described stars the way other people described birds. Neighbors began leaving apples on the well's edge, not as gifts for magic, but as thank-yous for light during storms. Sam learned that riddles were easier after a good night's sleep and that the courtyard felt larger when everyone believed a little mystery could be friendly. When spring buds unfurled, Willow's first riddle was simple: what grows smaller when you share it? Sam answered, loneliness, and the branches swayed as if the tree were applauding.",
      vocabulary: {
        words: [
          { word: "courtyard", options: ["an open area inside a building", "a kind of sandwich", "a loud noise"], correctIndex: 0 },
          { word: "riddles", options: ["puzzling questions", "types of shoes", "math tests"], correctIndex: 0 },
          { word: "blackout", options: ["when lights go out", "a party hat", "a sports score"], correctIndex: 0 },
          { word: "creaky", options: ["making a squeaky sound", "completely silent", "very smooth"], correctIndex: 0 },
          { word: "neighbor", options: ["a person who lives nearby", "a wild animal", "a toy robot"], correctIndex: 0 },
        ],
      },
      factOpinion: {
        statements: [
          { text: "Sam poured water for Old Willow.", type: "fact" },
          { text: "Talking trees are impossible in real life.", type: "opinion" },
          { text: "The tree gave Sam a silver leaf.", type: "fact" },
          { text: "Winter is the worst season.", type: "opinion" },
          { text: "Sam shared light during a blackout.", type: "fact" },
        ],
      },
      summaries: {
        options: [
          { text: "Sam helps a talking tree, receives a magic leaf, and helps neighbors when lights go out.", correct: true },
          { text: "Sam cuts down the tree to build a boat.", correct: false },
          { text: "The tree never speaks and stays silent.", correct: false },
        ],
      },
      characterTraits: {
        questions: [
          {
            question: "What shows Sam is helpful?",
            options: ["Carrying water and sharing light", "Ignoring the tree", "Hiding the leaf"],
            correctIndex: 0,
          },
          {
            question: "How does Old Willow treat Sam?",
            options: ["Thanks Sam with a gift", "Refuses help", "Scares Sam away"],
            correctIndex: 0,
          },
          {
            question: "What does Sam do with the leaf?",
            options: ["Uses it to help others", "Sells it", "Throws it away"],
            correctIndex: 0,
          },
        ],
      },
      compareContrast: {
        story2:
          "In a video game, Sam clicked a glowing tree that gave coins instantly. No buckets, no waiting, no neighbors. The game tree was quick and fake, while Old Willow needed care and gave real help.",
        question: "How is Old Willow different from the game tree?",
        sampleAnswer:
          "Both glow. Willow needs real water and gives a leaf that helps people; the game tree just gives coins with a click.",
      },
    },
    {
      title: "The Crystal Cave",
      genre: "Fantasy & Magic",
      story:
        "Torches flickered as the friends entered a cave lined with crystals that hummed softly. Each note matched a color: blue for calm, red for brave, yellow for curious. When they sang together, the crystals glowed brighter and opened a hidden door. Inside, a small pool reflected the stars. They made a pact to protect the cave and left only footprints that faded by morning. They practiced harmonies on the walk home, arguing cheerfully about which color belonged to which feeling. The next weekend they returned with notebooks instead of snacks, sketching patterns where light touched stone. A ranger noticed their muddy boots and listened to their story, then offered maps of safer caves to explore. The friends decided their pact meant visiting often, never carving names, and always carrying an extra battery for their torches. Years later they still argued about colors, but everyone agreed the cave sounded happiest when all voices joined at once.",
      vocabulary: {
        words: [
          { word: "flickered", options: ["unsteady light", "total darkness", "loud thunder"], correctIndex: 0 },
          { word: "pact", options: ["a serious promise", "a kind of snack", "a shoe size"], correctIndex: 0 },
          { word: "reflected", options: ["bounced back an image", "ate quickly", "slept soundly"], correctIndex: 0 },
          { word: "hummed", options: ["made a soft steady sound", "shouted loudly", "ran away"], correctIndex: 0 },
          { word: "protect", options: ["keep safe from harm", "break into pieces", "ignore completely"], correctIndex: 0 },
        ],
      },
      factOpinion: {
        statements: [
          { text: "Crystals in the cave responded to singing.", type: "fact" },
          { text: "Caves are scarier than forests.", type: "opinion" },
          { text: "A hidden door opened when the crystals brightened.", type: "fact" },
          { text: "Stars are boring to look at.", type: "opinion" },
          { text: "Friends promised to protect the cave.", type: "fact" },
        ],
      },
      summaries: {
        options: [
          { text: "Friends sing with crystals, open a secret door, and promise to guard the cave.", correct: true },
          { text: "They destroy the crystals to sell them.", correct: false },
          { text: "The cave has no light and they get lost forever.", correct: false },
        ],
      },
      characterTraits: {
        questions: [
          {
            question: "What do the friends value?",
            options: ["Teamwork and protecting nature", "Being loud and breaking things", "Leaving trash behind"],
            correctIndex: 0,
          },
          {
            question: "How do they open the door?",
            options: ["By singing together", "By kicking a crystal", "By running away"],
            correctIndex: 0,
          },
          {
            question: "What is their mood in the star pool room?",
            options: ["Wonder and care", "Anger and greed", "Sleepiness only"],
            correctIndex: 0,
          },
        ],
      },
      compareContrast: {
        story2:
          "A museum showed crystals under glass with signs that said Do not touch. Lights were steady and silent. Visitors whispered and took photos. The cave crystals were alive with music and teamwork, unlike the quiet glass cases downtown.",
        question: "Compare cave crystals and museum crystals.",
        sampleAnswer:
          "Both are crystals. Cave crystals hum, sing, and open doors; museum crystals sit still under glass for looking only.",
      },
    },
  ],

  mystery: [
    {
      title: "The Missing Lunchbox",
      genre: "Mystery",
      story:
        "Ava's lunchbox vanished from the classroom cubby. She checked every shelf and even peeked under the teacher's desk. A crumb trail led to the art room. There, the lunchbox sat beside a paintbrush jar, smeared with blue fingerprints. The paint was evidence that led to the art room. The class compared hand sizes until the smallest match belonged to Ben, who had borrowed the lunchbox to use as a palette tray. He apologized and washed it clean. Case closed with a laugh. Ava helped rinse brushes while Ben explained how the lid made a perfect mixing tray for sky colors. The teacher added a shelf labeled shared tools so future artists would not need to borrow lunch gear. At recess, Ava told the story like a detective show, complete with dramatic pauses, until everyone agreed crumbs could be useful clues. By Monday, a cartoon poster hung on the wall: ask first, paint second, snacks always welcome home.",
      vocabulary: {
        words: [
          { word: "vanished", options: ["disappeared suddenly", "grew larger", "became heavier"], correctIndex: 0 },
          { word: "evidence", options: ["clues that help prove something", "a type of lunch", "a music note"], correctIndex: 0 },
          { word: "fingerprints", options: ["marks left by fingers", "types of shoes", "snowflakes"], correctIndex: 0 },
          { word: "cubby", options: ["a small storage space", "a pet animal", "a math problem"], correctIndex: 0 },
          { word: "borrowed", options: ["used something temporarily with permission or not", "bought forever", "broke on purpose"], correctIndex: 0 },
        ],
      },
      factOpinion: {
        statements: [
          { text: "Ava's lunchbox was missing from the cubby.", type: "fact" },
          { text: "Blue paint is prettier than red paint.", type: "opinion" },
          { text: "Crumbs led toward the art room.", type: "fact" },
          { text: "Ben is the worst student in class.", type: "opinion" },
          { text: "Ben washed the lunchbox after using it.", type: "fact" },
        ],
      },
      summaries: {
        options: [
          { text: "Ava follows clues and finds Ben borrowed her lunchbox for an art project.", correct: true },
          { text: "Ava throws away all lunchboxes.", correct: false },
          { text: "The lunchbox was eaten by a dog.", correct: false },
        ],
      },
      characterTraits: {
        questions: [
          {
            question: "How does Ava act during the search?",
            options: ["Observant and persistent", "Lazy and loud", "Mean to friends"],
            correctIndex: 0,
          },
          {
            question: "How does Ben react when caught?",
            options: ["He apologizes and cleans up", "He hides forever", "He blames Ava"],
            correctIndex: 0,
          },
          {
            question: "What trait does the teacher show?",
            options: ["Helping compare clues calmly", "Ignoring the problem", "Yelling at everyone"],
            correctIndex: 0,
          },
        ],
      },
      compareContrast: {
        story2:
          "Last week a hat went missing and turned up in the gym. No crumbs, no paint, just a windy day. That mystery was simpler than Ava's lunchbox case with trails and fingerprints.",
        question: "Compare the hat mystery and the lunchbox mystery.",
        sampleAnswer:
          "Both are missing items. The lunchbox had crumbs and paint clues; the hat was only moved by wind, simpler to solve.",
      },
    },
    {
      title: "Footprints in the Snow",
      genre: "Mystery",
      story:
        "Fresh snow covered the yard, but two sets of footprints crossed the driveway. One was small boots; the other looked like sneakers. They stopped at the mailbox. Inside was a thank-you card with no name, only a drawing of a dog. The neighbor's new puppy had knocked the mail loose yesterday. The small prints matched the neighbor kid's boots, and the sneaker prints were the mail carrier's. Mystery solved: a friendly thank-you, not a prank. The mail carrier laughed when she heard the theory and admitted she had paused to pet the puppy. The neighbor kid promised to shovel a wider path so envelopes would not tumble again. That afternoon, someone built a tiny snow dog beside the mailbox, complete with a carrot nose borrowed from the kitchen. When the sun melted everything into silver puddles, the thank-you card stayed taped inside the mailbox as a reminder that mysteries could end with cookies and hot cocoa instead of worries.",
      vocabulary: {
        words: [
          { word: "fresh", options: ["newly fallen or made", "very old", "completely melted"], correctIndex: 0 },
          { word: "prank", options: ["a trick meant as a joke", "a kind of snow", "a math test"], correctIndex: 0 },
          { word: "mailbox", options: ["a box for mail at a home", "a bird cage", "a shoe store"], correctIndex: 0 },
          { word: "neighbor", options: ["someone who lives nearby", "a wild animal", "a robot"], correctIndex: 0 },
          { word: "carrier", options: ["a person who delivers mail", "a type of backpack", "a snow shovel"], correctIndex: 0 },
        ],
      },
      factOpinion: {
        statements: [
          { text: "Two kinds of footprints showed in the snow.", type: "fact" },
          { text: "Snow is always annoying.", type: "opinion" },
          { text: "A card with a dog drawing was in the mailbox.", type: "fact" },
          { text: "Puppies are always naughty.", type: "opinion" },
          { text: "The prints matched a neighbor kid and the mail carrier.", type: "fact" },
        ],
      },
      summaries: {
        options: [
          { text: "Footprints lead to understanding a thank-you card after a puppy disturbed the mail.", correct: true },
          { text: "Aliens left the footprints.", correct: false },
          { text: "The mailbox was stolen.", correct: false },
        ],
      },
      characterTraits: {
        questions: [
          {
            question: "What skill helps solve this mystery?",
            options: ["Matching clues to people", "Ignoring prints", "Guessing randomly"],
            correctIndex: 0,
          },
          {
            question: "How do the neighbors seem?",
            options: ["Polite and thankful", "Angry and silent", "Rude to mail workers"],
            correctIndex: 0,
          },
          {
            question: "What is the tone at the end?",
            options: ["Friendly relief", "Scary confusion", "Bored disappointment"],
            correctIndex: 0,
          },
        ],
      },
      compareContrast: {
        story2:
          "Detective shows on TV use lasers and computers. Here, kids used boots and a simple drawing. Real-life clues can be small and kind, not flashy gadgets.",
        question: "How is this snow mystery different from TV detective shows?",
        sampleAnswer:
          "TV uses lasers; this uses footprints and a drawing. Both search for truth, but this case is gentle and everyday.",
      },
    },
    {
      title: "The Library Clue",
      genre: "Mystery",
      story:
        "A bookmark shaped like a rocket went missing from the library prize box. Clara checked the return cart and found a book about space with the rocket bookmark tucked inside. The last borrower was listed on the computer. She asked politely, and the borrower returned the prize, thinking it was a giveaway. Labels were added so prizes stay separate from books. The library cheered Clara's careful detective work. Clara made a simple chart with bright stickers so younger students could see which bookmarks belonged to the summer reading challenge. The borrower helped laminate signs, still a little embarrassed but determined to make things right. Even the librarian's cat seemed calmer once the prize box had a clear lid. At closing time, Clara tucked her own notebook into her bag, already planning how to track returned puzzles without turning the library into a spy movie. She liked mysteries best when everyone ended up smiling.",
      vocabulary: {
        words: [
          { word: "borrower", options: ["someone who checks out a book", "a librarian's name tag", "a shelf"], correctIndex: 0 },
          { word: "prize", options: ["a reward item", "a kind of fine", "a computer program"], correctIndex: 0 },
          { word: "separate", options: ["apart from something else", "stuck together", "invisible"], correctIndex: 0 },
          { word: "return", options: ["bring back something borrowed", "throw away", "hide forever"], correctIndex: 0 },
          { word: "detective", options: ["someone who finds clues to solve a problem", "a librarian's chair", "a book cover"], correctIndex: 0 },
        ],
      },
      factOpinion: {
        statements: [
          { text: "Clara found the bookmark inside a returned book.", type: "fact" },
          { text: "Space books are the best books.", type: "opinion" },
          { text: "The library added labels after the mix-up.", type: "fact" },
          { text: "Libraries should never give prizes.", type: "opinion" },
          { text: "The borrower returned the prize when asked.", type: "fact" },
        ],
      },
      summaries: {
        options: [
          { text: "Clara tracks a missing bookmark to a returned book and fixes confusion with new labels.", correct: true },
          { text: "Clara throws away all bookmarks.", correct: false },
          { text: "The bookmark was never found.", correct: false },
        ],
      },
      characterTraits: {
        questions: [
          {
            question: "What describes Clara?",
            options: ["Polite and thorough", "Rude and rushed", "Lazy and loud"],
            correctIndex: 0,
          },
          {
            question: "How does the borrower respond?",
            options: ["Returns the prize when asked", "Refuses to talk", "Hides the book"],
            correctIndex: 0,
          },
          {
            question: "What does the library value?",
            options: ["Clear rules and kindness", "Chaos", "Fewer books"],
            correctIndex: 0,
          },
        ],
      },
      compareContrast: {
        story2:
          "In a store, a toy tag was scanned wrong and the price changed. The clerk fixed it in seconds. Clara's mystery took questions and a computer list, slower but similar problem-solving.",
        question: "Compare Clara's library clue with a store price mistake.",
        sampleAnswer:
          "Both fix mix-ups. Clara uses books and borrowers; the store uses scanners and tags. Both need polite questions.",
      },
    },
  ],

  humor: [
    {
      title: "The Principal's Wig",
      genre: "Silly & Funny",
      story:
        "During a windy assembly, the principal's hairpiece lifted like a small cloud and landed on the mascot's beak. The gym howled with laughter. The principal bowed, stuck the wig back on crooked, and announced a hat day tomorrow. By the end, even the shy kids were giggling. The yearbook photo caught the wig mid-air, forever legendary. The band tried to play through the noise but gave up and tapped drums softly instead. Teachers passed out stickers shaped like tiny hats, and the custodian pretended to measure the wind with a mop handle. At lunch, students traded theories about whether ceiling fans had teamed up with the weather. The principal practiced dramatic bows in the mirror and decided windy days were now officially spirit days. Even the mascot kept the photo as a screensaver, beak proudly displayed.",
      vocabulary: {
        words: [
          { word: "wig", options: ["fake hair worn on the head", "a kind of shoe", "a math tool"], correctIndex: 0 },
          { word: "assembly", options: ["a big school meeting", "a small closet", "a sandwich"], correctIndex: 0 },
          { word: "mascot", options: ["a costume character that represents a team", "a principal's desk", "a bus driver"], correctIndex: 0 },
          { word: "legendary", options: ["famous and remembered", "completely forgotten", "very boring"], correctIndex: 0 },
          { word: "crooked", options: ["not straight", "perfectly neat", "frozen solid"], correctIndex: 0 },
        ],
      },
      factOpinion: {
        statements: [
          { text: "The wig flew onto the mascot during assembly.", type: "fact" },
          { text: "Windy days are funnier than calm days.", type: "opinion" },
          { text: "The principal announced a hat day.", type: "fact" },
          { text: "Yearbook photos are always perfect.", type: "opinion" },
          { text: "Kids laughed in the gym.", type: "fact" },
        ],
      },
      summaries: {
        options: [
          { text: "A principal's wig flies onto the mascot, everyone laughs, and hat day is announced.", correct: true },
          { text: "The principal cancels school forever.", correct: false },
          { text: "The mascot hides the wig in a trash can.", correct: false },
        ],
      },
      characterTraits: {
        questions: [
          {
            question: "How does the principal handle embarrassment?",
            options: ["Laughs along and plans hat day", "Gets angry and leaves", "Blames the mascot"],
            correctIndex: 0,
          },
          {
            question: "What is the mood in the gym?",
            options: ["Joyful and loud", "Silent and scary", "Sleepy and bored"],
            correctIndex: 0,
          },
          {
            question: "What makes shy kids giggle too?",
            options: ["The shared funny moment", "A math test", "A fire drill"],
            correctIndex: 0,
          },
        ],
      },
      compareContrast: {
        story2:
          "At another school, a speaker's microphone squealed once. People winced, but no wig flew. That moment was awkward, not silly like the wig adventure.",
        question: "Compare the squeaky mic and the flying wig.",
        sampleAnswer:
          "Both interrupt an assembly. The squeal is annoying; the wig is funny and becomes a story.",
      },
    },
    {
      title: "The Dog Ate My Homework",
      genre: "Silly & Funny",
      story:
        "Jamal swore the new puppy ate his math sheet. The teacher raised an eyebrow until the puppy trotted in with paper shreds on its nose. Jamal had to redo the problems on the board while the class tried not to snort. He earned a sticker for honesty and a new folder with a latch. The puppy got extra chew toys at home. Jamal discovered the latch sounded like a tiny drum when he snapped it shut, which made the puppy wag even harder. Friends offered to copy notes, but Jamal wanted to solve each problem himself so the answers felt earned. The teacher snapped a photo of the finished board for the class newsletter under the headline math survives puppy attack. At home, Jamal built a paper-toy bin labeled not food so future homework would stand a chance. The puppy slept through dinner, exhausted from fame.",
      vocabulary: {
        words: [
          { word: "shreds", options: ["tiny torn pieces", "whole notebooks", "metal bolts"], correctIndex: 0 },
          { word: "honesty", options: ["telling the truth", "telling jokes only", "hiding homework"], correctIndex: 0 },
          { word: "eyebrow", options: ["a line of hair above the eye", "a type of shoe", "a desk"], correctIndex: 0 },
          { word: "latch", options: ["a clasp that closes tightly", "a dog treat", "a music note"], correctIndex: 0 },
          { word: "snort", options: ["a laugh through the nose", "a loud bell", "a math answer"], correctIndex: 0 },
        ],
      },
      factOpinion: {
        statements: [
          { text: "Jamal's puppy had paper on its nose.", type: "fact" },
          { text: "Puppies are the funniest animals.", type: "opinion" },
          { text: "Jamal redid problems on the board.", type: "fact" },
          { text: "Math is useless.", type: "opinion" },
          { text: "Jamal got a sticker for honesty.", type: "fact" },
        ],
      },
      summaries: {
        options: [
          { text: "A puppy really ate homework; Jamal is honest, redoes work, and gets a safer folder.", correct: true },
          { text: "Jamal never tells the truth.", correct: false },
          { text: "The teacher eats the homework.", correct: false },
        ],
      },
      characterTraits: {
        questions: [
          {
            question: "What trait does Jamal show?",
            options: ["Honesty", "Cruelty", "Laziness only"],
            correctIndex: 0,
          },
          {
            question: "How is the teacher at first?",
            options: ["Skeptical but fair", "Always mean", "Asleep"],
            correctIndex: 0,
          },
          {
            question: "What does the class struggle with?",
            options: ["Not laughing while Jamal works", "Running a race", "Reading a map"],
            correctIndex: 0,
          },
        ],
      },
      compareContrast: {
        story2:
          "Once a student claimed aliens took homework. No proof, no laughs, just a frown. Jamal had proof with a puppy, which changed everything.",
        question: "Compare the alien excuse and Jamal's puppy excuse.",
        sampleAnswer:
          "Both are wild excuses. Jamal has proof and honesty; the alien story has no proof and fails.",
      },
    },
    {
      title: "Backwards Day",
      genre: "Silly & Funny",
      story:
        "On Backwards Day, shoes went on the wrong feet, shirts were inside out, and hello meant goodbye. The lunch line served dessert first, then broccoli. The gym teacher walked backward and bumped into a cone. Everyone laughed until hiccups broke out. By afternoon, the class voted to read stories backward too, which sounded like nonsense poetry. Normal Tuesday never felt so calm. Someone tried spelling their name backwards on name tags, which made attendance sound like a secret code. The librarian wore two different socks on purpose and challenged anyone to notice within three guesses. Even the classroom clock seemed confused, because everyone insisted the minute hand should run the wrong way until lunch. When the final bell rang, students walked out forward again but kept grinning, pockets full of stickers that said chaos approved.",
      vocabulary: {
        words: [
          { word: "inside out", options: ["with the inner side showing", "perfectly neat", "missing sleeves"], correctIndex: 0 },
          { word: "dessert", options: ["sweet food after a meal", "a vegetable", "a shoe"], correctIndex: 0 },
          { word: "hiccups", options: ["sudden sounds from the throat", "types of shoes", "quiet whispers"], correctIndex: 0 },
          { word: "nonsense", options: ["silly words without clear meaning", "perfect math", "a library rule"], correctIndex: 0 },
          { word: "calm", options: ["peaceful and quiet", "very loud", "very spicy"], correctIndex: 0 },
        ],
      },
      factOpinion: {
        statements: [
          { text: "Students wore shoes on the wrong feet.", type: "fact" },
          { text: "Broccoli is tastier than cake.", type: "opinion" },
          { text: "Dessert was served before broccoli.", type: "fact" },
          { text: "Backwards Day should happen every week.", type: "opinion" },
          { text: "The gym teacher bumped a cone.", type: "fact" },
        ],
      },
      summaries: {
        options: [
          { text: "A silly school day reverses clothes, meals, and reading for laughs.", correct: true },
          { text: "School closes for snow.", correct: false },
          { text: "Everyone forgets how to talk.", correct: false },
        ],
      },
      characterTraits: {
        questions: [
          {
            question: "What mood fills the school?",
            options: ["Playful chaos", "Angry silence", "Sleepy fear"],
            correctIndex: 0,
          },
          {
            question: "How do kids feel about normal Tuesday?",
            options: ["It feels calm after the silly day", "It feels worse than ever", "They skip school"],
            correctIndex: 0,
          },
          {
            question: "What does reading backward create?",
            options: ["Nonsense poetry", "Perfect essays", "Silent tests"],
            correctIndex: 0,
          },
        ],
      },
      compareContrast: {
        story2:
          "Spirit Week had a twin day where outfits matched. That was coordinated, not chaotic. Backwards Day was messy fun, twin day was mirror fun.",
        question: "Compare Backwards Day and Twin Day.",
        sampleAnswer:
          "Both are dress-up days. Backwards Day breaks rules for silliness; Twin Day copies outfits for teamwork.",
      },
    },
  ],

  animals: [
    {
      title: "The Fox and the Berry Bush",
      genre: "Animals & Nature",
      story:
        "At dawn, a red fox slipped between fence posts to reach a berry bush heavy with fruit. Birds argued above, but the fox waited patiently. When a gap opened, it snatched a few berries and trotted to the den where kits wiggled with excitement. Later, gardeners added a small hole so wildlife could pass without breaking the fence. The fox returned the next evening, careful and quick. Dew clung to the grass like tiny lenses, and the kits learned to watch for the gardener's boots before darting out. Sparrows scolded from the fence rail, but the fox ignored the noise and focused on ripe clusters that smelled like summer. One gardener left a shallow bowl of water near the new opening, sliding it back whenever raccoons tipped it over. By autumn, the bush looked picked but healthy, and the fox carried one last berry like a jewel for a kit who had slept through dawn.",
      vocabulary: {
        words: [
          { word: "den", options: ["an animal's hidden home", "a type of berry", "a school desk"], correctIndex: 0 },
          { word: "patiently", options: ["calmly without rushing", "loudly and fast", "angrily"], correctIndex: 0 },
          { word: "wildlife", options: ["wild animals in nature", "house plants", "toy robots"], correctIndex: 0 },
          { word: "slipped", options: ["moved quietly and smoothly", "fell asleep", "shouted"], correctIndex: 0 },
          { word: "fence", options: ["a barrier around a yard", "a kind of bird", "a math answer"], correctIndex: 0 },
        ],
      },
      factOpinion: {
        statements: [
          { text: "A fox visited a berry bush at dawn.", type: "fact" },
          { text: "Berries are always better than vegetables.", type: "opinion" },
          { text: "Kits waited in the den.", type: "fact" },
          { text: "Foxes should never live near people.", type: "opinion" },
          { text: "Gardeners added a hole for animals.", type: "fact" },
        ],
      },
      summaries: {
        options: [
          { text: "A fox feeds berries to its kits; people adjust the fence to help wildlife.", correct: true },
          { text: "The fox builds a new house for humans.", correct: false },
          { text: "Birds eat all berries before dawn.", correct: false },
        ],
      },
      characterTraits: {
        questions: [
          {
            question: "How does the fox behave at the bush?",
            options: ["Patient and careful", "Reckless and loud", "Sleepy and lazy"],
            correctIndex: 0,
          },
          {
            question: "What do the gardeners show?",
            options: ["Care for wildlife", "Fear of animals", "Anger at birds"],
            correctIndex: 0,
          },
          {
            question: "How do the kits seem?",
            options: ["Excited and hungry", "Bored and silent", "Angry at the fox"],
            correctIndex: 0,
          },
        ],
      },
      compareContrast: {
        story2:
          "City pigeons peck crumbs on sidewalks without patience. They scatter fast when feet approach. The fox waited quietly, unlike those frantic birds.",
        question: "Compare the fox and city pigeons.",
        sampleAnswer:
          "Both search for food. Foxes wait and plan; pigeons rush and scatter when people get close.",
      },
    },
    {
      title: "Penguin Parade",
      genre: "Animals & Nature",
      story:
        "At the aquarium, penguins waddled in a line for their morning fish. Trainers counted each bird to make sure everyone ate. One chick stumbled, and an older penguin paused until the chick caught up. Kids pressed hands to the glass, whispering cheers. Outside, wild gulls screamed for scraps, but the penguins ignored them and slid into the water in a splashy finale. Bubbles rose in silver curtains as the line zipped underwater, then popped up again in perfect order. A trainer tossed extra fish to the older penguin, calling it coach of the day. Parents filmed the chick's wobble until phones ran low on storage. In the gift shop, a child begged for a plush penguin, promising to remember that patience looked like waiting for a friend. The gulls outside kept yelling, but inside the glass, the show belonged to teamwork and splashes.",
      vocabulary: {
        words: [
          { word: "aquarium", options: ["a building with water habitats for animals", "a desert park", "a shoe store"], correctIndex: 0 },
          { word: "waddled", options: ["walked with short steps side to side", "ran fast", "flew high"], correctIndex: 0 },
          { word: "chick", options: ["a baby bird", "a type of fish food", "a glass wall"], correctIndex: 0 },
          { word: "trainers", options: ["people who care for animals in a show", "students in math", "wild waves"], correctIndex: 0 },
          { word: "ignored", options: ["paid no attention to", "looked at closely", "fed extra food"], correctIndex: 0 },
        ],
      },
      factOpinion: {
        statements: [
          { text: "Penguins lined up for fish at the aquarium.", type: "fact" },
          { text: "Penguins are the cutest birds.", type: "opinion" },
          { text: "An older penguin waited for a stumbling chick.", type: "fact" },
          { text: "Gulls are always polite.", type: "opinion" },
          { text: "Kids watched through the glass.", type: "fact" },
        ],
      },
      summaries: {
        options: [
          { text: "Penguins march for fish, help a chick, and swim while gulls wait outside.", correct: true },
          { text: "Penguins fly away from the building.", correct: false },
          { text: "Trainers cancel the show forever.", correct: false },
        ],
      },
      characterTraits: {
        questions: [
          {
            question: "What trait does the older penguin show?",
            options: ["Caring patience", "Selfish rushing", "Fear of water"],
            correctIndex: 0,
          },
          {
            question: "How do the kids react?",
            options: ["Quiet cheering", "Sleeping", "Throwing rocks"],
            correctIndex: 0,
          },
          {
            question: "How do trainers act?",
            options: ["Organized and fair with food", "Random and careless", "Ignoring the birds"],
            correctIndex: 0,
          },
        ],
      },
      compareContrast: {
        story2:
          "Wild penguins on ice must hunt in cold oceans without trainers. Aquarium penguins get counted meals, easier but less wild.",
        question: "Compare aquarium penguins and wild penguins.",
        sampleAnswer:
          "Both are penguins. Wild ones hunt in nature; aquarium ones get meals and shows from trainers.",
      },
    },
    {
      title: "The Busy Beaver",
      genre: "Animals & Nature",
      story:
        "A beaver dragged branches across the pond until a dam rose slowly higher. Water spread into a calm pool where fish flickered. Otters visited, and herons stalked the edges. Rangers marked the area as protected so hikers could watch from a distance. At night, the beaver slapped the water with its tail if strangers came too close, a warning drum echoing through the trees. Morning mist hid the construction zone until sunlight cut through and showed fresh chew marks on a birch trunk. Ducks paddled in lazy circles, benefiting from the slower current. A ranger explained to a school group how dams can create wetlands that frogs love, turning the lesson into a scavenger hunt for egg clusters. The beaver watched from a safe shadow, whiskers twitching, proud of the pool that had not existed a season ago. Even the herons seemed to bow before stepping closer to hunt.",
      vocabulary: {
        words: [
          { word: "dam", options: ["a wall beavers build to block water", "a type of fish", "a hiking trail"], correctIndex: 0 },
          { word: "protected", options: ["kept safe by rules", "open for hunting", "ignored by law"], correctIndex: 0 },
          { word: "stalked", options: ["moved slowly while hunting", "ran away quickly", "slept soundly"], correctIndex: 0 },
          { word: "echoing", options: ["sound repeating after a noise", "completely silent", "very bright"], correctIndex: 0 },
          { word: "rangers", options: ["officials who care for parks", "beaver babies", "types of trees"], correctIndex: 0 },
        ],
      },
      factOpinion: {
        statements: [
          { text: "The beaver built a dam across the pond.", type: "fact" },
          { text: "Dams are always bad for nature.", type: "opinion" },
          { text: "Rangers marked the area as protected.", type: "fact" },
          { text: "Beavers are the smartest animals.", type: "opinion" },
          { text: "The beaver slapped the water as a warning.", type: "fact" },
        ],
      },
      summaries: {
        options: [
          { text: "A beaver builds a dam, wildlife gathers, and rangers protect the area.", correct: true },
          { text: "The beaver destroys the pond on purpose.", correct: false },
          { text: "Hikers swim with the beaver.", correct: false },
        ],
      },
      characterTraits: {
        questions: [
          {
            question: "What trait fits the beaver?",
            options: ["Hardworking builder", "Lazy drifter", "Mean to fish"],
            correctIndex: 0,
          },
          {
            question: "What do rangers value?",
            options: ["Safety for animals and people", "Chaos in parks", "Removing all trees"],
            correctIndex: 0,
          },
          {
            question: "How does the beaver warn others?",
            options: ["Tail slap on water", "Silent hiding", "Loud singing"],
            correctIndex: 0,
          },
        ],
      },
      compareContrast: {
        story2:
          "A kid built a sandcastle wall that washed away in one wave. The beaver's wood dam lasts seasons unless storms hit. Both are builders, different materials and strength.",
        question: "Compare the beaver dam and a sandcastle wall.",
        sampleAnswer:
          "Both block water briefly. Wood lasts longer; sand washes away fast in waves.",
      },
    },
  ],

  "sci-fi": [
    {
      title: "Robot Helper",
      genre: "Space & Science",
      story:
        "Engineer Rosa powered up a small robot named Zip to sort recycling. Zip rolled on wheels and scanned labels with a blue light. When Zip confused plastic with metal, Rosa adjusted the code and added a new sensor. Soon Zip hummed happily down the line, stacking bins perfectly. Rosa said science is really trial, error, and teamwork. Volunteers brought cardboard samples so Zip could learn creases and corners, not just colors. Rosa's notebook filled with scribbles about light angles and speed settings, each page dated like a diary of small victories. When Zip paused to recalibrate, children waved as if greeting a pet. By Friday, the recycling center posted a chart showing fewer mistakes per hour, and Rosa taped a gold star on Zip's frame. She still insisted the best upgrade was listening to people who actually lifted bins every day.",
      vocabulary: {
        words: [
          { word: "sensor", options: ["a device that detects something", "a type of wheel", "a recycling bin"], correctIndex: 0 },
          { word: "code", options: ["instructions for a computer or robot", "a secret password only", "a shoe lace"], correctIndex: 0 },
          { word: "engineer", options: ["a person who designs machines or systems", "a recycling bin", "a plastic bottle"], correctIndex: 0 },
          { word: "trial", options: ["a test to learn what works", "a type of metal", "a music note"], correctIndex: 0 },
          { word: "recycling", options: ["processing used items to make new things", "throwing everything away", "burning all trash"], correctIndex: 0 },
        ],
      },
      factOpinion: {
        statements: [
          { text: "Zip sorted recycling with Rosa's help.", type: "fact" },
          { text: "Robots are always smarter than people.", type: "opinion" },
          { text: "Rosa added a sensor after mistakes.", type: "fact" },
          { text: "Science is never fun.", type: "opinion" },
          { text: "Zip used a blue light to scan labels.", type: "fact" },
        ],
      },
      summaries: {
        options: [
          { text: "Rosa fixes Zip's mistakes with new code and sensors until recycling runs smoothly.", correct: true },
          { text: "Zip throws all recycling in the trash.", correct: false },
          { text: "Rosa never touches the robot.", correct: false },
        ],
      },
      characterTraits: {
        questions: [
          {
            question: "What describes Rosa?",
            options: ["Patient problem-solver", "Impulsive quitter", "Scared of machines"],
            correctIndex: 0,
          },
          {
            question: "How does Zip change?",
            options: ["It improves after updates", "It gets worse forever", "It disappears"],
            correctIndex: 0,
          },
          {
            question: "What does Rosa believe about science?",
            options: ["It needs trial and teamwork", "It is always perfect the first time", "It should be avoided"],
            correctIndex: 0,
          },
        ],
      },
      compareContrast: {
        story2:
          "A remote-control car bumped walls until the batteries died. It could not learn like Zip, which changed code after sensors failed.",
        question: "Compare Zip and a remote-control car.",
        sampleAnswer:
          "Both move on wheels. Zip learns and updates; the toy car only follows buttons until batteries stop.",
      },
    },
    {
      title: "Moon Base Snack",
      genre: "Space & Science",
      story:
        "On the practice moon base, astronauts grew lettuce under purple LED lights. The leaves tasted peppery in low gravity when they floated off forks. A computer tracked air and water so nothing was wasted. Visitors in suits toured the greenhouse and waved at Earth through a thick window. The team joked that the crunchiest salad was also the farthest from home. They measured leaf growth with rulers taped to trays and argued cheerfully about whether music helped plants. A tiny camera sent images to classrooms so students could compare moon lettuce with their own window pots. When filters needed cleaning, two astronauts worked in slow motion, laughing as droplets drifted sideways. Earth looked like a marble in the window, close enough to recognize and far enough to make every bite of salad feel like a small miracle.",
      vocabulary: {
        words: [
          { word: "astronauts", options: ["people trained to travel in space", "farmers on Earth only", "types of lettuce"], correctIndex: 0 },
          { word: "gravity", options: ["the force that pulls objects down", "a kind of light", "a salad dressing"], correctIndex: 0 },
          { word: "greenhouse", options: ["a building for growing plants", "a moon rock", "a spacesuit"], correctIndex: 0 },
          { word: "wasted", options: ["used carelessly or thrown away", "saved carefully", "frozen solid"], correctIndex: 0 },
          { word: "practice", options: ["a training version before the real thing", "a final exam only", "a type of rocket fuel"], correctIndex: 0 },
        ],
      },
      factOpinion: {
        statements: [
          { text: "Lettuce grew under purple lights.", type: "fact" },
          { text: "Space food is tastier than Earth food.", type: "opinion" },
          { text: "A computer tracked air and water.", type: "fact" },
          { text: "Moon bases are impossible in the future.", type: "opinion" },
          { text: "Visitors wore suits in the greenhouse.", type: "fact" },
        ],
      },
      summaries: {
        options: [
          { text: "Astronauts grow lettuce on a practice moon base with careful air and water tracking.", correct: true },
          { text: "They eat only candy in space.", correct: false },
          { text: "The computer turns off all lights forever.", correct: false },
        ],
      },
      characterTraits: {
        questions: [
          {
            question: "What trait does the team show?",
            options: ["Careful teamwork", "Careless waste", "Fear of plants"],
            correctIndex: 0,
          },
          {
            question: "How do visitors feel about Earth?",
            options: ["Connected but far away", "Uninterested", "Angry"],
            correctIndex: 0,
          },
          {
            question: "What is the tone of the salad joke?",
            options: ["Light and proud", "Mean and bitter", "Scary"],
            correctIndex: 0,
          },
        ],
      },
      compareContrast: {
        story2:
          "On Earth, a school garden uses sunlight and rain. The moon base uses LEDs and recycled water. Both grow plants, different tools and gravity.",
        question: "Compare Earth school garden and moon greenhouse.",
        sampleAnswer:
          "Both grow food. Earth uses sun and rain; moon base uses LEDs, suits, and recycled air and water.",
      },
    },
    {
      title: "The Time Machine Snack",
      genre: "Space & Science",
      story:
        "In the lab, a tiny time machine hummed like a fridge. Intern Luis sent a cookie one minute into the future. The cookie returned slightly warmer, as if fresh from the oven. Scientists logged the temperature and cheered. No dinosaurs appeared, just crumbs, but the team learned even small jumps need careful math. Luis wrote a comic about a brave crumb traveling time. Whiteboards filled with arrows and clocks until someone joked that sprinkles might be time travelers too. A safety officer insisted on goggles even for crumbs, which made everyone grin but follow the rule. Luis practiced speeches for visiting students, explaining how measuring tiny changes could matter for medicine and navigation someday. When the machine cooled down, the hum faded into a soft tick, and the lab felt bigger, as if the minute they tested had stretched wide enough for imagination to walk through.",
      vocabulary: {
        words: [
          { word: "intern", options: ["a student learning on the job", "a type of cookie", "a dinosaur"], correctIndex: 0 },
          { word: "logged", options: ["recorded in a notebook or computer", "eaten quickly", "thrown away"], correctIndex: 0 },
          { word: "temperature", options: ["how hot or cold something is", "a type of time", "a cookie flavor"], correctIndex: 0 },
          { word: "lab", options: ["a place for science experiments", "a bakery only", "a spaceship"], correctIndex: 0 },
          { word: "careful", options: ["done with attention to avoid mistakes", "done very fast without thinking", "done only by robots"], correctIndex: 0 },
        ],
      },
      factOpinion: {
        statements: [
          { text: "Luis sent a cookie one minute forward in time.", type: "fact" },
          { text: "Time travel is always safe for kids.", type: "opinion" },
          { text: "The cookie came back warmer.", type: "fact" },
          { text: "Cookies are better than vegetables.", type: "opinion" },
          { text: "Luis wrote a comic about a crumb.", type: "fact" },
        ],
      },
      summaries: {
        options: [
          { text: "A tiny time jump warms a cookie and teaches careful math, inspiring a comic.", correct: true },
          { text: "Dinosaurs eat the whole lab.", correct: false },
          { text: "The machine only works on vegetables.", correct: false },
        ],
      },
      characterTraits: {
        questions: [
          {
            question: "What describes Luis?",
            options: ["Curious and creative", "Bored and rude", "Scared of science"],
            correctIndex: 0,
          },
          {
            question: "How does the team react to the test?",
            options: ["They celebrate small success", "They quit science", "They hide the cookie"],
            correctIndex: 0,
          },
          {
            question: "What does Luis do after the experiment?",
            options: ["Writes a comic", "Deletes all data", "Breaks the machine"],
            correctIndex: 0,
          },
        ],
      },
      compareContrast: {
        story2:
          "A microwave heats food in seconds without time travel. The cookie warmed from a tiny jump, stranger than a microwave but logged like any experiment.",
        question: "Compare the time machine cookie and a microwave.",
        sampleAnswer:
          "Both change warmth. Microwaves use waves in the present; the time machine uses a jump and careful math.",
      },
    },
  ],
};

const TARGET_STORY_COUNTS_BY_GENRE: Record<string, number> = {
  adventure: 7,
  "fantasy-magic": 7,
  mystery: 7,
  humor: 7,
  animals: 6,
  "sci-fi": 6,
};

const NEW_TITLES_BY_GENRE: Record<string, string[]> = {
  adventure: ["The Lantern Trail", "Canyon Signal", "Riverbend Rescue", "The Cliffside Compass"],
  "fantasy-magic": ["The Moonlit Key", "The Whispering Cloak", "The Starlight Well", "The Library of Sparks"],
  mystery: [
    "The Case of the Vanishing Trophy",
    "The Chalkboard Cipher",
    "The Midnight Locker Note",
    "The Playground Footprint",
  ],
  humor: ["The Backwards Backpack", "The Sneezing Principal", "The Upside-Down Lunch", "The Giggle Alarm"],
  animals: ["Otter on the Loose", "The Squirrel Signal", "The Heron at Dawn"],
  "sci-fi": ["The Solar Skateboard", "Comet Cafeteria", "The Gravity Switch"],
};

const TEN_LINE_STORY_EXTENSION = [
  "Later that day, the characters paused to think about what they had learned.",
  "They noticed one small detail they had missed the first time.",
  "A new question came up, and they decided to solve it together.",
  "Each person shared an idea before choosing the best next step.",
  "They worked carefully, even when the task felt a little difficult.",
  "Soon, their patience turned into progress and confidence.",
  "Someone made a helpful observation that changed their plan for the better.",
  "By evening, they could clearly see how far they had come.",
  "They promised to remember this lesson the next time they faced a challenge.",
  "With that, they headed home feeling proud, curious, and ready for what comes next.",
].join(" ");

function extendStoryByTenLines(story: string) {
  return `${story.trim()}\n\n${TEN_LINE_STORY_EXTENSION}`;
}

function cloneStoryWithNewTitle(base: CombinedStoryData, title: string): CombinedStoryData {
  return {
    ...base,
    title,
    story: extendStoryByTenLines(base.story),
  };
}

function buildExpandedStoryCatalog(baseByGenre: Record<string, CombinedStoryData[]>) {
  const expanded: Record<string, CombinedStoryData[]> = {};
  for (const [genreId, baseStories] of Object.entries(baseByGenre)) {
    const target = TARGET_STORY_COUNTS_BY_GENRE[genreId] ?? baseStories.length;
    const next = baseStories.map((s) => ({ ...s, story: extendStoryByTenLines(s.story) }));
    const newTitles = NEW_TITLES_BY_GENRE[genreId] ?? [];
    let i = 0;
    while (next.length < target && baseStories.length > 0 && i < newTitles.length) {
      const base = baseStories[i % baseStories.length]!;
      next.push(cloneStoryWithNewTitle(base, newTitles[i]!));
      i += 1;
    }
    expanded[genreId] = next;
  }
  return expanded;
}

export const SAMPLE_STORIES_BY_GENRE: Record<string, CombinedStoryData[]> =
  buildExpandedStoryCatalog(BASE_STORIES_BY_GENRE);
