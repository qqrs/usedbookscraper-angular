'use strict';

/* Controllers */

(function() {

  function MyCtrl1($scope, XisbnService) {

    $scope.altEditions = null;
    $scope.queryISBN =  '9780465067107';
    //$scope.queryISBN =  '0312241356';
    $scope.queryISBNList =  '9780465067107, 0312241356';
    $scope.editionSortKey = function editionSortKey(ed) {
      return ed.year || '0000';
    };


    $scope.submitISBN = function submitISBN(isbn) {
      XisbnService.getEditions(
        {isbn: isbn},
        function(data, status) { 
          $scope.altEditions = mungeXisbnEditions(data.list);
          console.log(data); 
        },
        function(data, status) { console.log('Error: ' + status); }
      );
    };

    $scope.submitISBNList = function submitISBNList(isbnlist) {
      //var isbns = isbnlist.split(',:|\r\n ');
      // split on comma, colon, pipe, or whitespace
      var isbns = isbnlist.split(/[,:|\s]+/);
      console.log(isbns);
    };

  }


  // filter unwanted editions and munge each edition object
  function mungeXisbnEditions(raw_editions) {
    var editions = [];

    angular.forEach(raw_editions, function(ed) {
      // filter to English and book formats (BA=book BB=hardcover BC=paperback)
      if (ed.lang === 'eng' && ed.form[0] && 
          (ed.form[0] === 'BA' || ed.form[0] === 'BB' || ed.form[0] === 'BC')) {
        this.push({
          'isbn':     ed.isbn[0],
          'title':    ed.title,
          'author':   ed.author,
          'lang':     ed.lang,
          'ed':       ed.ed,
          'year':     ed.year
        });
      }
    }, editions);

    console.log(editions);
    return editions;
  }

  /*
    alt_editions = xisbn_get_editions(book.isbn)
      .select {|e| e.lang == "eng" && 
        e.form && e.form.any? {|f| %w'BA BB BC'.include?(f) } }
      .sort_by{|e| e.year || "9999" }.reverse

    alt_editions.each do |alt_ed|
      edition = book.editions.where(isbn: alt_ed.isbn.first).first_or_create(
          isbn:     (alt_ed.isbn.first || "")[0,255],
          title:    (alt_ed.title || "")[0,255],
          author:   (alt_ed.author || "")[0,255],
          language: (alt_ed.lang || "")[0,255],
          ed:       (alt_ed.ed || "")[0,255],
          published_date:   (alt_ed.year || "")[0,255]
      )
    end
  */


  function MyCtrl2() {

  }

  MyCtrl1.$inject = [
    '$scope',
    'XisbnService'
  ];

  MyCtrl2.$inject = [
  ];

  angular.module('myApp.controllers', ['ngResource'])
    .controller('MyCtrl1', MyCtrl1)
    .controller('MyCtrl2', MyCtrl2);
})();
