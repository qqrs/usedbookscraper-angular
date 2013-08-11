'use strict';

/* Controllers */

(function() {

  function MyCtrl1($scope, XisbnService) {

    $scope.altEditions = null;
    $scope.queryISBN =  '9780465067107';

    $scope.submitISBN = function submitISBN() {
      XisbnService.getEditions(
        {isbn: $scope.queryISBN},
        function(data, status) { 
          $scope.altEditions = mungeXisbnEditions(data.list);
          console.log(data); 
        },
        function(data, status) { console.log('Error: ' + status); }
      );
    };

  }


  function mungeXisbnEditions(raw_editions)
  {
    var editions = [];

    var counter = 0;
    angular.forEach(raw_editions, function(ed) {
      if (counter++ % 2 == 0)
        return;
        this.push({
          'isbn':     ed.isbn[0],
          'title':    ed.title,
          'author':   ed.author,
          'language': ed.lang,
          'ed':       ed.ed,
          'published_date': ed.year
        });
    }, editions);

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
