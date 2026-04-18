// ===================================
// Authentication Check
// ===================================
// Check if user is logged in, redirect to login if not
const isLoggedIn = localStorage.getItem('isLoggedIn');
if (!isLoggedIn || isLoggedIn !== 'true') {
    window.location.href = 'login.html';
}

// ===================================
// Application State
// ===================================
const appState = {
    currentPage: 'dashboard',
    blasts: [],
    templates: [],
    user: JSON.parse(localStorage.getItem('userData') || '{}')
};

// ===================================
// Navigation
// ===================================
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const pageName = item.getAttribute('data-page');
            switchPage(pageName);
        });
    });

    // New blast button
    const newBlastBtn = document.getElementById('new-blast-btn');
    if (newBlastBtn) {
        newBlastBtn.addEventListener('click', () => switchPage('disparo'));
    }
}

function switchPage(pageName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === pageName) {
            item.classList.add('active');
        }
    });

    // Update pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
        appState.currentPage = pageName;

        // Load page-specific data
        if (pageName === 'dashboard') {
            loadDashboard();
        } else if (pageName === 'disparo') {
            // Reinitialize disparo page when switching to it
            safeInitDisparoPage();
        } else if (pageName === 'numero') {
            loadWABAConfig();
        } else if (pageName === 'perfil') {
            loadProfileData();
        }
    }
}

// ===================================
// Dashboard
// ===================================
async function loadDashboard() {
    try {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.LIST_BLASTS), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(addAuthToBody({}))
        });

        if (!response.ok) {
            throw new Error('Falha ao carregar disparos');
        }

        const result = await response.json();

        // Handle different possible response structures
        let blasts = [];
        if (Array.isArray(result)) {
            blasts = result;
        } else if (result.result && Array.isArray(result.result)) {
            // Correct property from API based on screenshot
            blasts = result.result;
        } else if (result.blasts && Array.isArray(result.blasts)) {
            blasts = result.blasts;
        } else if (result.data && Array.isArray(result.data)) {
            blasts = result.data;
        }

        appState.blasts = blasts;
        updateDashboardStats();
        renderBlastsTable();

    } catch (error) {
        console.error('Error loading dashboard data:', error);

        // On error, show empty state
        appState.blasts = [];
        updateDashboardStats();
        renderBlastsTable();
    }
}

function updateDashboardStats() {
    const total = appState.blasts.length;
    const andamento = appState.blasts.filter(b => b.status === 'Andamento').length;
    const finalizado = appState.blasts.filter(b => b.status === 'Finalizado').length;
    const totalContacts = appState.blasts.reduce((sum, b) => sum + b.tamanho_lista, 0);

    document.getElementById('total-blasts').textContent = total;
    document.getElementById('ongoing-blasts').textContent = andamento;
    document.getElementById('completed-blasts').textContent = finalizado;
    document.getElementById('total-contacts').textContent = totalContacts.toLocaleString();
}

function renderBlastsTable() {
    const tbody = document.getElementById('blasts-table-body');

    if (appState.blasts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                    Nenhum disparo realizado ainda
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = appState.blasts.map(blast => `
        <tr>
            <td><strong>${blast.nome_campanha}</strong></td>
            <td>${blast.hora_inicio}</td>
            <td>${blast.tamanho_lista.toLocaleString()}</td>
            <td>
                <span class="status-badge status-${blast.status}">
                    ${getStatusText(blast.status)}
                </span>
            </td>
            <td>
                <button class="action-btn" onclick="viewBlastDetails(${blast.id})" title="Ver detalhes">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 3C4.5 3 1.73 5.11 1 8C1.73 10.89 4.5 13 8 13C11.5 13 14.27 10.89 15 8C14.27 5.11 11.5 3 8 3Z" stroke="currentColor" stroke-width="1.5"/>
                        <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                </button>
            </td>
        </tr>
    `).join('');
}

function getStatusText(status) {
    const statusMap = {
        'Andamento': 'Andamento',
        'Finalizado': 'Finalizado',
        'Interrompido': 'Interrompido'
    };
    return statusMap[status] || status;
}

async function viewBlastDetails(id) {
    const blast = appState.blasts.find(b => b.id === id);
    if (blast) {
        // For production, fetch from backend with ID in body
        // const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_BLAST), {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ id: id })
        // });
        // const blastDetails = await response.json();

        alert(`Detalhes do disparo:\n\nCampanha: ${blast.nome_campanha}\nData/Hora: ${blast.hora_inicio}\nContatos: ${blast.tamanho_lista}\nStatus: ${getStatusText(blast.status)}`);
    }
}

// ===================================
// Disparo Page
// ===================================
async function loadTemplates() {
    try {
        const authToken = localStorage.getItem('authToken');

        if (!authToken) {
            console.warn('No auth token found');
            return;
        }

        const response = await fetch(getApiUrl('/get-templates'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authToken: authToken })
        });

        const result = await response.json();

        if (result.success === true || result.success === 'true') {
            const templates = result.templates || [];
            populateCustomSelect(templates);
        } else {
            const message = result.message || 'Falha ao carregar templates';
            console.warn(message);
            showModal('Aviso', message, 'warning');
        }
    } catch (error) {
        console.error('Error loading templates:', error);
        showModal('Erro', 'Erro ao carregar templates. Por favor, tente novamente.', 'error');
    }
}

