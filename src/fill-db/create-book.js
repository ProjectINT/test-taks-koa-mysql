// @flow
const LoremIpsum = require('lorem-ipsum').LoremIpsum;
const { booksCount } = require('../../config');

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4,
  },
  wordsPerSentence: {
    max: 16,
    min: 4,
  },
});

module.exports = (currentCount: number): Book => {
  function getNewDate ():number {
    return Date.now() - 6*60*60*currentCount;
  };
  return console.log('date:', getNewDate()) || ({
    bookId: booksCount - currentCount,
    title: lorem.generateWords(3),
    date: getNewDate(),
    author: lorem.generateWords(2),
    description: lorem.generateWords(10),
    image: '/image-url.jpg',
  })
};
