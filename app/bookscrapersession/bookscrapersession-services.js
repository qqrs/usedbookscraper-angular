'use strict';

/* Services */

(function() {

  //TODO: fix property name styling
  function BookScraperMaster($log, GoodreadsApi, XisbnApi, HalfService) {
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
      selectedBooks: null,
      editionSelections: null,

      bookOptionsDefaults: new BookOptions()

      });
    }

    BookScraperSession.prototype.fetchShelves = function(handleCompletion, handleFailure) {
      handleCompletion = handleCompletion || angular.noop;
      handleFailure = handleFailure || angular.noop;

      // get shelves for user id using GoodreadsApi
      GoodreadsApi.getShelves(this.goodreadsUserId,
        function successFn(shelves) {
          _.each(shelves, function(shelf) {
            shelf.bookOptions = this.bookOptionsDefaults;
          }, this);
          this.shelves = shelves;
          handleCompletion();
        }.bind(this),
        handleFailure
      );
    };

    BookScraperSession.prototype.fetchShelfBooks = function(handleCompletion, handleFailure) {
      var books = this.books = [],
          defaultOptions = this.bookOptionsDefaults,
          remainingRequests = 0;

      handleCompletion = handleCompletion || angular.noop;
      handleFailure = handleFailure || angular.noop;

      // get book isbns for each shelf using GoodreadsApi
      _.each(this.goodreadsSelectedShelves, function(shelf) {
        remainingRequests++;
        GoodreadsApi.getBooks(
          this.goodreadsUserId,
          shelf.name,
          function successFn(shelf_books) {
            _.each(shelf_books, function(book) {
              var foundBook = _.find(books, {isbn: book.isbn});
              if (book.isbn === null || !foundBook) {
                // add book if not already present
                books.push(new Book(book, shelf.bookOptions));
              } else {
                // use book options for last shelf with non-default options
                if (shelf.bookOptions !== defaultOptions) {
                  foundBook.defaultOptions = shelf.bookOptions;
                  foundBook.options = shelf.bookOptions;
                }
              }
            });
            remainingRequests--;
            if (remainingRequests === 0) {
              handleCompletion();
            }
          },
          function failureFn(response, msg) {
            handleFailure(response, msg);
            remainingRequests--;
            if (remainingRequests === 0) {
              handleCompletion();
            }
          }
        );
      }, this);
    };

    BookScraperSession.prototype.buildIsbnBooks = function(isbns) {
      var options = this.bookOptionsDefaults;

      isbns = _.uniq(isbns);
      this.isbnList = isbns;
      this.books = _.map(isbns, function(isbn) {
        return new Book({isbn: isbn}, options);
      });
      this.selectedBooks = this.books;
    };

    BookScraperSession.prototype.fetchAltEditions = function(handleCompletion, handleFailure) {
      var editions = this.editions = [],
          remainingRequests = 0;

      handleCompletion = handleCompletion || angular.noop;
      handleFailure = handleFailure || angular.noop;

      // get alternate editions for each book
      _.each(this.selectedBooks, function(book) {
        remainingRequests++;
        XisbnApi.getEditions(book.isbn,
          function successFn(book_editions) {
            if (!book.title && book_editions.length) {
              book.title = book_editions[0].title;
              book.author = book_editions[0].author;
            }
            book.editions = _.chain(book_editions).map(function(ed) {
              return new Edition(book, ed);
            }).sortBy(book.editions, function(ed) {
              return ((-Number(ed.year)) || 0);
            }).value();
            Array.prototype.push.apply(editions, book.editions);

            remainingRequests--;
            if (remainingRequests === 0) {
              handleCompletion();
            }
          },
          function failureFn(response, msg) {
            handleFailure(response, msg);
            remainingRequests--;
            if (remainingRequests === 0) {
              handleCompletion();
            }
          }
        );
      }, this);
    };

    BookScraperSession.prototype.fetchListings = function(handleCompletion, handleFailure) {
      var half = HalfService.newQueryBatch(),
          books = this.selectedBooks,
          editions = this.editions,
          selection = this.editionSelections,
          listings = this.listings = [],
          params;

      // get Half.com listings for each edition of each book
      _.each(books, function(book, book_index) {
        book.listings = [];
        _.each(book.editions, function(ed, ed_index) {
          // skip unselected book editions
          if (!selection[book_index][ed_index]) {
            return;
          }

          ed.listings = [];
          params = {
            isbn: ed.isbn,
            page: '1',
            condition: book.options.condition,
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

      // filter undesirable listings
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

      _.each(this.listings, function(listing) {
        var seller = this.findOrCreateSeller(listing.seller, listing);
        seller.addListing(listing);
      }, this);

      _.each(this.sellers, function(seller) {
        seller.sortBooks();
        seller.updateScore();
      });
    };

    BookScraperSession.prototype.getSortedSellers = function() {
      // FUTURE: incorporate price as tiebreaker
      return _.chain(this.sellers)
        .toArray()
        .sortBy(function(seller) {
          return -seller.booksScore;
        }).value();
    };

    var session = new BookScraperSession();

    // ========================================

    function Book(book, options) {
      angular.extend(this, {
        isbn: null,
        title: null,
        author: null,
        editions: null,
        listings: null
      });
      angular.extend(this, book);
      this.defaultOptions = options;
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

    // FUTURE: per-book title search ("rule") options defaults
    // book query options, initialized to defaults
    function BookOptions() {
      angular.extend(this, {
        desirability: 1.0,
        maxprice: 4.00,
        condition: 'Good',
        excludeLibrary: true,
        excludeCliffsNotes: true
      });
    }

    // return a duplicate BookOptions object
    BookOptions.prototype.clone = function() {
      var newOpt = new BookOptions();
      angular.extend(newOpt, this);
      return newOpt;
    };

    // ========================================

    function Edition(book, ed) {
      angular.extend(this, ed);
      this.book = book;
      this.listings = null;
    }

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
      _.each(this.books, function(book) {
        book.sortListings();
      });
      this.books = _.sortBy(this.books, function(sbook) {
        return -sbook.getScore();
      });
    };

    Seller.prototype.updateScore = function() {
      var score = 0.0;
      _.each(this.books, function(book) {
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
      var sellerBookListingsSortKey = function(listing) {
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
    'XisbnApi',
    'HalfService'
  ];

// =============================================================================

  angular.module('ubsApp.bookScraperSession.services', ['ngResource'])
    .factory('BookScraperMaster', BookScraperMaster);

})();
