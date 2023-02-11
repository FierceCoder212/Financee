timePeriod = ["Weekly", "Fortnightly", "Monthly", "Quaterly", "Half Yearly", "Yearly"];
banks = []
inputFieldText = '<input type="text" name="incomeSource" value="">';
inputFieldNumber = '<input type="number" name="incomeSource" value="0.00">';
currencyLabel = '<span class="currency">$</span>';
checkBox = '<input type="checkbox" name="toDelete" value="false">';
textArea = '<textarea rows="1"></textarea>';

function getDropBox(list) {
  tagOpening = '<select name="dropBox">';
  tagEnding = '</select>';
  data = ''
  for (var i = 0; i < list.length; i++) {
    data += '<option value=' + list[i] + '>' + list[i] + '</option>';
  }
  return tagOpening + data + tagEnding;
}

function getYearlyAmount(period, amount) {
  var yearly = 0.0;
  if (period == 'Weekly') {
    yearly = 52 * amount;
  } else if (period == 'Fortnightly') {
    yearly = 26 * amount;
  } else if (period == 'Monthly') {
    yearly = 12 * amount;
  } else if (period == 'Quaterly') {
    yearly = 4 * amount;
  } else if (period == 'Half') {
    yearly = 2 * amount;
  } else {
    yearly = amount;
  }
  return yearly;
}

function validateNumber(number) {
  return Number.isNaN(number) || !Number.isFinite(number) ? 0 : number;
}

function recalculateExpense() {
  var expenseTables = document.querySelectorAll('#expense-tab table');
  var totalIncome = validateNumber(parseFloat(document.querySelector('#income-tab table tfoot input').value));
  var totalSum = 0;
  var totalExpense = 0;
  expenseTables.forEach(function(expenseTable, index, expenseTables) {
    if (index != expenseTables.length - 1) {
      var rows = expenseTable.querySelectorAll('tbody tr');
      var expenseSum = 0;
      var sum = 0;
      for (var j = 0; j < rows.length; j++) {
        var yearlyExpense = validateNumber(parseFloat(rows[j].cells[7].innerHTML.replace("$", "")));
        var percentExpense = validateNumber(yearlyExpense / totalIncome * 100);
        rows[j].cells[7].innerHTML = "$" + yearlyExpense.toFixed(2);
        rows[j].cells[8].innerHTML = "%" + percentExpense.toFixed(2);
        sum += percentExpense;
        expenseSum += yearlyExpense;
      }
      expenseTab.chartYValues[index] = parseFloat(validateNumber(sum).toFixed(2));
      totalSum += validateNumber(sum);
      totalExpense += validateNumber(expenseSum);
      expenseTable.querySelectorAll('tfoot td')[0].innerHTML = "$" + validateNumber(expenseSum).toFixed(2);
      expenseTable.querySelectorAll('tfoot td')[1].innerHTML = "%" + validateNumber(sum).toFixed(2);
    }
  })
  Array.from(expenseTables).at(-1).querySelectorAll('tfoot td')[0].innerHTML = "$" + totalExpense.toFixed(2);
  Array.from(expenseTables).at(-1).querySelectorAll('tfoot td')[1].innerHTML = "%" + totalSum.toFixed(2);
  expenseTab.createNewChart();
}

