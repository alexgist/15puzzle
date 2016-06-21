(function(app){
    /*
     * leaderboardStorage
     * saves and retrieves the data about wins in localStorage
     */
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

    /*
     * UTC filter for date
     */
    app.filter('utc', function() {
        return function(date) {
            if(angular.isNumber(date)) {
                date = new Date(date);
            }
            return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        }
    });
})(window.angular.module('puzzle15'));
