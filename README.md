Многоугольники
TL;DR

Реализуйте функцию intersect, которая принимает на вход два многоугольника и возвращает массив
многоугольников - их пересечение, либо пустой массив, если многоугольники не пересекаются.


Детали реализации

Использовать сторонние библиотеки запрещено. Решение должно быть выполненно на чистом JavaScript.

Многоугольник задается в виде массива объектов, каждый из которых содержит поля x и y - координаты точки, входящей в многоугольник

Вы можете предполагать, что многоугольники на входе корректны, содержат от 3 до 100 вершин,
координата каждой вершины находится в диапазоне от [0, 0] до [400, 400]

Касание многоугольников не считается пересечением

Если площадь одного из многоугольников пересечения менее 0.0001 - такой многоугольник должен быть исключен из массива результатов

Ваш репозиторий с решением должен содержать файл solution.js, который размещает в глобальной области видимости функцию intersect.
Вы можете взять за основу шаблон проекта, который содержит вспомогательные функции для визуализации Вашего результата

Наличие unit-тестов будет плюсом


ЗАПУСК
index.html