function populateCustomSelect(templates) {
    const optionsContainer = document.getElementById('template-select-options');
    const hiddenSelect = document.getElementById('template-select');

    // Clear existing options
    optionsContainer.innerHTML = '';
    while (hiddenSelect.options.length > 0) {
        hiddenSelect.remove(0);
    }

    // Add templates
    templates.forEach(template => {
        // Add to custom select
        const option = document.createElement('div');
        option.className = 'custom-select-option';
        option.textContent = template;
        option.setAttribute('data-value', template);
        option.addEventListener('click', () => selectTemplate(template));
        optionsContainer.appendChild(option);

        // Add to hidden select
        const selectOption = document.createElement('option');
        selectOption.value = template;
        selectOption.textContent = template;
        hiddenSelect.appendChild(selectOption);
    });
}

function selectTemplate(value) {
    const display = document.getElementById('template-select-display');
    const dropdown = document.getElementById('template-select-dropdown');
    const options = document.querySelectorAll('.custom-select-option');
    const hiddenSelect = document.getElementById('template-select');

    // Update display (use select-value class instead of select-placeholder for selected items)
    display.innerHTML = `<span class="select-value">${value}</span><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>`;
    display.classList.remove('active');
    display.classList.add('selected');

    // Update options
    options.forEach(opt => {
        opt.classList.remove('selected');
        if (opt.getAttribute('data-value') === value) {
            opt.classList.add('selected');
        }
    });

    // Update hidden select
    hiddenSelect.value = value;

    // Close dropdown
    dropdown.style.display = 'none';
}

function initCustomSelect() {
    const display = document.getElementById('template-select-display');
    const dropdown = document.getElementById('template-select-dropdown');
    const wrapper = document.getElementById('template-select-wrapper');

    if (!display || !dropdown || !wrapper) return;

    // Prevent duplicate initialization
    if (wrapper.dataset.initialized === 'true') {
        console.log('Custom select already initialized, skipping');
        return;
    }
    wrapper.dataset.initialized = 'true';

    // Toggle dropdown
    display.addEventListener('click', (e) => {
        try {
            console.log('custom select clicked');
            e.preventDefault();
            e.stopPropagation();
            const isOpen = dropdown.style.display !== 'none';
            dropdown.style.display = isOpen ? 'none' : 'block';
            display.classList.toggle('active');
        } catch (err) {
            console.error('Error in custom select click handler', err);
        }
    });

    // Close dropdown when clicking outside
    const closeDropdownOutside = (e) => {
        if (!wrapper.contains(e.target)) {
            dropdown.style.display = 'none';
            display.classList.remove('active');
        }
    };

    // Delay adding the outside click listener to avoid immediate closure
    setTimeout(() => {
        try {
            document.addEventListener('click', closeDropdownOutside);
        } catch (err) {
            console.error('Error adding outside click listener for custom select', err);
        }
    }, 100);

    // Close dropdown when pressing Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            dropdown.style.display = 'none';
            display.classList.remove('active');
        }
    });
}


// Track retry attempts to prevent infinite loops
let initDisparoRetryCount = 0;
const MAX_INIT_RETRIES = 10;

