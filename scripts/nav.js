(function(app){
    /*
     * navPuzzle
     * builds and handles the navigation menu
     */
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
})(window.angular.module('puzzle15'));

