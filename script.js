const candyList = document.getElementById('candyList');
let draggedItem = null;

candyList.addEventListener('dragstart', (e) => {
    if (e.target.getAttribute('contenteditable') === 'true') {
        draggedItem = e.target.parentElement;
        draggedItem.classList.add('dragging');
    }
});

candyList.addEventListener('dragend', (e) => {
    if (draggedItem) {
        draggedItem.classList.remove('dragging');
        draggedItem = null;
    }
});

candyList.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(candyList, e.clientY);
    const draggable = document.querySelector('.dragging');
    if (afterElement == null) {
        candyList.appendChild(draggable);
    } else {
        candyList.insertBefore(draggable, afterElement);
    }
});

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function addItem() {
    const input = document.getElementById('newItemInput');
    const value = input.value.trim();
    if (value) {
        const li = document.createElement('li');
        const div = document.createElement('div');
        div.setAttribute('contenteditable', 'true');
        div.setAttribute('draggable', 'true');
        div.textContent = value;
        li.appendChild(div);
        candyList.appendChild(li);
        input.value = '';
    }
}