function initDisparoPage() {
    const form = document.getElementById('blast-form');
    const contactsInput = document.getElementById('contacts-file');
    const contactsUploadArea = document.getElementById('contacts-upload-area');
    const templateSelect = document.getElementById('template-select');

    // Only check for essential elements (media upload is commented out in HTML)
    if (!form || !contactsUploadArea) {
        if (initDisparoRetryCount < MAX_INIT_RETRIES) {
            initDisparoRetryCount++;
            console.warn(`Some form elements not found, retrying... (${initDisparoRetryCount}/${MAX_INIT_RETRIES})`, {
                form: !!form,
                contactsUploadArea: !!contactsUploadArea
            });
            setTimeout(() => initDisparoPage(), 100);
            return;
        } else {
            console.error('Failed to initialize disparo page after max retries');
            return;
        }
    }

    console.log('Initializing disparo page');
    initDisparoRetryCount = 0; // Reset counter on success

    // Load templates on page open
    loadTemplates();

    // Initialize custom select
    initCustomSelect();

    // Media upload (only if elements exist - they're currently commented out in HTML)
    // const mediaInput = document.getElementById('media-input');
    // const mediaUploadArea = document.getElementById('media-upload-area');
    // if (mediaUploadArea && mediaInput) {
    //     try {
    //         mediaUploadArea.addEventListener('click', (e) => {
    //             // Ignore clicks bubbling from the input itself
    //         if (e.target === mediaInput) return;

    //         try {
    //             e.preventDefault();
    //             e.stopPropagation();
    //             if (!e.target.closest('.remove-media-btn')) {
    //                 console.log('Clicking media input');
    //                 mediaInput.click();
    //             }
    //         } catch (err) {
    //             console.error('Error in mediaUploadArea click handler', err);
    //         }
    //  });

    //         mediaInput.addEventListener('change', () => {
    //             console.log('Media input changed');
    //             handleMediaUpload();
    //         });
    //     } catch (err) {
    //         console.error('Error attaching media upload handlers', err);
    //     }
    // }

    // const removeMediaBtn = document.getElementById('remove-media-btn');
    // if (removeMediaBtn) {
    //     removeMediaBtn.addEventListener('click', (e) => {
    //         e.stopPropagation();
    //         clearMediaUpload();
    //     });
    // }

    // Contacts upload
    if (contactsUploadArea && contactsInput) {
        // Prevent duplicate event listeners
        if (contactsUploadArea.dataset.initialized !== 'true') {
            contactsUploadArea.dataset.initialized = 'true';

            try {
                contactsUploadArea.addEventListener('click', (e) => {
                    // Ignore clicks bubbling from the input itself to prevent infinite loops
                    if (e.target === contactsInput) return;

                    try {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!e.target.closest('.remove-file-btn')) {
                            console.log('Clicking contacts input');
                            contactsInput.click();
                        }
                    } catch (err) {
                        console.error('Error in contactsUploadArea click handler', err);
                    }
                });

                contactsInput.addEventListener('change', () => {
                    console.log('Contacts input changed');
                    handleContactsUpload();
                });
            } catch (err) {
                console.error('Error attaching contacts upload handlers', err);
            }
        }
    }

    const removeContactsBtn = document.getElementById('remove-contacts-btn');
    if (removeContactsBtn) {
        removeContactsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            clearContactsUpload();
        });
    }

    // Template selection
    if (templateSelect) {
        templateSelect.addEventListener('change', updatePreview);
    }

    // Form submission - prevent duplicate listeners
    if (form.dataset.initialized !== 'true') {
        form.dataset.initialized = 'true';
        form.addEventListener('submit', handleBlastSubmit);
    }

    // Drag and drop for media
    // mediaUploadArea.addEventListener('dragover', (e) => {
    //     e.preventDefault();
    //     mediaUploadArea.style.borderColor = 'var(--border-hover)';
    // });

    //     mediaUploadArea.addEventListener('dragleave', () => {
    //         mediaUploadArea.style.borderColor = 'var(--border-color)';
    //     });

    //     mediaUploadArea.addEventListener('drop', (e) => {
    //         e.preventDefault();
    //         mediaUploadArea.style.borderColor = 'var(--border-color)';

    //         const files = e.dataTransfer.files;
    //         if (files.length > 0) {
    //             mediaInput.files = files;
    //             handleMediaUpload();
    //         }
    //     });
    // }

    // function handleMediaUpload() {
    //     const file = document.getElementById('media-input').files[0];
    //     if (!file) return;

    //     const reader = new FileReader();
    //     reader.onload = (e) => {
    //         const preview = document.getElementById('media-preview');
    //         const placeholder = document.querySelector('#media-upload-area .upload-placeholder');
    //         const previewImage = document.getElementById('preview-image');
    //         const previewVideo = document.getElementById('preview-video');

    //         placeholder.style.display = 'none';
    //         preview.style.display = 'block';

    //         if (file.type.startsWith('image/')) {
    //             previewImage.src = e.target.result;
    //             previewImage.style.display = 'block';
    //             previewVideo.style.display = 'none';

    //             // Update WhatsApp preview
    //             const whatsappMedia = document.getElementById('preview-media');
    //             const whatsappImage = document.getElementById('preview-media-image');
    //             whatsappMedia.style.display = 'block';
    //             whatsappImage.src = e.target.result;
    //             whatsappImage.style.display = 'block';
    //             document.getElementById('preview-media-video').style.display = 'none';
    //         } else if (file.type.startsWith('video/')) {
    //             previewVideo.src = e.target.result;
    //             previewVideo.style.display = 'block';
    //             previewImage.style.display = 'none';

    //             // Update WhatsApp preview
    //             const whatsappMedia = document.getElementById('preview-media');
    //             const whatsappVideo = document.getElementById('preview-media-video');
    //             whatsappMedia.style.display = 'block';
    //             whatsappVideo.src = e.target.result;
    //             whatsappVideo.style.display = 'block';
    //             document.getElementById('preview-media-image').style.display = 'none';
    //         }
    //     };
    //     reader.readAsDataURL(file);
    // }

    // function clearMediaUpload() {
    //     const mediaInput = document.getElementById('media-input');
    //     const preview = document.getElementById('media-preview');
    //     const placeholder = document.querySelector('#media-upload-area .upload-placeholder');

    //     mediaInput.value = '';
    //     preview.style.display = 'none';
    //     placeholder.style.display = 'block';

    //     document.getElementById('preview-image').src = '';
    //     document.getElementById('preview-video').src = '';

    //     // Clear WhatsApp preview
    //     document.getElementById('preview-media').style.display = 'none';
    // }

    function handleContactsUpload() {
        const file = document.getElementById('contacts-file').files[0];
        if (!file) {
            console.warn('No file selected');
            return;
        }

        console.log('File selected:', file.name);

        const selected = document.getElementById('contacts-selected');
        const placeholder = document.querySelector('#contacts-upload-area .upload-placeholder');
        const filename = document.getElementById('contacts-filename');

        if (!selected || !placeholder || !filename) {
            console.error('Could not find required elements for contacts upload');
            return;
        }

        placeholder.style.display = 'none';
        selected.style.display = 'flex';
        filename.textContent = file.name;

        console.log('File display updated:', file.name);
    }

    function clearContactsUpload() {
        const contactsInput = document.getElementById('contacts-file');
        const selected = document.getElementById('contacts-selected');
        const placeholder = document.querySelector('#contacts-upload-area .upload-placeholder');

        contactsInput.value = '';
        selected.style.display = 'none';
        placeholder.style.display = 'block';
    }

    function updatePreview() {
        const templateSelect = document.getElementById('template-select');
        const previewText = document.getElementById('preview-text');

        const templateMessages = {
            'template1': 'Olá! 🎉 Não perca nossa promoção especial! Aproveite descontos de até 50% em produtos selecionados.',
            'template2': 'Informamos que nosso horário de atendimento foi atualizado. Confira os novos horários em nosso site.',
            'template3': 'Lembrete: Você tem um compromisso agendado para amanhã às 14h. Confirme sua presença!'
        };

        const selectedTemplate = templateSelect.value;
        if (selectedTemplate && templateMessages[selectedTemplate]) {
            previewText.textContent = templateMessages[selectedTemplate];
        } else {
            previewText.textContent = 'Sua mensagem aparecerá aqui...';
        }
    }

    async function handleBlastSubmit(e) {
        e.preventDefault();

        const campaignName = document.getElementById('campaign-name').value;
        const template = document.getElementById('template-select').value;
        // const mediaFile = document.getElementById('media-input').files[0] ?? "";
        const contactsFile = document.getElementById('contacts-file').files[0];

        if (!campaignName || !template || !contactsFile) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        // Create FormData for file upload
        // Add token and userId for authentication
        const auth = getAuthCredentials();
        const formData = new FormData();
        formData.append('campaignName', campaignName);
        formData.append('template', template);
        formData.append('token', auth.token);
        formData.append('userId', auth.userId);
        // if (mediaFile) {
        //     formData.append('media', mediaFile);
        // }
        formData.append('contacts', contactsFile);

        try {
            // Show loading state
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="animation: spin 1s linear infinite;"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="50" stroke-dashoffset="25"/></svg> Enviando...';

            // Make API call - all data sent in body
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CREATE_BLAST), {
                method: 'POST',
                body: formData
                // Note: Don't set Content-Type header for FormData, browser will set it automatically
            });

            if (!response.ok) {
                throw new Error('Falha ao criar disparo');
            }

            const result = await response.json();

            // Success
            alert('Disparo iniciado com sucesso!');

            // Reset form
            e.target.reset();
            // clearMediaUpload();
            clearContactsUpload();

            // Switch to dashboard
            switchPage('dashboard');

            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;

        } catch (error) {
            console.error('Error creating blast:', error);
            alert('Erro ao iniciar disparo. Por favor, tente novamente.');

            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            // submitBtn.innerHTML = originalText;
        }
    }
}

