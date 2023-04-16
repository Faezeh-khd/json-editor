
$.getJSON("../data.json", function (json) {
  showData (json);
});

 function showData (json) {
  json.sort(function (a, b) {
    var titleA = a.titles.ar || a.titles.fa;
    var titleB = b.titles.ar || b.titles.fa;
    return titleA.localeCompare(titleB);
  });

  // Cache the titles list
  var titlesList = $("#titles-list");

  // Handle the keyup event on the search field
  $(".searchInput").on("keyup", function () {
    // Get the search query
    var query = $(this).val();

    // Clear the previous search results
    titlesList.empty();

    // Loop through the JSON data and add matching items to the list
    $.each(json, function (index, value) {
      var title = value.titles.ar || value.titles.fa;

      // Check if the title contains the search query
      if (title.toLowerCase().indexOf(query) !== -1) {
        // Create an <i> element with the edit icon
        var icon = $("<i>").addClass("fas fa-edit");

        // Create a <button> element for the edit button
        var editBtn = $("<button>")
          .addClass("btn btn-blue rounded-circle btn-sm float-left mx-2")
          .append(icon);

        // Create a <li> element with the edit button and title
        // clearfix is used to clear any floated elements inside the list item.
        var item = $("<li>")
          .addClass("list-group-item text-blue clearfix")
          .append(editBtn)
          .append(title);

        // Add the item to the list
        titlesList.append(item);

        // Add an event listener to the edit button
        editBtn.on("click", function () {
          localStorage.setItem("updatedData", JSON.stringify(value));
          window.location.href = "dataObj.html";
        });
      }
    });
  });

  // Initialize the form with the first page of search results
  $(".searchInput").trigger("keyup");

  $(function () {
    var data = JSON.parse(localStorage.getItem("updatedData"));

    $.app("#app", data, {
      separator: " : ",
      depth: 1,
      showSaveButton: true,
    });
  });
}

var DEFAULT_SEPARATOR = " : ";

// save button
var getSaveButton = function () {
  var button = document.createElement("button");
  button.setAttribute("class", "app-save rounded-pill mt-2");
  button.innerHTML = "ذخیره تغییرات";
  return button;
};

//remove button
function createRemoveButton() {
  var removeButton = $("<button>")
    .addClass("btn remove-button px-2 py-1 bg-transparent rounded-circle")
    .html('<i class="fa-solid fa-xmark"></i>');
  return removeButton;
}

/**********************      Handlers      ******************************/
var attachSaveHandler = function (button, callback) {
  $(button).on("click", callback);
};

var attachCollapseHandler = function (button) {
  $(button).on("click", function (e) {
    e.preventDefault();
    var value = $(button).next();
    if ($(button).hasClass("collapsed")) {
      // $(button).text("بستن");
      $(button).empty();
      $(button).append('<i class="fa-solid fa-angle-up"></i>');
      $(value).slideDown("slow", function () {
        $(button).removeClass("collapsed");
      });
    } else {
      $(value).slideUp("slow", function () {
        $(button).addClass("collapsed");
        $(button).empty();
        $(button).append('<i class="fa-solid fa-angle-down"></i>');
        // $(button).text("بازکردن");
      });
    }
  });
};

/**
 * Add a handler to append a new element as HTML to the list
 */
var attachAddArrayElementHandler = function (button, options) {
  $(button).on("click", function (e) {
    e.preventDefault();
    var elementHTML = createArrayElementHTML("", options);
    $(button).before(elementHTML);
  });
};

/**
 * Add a handler to append a new dictionary as HTML to the list
 *
 * consider refactoring this with the function above
 */
var attachAddKeyValuePairElementHandler = function (button, options) {
  $(button).on("click", function (e) {
    e.preventDefault();
    var elementHTML = createArrayElementHTML({ "": "" }, options);
    $(button).before(elementHTML);
  });
};

var attachKeyValuePairHandler = function (button, options) {
  $(button).on("click", function (e) {
    e.preventDefault();
    var elementHTML = createKeyValuePairHTML("", "", options);
    $(button).before(elementHTML);
  });
};

