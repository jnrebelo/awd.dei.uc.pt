$("#btn").click(function fetchWiki() {
  $.ajax({
    url: "https://en.wikipedia.org/w/api.php",
    data: {
      format: "json",
      action: "parse",
      summary: "",
      page: $("#text1").val(),
      prop: "text|sections|displaytitle|wikitext|properties"
      //prop: "text|images|sections"
    },
    dataType: "jsonp",

    success: function(data) {
      headerSizeHandler();

      setTimeout(function() {
        handleJSON(data);
      }, 500);
    },
    error: function(xhr, error) {
      console.log(xhr);
      console.log("ARE U EFFIN DRUNK" + error);
    }
  });
});

function headerSizeHandler() {
  let getHeader = $(".header_interface ");
  getHeader.addClass("heightShow");

  setTimeout(function() {
    let heightHeader = $(".header_interface").height();
    $("body").css({ paddingTop: heightHeader + 10 + "px" });
  }, 400);
}

$(document).ready(function() {
  $("#btn").attr("disabled", true);
  $("#text1").keyup(function() {
    if ($(this).val().length != 0) $("#btn").attr("disabled", false);
    else $("#btn").attr("disabled", true);
  });
});
$("#btn").on("click", function() {
  $("#btn_analize").attr("disabled", false);
});

$("#b_info").on("click", function() {
  $(".info_section").toggleClass("heightShow");
  $(this).toggleClass("btn--active");
});
$("#b_gallery").on("click", function() {
  $(".gallery_section").toggleClass("widthShow");
  $(this).toggleClass("btn--active");
});

$("#show_controls").on("click", function() {
  $(".controls").toggleClass("controls--visible");
  $(this).toggleClass("btn--active");
});

let rawContent, title, content, images, sections, pageid, properties;
let rawData = {};
let resultsDiv = $(".results");

let disambiguation;
disambiguation = false;

function handleJSON(data) {
  rawData = data;
  //console.log(rawData);

  title = data.parse.displaytitle;
  //console.log(title);

  content = data.parse.text["*"];
  //console.log(content);

  //images = data.parse.images;
  // console.log(images);

  sections = data.parse.sections;
  console.log(sections);

  // let sectionNames = [];
  // for (let i = 0; i < sections.length; i++) {
  //   let _key, _value;
  //   _key = sections[i].line;
  //   sectionNames.push(_key);
  // }
  // console.log(sectionNames);

  pageid = data.parse.pageid;
  console.log("page ID is: " + pageid);

  properties = data.parse.properties[0]["*"];
  console.log(properties);

  let ti = $("<h1></h1>").html(title);
  $("#controls-result .title").html(ti);

  let si = $("<h2></h2>").html(properties);
  $("#controls-result .summary").html(si);

  //let i = $("<div></div>").html(content);
  resultsDiv.html(content);
  removeUnnecessary();

  // var blockQuote = document.getElementsByTagName("blockquote");
  // console.log(blockQuote.length)
  // var searchText = "SearchingText";
  // var found;

  // for (var i = 0; i < blockQuote.length; i++) {

  //   console.log(blockQuote[i].innerText)
  // }
}

function removeUnnecessary() {
  //console.log("Removing Unnecessary....");

  // remove edit tool
  resultsDiv.find(".mw-editsection").remove();

  // remove non essencials
  resultsDiv
    .find(".reference, .vertical-navbox, .mbox-small, .navbox, .mw-empty-elt")
    .remove();

  // remove any references
  resultsDiv.find("sup").remove();

  // remove cite error
  resultsDiv.find(".mw-ext-cite-error").remove();

  // remove table of contents
  resultsDiv.find(".toc").remove();

  // remove table of images
  resultsDiv.find("img").remove();

  // remove audios
  resultsDiv.find(".sisterproject").remove();

  // remove style = <style> </style>
  resultsDiv.find("style").remove();

  // links = <link> </link>
  resultsDiv.find("link").remove();

  // remove tag attributes
  $(".results *").removeAttr("class");
  $(".results *").removeAttr("role");
  $(".results *").removeAttr("style");
  //
  //console.log("Removed....");

  //CHECK IF IS DISAMBIG PAGE
  $(".results").each(function() {
    if ($("#disambigbox").length) {
      disambiguation = true;
      console.log("Disambiguation is: " + disambiguation);
    } else {
      disambiguation = false;
      console.log("Disambiguation is: " + disambiguation);
    }
  });

  $(".results a").attr("onclick", `desambig()`);
  $(".results a").attr("href", `javascript:;`);
}

const submitReview = e => {
  e.preventDefault();

  const content = document.getElementById("results").innerText;
  let data = {};
  data.content = content;

  const options = {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers: new Headers({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      'Accept': 'application/json',
      "Access-Control-Allow-Methods": "GET, POST, PUT"
    }),
    body: JSON.stringify(data, null, 2)
  };

  try {
    const url = "http://awd4.dei.uc.pt/post";

    //const f = fetch("http://localhost:9000/post", options)
    const f = fetch(url, options)
      .then(function(res) {
        return res.json();
      })
      .then(function(res) {
        //console.log(title);
        console.log(res);

        if (disambiguation === false) {
          getJsonStyles(res);
        }
        if (disambiguation === true) {
          disambiguationStyle(res);
        }

        //
      })
      .catch(function(err) {
        emojiSection.innerHTML = "Error processing request: " + err.message;
        console.error(err.message);
      });
  } catch (err) {
    console.error(err);
  }
};
$("#btn_analize").click(submitReview);
//document.getElementById('btn_analize').addEventListener('click', submitReview);
$("#btn_analize").on("click", function() {
  $(this).text("Analizing");
  $(this).toggleClass("btn--active");
});

function desambig() {
  var title = jQuery(".results a").attr("title");
  console.log(title);

  $("html").removeAttr("style");
  $("body").removeAttr("style");
  $("#controls-result").removeAttr("style");

  $("#controls-result").addClass("viewport");
  $(".results").addClass("scene3D-container");
  $(".results > div").addClass("scene3D");

  $.ajax({
    url: "https://en.wikipedia.org/w/api.php",
    data: {
      format: "json",
      action: "parse",
      summary: "",
      page: title,
      prop: "text|sections|displaytitle|wikitext|properties"
    },
    dataType: "jsonp",

    success: function(data) {
      handleJSON(data);
    },
    error: function(xhr, error) {
      console.log(xhr);
      console.log("ARE U EFFIN DRUNK" + error);
    }
  });

  setTimeout(function() {
    $("#btn_analize").trigger("click");
  }, 3000);
}

