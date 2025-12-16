document.addEventListener('DOMContentLoaded', () => {
    // РЕК. 7: Проверка CDN
    if (typeof html2canvas === 'undefined') {
        const previewSection = document.getElementById('card-preview');
        previewSection.innerHTML = '<h2>Ошибка загрузки</h2><p>Не удалось загрузить библиотеку для генерации открытки. Попробуйте обновить страницу.</p>';
        console.error('html2canvas не загружен!');
        return; // Останавливаем выполнение скрипта
    }

    const cardForm = document.getElementById('card-form');
    const cardOutput = document.getElementById('card-output');
    const cardTextContent = cardOutput.querySelector('.card-text-content'); 
    const outputName = document.getElementById('output-name');
    const outputText = document.getElementById('output-text');
    const downloadButton = document.getElementById('download-button');
    const fontSelect = document.getElementById('font-select');
    const backgroundSelection = document.getElementById('background-selection');
    const colorPicker = document.getElementById('color-picker'); 
    const gratitudeTextarea = document.getElementById('gratitude-text'); 
    const charCount = document.getElementById('char-count'); 
    const resetButton = document.getElementById('reset-form'); 
    
    let selectedBackground = ''; 

    // Константы для размеров
    // ИСПРАВЛЕНИЕ: Уменьшен размер до 1200x1200 пикселей для скачивания
    const FINAL_SIZE = 1200;  // Целевой размер открытки (1200x1200 px)
    const DESKTOP_PREVIEW_SIZE = 400; // Базовый размер для расчета масштаба
    // ИСПРАВЛЕНИЕ: Пересчитан паддинг: 1200 * 0.05 = 60px
    const FINAL_PADDING = FINAL_SIZE * 0.05; 

    // БАЗОВЫЕ РАЗМЕРЫ ШРИФТА (из CSS)
    const FONT_SIZE_NAME = 24;
    const FONT_SIZE_TEXT = 20;

    const backgroundImages = [
        { id: 'bg1', url: 'backgrounds/bg1.png' }, 
        { id: 'bg2', url: 'backgrounds/bg2.png' }, 
        { id: 'bg3', url: 'backgrounds/bg3.png' }
    ];
    
    const textElements = [outputName, outputText];

    // =======================================================
    // РЕК. 8: Проверка контраста
    // =======================================================
    function checkContrast(hexColor) {
        const rgb = parseInt(hexColor.substring(1), 16);
        const r = (rgb >> 16) & 0xFF;
        const g = (rgb >> 8) & 0xFF;
        const b = rgb & 0xFF;
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
        
        if (brightness > 160) {
            console.warn('Внимание: Выбран светлый цвет шрифта. Убедитесь, что фон достаточно темный для хорошего контраста.');
        }
    }

    colorPicker.addEventListener('input', () => {
        const selectedColor = colorPicker.value;
        textElements.forEach(el => {
            el.style.color = selectedColor;
        });
        checkContrast(selectedColor);
    });

    // =======================================================
    // РЕК. 3: Счетчик символов
    // =======================================================
    // Логика использует gratitudeTextarea.maxLength, которое равно 200
    gratitudeTextarea.addEventListener('input', () => {
        charCount.textContent = `${gratitudeTextarea.value.length}/${gratitudeTextarea.maxLength}`;
    });

    // =======================================================
    // ЛОГИКА ВЫБОРА ФОНА (Рек. 1)
    // =======================================================
    function setupBackgroundSelection() {
        const allBackgrounds = backgroundImages.length > 0 ? backgroundImages : [
            { id: 'color1', color: '#f0f0f0' }, 
            { id: 'color2', color: '#e6f7ff' },
            { id: 'color3', color: '#ffe6e6' },
            { id: 'color4', color: '#fff5e6' }
        ];

        allBackgrounds.forEach((bg, index) => {
            const div = document.createElement('div');
            div.className = 'bg-option';
            
            if (bg.url) {
                div.dataset.bgUrl = bg.url; 
                div.style.backgroundImage = `url(${bg.url})`;
            } else {
                div.dataset.bgColor = bg.color;
                div.style.backgroundColor = bg.color;
            }
            
            if (index === 0) {
                div.classList.add('selected');
                selectedBackground = bg.url || ('color:' + bg.color);
                if (bg.url) {
                    cardOutput.style.backgroundImage = `url(${bg.url})`;
                    cardOutput.style.backgroundColor = '';
                } else {
                    cardOutput.style.backgroundColor = bg.color;
                    cardOutput.style.backgroundImage = 'none';
                }
            }
            
            div.addEventListener('click', () => {
                document.querySelectorAll('.bg-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                div.classList.add('selected');

                if (div.dataset.bgUrl) {
                    selectedBackground = div.dataset.bgUrl;
                    cardOutput.style.backgroundImage = `url(${div.dataset.bgUrl})`;
                    cardOutput.style.backgroundColor = '';
                } else {
                    selectedBackground = 'color:' + div.dataset.bgColor;
                    cardOutput.style.backgroundImage = 'none';
                    cardOutput.style.backgroundColor = div.dataset.bgColor;
                }
            });
            backgroundSelection.appendChild(div);
        });
    }

    // =======================================================
    // ЛОГИКА ВЫБОРА ШРИФТА
    // =======================================================
    fontSelect.addEventListener('change', () => {
        const fontCss = fontSelect.value;
        cardTextContent.style.fontFamily = fontCss; 
    });

    // =======================================================
    // ГЛАВНЫЙ ОБРАБОТЧИК ФОРМЫ
    // =======================================================
    cardForm.addEventListener('submit', (e) => {
        e.preventDefault(); 

        const recipientName = document.getElementById('recipient-name').value;
        const gratitudeText = document.getElementById('gratitude-text').value;

        outputName.textContent = recipientName.trim() || 'Имя получателя'; 
        outputText.textContent = gratitudeText.trim() || 'Текст благодарности'; 
        
        downloadButton.style.display = 'block';
    });

    // =======================================================
    // РЕК. 5: Сброс формы
    // =======================================================
    resetButton.addEventListener('click', () => {
        cardForm.reset();
        
        outputName.textContent = 'Имя';
        outputText.textContent = 'Текст благодарности';
        downloadButton.style.display = 'none';
        
        // Сброс стилей
        cardTextContent.style.fontFamily = fontSelect.options[0].value;
        colorPicker.value = '#1a1a1a';
        textElements.forEach(el => {
            el.style.color = '#1a1a1a';
        });
        
        // Сброс фона
        const firstOption = document.querySelector('.bg-option');
        if (firstOption) {
            document.querySelectorAll('.bg-option').forEach(opt => opt.classList.remove('selected'));
            firstOption.classList.add('selected');
            firstOption.click(); 
        }
        
        // Сброс счетчика (использует maxLength)
        charCount.textContent = `${gratitudeTextarea.value.length}/${gratitudeTextarea.maxLength}`;
    });

    // =======================================================
    // ЛОГИКА СКАЧИВАНИЯ
    // =======================================================
    downloadButton.addEventListener('click', () => {
        // РЕК. 2: Индикатор загрузки
        downloadButton.textContent = 'Генерация...';
        downloadButton.disabled = true;
        
        const scale = FINAL_SIZE / DESKTOP_PREVIEW_SIZE; 
        
        // Создаем временный контейнер с фиксированными размерами
        const tempContainer = document.createElement('div');
        
        // Получаем текущие стили фона
        let backgroundStyle = '';
        if (cardOutput.style.backgroundImage && cardOutput.style.backgroundImage !== 'none') {
            backgroundStyle += `background-image: ${cardOutput.style.backgroundImage};`;
        } else if (cardOutput.style.backgroundColor) {
            backgroundStyle += `background-color: ${cardOutput.style.backgroundColor};`;
        } else {
             // Fallback
             backgroundStyle += `background-color: #f4f4f9;`;
        }
        
        // Убрали паддинг с tempContainer и добавили box-sizing: border-box
        tempContainer.style.cssText = `
            position: fixed;
            top: -9999px;
            left: -9999px;
            width: ${FINAL_SIZE}px;
            height: ${FINAL_SIZE}px;
            background-size: cover;
            background-position: center;
            ${backgroundStyle}
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-family: ${getComputedStyle(cardTextContent).fontFamily};
            box-sizing: border-box; 
        `;
        
        // Копируем текст
        const textWrapper = document.createElement('div');
        // Установили width: 100% и добавили паддинг сюда
        textWrapper.style.cssText = `
            width: 100%; 
            height: 100%;
            position: relative;
            text-align: center;
            padding: ${FINAL_PADDING}px; 
            box-sizing: border-box; 
            display: flex; 
            flex-direction: column;
            justify-content: center;
            align-items: center;
        `;
        
        const nameClone = outputName.cloneNode(true);
        const textClone = outputText.cloneNode(true);
        
        // Масштабируем шрифты
        nameClone.style.fontSize = `${FONT_SIZE_NAME * scale}px`;
        textClone.style.fontSize = `${FONT_SIZE_TEXT * scale}px`;
        
        // Принудительное центрирование текста
        nameClone.style.textAlign = 'center';
        textClone.style.textAlign = 'center';
        
        // Добавляем в DOM
        textWrapper.appendChild(nameClone);
        textWrapper.appendChild(textClone);
        tempContainer.appendChild(textWrapper);
        document.body.appendChild(tempContainer);
        
        // Генерируем изображение
        html2canvas(tempContainer, {
            width: FINAL_SIZE,
            height: FINAL_SIZE,
            scale: 1,
            useCORS: true,
            backgroundColor: null
        }).then(canvas => {
            const imageURL = canvas.toDataURL("image/png"); 
            const link = document.createElement('a');
            
            link.href = imageURL;
            const fileName = outputName.textContent.toLowerCase().replace(/\s/g, '_').substring(0, 20);
            link.download = `spasibo_${fileName || 'karta'}_${Date.now()}.png`; 
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Очистка и сброс индикатора
            document.body.removeChild(tempContainer);
            downloadButton.textContent = 'Скачать открытку';
            downloadButton.disabled = false;
        }).catch(err => {
            console.error('Ошибка при генерации изображения:', err);
            
            // Очистка и сброс индикатора
            if (document.body.contains(tempContainer)) {
                document.body.removeChild(tempContainer);
            }
            downloadButton.textContent = 'Скачать открытку';
            downloadButton.disabled = false;
        });
    });

    // Инициализация при загрузке страницы
    setupBackgroundSelection();
    
    // Применяем стили по умолчанию
    cardOutput.classList.add('add-border-shadow'); 
    cardTextContent.style.fontFamily = fontSelect.value;
    
    // Установка размеров шрифта по умолчанию (для превью)
    outputName.style.fontSize = `${FONT_SIZE_NAME}px`;
    outputText.style.fontSize = `${FONT_SIZE_TEXT}px`;
    
    // Применяем цвет по умолчанию из колорпикера
    textElements.forEach(el => {
        el.style.color = colorPicker.value;
    });
    
    // Инициализация счетчика (использует maxLength)
    charCount.textContent = `${gratitudeTextarea.value.length}/${gratitudeTextarea.maxLength}`;
    
    downloadButton.style.display = 'none';
});

