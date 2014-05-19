'use strict';

/* Services */

(function() {

  //TODO: make sure this gets reset to defaults when starting over
  function BookScraperMaster() {
    return {
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
    };
  }

  BookScraperMaster.$inject = [
  ];

// =============================================================================

  angular.module('ubsApp.services', ['ngResource'])
    .factory('BookScraperMaster', BookScraperMaster);

})();
