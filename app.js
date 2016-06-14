(function(angular){
    var app = angular.module('puzzle15', ['ngRoute']);

    app.config(function($routeProvider) {
        $routeProvider.
        when('/game', {
            templateUrl: 'templates/game.html',
            controller: 'GameController'
        }).
        when('/leaderboard', {
            templateUrl: 'templates/leaderboard.html',
            controller: 'LeaderBoardController'
        }).
        otherwise({
            redirectTo: '/game'
        });
    });

    app.controller('GameController', ['$scope', '$interval', 'leaderboardStorage', function($scope, $interval, lbStorage) {
        var stop;

        reset();
        $scope.$emit('nav', 'game');
        
        $scope.startGame = function(){
            if($scope.state == 'off'){
                $scope.stateGame = 'Stop Game';
                $scope.state = 'on';
                $scope.win_visible = false;
                $scope.$broadcast('start');

                $scope.$on('win', function () {
                    if($scope.state == 'off') return;

                    $scope.win_visible = true;
                    lbStorage.set({
                        date: new Date(),
                        duration: $scope.duration
                    });

                    reset(true);
                    $scope.$broadcast('init');
                });

                stop = $interval(function(){ $scope.duration += 1000; }, 1000);
            } else {
                reset();
                $interval.cancel(stop);
                $scope.$broadcast('init');
            }
        };

        $scope.$on('initPuzzle', function(){
            reset(true);
            stop && $interval.cancel(stop);
        });

        function reset(win){
            $scope.stateGame = 'Start Game';
            $scope.duration = 0;
            $scope.state = 'off';
            !win && ($scope.win_visible = false);
        }
    }]);
    
    app.controller('LeaderBoardController', ['$scope', 'leaderboardStorage', function($scope, lbStorage) {
        $scope.$emit('nav', 'leaderboard');
        $scope.wins = lbStorage.get();
    }]);

    app.directive('navPuzzle', function(){
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/menu.html',
            link: function(scope){
                scope.menu = [
                    { href: 'game', text: 'Puzzle Game', active: 'active' },
                    { href: 'leaderboard', text: 'Leader Board', active: '' }
                ];

                scope.$on('nav', function(e, link){
                    for(var i = 0, l = scope.menu.length; i < l; i++){
                        var x = scope.menu[i];
                        x.active = x.href == link ? 'active' : '';
                    }
                })
            }
        };
    });

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
                                move: function(row, col) {
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

                                    this.success();
                                },
                                shuffle: function() {
                                    var tiles = [], r, c, x;

                                    for (r = 0; r < rows; r++) {
                                        for (c = 0; c < cols; c++) {
                                            tiles.push(this.tiles && this.tiles[r] ? this.tiles[r][c] : void(0));
                                        }
                                    }

                                    for (var j, i = tiles.length; i > 0;) {
                                        j = parseInt(Math.random() * i, 10);
                                        x = tiles[--i]; tiles[i] = tiles[j]; tiles[j] = x;
                                    }

                                    for (r = 0; r < rows; r++) {
                                        for (c = 0; c < cols; c++) {
                                            this.tiles[r][c] = tiles.shift();
                                        }
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

    app.factory('leaderboardStorage', ['$window', function($window){
        var lb;
        return {
            set: function(o){
                lb = this.get();
                lb.push(o);
                $window.localStorage.setItem('leaderboard', JSON.stringify(lb));

            },
            get: function(){
                lb = $window.localStorage.getItem('leaderboard');
                return lb ? JSON.parse(lb) : [];
            }
        };
    }]);

    app.filter('utc', function() {
        return function(date) {
            if(angular.isNumber(date)) {
                date = new Date(date);
            }
            return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        }
    });
})(window.angular);