function getJsonStyles(res) {
  /** HELPERS */
  const scale = (num, in_min, in_max, out_min, out_max) => {
    return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  };

  /** Values from  Wikipidia API */
  let sectionNames = sections;
  // for (let i = 0; i < sectionNames.length; i++) {
  //   const element = sectionNames[i].line;
  //   console.log(element);
  // }

  /** Values from  Analisys */
  let score = res.score;
  let numWords = res.numWords;
  let numHits = res.numHits;
  let vote = res.vote;
  let average = res.average;
  let wordHits = res.words;

  //colors
  let allColors = res.colours.allColours;
  let chosenColours = res.colours.chosenColours;

  //emotions
  let allEmotions = res.emotions.allEmotions;
  let chosenEmotions = res.emotions.chosenEmotions;

  /**
   * Eleven colors:
   * white, black, red, green, yellow, blue,
   * brown, pink, purple, orange, grey
   *
   *  DONE
   *  - Get all color from analisys & ordered based on rating
   *  - Select random range 1 to 5 top rated colors
   *  - Randomly choose one color on that range
   *
   *  TODO
   *  - Prevent array from choosing no color => random n = 0
   *  - Use probability to choose color
   *
   */
  function _getBgColor() {
    //const availableColors = ["white", "black", "red", "green", "yellow", "blue", "brown", "pink", "purple", "orange", "grey"];

    let randomNum = Math.floor(Math.random() * chosenColours.length);
    currentColor = chosenColours[randomNum];
    console.log("Selected color is: " + currentColor);

    document.body.style.background = currentColor;
  }

  /**
   * Six params: @param @min @max @step
   * size2 => 1 - 40  0.5;
   * wght2 => 300 - 1000  1;
   * mono2 => 0 - 1  0.01;
   * casl2 => 0 - 1  0.01;
   * slnt2 => -15 - 0  0.1;
   * ital2 => disabled for review;
   *
   *  TODO
   *  - Review how to manipulate params
   *  - Set params values on middle/start/end ranges
   *  - Weight not afected ^^^
   *  - Review way to add styles
   *     .style.cssText => overrides previous
   *
   */
  function _setMainFontSize() {
    let randomNum = Math.floor(Math.random() * 30);
    let genFontSize = scale(
      numHits,
      randomNum,
      numWords + numHits,
      randomNum,
      40
    );

    document.getElementById("controls-result").style.fontSize =
      genFontSize + "pt";
    console.log("Generated fontSize: " + genFontSize + "pt");
  }

  /**
   * Six params: @param @min @max @step
   * size2 => 1 - 40  0.5;
   *
   *
   * Check against a value or emotion
   * If match load font
   * load params menu
   * apply font
   * "BandeinsSans","Recursive", "BandeinsStrange", "Hela",
   *
   */
  function _chooseFont() {
    let styles = {};

    const availableFonts = [
      "Movement",
      "BandeinsSans",
      "Recursive",
      "BandeinsStrange",
      "Hela"
    ];
    let randomNum = Math.floor(Math.random() * availableFonts.length);
    let fontSelected = availableFonts[randomNum];

    styles["font-family"] = fontSelected;

    var addAnimTo = document.getElementById("controls-result");

    let randomNum_fonts = Math.floor(Math.random() * 7);
    let wght2 = numWords + numHits * randomNum;
    let mono2 = average * randomNum_fonts;
    let casl2 = average * randomNum_fonts;
    let slnt2 = average * randomNum_fonts + casl2;
    let ital2 = average * randomNum_fonts + slnt2;

    if (fontSelected === "Hela") {
      styles["font-variation-settings"] = `'wght' ${wght2}`;

      // addAnimTo.classList.add("class", `hela_anim`);

      $(".controls ul").append(
        '<li><input type="checkbox" id="btn_addAnim"><label>Add Animation</label></li>'
      );
    }

    if (fontSelected === "Movement") {
      styles["font-variation-settings"] = `'SPAC' ${wght2}, 'wght' ${wght2}`;

      //addAnimTo.classList.add("class", `movement_anim`);

      $(".controls ul").append(
        '<li><input type="checkbox" id="btn_addAnim"><label>Add Animation</label></li>'
      );
    }

    if (fontSelected === "BandeinsStrange") {
      styles["font-variation-settings"] = `'wght' ${wght2}, 'wdth' ${casl2}`;

      // addAnimTo.classList.add("class", `bandeinsS_anim`);

      $(".controls ul").append(
        '<li><input type="checkbox" id="btn_addAnim"><label>Add Animation</label></li>'
      );
    }

    if (fontSelected === "Recursive") {
      styles[
        "font-variation-settings"
      ] = `'wght' ${wght2}, 'CASL' ${casl2}, 'slnt' ${slnt2}, 'MONO' ${mono2}, 'ital' ${ital2}`;

      $(".controls ul").append(
        '<li><input type="checkbox" id="btn_addAnim"><label>Add Animation</label></li>'
      );
    }

    console.log(styles);
    var elementStyle = document.getElementById("controls-result").style;
    for (var styleName in styles) {
      elementStyle[styleName] = styles[styleName];
    }
  }

  /**
   * Page Structure
   *
   * 1º level - Define if scroll Horizontal or Vertical
   * 2º level - Define content display (blocks tags breaks)
   * 3º level - Style based on analisys (all tags or only a few)
   *
   *  TODO
   *  - Everything
   *
   */
  function _setPageStructure() {
    // TODO
    // If undefined  rerun random
    let randomNum = Math.floor(Math.random() * chosenEmotions.length);
    let emotionSelected = chosenEmotions[randomNum];
    console.log("Selected Emotion is: " + emotionSelected);

    var availableFuncs = [
      "_styleWordHits",
      "_contentRepetition",
      "_textDirection",
      "_overlapedSectionClick",
      "_randomStylesBrutal",
      "_4waySplitFont"
    ];
    var randomNumFunc = Math.floor(Math.random() * availableFuncs.length);

    if (emotionSelected === "trust") {
      console.log("Selected Emotion is: " + emotionSelected);
      _chooseFont();

      if (randomNumFunc === 0) {
        _fullBodyTextWordHits();
        _styleWordHits();
      }
      if (randomNumFunc === 1) {
        _contentRepetition();
        _textDirection();
      }
      if (randomNumFunc === 2) {
        _overlapedSectionClick();
      }
      if (randomNumFunc === 3) {
        _splitContentByH2();
        _randomStylesBrutal();
      }
      if (randomNumFunc === 4) {
        _4waySplitFont();

        _randomStylesBrutal();
      }
      if (randomNumFunc === 5) {
        _contentRepetition();
        _textDirection();

        _fullBodyTextWordHits();
        _styleWordHits();
      }
    }

    if (emotionSelected === "anticipation") {
      console.log("Selected Emotion is: " + emotionSelected);
      _chooseFont();

      _contentRepetition();
      _textDirection();
    }

    if (emotionSelected === "joy") {
      console.log("Selected Emotion is: " + emotionSelected);
      _chooseFont();

      _contentRepetition();
      _fullBodyTextWordHits();
    }

    if (emotionSelected === "anger") {
      console.log("Selected Emotion is: " + emotionSelected);
      _chooseFont();

      _fullBodyTextWordHits();
      _styleWordHits();

      _contentRepetition();
      _textDirection();

      // _addBlotterTag();
      // _blotterDistortion();

      _splitContentByH2();

      // _perspectiveCards()

      _randomStylesBrutal();

      _4waySplitFont();
    }

    if (emotionSelected === "fear") {
      console.log("Selected Emotion is: " + emotionSelected);
      _chooseFont();

      _4waySplitFont();
      _randomStylesBrutal();
    }
    if (emotionSelected === "sadness") {
      console.log("Selected Emotion is: " + emotionSelected);
      _chooseFont();

      _addBlotterTag();
      _blotterDistortion();

      _splitContentByH2();

      _overlapedSectionClick();
    }
    if (emotionSelected === "disgust") {
      console.log("Selected Emotion is: " + emotionSelected);
      _chooseFont();

      _fullBodyTextWordHits();
      _styleWordHits();

      _contentRepetition();
      _textDirection();
    }
  }

  /**
   * _styleWordHits
   *
   *  TODO
   *  - Make class added (.match) variable
   *     to iterate multiple styles
   *
   */
  //
  function _styleWordHits() {
    // get text from html
    let textResult = document.getElementById("results").innerHTML;

    // split to array
    let textResultWords = textResult.split(" ");

    //test for match => wrap in span
    // `<span style="${currentColor}">`
    let styleWords = textResultWords.map(function(word) {
      if (wordHits.indexOf(word) !== -1) {
        return `<span class="match">` + word + "</span>";
      } else {
        return word;
      }
    });

    //put content back together with spans
    document.getElementById("results").innerHTML = styleWords.join(" ");
  }

  //
  function _fullBodyTextWordHits() {
    // get text from html
    let textResult = document.getElementById("controls-result").innerText;

    // split to array
    let textResultWords = textResult.split(" ");

    //test for match => wrap in span
    let styleWords = textResultWords.map(function(word) {
      return word;
    });

    //put content back together with spans
    document.getElementById("results").innerHTML = styleWords.join(" ");

    var resultsClass = document.getElementsByClassName("results")[0];

    /** reset random number REVIEW */
    randomNum = Math.floor(Math.random() * score);
    let bodyWidth =
      Math.abs(scale(numHits, randomNum, numWords + numHits, randomNum, 100)) +
      "%";
    console.log("bodyWidth is: " + bodyWidth);
    resultsClass.style.width = bodyWidth;

    /** reset random number REVIEW */
    randomNum = Math.floor(Math.random() * score);
    let marginLeft =
      Math.abs(scale(numHits, randomNum, numWords + numHits, randomNum, 100)) +
      "%";
    console.log("marginLeft is: " + marginLeft);
    resultsClass.style.marginLeft = marginLeft;
  }

  //Review how it can work better
  function _splitContentByH2() {
    $("#results h2").each(function() {
      $(this)
        .nextUntil(this.tagName)
        .addBack()
        .wrapAll("<section />");
    });

    let randomNum = Math.floor(Math.random() * 2);
    const availableSates = ["horizontal", "vertical"];
    //let stateSelected = availableSates[randomNum];
    let stateSelected = "vertical";

    if (stateSelected === "horizontal") {
      console.log("The scroll is: " + stateSelected);

      var createdSections = $("#results section");
      for (let i = 0; i < createdSections.length; i++) {
        section = createdSections[i];
        section.setAttribute("class", `sections section${i}`);

        randomNum = Math.floor(Math.random() * score);
        let bodyWidth =
          Math.abs(
            scale(numHits, randomNum, numWords + numHits, randomNum, 100)
          ) + "%";
        // console.log("bodyWidth is: " + bodyWidth);
        //section.style.width = bodyWidth;
        section.style.width = "400px";
        section.style.margin = bodyWidth;
        section.style.flex = "0 0 500px";

        let styles = {};

        let borderStyles = [
          "dotted",
          "solid",
          "dashed",
          "double",
          "groove",
          "inset",
          "outset",
          "ridge",
          "solid"
        ];
        let item =
          borderStyles[Math.floor(Math.random() * borderStyles.length)];
        let randomColor = Math.floor(Math.random() * 16777215).toString(16);
        let size = Math.abs(score);
        styles["border"] = `${size}px ${item} #${randomColor}`;

        let randomColor1 = Math.floor(Math.random() * 16777215).toString(16);
        styles["color"] = `#${randomColor1}`;

        let randomColor2 = Math.floor(Math.random() * 16777215).toString(16);
        styles["background-color"] = `#${randomColor2}`;

        let paddingSize = Math.floor(Math.random() * Math.abs(score));
        styles["padding"] = `${paddingSize}%`;

        let marginSize = Math.abs(score);
        styles["margin"] = `${marginSize}%`;

        console.log(styles);

        var sectionClass = $(`.section${i}`);
        sectionClass.css(styles);

        for (var styleName in styles) {
          sectionClass[styleName] = styles[styleName];
        }
      }
      $(".results div").css("display", "flex");
    }

    if (stateSelected === "vertical") {
      console.log("The scroll is: " + stateSelected);
      var createdSections = $("#results section");

      for (let i = 0; i < createdSections.length; i++) {
        section = createdSections[i];
        section.setAttribute("class", `sections section${i}`);

        let styles = {};

        let borderStyles = [
          "dotted",
          "solid",
          "dashed",
          "double",
          "groove",
          "inset",
          "outset",
          "ridge",
          "solid"
        ];
        let item =
          borderStyles[Math.floor(Math.random() * borderStyles.length)];
        let randomColor = Math.floor(Math.random() * 16777215).toString(16);
        let size = Math.abs(score);
        styles["border"] = `${size}px ${item} #${randomColor}`;

        let randomColor1 = Math.floor(Math.random() * 16777215).toString(16);
        styles["color"] = `#${randomColor1}`;

        let randomColor2 = Math.floor(Math.random() * 16777215).toString(16);
        styles["background-color"] = `#${randomColor2}`;

        let paddingSize = Math.floor(Math.random() * Math.abs(score));
        styles["padding"] = `${paddingSize}%`;

        let marginSize = Math.abs(score);
        styles["margin"] = `${marginSize}%`;

        console.log(styles);

        var sectionClass = $(`.section${i}`);
        sectionClass.css(styles);

        for (var styleName in styles) {
          sectionClass[styleName] = styles[styleName];
        }
      }
    }
  }

  //Done
  function _textDirection() {
    let styles = {};

    const availableWrittingModes = [
      "horizontal-tb",
      "vertical-lr",
      "vertical-rl"
    ];
    var writtingMode =
      availableWrittingModes[
        Math.floor(Math.random() * availableWrittingModes.length)
      ];

    const availableDirections = ["ltr", "rtl"];
    var direction =
      availableDirections[
        Math.floor(Math.random() * availableDirections.length)
      ];

    let textOrientation;
    if (writtingMode === "vertical-rl" || writtingMode === "vertical-lr") {
      textOrientation = "upright";
    }

    styles["writing-mode"] = writtingMode;
    styles["text-orientation"] = textOrientation;
    styles["direction"] = direction;

    console.log(styles);
    var elementStyle = document.getElementById("controls-result").style;
    for (var styleName in styles) {
      elementStyle[styleName] = styles[styleName];
    }
  }

  function _overlapedSectionClick() {
    $("#results h2").each(function() {
      $(this)
        .nextUntil(this.tagName)
        .addBack()
        .wrapAll("<section />");
    });

    $("#results section").each(function() {
      $(this).wrapInner('<div id="inner" class="inner"></div>');
      $(this).append('<div id="drag" class="dragger">X</div>');
    });

    var createdSections = $("#results section");

    for (let i = 0; i < createdSections.length; i++) {
      section = createdSections[i];
      section.setAttribute("id", `${i}`);
      section.setAttribute("class", `sections section${i} sticky draggable`);

      let styles = {};
      let borderStyles,
        item,
        randomColor,
        size,
        randomColor1,
        randomColor2,
        paddingSize,
        marginSize,
        topPosition,
        leftPosition,
        width,
        sectionClass;

      borderStyles = [
        "dotted",
        "solid",
        "dashed",
        "double",
        "groove",
        "inset",
        "outset",
        "ridge",
        "solid"
      ];
      item = borderStyles[Math.floor(Math.random() * borderStyles.length)];
      randomColor = Math.floor(Math.random() * 16777215).toString(16);
      size = Math.abs(score);
      styles["border"] = `${size}px ${item} #${randomColor}`;

      randomColor1 = Math.floor(Math.random() * 16777215).toString(16);
      styles["color"] = `#${randomColor1}`;

      randomColor2 = Math.floor(Math.random() * 16777215).toString(16);
      styles["background-color"] = `#${randomColor2}`;

      paddingSize = Math.floor(Math.random() * Math.abs(score));
      styles["padding"] = `${paddingSize}%`;

      marginSize = Math.abs(score);
      styles["margin"] = `${marginSize}%`;

      topPosition = Math.floor(Math.random() * 50) - marginSize;
      styles["top"] = `${topPosition}%`;

      leftPosition = Math.floor(Math.random() * 50) - marginSize;
      styles["left"] = `${leftPosition}%`;

      width = Math.floor(Math.random() * 80);
      styles["width"] = `${width}%`;

      //console.log(styles);

      sectionClass = $(`.section${i}`);
      sectionClass.css(styles);

      for (var styleName in styles) {
        sectionClass[styleName] = styles[styleName];
      }
    }

    const sections = $("#results .sections");

    for (let i = 0; i < sections.length; i++) {
      sections[i].id = i;
      $(`#${i} .inner`).click(function() {
        showSections(i);
      });
    }

    function showSections(i) {
      const current = document.getElementById(i);
      const next = document.getElementById(i + 1);
      const body = document.getElementById("results");

      if (i === 0) {
        body.classList.remove("go-back");
        body.classList.add("go-front");
      }
      if (i === sections.length - 1 && body.classList.contains("go-front")) {
        body.classList.remove("go-front");
        body.classList.add("go-back");
      }
      if (body.classList.contains("go-front")) {
        next.classList.remove("hide");
      } else {
        current.classList.add("hide");
      }
    }

    var x,
      y,
      target = null;

    document.addEventListener("mousedown", function(e) {
      var clickedDragger = false;
      for (var i = 0; e.path[i] !== document.body; i++) {
        if (e.path[i].classList.contains("dragger")) {
          clickedDragger = true;
        } else if (
          clickedDragger &&
          e.path[i].classList.contains("draggable")
        ) {
          target = e.path[i];
          target.classList.add("dragging");
          x = e.clientX - target.style.left.slice(0, -2);
          y = e.clientY - target.style.top.slice(0, -2);
          return;
        }
      }
    });

    document.addEventListener("mouseup", function() {
      if (target !== null) target.classList.remove("dragging");
      target = null;
    });

    document.addEventListener("mousemove", function(e) {
      if (target === null) return;
      target.style.left = e.clientX - x + "px";
      target.style.top = e.clientY - y + "px";
    });
  }

  //finish
  function _contentRepetition() {
    // COPY BARE TEXT NO TAGS; BREAKS;.....
    // get text from html
    let textResult = document.getElementById("controls-result").innerText;
    // split to array
    let textResultWords = textResult.split(" ");
    //test for match => wrap in span
    let styleWords = textResultWords.map(function(word) {
      return word;
    });

    for (let i = 0; i < 3; i++) {
      let textCopy = document.createElement("div");

      textCopy.setAttribute("id", `results_copy${i}`);
      document.getElementById("controls-result").appendChild(textCopy);
      textCopy.innerHTML = styleWords.join(" ");

      /** reset random number REVIEW */
      randomNum = Math.floor(Math.random() * score * i);
      let bodyWidth =
        Math.abs(
          scale(
            numHits,
            randomNum * i,
            numWords + numHits * i,
            randomNum * i,
            100
          )
        ) + "%";
      textCopy.style.width = bodyWidth;
    }

    for (let i = 0; i < 3; i++) {
      let copied = document.getElementById(`results_copy${i}`);

      if (i === 0) {
        copied.style.position = "absolute";
        copied.style.left = 0 + "%";
        copied.style.top = 0 + "%";
      }
      if (i === 1) {
        copied.style.position = "absolute";
        copied.style.left = 50 + "%";
        copied.style.top = 0 + "%";
      }
      if (i === 2) {
        copied.style.position = "absolute";
        copied.style.left = 80 + "%";
        copied.style.top = 100 + "%";
      }
    }

    //var resultsClass = document.getElementsByClassName("results")[0];
  }

  function _addBlotterTag() {
    //console.log(wordHits);

    // get text from html
    let textResult = document.getElementById("results").innerHTML;

    // split to array
    let textResultWords = textResult.split(" ");

    //test for match => wrap in span
    // `<span style="${currentColor}">`
    let styleWords = textResultWords.map(function(word) {
      if (wordHits.indexOf(word) !== -1) {
        return `<span data-blotter>` + word + "</span>";
      } else {
        return word;
      }
    });

    //put content back together with spans
    document.getElementById("results").innerHTML = styleWords.join(" ");
  }

  function _blotterDistortion() {
    const MathUtils = {
      lineEq: (y2, y1, x2, x1, currentVal) => {
        // y = mx + b
        var m = (y2 - y1) / (x2 - x1),
          b = y1 - m * x1;
        return m * currentVal + b;
      },
      lerp: (a, b, n) => (1 - n) * a + n * b,
      distance: (x1, x2, y1, y2) => {
        var a = x1 - x2;
        var b = y1 - y2;
        return Math.hypot(a, b);
      }
    };
    const body = document.body;
    const docEl = document.documentElement;

    // Create the blotter material.
    const material = new Blotter.LiquidDistortMaterial();
    material.uniforms.uSpeed.value = 1;
    material.uniforms.uVolatility.value = 0;
    material.uniforms.uSeed.value = 0.1;
    // Create the Blotter instance.
    const blotter = new Blotter(material);
    var textvh = $(window).innerHeight() * 0.0533; // 5.33 vh
    // Initialize the Blotter Text on all HTML elements with data-blotter.
    const blotterElems = [...document.querySelectorAll("[data-blotter]")];
    blotterElems.forEach(el => {
      const text = new Blotter.Text(el.innerHTML, {
        size: textvh
      });
      blotter.addText(text);
      // Now delete the html content.
      el.innerHTML = "";
      // The created canvas.
      const scope = blotter.forText(text);
      // Append it to the main element.
      scope.appendTo(el);
    });

    let winsize;
    const calcWinsize = () =>
      (winsize = { width: window.innerWidth, height: window.innerHeight });
    calcWinsize();
    window.addEventListener("resize", calcWinsize);

    const getMousePos = ev => {
      let posx = 0;
      let posy = 0;
      if (!ev) ev = window.event;
      if (ev.pageX || ev.pageY) {
        posx = ev.pageX;
        posy = ev.pageY;
      } else if (ev.clientX || ev.clientY) {
        posx = ev.clientX + body.scrollLeft + docEl.scrollLeft;
        posy = ev.clientY + body.scrollTop + docEl.scrollTop;
      }
      return { x: posx, y: posy };
    };

    let mousePos = { x: winsize.width / 2, y: winsize.height / 2 };
    window.addEventListener("mousemove", ev => (mousePos = getMousePos(ev)));

    let lastMousePosition = { x: winsize.width / 2, y: winsize.height / 2 };
    let volatility = 0;

    const render = () => {
      const docScrolls = {
        left: body.scrollLeft + docEl.scrollLeft,
        top: body.scrollTop + docEl.scrollTop
      };
      const relmousepos = {
        x: mousePos.x - docScrolls.left,
        y: mousePos.y - docScrolls.top
      };
      const mouseDistance = MathUtils.distance(
        lastMousePosition.x,
        relmousepos.x,
        lastMousePosition.y,
        relmousepos.y
      );

      volatility = MathUtils.lerp(
        volatility,
        Math.min(MathUtils.lineEq(0.9, 0, 100, 0, mouseDistance), 0.9),
        0.05
      );
      material.uniforms.uVolatility.value = volatility;

      lastMousePosition = { x: relmousepos.x, y: relmousepos.y };
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  function _4waySplitFont() {
    let textResult = document.getElementById("controls-result").innerText;
    let textResultWords = textResult.split(" ");
    let styleWords = textResultWords.map(function(word) {
      return word;
    });

    for (let i = 0; i < 3; i++) {
      let textCopy = document.createElement("div");
      textCopy.setAttribute("id", `results_copy${i}`);
      textCopy.setAttribute("class", `fourwaysplitfix`);
      document.getElementById("controls-result").appendChild(textCopy);
      textCopy.innerHTML = styleWords.join(" ");

      const availableFonts = [
        "Movement",
        "BandeinsSans",
        "Recursive",
        "BandeinsStrange",
        "Hela"
      ];
      let randomNum = Math.floor(Math.random() * availableFonts.length);
      let fontSelected = availableFonts[randomNum];

      document.getElementById(
        `results_copy${i}`
      ).style.fontFamily = fontSelected;
    }

    $(document).on("mousemove", function(e) {
      var _pageX = e.pageX,
        _pageY = e.pageY,
        _clipX = $(window).width() - _pageX,
        _clipY = $(window).height() - _pageY;

      $("#results_copy0").css({
        "-webkit-clip-path": "inset(0 " + _clipX + "px " + _clipY + "px 0)",
        "clip-path": "inset(0 " + _clipX + "px " + _clipY + "px 0)"
      });
      $("#results_copy1").css({
        "-webkit-clip-path": "inset(0 0 " + _clipY + "px " + _pageX + "px)",
        "clip-path": "inset(0 0 " + _clipY + "px " + _pageX + "px)"
      });
      $("#results_copy2").css({
        "-webkit-clip-path": "inset(" + _pageY + "px 0 0 " + _pageX + "px)",
        "clip-path": "inset(" + _pageY + "px 0 0 " + _pageX + "px)"
      });
      $("#results").css({
        "-webkit-clip-path": "inset(" + _pageY + "px " + _clipX + "px 0 0)",
        "clip-path": "inset(" + _pageY + "px " + _clipX + "px 0 0)"
      });
    });
  }

  function _randomStylesBrutal() {
    // margin:
    // height:
    // background-color: lightpink;
    // color: black;
    // border: 8px dotted red;

    //
    let styles = {};

    let borderStyles = [
      "dotted",
      "solid",
      "dashed",
      "double",
      "groove",
      "inset",
      "outset",
      "ridge",
      "solid"
    ];
    let item = borderStyles[Math.floor(Math.random() * borderStyles.length)];
    let randomColor = Math.floor(Math.random() * 16777215).toString(16);
    let size = Math.abs(score);
    styles["border"] = `${size}px ${item} #${randomColor}`;

    let randomColor1 = Math.floor(Math.random() * 16777215).toString(16);
    styles["color"] = `#${randomColor1}`;

    let randomColor2 = Math.floor(Math.random() * 16777215).toString(16);
    styles["background-color"] = `#${randomColor2}`;

    console.log(styles);

    var elementStyle = document.getElementById("controls-result").style;
    for (var styleName in styles) {
      elementStyle[styleName] = styles[styleName];
    }
  }

  function _perspectiveCards() {
    const perspectiveOrigin = {
      x: parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--scenePerspectiveOriginX"
        )
      ),
      y: parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--scenePerspectiveOriginY"
        )
      ),
      maxGap: 10
    };

    window.addEventListener("scroll", moveCamera);
    window.addEventListener("mousemove", moveCameraAngle);
    setSceneHeight();

    function moveCameraAngle(event) {
      const xGap =
        (((event.clientX - window.innerWidth / 2) * 100) /
          (window.innerWidth / 2)) *
        -1;

      const yGap =
        (((event.clientY - window.innerHeight / 2) * 100) /
          (window.innerHeight / 2)) *
        -1;

      const newPerspectiveOriginX =
        perspectiveOrigin.x + (xGap * perspectiveOrigin.maxGap) / 100;
      const newPerspectiveOriginY =
        perspectiveOrigin.y + (yGap * perspectiveOrigin.maxGap) / 100;

      document.documentElement.style.setProperty(
        "--scenePerspectiveOriginX",
        newPerspectiveOriginX
      );
      document.documentElement.style.setProperty(
        "--scenePerspectiveOriginY",
        newPerspectiveOriginY
      );
    }

    function moveCamera() {
      document.documentElement.style.setProperty(
        "--cameraZ",
        window.pageYOffset
      );
    }

    function setSceneHeight() {
      const numberOfItems = $(".sections").length; // Or number of items you have in `.scene3D`
      const itemZ = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--itemZ")
      );
      const scenePerspective = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--scenePerspective"
        )
      );
      const cameraSpeed = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--cameraSpeed"
        )
      );

      const height =
        window.innerHeight +
        scenePerspective * cameraSpeed +
        itemZ * cameraSpeed * numberOfItems;

      // Update --viewportHeight value
      document.documentElement.style.setProperty("--viewportHeight", height);
    }

    $("#controls-result").addClass("viewport");
    $(".results").addClass("scene3D-container");
    $(".results > div").addClass("scene3D");

    var sections = $(`.scene3D .sections`).length;

    for (let i = 0; i < sections; i++) {
      let styles = {};

      var xpos = Math.floor(Math.random() * 50) - 50;
      var ypos = Math.floor(Math.random() * 50) - 50;
      styles[
        "transform"
      ] = `transform: translate3D(${xpos}%, ${ypos}%, calc(${xpos} * ${ypos} * ${i} * -1px))`;
      console.log(styles);

      var sectionClass = $(`.section${i}`);
      //sectionClass.css(styles)

      for (var styleName in styles) {
        sectionClass[styleName] = styles[styleName];
      }
    }
  }

  _setMainFontSize();
  _setPageStructure();
  _getBgColor();

  /**
   * Assign all css Variables
   *
   * let h2 = document.getElementsByTagName("h2");
   * let p = document.getElementsByTagName("p");
   *
   * let stored_css = {};
   * document.body.style.cssText = { `${stored_css.body}` }
   * document.h2.style.cssText = { `${stored_css.h2}` }
   * document.p.style.cssText = { `${stored_css.p}` }
   */
}

