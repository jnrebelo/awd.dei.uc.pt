const express = require("express");
const aposToLexForm = require("apos-to-lex-form");
const natural = require("natural");
const SpellCorrector = require("spelling-corrector");
const SW = require("stopword");
const lexicon = require("../public/assets/lexicon");

const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();

const { SentimentAnalyzer } = require("node-nlp");
const sentiment = new SentimentAnalyzer({ language: "en" });

const cors = require("cors");
const app = express();

app.use(cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// app.get('/get/:anything', function (req, res) {
//   var hw = {};
//   hw.res = "hello words";
//   hw.param = req.params.anything;
//   res.send(hw);
// });

app.get("/", function(req, res) {
  res.send("API listening");
});

app.post("/post", function(req, res) {
  //let store_WordHits = [];

  const content = req.body.content;
  //console.log("CONTENT:____ " + content);

  const cleanedData = _cleanData(content);
  //console.log("CLEANED_DATA:____ " + cleanedData);

  //hits array
  const wordHits = _wordHits(cleanedData);
  //console.log("WORD_HITS:____ " + wordHits);

  //
  const wordNet = _wordNet(cleanedData);
  //console.log("WORD_NET:____ " + wordNet);

  const treatedColours = _treatColorData(wordNet);
  //console.log("TREATEDColours:_ " + '\n' + JSON.stringify(treatedColours) + '\n');

  const treatedEmotions = _treatEmotionData(wordNet);
  console.log(
    "TREATEDEmotions:_ " + "\n" + JSON.stringify(treatedEmotions) + "\n"
  );

  const preparedData = _prepareData(cleanedData);
  const sentimentAn = sentiment
    .getSentiment(preparedData)
    .then(result => {
      let store_GetSentiment = {};
      store_GetSentiment = result;
      store_GetSentiment.words = wordHits;

      store_GetSentiment.colours = treatedColours;
      store_GetSentiment.emotions = treatedEmotions;

      return store_GetSentiment;
    })
    .then(store_GetSentiment => {
      //console.log(store_GetSentiment);
      res.send(JSON.stringify(store_GetSentiment));
    })
    .catch(err => {
      console.error(err.message);
    });

  // sentiment.getSentiment(preparedData)
  //   .then(result => {
  //     console.log(result);
  //     res.send(JSON.stringify(result));
  //   }).catch(err => {
  //     console.error(err.message);
  //     res.send(JSON.stringify({ "error": err.message }));
  //   });
});

/**
 * prepate data
 * @param data
 * @returns {*}
 * @private
 * @depends
 *
 * TODO
 *  - Separate each formart param
 *  - Get more control
 *  - Sen words array tou Front for graphical usage
 */
function _prepareData(data) {
  // Convert contractions to standard lexicon (I’m, you’re) to (I am, you are)
  const lexedContent = aposToLexForm(data);

  // Convert text data to lowercase
  const casedContent = lexedContent.toLowerCase();

  // Remove non-alphabetical and special characters
  const alphaOnlyContent = casedContent.replace(/[^a-zA-Z\s]+/g, "");

  // Tokenize words
  const { WordTokenizer } = natural;
  const tokenizer = new WordTokenizer();
  const tokenizedContent = tokenizer.tokenize(alphaOnlyContent);

  // Correct spelling mistakes
  tokenizedContent.forEach((word, index) => {
    tokenizedContent[index] = spellCorrector.correct(word);
  });

  // Remove stop words -> but, a, or, and what
  const filteredContent = SW.removeStopwords(tokenizedContent);
  //console.log("Filtered words array:____" + filteredContent);

  const arrayToString = filteredContent.toString();
  //console.log("arrayToString:____" + arrayToString);

  return alphaOnlyContent;
  //return arrayToString;
}

/**
 * Word hits Array
 * @param data
 * @returns {*}
 * @private
 * @depends
 *
 */
function _wordHits(data) {
  // Convert contractions to standard lexicon (I’m, you’re) to (I am, you are)
  const lexedContent = aposToLexForm(data);

  // Convert text data to lowercase
  const casedContent = lexedContent.toLowerCase();

  // Remove non-alphabetical and special characters
  const alphaOnlyContent = casedContent.replace(/[^a-zA-Z\s]+/g, "");

  // Tokenize words
  const { WordTokenizer } = natural;
  const tokenizer = new WordTokenizer();
  const tokenizedContent = tokenizer.tokenize(alphaOnlyContent);

  // Correct spelling mistakes
  tokenizedContent.forEach((word, index) => {
    tokenizedContent[index] = spellCorrector.correct(word);
  });

  // Remove stop words -> but, a, or, and what
  const filteredContent = SW.removeStopwords(tokenizedContent);
  //console.log("Filtered words array:____" + filteredContent);

  const arrayToString = filteredContent.toString();
  //console.log("arrayToString:____" + arrayToString);

  return filteredContent;
}

/**
 * clean data
 * @param data
 * @returns {*}
 * @private
 * @depends     _removeTags _removeMisc
 *
 *  TODO
 *  - Review REGEX to remove style tag content
 */
function _cleanData(data) {
  //console.log(data);
  //let cleanTxt = _removeStyleAttr(data);
  let cleanTxt = _removeTags(data);
  cleanTxt = _removeMisc(cleanTxt);

  return cleanTxt;
}

/**
 * Word Net
 * @param data
 * @returns {*}
 * @private
 * @depends     _sortObject
 * @extrated from iccc_server by Sergio Rebelo
 *
 *
 *  TODO
 *  - Review values returned and structure
 *  - Check how they can influence content
 *  - Possibilty to analise by sentende or line break
 *      different values???
 */
function _wordNet(data) {
  //console.log(data);

  //inputText = ["By the pricking of my thumbs,", "Something wicked this way comes.", "Open,", "locks,", "Whoever knocks!"];
  inputText = data;

  let processedText = [];

  //console.info('\n' + `input text = ${inputText}` + '\n');

  const tokenizer = new natural.WordTokenizer();
  const nounInflector = new natural.NounInflector();
  var wordnet = new natural.WordNet();

  const tokens = tokenizer.tokenize(inputText);
  //console.info(`tokenizer text = ${tokens}` + '\n');

  let current = [];
  for (let token of tokens) {
    //JR: Check why nounInflector & PorterStemmer.stem is breaking words
    //token = nounInflector.singularize(token);
    //token = natural.PorterStemmer.stem(token);

    const wn = wordnet.lookup(token, function(results) {
      //TODO: understand if the lemmanisation is well done
      // results.forEach(function (result) {
      //   console.log(token, result.lemma, result.synsetOffset);
      // });

      const k = Object.keys(results)[0];

      if (k !== undefined) {
        //console.log(token, k, results[k].lemma, results[k].synsetOffset);
        token = results[k].lemma;
      }
    });
    current.push(token);
  }

  //console.info(`processed text = ${current}` + '\n');

  let emotions = [];
  let emotionsdescriptive = [];
  let colours = {};

  for (let sentence of current) {
    let currentEmo = 0;
    let currentEmoDescriptive = [];
    for (let wordOfLex of lexicon.emotions) {
      //JR: Direct macth to word in sentence
      if (sentence === wordOfLex.word) {
        currentEmo++;
        currentEmoDescriptive.push(wordOfLex);
      }

      // Disabled because
      // Returns multiple words ex: father => fat, father, the
      // search => sea, sear, search
      // if (sentence.includes(wordOfLex.word)) {
      //   currentEmo++;
      //   currentEmoDescriptive.push(wordOfLex);
      // }
    }
    emotions.push(currentEmo);
    emotionsdescriptive.push(currentEmoDescriptive);

    for (let c of lexicon.colours) {
      if (sentence.includes(c.word)) {
        if (!Object.keys(colours).includes(c.colour) && c.colour !== "None") {
          colours[c.colour] =
            parseInt(c.votes.votes) / parseInt(c.votes.totalcast);
        } else if (Object.keys(colours).includes(c.colour)) {
          colours[c.colour] +=
            parseInt(c.votes.votes) / parseInt(c.votes.totalcast);
        }
      }
    }
  }

  let out = {};
  out.emotions = emotions;
  out.emotionsDescriptive = emotionsdescriptive;
  out.colours = _sortObject(colours);

  //out.content = inputText.map(i => i.toUpperCase());
  //console.info('\n' + `result = ${JSON.stringify(out)}` + '\n');

  return out;
}
const _sortObject = (obj, desc = true) => {
  var sortable = [];

  for (var item in obj) {
    sortable.push([item, obj[item]]);
  }

  sortable.sort(function(a, b) {
    return a[1] - b[1];
  });

  if (desc) {
    sortable.reverse();
  }

  return sortable;
};

function _treatColorData(data) {
  let rawColours = data.colours;
  //console.log("rawColours: " + '\n' + JSON.stringify(rawColours) + '\n');

  let allColors = [];
  const analisedColors = [];
  for (let i = 0; i < rawColours.length; i++) {
    let _key, _value;
    for (let ii = 0; ii < rawColours[i].length; ii++) {
      _key = rawColours[i][0];
      _value = rawColours[i][1];
      _value = Math.round(_value);
    }

    //Change THIS FAST PLS :////////
    //LAZY FAT FUCK
    if (rawColours[i][0] === "undefined") {
    } else {
      allColors.push({
        color: _key,
        hits: _value
      });
    }
  }

  function compare(a, b) {
    if (a.hits < b.hits) {
      return 1;
    }
    if (a.hits > b.hits) {
      return -1;
    }
    return 0;
  }
  allColors.sort(compare);

  let randomNumberOfColors = Math.floor(Math.random() * 5);
  for (let i = 0; i < randomNumberOfColors; i++) {
    _key = allColors[i].color;
    analisedColors.push(_key);
  }

  // console.log("allColors: " + '\n' + JSON.stringify(allColors) + '\n');
  // console.log("analisedColors: " + '\n' + JSON.stringify(analisedColors) + '\n');

  let colours = {};
  colours.allColours = allColors;
  colours.chosenColours = analisedColors;

  return colours;
}

function _treatEmotionData(data) {
  let rawEmotions = data.emotionsDescriptive;
  console.log("rawEmotions: " + "\n" + JSON.stringify(rawEmotions) + "\n");

  let allEmotions = [];
  const analisedEmotions = [];

  for (let i = 0; i < rawEmotions.length; i++) {
    let _obj, emotion;
    for (let ii = 0; ii < rawEmotions[i].length; ii++) {
      _obj = rawEmotions[i][ii];
      emotion = _obj.emotion;
      if (emotion !== undefined) allEmotions.push(emotion);
    }
  }

  let current = {};
  // Transform array to an object emotion + count
  let reducer = function(count, emotion) {
    if (!count[emotion]) {
      count[emotion] = 1;
    } else {
      count[emotion] = count[emotion] + 1;
    }
    return count;
  };
  allEmotions.reduce(reducer, current);

  const currentEmotions = [];
  for (let key in current) {
    if (current.hasOwnProperty(key)) {
      let _key = key;
      let _value = current[key];
      currentEmotions.push({
        emotion: _key,
        hits: _value
      });
    }
  }

  console.log(
    "\n" + "currentEmotions" + "\n" + JSON.stringify(currentEmotions)
  );

  function compare(a, b) {
    if (a.hits < b.hits) {
      return 1;
    }
    if (a.hits > b.hits) {
      return -1;
    }
    return 0;
  }
  currentEmotions.sort(compare);

  let randomNumberOfEmotions = Math.floor(Math.random() * 5);
  for (let i = 0; i < randomNumberOfEmotions; i++) {
    _key = currentEmotions[i].emotion;
    analisedEmotions.push(_key);
  }
  console.log("allEmotions: " + "\n" + JSON.stringify(allEmotions) + "\n");
  console.log(
    "analisedEmotions: " + "\n" + JSON.stringify(analisedEmotions) + "\n"
  );

  let emotions = {};
  emotions.allEmotions = allEmotions;
  emotions.chosenEmotions = analisedEmotions;

  return emotions;
}

const _removeStyleAttr = t => {
  return t.replace(/(<[^>]+) style=".*?"/g, "");
};
const _removeTags = t => {
  return t.replace(/<[^>]*>?/gm, "");
};
const _removeMisc = t => {
  t = t.replace(/(\n)/g, "\n"); //
  t = t.replace(/(\n)/g, " "); //break lines to space
  t = t.replace(/(^\n)|(\n$)|(\v)|(\t)/gm, ""); //tabs, idents, breaks at start and end
  t = t.replace(/(\s\s+)|(^\s)|(\s$)/g, ""); //double whitespaces
  return t;
};

app.listen(9000, function() {
  console.log("API listening on port 9000!");
});

module.exports = app;
