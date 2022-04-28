import './assets/choices.min.js';
import { postNewClient, patchClient, deleteClient } from './api.js';
import { tbody, createTableRow, createPreloaderMini } from './main-page.js';

export const modal = document.getElementById('modal');

function createContainer(className) {
  const container = document.createElement('div');
  container.classList.add(className);
  return container;
}

function createModalTitle(title = 'Новый клиент', id = null) {
  const heading = document.createElement('h2')
  heading.textContent = title;
  heading.classList.add('modal__heading');
  if (id) {
    const idElement = document.createElement('span');
    idElement.classList.add('modal__heading-span');
    idElement.textContent = `ID: ${id}`;
    heading.append(idElement);
  }
  return heading;
}

function createModalForm() {
  const form = document.createElement('form');
  form.classList.add('modal__form');
  return form;
}

function createNameInput(placeholder, value = '', required = true) {
  const label = document.createElement('label');
  const labelText = document.createElement('span');
  const input = document.createElement('input');
  const transform = 'label__transform';

  label.classList.add('modal__label');
  labelText.classList.add('modal__label-text');
  input.classList.add('modal__input');

  labelText.textContent = placeholder;
  input.value = value;

  function addTransform(add = true) {
    add ? labelText.classList.add(transform) : labelText.classList.remove(transform);;
  }

  if (input.value) {
    addTransform();
  };

  input.addEventListener('blur', () => input.value ? addTransform() : addTransform(false));
  input.addEventListener('input', () => addTransform());

  label.append(labelText);
  label.append(input);

  if (required) {
    const symbol = document.createElement('span');
    symbol.classList.add('modal__label-required');
    symbol.textContent = '*';
    labelText.append(symbol);
  }

  return {
    label: label,
    input: input,
  };
}

function createModalContactsList() {
  const list = document.createElement('ul');
  list.classList.add('list-reset', 'modal__contacts-list');
  return list;
}

function createModalContactItem() {
  const item = document.createElement('li');
  item.classList.add('modal__contacts-item');
  return item;
}

function createContactSelect(contactType = null) {
  const select = document.createElement('select');
  const contactsArray = ['Телефон', 'Email', 'Facebook', 'VK', 'Другое'];

  contactsArray.forEach(contact => {
    const option = document.createElement('option');
    option.textContent = contact;
    option.value = contact;

    if (contactType && contact === contactType) {
      option.setAttribute('selected', 'selected');
    };

    select.append(option);
  });

  return select;
}

function createButtonDeleteContact() {
  const btn = document.createElement('button');
  btn.classList.add('btn-reset', 'modal__contact-delete-btn');
  btn.innerHTML = `
  <svg>
    <use xlink:href="#delete-contact"></use>
  </svg>
  `;

  return btn;
}

function createButtonAddContact() {
  const btn = document.createElement('button');
  btn.classList.add('btn-reset', 'modal__add-contact-btn');
  btn.innerHTML = `
  <svg>
    <use xlink:href="#add-contact"></use>
  </svg>
  Добавить контакт
  `;

  return btn;
}

function createContactRow(type = null, value = '') {
  const contactItem = createModalContactItem();
  const select = createContactSelect(type);
  const input = document.createElement('input');
  const buttonDeleteContact = createButtonDeleteContact();

  input.placeholder = 'Введите данные контакта';
  input.classList.add('modal__contact-input');
  input.value = value;

  contactItem.append(select);
  contactItem.append(input);
  contactItem.append(buttonDeleteContact);

  buttonDeleteContact.addEventListener('click', () => {
    contactItem.remove();
  });

  const choices = new Choices(select, {
    allowHTML: true,
    itemSelectText: '',
    searchEnabled: false,
    shouldSort: false,
  });

  return contactItem;
}

export function createModalPrimaryBtn(value) {
  const btn = document.createElement('button');
  btn.classList.add('btn-reset', 'modal__btn-primary');
  btn.textContent = value;
  return btn;
}

