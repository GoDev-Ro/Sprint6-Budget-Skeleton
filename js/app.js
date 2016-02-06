(function () {
    var app = angular.module('app', ['ngRoute']);
    var transactionDefault = {
        date: "",
        description: "",
        amount: ""
    };
    var pages = [
        {name: 'Balance', url: ''},
        {name: 'Receive', url: 'receive'},
        {name: 'Spend', url: 'spend'},
    ];
    var minFilter = -Infinity;
    var maxFilter = +Infinity;

    app.config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

        angular.forEach(pages, function (page) {
            $routeProvider.when('/' + page.url, {
                templateUrl: 'pages/' + (!page.url ? 'index' : page.url) + '.html'
            })
        });

        $routeProvider.otherwise({
            templateUrl: 'pages/index.html'
        });
    });

//create controllers
    app.controller('BalanceTableCtrl', function ($scope, TransactionStore) {
        $scope.transactions = [];
        $scope.balance = 0;
        TransactionStore.getTransactionsInMonth("2016-02", $scope);

        $scope.deleteTransaction = function (id) {
            TransactionStore.delete(id).then(function () {
                $scope.balance = 0;
                TransactionStore.getTransactionsInMonth("2016-02", $scope);
            });
        };
        $scope.setMinMaxFilter = function (min, max) {
            minFilter = min;
            maxFilter = max;
        };
    });

    app.controller('ReceiveCtrl', function ($scope, TransactionStore) {
        $scope.newTransaction = transactionDefault;
        $scope.addTrans = function () {
            TransactionStore.add($scope.newTransaction).then(function () {
                $scope.newTransaction.amount = "" ;
                $scope.newTransaction.description = "" ;
                $scope.newTransaction.date = "" ;
            });
        };
    });

    app.controller('SpendCtrl', function ($scope, TransactionStore) {
        $scope.newTransaction = transactionDefault;
        $scope.addTrans = function () {
            $scope.newTransaction.amount = -$scope.newTransaction.amount;
            TransactionStore.add($scope.newTransaction).then(function () {
                $scope.newTransaction.amount = "" ;
                $scope.newTransaction.description = "" ;
                $scope.newTransaction.date = "" ;
            });
        };
    });

    //create filter

    app.filter('amount', function () {
        return function (transactions) {
            transactions = transactions.filter(function (transaction) {
                return transaction.amount > minFilter && transaction.amount < maxFilter;
            });
            return transactions;
        };
    });

    //create services
    app.factory('TransactionStore', function($http, $q) {
        return (function() {
            var URL = 'http://server.godev.ro:8080/api/razvan/transactions';

            var getTransactionsInMonth = function(month, $scope) {
                return $q(function(resolve, reject) {
                    $http({url: URL + '?month=' + month})
                        .then(
                            function(xhr) {
                                if (xhr.status == 200) {
                                    $scope.transactions = xhr.data;
                                    angular.forEach(xhr.data, function (data) {
                                        $scope.balance += data.amount;
                                    });
                                    resolve(xhr.data);
                                } else {
                                    reject();
                                }
                            },
                            reject
                        );
                });
            };

            var add = function(data) {
                return $q(function(resolve, reject) {
                    $http({
                        url: URL,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: JSON.stringify(data)
                    })
                        .then(
                            function(xhr) {
                                if (xhr.status == 201) {
                                    resolve(xhr.data);
                                } else {
                                    reject();
                                }
                            },
                            reject
                        );
                });
            };

            var del = function(id) {
                return $q(function(resolve, reject) {
                    $http({
                        url: URL + '/' + id,
                        method: 'DELETE'
                    })
                        .then(
                            function(xhr) {
                                if (xhr.status == 204) {
                                    resolve();
                                } else {
                                    reject();
                                }
                            },
                            reject
                        );
                });
            };

            return {
                getTransactionsInMonth: getTransactionsInMonth,
                add: add,
                delete: del
            };
        })();
    });
})();