/**********************      Utilities      ******************************/

var getOptionOrDefault = function (options, optionName, defaultValue) {
  if (typeof options === "undefined") {
    return defaultValue;
  }
  if (typeof options[optionName] === "undefined") {
    return defaultValue;
  }
  return options[optionName];
};

/**
 * Detect whether a string is a number-ish value
 *
 * @param n string
 * @return boolean Whether the string is a number
 */
var isNumber = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

/**
 * Detect whether an object is a dictionary (eg, {}) instead of a list or
 * another data type
 *
 */
var isDictionary = function (obj) {
  return typeof obj === "object" && !(obj instanceof Array);
};

/**
 * Detect whether a list is a list of dictionaries
 *
 * Of course in Javascript a list can combine any types, in this case we are
 * strict and care only if the list is made up entirely of dictionaries. You
 * shouldn't mix types in a list.
 */
var isArrayOfDictionaries = function (list) {
  try {
    return list.filter(isDictionary).length === list.length;
  } catch (TypeError) {
    return false;
  }
};

/*********   These functions take JSON and return HTML     **********/

/**
 * Create HTML for a map key/value pair
 */
var createKeyValuePairHTML = function (key, value, options) {
  var separator = getOptionOrDefault(options, "separator", DEFAULT_SEPARATOR);
  var depth = getOptionOrDefault(options, "depth", -1);

  var pair = $(document.createElement("div"));
  pair.addClass("app-map-pair my-2 py-4 px-auto border-bottom");

  var keyHTML = $(document.createElement("input"));
  keyHTML.addClass("app-map-key");

  // var valuesOnly = getOptionOrDefault(options, "permissions", []);

  // if ($.inArray("values-only", valuesOnly) !== -1) {
  //   keyHTML.prop("readonly", true);
  //   keyHTML.css("border", "0px");
  // }

  keyHTML.attr("value", key);
  pair.append(keyHTML);

  var optionsCopy = jQuery.extend(true, {}, options);
  if (depth > 0) {
    optionsCopy.depth = depth - 1;
  }

  var valueHTML = convertJSONToHTML(value, optionsCopy, key);
  var hideToggle = getOptionOrDefault(options, "permissions", []);

  valueHTML.addClass("app-map-value-container");

  if (valueHTML.children(".app-map-pair, .app-array-element").length > 0) {
    var button = $(document.createElement("button"));
    button.addClass("app-collapse-item bg-transparent border-0");
    if (depth !== 0) {
      // button.text("بستن");
      button.empty();
      button.append('<i class="fa-solid fa-angle-up"></i>');
      attachCollapseHandler(button);
      if ($.inArray("hide-toggle", hideToggle) === -1) {
        pair.append(button);
      }
    } else {
      button.addClass("collapsed");
      // button.text("بازکردن");
      valueHTML.hide();
      button.empty();
      button.append('<i class="fa-solid fa-angle-down"></i>');
      attachCollapseHandler(button);
      if ($.inArray("hide-toggle", hideToggle) === -1) {
        pair.append(button);
      }
    }
  } else {
    pair.append(keyHTML);
    var separatorElement = $(document.createElement("p"));
    separatorElement.addClass("app-separator");
    separatorElement.text(separator);
    pair.append(separatorElement);
  }

  pair.append(valueHTML);

  if (keyHTML.val() === "uri") {
    keyHTML.prop("readonly", true);
    valueHTML.prop("readonly", true);
  } else {
    //remove-button
    var removeButton = createRemoveButton();
    removeButton.on("click", function () {
      if (confirm("آیا از حذف آن مطمئن هستید؟")) {
        $(this).closest(".app-map-pair").remove();
      }
    });
    pair.prepend(removeButton);
  }

  return pair;
};

