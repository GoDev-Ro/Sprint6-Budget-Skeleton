var app = angular.module('app', ['ngRoute']);
var transactionDefault = {
    date: "",
    description: "",
    amount: ""
};

app.config(function ($routeProvider) {
    $routeProvider.when("/",
        {
            templateUrl: "balanceBody.html",
            controller: "BalanceTableCtrl",
            controllerAs: "app"
        }
        )
        .when("/spend",
            {
                templateUrl: "spend.html",
                controller: "SpendCtrl",
                controllerAs: "app"
            }
        )
        .when("/receive",
            {
                templateUrl: "receive.html",
                controller: "ReceiveCtrl",
                controllerAs: "app"
            }
        )
        .when("/cancel",
            {
                templateUrl: "balanceBody.html",
                controller: "BalanceTableCtrl",
                controllerAs: "app"
            }
        )
        .when("/income",
            {
                templateUrl: "incomeBody.html",
                controller: "BalanceTableCtrl",
                controllerAs: "app"
            }
        )
        .when("/spendings",
            {
                templateUrl: "spendingsBody.html",
                controller: "BalanceTableCtrl",
                controllerAs: "app"
            }
        )
});

app.controller('BalanceTableCtrl', function ($scope) {
    $scope.transactions = [
        {
            "description": "Cina in oras",
            "amount": -80,
            "date": "2016-02-02 21:34",
            "id": 0
        },
        {
            "description": "Intretinere",
            "amount": -250,
            "date": "2016-02-02 17:43",
            "id": 1
        },
        {
            "description": "Salariu",
            "amount": 2500,
            "date": "2016-02-01 10:00",
            "id": 2
        }
    ];
    $scope.balance = 2170;
});

app.controller('ReceiveCtrl', function ($scope, $http) {
    $scope.newTransaction = transactionDefault;
    $scope.add = function () {
        $http({
            method: 'POST',
            url: 'http://server.godev.ro:8080/api/razvan/transactions/2016-02',
            data: $scope.newTransaction
        }).then(function () {
            $scope.newTransaction = transactionDefault;
        });
    };
});

app.controller('SpendCtrl', function ($scope, $http) {
    $scope.newTransaction = transactionDefault;
    $scope.add = function () {
        $scope.newTransaction.amount = -$scope.newTransaction.amount;
        $http({
            method: 'POST',
            url: 'http://server.godev.ro:8080/api/razvan/transactions/2016-02',
            data: $scope.newTransaction
        }).then(function () {
            $scope.newTransaction = transactionDefault;
        });
    };
});