// ===================================
// Profile Page
// ===================================
function initProfilePage() {
    const form = document.getElementById('profile-form');

    // Load existing profile data
    loadProfileData();

    form.addEventListener('submit', handleProfileSubmit);
}

async function loadProfileData() {
    try {
        // Fetch profile from API
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PROFILE), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(addAuthToBody({}))
        });

        if (!response.ok) {
            if (response.status === 401) {
                console.warn('Unauthorized, redirecting to login');
                window.location.href = 'login.html';
                return;
            }
            throw new Error('Falha ao carregar perfil');
        }

        const result = await response.json();

        if (result.success === true || result.success === 'true') {
            const profile = result.user || result.profile || {};

            // Save to localStorage
            localStorage.setItem('profile', JSON.stringify(profile));

            // Update UI
            if (profile.nome) {
                document.getElementById('account-name').value = profile.nome;
            }
            if (profile.email) {
                document.getElementById('account-email').value = profile.email;
            }
        } else {
            console.warn('Profile fetch returned success: false', result);
        }
    } catch (error) {
        console.error('Error loading profile:', error);

        // Fallback to localStorage
        const savedProfile = JSON.parse(localStorage.getItem('profile') || '{}');
        if (savedProfile.name) {
            document.getElementById('account-name').value = savedProfile.name;
        }
        if (savedProfile.email) {
            document.getElementById('account-email').value = savedProfile.email;
        }
    }
}

