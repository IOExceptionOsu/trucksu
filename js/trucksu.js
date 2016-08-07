var app = angular.module("trucksu", [ "ngRoute" ]);
var $http = angular.injector([ "ng" ]).get("$http");

var authToken;

app.config([
	'$compileProvider',
	function($compileProvider) {
		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|osu):/);
	}
])

app.factory('logout', function () {
	return function () {
		localStorage.removeItem("authToken");
		location.href = "/";
	}
});

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
});

app.filter("difficultyImage", function() {
	return function(stars) {
		if (stars < 1.5) return "easy";
		if (stars < 2.25) return "normal";
		if (stars < 3.75) return "hard";
		if (stars < 5.25) return "insane";
		return "expert";
	}
});

app.filter("timeFormat", function() {
	return function(seconds) {
		var hours = Math.floor(seconds / 3600);
		seconds %= 3600;
		var minutes = Math.floor(seconds / 60);
		seconds %= 60;
		var str = "";
		if (hours > 0) {
			str += hours + ":";
			if (minutes < 10) minutes = "0" + minutes;
		}
		return str + minutes + ":" + seconds;
	}
});

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
		.when("/beatmap/:id", {
			"redirectTo": function(routeParams) {
				return "/b/" + routeParams.id;
			}
		})
		.when("/b/:id", {
			"templateUrl": "/pages/beatmappage.html",
			"controller": "beatmapController",
			"resolve": {
				"info": function($route) {
					return $http({ "url": "https://api.trucksu.com/v1/beatmapsets?beatmap_id=" + $route.current.params.id }).then(function(result) { return result.data });
				}
			}
		})
		.when("/login", {
			"templateUrl": "/pages/login.html",
			"controller": "loginController",
		})
		.when("/logout", {
			"resolve": {
				"logout": ["logout", function(logout) {
					logout();
				}]
			}
		})
		.when("/register", {
			"templateUrl": "/pages/register.html",
			"controller": "mainController",
		})
		.when("/user/:id", {
			"redirectTo": function(routeParams) {
				return "/u/" + routeParams.id;
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

app.controller("mainController", function($scope, $rootScope) {
	$rootScope.user = { "logged_in": undefined };
	if (authToken = localStorage.getItem("authToken")) {
		var handler = function(response) {
			if (response.status == 200) {
				response.data.logged_in = true;
				$rootScope.user = response.data;
			} else {
				$rootScope.user = { "logged_in": false };
			}
			$rootScope.$apply();
		}
		$http({
			"method": "GET",
			"url": "https://api.trucksu.com/v1/current-user",
			"headers": { "Authorization": authToken }
		}).then(handler, handler);
	} else {
		$rootScope.user = { "logged_in": false };
	}
});

app.controller("loginController", function($scope, $controller) {
	$controller("mainController", { $scope: $scope });
	$scope.formData = {};
	$scope.login = function() {
		var handler = function(response) {
			console.log(response);
			if (response.status != 201 && response.data.error) {
				$scope.error = response.data.error;
				$scope.$apply();
			} else {
				if (response.data.jwt) {
					localStorage.setItem("authToken", response.data.jwt);
					location.href = "/u/" + response.data.user.id;
				}
			}
		};
		$http({
			"method": "POST",
			"url": "https://api.trucksu.com/v1/sessions",
			"data": { "session": $scope.formData }
		}).then(handler, handler);
	};
});

app.controller("leaderboardController", function($scope, $controller, leaderboard) {
	$controller("mainController", { $scope: $scope });
	$scope.leaderboard = leaderboard;
});

app.controller("profileController", function($scope, $controller, info) {
	$controller("mainController", { $scope: $scope });
	$scope.info = info;
});

app.controller("beatmapController", function($scope, $controller, info) {
	$controller("mainController", { $scope: $scope });
	$scope.info = info;
	$scope.current_bid = parseInt(window.location.pathname.split("/")[2]);
	$scope.Math = window.Math;
});