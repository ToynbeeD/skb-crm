import './assets/popper.min.js';
import './assets/tippy-bundle.umd.min.js';
import { getClientsData, getClientData } from './api.js';
import { createModalClient, createModalAlert, modal } from './modal.js';
import { createClientPage } from './client-page.js';

export const tbody = document.getElementById('tbody');
const mainContainer = document.getElementById('main-container');
const preloader = document.querySelector('.preloader');

export function tableSearch(phrase, table) {
  const regPhrase = new RegExp(phrase.value, 'i');
  let flag = false;
  for (let i = 1; i < table.rows.length; i++) {
    flag = false;
    for (let j = table.rows[i].cells.length - 2; j >= 0; j--) {
      flag = regPhrase.test(table.rows[i].cells[j].innerHTML);
      if (flag) break;
    }
    if (flag) {
      table.rows[i].style.display = "";
    } else {
      table.rows[i].style.display = "none";
    }
  }
}

export function createPreloaderMini() {
  const preloaderMini = document.createElement('div');
  preloaderMini.innerHTML = `
  <svg class="spinner">
    <use xlink:href="#spinner"></use>
  </svg>
  `;
  preloaderMini.classList.add('preloader', 'preloader-mini');

  return preloaderMini;
};

function createIdCell(id) {
  const cell = document.createElement('td');
  cell.classList.add('table__id');
  cell.textContent = id;
  return cell;
}

function createNameCell(fullName) {
  const cell = document.createElement('td');
  const btn = document.createElement('button');
  cell.classList.add('table__name');
  btn.classList.add('btn-reset');
  btn.textContent = fullName;
  cell.append(btn);

  return {
    cell: cell,
    btn: btn,
  };
}

function createDateCell(dateValue, timeValue) {
  const cell = document.createElement('td');
  const time = document.createElement('span');

  cell.classList.add('table__date');
  time.classList.add('table__date-time');
  cell.textContent = dateValue;
  time.textContent = timeValue;

  cell.append(time);

  return cell;
}

function createContactsCell() {
  const cell = document.createElement('td');
  cell.classList.add('table__social');
  return cell;
}

function createContactsList() {
  const list = document.createElement('ul');
  list.classList.add('list-reset', 'table__social-list');
  return list;
}

function createContactsItem(social, value) {
  const item = document.createElement('li');
  const itemValue = document.createElement('span');
  item.classList.add('table__social-item');
  itemValue.classList.add('invisible');
  item.innerHTML = `
  <svg>
    <use xlink:href="#${social}"></use>
  </svg>
  `;
  itemValue.textContent = value;
  item.append(itemValue);

  return item;
}

function createActionsCell() {
  const cell = document.createElement('td');
  const btnWrapper = document.createElement('div');
  const editBtn = document.createElement('button');
  const deleteBtn = document.createElement('button');

  cell.classList.add('table__actions');
  btnWrapper.classList.add('actions-btn-wrapper');
  editBtn.classList.add('btn-reset', 'btn-action', 'btn-edit');
  deleteBtn.classList.add('btn-reset', 'btn-action', 'btn-cancel');

  editBtn.innerHTML = `
    <svg>
      <use xlink:href="#pen"></use>
    </svg>
    Изменить`;
  deleteBtn.innerHTML = `
    <svg>
      <use xlink:href="#cancel"></use>
    </svg>
    Удалить`;

  btnWrapper.append(editBtn);
  btnWrapper.append(deleteBtn);
  cell.append(btnWrapper);

  return {
    cell: cell,
    deleteBtn: deleteBtn,
    editBtn: editBtn,
  };
}

function createAddButton() {
  const btn = document.createElement('button');

  btn.classList.add('btn-reset', 'add-btn');
  btn.innerHTML = `
  <svg>
    <use xlink:href="#add-client"></use>
  </svg>
  Добавить клиента`;

  return btn;
}

function formatDate(value) {
  const dateObj = new Date(value);
  const dateStr = String(dateObj);
  const date = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const time = dateStr.substring(16, 21)
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  };
  const formatDate = date.toLocaleString('ru', options);

  return {
    date: formatDate,
    time: time
  }
}

