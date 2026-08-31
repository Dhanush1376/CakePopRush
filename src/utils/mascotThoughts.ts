import { MascotReaction } from '@/components/mascot/reactions/reactionTypes';

interface ThoughtTemplate {
  text: string;
  reaction: MascotReaction;
}

const templates: ThoughtTemplate[] = [
  { text: "I love {category} too!", reaction: "heartEyes" },
  { text: "Oh, excellent choice of {category}!", reaction: "determined" },
  { text: "{category}? Yum!", reaction: "excited" },
  { text: "Nothing beats fresh {category}!", reaction: "happy" },
  { text: "I was just craving {category}!", reaction: "laughing" },
  { text: "{category} make me so happy!", reaction: "love" },
  { text: "Ooh, {category}! Great taste!", reaction: "winking" },
  { text: "I need some {category} right now!", reaction: "pleadingCute" },
  { text: "Can we share these {category}?", reaction: "blushing" },
  { text: "The best {category} ever!", reaction: "excited" },
  { text: "Let's get some {category}!", reaction: "party" },
  { text: "{category} are simply the best.", reaction: "cool" },
  { text: "Mmm... {category}...", reaction: "heartEyes" },
  { text: "You can't go wrong with {category}!", reaction: "happy" },
  { text: "{category}? Don't mind if I do!", reaction: "silly" },
  { text: "I've been dreaming about {category}.", reaction: "sleeping" },
  { text: "Are those {category} for me?", reaction: "cryingFountain" },
  { text: "Time for {category}!", reaction: "party" },
  { text: "I'm obsessed with {category}!", reaction: "emotionalCute" },
  { text: "Can't stop thinking about {category}.", reaction: "love" },
  { text: "{category} = Happiness!", reaction: "laughing" },
  { text: "I highly recommend the {category}.", reaction: "determined" },
  { text: "Treat yourself to {category}!", reaction: "winking" },
  { text: "I want ALL the {category}!", reaction: "excited" },
  { text: "{category} are my absolute favorite.", reaction: "heartEyes" },
  { text: "Did someone say {category}?", reaction: "surprised" },
  { text: "You're gonna love these {category}.", reaction: "cool" },
  { text: "Nothing like {category} on a good day.", reaction: "happy" },
  { text: "{category} fix everything.", reaction: "love" },
  { text: "Perfect day for {category}!", reaction: "party" },
  { text: "I would do anything for {category}!", reaction: "emotionalCute" },
  { text: "Choosing {category} is a genius move.", reaction: "determined" },
  { text: "I was hoping you'd click {category}!", reaction: "blushing" },
  { text: "Grab some {category} for me too!", reaction: "silly" },
  { text: "{category} is always the right answer.", reaction: "winking" }
];

export const getRandomThought = (categoryName: string): ThoughtTemplate => {
  // If the user selects "all", we can just say "treats" or "sweets"
  const name = categoryName.toLowerCase() === 'all items' ? 'sweets' : categoryName;
  
  // Grab a random template
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Replace {category} with the actual name
  return {
    text: template.text.replace('{category}', name),
    // Use fallback if we mapped a weird reaction by mistake
    reaction: template.reaction || 'happy'
  };
};