function disambiguationStyle(res) {
  const scale = (num, in_min, in_max, out_min, out_max) => {
    return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  };

  let score = res.score;
  let numWords = res.numWords;
  let numHits = res.numHits;
  let average = res.average;
  let chosenColours = res.colours.chosenColours;

  function _getBgColor() {
    //const availableColors = ["white", "black", "red", "green", "yellow", "blue", "brown", "pink", "purple", "orange", "grey"];

    let randomNum = Math.floor(Math.random() * chosenColours.length);
    currentColor = chosenColours[randomNum];
    console.log("Selected color is: " + currentColor);

    document.body.style.background = currentColor;
  }
  function _setMainFontSize() {
    let randomNum = Math.floor(Math.random() * 30);
    let genFontSize = scale(
      numHits,
      randomNum,
      numWords + numHits,
      randomNum,
      40
    );

    document.getElementById("controls-result").style.fontSize =
      genFontSize + "pt";
    console.log("Generated fontSize: " + genFontSize + "pt");
  }
  function _chooseFont() {
    let styles = {};

    // const availableFonts = ["Movement", "BandeinsSans", "Recursive", "BandeinsStrange", "Hela"]
    const availableFonts = ["Recursive"];
    let randomNum = Math.floor(Math.random() * availableFonts.length);
    let fontSelected = availableFonts[randomNum];

    styles["font-family"] = fontSelected;

    var addAnimTo = document.getElementById("controls-result");

    let randomNum_fonts = Math.floor(Math.random() * 7);
    let wght2 = numWords + numHits * randomNum;
    let mono2 = average * randomNum_fonts;
    let casl2 = average * randomNum_fonts;
    let slnt2 = average * randomNum_fonts + casl2;
    let ital2 = average * randomNum_fonts + slnt2;

    if (fontSelected === "Hela") {
      styles["font-variation-settings"] = `'wght' ${wght2}`;

      addAnimTo.classList.add("class", `hela_anim`);
    }
    if (fontSelected === "Movement") {
      styles["font-variation-settings"] = `'SPAC' ${wght2}, 'wght' ${wght2}`;

      addAnimTo.classList.add("class", `movement_anim`);
    }
    if (fontSelected === "BandeinsStrange") {
      styles["font-variation-settings"] = `'wght' ${wght2}, 'wdth' ${casl2}`;

      addAnimTo.classList.add("class", `bandeinsS_anim`);
    }
    if (fontSelected === "Recursive") {
      styles[
        "font-variation-settings"
      ] = `'wght' ${wght2}, 'CASL' ${casl2}, 'slnt' ${slnt2}, 'MONO' ${mono2}, 'ital' ${ital2}`;
    }

    console.log(styles);
    var elementStyle = document.getElementById("controls-result").style;
    for (var styleName in styles) {
      elementStyle[styleName] = styles[styleName];
    }
  }

  function _setPageStructure() {
    _chooseFont();
    _splitContentByH2();
    //_randomStylesBrutal();
    _perspectiveCards();
  }
  function _splitContentByH2() {
    $("#results h2").each(function() {
      $(this)
        .nextUntil(this.tagName)
        .addBack()
        .wrapAll("<section />");
    });

    let randomNum = Math.floor(Math.random() * 2);
    const availableSates = ["horizontal", "vertical"];
    //let stateSelected = availableSates[randomNum];
    let stateSelected = "vertical";

    if (stateSelected === "horizontal") {
      console.log("The scroll is: " + stateSelected);

      var createdSections = $("#results section");
      for (let i = 0; i < createdSections.length; i++) {
        section = createdSections[i];
        section.setAttribute("class", `sections section${i}`);

        randomNum = Math.floor(Math.random() * score);
        let bodyWidth =
          Math.abs(
            scale(numHits, randomNum, numWords + numHits, randomNum, 100)
          ) + "%";
        // console.log("bodyWidth is: " + bodyWidth);
        //section.style.width = bodyWidth;
        section.style.width = "400px";
        section.style.margin = bodyWidth;
        section.style.flex = "0 0 500px";

        let styles = {};

        let borderStyles = [
          "dotted",
          "solid",
          "dashed",
          "double",
          "groove",
          "inset",
          "outset",
          "ridge",
          "solid"
        ];
        let item =
          borderStyles[Math.floor(Math.random() * borderStyles.length)];
        let randomColor = Math.floor(Math.random() * 16777215).toString(16);
        let size = Math.abs(score);
        styles["border"] = `${size}px ${item} #${randomColor}`;

        let randomColor1 = Math.floor(Math.random() * 16777215).toString(16);
        styles["color"] = `#${randomColor1}`;

        let randomColor2 = Math.floor(Math.random() * 16777215).toString(16);
        styles["background-color"] = `#${randomColor2}`;

        let paddingSize = Math.floor(Math.random() * Math.abs(score));
        styles["padding"] = `${paddingSize}%`;

        let marginSize = Math.abs(score);
        styles["margin"] = `${marginSize}%`;

        console.log(styles);

        var sectionClass = $(`.section${i}`);
        sectionClass.css(styles);

        for (var styleName in styles) {
          sectionClass[styleName] = styles[styleName];
        }
      }
      $(".results div").css("display", "flex");
    }

    if (stateSelected === "vertical") {
      console.log("The scroll is: " + stateSelected);
      var createdSections = $("#results section");

      for (let i = 0; i < createdSections.length; i++) {
        section = createdSections[i];
        section.setAttribute("class", `sections section${i}`);

        let styles = {};

        let borderStyles = [
          "dotted",
          "solid",
          "dashed",
          "double",
          "groove",
          "inset",
          "outset",
          "ridge",
          "solid"
        ];
        let item =
          borderStyles[Math.floor(Math.random() * borderStyles.length)];
        let randomColor = Math.floor(Math.random() * 16777215).toString(16);
        let size = Math.abs(score);
        styles["border"] = `${size}px ${item} #${randomColor}`;

        let randomColor1 = Math.floor(Math.random() * 16777215).toString(16);
        styles["color"] = `#${randomColor1}`;

        let randomColor2 = Math.floor(Math.random() * 16777215).toString(16);
        styles["background-color"] = `#${randomColor2}`;

        let paddingSize = Math.floor(Math.random() * Math.abs(score));
        styles["padding"] = `${paddingSize}%`;

        let marginSize = Math.abs(score);
        styles["margin"] = `${marginSize}%`;

        console.log(styles);

        var sectionClass = $(`.section${i}`);
        sectionClass.css(styles);

        for (var styleName in styles) {
          sectionClass[styleName] = styles[styleName];
        }
      }
    }
  }
  function _randomStylesBrutal() {
    // margin:
    // height:
    // background-color: lightpink;
    // color: black;
    // border: 8px dotted red;

    //
    let styles = {};

    let borderStyles = [
      "dotted",
      "solid",
      "dashed",
      "double",
      "groove",
      "inset",
      "outset",
      "ridge",
      "solid"
    ];
    let item = borderStyles[Math.floor(Math.random() * borderStyles.length)];
    let randomColor = Math.floor(Math.random() * 16777215).toString(16);
    let size = Math.abs(score);
    styles["border"] = `${size}px ${item} #${randomColor}`;

    let randomColor1 = Math.floor(Math.random() * 16777215).toString(16);
    styles["color"] = `#${randomColor1}`;

    let randomColor2 = Math.floor(Math.random() * 16777215).toString(16);
    styles["background-color"] = `#${randomColor2}`;

    console.log(styles);

    var elementStyle = document.getElementById("controls-result").style;
    for (var styleName in styles) {
      elementStyle[styleName] = styles[styleName];
    }
  }
  function _perspectiveCards() {
    const perspectiveOrigin = {
      x: parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--scenePerspectiveOriginX"
        )
      ),
      y: parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--scenePerspectiveOriginY"
        )
      ),
      maxGap: 10
    };

    window.addEventListener("scroll", moveCamera);
    window.addEventListener("mousemove", moveCameraAngle);
    setSceneHeight();

    function moveCameraAngle(event) {
      const xGap =
        (((event.clientX - window.innerWidth / 2) * 100) /
          (window.innerWidth / 2)) *
        -1;

      const yGap =
        (((event.clientY - window.innerHeight / 2) * 100) /
          (window.innerHeight / 2)) *
        -1;

      const newPerspectiveOriginX =
        perspectiveOrigin.x + (xGap * perspectiveOrigin.maxGap) / 100;
      const newPerspectiveOriginY =
        perspectiveOrigin.y + (yGap * perspectiveOrigin.maxGap) / 100;

      document.documentElement.style.setProperty(
        "--scenePerspectiveOriginX",
        newPerspectiveOriginX
      );
      document.documentElement.style.setProperty(
        "--scenePerspectiveOriginY",
        newPerspectiveOriginY
      );
    }

    function moveCamera() {
      document.documentElement.style.setProperty(
        "--cameraZ",
        window.pageYOffset
      );
    }

    function setSceneHeight() {
      const numberOfItems = $(".sections").length; // Or number of items you have in `.scene3D`
      const itemZ = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--itemZ")
      );
      const scenePerspective = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--scenePerspective"
        )
      );
      const cameraSpeed = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--cameraSpeed"
        )
      );

      const height =
        window.innerHeight +
        scenePerspective * cameraSpeed +
        itemZ * cameraSpeed * numberOfItems;

      // Update --viewportHeight value
      document.documentElement.style.setProperty("--viewportHeight", height);
    }

    $("#controls-result").addClass("viewport");
    $(".results").addClass("scene3D-container");
    $(".results > div").addClass("scene3D");

    var sections = $(`.scene3D .sections`).length;

    for (let i = 0; i < sections; i++) {
      let styles = {};

      var xpos = Math.floor(Math.random() * 50) - 50;
      var ypos = Math.floor(Math.random() * 50) - 50;
      styles[
        "transform"
      ] = `transform: translate3D(${xpos}%, ${ypos}%, calc(${xpos} * ${ypos} * ${i} * -1px))`;
      console.log(styles);

      var sectionClass = $(`.section${i}`);
      //sectionClass.css(styles)

      for (var styleName in styles) {
        sectionClass[styleName] = styles[styleName];
      }
    }
  }

  _setMainFontSize();
  _setPageStructure();
  _getBgColor();
}