var createMapHTML = function (map, options, optionalKey) {
  var mapHTML = $(document.createElement("form"));
  mapHTML.addClass("app-map px-auto");
  var key;
  var keys = [];
  for (key in map) {
    if (map.hasOwnProperty(key)) {
      keys.push(key);
    }
  }

  //   keys.sort();
  for (var j = 0; j < keys.length; j++) {
    key = keys[j];
    var value = map[key];
    var pair = createKeyValuePairHTML(key, value, options);
    mapHTML.append(pair);
  }
  var addPairElement = $(document.createElement("button"));
  addPairElement.addClass("adding-btn app-map-add-pair border-0 rounded-pill");
  var text = getAddElementText("key/value ", optionalKey);
  addPairElement.text(text);
  attachKeyValuePairHandler(addPairElement, options);

  var noAppend = getOptionOrDefault(options, "permissions", []);

  if ($.inArray("no-append", noAppend) !== -1) {
    return mapHTML;
  }

  mapHTML.append(addPairElement);
  return mapHTML;
};

/**
 * Create HTML for a JSON array element
 *
 * @return a jQuery object for the element, plus what's inside the element
 */
var createArrayElementHTML = function (element, options) {
  var elementHTML = $(document.createElement("div"));
  elementHTML.addClass("app-array-element");

  //remove-Button
  var removeButton = createRemoveButton();
  removeButton.on("click", function () {
    if (confirm("آیا از حذف آن مطمئن هستید؟")) {
      $(this).closest(".app-array-element").remove();
    }
  });
  elementHTML.append(removeButton);

  elementHTML.append(convertJSONToHTML(element, options));
  return elementHTML;
};

var getAddElementText = function (elementName, optionalKey) {
  var type = typeof optionalKey;
  var maxKeyLength = 30;
  if (type === "undefined" || type !== "string") {
    return ["اضافه کردن مقدار جدید ", elementName].join("");
  }
  if (optionalKey.length > maxKeyLength) {
    return [
      "اضافه کردن یک ",
      elementName,
      " جدید به ",
      optionalKey.substring(0, maxKeyLength),
      "...",
    ].join("");
  } else {
    return ["اضافه کردن یک ", elementName, " جدید به ", optionalKey].join("");
  }
};

var createArrayHTML = function (data, options, optionalKey) {
  var array = $(document.createElement("div"));
  array.addClass("app-array me-5");
  for (var i = 0; i < data.length; i++) {
    var elementHTML = createArrayElementHTML(data[i], options);
    array.append(elementHTML);
  }
  // If it's a list of dictionaries, add an option to add
  // a dictionary.
  var text;
  if (isArrayOfDictionaries(data)) {
    var addPairElement = $(document.createElement("button"));
    addPairElement.addClass(
      "adding-btn app-array-add-pair border-0 rounded-pill"
    );
    text = getAddElementText("object", optionalKey);
    addPairElement.text(text);
    attachAddKeyValuePairElementHandler(addPairElement, options);
    array.append(addPairElement);
  } else {
    // Otherwise, you can only add new values.
    var addRowElement = $(document.createElement("button"));
    addRowElement.addClass(
      "adding-btn app-array-add-row border-0 rounded-pill "
    );
    text = getAddElementText("element", optionalKey);
    addRowElement.text(text);
    attachAddArrayElementHandler(addRowElement, options);
    array.append(addRowElement);
  }
  return array;
};

/**
 * Converts a simple JSON value (string, number) into HTML
 *
 * @return jQuery
 */
var createInputHTML = function (input, type) {
  var maxInputTextLength = 80;
  var valueInput;
  if (type === "string" && input.length > maxInputTextLength) {
    valueInput = $(document.createElement("textarea"));
    valueInput.attr("rows", 4);
    // valueInput.attr("cols", 40);
    valueInput.addClass("app-input-textarea");
  } else {
    valueInput = $(document.createElement("input"));
    valueInput.addClass("app-input-text");
  }
  valueInput.addClass("app-map-value");
  valueInput.val(input);

  return valueInput;
};

/**
 * Convert a JSON object into HTML
 * This function calls itself recursively
 *
 * @param object data the JSON object to convert
 * @param object|undefined options the user specified options
 * @param string optionalKey for dictionary values, pass in the associated key
 */
