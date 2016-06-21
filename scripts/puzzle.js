(function(app){
    /*
     * puzzle
     * builds and handles the game
     */
    app.directive('puzzle', ['$document', function($document){
        var firsttime = true;

        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/table.html',
            link: function (scope, element, attrs) {
                var rows, cols,
                    background =
                        'background-image: url(' + attrs.image + '); ' +
                        'background-size: ' + attrs.size + '; ' +
                        'background-position: ';

                attrs.$observe('dimensions', function(size) {
                    size = size.split('-');
                    if (size[0] > 1 && size[1] > 1) {
                        rows = size[0];
                        cols = size[1];

                        scope.puzzle = (function(){
                            return {
                                tiles: [],
                                size: attrs.size,
                                move: function(row, col, shuffle) {
                                    var step, x, r, c;

                                    for (var s = 0; s < 4; s++) {
                                        step = [[-1, 0], [0, -1], [0, 1], [1, 0]][s];
                                        r = row + step[0];
                                        c = col + step[1];

                                        if (this.tiles[r] && this.tiles[r][c] && this.tiles[r][c].empty) {
                                            x = this.tiles[row][col];
                                            this.tiles[row][col] = this.tiles[r][c];
                                            this.tiles[r][c] = x;
                                        }
                                    }

                                    !shuffle && this.success();
                                },
                                shuffle: function() {
                                    for (var i = 0, r, c, l = rows * cols * 100; i < l; i++) {
                                        r = parseInt(Math.random() * rows, 10);
                                        c = parseInt(Math.random() * cols, 10);
                                        this.move(r, c, true);
                                    }
                                },
                                success: function() {
                                    var id = 1;
                                    for (var r = 0; r < rows; r++) {
                                        for (var c = 0; c < cols; c++) {
                                            if (this.tiles[r][c].id !== id++) {
                                                return;
                                            }
                                        }
                                    }
                                    scope.$emit('win');
                                },
                                init: function(){
                                    var id = 1,
                                        size = parseInt(attrs.size, 10),
                                        w = size/cols, h = size/rows,
                                        empty, r, c;

                                    this.tiles = [];

                                    for (r = 0; r < rows; r++) {
                                        for (c = 0; c < cols; c++) {
                                            empty = (r == rows - 1) && (c == cols - 1);
                                            !this.tiles[r] && (this.tiles[r] = []);
                                            this.tiles[r][c] = {
                                                id: id++,
                                                empty: empty,
                                                bg: empty ? '' : background + (-1 * c * w) + 'em ' + (-1 * r * h) + 'em;'
                                            };
                                        }
                                    }

                                    // listening key events
                                    firsttime && $document.on('keydown', function (e) {
                                        var step = [[0, 1], [1, 0], [0, -1], [-1, 0]][e.keyCode - 37],
                                            empty = element[0].querySelector('.empty'),
                                            row = parseInt(empty.getAttribute('data-row'), 10),
                                            col = parseInt(empty.getAttribute('data-col'), 10),
                                            el;

                                        if(typeof step == 'undefined') return;

                                        row += step[0]; col += step[1];
                                        el = element[0].querySelector('[data-row="' + row + '"][data-col="' + col + '"]');
                                        el && el.click();
                                    });
                                    firsttime = false;

                                    scope.$emit('initPuzzle');
                                }
                            };
                        })();

                        scope.$on('start', function(){
                            scope.puzzle.shuffle();
                        });
                        scope.$on('init', function(){
                            scope.puzzle.init();
                        });

                        scope.puzzle.init();
                    }
                });
            }
        };
    }]);
})(window.angular.module('puzzle15'));
