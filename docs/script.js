document.addEventListener('DOMContentLoaded', async function () {
    // Cek apakah kita berada di halaman utama (index.html) atau documentation.html
    const currentPage = window.location.pathname;
    const isHomePage = currentPage === '/' || currentPage.endsWith('index.html') || currentPage === '';
    const isDocumentationPage = currentPage.endsWith('documentation.html');

    // --- Logika untuk Top Navbar Mobile ---
    const topMenuButton = document.getElementById('mobile-menu-button-top');
    const topMobileMenu = document.getElementById('mobile-menu-top');
    const hamburgerIcon = document.getElementById('hamburger-icon');

    if (topMenuButton && topMobileMenu && hamburgerIcon) {
        topMenuButton.addEventListener('click', function(event) {
            event.stopPropagation();
            const isExpanded = topMenuButton.getAttribute('aria-expanded') === 'true' || false;
            topMenuButton.setAttribute('aria-expanded', !isExpanded);
            topMobileMenu.classList.toggle('hidden');

            // Toggle ikon hamburger/close
            if (topMobileMenu.classList.contains('hidden')) {
                hamburgerIcon.classList.remove('fa-times');
                hamburgerIcon.classList.add('fa-bars');
            } else {
                hamburgerIcon.classList.remove('fa-bars');
                hamburgerIcon.classList.add('fa-times');
            }
        });

        // Menutup menu mobile jika diklik di luar area menu atau pada link di dalam menu
        document.addEventListener('click', function(event) {
            if (!topMobileMenu.classList.contains('hidden')) {
                const isClickInsideMenu = topMobileMenu.contains(event.target);
                const isClickOnMenuButton = topMenuButton.contains(event.target);

                if (!isClickInsideMenu && !isClickOnMenuButton) {
                    topMobileMenu.classList.add('hidden');
                    topMenuButton.setAttribute('aria-expanded', 'false');
                    hamburgerIcon.classList.remove('fa-times');
                    hamburgerIcon.classList.add('fa-bars');
                }
            }
        });

        // Menutup menu mobile jika salah satu link di menu mobile diklik
        const mobileNavLinks = topMobileMenu.querySelectorAll('a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Tidak perlu event.stopPropagation() di sini karena kita memang ingin menu tertutup
                topMobileMenu.classList.add('hidden');
                topMenuButton.setAttribute('aria-expanded', 'false');
                hamburgerIcon.classList.remove('fa-times');
                hamburgerIcon.classList.add('fa-bars');
            });
        });
    }
    // --- Akhir Logika Top Navbar Mobile ---


    // Fungsi untuk menginisialisasi elemen umum dan loader
    function initializeCommonElements(set) {
        // Mengisi elemen di navbar atas baru
        setContent('nav-api-icon-top', 'src', set.icon);
        setContent('nav-api-name-top', 'textContent', set.name.main);

        const metaDescElement = document.getElementById('api-description-meta');
        if (metaDescElement) {
            metaDescElement.content = set.description;
        }

        setContent('api-title', 'textContent', set.name.main);

        // Mengisi link eksternal di menu mobile navbar atas
        const mobileNavApiLinksContainer = document.getElementById('mobile-nav-api-links-top');
        if (mobileNavApiLinksContainer) {
            mobileNavApiLinksContainer.innerHTML = '';
            if (set.links?.length) {
                set.links.forEach(link => {
                    const linkElement = document.createElement('a');
                    linkElement.href = link.url;
                    linkElement.textContent = link.name;
                    linkElement.className = 'nav-link-mobile-top block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700'; // Tambahkan kelas styling
                    linkElement.target = '_blank';
                    mobileNavApiLinksContainer.appendChild(linkElement);
                });
            }
        }

        // Set active link di navbar atas (desktop dan mobile)
        const desktopNavLinks = document.querySelectorAll('#top-navbar .nav-link-top');
        const mobileNavLinksInMenu = document.querySelectorAll('#mobile-menu-top .nav-link-mobile-top');

        function setActiveLink(links) {
            links.forEach(link => {
                link.classList.remove('active');
                // Menggunakan getAttribute('href') karena link.href akan menghasilkan URL absolut
                const linkPath = link.getAttribute('href');
                if ((isHomePage && (linkPath === '/' || linkPath === 'index.html')) || (isDocumentationPage && linkPath === '/documentation.html')) {
                    link.classList.add('active');
                }
            });
        }
        setActiveLink(desktopNavLinks);
        setActiveLink(mobileNavLinksInMenu);
    }

    function finalizePageLoad() {
        const pageLoader = document.getElementById('page-loader');
        if (pageLoader) {
            setTimeout(function() {
                document.body.classList.remove('noscroll');
                pageLoader.style.opacity = '0';
                setTimeout(function() {
                    pageLoader.style.display = 'none';
                }, 300);
            }, 500);
        }
    }
    
    document.body.classList.add('noscroll');

    try {
        const set = await (await fetch('/set')).json();
        initializeCommonElements(set);

        if (isHomePage) {
            const endpoints = await (await fetch('/endpoints')).json();

            setContent('api-name-main', 'textContent', set.name.main);
            setContent('api-author', 'textContent', `by ${set.author}`);
            setContent('api-desc-main', 'textContent', set.description);
            setContent('api-copyright', 'textContent', `© ${new Date().getFullYear()} ${set.name.copyright}. All rights reserved.`);
            setContent('api-info-main', 'href', set.info_url);

            setupApiContent(endpoints);
            setupApiButtonHandlers(endpoints);
            setupSearchFunctionality();
        } else if (isDocumentationPage) {
             const currentYearSpan = document.getElementById('current-year');
             if (currentYearSpan) {
                 currentYearSpan.textContent = new Date().getFullYear();
             }
             const footerCopyrightNameSpan = document.getElementById('footer-copyright-name');
             if (footerCopyrightNameSpan) {
                 footerCopyrightNameSpan.textContent = set.name.copyright || 'Your Company Name';
             }
        }

    } catch (error) {
        console.error('Error loading configuration:', error);
    } finally {
        finalizePageLoad();
    }
    
    function setContent(id, property, value) {
        const element = document.getElementById(id);
        if (element) {
            if (property === 'content' && element.tagName === 'META') {
                 element.setAttribute('content', value);
            } else {
                 element[property] = value;
            }
        }
    }

    // Fungsi setupApiLinks sudah diintegrasikan ke initializeCommonElements dan dipindahkan ke navbar
    // Fungsi loader (show/hide) disederhanakan dan dipanggil di awal dan akhir
    
    // Fungsi setupApiContent, createApiItemElement, setupApiButtonHandlers, setupSearchFunctionality, openApiModal
    // sebagian besar tetap sama, namun perlu dipastikan mereka hanya berjalan/relevan untuk index.html.
    // Kelas CSS yang mereka gunakan mungkin perlu disesuaikan dengan tema gelap.

    function setupApiContent(gtw) {
        const apiContent = document.getElementById('api-content');
        if (!apiContent) return; // Hanya jalankan jika elemen ada (di index.html)
        apiContent.innerHTML = ''; // Bersihkan konten sebelum menambahkan

        gtw.endpoints.forEach(category => {
            const categoryHeader = document.createElement('h3');
            // Kelas styling untuk categoryHeader sudah ada di styles.css
            categoryHeader.textContent = category.name;
            apiContent.appendChild(categoryHeader);
    
            const row = document.createElement('div');
            row.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'; // Menggunakan grid untuk layout responsif
            apiContent.appendChild(row);
    
            const sortedItems = Object.entries(category.items)
                .sort(([, a], [, b]) => (a.name || '').localeCompare(b.name || ''))
                .map(([,item]) => item);
            
            sortedItems.forEach((itemData) => { // Hapus isLastItem karena grid menangani spacing
                const itemName = Object.keys(itemData)[0];
                const item = itemData[itemName];
                const itemElement = createApiItemElement(itemName, item);
                row.appendChild(itemElement);
            });
        });
    }
    
    function createApiItemElement(itemName, item) {
        const itemDiv = document.createElement('div');
        // Kelas styling untuk itemDiv (card) sudah ada di styles.css
        // `w-full mb-2` atau `mb-5` tidak lagi diperlukan karena gap pada grid
        itemDiv.className = 'api-item-card'; // Tambahkan kelas generik jika diperlukan untuk styling lebih lanjut
        itemDiv.dataset.name = itemName || '';
        itemDiv.dataset.desc = item.desc || '';
    
        // Struktur internal card API
        // Kelas styling untuk heroSection, title, description, button sudah ada di styles.css
        const heroSection = document.createElement('div');
        heroSection.className = 'heroSection flex flex-col justify-between h-full p-6'; // P-6 untuk padding internal card
    
        const textContent = document.createElement('div');
        // textContent.className = 'flex-grow mr-4 overflow-hidden'; // Disesuaikan
        
        const title = document.createElement('h5');
        title.className = 'text-lg font-semibold truncate mb-1'; // Sesuaikan margin jika perlu
        title.textContent = itemName || 'Unnamed Item';
    
        const description = document.createElement('p');
        description.className = 'text-sm font-medium truncate mb-4'; // Sesuaikan margin
        description.textContent = item.desc || 'No description';
    
        textContent.appendChild(title);
        textContent.appendChild(description);
    
        const button = document.createElement('button');
        button.className = 'get-api-btn mt-auto px-4 py-2 text-sm font-medium rounded-md transition duration-300'; // mt-auto untuk mendorong ke bawah jika card tinggi berbeda
        button.dataset.apiPath = item.path || '';
        button.dataset.apiName = itemName || '';
        button.dataset.apiDesc = item.desc || '';
        button.textContent = 'TRY';
    
        heroSection.appendChild(textContent);
        heroSection.appendChild(button);
        itemDiv.appendChild(heroSection);
    
        return itemDiv;
    }
    
    function setupApiButtonHandlers(gtw) {
        // Pastikan event listener hanya ditambahkan sekali dan relevan dengan halaman
        if (!document.getElementById('api-content')) return;

        document.getElementById('main-content-area').addEventListener('click', event => {
            if (event.target.classList.contains('get-api-btn')) {
                const { apiPath, apiName, apiDesc } = event.target.dataset;
                // Logika find currentItem tetap sama
                const currentItem = gtw.endpoints
                    .flatMap(category => Object.values(category.items))
                    .map(itemData => {
                        const itemName = Object.keys(itemData)[0];
                        return { name: itemName, ...itemData[itemName] };
                    })
                    .find(item => item.path === apiPath && item.name === apiName);
                openApiModal(apiName, apiPath, apiDesc);
            }
        });
    }
    
    function setupSearchFunctionality() {
        const searchInput = document.getElementById('api-search');
        if (!searchInput) return; // Hanya jika ada di halaman
        
        let originalData = null;
        
        // captureOriginalData dan restoreOriginalData perlu disesuaikan dengan struktur card baru jika ada perubahan signifikan
        // Untuk saat ini, asumsikan dataset name dan desc masih ada di elemen card terluar (.api-item-card)
        function captureOriginalData() {
            const result = [];
            const categories = document.querySelectorAll('#api-content h3');
            
            categories.forEach(category => {
                const rowElement = category.nextElementSibling; // Ini adalah .grid
                if (rowElement) {
                    const items = Array.from(rowElement.querySelectorAll('.api-item-card[data-name]')).map(item => {
                        return {
                            element: item.cloneNode(true),
                            name: item.dataset.name,
                            desc: item.dataset.desc
                        };
                    });
                    result.push({
                        categoryElement: category,
                        rowElement: rowElement,
                        items: items
                    });
                }
            });
            return result;
        }
        
        function restoreOriginalData() {
            if (!originalData) return;
            originalData.forEach(categoryData => {
                categoryData.categoryElement.classList.remove('hidden');
                const row = categoryData.rowElement;
                row.innerHTML = ''; // Clear current items
                categoryData.items.forEach(item => {
                    row.appendChild(item.element.cloneNode(true)); // Append original cloned items
                });
            });
        }
        
        // Panggil captureOriginalData setelah konten API dimuat
        // Ini perlu dipastikan dipanggil setelah setupApiContent selesai
        // Cara sederhana: panggil di akhir try block jika isHomePage
        if (document.getElementById('api-content')) {
             originalData = captureOriginalData();
        }

        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            
            if (!originalData) originalData = captureOriginalData(); // Capture jika belum ada

            if (!searchTerm) {
                restoreOriginalData();
                return;
            }
            
            originalData.forEach(categoryData => {
                const visibleItems = [];
                categoryData.items.forEach(item => {
                    const title = item.name?.toLowerCase() || '';
                    const desc = item.desc?.toLowerCase() || '';
                    if (title.includes(searchTerm) || desc.includes(searchTerm)) {
                        visibleItems.push(item.element.cloneNode(true));
                    }
                });

                if (visibleItems.length === 0) {
                    categoryData.categoryElement.classList.add('hidden');
                    categoryData.rowElement.innerHTML = '';
                } else {
                    categoryData.categoryElement.classList.remove('hidden');
                    categoryData.rowElement.innerHTML = '';
                    visibleItems.forEach(itemElement => {
                        categoryData.rowElement.appendChild(itemElement);
                    });
                }
            });
        });
    }
    
    // openApiModal: Penyesuaian kelas CSS untuk input dan tombol agar konsisten dengan tema gelap
    function openApiModal(name, endpoint, description) { // method tidak digunakan
        const modal = document.getElementById('api-modal');
        const modalBackdrop = modal.querySelector('.fixed.inset-0.bg-black');
        const modalContent = modal.querySelector('.relative.z-10');
        const closeModalBtn = document.getElementById('close-modal');
        const submitApiBtn = document.getElementById('submit-api');
        const modalTitle = document.getElementById('modal-title');
        // const apiMethod = document.getElementById('api-method'); // Tidak diubah nilainya, bisa di-hardcode GET jika selalu GET
        const apiDescriptionModal = document.getElementById('api-description'); // Ganti nama variabel agar tidak konflik
        const paramsContainer = document.getElementById('params-container');
        const responseContainer = document.getElementById('response-container');
        const responseData = document.getElementById('response-data');
        const responseStatus = document.getElementById('response-status');
        const responseTime = document.getElementById('response-time');
        
        const existingUrlDisplay = modalContent.querySelector('.urlDisplay'); // Cari di dalam modalContent
        if (existingUrlDisplay) {
            existingUrlDisplay.remove();
        }

        responseContainer.classList.add('hidden');
        responseData.innerHTML = '';
        submitApiBtn.classList.remove('hidden'); // Tampilkan tombol submit
        paramsContainer.classList.remove('hidden'); // Tampilkan kontainer param
        paramsContainer.innerHTML = ''; // Bersihkan parameter lama
        
        modalTitle.textContent = name;
        apiDescriptionModal.textContent = description; // Gunakan variabel baru
        
        const url = new URL(endpoint, window.location.origin);
        const urlParams = url.search ? url.search.substring(1).split('&') : [];
        if (urlParams.length && urlParams[0] !== "") { // Pastikan urlParams tidak kosong array [""]
            urlParams.forEach(param => {
                const [key] = param.split('=');
                if (key) {
                    const isOptional = key.startsWith('_');
                    const placeholderText = `Enter ${key.replace(/^_/, '')}${isOptional ? ' (optional)' : ''}`;
                    
                    const paramField = document.createElement('div');
                    paramField.className = 'mb-3';
                    // Kelas input disesuaikan dengan tema gelap (sudah di styles.css atau Tailwind di HTML)
                    paramField.innerHTML = `
                        <input type='text' id='param-${key}' class='w-full px-3 py-1.5 text-sm rounded-md focus:outline-none focus:ring-1 focus:border-transparent' placeholder='${placeholderText}'>
                        <div id='error-${key}' class='text-red-500 text-xs mt-1 hidden'>This field is required</div>
                    `;
                    paramsContainer.appendChild(paramField);
                }
            });
        } else {
            const placeholderMatch = endpoint.match(/{([^}]+)}/g);
            if (placeholderMatch) {
                placeholderMatch.forEach(match => {
                    const paramName = match.replace(/{|}/g, '');
                    const isOptional = paramName.startsWith('_');
                    const placeholderText = `Enter ${paramName.replace(/^_/, '')}${isOptional ? ' (optional)' : ''}`;
                    
                    const paramField = document.createElement('div');
                    paramField.className = 'mb-3';
                    paramField.innerHTML = `
                        <input type='text' id='param-${paramName}' class='w-full px-3 py-1.5 text-sm rounded-md focus:outline-none focus:ring-1 focus:border-transparent' placeholder='${placeholderText}'>
                        <div id='error-${paramName}' class='text-red-500 text-xs mt-1 hidden'>This field is required</div>
                    `;
                    paramsContainer.appendChild(paramField);
                });
            }
        }
        
        // Jika tidak ada parameter, sembunyikan paramsContainer
        if (paramsContainer.children.length === 0) {
            paramsContainer.classList.add('hidden');
        }

        modal.classList.remove('hidden');
        document.body.classList.add('noscroll');
        
        modal.offsetWidth; // Trigger reflow
        
        modal.classList.add('opacity-100');
        modalBackdrop.classList.add('opacity-50'); // Atau opacity-75 jika di HTML diubah
        modalContent.classList.add('scale-100', 'opacity-100');
        
        const closeModal = function() {
            modal.classList.remove('opacity-100');
            modalBackdrop.classList.remove('opacity-50');
            modalContent.classList.remove('scale-100', 'opacity-100');
            
            setTimeout(() => {
                modal.classList.add('hidden');
                document.body.classList.remove('noscroll');
            }, 300); // Sesuaikan dengan durasi transisi
        };
        
        closeModalBtn.onclick = closeModal;
        modal.onclick = function(event) { // Ubah ke onclick agar bisa di-override jika modal dibuka lagi
            if (event.target === modal) {
                closeModal();
            }
        };
        
        const escapeKeyListener = function(event) {
            if (event.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeKeyListener); // Hapus listener setelah digunakan
            }
        };
        document.addEventListener('keydown', escapeKeyListener);
        
        submitApiBtn.onclick = async function() { // Pastikan onclick di-override setiap kali modal dibuka
            let isValid = true;
            
            document.querySelectorAll('[id^="error-"]').forEach(errorElement => {
                errorElement.classList.add('hidden');
            });
            
            if (paramsContainer.children.length > 0) {
                Array.from(paramsContainer.children).forEach(paramDiv => {
                    const input = paramDiv.querySelector('input');
                    if (input) { // Pastikan input ada
                        const paramName = input.id.replace('param-', '');
                        const paramValue = input.value.trim();
                        const errorElement = document.getElementById(`error-${paramName}`);

                        if (!paramName.startsWith('_') && paramValue === '') {
                            isValid = false;
                            if(errorElement) errorElement.classList.remove('hidden');
                            input.classList.add('border-red-500'); // Tambah kelas border error
                        } else {
                            input.classList.remove('border-red-500');
                        }
                    }
                });
            }
            
            if (!isValid) {
                return;
            }
            
            // Sembunyikan form params dan tombol submit, tampilkan loading/response
            paramsContainer.classList.add('hidden');
            submitApiBtn.classList.add('hidden');
            responseContainer.classList.remove('hidden');
            responseData.innerHTML = '<div class="flex justify-center items-center h-full"><div class="loader"></div></div>'; // Tampilkan loader di response
            
            const startTime = Date.now();
            try {
                let apiUrl = endpoint;
                const queryParams = new URLSearchParams();

                if (paramsContainer.children.length > 0) {
                     Array.from(paramsContainer.children).forEach(paramDiv => {
                        const input = paramDiv.querySelector('input');
                        if(input){
                            const paramName = input.id.replace('param-', '');
                            let paramValue = input.value; // Jangan trim di sini agar spasi bisa jadi bagian value jika perlu

                            if (paramName.startsWith('_') && paramValue.trim() === '') { // Cek trim() untuk opsional kosong
                                return;
                            }

                            // Ganti placeholder di path
                            const pathParamRegex = new RegExp(`{${paramName}}`, 'g');
                            if (apiUrl.includes(`{${paramName}}`)) {
                                apiUrl = apiUrl.replace(pathParamRegex, encodeURIComponent(paramValue));
                            } else {
                                // Tambahkan sebagai query param jika tidak ada di path
                                queryParams.set(paramName, paramValue);
                            }
                        }
                    });
                }
                
                // Gabungkan query params ke apiUrl
                const finalUrlObj = new URL(apiUrl.startsWith('http') ? apiUrl : window.location.origin + apiUrl);
                queryParams.forEach((value, key) => {
                    finalUrlObj.searchParams.set(key, value);
                });
                const fullUrl = finalUrlObj.href;
                
                // Tampilkan URL yang akan di-request
                const urlDisplayDiv = document.createElement('div');
                urlDisplayDiv.className = 'urlDisplay mb-4 p-3 bg-gray-900 font-mono text-xs overflow-auto rounded-md border border-gray-700';
                const urlContent = document.createElement('div');
                urlContent.className = 'break-all';
                urlContent.textContent = fullUrl;
                urlDisplayDiv.appendChild(urlContent);
                modalContent.insertBefore(urlDisplayDiv, responseContainer); // Masukkan sebelum response container
                
                const requestOptions = {
                    method: 'get', // Asumsi selalu GET, bisa diubah jika ada info method
                    headers: {
                        'Content-Type': 'application/json' // Ini mungkin tidak selalu relevan untuk GET
                    }
                };
                
                const response = await fetch(fullUrl, requestOptions); // Gunakan fullUrl
                const endTime = Date.now();
                const duration = endTime - startTime;
                
                responseStatus.textContent = response.status;
                responseStatus.className = `px-2 py-1 text-xs font-medium mr-2 rounded ${response.ok ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'}`;
                responseTime.textContent = `${duration}ms`;
                
                const contentType = response.headers.get('content-type');
                
                if (contentType && (contentType.includes('image/') || contentType.includes('video/') || contentType.includes('audio/') || contentType.includes('application/octet-stream'))) {
                    const blob = await response.blob();
                    const objectUrl = URL.createObjectURL(blob);
                    if (contentType.includes('image/')) {
                        responseData.innerHTML = `<img src='${objectUrl}' alt='Response Image' class='max-w-full h-auto rounded' />`;
                    } else if (contentType.includes('video/')) {
                        responseData.innerHTML = `<video controls class='max-w-full rounded'><source src='${objectUrl}' type='${contentType}'>Your browser does not support the video tag.</video>`;
                    } else if (contentType.includes('audio/')) {
                        responseData.innerHTML = `<audio controls class='w-full'><source src='${objectUrl}' type='${contentType}'>Your browser does not support the audio tag.</audio>`;
                    } else {
                        responseData.innerHTML = `<div class='text-center p-4'><p class='mb-2 text-gray-300'>Binary data received (${(blob.size / 1024).toFixed(2)} KB)</p><a href='${objectUrl}' download='response-data' class='inline-block px-4 py-2 bg-blue-600 text-white hover:bg-blue-500 rounded text-sm'>Download File</a></div>`;
                    }
                } else if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    const responseText = JSON.stringify(data, null, 2);
                    responseData.innerHTML = `<pre class='whitespace-pre-wrap break-words'>${responseText}</pre>`;
                } else {
                    const responseText = await response.text();
                    responseData.innerHTML = `<pre class='whitespace-pre-wrap break-words'>${responseText}</pre>`;
                }
            } catch (error) {
                const endTime = Date.now();
                const duration = endTime - startTime;
                responseStatus.textContent = 'Error';
                responseStatus.className = 'px-2 py-1 text-xs font-medium bg-red-600 text-red-100 mr-2 rounded';
                responseTime.textContent = `${duration}ms`;
                responseData.innerHTML = `<pre class='text-red-400 whitespace-pre-wrap break-words'>${error.message}\n\nPastikan server API berjalan dan endpoint dapat diakses.</pre>`;
            }
        };
    }
});