function recalculateTransfers() {
  var transfersRows = document.querySelectorAll('#transfers-tab table tbody tr');
  var transfersfoot = document.querySelector('#transfers-tab table tfoot');
  var expenseTables = document.querySelectorAll('#expense-tab table');
  var totalExpense = validateNumber(parseFloat(document.querySelector('#expense-tab .total tfoot td').innerHTML.replace("$", "")));
  var periodSum = 0;
  var totalSum = 0;
  transfersRows.forEach(transferRow => {
    var bankRow = transferRow.rowIndex - 1;
    var yearlySum = 0;
    expenseTables.forEach(expenseTable => {
      var expenseRows = expenseTable.querySelectorAll('tbody tr');
      expenseRows.forEach(expenseRow => {
        var select = expenseRow.cells[6].querySelector('select');
        var selectedBank = select.selectedIndex;
        if (selectedBank == bankRow) {
          yearlySum += validateNumber(parseFloat(expenseRow.cells[7].innerHTML.replace("$", "")));
        }
      })
    })
    Array.from(transferRow.cells).at(-1).innerHTML = "$" + yearlySum.toFixed(2);
    var period = transferRow.querySelector('select').options[transferRow.querySelector('select').selectedIndex].value;
    var periodValue = 0.0;
    if (period == 'Weekly') {
      periodValue = yearlySum / 52;
    } else if (period == 'Fortnightly') {
      periodValue = yearlySum / 26;
    } else if (period == 'Monthly') {
      periodValue = yearlySum / 12;
    } else if (period == 'Quaterly') {
      periodValue = yearlySum / 4;
    } else if (period == 'Half') {
      periodValue = yearlySum / 2;
    } else {
      periodValue = yearlySum;
    }
    transferRow.cells[4].innerHTML = "$" + periodValue.toFixed(2);
    transfersTab.chartYValues[transferRow.rowIndex - 1] = parseFloat(validateNumber(yearlySum / totalExpense * 100).toFixed(2));
    totalSum += yearlySum;
    periodSum += periodValue;
  });
  transfersfoot.querySelectorAll('td')[0].innerHTML = "$" + periodSum.toFixed(2);
  transfersfoot.querySelectorAll('td')[1].innerHTML = "$" + totalSum.toFixed(2);
  transfersTab.createNewChart()
}

class tab {
  constructor(id, chartTitle, chartType, rowData) {
    this.id = id;
    this.chartXValues = []
    this.chartYValues = []
    this.chartColors = []
    this.chartTitle = chartTitle;
    this.chartType = chartType;
    this.drawChart();
    this.addRows(rowData, id);
    this.removeRows(this);
  }

  drawChart() {
    this.chart = new Chart(this.id, {
      type: this.chartType,
      data: {
        labels: this.chartXValues.length == 0 ? [''] : this.chartXValues,
        datasets: [{
          label: "%",
          backgroundColor: this.chartColors.length == 0 ? ['grey'] : this.chartColors,
          data: this.chartYValues.length == 0 ? [100.00] : this.chartYValues
        }]
      },
      options: {
        chartTitle: {
          display: true,
          text: this.chartTitle
        }
      }
    });
  }

  destroyChart() {
    this.chart.destroy();
  }

  createNewChart() {
    this.destroyChart();
    this.drawChart();
  }

  addColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    this.chartColors.push(color);
  }
  addRows(rowData, tabId) {
    var buttons = document.querySelectorAll("#" + this.id + "-tab .add");
    buttons.forEach(function(button) {
      button.addEventListener("click", function() {
        var table = this.parentElement.querySelector('table');
        var tbody = table.querySelector('tbody');
        var newRow = tbody.insertRow(tbody.rows.length);
        rowData.forEach(function(data, index, rowData) {
          newRow.insertCell().innerHTML = (tabId == 'expense' && index == 1 ? (data(table)) : (tabId == 'expense' && index == 6 ? (data(banks)) : data));
        })
      })
    })
  }
  removeRows(tab) {
    document.querySelectorAll("#" + this.id + "-tab .remove").forEach(function(button) {
      button.addEventListener("click", function() {
        if (confirm("Remove Rows?")) {
          var tbody = this.parentElement.querySelector('table tbody');
          tbody.querySelectorAll("input[type='checkbox']:checked").forEach(function(input) {
            var row = input.parentNode.parentNode;
            if (tab.id == 'income' || tab.id == 'transfers') {
              tab.chartXValues.splice(row.rowIndex - 1, 1);
              tab.chartYValues.splice(row.rowIndex - 1, 1);
              tab.chartColors.splice(row.rowIndex - 1, 1);
              if (tab.id == 'transfers') {
                banks.splice(row.rowIndex - 1, 1);
                document.querySelectorAll('#expense-tab table').forEach(expenseTable => {
                  expenseTable.querySelectorAll('tbody tr').forEach(expenseRow => {
                    expenseRow.cells[6].querySelector('select').remove(row.rowIndex - 1)
                  })
                })
              }
            }
            tbody.removeChild(row);
          })
          tab.createNewChart();
        }
      })
    })
  }
}

