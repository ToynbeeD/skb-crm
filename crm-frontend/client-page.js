import { createModalPrimaryBtn, createModalSecondaryBtn, createModalAlert, createModalClient, modal } from './modal.js';

function createClientTitle(title) {
  const heading = document.createElement('h1');
  heading.classList.add('client-heading');
  heading.textContent = title;

  return heading;
}

function createIdElement(id) {
  const span = document.createElement('span');
  span.classList.add('client-id');
  span.textContent = `ID: ${id}`;

  return span;
}

function createContactsTitle(count) {
  const title = document.createElement('h2');
  title.classList.add('client-contacts-heading');

  if (count > 0) title.textContent = `Контакты (${count}):`;
  else title.textContent = 'Нет контактов';

  return title;
}

function createList() {
  const list = document.createElement('ul');
  list.classList.add('list-reset', 'client-contacts-list');
  return list;
}

function createContactsItem(contact) {
  const item = document.createElement('li');
  const value = document.createElement('span');

  item.classList.add('client-contacts-item');
  value.classList.add('client-contacts-value');
  value.textContent = contact.value;
  item.textContent = `${contact.type}: `;
  item.append(value);

  return item;
}

function createButtonWrapper() {
  const wrapper = document.createElement('div');
  wrapper.classList.add('client-button-wrapper');
  return wrapper;
}

function createBackLink() {
  const link = document.createElement('a');
  link.classList.add('client-link-back')
  link.href = `${document.location.protocol}//${document.location.host}`;
  link.innerHTML = `
  <svg>
    <use xlink:href="#arrow-back"></use>
  </svg>
  Вернуться к списку клиентов
  `;

  return link;
}



export function createClientPage(client) {
  const container = document.createElement('div');
  const title = createClientTitle(`${client.surname} ${client.name} ${client.lastName ? client.lastName : ''}`);
  const idValue = createIdElement(client.id);
  const contactsTitle = createContactsTitle(client.contacts.length);
  const contactsContainer = createList();
  const btnWrapper = createButtonWrapper();
  const btnPrimary = createModalPrimaryBtn('Изменить данные');
  const btnSecondary = createModalSecondaryBtn('Удалить клиента');
  const linkBack = createBackLink();
  const header = document.querySelector('header');
  const main = document.querySelector('main');

  container.classList.add('client-container');

  btnPrimary.addEventListener('click', () => modal.append(createModalClient(client)));

  btnSecondary.addEventListener('click', () => {
    modal.style.display = 'flex';
    modal.append(createModalAlert(client));
  });

  client.contacts.forEach(contact => contactsContainer.append(createContactsItem(contact)));

  header.remove();
  main.remove();
  btnWrapper.append(btnPrimary);
  btnWrapper.append(btnSecondary);
  container.append(title);
  container.append(idValue);
  container.append(contactsTitle);
  container.append(contactsContainer);
  container.append(btnWrapper);
  container.append(linkBack);

  return container;
}
