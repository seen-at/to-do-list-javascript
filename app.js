// item selection from HTML
const form = document.querySelector(".grocery-form");
const alert = document.querySelector(".alert");
const grocery = document.getElementById("grocery");
const submitBtn = document.querySelector(".submit-btn");
const groceryContainer = document.querySelector(".grocery-container");
const groceryList = document.querySelector(".grocery-list");
const clearBtn = document.querySelector(".clear-btn")

// variables for editing the list items
let editElement;
let editFlag = false;
let editId = '';

/*** EVENT LISTENERS ***/

// listens for submit event in the form which is the button type
form.addEventListener('submit', addItem);

// clear button event listener
clearBtn.addEventListener('click', clearItems);

// load the items in the local storage after refreshing the page in the UI
window.addEventListener('DOMContentLoaded', setUpItems);

/*** FUNCTIONS ***/

// form submit function to dynamically add list and buttons
function addItem(event) {
    // stops the default behaviour of submitting to a server
    event.preventDefault();

    // getting value of the input
    const value = grocery.value;
    // unique id created for each input to be kept in local storage
    const id = new Date().getTime().toString();

    if (value && !editFlag) {
        // list items within the article in the HTML
        createListItem(id, value);

        // display alert
        displayAlert('item added to the list', 'success');
        // show the container which is hidden by default in CSS
        groceryContainer.classList.add('show-container');

        // add to local storage
        addToLocalStorage(id, value)
        // the input box is cleared after submit
        setBackToDefault()
    }
    else if (value && editFlag) {
        // editElement contains the value of the 'title' in <p> which has been assigned to grocery.value as edit button is clicked
        // reassign the value of editElement to grocery.value
        editElement.innerHTML = value;
        displayAlert('value changed', 'success');

        // edit the local storage as well
        editLocalStorage(editId, value);

        setBackToDefault();
    }
    else {
        displayAlert('please enter a value', 'danger')
    }
}

// function to create the list of items 
function createListItem(id, value) {
    // <article> tag assigned into element variable
    const element = document.createElement('article');
    // add class in the HTML <article> tag
    element.classList.add('grocery-item');
    // add dataset attribute to the HTML <article> tag
    let attr = document.createAttribute('data-id');
    // unique id given to each input value
    attr.value = id;
    element.setAttributeNode(attr);
    // dynamically create list in the HTML
    element.innerHTML = `<p class="title">${value}</p>
                         <div class="btn-container">
                            <!-- edit button --!>
                            <button type="button" class="edit-btn">
                                <i class="fas fa-edit"></i>
                            </button>
                            <!-- delete button --!>
                            <button type="button" class="delete-btn">
                                <i class="fas fa-trash"></i>
                            </button>
                         </div>
                         `;

    // buttons are only accessible within this function, so event listener set up inside
    const editBtn = element.querySelector('.edit-btn');
    const deleteBtn = element.querySelector('.delete-btn');

    editBtn.addEventListener('click', editButton);
    deleteBtn.addEventListener('click', deleteButton);

    // append child element in the main parent div tag of class 'grocery-list'
    groceryList.appendChild(element);
}

// alert display function
function displayAlert(text, action) {
    alert.textContent = text;

    // action represents the danger/ success class to be added to the classList
    alert.classList.add(`alert-${action}`);

    // remove alert after a certain time
    setTimeout(function () {
        alert.textContent = "";
        alert.classList.remove(`alert-${action}`);
    }, 1000);

}

// clear items function
function clearItems() {
    // the dynamically added articles with class 'grocery-item' are targeted 
    const items = document.querySelectorAll('.grocery-item');
    if (items.length > 0) {
        items.forEach(function (item) {
            groceryList.removeChild(item);
        })
    };
    // the show-container class is removed 
    groceryContainer.classList.remove('show-container');
    displayAlert('the list has been cleared', 'danger');

    // clear the local storage
    localStorage.removeItem('groceryList');
    setBackToDefault();
}

// set local storage back to default
function setBackToDefault() {
    grocery.value = "";
    editFlag = false;
    editId = "";
    submitBtn.textContent = "submit"
}

// function of edit button in item
function editButton(e) {
    const element = e.currentTarget.parentElement.parentElement;

    // set the edit option variables
    // to access the 'title' class of the <p> tag which is within the same parent element as 'btn-container'
    // 'title' is the list content after the submission
    editElement = e.currentTarget.parentElement.previousElementSibling;

    // clicking on the edit button will change the input value to the value of the respective list item
    grocery.value = editElement.innerHTML;
    editFlag = true;
    editId = element.dataset.id;

    // change the button name as editing takes place
    submitBtn.textContent = 'edit';
};

// function of delete button in item
function deleteButton(e) {
    // remove the 'grocery-item' class that has been added dynamically to remove the targeted innerHTML content
    // the parent element of the button is 'btn-container', which has a parent element of 'grocery-item'
    const element = e.currentTarget.parentElement.parentElement;
    groceryList.removeChild(element);

    // when the last item is removed, the 'show-container' class removed as well
    if (groceryList.children.length === 0) {
        groceryContainer.classList.remove('show-container');
    };
    displayAlert('item removed', 'danger');
    setBackToDefault();

    // access the unique id given to each input 
    const id = element.dataset.id;

    // remove from local storage
    removeFromLocalStorage(id);
};

/*** LOCAL STORAGE ***/
function addToLocalStorage(id, value) {
    // objects with same key:value pair names written as ES6
    // new input id & values stored in grocery
    const grocery = { id, value };

    let items = getLocalStorage()

    // new input items(objects containing id & value) are pushed into the items array
    items.push(grocery);

    // contents in the array converted to string for storing
    localStorage.setItem('groceryList', JSON.stringify(items));
}

function getLocalStorage() {
    // using ternary operators, check if local storage has any item
    // if items are present, strings in local storage are converted to array; otherwise empty arrays are returned
    return localStorage.getItem("groceryList")
        ? JSON.parse(localStorage.getItem("groceryList"))
        : [];
}

function removeFromLocalStorage(id) {
    let items = getLocalStorage();
    items = items.filter(function (item) {
        // the id of the item whose delete button has been clicked is checked against the id of the current local storage items
        // if the id of the item deleted do not match the ids of the item in the storage, then it is removed  
        if (item.id !== id) {
            console.log(item)
            return item;
        }
    })

    // new values are set into the local storage
    localStorage.setItem('groceryList', JSON.stringify(items));
}

function editLocalStorage(id, value) {
    let items = getLocalStorage();
    // the value of the input is put into the value of the array in case the id matches
    items = items.map(function (item) {
        if (item.id === id) {
            item.value = value;
        }
        return item;
    })

    // overwritten new values are set into the local storage
    localStorage.setItem('groceryList', JSON.stringify(items));
}

/*** SETUP ITEMS ***/
// for loading items in DOMContentLoaded
function setUpItems() {
    let items = getLocalStorage();
    if (items.length > 0) {
        items.forEach(function (item) {
            // the items in the local storage are iterated over,
            // id & value pair passed into the function to create the HTML skeleton
            createListItem(item.id, item.value)

            // 'show-container' class added to the 'grocery-list'
            groceryContainer.classList.add('show-container');
        })
    }
}

