const BLOG_GENERATION_TIMER = 7000;
const BLOG_QUERY = `From the Given text you you need to generate a blog markdown such that you'll pick a random piece from extract from the text and craft a blog out of that such that you'll craft it in a manner in which you're not proving any summary of the text rather a blog post that will contain exact lines from the text such that they can be read in the isolation from the book as a story , at last I want to say try not to put your own conclusions but start it with the small introcution and the small end conclusion, "also make each blog is totally different from the last one's" topic, make sure it's long enough that you're not juggling 2 random para and making a blog, make long enough interesting teaching story, at the end remember to keep the previous blog in mind so you by mistake don't generate two blogs with the same title try to be creative with titles please I don't want same titles, use your utmost creativity when naming the blog each time`;

const BLOG_QUERY_NO_REPEAT = `Generate a blog markdown such that you'll pick a random piece from extract from the cached context and craft a blog out of that such in a manner in which you're not proving any summary of the text rather blog post that'll contain exact lines from the text so they can be read in the isolation from the book as a story , at last I want to say try not to put your own conclusions but start it with the small introduction and small end conclusion, "also make each blog is totally different from the last one's" topic, make sure it's long enough that you're not jumugggling 2 random para and making a blog, make long enough interesting teaching story, so at end I'm giving you some title which generated previously so that you won't use the same titles again. here you go (don't use any of them please): 
`;


const SYSTEM_INSTRUCTIONS = `1. Input Type: The input will be a text or PDF document.
1. Output Format: The output should be a blog markdown, which is structured and engaging.
2. Tone: The blog should be written in an engaging, reader-friendly, and insightful tone.
3. Structure: 
   - Create a **title** that reflects the central theme of the content, and title should not start with the name of the book but basis of the blog's theme.

 THINGS TO REMEMBER:  
 -output must be in form of markdown
 -you'll create blog as a story not as a introduction the book
 -blog title !== book title but blog title === blog theme
 -Don't summerise use exact line from the text
   `;

// const CONTENT_DELETION_GAP = 10_000; //10sec
const CONTENT_DELETION_GAP = 1000; //10sec

export {
  BLOG_GENERATION_TIMER,
  BLOG_QUERY,
  CONTENT_DELETION_GAP,
  SYSTEM_INSTRUCTIONS,
  BLOG_QUERY_NO_REPEAT
}