$(document).ready(function() {
  //
  $("#toggle_contenteditable").click(function() {
    $(this).toggleClass("btn--active");
    let editableDiv = $(".page"),
      isEditable = editableDiv.is(".editable");
    editableDiv.prop("contenteditable", !isEditable).toggleClass("editable");
  });

  //
  let textColorPicker = new iro.ColorPicker("#textcolorpicker", {
    width: 320,
    color: "#000"
  });

  textColorPicker.on(["color:init", "color:change"], function(color) {
    $(".form-appearance-textcolor").val(color.hexString);
    $("#controls-result").css("color", color.hexString);
  });

  $(".form-appearance-textcolor").on("change", function() {
    let textcolor = $(this).val();
    $(".text").css("color", textcolor);
    $(".settings-togglecolorpicker-text").css("background", textcolor);
  });

  $(".settings-togglecolorpicker-text").on("click", function() {
    $("#textcolorpicker").toggleClass("form-colorpicker--visible");
    $(".form-colorpicker-close").toggle();
  });

  $(".form-colorpicker-close").on("click", function() {
    $(".form-colorpicker").removeClass("form-colorpicker--visible");
    $(this).hide();

    let textcolor = $(".form-appearance-textcolor").val();
    $(".settings-togglecolorpicker-text").css("background", textcolor);

    let bgcolor = $(".form-appearance-bgcolor").val();
    $(".settings-togglecolorpicker-bg").css("background", bgcolor);
  });

  $(".form-appearance-bgcolor").on("change", function() {
    let bgcolor = $(this).val();
    $("body").css("background", bgcolor);
    $(".settings-togglecolorpicker-bg").css("background", bgcolor);
  });

  let bgColorPicker = new iro.ColorPicker("#bgcolorpicker", {
    width: 320,
    color: "#fafafa"
  });

  bgColorPicker.on(["color:init", "color:change"], function(color) {
    $(".form-appearance-bgcolor").val(color.hexString);
    $("body").css("background", color.hexString);
  });

  $(".settings-togglecolorpicker-bg").on("click", function() {
    $("#bgcolorpicker").toggleClass("form-colorpicker--visible");
    $(".form-colorpicker-close").toggle();
  });

  // Controlers Controlers
  // Controlers Controlers
  // Controlers Controlers

  let size2;
  let wght2;
  let mono2;
  let casl2;
  let slnt2;
  let ital2;

  // Review event listner for JQuery value sliders
  document
    .getElementById("fontSizeSlider")
    .addEventListener("input", function() {
      size2 = document.getElementById("fontSizeSlider").value * 2 + "pt";
      document.getElementById("fontSizeResult").innerHTML =
        document.getElementById("fontSizeSlider").value * 2 + "pt";
    });

  document.getElementById("monoSlider").addEventListener("input", function() {
    mono2 = document.getElementById("monoSlider").value;
    document.getElementById("monoResult").innerHTML = document.getElementById(
      "monoSlider"
    ).value;
    // document.getElementById("controls-result").style.fontVariationSettings = `'wght' ${wght2}, 'CASL' ${casl2}, 'slnt' ${slnt2}, 'MONO' ${mono2}, 'ital' ${ital2}`;
  });

  document.getElementById("wghtSlider").addEventListener("input", function() {
    wght2 = document.getElementById("wghtSlider").value;

    document.getElementById("wghtResult").innerHTML = document.getElementById(
      "wghtSlider"
    ).value;
    // document.getElementById("controls-result").style.fontVariationSettings = `'wght' ${wght2}, 'CASL' ${casl2}, 'slnt' ${slnt2}, 'MONO' ${mono2}, 'ital' ${ital2}`;
  });

  document.getElementById("caslSlider").addEventListener("input", function() {
    casl2 = document.getElementById("caslSlider").value;
    document.getElementById("caslResult").innerHTML = document.getElementById(
      "caslSlider"
    ).value;
    // document.getElementById("controls-result").style.fontVariationSettings = `'wght' ${wght2}, 'CASL' ${casl2}, 'slnt' ${slnt2}, 'MONO' ${mono2}, 'ital' ${ital2}`;
  });

  document.getElementById("slntSlider").addEventListener("input", function() {
    slnt2 = document.getElementById("slntSlider").value;
    document.getElementById("slntResult").innerHTML = document.getElementById(
      "slntSlider"
    ).value;
    // document.getElementById("controls-result").style.fontVariationSettings = `'wght' ${wght2}, 'CASL' ${casl2}, 'slnt' ${slnt2}, 'MONO' ${mono2}, 'ital' ${ital2}`;
  });

  $("#validate_edit").on("click", function() {
    (function($) {
      $.fn.inlineStyle = function(prop) {
        return this.prop("style")[$.camelCase(prop)];
      };
    })(jQuery);

    let sel, range;

    if (window.getSelection) {
      range = window.getSelection().getRangeAt(0);

      let content = range.extractContents();
      let span = document.createElement("SPAN");

      if ($("input#btn_addAnim").is(":checked")) {
        span.setAttribute(
          "class",
          "movement_anim hela_anim bandeinsS_anim recursive_anim"
        );
      }

      span.appendChild(content);

      let htmlContent = span.innerHTML;
      htmlContent = htmlContent.replace(/<\/?span[^>]*>/g, "");
      htmlContent = htmlContent.replace(/font-size:[^;]+/g, "");
      htmlContent = htmlContent
        .replace(/<font/g, "<span")
        .replace(/<\/font>/g, "</span>");

      if (span.innerHTML.toString() == "") htmlContent = htmlContent + " ";

      let cursorPosition = htmlContent.length;
      span.innerHTML = htmlContent;

      if ($("#controls-result").inlineStyle("fontFamily") == "Recursive") {
        span.style.cssText =
          "font-variation-settings:" +
          `'wght' ${wght2}, 'slnt' ${slnt2}` +
          ";" +
          "font-size: " +
          `${size2}`;
      }

      if ($("#controls-result").inlineStyle("fontFamily") == "Hela") {
        span.style.cssText =
          "font-size: " +
          `${size2}` +
          ";font-variation-settings: " +
          `'wght' ${wght2}` +
          ";";
      }
      if (
        $("#controls-result").inlineStyle("fontFamily") == "BandeinsStrange"
      ) {
        span.style.cssText =
          "font-size: " +
          `${size2}` +
          ";font-variation-settings: " +
          `'wght' ${wght2}, 'wdth' ${slnt2}` +
          ";";
      }
      if ($("#controls-result").inlineStyle("fontFamily") == "Movement") {
        span.style.cssText =
          "font-size: " +
          `${size2}` +
          ";font-variation-settings: " +
          `'wght' ${wght2}, 'SPAC' ${slnt2}` +
          ";";
      }

      range.insertNode(span);
      sel = window.getSelection();
      range = sel.getRangeAt(0);
      range.collapse(true);

      let lastChildElement = span.childNodes.length - 1;

      if (cursorPosition == 1) {
        range.setStart(span.childNodes[0], 1);
      } else {
        range.setEndAfter(span);
      }

      sel.removeAllRanges();
      sel.addRange(range);
    }
  });
});
