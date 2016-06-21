(function(angular){
    var app = angular.module('puzzle15', ['ngRoute']);

    app.config(function($routeProvider) {
        $routeProvider.
        when('/game', {
            templateUrl: 'templates/game.html',
            controller: 'GameController as gameCtrl'
        }).
        when('/leaderboard', {
            templateUrl: 'templates/leaderboard.html',
            controller: 'LeaderBoardController as lbCtrl'
        }).
        otherwise({
            redirectTo: '/game'
        });
    });

    /*
     * GameController
     * the controller for Game tab
     * handles the game's state and controls
     */
    app.controller('GameController', ['$scope', '$interval', 'leaderboardStorage', function($scope, $interval, lbStorage) {
        var stop,
            reset = win => {
                this.stateGame = 'Start Game';
                this.duration = 0;
                this.state = 'off';
                !win && (this.win_visible = false);
            };

        reset();
        $scope.$emit('nav', 'game');

        this.startGame = () => {
            if(this.state == 'off'){
                this.stateGame = 'Stop Game';
                this.state = 'on';
                this.win_visible = false;
                $scope.$broadcast('start');

                // listener for win events from puzzle directive
                $scope.$on('win', () => {
                    if(this.state == 'off') return;

                    this.win_visible = true;
                    lbStorage.set({
                        date: new Date(),
                        duration: this.duration
                    });

                    reset(true);
                    $scope.$broadcast('init');
                });

                stop = $interval(() => { this.duration += 1000; }, 1000);
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
    }]);

    /*
     * LeaderBoardController
     * the controller for LeaderBoard tab
     * retrieves data about wins from localStorage
     */
    app.controller('LeaderBoardController', ['$scope', 'leaderboardStorage', function($scope, lbStorage) {
        $scope.$emit('nav', 'leaderboard');
        this.wins = lbStorage.get();
    }]);
})(window.angular);
