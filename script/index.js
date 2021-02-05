/* Função para abrir o Modal*/

const Modal = {
  startModal() {
    //Seleciona o elemento que ira ter o Evente 'click"
    document
      .querySelector(".js-new-transaction")
      .addEventListener("click", () => {
        const close = document.querySelector(".js-closeModal");
        const modal = document.querySelector(".c-modal");
        // Cria as constantes para serem usadas na função
        modal.classList.add("js-is-active"); //adiciona a class, que abre o modal, no modal
        modal.addEventListener("click", (e) => {
          //arrow function para fechar o modal
          if (e.target === modal || e.target === close) {
            setTimeout(() => modal.classList.remove("js-is-active"), 100); // com uma função setTimeOut para dar um delay de 100ms antes de fechar
          }
        });
      });
  },
  closeModal() {
    setTimeout(
      () => document.querySelector(".c-modal").classList.remove("js-is-active"),
      100
    );
  },
};

const Storage = {
  get() {
      return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
  },

  set(transactions) {
      localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
  }
}
// Entradas, saídas e total
const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction);
    App.reload();
  },
  remove(index) {
    Transaction.all.splice(index, 1);
    App.reload();
  },
  // Preciso somar as entradas de dinheiro
  incomes() {
    let income = 0; //definindo valor base do income
    Transaction.all.forEach((transaction) => {
      if (transaction.amount > 0) {
        //se os valores forem maior que zero , ' > 0', vai somar no income e mostrar no Balance
        income += transaction.amount;
      }
    });
    return income; // retorno o valor da função
  },
  //depois somar as saídas de dinheiro
  expenses() {
    let expense = 0; //definindo valor base do expense
    Transaction.all.forEach((transaction) => {
      //se os valores forem menor que zero , ' < 0', vai somar no expense e mostrar no Balance
      if (transaction.amount < 0) {
        expense += transaction.amount;
      }
    });
    return expense; // retorna o valor da função
  },
  // diminuir entradas e saídas para ser usado no total
  //ter um total que sera (entradas - saídas)
  total() {
    return Transaction.incomes() + Transaction.expenses();
  },
};
// Substituir os dados da table pelos dados do JS
const DOM = {
  //buscar o container em que esses dados iram ser inseridos no html
  transactionsContainer: document.querySelector(".c-content__tbody"),
  //Criando a tag <tr> e colocando a class nela
  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.classList.add("c-content__tr");
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index); // pegou os dados da const transactions e está usando na tag <tr>
    tr.dataset.index = index;
    DOM.transactionsContainer.appendChild(tr);
  },
  // construção do html que vai ser atribuido à tag <tr>
  innerHTMLTransaction(transaction, index) {
    //Vai separar as duas class, para saber se teve entrada ou saida de dinheiro, e muda a cor
    const CSSclass = transaction.amount > 0 ? "u-income" : "u-expense";
    //
    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
        <tr class="c-content__tr">
            <td class="c-content__td u-description">${transaction.description}</td> 
            <td class="c-content__td ${CSSclass}">${amount}</td>
            <td class="c-content__td u-date">${transaction.date}</td>
            <td class="c-content__td u-date">${transaction.payday}</td>
            <td class="c-content__td"><a class="c-content__td--link" href="#" onclick="Transaction.remove(${index})">
                <img class="c-content__td--img" src="./images/minus.svg" alt="Remover transação"></a>
            </td>
        </tr>
        `; //puxou os dados dos objetos de transactions e está usando para alterar os valores na table
    return html;
  },
  //seleciona os elementos no html para entrarem os valores finais
  updateBalance() {
    document.querySelector("#incomeDisplay").innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    );
    document.querySelector("#expenseDisplay").innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    );
    document.querySelector("#totalDisplay").innerHTML = Utils.formatCurrency(
      Transaction.total()
    );
  },

  clearTrasactions() {
    DOM.transactionsContainer.innerHTML = "";
  },
};

// Vai tratar o dinheiro, colocando virgula, "R$" etc...
const Utils = {
  formatAmount(value) {
    value = Number(value.replace(/\,\,/g, "")) * 100;
    // value = Number(value) * 100;
    return value;
  },
  formatDate(date) {
    const splittedDate = date.split("-");
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },
  formatPayday(payday) {
    const splittedDate = payday.split("-");
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : ""; // Coloca o sinal de negativo se o número for menor que 0, '< 0'
    value = String(value).replace(/\D/g, ""); // tira todos os caracteres especiais
    value = Number(value) / 100;
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    }); // usado para tratar o numero, fazendo ele ser o dinheiro, e pode ser qualquer moeda
    return signal + value;
  },
};
const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),
  payday: document.querySelector("input#payday"),
  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
      payday: Form.payday.value,
    };
  },
  validateFields() {
    const { description, amount, date, payday } = Form.getValues();
    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === "" ||
      payday.trim() === ""
    ) {
      throw new Error("Por favor, preencha todos os campos");
    }
  },
  formatValues() {
    let { description, amount, date, payday } = Form.getValues();

    amount = Utils.formatAmount(amount);

    date = Utils.formatDate(date);

    payday = Utils.formatPayday(payday);

    return {
      description,
      amount,
      date,
      payday,
    };
  },
  saveTransaction(transaction) {
    Transaction.add(transaction);
  },
  clearFields() {
    (Form.description.value = ""),
      (Form.amount.value = ""),
      (Form.date.value = ""),
      (Form.payday.value = "");
  },
  submit(event) {
    event.preventDefault();
    try {
      //verificar se os capos foram todos preenchidos
      Form.validateFields();
      //Formatar os dados
      const transaction = Form.formatValues();
      //salvar os dados formatados
      Form.saveTransaction(transaction);
      //limpar os inputs
      Form.clearFields();
      //fechar o modal
      Modal.closeModal();
    } catch (error) {
      alert(error.message);
    }
  },
};

//Para iniciar e reiniciar todo o script
const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      //usando o forEach, vou colocar todos os objetos que estão no transactions, no html
      DOM.addTransaction(transaction, index);
    });
    DOM.updateBalance();

    Storage.set(Transaction.all)
  },
  reload() {
    DOM.clearTrasactions();
    App.init();
  },
};
Modal.startModal();

App.init();