export function createModalSecondaryBtn(value = 'Отмена') {
  const btn = document.createElement('button');
  btn.classList.add('btn-reset', 'modal__btn-secondary');
  btn.textContent = value;
  return btn;
}

function createButtonClose() {
  const btn = document.createElement('button');
  btn.classList.add('btn-reset', 'modal__close-btn');
  btn.innerHTML = `
  <svg>
    <use xlink:href="#close"></use>
  </svg>
  `;

  return btn;
}

function removeModal(modal, body) {
  modal.style.display = 'none';
  body.remove();
};

export function createModalAlert(client, row = null, mainModalElem = null) {
  const body = createContainer('modal__body');
  const heading = createModalTitle('Удалить клиента');
  const alertText = document.createElement('p');
  const buttonPrimary = createModalPrimaryBtn('Удалить');
  const buttonSecondary = createModalSecondaryBtn('Отмена');
  const buttonClose = createButtonClose();

  body.classList.add('modal__body-alert');
  heading.classList.add('modal__title-reset');
  alertText.classList.add('modal__alert-text');
  alertText.textContent = 'Вы действительно хотите удалить данного клиента?';

  body.append(heading);
  body.append(alertText);
  body.append(buttonPrimary);
  body.append(buttonSecondary);
  body.append(buttonClose);

  buttonPrimary.addEventListener('click', () => {
    deleteClient(client.id);
    if (row) row.remove();
    removeModal(modal, body);
    if (mainModalElem) mainModalElem.remove();
    if (history.state) location.href = `${document.location.protocol}//${document.location.host}`;
  });

  buttonSecondary.addEventListener('click', () => {
    body.remove();
    if (mainModalElem) {
      mainModalElem.style.display = 'block';
    } else {
      modal.style.display = 'none';
    };
  });

  buttonClose.addEventListener('click', () => {
    body.remove();
    if (mainModalElem) {
      mainModalElem.style.display = 'block';
    } else {
      modal.style.display = 'none';
    };
  });

  return body;
}

function formatInputValue(value) {
  return value
    .toLowerCase()
    .trim()
    .split(/\s{2,}/)
    .join(' ')
    .split(/-{2,}/)
    .join('-');
}

function validateClientName(input, value) {
  if (value === '') {
    input.classList.remove('input-invalid');
    return;
  };
  if (!/^[а-я\-\s]+$/.test(value)) input.classList.add('input-invalid');
  else if (!/[а-я]+/.test(value)) input.classList.add('input-invalid');
  else if (/^-/.test(value) || /-$/.test(value)) input.classList.add('input-invalid');
  else {
    input.classList.remove('input-invalid');
    const spacesCapitalize = value.split(' ').map(str => str[0].toUpperCase() + str.slice(1)).join(' ');
    const dashCapitalize = spacesCapitalize.split('-').map(str => str[0].toUpperCase() + str.slice(1)).join('-');
    input.value = dashCapitalize;
  };
}