async function handleProfileSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('account-name').value;
    const email = document.getElementById('account-email').value;
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validate password change if provided
    if (newPassword || confirmPassword) {
        if (!currentPassword) {
            alert('Por favor, informe sua senha atual.');
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem.');
            return;
        }
        if (newPassword.length < 6) {
            alert('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }
    }

    const profileData = { name, email };

    try {
        // Save to localStorage (in production, send to backend)
        localStorage.setItem('profile', JSON.stringify(profileData));

        // If password change requested, handle separately
        // All data sent in body for webhook compatibility
        if (newPassword) {
            // await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD), {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ currentPassword, newPassword })
            // });

            // Clear password fields
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
        }

        alert('Perfil atualizado com sucesso!');
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Erro ao atualizar perfil. Por favor, tente novamente.');
    }
}

// ===================================
// WABA Configuration Page
// ===================================
function initWABAPage() {
    const form = document.getElementById('waba-form');

    // Load existing configuration
    loadWABAConfig();

    form.addEventListener('submit', handleWABASubmit);

    // Initialize toggle password button
    initTogglePasswordButton();
}

async function loadWABAConfig() {
    try {
        // Fetch WABA config from webhook
        // Use addAuthToBody to include token and userId
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_WABA_CONFIG), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(addAuthToBody({}))
        });

        if (!response.ok) {
            console.error('API error:', response.status, response.statusText);
            throw new Error(`API returned ${response.status}`);
        }

        const result = await response.json();

        // Check if request was successful
        if ((result.success === true || result.success === 'true') && result.config) {
            const config = result.config;

            // Populate form fields with fetched data
            if (config.tokenMeta) {
                document.getElementById('facebook-token').value = config.tokenMeta;
            }
            if (config.numero_id) {
                document.getElementById('phone-number-id').value = config.numero_id;
            }
            if (config.waba_id) {
                document.getElementById('waba-id').value = config.waba_id;
            }

            // Also save to localStorage for offline access
            localStorage.setItem('wabaConfig', JSON.stringify(config));
        } else {
            console.log('No WABA config found or error fetching config');
            // Try to load from localStorage as fallback
            const savedConfig = JSON.parse(localStorage.getItem('wabaConfig') || '{}');

            if (savedConfig.token) {
                document.getElementById('facebook-token').value = savedConfig.token;
            }
            if (savedConfig.phoneNumberId) {
                document.getElementById('phone-number-id').value = savedConfig.phoneNumberId;
            }
            if (savedConfig.wabaId) {
                document.getElementById('waba-id').value = savedConfig.wabaId;
            }
        }
    } catch (error) {
        console.error('Error loading WABA config:', error);
        // Fallback to localStorage
        const savedConfig = JSON.parse(localStorage.getItem('wabaConfig') || '{}');

        if (savedConfig.token) {
            document.getElementById('facebook-token').value = savedConfig.token;
        }
        if (savedConfig.phoneNumberId) {
            document.getElementById('phone-number-id').value = savedConfig.phoneNumberId;
        }
        if (savedConfig.wabaId) {
            document.getElementById('waba-id').value = savedConfig.wabaId;
        }
    }
}

