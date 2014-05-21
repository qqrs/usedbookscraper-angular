'use strict';

/* Services */

(function() {

  //TODO: make sure this gets reset to defaults when starting over
  function BookScraperMaster() {
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

    function SellerBook(book) {
      this.book = book;
      this.listings = [];
      //bestListing: listing
    }

    return session;

  }

  BookScraperMaster.$inject = [
  ];

// =============================================================================

  angular.module('ubsApp.services', ['ngResource'])
    .factory('BookScraperMaster', BookScraperMaster);

})();