export function createModalClient(client = null, row = null) {
  const body = createContainer('modal__body');
  const topContainer = createContainer('modal__top');
  const bottomContainer = createContainer('modal__bottom');
  const buttonsWrapper = createContainer('modal__button-wrapper');
  const errorContainer = createContainer('modal__error-container');
  const heading = client ? createModalTitle('Изменить данные', client.id) : createModalTitle();
  const form = createModalForm();
  const inputName = client ? createNameInput('Имя', client.name) : createNameInput('Имя',);
  const inputSurname = client ? createNameInput('Фамилия', client.surname) : createNameInput('Фамилия');
  const inputLastName = client ? createNameInput('Отчество', client.lastName, false) : createNameInput('Отчество', '', false);
  const buttonAdd = createButtonAddContact();
  const contactsList = createModalContactsList();
  const buttonPrimary = createModalPrimaryBtn('Сохранить');
  const buttonSecondary = client ? createModalSecondaryBtn('Удалить клиента') : createModalSecondaryBtn();
  const buttonClose = createButtonClose();

  function createErrorText(text) {
    const errorText = document.createElement('p');
    errorText.classList.add('modal__error-text');
    errorText.textContent = text;
    errorContainer.append(errorText);
  };

  if (client) {
    client.contacts.forEach(contact => {
      const contactRow = createContactRow(contact.type, contact.value);
      contactsList.append(contactRow);
    });
  };

  buttonAdd.addEventListener('click', () => {
    const contactItems = document.querySelectorAll('.modal__contacts-item');
    if (contactItems.length > 9) return;
    const contactRow = createContactRow();
    contactsList.append(contactRow);
  });

  form.append(inputSurname.label);
  form.append(inputName.label);
  form.append(inputLastName.label);
  topContainer.append(heading);
  topContainer.append(form);
  buttonsWrapper.prepend(errorContainer);
  buttonsWrapper.append(buttonPrimary);
  buttonsWrapper.append(buttonSecondary);
  bottomContainer.append(contactsList);
  bottomContainer.append(buttonAdd);
  bottomContainer.append(buttonsWrapper);
  body.append(topContainer);
  body.append(bottomContainer);
  body.append(buttonClose);

  inputName.input.addEventListener('blur', () => {
    const formatValue = formatInputValue(inputName.input.value);
    validateClientName(inputName.input, formatValue);
  });

  inputSurname.input.addEventListener('blur', () => {
    const formatValue = formatInputValue(inputSurname.input.value);
    validateClientName(inputSurname.input, formatValue);
  });

  inputLastName.input.addEventListener('blur', () => {
    const formatValue = formatInputValue(inputLastName.input.value);
    if (formatValue === '') {
      inputLastName.input.classList.remove('input-invalid');
      return;
    };
    validateClientName(inputLastName.input, formatValue);
  });

  buttonPrimary.addEventListener('click', async () => {
    const inputsInvalid = document.querySelectorAll('.input-invalid');

    if (inputsInvalid.length >= 1) {
      errorContainer.textContent = '';
      createErrorText('Некорректно заполнены данные ФИО!');
      return;
    }

    let clientInfo;

    const preloaderMini = createPreloaderMini();
    preloaderMini.classList.add('preloader-save');
    buttonPrimary.prepend(preloaderMini);

    try {
      const clientObj = {
        name: inputName.input.value,
        surname: inputSurname.input.value,
        lastName: inputLastName.input.value,
      };

      const listChildren = contactsList.childNodes;

      if (listChildren) {
        let contactsArray = [];

        listChildren.forEach(child => {
          const selectValue = child.querySelector('select').value;
          const inputValue = child.querySelector('input').value;
          const contact = {
            type: selectValue,
            value: inputValue,
          };

          contactsArray.push(contact);
        });

        clientObj.contacts = contactsArray;
      };

      if (history.state) {
        await patchClient(client.id, clientObj);
        location.href = `${document.location.protocol}//${document.location.host}`;
      } else {
        if (client) {
          clientInfo = await patchClient(client.id, clientObj);
          row.remove();
        } else {
          clientInfo = await postNewClient(clientObj);
        };
        const clientRow = createTableRow(clientInfo);
        tbody.append(clientRow);
        removeModal(modal, body);
      }
    } catch (e) {
      errorContainer.textContent = '';
      preloaderMini.remove();
      clientInfo.forEach(obj => createErrorText(obj.message));
    }
  });

  if (client) {
    buttonSecondary.addEventListener('click', () => {
      body.style.display = 'none';
      const alert = createModalAlert(client, row, body);
      modal.append(alert);
    });
  } else {
    buttonSecondary.addEventListener('click', () => removeModal(modal, body));
  };

  buttonClose.addEventListener('click', () => removeModal(modal, body));

  modal.style.display = 'flex';
  return body;
}
