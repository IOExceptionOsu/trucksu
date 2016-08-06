var app = angular.module("trucksu", [ "ngRoute" ]);
var $http = angular.injector([ "ng" ]).get("$http");

app.filter("mods", function() {
	return function(curMods) {
		const modMap = [
			['NF', 1],
			['EZ', 2],
			['HD', 8],
			['HR', 16],
			['SD', 32],
			['DT', 64],
			['RX', 128],
			['HT', 256],
			['NC', 512],
			['FL', 1024],
			['AU', 2048],
			['SO', 4096],
			['AP', 8192],
			['PF', 16384],
			// Where is SD?
		];
		if (curMods & 512) curMods -= 64;
		if (curMods & 16384) curMods -= 32;
		const mods = [];
		for (let i = modMap.length - 1; i >= 0; i--) {
			const arr = modMap[i];
			const mod = arr[0];
			const val = arr[1];
			if (curMods & val) mods.push(mod);
		}

		mods.reverse();
		return (mods.length > 0 ? "+" : "") + mods.join(",");
	}
});

app.filter("weight", function() {
	return function(base, index) {
		return base * Math.pow(0.95, index);
	}
});

app.filter("ordinal", function() {
	return function(n) {
		return n + ([,'st','nd','rd'][~~(n/10%10)-1?n%10:0]||'th')
	}
})

app.config(function($routeProvider, $locationProvider) {
	$routeProvider
		.when("/", {
			"templateUrl": "/pages/leaderboard.html",
			"controller": "leaderboardController",
			"resolve": {
				"leaderboard": function() {
					return $http({ "url": "https://api.trucksu.com/v1/ranks" }).then(function(result) { return result.data; });
				}
			}
		})
		.when("/user/:id", {
			"redirectTo": function(routeParams) {
				return "/u/" + routeParams.id
			}
		})
		.when("/u/:id", {
			"templateUrl": "/pages/userpage.html",
			"controller": "profileController",
			"resolve": {
				"info": function($route) {
					return $http({ "url": "https://api.trucksu.com/v1/users/" + $route.current.params.id }).then(function(result) { return result.data; });
				}
			}
		})
		.otherwise({
			"templateUrl": "/pages/404.html",
			"controller": "mainController"
		});
	$locationProvider.html5Mode(true);
});

app.controller("mainController", function() {
	// todo
});

app.controller("leaderboardController", function($scope, leaderboard) {
	$scope.leaderboard = leaderboard;
});

app.controller("profileController", function($scope, info) {
	$scope.info = info;
	$(".timeago").timeago();
});