class income extends tab {
  constructor() {
    var income = ["Benefit", "Business Earning", "Overtime", "Reantal Property", "Salary", "Share Dividends", "Other"];
    var rowData = [checkBox, inputFieldText, getDropBox(income), getDropBox(timePeriod), currencyLabel + inputFieldNumber, '$0.00']
    super('income', 'INCOME', 'doughnut', rowData);
    this.addEventListeners(this)
  }

  getData() {
    var income_table = document.querySelectorAll('#income-tab table tbody tr')
    var data = []
    data.push('User Income')
    income_table.forEach(row => {
      var income_source = row.cells[1].querySelector('input').value
      var category = row.cells[2].querySelector('select').selectedIndex
      var pay_period = row.cells[3].querySelector('select').selectedIndex
      var amount = row.cells[4].querySelector('input').value
      var str = income_source.toString() + "," + category.toString() + "," + pay_period.toString() + "," + amount.toString()
      data.push(str)
    })
    return data
  }

  validateData(data) {
    return data == null ? "" : data
  }

  getSum(body, tabs) {
    var sum = 0;
    tabs.chartXValues = []
    tabs.chartYValues = []
    Array.from(body.rows).forEach(function(row) {
      var value = validateNumber(parseFloat(row.cells[5].innerHTML.replace("$", "")));
      sum += value;
      tabs.chartXValues.push(row.getElementsByTagName('input')[1].value);
      tabs.chartYValues.push(parseFloat(value.toFixed(2)));
    })
    tabs.chartYValues.forEach(function(yValue) {
      yValue = (yValue / sum * 100).toFixed(2);
    })
    return sum
  }

  setYearly(table, income, sum) {
    table.querySelector('tfoot input').value = validateNumber(sum).toFixed(2);
    income.createNewChart();
  }

  getValues(value, row, period) {
    var yearly = getYearlyAmount(period, validateNumber(parseFloat(value)));
    row.cells[5].innerHTML = '$' + validateNumber(yearly).toFixed(2);
    return {
      yearly
    };
  }
  addEventListeners(income) {
    var incomeTab = document.getElementById('income-tab');
    var table = incomeTab.querySelector('table');
    var body = table.querySelector('tbody');
    incomeTab.querySelector('.add').addEventListener('click', function() {
      var newRow = Array.from(body.getElementsByTagName('tr')).at(-1);
      var inputs = newRow.querySelectorAll('input');
      var selects = newRow.querySelectorAll('select')
      income.addColor();
      income.chartXValues.push("")
      income.chartYValues.push(0.00)
      income.createNewChart();
      selects[1].addEventListener('change', function() {
        var values = income.getValues(newRow.cells[4].querySelector('input').value, newRow, this.options[this.selectedIndex].value);
        var sum = validateNumber(income.getSum(body, income));
        income.chartYValues[newRow.rowIndex] = parseFloat(validateNumber((values.yearly / sum * 100)).toFixed(2));
        income.setYearly(table, income, sum);
        recalculateExpense();
      });
      inputs[1].addEventListener('keyup', function(event) {
        income.chartXValues[newRow.rowIndex - 1] = this.value;
        income.createNewChart();
      });
      inputs[2].addEventListener('keyup', function(event) {
        income.getValues(this.value, newRow, newRow.getElementsByTagName('select')[1].options[newRow.getElementsByTagName('select')[1].selectedIndex].value);
        income.setYearly(table, income, income.getSum(body, income));
        recalculateExpense();
      });
    });
    incomeTab.querySelector('.remove').addEventListener('click', function() {
      income.setYearly(table, income, income.getSum(body, income));
      recalculateExpense();
    });
  }
}

