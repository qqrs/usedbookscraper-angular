'use strict';

/* Services */

(function() {

  //TODO: make sure this gets reset to defaults when starting over
  function BookScraperMaster($log, GoodreadsApi, HalfService) {
    function BookScraperSession() {
      angular.extend(this, {

      shelves: null,    // array of shelf names
      books: null,      // array of ISBN strings
      editions: null,   // array of edition objects
      listings: null,   // array of listing objects
      sellers: null,    // array of seller objects

      goodreadsUserId: null,            // Goodreads user ID as string
      goodreadsSelectedShelves: null,   // Goodreads shelves selected for search
      isbnList: null,                   // ISBNs entered directly by user
      selected_books: null,
      edition_selections: null,

      book_options_defaults: {
        desirability: 1.0,
        maxprice: 4.00,
        condition: 'Good',
        excludeLibrary: true,
        excludeCliffsNotes: true
      }

      });
    }

    BookScraperSession.prototype.fetchShelfBooks = function(handleCompletion, handleFailure) {
      var books = this.books = [],
          remainingRequests = 0;

      // get book isbns for each shelf using GoodreadsApi
      _.each(this.goodreadsSelectedShelves, function(shelf) {
        var options = this.book_options_defaults;
        remainingRequests++;
        GoodreadsApi.getBooks(
          this.goodreadsUserId,
          shelf.name,
          function successFn(shelf_books) {
            _.each(shelf_books, function(book) {
              //TODO: use the default options and only copy as needed
              books.push(new Book(book, angular.copy(options)));
            });
            remainingRequests--;
            if (remainingRequests === 0) {
              handleCompletion();
            }
          },
          handleFailure
        );
      }, this);
    };

    BookScraperSession.prototype.buildIsbnBooks = function(isbns) {
      var options = this.book_options_defaults;

      this.isbnList = isbns;
      this.books = _.map(isbns, function (isbn) {
        return new Book({isbn: isbn}, angular.copy(options));
      });
      this.selected_books = this.books;
    };

    BookScraperSession.prototype.fetchListings = function(handleCompletion, handleFailure) {
      var half = HalfService.newQueryBatch(),
          books = this.selected_books,
          editions = this.editions,
          selection = this.edition_selections,
          listings = this.listings = [],
          params;

      // get Half.com listings for each edition of each book
      _.each(books, function (book, book_index) {
        book.listings = [];
        _.each(book.editions, function (ed, ed_index) {
          // skip unselected book editions
          if (!selection[book_index][ed_index]) {
            return;
          }

          ed.listings = [];
          params = {
            isbn: ed.isbn,
            page: '1',
            condition: book.options.condition,
            // TODO: maxprice safe if user enters non-number?
            maxprice: book.options.maxprice
          };
          half.findItems(
            params,
            handleFetchListingsSuccess.bind(null, book, ed, listings),
            handleFailure
          );
        });
      });

      half.registerCompletionCallback(handleCompletion);
      return half.progress;
    };

    var handleFetchListingsSuccess = function(book, ed, listings, response) {
      // save edition-level properties
      ed.half_title = ed.half_title || response.title;
      ed.half_image_url = ed.half_image_url || response.image;

      // filter undesireable listings
      var ed_listings = _.filter(response.items, book.isListingExcluded, book);

      _.each(ed_listings, function(el) {
        el.book = book;
        el.edition = ed;
      });
      Array.prototype.push.apply(listings, ed_listings);
      Array.prototype.push.apply(book.listings, ed_listings);
      Array.prototype.push.apply(ed.listings, ed_listings);
    };

    BookScraperSession.prototype.findOrCreateSeller = function(name, listing) {
      if (!this.sellers.hasOwnProperty(name)) {
        this.sellers[name] = new Seller(listing);
      }
      return this.sellers[name];
    };

    BookScraperSession.prototype.buildSellersFromListings = function() {
      this.sellers = {};

      _.each(this.listings, function (listing) {
        var seller = this.findOrCreateSeller(listing.seller, listing);
        seller.addListing(listing);
      }, this);

      _.each(this.sellers, function (seller) {
        seller.sortBooks();
        seller.updateScore();
      });
    };

    BookScraperSession.prototype.getSortedSellers = function() {
      // TODO: incorporate price as tiebreaker
      return _.chain(this.sellers)
        .toArray()
        .sortBy(function (seller) {
          return -seller.booksScore;
        }).value();
    };

    var session = new BookScraperSession();

    // ========================================

    // TODO: book option master defaults
    // TODO: per-shelf book options defaults
    // TODO: per-book title search ("rule") options defaults
    function Book(book, options) {
      angular.extend(this, {isbn: null, title: null, author: null});
      angular.extend(this, book);
      this.options = options;
    }

    Book.prototype.isListingExcluded = function(listing) {
      if (this.options.excludeLibrary &&
          /library/i.test(listing.comments)) {
        return false;
      }
      if (this.options.excludeCliffsNotes &&
          /cliff'?s? notes?/i.test(listing.comments)) {
        return false;
      }
      return true;
    };

    // ========================================

    /*
    function Edition() {
    }

    Edition.prototype.addListing = function(listing, options) {
      // filter library and cliffs

      // set listing.book and listing.ed

      // push to ed.listings, book.listings, session.listings
    };
    */

    // ========================================

    function Seller(listing) {
      this.name = listing.seller;
      this.feedback_count = listing.feedback_count;
      this.feedback_rating = listing.feedback_rating;
      this.books = [];
    }

    Seller.prototype.addListing = function(listing) {
      var sellerBook = _.find(this.books, {book: listing.book});
      if (!sellerBook) {
        sellerBook = new SellerBook(listing.book);
        this.books.push(sellerBook);
      }
      sellerBook.listings.push(listing);
    };

    Seller.prototype.sortBooks = function() {
      _.each(this.books, function (book) {
        book.sortListings();
      });
      this.books = _.sortBy(this.books, function (sbook) {
        return -sbook.getScore();
      });
    };

    Seller.prototype.updateScore = function() {
      var score = 0.0;
      _.each(this.books, function (book) {
        score += book.getScore();
      });
      this.booksScore = score;
    };

    // ========================================

    function SellerBook(book) {
      this.book = book;
      this.listings = [];
      this.bestListing = null;
    }

    SellerBook.prototype.getScore = function() {
      return this.book.options.desirability;
    };

    SellerBook.prototype.sortListings = function() {
      // TODO: use Array.sort and compare a/b instead of sort key
      // TODO: account for year, -listing.edition.year
      var sellerBookListingsSortKey = function (listing) {
        var cond = HalfService.getValueForCondition(listing.condition),
            ship_cost = HalfService.getListingMarginalShippingCost(listing),
            cost = listing.price + ship_cost;
        return (cost - (0.5 * cond));
      };
      this.listings = _.sortBy(this.listings, sellerBookListingsSortKey);
      this.bestListing = this.listings[0];
    };

    return session;

  }

  BookScraperMaster.$inject = [
    '$log',
    'GoodreadsApi',
    'HalfService'
  ];

// =============================================================================

  angular.module('ubsApp.services', ['ngResource'])
    .factory('BookScraperMaster', BookScraperMaster);

})();
