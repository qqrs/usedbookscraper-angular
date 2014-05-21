'use strict';

/* Services */

(function() {

  //TODO: make sure this gets reset to defaults when starting over
  function BookScraperMaster(HalfService) {
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
    'HalfService'
  ];

// =============================================================================

  angular.module('ubsApp.services', ['ngResource'])
    .factory('BookScraperMaster', BookScraperMaster);

})();
