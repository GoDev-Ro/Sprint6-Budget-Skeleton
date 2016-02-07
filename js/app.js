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
    var minFilter = -9999999999;
    var maxFilter = +9999999999;

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
        $scope.last6Months = [];
        TransactionStore.getTransactionsInMonth(moment().format("YYYY-MM"), $scope);

        $scope.deleteTransaction = function (id, date) {
            var localMonth = moment(date).format("MM");
            var localYear = moment(date).format("YYYY");
            TransactionStore.delete(id).then(function () {
                $scope.balance = 0;
                TransactionStore.getTransactionsInMonth(localYear+'-'+localMonth, $scope);
            });
        };
        $scope.setMinMaxFilter = function (min, max) {
            minFilter = min;
            maxFilter = max;
        };
        $scope.getMinFilter = function () {
            return minFilter;
        };
        $scope.getMaxFilter = function () {
            return maxFilter;
        };
        $scope.changeBalanceByFilter = function () {
            $scope.balance = 0;

            if((minFilter != 0)&&(maxFilter == 0)) {
                angular.forEach($scope.transactions, function (data) {
                    if (data.amount < 0){
                        $scope.balance += data.amount;
                    }
                });
                $scope.balance = Math.abs($scope.balance);
            } else if ((minFilter < 0)&&(maxFilter > 0)) {
                angular.forEach($scope.transactions, function (data) {
                    if (data.amount){
                        $scope.balance += data.amount;
                    }
                });
            } else if ((maxFilter!= 0)&&(minFilter == 0)) {
                angular.forEach($scope.transactions, function (data) {
                    if (data.amount > 0){
                        $scope.balance += data.amount;
                    }
                });
            }
        };

        $scope.getCurrentMonth = function () {
            return moment().format("M");
        };
        $scope.getCurrentYear = function () {
            return moment().format("YYYY");
        };
        $scope.setLast6Months = function (month, year) {
            var localMonth = parseInt(month);
            var localYear = parseInt(year);
            $scope.last6Months = [];
            $scope.last6Months.push({month: localMonth, year: localYear});
            for(var i = 0; i<5; i++){
                if(localMonth > 1) {
                    localMonth --;
                } else {
                    localMonth = 12;
                    localYear -= 1;
                }
                $scope.last6Months.push({month: localMonth, year: localYear});
            }
        };
        $scope.getNextMonths = function () {
            var localMonth = $scope.last6Months[1].month;
            var localYear = $scope.last6Months[1].year;
            $scope.setLast6Months(localMonth, localYear);
        };
        $scope.getPreviousMonths = function () {
            var localMonth = $scope.last6Months[0].month;
            var localYear = $scope.last6Months[0].year;
            if(((moment().format('YYYY')>localYear))){
                if(localMonth == 12){
                    localMonth = 1;
                    localYear++;
                } else {
                    localMonth++;
                }
                $scope.setLast6Months(localMonth, localYear);
            } else if (moment().format('YYYY') == localYear) {
                if(moment().format('M')>localMonth){
                    localMonth++;
                }
                $scope.setLast6Months(localMonth, localYear);
            }
        };
        $scope.setTableByMonth = function (month, year) {
            var date = year;
            if(month < 10) {
                date = date+'-0'+month;
            } else {
                date = date+'-'+month;
            }
            $scope.balance = 0;
            TransactionStore.getTransactionsInMonth(date, $scope);
        };
        $scope.setLast6Months($scope.getCurrentMonth(), $scope.getCurrentYear());
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

    //create filters

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