var convertJSONToHTML = function (data, options, optionalKey) {
  var type = typeof data;
  // typeof null === "object", so we compare directly against null
  if (
    type === "string" ||
    type === "number" ||
    type === "boolean" ||
    data === null
  ) {
    return createInputHTML(data, type);
  }

  // The JSON specification allows for fractions and exponents.
  // Handle them here.

  if (Object.prototype.toString.call(data) === "[object Array]") {
    return createArrayHTML(data, options, optionalKey);
  }

  // Now that we've covered the other cases, only dictionaries should be
  // left, in theory.
  return createMapHTML(data, options, optionalKey);
};

/************  these functions take HTML and return JSON    ***************/

/**
 * Take a value and try to parse it into JSON data types
 *
 * For example, "true" => true
 *
 * @param string value
 * @param object|undefined options
 * @return The returned data type
 */
var parseTextInput = function (value, options) {
  // XXX: the JSON specification allows for fractions and exponents,
  // handle them here.
  if (isNumber(value)) {
    return parseFloat(value);
  }

  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }

  /**
   * Note: there's some data loss here as we cannot detect between the
   * empty string and null. In theory we could attach a data-* attribute
   * to the input and use that but you'd still break if the user voided a
   * field while editing the JSON.
   */
  if (value === null || value === "null") {
    return null;
  }
  if (value.length === 0) {
    var emptyString = getOptionOrDefault(options, "emptyString", false);
    return emptyString === true ? "" : null;
  }

  return value;
};
/**
 * this function calls itself recursively
 *
 * input: a JQuery object (the editor in JSON)
 * output: a JSON object
 */
var reassembleJSON = function (html, options) {
  var mapChildren = html.children(".app-map");
  if (mapChildren.length > 0) {
    return reassembleJSON(mapChildren, options);
  }

  var mapItems = html.children(".app-map-pair");
  if (mapItems.length > 0) {
    var d = {};
    mapItems.each(function (index, element) {
      var $element = $(element);
      var key = $element.children(".app-map-key");
      // if multiple elements have the same key, last one wins.
      // what should actually be done here? warn?
      if (key.val() === "") {
        return;
      }
      d[key.val()] = reassembleJSON(
        $element.children(".app-map-value-container"),
        options
      );
    });
    return d;
  }

  var arrayChildren = html.children(".app-array");
  if (arrayChildren.length > 0) {
    return reassembleJSON(arrayChildren, options);
  }

  if (html.hasClass("app-array")) {
    var array = [];
    html.children(".app-array-element").each(function (index, element) {
      array.push(reassembleJSON($(element), options));
    });
    return array;
  }

  if (html.hasClass("app-map-value")) {
    var smartParsing = getOptionOrDefault(options, "smartParsing", true);
    if (!smartParsing) {
      return html.val();
    }
    return parseTextInput(html.val(), options);
  }

  // hack, merge this with the above conditional
  var valueChild = html.children(".app-map-value");
  if (valueChild.length) {
    return reassembleJSON(valueChild, options);
  }

  if (html.hasClass("app-map-value-container")) {
    return reassembleJSON(html.children(".app-map-value"), options);
  }

  return {};
};

/*********************      Exported Functions       **********************/

$.app = function (selector, data, callback, options) {
  // get option settings
  var $element = $(selector);
  $element.addClass("app");
  var html = convertJSONToHTML(data, options);
  $element.html(html);

  var showSaveButton = getOptionOrDefault(options, "showSaveButton", true);
  if (showSaveButton) {
    var button = getSaveButton();
    attachSaveHandler(button, function (event) {
      var newData = reassembleJSON($element.children(), options);
      alert("تغییرات با موفقیت ثبت شد")
    // console.log(newData);
    // callback(newData);
    window.location.href = "index.html";
    event.preventDefault();
    });
    $element.append(button);
  }
  return $element;
};

$.appSmash = function (selector, options) {
  return reassembleJSON($(selector), options);
};

function saveToDisk() {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:application/json;charset=utf-8," +
      encodeURIComponent("new data should be added")
  );
  element.setAttribute("download", "ModifiedJsonFile.json");
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