class expense extends tab {

  constructor() {
    var func = function(table) {
      if (table.parentElement.classList.contains('home')) {
        return getDropBox(["Groceries", "Home Improvement", "Home Insurance", "Maintainance", "Mortgage", "Property Tax", "Rent", "Security", "Swimming Pool Cost", "Other"]);
      } else if (table.parentElement.classList.contains('utilities')) {
        return getDropBox(["Electricity", "Fixed Line Phone", "Gas", "Heating Oil", "Internet", "Mobile Phone", "Water", "Other"]);
      } else if (table.parentElement.classList.contains('transport')) {
        return getDropBox(["Fuel", "Maintainance/Servicing", "Public Transport", "Registration", "Vehicle Depreciation", "Vehicle Insurance", "Vehicle Lease", "Vehicle Loan", "Other"]);
      } else if (table.parentElement.classList.contains('health')) {
        return getDropBox(["Life Insurance"]);
      } else if (table.parentElement.classList.contains('kids')) {
        return getDropBox(["Baby Sitter", "Child Care", "Clothes", "College Funds", "Gifts", "Lessons", "Pocket Money", "School Camps", "School Fees", "Tution", "University", "Other"])
      } else if (table.parentElement.classList.contains('miscellaneous')) {
        return getDropBox(["Charity/Donations", "Clothes", "Club Memberships", "Craft Supplies", "Eating Out", "Entertainment", "Funeral Insurance", "Gifts", "Holiday/Vacation", "Life Insurance", "Music Purchase", "Newspaper/Magazine", "Other Loan", "Postage Cost", "Smartphone Apps", "Work Lunches", "Hobbies", "Other"]);
      } else if (table.parentElement.classList.contains('auto1')) {
        return inputFieldText;
      } else {
        return inputFieldText;
      }
    }
    var rowData = [checkBox, func, textArea, getDropBox(["Estimate", "Actual"]), currencyLabel + inputFieldNumber, getDropBox(timePeriod), getDropBox, "$0.00", "%0.00"];
    super('expense', 'EXPENSES', 'doughnut', rowData);
    this.addEventListeners(this);
    this.chartXValues = ['Home', 'Utilities', "Transportation", 'Health', "Kids", "Miscellaneous", "", ""];
    this.chartYValues = [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]
    for (var i = 0; i < 8; i++) {
      this.addColor();
    }
    this.createNewChart();
  }

