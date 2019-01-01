// BUDGET CONTROLLER
var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calculatePercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round(this.value / totalIncome * 100);
        }
        else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) {
            sum += current.value;
        });
        data.total[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function (type, desc, val) {
            var newItem, id;

            // create new ID
            if (data.allItems[type] > 0)
                id = data.allItems[type][data.allItems.length - 1].id + 1;
            else
                id = 0;


            // create new item
            if (type === "exp") {
                newItem = new Expense(id, desc, val);
            }
            else {
                newItem = new Income(id, desc, val);
            }

            // add new item to the list of item
            data.allItems[type].push(newItem);
            return newItem;
        },

        calculateBudget: function () {
            // calculate income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget
            data.budget = data.total['inc'] - data.total['exp'];

            // calculate the percentage of budget in expenses
            if (data.total.inc > 0)
                data.percentage = Math.round(data.total['exp'] / data.total['inc'] * 100);
            else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {

            data.allItems.exp.forEach(function (cur) {
                cur.calculatePercentage(data.total.inc);
            });

        },

        getPercentages: function () {
            var allPercentages = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            })
            return allPercentages;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                percentage: data.percentage
            }
        },

        deleteItem: function (type, id) {
            var ids, index;
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        testing: function () {
            console.log(data);
        }
    }

})()


// UI CONTROLLER
var UIController = (function () {

    var DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputButton: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetValue: ".budget__value",
        incomeValue: ".budget__income--value",
        expensesValue: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercentageLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    };

    var formatNumber = function (num, type) {

        var int, decimal, tmpInt;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        decimal = numSplit[1];

        tmpInt = int;
        int = "";
        while (tmpInt.length > 3) {
            int = tmpInt.substr(tmpInt.length - 3, 3) + int;
            tmpInt = tmpInt.substr(0, tmpInt.length - 3);
            console.log(int);
            console.log(tmpInt);
            if (tmpInt.length > 0) {
                int = "," + int;
            }
        }
        int = tmpInt + int;

        console.log((type == 'inc' ? '+' : '-') + ' ' + int + '.' + decimal);
        return (type == 'inc' ? '+' : '-') + ' ' + int + '.' + decimal;
    };

    var nodeListForEach = function (list, callback) {

        for (var i = 0; i < list.length; ++i) {
            callback(list[i], i);
        }

    }

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem: function (object, type) {
            // create the HTML element with placeholder tag
            var html, newHtml, element;
            if (type === "inc") {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description"  >%description%</div ><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div >';
            }

            else {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description" > %description%</div ><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder tag with some data
            newHtml = html.replace("%id%", object.id);
            console.log(object.description);
            newHtml = newHtml.replace("%description%", object.description);
            newHtml = newHtml.replace("%value%", formatNumber(object.value, type));

            // Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
        },

        deleteListItem: function (selectorID) {

            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);

        },

        getDOMstrings: function () {
            return DOMstrings;
        },

        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function (budgetObj) {
            document.querySelector(DOMstrings.budgetValue).textContent = formatNumber(budgetObj.budget, budgetObj.budget > 0 ? 'inc' : 'exp');
            document.querySelector(DOMstrings.incomeValue).textContent = formatNumber(budgetObj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesValue).textContent = formatNumber(budgetObj.totalExp, 'exp');
            if (budgetObj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = budgetObj.percentage + "%";
            }
            else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";
            }
        },

        displayPercentage: function (percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            nodeListForEach(fields, function (current, index) {

                if (percentages[index] <= 0) {
                    current.textContent = "---";
                }
                else
                    current.textContent = percentages[index] + "%";

            });

        },

        displayMonth: function () {

            var now = new Date();

            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            document.querySelector(DOMstrings.dateLabel).textContent = months[now.getMonth()] + ' ' + now.getFullYear();

        },

        changeType: function () {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ", " +
                DOMstrings.inputDescription + ", " +
                DOMstrings.inputValue
            );

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle("red-focus");
            });

            document.querySelector(DOMstrings.inputButton).classList.toggle("red");

        }

    }
})()


// APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    var DOM = UICtrl.getDOMstrings();

    var setUpEventListeners = function () {
        document.querySelector(DOM.inputButton).addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function (e) {
            if (e.keyCode == 13 || e.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changeType);
    }

    function updateBudget() {

        // 1. Calcucalate the budget
        budgetController.calculateBudget();

        var budget = budgetController.getBudget();

        // 2. Display the budget
        UICtrl.displayBudget(budget);

    }

    function ctrlAddItem() {
        var input, newItem;

        // 1. Get the input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. Add to the budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);

            // 3. Add to the UI controller
            UICtrl.addListItem(newItem, input.type);

            // Clear the fields
            UICtrl.clearFields();

            // 4. Update the budget
            updateBudget();

            // Calculate and update the percentages
            updatePercentages();

        }
    }

    function ctrlDeleteItem(event) {
        var itemID, splitID, type, id;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            splitID = itemID.split('-');
            type = splitID[0];
            id = splitID[1];
            id = parseInt(id);
            console.log(splitID);
            console.log(id);

            // deleting items
            budgetCtrl.deleteItem(type, id);

            // update the UI
            UICtrl.deleteListItem(itemID);

            // update and show the budget
            updateBudget();

            // Calculate and update the percentages
            updatePercentages();

        }

    }

    function updatePercentages() {

        var percentages;

        // calculate the budget
        budgetCtrl.calculatePercentages();

        // read from the budget controller
        percentages = budgetCtrl.getPercentages();

        // update the UI
        UICtrl.displayPercentage(percentages);

    }

    return {
        init: function () {
            console.log("Event has started");
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setUpEventListeners();
            UICtrl.displayMonth();
        }
    }

})(budgetController, UIController)

controller.init();