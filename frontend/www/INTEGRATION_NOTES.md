# Интеграция страниц из my-app

## Что было добавлено:

### Страницы:
- `/` - WelcomePage (страница входа с переключением между сотрудником и руководителем)
- `/team` - EmployeePage (страница команды с формой обратной связи)
- `/dashboard` - DashboardPage (основная страница со статистикой, перенесена из App.tsx)

### Компоненты:
- `FeedbackForm` - форма для оставления отзыва
- `AppLayout` - базовый layout для страниц с роутингом

### Навигация:
- На WelcomePage кнопка "Войти" (для сотрудника) ведет на `/team`
- На EmployeePage кнопка "К статистике" ведет на `/dashboard`
- На DashboardPage кнопка "Сотрудники" в навигации ведет на `/team`

### Зависимости:
- Добавлены `react-router-dom` и `framer-motion`

### Шрифты:
- Скопированы шрифты WixMadeforDisplay (Regular, Bold, SemiBold) в `src/assets/fonts/`

## Запуск:
```bash
npm run dev
```

Приложение будет доступно на http://localhost:3000
