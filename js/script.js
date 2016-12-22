$(function () { // Same as document.addEventListener("DOMContentLoaded"...)

  // Same as document.querySelector("#navbarToggle").addEventListener("blur",...)
  $("#navbarToggle").blur(function (event) {
    var screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      $("#collapsable-nav").collapse('hide');
    }
  });

  $("#navbarToggle").click(function (event) {
    $(event.target).focus();
  });

});


(function (global) {

  var mainContent = {};

  var homeHtml = "snippets/home-snippet.html";

  var categoriesUrl = "http://davids-restaurant.herokuapp.com/categories.json";

  var categsTitleHtml = "snippets/categs-title-snippet.html";
  var categHtml = "snippets/categ-snippet.html";

  var menuItemsUrl = "http://davids-restaurant.herokuapp.com/menu_items.json?category=";

  var menuItemsTitleHtml = "snippets/menu-items-title-snippet.html";
  var menuItemHtml = "snippets/menu-item-snippet.html";

  // Convenience function for inserting innerHTML for 'select'
  var insertHtml = function (selector, html) {
    document.querySelector(selector).innerHTML = html;
  };

  // Show loading icon inside element identified by 'selector'.
  var showLoading = function (selector) {
    var html = "<div class='text-center'><img scr='img/ajax-loader.gif'></div>";
    insertHtml(selector, html);
  };

  // Return substitute of '{{propName}}'
  // with propValue in given 'string'
  var insertProperty = function (string, propName, propValue) {

    var propToReplace = "{{" + propName + "}}";

    string = string.replace(new RegExp(propToReplace, "g"), propValue);

    return string;
  };

  // Remove the class 'active' from home and switch to Menu button
  var switchMenuToActive = function () {
    // Remove 'active' from home button
    var classes = document.querySelector("#navHomeButton").className;
    classes = classes.replace(new RegExp("active", "g"), "");
    document.querySelector("#navHomeButton").className = classes;

    // Add 'active' to menu button if not already there
    classes = document.querySelector("#navMenuButton").className;
    if (classes.indexOf("active") == -1) {
      classes += " active";
      document.querySelector("#navMenuButton").className = classes;
    }
  };

  // On page load (before images or CSS)
  document.addEventListener("DOMContentLoaded", function (event) {

    // On first load, show home view
    showLoading("#main");
    $ajaxUtils.sendGetRequest(homeHtml, function (responseText) {
      document.querySelector("#main").innerHTML = responseText;
    }, false);
  });

  // Load the menu categories view
  mainContent.loadMenuCategs = function () {
    showLoading("#main");
    $ajaxUtils.sendGetRequest(categoriesUrl, buildAndShowCategsHtml);
    // $ajaxUtils.sendGetRequest(categoriesUrl, buildAndShowCategsHtml, true); // default to JSON
  };

  // Load the menu categories view
  // 'categShort' is a short_name for a category
  mainContent.loadMenuItems = function (categShort) {
    showLoading("#main");
    $ajaxUtils.sendGetRequest(menuItemsUrl + categShort, buildAndShowMenuItemsHtml); // ", true);" is default to JSON
  };

  // Builds HTML for the categories page based on the data
  // from the server
  function buildAndShowCategsHtml (categories) {
    // Load title snippet of categories page
    $ajaxUtils.sendGetRequest(categsTitleHtml, function (categsTitleHtml) {
      // Retrieve single category snippet
      $ajaxUtils.sendGetRequest(categHtml, function (categHtml) {

        // Switch CSS class active to menu button
        switchMenuToActive();

        var categsViewHtml = buildCategsViewHtml (categories, categsTitleHtml, categHtml);

        insertHtml("#main", categsViewHtml);
      }, false); // false because we don't want to process as JSON
    }, false);// false because we don't want to process as JSON
  }

  // Using categories data and snippets html
  // build categories view HTML to be inserted into page
  function buildCategsViewHtml(categories, categsTitleHtml, categHtml) {
    var finalHtml = categsTitleHtml;
    finalHtml += "<section class='row'>";

    // Loop over categories
    for ( var i = 0 ; i < categories.length ; i++ ) {
      // Insert category values
      var html = categHtml;
      var name = "" + categories[i].name;
      var short_name = categories[i].short_name;
      html = insertProperty(html, "name", name);
      html = insertProperty(html, "short_name", short_name);
      finalHtml += html;
    }

    finalHtml += "</section>";
    return finalHtml;
  }

  // Builds HTML for the single category page based on the data
  // from the server
  function buildAndShowMenuItemsHtml (categMenuItems) {

    // Load title snippet of menu items page
    $ajaxUtils.sendGetRequest(menuItemsTitleHtml, function (menuItemsTitleHtml) {

      // Retrieve single menu item snippet
      $ajaxUtils.sendGetRequest(menuItemHtml, function (menuItemHtml) {

        var menuItemsViewHtml = buildMenuItemsViewHtml(categMenuItems, menuItemsTitleHtml, menuItemHtml);

        insertHtml("#main", menuItemsViewHtml);
      }, false);
    }, false);
  }

  // Using category and meny items data and snippets html
  // build menu items view HTML to be inserted into page
  function buildMenuItemsViewHtml(categMenuItems, menuItemsTitleHtml, menuItemHtml) {

    menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "name", categMenuItems.category.name);

    menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "special_instructions", categMenuItems.special_instructions);

    var finalHtml = menuItemsTitleHtml + "<section class='row'>";

    // Loop over menu items
    var menuItems = categMenuItems.menu_items;
    var catShortName = categMenuItems.category.short_name;

    for (var i = 0 ; i < menuItems.length ; i++) {
      // Insert menu item values
      var html = menuItemHtml;

      html = insertProperty(html, "short_name", menuItems[i].short_name);

      html = insertProperty(html, "catShortName", catShortName);

      html = insertItemPrice(html, "price_small", menuItems[i].price_small);

      html = insertItemPortionName(html, "small_portion_name", menuItems[i].small_portion_name);

      html = insertItemPrice(html, "price_large", menuItems[i].price_large);

      html = insertItemPortionName(html, "large_portion_name", menuItems[i].large_portion_name);

      html = insertProperty(html, "name", menuItems[i].name);

      html = insertProperty(html, "description", menuItems[i].description);

      // Add clearfix after every second menu item (every odd number in the array: 1,3,5,7...)
      if (i % 2 != 0) {
        html += "<div class='clearfix visible-lg-block visible-md-block'></div>";
      }

      finalHtml += html;
    }

    finalHtml += "</section>";

    return finalHtml;
  }

  // Appends price with '$' if price exists
  function insertItemPrice(html, pricePropName, priceValue) {
    // If not specified, replace with empty string
    if (!priceValue) {
      return insertProperty(html, pricePropName, "");
    }

    priceValue = "$" + priceValue.toFixed(2);
    html = insertProperty(html, pricePropName, priceValue);
    return html;
  }

  // Append portion name in parentesis if it exists
  function insertItemPortionName(html, portionPropName, portionValue) {
    // If not specified, return original string
    if (!portionValue) {
      return insertProperty(html, portionPropName, "");
    }

    portionValue = "(" + portionValue + ")";
    html = insertProperty(html, portionPropName, portionValue);

    return html;
  }

  global.$mainContent = mainContent;

})(window);
