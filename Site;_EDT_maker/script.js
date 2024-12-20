document.addEventListener('DOMContentLoaded', () => {
    const days = document.querySelectorAll('.day');
    const modal = document.getElementById('modal');
    const closeButton = document.getElementById('close-button');
    const eventForm = document.getElementById('event-form');
    const modalTitle = document.getElementById('modal-title');
    const submitButton = document.getElementById('submit-button');
    const profileSelect = document.getElementById('profile-select');
    const newProfileButton = document.getElementById('new-profile-button');
    const deleteProfileButton = document.getElementById('delete-profile-button');

    let selectedDay = null;
    let isEditing = false;
    let editingEvent = null;
    let profiles = {};
    let currentProfile = null;

    function loadProfiles() {
        const savedProfiles = localStorage.getItem('profiles');
        profiles = savedProfiles ? JSON.parse(savedProfiles) : {};
        updateProfileSelect();
    }

    function saveProfiles() {
        localStorage.setItem('profiles', JSON.stringify(profiles));
    }

    function updateProfileSelect() {
        profileSelect.innerHTML = '';
        for (const profile in profiles) {
            const option = document.createElement('option');
            option.value = profile;
            option.textContent = profile;
            profileSelect.appendChild(option);
        }
        if (profileSelect.options.length > 0) {
            profileSelect.value = profileSelect.options[0].value;
            currentProfile = profileSelect.value;
            loadEvents();
        }
    }

    function loadEvents() {
        clearEvents();
        if (profiles[currentProfile]) {
            for (const day in profiles[currentProfile]) {
                const dayElement = document.querySelector(`.day[data-day="${day}"]`);
                profiles[currentProfile][day].forEach(event => {
                    const eventElement = createEventElement(event.title, event.startTime, event.endTime);
                    eventElement.style.top = event.topPosition;
                    eventElement.style.height = event.height;
                    dayElement.appendChild(eventElement);
                });
            }
        }
    }

    function clearEvents() {
        days.forEach(day => {
            day.innerHTML = day.dataset.day;
        });
    }

    function createEventElement(title, startTime, endTime) {
        const eventElement = document.createElement('div');
        eventElement.classList.add('event');
        eventElement.textContent = `${startTime} - ${endTime} : ${title}`;

        const startHour = parseInt(startTime.split(':')[0]);
        const startMinute = parseInt(startTime.split(':')[1]);
        const endHour = parseInt(endTime.split(':')[0]);
        const endMinute = parseInt(endTime.split(':')[1]);

        const topPosition = (startHour - 7) * 50 + (startMinute / 60) * 50;
        const height = (endHour - startHour) * 50 + ((endMinute - startMinute) / 60) * 50;

        eventElement.style.top = `${topPosition}px`;
        eventElement.style.height = `${height}px`;

        eventElement.addEventListener('click', () => {
            isEditing = true;
            editingEvent = eventElement;
            selectedDay = eventElement.parentElement;
            modalTitle.textContent = 'Modifier un événement';
            submitButton.textContent = 'Enregistrer';
            const [startTime, endTimeAndTitle] = eventElement.textContent.split(' - ');
            const [endTime, title] = endTimeAndTitle.split(' : ');
            document.getElementById('event-title').value = title;
            document.getElementById('event-start-time').value = startTime;
            document.getElementById('event-end-time').value = endTime;
            modal.style.display = 'block';
        });

        return eventElement;
    }

    days.forEach(day => {
        day.addEventListener('click', (e) => {
            if (e.target.classList.contains('event')) {
                return;
            }
            selectedDay = day;
            isEditing = false;
            modalTitle.textContent = 'Ajouter un événement';
            submitButton.textContent = 'Ajouter';
            modal.style.display = 'block';
        });
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    eventForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const title = document.getElementById('event-title').value;
        const startTime = document.getElementById('event-start-time').value;
        const endTime = document.getElementById('event-end-time').value;

        const startHour = parseInt(startTime.split(':')[0]);
        const startMinute = parseInt(startTime.split(':')[1]);
        const endHour = parseInt(endTime.split(':')[0]);
        const endMinute = parseInt(endTime.split(':')[1]);

        if (startHour < 7 || endHour > 18 || (endHour === 18 && endMinute > 0)) {
            alert('Les événements doivent être entre 7h00 et 18h00.');
            return;
        }

        const topPosition = (startHour - 7) * 50 + (startMinute / 60) * 50;
        const height = (endHour - startHour) * 50 + ((endMinute - startMinute) / 60) * 50;

        let eventElement;
        if (isEditing) {
            eventElement = editingEvent;
            eventElement.textContent = `${startTime} - ${endTime} : ${title}`;
        } else {
            eventElement = createEventElement(title, startTime, endTime);
            selectedDay.appendChild(eventElement);
        }

        eventElement.style.top = `${topPosition}px`;
        eventElement.style.height = `${height}px`;

        const day = selectedDay.dataset.day;
        if (!profiles[currentProfile]) {
            profiles[currentProfile] = {};
        }
        if (!profiles[currentProfile][day]) {
            profiles[currentProfile][day] = [];
        }
        const eventDetails = { title, startTime, endTime, topPosition, height };
        if (isEditing) {
            const index = profiles[currentProfile][day].findIndex(ev => ev.title === editingEvent.title && ev.startTime === editingEvent.startTime);
            profiles[currentProfile][day][index] = eventDetails;
        } else {
            profiles[currentProfile][day].push(eventDetails);
        }

        saveProfiles();
        modal.style.display = 'none';
        eventForm.reset();
    });

    newProfileButton.addEventListener('click', () => {
        const profileName = prompt('Entrez le nom du nouveau profil:');
        if (profileName && !profiles[profileName]) {
            profiles[profileName] = {};
            saveProfiles();
            updateProfileSelect();
        }
    });

    deleteProfileButton.addEventListener('click', () => {
        if (currentProfile && confirm(`Voulez-vous vraiment supprimer le profil "${currentProfile}" ?`)) {
            delete profiles[currentProfile];
            saveProfiles();
            updateProfileSelect();
        }
    });

    profileSelect.addEventListener('change', () => {
        currentProfile = profileSelect.value;
        loadEvents();
    });

    loadProfiles();
});