async function handleWABASubmit(e) {
    e.preventDefault();

    const tokenMeta = document.getElementById('facebook-token').value;
    const phoneNumberId = document.getElementById('phone-number-id').value;
    const wabaId = document.getElementById('waba-id').value;
    const token = localStorage.getItem('authToken');

    const config = { token, tokenMeta, phoneNumberId, wabaId };

    try {
        // Save to localStorage
        localStorage.setItem('wabaConfig', JSON.stringify(config));

        // Send to webhook - token and userId automatically added by addAuthToBody
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_WABA), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(addAuthToBody(config))
        });

        const result = await response.json();

        // Check success field in response
        if (result.success === true) {
            showModal('Sucesso!', 'Configurações salvas com sucesso!', 'success');
        } else {
            showModal('Erro', 'Falha ao salvar configurações. Por favor, tente novamente.', 'error');
        }

    } catch (error) {
        console.error('Error updating WABA config:', error);
        showModal('Erro', 'Erro ao salvar configurações. Por favor, tente novamente.', 'error');
    }
}

// ===================================
// Password Toggle
// ===================================
function initTogglePasswordButton() {
    const toggleBtn = document.getElementById('toggle-facebook-token');
    const passwordInput = document.getElementById('facebook-token');

    if (!toggleBtn || !passwordInput) return;

    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
        } else {
            passwordInput.type = 'password';
        }
    });
}

// ===================================
// Modal for Success/Error Messages
// ===================================
function showModal(title, message, type = 'success') {
    // Remove existing modal if any
    const existingModal = document.querySelector('.custom-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'custom-modal';

    let iconSvg = '';
    if (type === 'success') {
        iconSvg = `
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="4"/>
                <path d="M20 32L28 40L44 24" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    } else if (type === 'warning') {
        iconSvg = `
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <path d="M32 4L4 56H60L32 4Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
                <path d="M32 24V40" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                <circle cx="32" cy="48" r="2" fill="currentColor"/>
            </svg>
        `;
    } else {
        iconSvg = `
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="4"/>
                <path d="M32 20V36M32 44H32.02" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
            </svg>
        `;
    }

    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content ${type}">
            <div class="modal-icon">
                ${iconSvg}
            </div>
            <h2 class="modal-title">${title}</h2>
            <p class="modal-message">${message}</p>
            <button class="modal-btn" onclick="closeModal()">OK</button>
        </div>
    `;

    document.body.appendChild(modal);

    // Trigger animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);

    // Auto close after 5 seconds
    setTimeout(() => {
        closeModal();
    }, 5000);
}

function closeModal() {
    const modal = document.querySelector('.custom-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// ===================================
// Initialization
// ===================================
let disparoPageInitialized = false;

function safeInitDisparoPage() {
    // Reset and reinitialize to ensure event listeners are properly attached
    disparoPageInitialized = false;
    initDisparoRetryCount = 0;
    initDisparoPage();
    disparoPageInitialized = true;
}

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    safeInitDisparoPage();
    initProfilePage();
    initWABAPage();

    // Load initial page
    loadDashboard();
});

// Add spin animation for loading state
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
