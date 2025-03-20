const fs = require('fs');
const path = require('path');

// Путь к JSON-файлу (предполагается, что файл называется data.json)
const jsonFilePath = path.join(__dirname, 'test_b1f3_nike_discriptions.json');
// Путь к текстовому файлу для URL-адресов ошибок
const errorsFilePath = path.join(__dirname, 'errors.txt');

try {
    // 1. Читаем JSON-файл
    const jsonData = fs.readFileSync(jsonFilePath, 'utf-8');
    
    // 2. Парсим JSON-данные в массив объектов
    const data = JSON.parse(jsonData);
    
    // 3. Считаем общее количество объектов
    const totalObjects = data.length;
    console.log(`Общее количество объектов: ${totalObjects}`);
    
    // 4. Находим объекты с ошибкой
    const errorObjects = data.filter(obj => obj.content === null && obj.error);
    
    // 5. Извлекаем URL-адреса объектов с ошибкой
    const errorUrls = errorObjects.map(obj => obj.url);
    
    // 6. Записываем URL-адреса в текстовый файл (каждая ссылка на новой строке)
    fs.writeFileSync(errorsFilePath, errorUrls.join('\n'), 'utf-8');
    
    // 7. Удаляем объекты с ошибкой из массива
    const filteredData = data.filter(obj => !(obj.content === null && obj.error));
    
    // 8. Записываем обновленный массив обратно в JSON-файл
    fs.writeFileSync(jsonFilePath, JSON.stringify(filteredData, null, 2), 'utf-8');
    
    // 9. Считаем количество оставшихся объектов
    const remainingObjects = filteredData.length;
    console.log(`Количество оставшихся объектов: ${remainingObjects}`);
    
    // 10. Считаем количество удаленных объектов
    const removedObjects = totalObjects - remainingObjects;
    console.log(`Количество удаленных объектов: ${removedObjects}`);
} catch (error) {
    console.error('Произошла ошибка:', error);
}