export function sortTable(button, n) {
  const buttonsSort = document.querySelectorAll('.btn-sort');
  const table = document.getElementById("table");
  let rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  switching = true;
  dir = "asc";
  buttonsSort.forEach(btn => btn.classList.remove('sort-active', 'sort-desc'));
  while (switching) {
    switching = false;
    rows = table.getElementsByTagName("tr");

    for (i = 1; i < (rows.length - 1); i++) {
      shouldSwitch = false;
      x = rows[i].getElementsByTagName("td")[n];
      y = rows[i + 1].getElementsByTagName("td")[n];

      if (dir == "asc") {
        button.classList.remove('sort-desc');
        button.classList.add('sort-active');
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      } else if (dir == "desc") {
        button.classList.add('sort-active', 'sort-desc');
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      switchcount++;
    } else {
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}

export function createTableRow(client) {
  const clientRowElement = document.createElement('tr');
  const startDate = formatDate(client.createdAt);
  const changeDate = formatDate(client.updatedAt);
  const clientIdElement = createIdCell(client.id);
  const clientNameElement = createNameCell(`${client.surname} ${client.name} ${client.lastName}`);
  const clientCreatedElement = createDateCell(startDate.date, startDate.time);
  const clientUpdatedElement = createDateCell(changeDate.date, changeDate.time);
  const clientContactsElement = createContactsCell();
  const clientContactsList = createContactsList();
  const clientActionsCell = createActionsCell();

  clientNameElement.btn.addEventListener('click', async () => {
    const clientData = await getClientData(client.id);
    history.pushState({ id: client.id }, '', `http://127.0.0.1:5500/?id=${client.id}`);
    document.title = 'Страница клиента';
    const clientPage = createClientPage(clientData);
    document.body.append(clientPage);
  });

  client.contacts.forEach(contact => {
    let contactItemElement;

    switch (contact.type) {
      case 'Телефон':
        contactItemElement = createContactsItem('phone', contact.value);
        break;
      case 'Email':
        contactItemElement = createContactsItem('mail', contact.value);
        break;
      case 'Facebook':
        contactItemElement = createContactsItem('fb', contact.value);
        break;
      case 'VK':
        contactItemElement = createContactsItem('vk', contact.value);
        break;
      default:
        contactItemElement = createContactsItem('contact', contact.value);
    }

    clientContactsList.append(contactItemElement);
    tippy(contactItemElement, {
      content: `${contact.type}: ${contact.value}`,
    });
  })

  clientContactsElement.append(clientContactsList);
  clientRowElement.append(clientIdElement);
  clientRowElement.append(clientNameElement.cell);
  clientRowElement.append(clientCreatedElement);
  clientRowElement.append(clientUpdatedElement);
  clientRowElement.append(clientContactsElement);
  clientRowElement.append(clientActionsCell.cell);

  clientActionsCell.editBtn.addEventListener('click', () => {
    const preloaderMini = createPreloaderMini();
    clientActionsCell.editBtn.textContent = 'Изменить';
    clientActionsCell.editBtn.prepend(preloaderMini);
    setTimeout(() => {
      modal.append(createModalClient(client, clientRowElement));
      preloaderMini.remove();
      clientActionsCell.editBtn.innerHTML = `
      <svg>
        <use xlink:href="#pen"></use>
      </svg>
      Изменить
      `;
    }, 250)

  });

  clientActionsCell.deleteBtn.addEventListener('click', () => {
    const preloaderMini = createPreloaderMini();
    preloaderMini.classList.add('preloader-red');
    clientActionsCell.deleteBtn.textContent = 'Удалить';
    clientActionsCell.deleteBtn.prepend(preloaderMini);
    setTimeout(() => {
      modal.append(createModalAlert(client, clientRowElement));
      preloaderMini.remove();
      modal.style.display = 'flex';
      clientActionsCell.deleteBtn.innerHTML = `
      <svg>
        <use xlink:href="#cancel"></use>
      </svg>
      Удалить
      `;
    }, 250)
  });

  return clientRowElement;
}

export async function createClientsTable() {
  let data;
  try {
    data = await getClientsData()
  } catch (e) {
    preloader.innerHTML = '<p class="main-error-text">Что-то пошло не так...</p>'
    throw e.message
  };

  const buttonAddClient = createAddButton();

  buttonAddClient.addEventListener('click', () => {
    modal.append(createModalClient());
  });

  preloader.remove();

  data.forEach(client => {
    const clientRowElement = createTableRow(client)
    tbody.append(clientRowElement);
  });
  mainContainer.append(buttonAddClient);
}

const buttonsSort = document.querySelectorAll('.btn-sort');

for (let i = 0; i < buttonsSort.length; i++) {
  buttonsSort[i].addEventListener('click', () => {
    sortTable(buttonsSort[i], i)
  });
}

