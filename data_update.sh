#!/bin/bash

# Массив с ID департаментов
dept_ids=(
  "8e03b659-8daf-4e0c-8954-f368ef82228b"
  "3614c92b-051f-4346-bc97-9adc30bc37a2"
  "045c368e-e20b-4560-8754-8e8a12c70cf9"
  "2860db3d-e882-4b65-9ea7-24fda36559f8"
  "4ef36b36-0403-48bc-8480-cccfd5b25140"
  "1dd7f207-f46e-4fc2-a234-1cbd60f95839"
  "ffe2d2eb-846d-414e-a04e-e4fbad4fc01d"
  "ee3f97b3-6ed5-4889-9428-9ffd74f9ba7e"
  "45c662c0-4388-4585-b68c-7c3f23445472"
  "a0ab70be-792f-420e-9d47-72924115641e"
)

# Русские имена и фамилии
first_names_ru=(
  "Александр" "Дмитрий" "Максим" "Сергей" "Андрей" 
  "Алексей" "Артём" "Илья" "Кирилл" "Никита"
  "Елена" "Ольга" "Наталья" "Екатерина" "Анна"
  "Мария" "Светлана" "Татьяна" "Ирина" "Юлия"
)

last_names_ru=(
  "Иванов" "Смирнов" "Кузнецов" "Попов" "Васильев"
  "Петров" "Соколов" "Михайлов" "Новиков" "Федоров"
  "Морозов" "Волков" "Алексеев" "Лебедев" "Семенов"
  "Егоров" "Павлов" "Козлов" "Степанов" "Николаев"
)

# Функция для транслитерации имен
translit_first() {
  local name=$1
  case $name in
    "Александр") echo "Alexandr" ;;
    "Дмитрий") echo "Dmitriy" ;;
    "Максим") echo "Maksim" ;;
    "Сергей") echo "Sergey" ;;
    "Андрей") echo "Andrey" ;;
    "Алексей") echo "Aleksey" ;;
    "Артём") echo "Artem" ;;
    "Илья") echo "Ilya" ;;
    "Кирилл") echo "Kirill" ;;
    "Никита") echo "Nikita" ;;
    "Елена") echo "Elena" ;;
    "Ольга") echo "Olga" ;;
    "Наталья") echo "Natalya" ;;
    "Екатерина") echo "Ekaterina" ;;
    "Анна") echo "Anna" ;;
    "Мария") echo "Mariya" ;;
    "Светлана") echo "Svetlana" ;;
    "Татьяна") echo "Tatyana" ;;
    "Ирина") echo "Irina" ;;
    "Юлия") echo "Yuliya" ;;
    *) echo "User" ;;
  esac
}

translit_last() {
  local name=$1
  case $name in
    "Иванов") echo "Ivanov" ;;
    "Смирнов") echo "Smirnov" ;;
    "Кузнецов") echo "Kuznetsov" ;;
    "Попов") echo "Popov" ;;
    "Васильев") echo "Vasiliev" ;;
    "Петров") echo "Petrov" ;;
    "Соколов") echo "Sokolov" ;;
    "Михайлов") echo "Mihaylov" ;;
    "Новиков") echo "Novikov" ;;
    "Федоров") echo "Fedorov" ;;
    "Морозов") echo "Morozov" ;;
    "Волков") echo "Volkov" ;;
    "Алексеев") echo "Alekseev" ;;
    "Лебедев") echo "Lebedev" ;;
    "Семенов") echo "Semenov" ;;
    "Егоров") echo "Egorov" ;;
    "Павлов") echo "Pavlov" ;;
    "Козлов") echo "Kozlov" ;;
    "Степанов") echo "Stepanov" ;;
    "Николаев") echo "Nikolaev" ;;
    *) echo "User" ;;
  esac
}

# Функция для преобразования в нижний регистр (совместимая со старым bash)
to_lower() {
  echo "$1" | tr '[:upper:]' '[:lower:]'
}

# Генерация случайного пароля из 8 цифр
generate_password() {
  printf "%08d" $((RANDOM % 100000000))
}

counter=1
total_users=50

echo "Начинаем создание 50 пользователей..."
echo "======================================"

# Создаем по 5 пользователей для каждого департамента
for dept_idx in {0..9}; do
  dept_id=${dept_ids[$dept_idx]}
  
  for user_num in {1..5}; do
    # Выбираем случайные имя и фамилию
    first_idx=$((RANDOM % ${#first_names_ru[@]}))
    last_idx=$((RANDOM % ${#last_names_ru[@]}))
    
    first_name_ru=${first_names_ru[$first_idx]}
    last_name_ru=${last_names_ru[$last_idx]}
    
    # Транслитерируем для username
    first_name_en=$(translit_first "$first_name_ru")
    last_name_en=$(translit_last "$last_name_ru")
    
    # Преобразуем в нижний регистр
    first_name_lower=$(to_lower "$first_name_en")
    last_name_lower=$(to_lower "$last_name_en")
    
    # Формируем username
    username="${first_name_lower}.${last_name_lower}${user_num}"
    
    # Полное имя на русском
    fullname="${last_name_ru} ${first_name_ru}"
    
    # Генерируем пароль
    password=$(generate_password)
    
    # Отправляем запрос
    curl -X 'POST' \
      'http://localhost:8000/v1/users/' \
      -H 'accept: application/json' \
      -H 'Content-Type: application/json' \
      -d "{
        \"username\": \"${username}\",
        \"fullname\": \"${fullname}\",
        \"department_id\": \"${dept_id}\",
        \"password\": \"${password}\"
      }"
    
    echo " - [$counter/$total_users] Created: ${fullname} (${username}) | Dept: $((dept_idx+1)) | Pass: ${password}"
    
    # Небольшая задержка между запросами
    sleep 0.3
    
    ((counter++))
  done
done

echo "======================================"
echo "Готово! Создано 50 пользователей (по 5 в каждом из 10 департаментов)"