  getData() {
    var expense_table = document.querySelectorAll('#expense-tab table')
    var heads = document.querySelectorAll('.info-head input');
    var data = []
    var expense = this
    data.push('Expense')
    expense_table.forEach(function(table, index, expense_table) {
      if (index < 8) {
        var table_data = []
        table_data.push(expense.chartXValues[index])
        table.querySelectorAll('tbody tr').forEach(row => {
          if (index < 6) {
            console.log(row.cells[2].querySelector('textarea').value)
            var fixed_expense = row.cells[1].querySelector('select').selectedIndex
            var notes = row.cells[2].querySelector('textarea').innerHTML
            var cost_details = row.cells[3].querySelector('select').selectedIndex
            var amount = row.cells[4].querySelector('input').value
            var period = row.cells[5].querySelector('select').selectedIndex
            var account = row.cells[6].querySelector('select').selectedIndex
            var str = fixed_expense.toString() + "," + notes.toString() + "," + cost_details.toString() + "," + amount.toString() + "," + period.toString() + "," + account.toString()
            table_data.push(str);
          }
          else{
            var fixed_expense = row.cells[1].querySelector('input').value
            var notes = row.cells[2].querySelector('textarea').innerHTML
            var cost_details = row.cells[3].querySelector('select').selectedIndex
            var amount = row.cells[4].querySelector('input').value
            var period = row.cells[5].querySelector('select').selectedIndex
            var account = row.cells[6].querySelector('select').selectedIndex
            var str = fixed_expense.toString() + "," + notes.toString() + "," + cost_details.toString() + "," + amount.toString() + "," + period.toString() + "," + account.toString()
            table_data.push(str);
          }
        })
        data.push(table_data)
      }
    })
    return data
  }
  valueChanged(period, amount, row, yearlyIncome) {
    var yearly = validateNumber(getYearlyAmount(period, amount));
    var percent = validateNumber(yearly / yearlyIncome * 100);
    row.cells[7].innerHTML = '$' + yearly.toFixed(2);
    row.cells[8].innerHTML = '%' + percent.toFixed(2);
    recalculateExpense();
    recalculateTransfers();
  }
  addEventListeners(expense) {
    var heads = document.querySelectorAll('.info-head input');
    heads[0].addEventListener('keyup', function(event) {

      expense.chartXValues[6] = this.value;
      expense.createNewChart();
    });
    heads[1].addEventListener('keyup', function(event) {
      expense.chartXValues[7] = this.value;
      expense.createNewChart();
    });
    document.getElementById('expense-tab').querySelectorAll('.add').forEach(button => {
      button.addEventListener('click', function() {
        var table = this.parentElement.querySelector('table');
        var newRow = Array.from(table.querySelectorAll('tbody tr')).at(-1);
        var inputs = newRow.querySelectorAll('input');
        var selects = newRow.querySelectorAll('select');
        var selectIndex = table.parentElement.classList.contains('auto1') || table.parentElement.classList.contains('auto2') ? 1 : 2;
        var inputsIndex = table.parentElement.classList.contains('auto1') || table.parentElement.classList.contains('auto2') ? 2 : 1;
        var yearlyIncome = validateNumber(parseFloat(document.querySelector('#income-tab tfoot td input').value));
        selects[selectIndex].addEventListener('change', function() {
          var amount = validateNumber(parseFloat(newRow.cells[4].querySelector('input').value));
          var period = this.options[this.selectedIndex].value;
          expense.valueChanged(period, amount, newRow, yearlyIncome);
        });
        selects[selectIndex + 1].addEventListener('change', function() {
          recalculateTransfers();
        });
        inputs[inputsIndex].addEventListener('keyup', function(event) {
          var amount = validateNumber(parseFloat(this.value));
          var period = newRow.getElementsByTagName('select')[selectIndex].options[newRow.getElementsByTagName('select')[selectIndex].selectedIndex].value;
          expense.valueChanged(period, amount, newRow, yearlyIncome);
        });
      });
    });
    document.getElementById('expense-tab').querySelectorAll('.remove').forEach(button => {
      button.addEventListener('click', function() {
        recalculateExpense();
        recalculateTransfers();
      });
    })
  }
}

class transfers extends tab {
  constructor() {
    var rowData = [checkBox, inputFieldText, textArea, getDropBox(timePeriod), '$0.00', '$0.00']
    super('transfers', 'TRANSFERS', 'doughnut', rowData);
    this.addEventListeners(this);
  }

  getData() {
    var income_table = document.querySelectorAll('#transfers-tab table tbody tr')
    var data = []
    data.push('Banks')
    income_table.forEach(row => {
      var bank = row.cells[1].querySelector('input').value
      var note = row.cells[2].querySelector('textArea').innerHTML
      var period = row.cells[3].querySelector('select').selectedIndex
      var str = bank.toString() + "," + note.toString() + "," + period.toString()
      data.push(str)
    })
    return data
  }

  addEventListeners(transfers) {
    var table = document.getElementById('transfers-tab').querySelector('table');
    var body = table.querySelector('tbody');
    document.getElementById('transfers-tab').querySelector('.add').addEventListener('click', function() {
      var newRow = body.getElementsByTagName('tr')[body.rows.length - 1];
      var inputs = newRow.querySelectorAll('input');
      var select = newRow.querySelector('select');
      transfers.addColor();
      transfers.chartXValues.push("")
      transfers.chartYValues.push(0.00)
      transfers.createNewChart();
      banks.push("");
      document.querySelectorAll('#expense-tab table').forEach(expenseTable => {
        var expenseRows = expenseTable.querySelectorAll('tbody tr');
        expenseRows.forEach(expenseRow => {
          var select = expenseRow.cells[6].querySelector('select');
          select.appendChild(document.createElement('option'))
        })
      })
      recalculateExpense();
      select.addEventListener('change', function() {
        var period = this.options[this.selectedIndex].value;
        var periodValue = 0.0;
        var yearlySum = validateNumber(parseFloat(newRow.cells[5].innerHTML.replace("$", "")));
        if (period == 'Weekly') {
          periodValue = yearlySum / 52;
        } else if (period == 'Fortnightly') {
          periodValue = yearlySum / 26;
        } else if (period == 'Monthly') {
          periodValue = yearlySum / 12;
        } else if (period == 'Quaterly') {
          periodValue = yearlySum / 4;
        } else if (period == 'Half') {
          periodValue = yearlySum / 2;
        } else {
          periodValue = yearlySum;
        }
        newRow.cells[4].innerHTML = "$" + validateNumber(periodValue).toFixed(2);
        var frequencySum = 0;
        for (var i = 0; i < body.rows.length; i++) {
          frequencySum += validateNumber(parseFloat(body.rows[i].cells[4].innerHTML.replace("$", "")));
        }
        table.querySelector('tfoot td').innerHTML = "$" + frequencySum.toFixed(2);
      });
      inputs[1].addEventListener('keyup', function(event) {
        var input = this.value;
        var row = this.parentElement.parentElement;
        banks[row.rowIndex - 1] = input;
        transfers.chartXValues[row.rowIndex - 1] = input;
        document.querySelectorAll('#expense-tab table').forEach(expenseTable => {
          expenseTable.querySelectorAll('tbody tr').forEach(expenseRow => {
            expenseRow.cells[6].querySelector('select').options[row.rowIndex - 1].value = input;
            expenseRow.cells[6].querySelector('select').options[row.rowIndex - 1].innerHTML = input;
          })
        })
        recalculateTransfers();
      });

    })
    document.getElementById('transfers-tab').querySelector('.remove').addEventListener('click', function() {
      recalculateTransfers();
    })
  }
}
var incomeTab = new income()
var expenseTab = new expense()
var transfersTab = new transfers()

function navBarSelection() {
  var listItems = document.getElementById('myTab').getElementsByClassName('nav-item');
  for (var i = 0; i < listItems.length; i++) {
    listItems[i].addEventListener("click", function() {
      var items = document.getElementById('myTab').getElementsByClassName('nav-item');
      for (var i = 0; i < listItems.length; i++) {
        if (!items[i].isEqualNode(this)) {
          items[i].classList.add('inactive');
        } else {
          if (this.classList.contains('inactive')) {
            items[i].classList.remove('inactive');
          }
        }
      }
    });
  }
}

function addNotification() {

  var notification = $('.bell-notification');

  if (!$(notification).hasClass('new-not')) {

    $('.bell-top').addClass('bell-top-anim');
    $('.bell-bot').addClass('bell-bot-anim');

    setTimeout(function() {
      $(notification).addClass('new-not');
    }, 800);

    $(notification).html(parseInt($(notification).html(), 10) + 1);

  } else {

    $('.bell-top').removeClass('bell-top-anim');
    $('.bell-bot').removeClass('bell-bot-anim');
    $(notification).removeClass('new-not');

  }

}
navBarSelection();
document.getElementById('save').addEventListener('click', function() {
  console.log(expenseTab.getData())
})
